---
type: docs
title: "Author workflows and activities in .NET"
linkTitle: "Author workflows"
weight: 1200
description: Use deterministic workflow APIs, activities, retries, timers, events, parallelism, and continuation
---

This guide covers the authoring APIs in `Dapr.Workflow` 1.19.0. For runtime prerequisites and the underlying
execution model, see [Author workflows]({{% ref howto-author-workflow.md %}}). Register the host as described in
[client registration]({{% ref dotnet-workflowclient-usage.md %}}).

## Define a workflow and activity

Derive from `Workflow<TInput, TOutput>` and `WorkflowActivity<TInput, TOutput>`. Workflow input, activity input and
output, custom status, and workflow output are serialized and retained in durable state.

```csharp
using Dapr.Workflow;

public sealed class GreetingWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string name)
    {
        context.SetCustomStatus(new { Stage = "Greeting" });
        var greeting = await context.CallActivityAsync<string>(nameof(GreetActivity), name);
        context.SetCustomStatus(new { Stage = "Done" });
        return greeting;
    }
}

public sealed class GreetActivity : WorkflowActivity<string, string>
{
    public override Task<string> RunAsync(WorkflowActivityContext context, string name)
        => Task.FromResult($"Hello, {name}!");
}
```

The source generator discovers these classes. You can also explicitly register class or delegate implementations.
Changing a name or payload contract can break replay: keep compatible implementations available or use
[workflow versioning]({{% ref dotnet-workflow-versioning.md %}}).

## Keep orchestration deterministic

The worker replays workflow code against recorded history after durable operations complete. Use only durable
workflow tasks inside orchestration:

| Need | Workflow API |
| --- | --- |
| Current time | `context.CurrentUtcDateTime`, not `DateTime.UtcNow` or `DateTime.Now`. |
| Unique identifier | `context.NewGuid()`, not `Guid.NewGuid()` or random values. |
| Delay | `context.CreateTimer(...)`, not `Task.Delay` or thread sleeps. |
| I/O, remote APIs, mutable configuration, or nondeterministic computation | Put it in an activity and call `CallActivityAsync`. |
| Logging | `context.CreateReplaySafeLogger<T>()` to suppress replay duplicates. |
| Progress visible to clients | `context.SetCustomStatus(value)` and `state.ReadCustomStatusAs<T>()`. |

Do not use `Task.Run`, perform network/file access directly, or escape the workflow synchronization context with
`ConfigureAwait(false)`. `Task.WhenAll` and `Task.WhenAny` are appropriate for tasks created by workflow APIs.
Use `context.IsReplaying` for diagnostic suppression, not to change the sequence of durable operations.

Activities may perform I/O and use injected services. They have **at-least-once** execution semantics, so implement
idempotent side effects even when no explicit retry policy is configured.

## Retry activities and child workflows

Attach `WorkflowRetryPolicy` through `WorkflowTaskOptions` or `ChildWorkflowTaskOptions`:

```csharp
var retry = new WorkflowRetryPolicy(
    maxNumberOfAttempts: 3,
    firstRetryInterval: TimeSpan.FromSeconds(2),
    backoffCoefficient: 2,
    maxRetryInterval: TimeSpan.FromSeconds(30),
    retryTimeout: TimeSpan.FromMinutes(2));

var greeting = await context.CallActivityAsync<string>(
    nameof(GreetActivity), name, new WorkflowTaskOptions(RetryPolicy: retry));
```

The attempt count includes the first invocation. Retry delays use durable timers. A retry timeout limits further
retry attempts; it is not a hard cancellation deadline for a running activity. With no policy, no SDK retry chain
is configured, but runtime redelivery can still repeat execution.

After retries are exhausted, activity/child failures surface as `WorkflowTaskFailedException`. Its `FailureDetails`
contains `ErrorType`, `ErrorMessage`, and optional `StackTrace`; `IsCausedBy<TException>()` can match resolvable
exception types. Catch this exception to implement explicit compensation, or let the workflow fail. Compensation
is application code, not an automatic rollback of external effects.

## Durable timers and external events

Use `CreateTimer(TimeSpan, CancellationToken)` or `CreateTimer(DateTime, CancellationToken)` for durable delays.
Derive absolute deadlines from `CurrentUtcDateTime`. Cancel timers that lose a race with another durable task.

For an event with a durable timeout:

```csharp
try
{
    bool approved = await context.WaitForExternalEventAsync<bool>("Approval", TimeSpan.FromHours(24));
    context.SetCustomStatus(new { Approved = approved });
}
catch (TaskCanceledException)
{
    context.SetCustomStatus(new { Stage = "Approval expired" });
}
```

