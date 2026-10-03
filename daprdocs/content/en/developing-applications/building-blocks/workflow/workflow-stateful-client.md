---
type: docs
title: "Stateful workflow client"
linkTitle: "Stateful client"
weight: 2700
description: "How the workflow SDK caches committed history so the sidecar only sends new events on each turn"
---

Every time a workflow makes progress, the Dapr sidecar hands the workflow SDK the history it needs to replay the workflow back to its current point. Historically that meant sending the instance's **entire committed history** on every turn, so the same events were serialized, transferred, and deserialized again and again as the workflow grew.

The stateful workflow client removes that repetition. The SDK's workflow worker keeps the history it has already replayed in memory, tells the sidecar it can do so, and the sidecar then sends only the events added since the last turn.

{{% alert title="Note" color="primary" %}}
The stateful workflow client is available in Dapr v1.19 and later and is **enabled by default**. No sidecar configuration is required, and no application code changes are needed to benefit from it. The Python, .NET, Java, and Go SDKs additionally expose options to disable or tune it, described below.
{{% /alert %}}

## Why it matters

A workflow's history only grows. Each activity call, timer, and external event appends to it, and the workflow is replayed from that history on every turn.

When the full history is sent every turn, the cost of a single turn grows with the length of the whole workflow. A workflow on its hundredth turn re-receives everything from the previous ninety-nine. The work is paid three times over: the sidecar serializes the history, the connection carries it, and the worker deserializes it.

With the stateful workflow client, a warm worker receives only the events committed since its previous turn, which is typically a handful regardless of how long the workflow has been running. The per-turn history payload stops growing with the length of the workflow.

The workflows that benefit most are the ones where history accumulates:

- Long-running workflows, and workflows with large loops.
- Monitor-pattern and eternal workflows that run for days or longer.
- Fan-out/fan-in workflows that collect many activity completions.

As a concrete illustration, Dapr's integration tests run a workflow with 40 sequential activities. At most two of its turns are sent as a full history, and every remaining turn is sent as a delta.

## How it works

When the worker opens its work item stream, it advertises that it retains history between turns. The sidecar records this per stream, then tracks how much committed history each connected stream has been given. On later turns it omits the prefix the worker already holds and tells the worker how many events it left out.

{{< mermaid >}}
sequenceDiagram
    participant W as Workflow SDK worker
    participant S as Dapr sidecar
    W->>S: GetWorkItems<br/>capabilities: STATEFUL_HISTORY
    Note over S: Stream marked as<br/>retaining history
    S->>W: Turn 1: full history<br/>(committed history still empty)
    Note over W: Cache the history<br/>it just replayed
    S->>W: Turn 2: full history<br/>(warm-up not complete)
    Note over W: Cache the history<br/>it just replayed
    S->>W: Turn 3 onwards:<br/>cachedHistory.eventCount = n<br/>pastEvents = delta only
    Note over W: Replay cached prefix<br/>plus the delta
{{< /mermaid >}}

Two separate pieces of state make this work:

- The **sidecar** stores only a watermark: a count, per instance, of how many committed events that stream has been sent.
- The **worker** stores the actual events.

Both are scoped to a single work item stream and neither is persisted.

### The first two turns are always full sends

The sidecar records its watermark only *after* it has prepared a work item, which produces a short warm-up:

- **Turn 1** starts from an empty committed history, so there is nothing to omit and the watermark is recorded as zero.
- **Turn 2** now has real committed history, but the watermark is still zero, so there is still no prefix the worker is known to hold.
- **Turn 3 onwards** the watermark is non-zero and the sidecar sends deltas.

This warm-up repeats whenever a worker starts cold, including after a reconnect.

### Cache hits and misses

The worker validates every delta before using it: the number of events it has cached must exactly match the count the sidecar says it omitted. If it does not match, or nothing is cached at all, the worker treats it as a cache miss and fetches the full history from the sidecar with a `GetInstanceHistory` call.

{{< mermaid >}}
flowchart TD
    A["Work item arrives"] --> B{"Is cachedHistory set?"}
    B -->|"No (full send)"| C["Replay pastEvents<br/>as the full history"]
    B -->|"Yes (delta send)"| D{"Do the cached events match<br/>cachedHistory.eventCount?"}
    D -->|Yes| E["Replay cached prefix<br/>plus the delta"]
    D -->|"No (cache miss)"| F["Fetch the full history<br/>via GetInstanceHistory"]
    F -->|Success| G["Replay the fetched history"]
    F -->|Failure| H["Drop the stream so the turn<br/>is redelivered to a cold stream"]
{{< /mermaid >}}

A cache miss costs one extra call and is always safe, which is what lets the cache be evicted freely.

### When cached history is dropped

The worker releases an instance's cached history when:

- **The instance ends.** Completion, failure, termination, and continue-as-new all end the current execution, after which the cached history no longer extends.
- **The entry goes idle.** Each entry has a sliding time-to-live, refreshed on every turn, that reclaims memory from instances that stop receiving turns without completing.
- **A cache bound is reached.** The least recently used entries are evicted first, so the active working set is preserved.
- **The stream reconnects.** The cache lives only as long as the work item stream. A reconnected worker starts cold and is re-warmed with a full history.

## What this does not change

**Your workflow code.** This is a transport optimization between the sidecar and the SDK. Workflow and activity code is unaffected, and replay behaves exactly as before.

**Correctness.** The sidecar only ever omits a prefix that it sent to that same stream in the first place, so the cached prefix plus the delta is, by construction, the history the sidecar holds. Three independent fallbacks protect the rest:

- A prefix that does not match the expected length is treated as a miss and recovered with a full fetch.
- A history that shrinks, as it does on continue-as-new, never produces a delta and is re-sent in full.
- A turn that lands on any other stream finds no watermark there and is re-sent in full.

**The payload size limit.** Delta sends shrink what crosses the wire, but they do not raise the effective ceiling on history size. The sidecar checks a workflow's size against [the maximum body size]({{% ref "workflow-payload-size.md" %}}) using the full history held in state, before the work item is reduced to a delta. A workflow with a very large history still stalls at the same point, even though the delta that would have been sent was small. The check is deliberately conservative: at the point it runs, the sidecar does not yet know which worker will receive the turn, and a worker that is cold for that instance is always sent the full history.

## Running multiple workers

When several workers, or several replicas of the same app, are connected to a sidecar, the sidecar prefers to route an instance's turns back to the stream that already holds its history. It does this with rendezvous hashing, so when a worker joins or leaves, only a small fraction of instances change owner and most caches survive the change.

A few properties are worth knowing:

- **Affinity is a preference, not a constraint.** If the preferred worker is busy or gone, the turn goes to another worker after a brief wait, and that worker is simply sent the full history. Throughput and liveness always take priority over cache hits.
- **Warm state belongs to one sidecar.** Which sidecar owns an instance is decided by actor placement. Cached history is never transferred between sidecars.
- **Worker restarts are safe.** A new or reconnected worker starts cold, is re-warmed with a full history, and resumes receiving deltas.

## Enabling and disabling

The stateful workflow client is enabled by default. You may want to disable it if your workers are memory constrained, or to rule it out while debugging.

{{< tabpane text=true >}}

{{% tab header="Python" %}}

```python
from dapr.ext.workflow import WorkflowRuntime

runtime = WorkflowRuntime(disable_stateful_history=True)
```

{{% /tab %}}

{{% tab header=".NET" %}}

```csharp
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<MyWorkflow>();
    options.DisableStatefulHistory = true;
});
```

{{% /tab %}}

{{% tab header="Java" %}}

```java
WorkflowRuntime runtime = new WorkflowRuntimeBuilder()
    .registerWorkflow(MyWorkflow.class)
    .withStatefulHistoryDisabled(true)
    .build();
```

{{% /tab %}}

{{% tab header="Go" %}}

```go
import (
	dtclient "github.com/dapr/durabletask-go/client"
	"github.com/dapr/go-sdk/client"
)

wclient, err := client.NewWorkflowClient(
	dtclient.WithStatefulHistoryDisabled(),
)
```

{{% /tab %}}

{{< /tabpane >}}