The timeout overload uses a durable timer and cancels the losing wait. Events arriving before a matching wait are
buffered; each event completes one waiter. The .NET worker matches event names case-insensitively, but use consistent
casing across senders and SDKs. A cancellation token on a wait cancels that wait, not the workflow or event producer.

External applications send events using `client.RaiseEventAsync`. A workflow can send an event to another instance
in its own app without calling a client or performing direct I/O:

```csharp
context.SendEvent(targetInstanceId, "Approval", true);
```

`SendEvent` records a durable action, not a confirmation that the recipient processed the event, and has no
`TargetAppId` option. Do not assume that signaling a missing or completed instance succeeded at the application level.

## Fan-out and bounded parallel processing

For a small, bounded batch, create activity or child-workflow tasks and await `Task.WhenAll`. For a sliding window,
use the SDK's `ProcessInParallelAsync`:

```csharp
string[] greetings = await context.ProcessInParallelAsync(
    names,
    name => context.CallActivityAsync<string>(nameof(GreetActivity), name),
    maxConcurrency: 3);
```

The default concurrency is five and must be positive. Results preserve input order. Failures are collected into
an `AggregateException` after processing; this is not fail-fast cancellation of other activities.

This bounds outstanding tasks in **one workflow**, not total worker/runtime concurrency. The helper materializes
the input collection and allocates a result array, so it is not constant-memory processing of an unbounded stream.
Use bounded batches, child workflows, or continuation to limit history growth.

## Child and detached workflows

`CallChildWorkflowAsync<T>` waits for the child's output and propagates failures. Use `ChildWorkflowTaskOptions`
to set `InstanceId`, `RetryPolicy`, or `TargetAppId`. Child execution has its own history; recursively terminating a
parent also terminates its children.

Use `ScheduleNewDetachedWorkflowAsync` for independent work instead:

```csharp
var detachedId = await context.ScheduleNewDetachedWorkflowAsync(
    workflowName: "GreetingWorkflow",
    input: "background",
    startTime: new DateTimeOffset(context.CurrentUtcDateTime).AddMinutes(5));
```

The returned ID is available when the action is recorded, not when the new workflow completes. The generated ID is
replay-safe if omitted. Detached failures do not fail the originating workflow, and terminating that workflow does
not recursively terminate detached instances. The options overload supports app routing and payload-reference
permission, but rejects retry policies and history propagation.

See [multi-app workflows]({{% ref dotnet-workflow-multi-app.md %}}) for routing and
[history propagation]({{% ref dotnet-workflow-history-propagation.md %}}) for child history sharing.

## Continue long-running workflows

Use `ContinueAsNew` to restart the same instance with new input and truncate its accumulated history:

```csharp
public sealed class CounterWorkflow : Workflow<int, int>
{
    public override async Task<int> RunAsync(WorkflowContext context, int count)
    {
        await context.CreateTimer(TimeSpan.FromMinutes(1));
        context.ContinueAsNew(newInput: count + 1, preserveUnprocessedEvents: true);
        return count;
    }
}
```

Return immediately after requesting continuation; the next execution uses the new input rather than completing
the instance with the returned value. Do not schedule more work after the call. Incomplete task results are
discarded; buffered unprocessed external events are preserved by default. Set `preserveUnprocessedEvents: false`
to discard those events too.

## Testing boundaries

The package includes compiler analyzers: `DAPR1303` and `DAPR1304` warn about input/output mismatches when an
activity or workflow type can be resolved from `nameof(...)`; `DAPR1305` warns about workflow constructor
injection. Prefer `nameof` for local concrete types, but use the registered/canonical string when routing requires
it. Analyzers cannot validate every dynamic name or remote contract, and a warning-free build does not prove
determinism.

Unit-test activity logic and its injected dependencies normally. Workflow unit tests can supply a test double for
the abstract `WorkflowContext` to check decisions, scheduled calls, and outputs, but do not prove replay or runtime
durability. Exercise replay, failures/redelivery, durable event timeouts, cross-app routing, version upgrades, and
history/payload limits with a running sidecar and representative durable stores.

## Next steps

- [Manage workflow instances]({{% ref dotnet-workflow-management-methods.md %}})
- [Workflow versioning]({{% ref dotnet-workflow-versioning.md %}})
- [Workflow examples]({{% ref dotnet-workflow-examples.md %}})