A worker that disables the feature does not advertise it, so the sidecar sends the full history on every turn and the worker keeps no cache.

## Tuning the cache

The defaults suit most applications and you should not normally need to change them.

{{< table "table table-striped" >}}

| Setting | Default | Description |
| --- | --- | --- |
| Stateful history | Enabled | Whether the worker retains history between turns. |
| Cache time-to-live | 1 hour | Sliding expiry for an instance's cached history, refreshed on every turn. |
| Maximum instances | 100,000 | How many instances may be cached on one stream. Least recently used entries are evicted first. |
| Maximum bytes | Unlimited | Optional memory budget for the cache. Least recently used entries are evicted first. |

{{< /table >}}

Every bound is safe to hit: an evicted entry costs one `GetInstanceHistory` call the next time that instance runs.

{{% alert title="Setting a byte budget is not free" color="warning" %}}
The worker measures the serialized size of a history only when a maximum byte budget is configured. Setting one therefore reintroduces a full-history serialization pass on every turn, which is part of the cost this feature exists to remove. Prefer the time-to-live and instance-count bounds, and set a byte budget only when worker memory is genuinely the constraint.
{{% /alert %}}

{{< tabpane text=true >}}

{{% tab header="Python" %}}

```python
from dapr.ext.workflow import WorkflowRuntime

runtime = WorkflowRuntime(
    history_cache_ttl=600,
    history_cache_max_instances=10_000,
    history_cache_max_bytes=256 * 1024 * 1024,
)
```

{{% /tab %}}

{{% tab header=".NET" %}}

```csharp
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<MyWorkflow>();
    options.HistoryCacheTtl = TimeSpan.FromMinutes(10);
    options.HistoryCacheMaxInstances = 10_000;
    options.HistoryCacheMaxBytes = 256L * 1024 * 1024;
});
```

{{% /tab %}}

{{% tab header="Java" %}}

```java
WorkflowRuntime runtime = new WorkflowRuntimeBuilder()
    .registerWorkflow(MyWorkflow.class)
    .withHistoryCacheTtl(Duration.ofMinutes(10))
    .withHistoryCacheMaxInstances(10_000)
    .withHistoryCacheMaxBytes(256L * 1024 * 1024)
    .build();
```

{{% /tab %}}

{{% tab header="Go" %}}

```go
import (
	"time"

	dtclient "github.com/dapr/durabletask-go/client"
	"github.com/dapr/go-sdk/client"
)

wclient, err := client.NewWorkflowClient(
	dtclient.WithWorkflowHistoryCacheTTL(10*time.Minute),
	dtclient.WithWorkflowHistoryCacheMaxInstances(10_000),
	dtclient.WithWorkflowHistoryCacheMaxBytes(256*1024*1024),
)
```

Go also exposes the janitor sweep interval, which the other SDKs keep fixed at one minute:

```go
dtclient.WithWorkflowHistoryCacheSweepInterval(30 * time.Second)
```

{{% /tab %}}

{{< /tabpane >}}

## Version compatibility

The feature is negotiated per connection, so mixed versions degrade to the previous behavior with no configuration and no errors:

- **A newer SDK with an older sidecar.** The sidecar ignores the capability it does not recognize and never sends a delta. The worker receives full histories, exactly as before.
- **An older SDK with a newer sidecar.** The worker advertises nothing, so the sidecar sends full histories to it.
- **Mixed workers on one sidecar.** Support is tracked per connection, so workers that support the feature receive deltas while those that do not receive full histories, at the same time.

## Next steps

Learn how the sidecar and the workflow SDK communicate in the [workflow architecture]({{% ref "workflow-architecture.md" %}}) overview.

{{< button text="Workflow patterns >>" page="workflow-patterns.md" >}}

## Related links

- [Workflow architecture]({{< ref workflow-architecture.md >}})
- [Workflow payload size]({{< ref workflow-payload-size.md >}})
- [Workflow features and concepts]({{< ref workflow-features-concepts.md >}})
- [Workflow overview]({{< ref workflow-overview.md >}})
- [How to author a workflow]({{< ref howto-author-workflow.md >}})
