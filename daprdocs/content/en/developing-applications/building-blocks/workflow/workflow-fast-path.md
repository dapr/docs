---
type: docs
title: "Workflow fast path"
linkTitle: "Fast path"
weight: 4500
description: "Drive workflow turns and activities locally and fold activity completions into a single state commit, removing scheduler round trips and state store commits from the workflow hot path"
---

The workflow fast path is a set of three optimizations inside the Dapr sidecar that remove the per-event Scheduler reminders and most of the state store commits from every workflow turn, while keeping the same at-least-once execution guarantees as the default path. Workflows and activities are driven on the host that already holds the work, and activity completions are persisted inside the next turn's single state store commit instead of in a commit of their own.

{{% alert title="Preview feature" color="warning" %}}
The fast path is available in Dapr v1.19 and later as a [preview feature]({{% ref "support-preview-features.md" %}}) behind the `WorkflowsFastPath` feature gate. It is disabled by default and enabled per application through the [Configuration `features` list]({{% ref "preview-features.md" %}}).

The fast path is entirely sidecar-internal. No SDK upgrade or application change is required, and the protocol between the workflow SDK and the sidecar is unchanged.
{{% /alert %}}

## Overview

A workflow makes progress in *turns*. A turn wakes the workflow actor, replays the workflow's history plus the new events in your application code, and commits the outcome (new history events, and any activities or timers to schedule). Every activity completion, external event, timer or start request triggers a turn.

Without the fast path, each turn is driven through the Scheduler service and touches the state store several times:

1. The incoming event is committed to the workflow's durable inbox.
2. A one-shot reminder named `new-event-<code>-<id>` is created in the Scheduler (a job upsert), which fires back to the workflow actor and is then deleted.
3. The turn runs and commits the new history.
4. Every activity scheduled by the turn gets its own one-shot `run-activity` reminder on the activity actor before the activity body runs.

For a sequential workflow this adds up to about four fsync'd state store commits, two Scheduler round trips and around nine gRPC hops per turn, and the Scheduler carries one job per event.

The fast path replaces this with three legs, all gated together:

- **Local wake**: the host that committed the event drives the turn itself, instead of arming a per-event reminder. [Learn more.](#leg-1-local-wake)
- **Local activity drive**: the activity body runs on its host as soon as the dispatch arrives, without a `run-activity` reminder, when the dispatching workflow certifies that its recovery backstop is armed. [Learn more.](#leg-2-local-activity-drive)
- **Completion folding**: an activity completion is held in memory and persisted inside the next turn's single commit. The activity actor is acked only after that commit. [Learn more.](#leg-3-completion-folding)

Durability moves from "one Scheduler job per event" to one repeating *janitor* reminder per live workflow instance. A wake whose local drive fails is recovered by that janitor, and a failed activity drive additionally escalates back to its durable `run-activity` reminder. At-least-once execution and event ordering are unchanged.

## Prerequisites

- Dapr v1.19 or later on every sidecar of the application. Older sidecars ignore the fast path signals and keep using reminders, so a mixed-version rollout is safe, but only upgraded hosts take the fast path.
- The [Scheduler service]({{% ref "scheduler.md" %}}) must be running. The janitor backstop is a Scheduler reminder.
- No Scheduler-enforced [workflow concurrency limits]({{% ref "workflow-concurrency.md" %}}) configured. See [Concurrency limits](#concurrency-limits).
- Any actor state store that supports Dapr Workflow. The fast path adds one small `execution-claim` key under the activity actor's state prefix, written only during placement changes.

## Configuration

Enable the fast path in the application's Configuration resource:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  features:
    - name: WorkflowsFastPath
      enabled: true
```

The gate is read when the sidecar starts. After changing it, restart the sidecars of the application.

The setting is scoped to the application that uses the Configuration. In a [multi-application workflow]({{% ref "workflow-multi-app.md" %}}), an activity hosted by another application is driven locally only if that application's Configuration also enables the fast path; otherwise it keeps the durable reminder path.

If the Configuration also sets Scheduler-enforced concurrency limits, the sidecar logs the following line at startup and runs the default reminder path instead:

```
WorkflowsFastPath is enabled but scheduler-enforced workflow concurrency limits are configured; disabling the fast path so the limits are enforced
```

Disabling the fast path again is safe at any time and does not require any migration. Janitor reminders left behind for running instances fire as a normal turn or a no-op and delete themselves once the instance completes, and any escalated `run-activity` reminders behave exactly as they do on the default path.

## What a turn costs

| Step | Without the fast path | With the fast path |
| ---- | --------------------- | ------------------ |
| Activity completion arrives | Committed to the inbox (one commit) | Held in memory; the activity actor's call stays open until the turn commits |
| Wake the workflow actor | `new-event` reminder: job upsert (one commit), Scheduler trigger round trip, job delete | Local drive loop on the same host, no Scheduler call |
| Turn result | History commit (one commit) | One commit that includes the folded completion, then the activity actor is acked |
| Dispatch an activity | `run-activity` reminder: job upsert (one commit), trigger round trip, job delete | Detached local drive on the target host, no reminder |
| Durable backstop | Every reminder is its own backstop | One repeating janitor reminder per live instance, created once, firing every 20 seconds, a no-op while nothing is pending |

The following two diagrams show the same sequential step, an activity completing and the next activity being scheduled, on the default path and on the fast path.

{{< mermaid >}}
sequenceDiagram
    participant A as Activity actor (result sender)
    participant W as Workflow actor
    participant S as State store
    participant J as Scheduler
    participant P as Workflow app
    A->>W: AddWorkflowEvent(TaskCompleted)
    W->>S: commit inbox row (commit 1)
    W->>J: upsert new-event reminder (commit 2)
    W-->>A: ack
    J->>W: trigger new-event reminder
    W->>P: run turn (history + inbox)
    P-->>W: actions (TaskScheduled)
    W->>S: commit history, clear inbox (commit 3)
    J->>J: delete the fired reminder
    W->>A: Execute(next activity)
    A->>J: upsert run-activity reminder (commit 4)
    A-->>W: ack
    J->>A: trigger run-activity reminder
    A->>P: run activity body
    P-->>A: result
    A->>W: AddWorkflowEvent(TaskCompleted) for the next turn
{{< /mermaid >}}

{{< mermaid >}}
sequenceDiagram
    participant A as Activity actor (result sender)
    participant W as Workflow actor
    participant S as State store
    participant J as Scheduler
    participant P as Workflow app
    Note over W,J: one repeating janitor reminder per live instance, asserted once per residency
    A->>W: AddWorkflowEvent(TaskCompleted)
    W->>W: hold the completion in memory, notify the drive loop
    Note over A,W: the sender call stays open until the folding turn commits
    W->>P: run turn (history + held completion)
    P-->>W: actions (TaskScheduled)
    W->>S: single commit: history including the folded completion (commit 1)
    W-->>A: ack (durable)
    W->>A: Execute(next activity, localDrive=true)
    A-->>W: accepted, detached local drive armed
    A->>P: run activity body
    P-->>A: result
    A->>W: AddWorkflowEvent(TaskCompleted) for the next turn
    J-->>W: janitor fire every 20s: no-op while nothing is pending
{{< /mermaid >}}

Indicatively, in a same-cluster comparison on a hosted deployment, the number of state store commits for a five-activity sequential workflow fell from about 45 without the fast path to about 26 with the local wake and local activity legs, and to about 17 with completion folding as well. See [Indicative performance](#indicative-performance) for the caveats.

## How it works

### Leg 1: local wake

When an event has been committed to the workflow's inbox, the workflow actor drives the turn itself instead of creating a per-event reminder:

1. The actor first makes sure its [janitor backstop](#the-janitor-backstop) reminder exists. If the janitor cannot be created, the actor falls back to the durable per-event reminder for this event, so durability never depends on the fast path succeeding.
2. The actor posts a notification to a per-instance channel with a capacity of one. Pending notifications coalesce, which mirrors the overwrite-by-name behaviour of the reminder that is being replaced.
3. If no drive loop is running for the instance, one is started. The loop runs one turn per notification and exits when there is nothing left to do. A reclaim handshake between the loop and the poster guarantees that a notification posted while the loop is exiting is never lost: either the exiting loop picks it up, or the poster starts a fresh loop.
4. The turn is invoked through the normal reminder invocation path on the local host, with retries disabled at that layer. Locking, deduplication and error handling are therefore identical to a turn triggered by the Scheduler.
5. Every drive drains the whole inbox, not only the event that triggered it, so any event saved before the turn started is processed by it.

If a turn fails, the loop retries it in place with a decorrelated jittered backoff between 50 ms and 2 s, for a total retry budget of about six seconds. If the turn still fails, the loop exits and the janitor takes over recovery at its next fire. A failed local wake never creates a per-event reminder; the janitor is its only durable backstop.

Two cases keep their Scheduler due time: a workflow scheduled with a start time in the future, and any wake whose due time is in the future. Only due-now work is driven locally.

Starting a new instance still creates the durable start reminder, but under the fast path it is armed five seconds in the future as a dormant backstop while the first turn is driven locally. Once the first turn commits, the start reminder is deleted. If the only worker holding the first turn disappears, the backstop fires after the grace and recovers the start. A backstop that outlives a lost delete fires into an empty inbox and acks as a no-op.

A running workflow that acks an empty-inbox reminder stays resident in memory with its cached history, instead of deactivating as on the default path, because its next event usually arrives shortly. Idle actors are unloaded by the actor factory's idle reaper after about a minute, and a workflow's terminal turn releases its cached history immediately.

### The janitor backstop

The janitor is a repeating actor reminder named `new-event-janitor`, one per live workflow instance:

- It is created lazily, once per residency of the workflow actor, the first time the fast path is used for that instance. Instances that never take the fast path never get one. The create is idempotent (the Scheduler overwrites by name).
- It fires every 20 seconds with a *drop* failure policy: its periodicity is its retry.
- It is deleted at the workflow's terminal turn and swept by purge.
- Its `new-event` prefix is deliberate: a Dapr sidecar older than 1.19 routes any `new-event*` reminder to a normal turn, so a janitor that fires against an instance that moved to an older host still drives any pending inbox.

On every fire the janitor loads the instance state and does the least work needed:

| Instance state | Janitor action | Recorded as |
| -------------- | -------------- | ----------- |
| Purged | Deletes itself | |
| Completed, failed or terminated | Settles anything owed after the terminal commit (parent notification, retention reminder), then deletes itself | |
| Inbox rows pending and no drive in sight | Drives a turn. This is the recovery event the janitor exists for | `janitor_recovered` |
| No inbox rows, but completions held for folding with no live driver | Drives a turn that commits the captive completions | `janitor_fold_recovered` |
| No inbox rows, but `TaskScheduled` events with no resolution and no drive in flight | Re-dispatches the activities (see [Leg 2](#leg-2-local-activity-drive)) | `janitor_redispatched` and related statuses |
| Nothing pending | No-op, without deactivating the actor | |

An idle janitor also guards against a stale in-memory cache: a peer host could have written an inbox row after this host loaded its state. Re-reading the store on every fire for every idle instance would be the dominant janitor cost, so the probe backs off across consecutive idle fires (the first, second, fourth and eighth fire, then every eighth). Recovery of that rare double failure therefore takes at most eight periods instead of one. Any real activity resets the cadence.

{{< mermaid >}}
flowchart TD
    E[Event committed to the inbox or held for folding] --> G{Fast path on and due now?}
    G -->|No| R[Durable per-event reminder, unchanged]
    G -->|Yes| EJ{Janitor reminder asserted?}
    EJ -->|Create failed| R
    EJ -->|Yes| N[Post notification, capacity 1, coalesces]
    N --> L{Drive loop running?}
    L -->|Yes| X[Running loop consumes it, or the reclaim handshake re-posts it]
    L -->|No| SP[Start drive loop]
    SP --> T[Run one turn through the reminder path]
    T -->|Committed| M{More notifications?}
    M -->|Yes| T
    M -->|No| I[Loop exits, actor stays resident]
    T -->|Failed| RT{Retry budget left? about 6s, jittered}
    RT -->|Yes| T
    RT -->|No| JW[Loop exits, the janitor owns recovery]
    JW -.-> JF
    subgraph Janitor fire every 20s
        JF[Load state] --> C1{Purged or terminal?}
        C1 -->|Yes| D[Settle and delete the janitor]
        C1 -->|No| C2{Inbox rows pending?}
        C2 -->|Yes| RUN[Drive a turn: janitor_recovered]
        C2 -->|No| C3{Held completions with no driver?}
        C3 -->|Yes| RUN2[Drive a turn: janitor_fold_recovered]
        C3 -->|No| C4{Unresolved TaskScheduled events?}
        C4 -->|Yes| RD[Re-dispatch activities]
        C4 -->|No| NOP[No-op, actor stays resident]
    end
{{< /mermaid >}}

### Leg 2: local activity drive

On the default path the workflow actor calls `Execute` on the activity actor, which creates a one-shot `run-activity` reminder and runs the activity body only when the Scheduler fires it. That reminder is what survives a crash of the activity host.

With the fast path:

1. When a turn schedules activities and the workflow's janitor is armed, the workflow actor marks each `Execute` call with a `localDrive` signal. If the janitor cannot be armed, the activities are dispatched with durable reminders as before.
2. An activity host that runs the fast path, receiving a due-now activity with that signal, arms a detached local drive and returns immediately, without creating the reminder. A delayed activity, or a host that is shutting down, uses the reminder instead.
3. The drive invokes the activity through the normal reminder invocation path, up to three attempts with jittered backoff. If all three fail, the drive *escalates*: it creates the durable `run-activity` reminder, restoring the retry-forever chain of the default path. If the escalation itself fails, the workflow's janitor re-dispatches the activity within one period.
4. A drive that is interrupted by a placement change while its execution is still live on this host does not escalate, because a reminder would run the body a second time on the new owner. The [execution claim record](#execution-claim-record) covers that case instead.

The workflow's janitor is the durable re-driver for activities whose host died before publishing a result. On each fire it looks for `TaskScheduled` events in history that have no resolution in history, in the inbox or among held completions:

- The first time it sees such a task, it re-dispatches it with the `localDrive` signal. If the activity is in fact still executing, the running execution absorbs the duplicate as a follower and the result is published once; a duplicate completion is dropped by the workflow actor's deduplication.
- If the same task is still unresolved on the next fire, the janitor escalates: it dispatches the activity *without* the `localDrive` signal, so the activity host creates the durable `run-activity` reminder that the fast path had elided. Escalation repeats every period until the task resolves; the reminder create is idempotent.
- A re-dispatch call that times out after 30 seconds because the activity actor is busy executing is the healthy in-flight case and is recorded as `janitor_redispatch_busy`.
- Task IDs restart from zero after `ContinueAsNew`, so the janitor's per-task bookkeeping is reset for each generation.

An escalated `run-activity` reminder is deleted as soon as its task resolves. Without this reaping, a leftover fire could run the body again on a host that no longer remembers the execution.

{{< mermaid >}}
sequenceDiagram
    participant W as Workflow actor (dispatcher)
    participant A as Activity actor (target host)
    participant P as Activity app
    participant J as Scheduler
    W->>A: Execute(localDrive=true)
    A-->>W: accepted, no reminder created
    A->>A: detached drive, attempt 1 of 3
    A->>P: run activity body
    alt Body completes
        P-->>A: result
        A->>W: AddWorkflowEvent(TaskCompleted)
    else Attempt fails, retries left
        A->>A: jittered backoff 50ms to 2s, retry
    else 3 attempts failed
        A->>J: upsert durable run-activity reminder (escalated)
        J->>A: trigger, retry-forever policy resumes
    end
    Note over W,J: Janitor path when the activity host died before publishing
    J->>W: janitor fire, TaskScheduled still unresolved
    W->>A: Execute(localDrive=true, janitorRedispatch=true), first period
    Note over A: a live execution absorbs the duplicate as a follower
    J->>W: next janitor fire, still unresolved
    W->>A: Execute without localDrive, second period
    A->>J: create durable run-activity reminder
    W->>J: delete the escalated reminder once the task resolves
{{< /mermaid >}}

### Execution claim record

On the default path, the `run-activity` reminder is host-agnostic: whichever host owns the activity actor when it fires runs the body. With the fast path there is no reminder while a body executes, so a placement change during a long-running activity needs another way to tell a live execution on the previous owner from one that died with its host. The execution claim record provides it:

- The record is written under the activity actor's state prefix, key `execution-claim`, only when placement moves an actor with an unsettled execution away from its host. Steady-state fast path execution never touches the store for it, and a graceful shutdown does not write one either, because the execution dies with the process and a record would only delay the new owner.
- The previous owner refreshes a heartbeat in the record every 10 seconds (half a janitor period) while the body is still running, marks the record as completed when the result has been published, and deletes it after a short retention.
- An arrival on the new owner reads the record and takes one of three outcomes: **defer** while the heartbeat is still changing (the arrival returns a recoverable error and retries later), **completed** when the previous owner already published the result (the arrival acks without executing), or **proceed** as a fresh owner when the heartbeat has not changed for two janitor periods (40 seconds).
- Staleness is judged by observing the heartbeat value unchanged on the reader's own clock. The reader never compares the writer's timestamp against its own time, so clock skew between hosts can never cause a live execution to be reclaimed.

When the record is written, the result is a stronger guarantee than the default path offers: at most one live activity body across hosts during a placement handoff, with at-least-once execution preserved. If the write fails, the sidecar logs a warning and that handoff falls back to ordinary at-least-once behaviour, where two executions can overlap.

{{< mermaid >}}
sequenceDiagram
    participant O as Previous owner (activity host)
    participant S as Actor state store
    participant N as New owner after the placement change
    participant P as Activity app
    Note over O: placement moves the actor while a body is still running
    O->>S: write execution-claim record (task key, heartbeat)
    loop every 10s (half a janitor period)
        O->>S: refresh heartbeat
    end
    N->>S: recovery arrival reads the record
    alt Heartbeat still changing
        S-->>N: Defer: the body is live elsewhere, retry later
    else Previous owner published the result
        O->>S: mark Completed
        S-->>N: Completed: ack without executing
    else Heartbeat unchanged for 2 periods (40s) on the reader's clock
        S-->>N: Proceed: the previous owner is dead
        N->>P: run the activity body as the fresh owner
    end
    O->>S: delete the record after retention
{{< /mermaid >}}

### Leg 3: completion folding

When an activity actor delivers a completion to the workflow actor on the default path, the workflow actor commits the event to its durable inbox and acks; the inbox commit is what makes the completion durable. The fast path removes that commit:

1. The workflow actor classifies the incoming event. Only activity completions and failures (`TaskCompleted`, `TaskFailed`) whose task execution ID matches the scheduling event in history, arriving at a running, non-stalled instance, are eligible for folding. Everything else keeps the durable inbox path: external events raised through the API, child workflow completions, duplicates, and events for stalled or tombstoned instances.
2. An eligible completion is appended to an in-memory list of held completions, the drive loop is notified, and the actor lock is released so that the turn can take it. The activity actor's call remains open.
3. The next turn takes up to 128 held completions, appends them to the events it delivers to your workflow code, and persists them into history inside its single, transactional state store commit.
4. Only after that commit succeeds does the workflow actor ack the activity actor. The ack means "durable". If the turn does not commit for any reason (an engine error, a stall, a cancellation), the held completions are nacked with a recoverable error and the activity actor's retry-forever delivery redelivers them. The sender's retry is the durability.

A retry that arrives while its completion is still held joins the pending entry and waits for the same commit; it is never acked early, because an early ack would stop the only durable re-driver. The wait is capped at two minutes, after which the sender receives a recoverable error and retries. If the workflow actor deactivates while completions are held (a placement change, for example), every held completion is nacked so that the senders retry against the new owner. Held completions from a previous `ContinueAsNew` generation are dropped and acked, because task IDs restart with every generation.

Child workflow completions never fold. A child publishes its completion while holding its own turn lock; parking that publish until the parent's turn commits could deadlock when the parent's turn dispatches back into the same child.

{{< mermaid >}}
sequenceDiagram
    participant X as Sender (activity actor, retry forever)
    participant W as Workflow actor
    participant P as Workflow app
    participant S as State store
    X->>W: AddWorkflowEvent(TaskCompleted)
    W->>W: classify: activity completion, execution id matches, instance running
    W->>W: append to held completions, notify the drive loop, release the actor lock
    Note over X,W: the call blocks until the folding turn resolves, 2 minute cap
    W->>W: turn takes up to 128 held completions
    W->>P: run turn with the held completions as new events
    P-->>W: actions
    alt Turn commits
        W->>S: single transactional commit, history includes the folded events
        S-->>W: ok
        W-->>X: ack (status folded)
    else Turn does not commit (engine error, stall, cancel)
        W-->>X: recoverable error (status fold_nacked)
        X->>W: retry later, joins the pending entry or folds again
    else Actor deactivates with entries pending
        W-->>X: closed error, all pending entries flushed
        X->>W: retry lands on the new owner
    end
    Note over W: external events, child completions, stalled or tombstoned instances use the durable inbox
{{< /mermaid >}}

## Durability and recovery

The fast path changes *what* provides durability, not *whether* work is durable. The following table lists the failure windows the default path's reminders used to cover, what covers them on the fast path, and the metric status that records each recovery so you can see it happening.

| Failure | Recovery | Worst-case added latency | Evidence |
| ------- | -------- | ------------------------ | -------- |
| Host dies after the inbox commit, before the turn commits | The janitor drives the pending inbox on the new owner | One janitor period (20 s) | `dapr_runtime_workflow_local_wake_count{status="janitor_recovered"}` |
| Same, and a peer wrote the inbox row into a stale cache | The janitor's backed-off store re-read | Up to eight periods | Same |
| Local drive fails repeatedly | In-place retries (about 6 s), then the janitor | About 6 s plus one period | `status="failed"` then `janitor_recovered` |
| Janitor reminder cannot be created | Durable per-event reminder, exactly the default path | Scheduler trigger latency | Warning log `failed to ensure janitor reminder, falling back to a durable wake-up reminder` |
| The only worker holding a new instance's first turn vanishes | The dormant start reminder, due 5 s after creation | 5 s plus trigger latency | `status="pending_start_redriven"` when a status read re-drives an overdue start |
| Instance saved but its start can never be processed | The instance is failed with error type `DAPR_WORKFLOW_UNSTARTABLE_STATE` instead of hanging | Immediate | `status="unstartable_failed"` |
| Activity host dies before publishing a result | Janitor re-dispatch, then escalation to the durable reminder | One to two periods | `dapr_runtime_workflow_local_activity_count{status="janitor_redispatched"}`, then `janitor_redispatch_escalated` |
| Local activity drive fails three times | Immediate escalation to the durable `run-activity` reminder | Seconds | `status="escalated"` |
| Body still running on the previous owner at a placement change | The claim record defers the new owner until completed or stale | Up to two periods (40 s) | `status="claim_evicted"` when a stale claim is reaped |
| Folding turn does not commit | Nack; the sender retries | Sender backoff, 50 ms to 2 s | `dapr_runtime_workflow_completions_fold_count{status="fold_nacked"}` |
| Sender dies and the folding drive is lost | The janitor drives a turn that commits the captive completions | One period | `local_wake_count{status="janitor_fold_recovered"}` |
| Actor deactivates with held completions | Flush; senders retry against the new owner | Sender backoff | `fold_nacked` |

At-least-once execution and the ordering of events within an instance are unchanged: every wake drains the whole durable inbox, the per-actor turn lock still serializes turns, and folded completions are appended after the inbox events inside the same work item. The execution claim record adds a guarantee the default path did not have, whenever the record is written: at most one live activity body across hosts during a placement handoff.

## Trade-offs

- **Recovery latency.** A lost wake is recovered within one janitor period (20 seconds) instead of the Scheduler's retry cadence for a failed reminder; a lost activity dispatch takes up to two periods before the durable reminder is restored. In exchange, the healthy path has no Scheduler round trip at all.
- **Memory.** Running workflow actors stay resident after an empty-inbox fire instead of deactivating, holding their cached history. Residency is bounded by the idle reaper (about a minute), by terminal turns releasing their history immediately, and by the engine's concurrency caps.
- **Goroutines.** One drive loop per instance with pending work, one detached drive per locally driven activity, and one heartbeat per unsettled claim during a placement change. All are scoped to the actor factory and drained on shutdown.
- **Scheduler load shape.** Per-event jobs are replaced by one repeating job per live instance firing every 20 seconds. Many long-lived, mostly idle instances therefore cost a small steady trickle of Scheduler triggers instead of nothing while idle. The janitor's backed-off store probe keeps the state store cost of that trickle low.
- **Sender-visible latency.** The activity actor's completion call now waits for the folding turn to commit instead of returning after an inbox commit. The added wait is exposed as `dapr_runtime_workflow_completions_fold_wait_latency` and is bounded at two minutes, after which the sender retries.
- **Fan-in amortization.** Up to 128 completions fold into one commit, so fan-out/fan-in patterns gain the most. A wider fan-in is committed across consecutive turns rather than in one unbounded transaction.
- **Locality.** The host that commits an event also runs the resulting turn, and activity bodies run on their target host as soon as they are dispatched. Work is still distributed across replicas by actor placement, but the Scheduler no longer sits between one step and the next.

## Concurrency limits

Scheduler-enforced concurrency limits gate each job delivery, and local drives bypass job delivery. To keep the limits effective, the fast path disables itself at sidecar startup when any of the following is set in `spec.workflow`:

- `globalMaxConcurrentWorkflowInvocations`
- `globalMaxConcurrentActivityInvocations`
- Any `workflowConcurrencyLimits` or `activityConcurrencyLimits` entry with a name and a positive `maxConcurrent`

The per-sidecar limits `maxConcurrentWorkflowInvocations` and `maxConcurrentActivityInvocations` are enforced by the sidecar itself and are fully compatible with the fast path. See [Workflow concurrency limits]({{% ref "workflow-concurrency.md" %}}).

## Composition and rollout

- **Other workflow features.** The fast path composes with [Workflows Clustered Deployment]({{% ref "workflow-architecture.md#workflows-cluster-deployment-when-using-dapr-shared-with-workflow" %}}) and [Workflow history signing]({{% ref "workflow-history-signing.md" %}}). Folded completions are signed inside the same commit as the rest of the turn, and a janitor re-dispatch re-signs the propagated history it carries. The Dapr integration suite runs the workflow tests as a matrix of these three features.
- **Mixed versions.** The `localDrive` and `janitorRedispatch` signals travel as metadata on internal actor calls. A sidecar that does not understand them ignores them and creates the durable reminders, and the janitor's `new-event` name is routed to a normal turn by older sidecars. Upgrade every sidecar of the application to 1.19 first, then enable the gate, so that all hosts take the fast path.
- **Multi-application workflows.** Each application decides for its own actors. An activity hosted by an application that has not enabled the fast path is executed through its durable `run-activity` reminder even when the calling workflow has the fast path enabled.

## Metrics

The fast path adds the following sidecar metrics. The `app_id` and `namespace` tags are present on all of them.

| Metric | Type | Extra tags | Meaning |
| ------ | ---- | ---------- | ------- |
| `dapr_runtime_workflow_local_wake_count` | counter | `status` | Locally driven turns and wake recovery evidence |
| `dapr_runtime_workflow_local_wake_drive_latency` | histogram (ms) | `status` | Time from the drive request until the locally driven turn returned |
| `dapr_runtime_workflow_local_activity_count` | counter | `status` | Locally driven activity executions and activity recovery evidence |
| `dapr_runtime_workflow_local_activity_drive_latency` | histogram (ms) | `status` | One local activity attempt, including the call into the application |
| `dapr_runtime_workflow_completions_fold_count` | counter | `status` (`folded`, `fold_nacked`) | Completion folding outcomes, recorded on the commit side |
| `dapr_runtime_workflow_completions_fold_wait_latency` | histogram (ms) | | How long an activity actor waited for its completion's folding turn to commit |
| `dapr_runtime_workflow_lock_wait` | histogram (ms) | `operation` | Time an invocation queued on the per-actor turn lock, by invocation kind |

The `status` values on the wake and activity counters are:

| Status | Counter | Meaning |
| ------ | ------- | ------- |
| `success`, `failed` | both | Outcome of a local drive attempt |
| `janitor_recovered` | wake | The janitor drove a turn for a pending inbox that had no driver |
| `janitor_fold_recovered` | wake | The janitor drove a turn for held completions that had no driver |
| `stale_turn_rejected` | wake | A turn computed from stale history was rejected and retried instead of committing a duplicate operation |
| `unstartable_failed` | wake | An instance whose start can never be processed was terminally failed |
| `reminder_arm_detached`, `reminder_arm_detached_failed`, `reminder_arm_detached_skipped_shutdown` | wake | A reminder create that failed after its inbox commit was retried detached, or that retry gave up |
| `pending_start_redriven` | wake | A status read re-asserted the start reminder of an overdue pending start |
| `escalated`, `escalate_failed`, `escalate_skipped_shutdown` | activity | A lost local drive was escalated to the durable `run-activity` reminder, or the escalation failed or was skipped at shutdown |
| `janitor_redispatched`, `janitor_redispatch_busy`, `janitor_redispatch_failed` | activity | A janitor re-dispatch was sent, found the activity busy (healthy), or failed |
| `janitor_redispatch_escalated` | activity | A re-dispatched task was still unresolved a period later and was escalated to the durable reminder |
| `janitor_redispatch_suppressed` | activity | The re-dispatch check was skipped because a drive was in flight on the instance |
| `janitor_escalation_reaped` | activity | An escalated `run-activity` reminder was deleted because its task resolved |
| `claim_evicted` | activity | A stale in-flight claim held by a dead execution was evicted so that the arrival re-executes |

The recovery statuses (`janitor_recovered`, `janitor_fold_recovered`, `stale_turn_rejected`, `unstartable_failed`, `reminder_arm_detached`, `reminder_arm_detached_failed`, `pending_start_redriven`, `janitor_redispatched`, `janitor_redispatch_escalated`, `janitor_escalation_reaped`, `claim_evicted`) are registered at zero when the sidecar starts, so a series that is absent can always be told apart from a recovery path that never fired. In a healthy deployment they stay at zero. The latency histograms use the sidecar's shared `latencyDistributionBuckets`; see [Configure metrics]({{% ref "metrics-overview.md#customizing-workflow-latency-buckets" %}}).

### Suggested alerts

```promql
# A janitor had to rescue a lost wake or a captive completion in the last 15 minutes.
sum by (app_id) (
  increase(dapr_runtime_workflow_local_wake_count{status=~"janitor_recovered|janitor_fold_recovered"}[15m])
) > 0
```

```promql
# An activity dispatch was lost and had to be re-dispatched or escalated to a durable reminder.
sum by (app_id) (
  increase(dapr_runtime_workflow_local_activity_count{status=~"janitor_redispatched|janitor_redispatch_escalated|escalated"}[15m])
) > 0
```

```promql
# More than 5% of folded completions were nacked back to their senders (overload or failing turns).
sum by (app_id) (rate(dapr_runtime_workflow_completions_fold_count{status="fold_nacked"}[5m]))
  /
sum by (app_id) (rate(dapr_runtime_workflow_completions_fold_count[5m])) > 0.05
```

## Indicative performance

{{% alert title="Indicative figures" color="primary" %}}
The figures below come from a same-cluster A/B comparison on a hosted deployment with a PostgreSQL actor state store, measured while the fast path was being developed. They show the direction and rough size of the change, not a guarantee. Your results depend on the state store's commit latency, on Scheduler and CPU headroom, and on the shape of your workflows.
{{% /alert %}}

| Scenario | Observed change |
| -------- | --------------- |
| Sequential workflow, local activity drive added to local wake | About 50% higher sustained throughput; engine-side p50 latency at a fixed request rate down by 72% and 84% at two load points |
| Completion folding added on top of both | About 16% higher sustained throughput |
| Fan-out of 10 activities, sustained throughput across the whole stack | From 25 workflows per second to 167 |
| State store commits per five-activity sequential workflow | From about 45, to about 26, to about 17 |
| Recovery evidence during the runs | Zero lost drives and zero janitor rescues |

The gains come from removing work rather than from doing it faster: fewer fsync'd commits per turn, no Scheduler trigger on the hot path, and completions amortized into a single commit. Once those are gone, the next limit is usually the sidecar's CPU or the state store's commit rate.

## Limitations

- The fast path is a preview feature and is disabled by default.
- It disables itself when Scheduler-enforced concurrency limits are configured. See [Concurrency limits](#concurrency-limits).
- Workflows scheduled with a future start time, and activities with a future due time, keep the Scheduler path so that their timing is honoured.
- External events raised through the API and child workflow completions always take the durable inbox path; only activity completions fold.
- Under sustained overload the completion wait can reach its two-minute cap, after which the activity actor retries. The `fold_nacked` ratio shows when this happens.
- The janitor period (20 seconds), the start redrive grace (5 seconds) and the fold wait cap (2 minutes) are fixed and not configurable.
- In a multi-application workflow, an activity host takes the fast path only if its own application has the gate enabled.

## Frequently asked questions

### Does the fast path change the at-least-once guarantee?

No. Every failure window that a reminder covered on the default path is covered by the janitor, by escalation back to the durable reminders, or by the sender's retry. Duplicate deliveries are still removed by the same deduplication as before. See [Durability and recovery](#durability-and-recovery).

### Can I turn it off after enabling it?

Yes, at any time, by setting the gate to `false` and restarting the sidecars. There is no persisted commitment. Janitor reminders of running instances fire as normal turns or no-ops and delete themselves when their instance completes.

### Why does my sidecar log that the fast path is disabled?

Because the Configuration sets Scheduler-enforced concurrency limits. Remove the global or per-name limits, or keep the limits and accept the default path. See [Concurrency limits](#concurrency-limits).

### Why did activity completions start taking longer to be acknowledged?

The completion call now returns after the folding turn commits rather than after an inbox commit. This is the wait shown by `dapr_runtime_workflow_completions_fold_wait_latency`. The overall turn is faster; the acknowledgement moved to the end of it.

### What happens if placement moves an activity while it is running?

The previous owner writes an execution claim record and keeps heartbeating it. The new owner defers while the heartbeat is live, acks without executing once the result is published, and only re-executes if the heartbeat has been stale for two janitor periods. See [Execution claim record](#execution-claim-record).

### Do I need to change my application or SDK?

No. The fast path is implemented entirely in the sidecar, and the protocol between the SDK and the sidecar is unchanged.

### Does the janitor keep firing for completed workflows?

No. The janitor is deleted at the workflow's terminal turn. If a fire arrives for a completed or purged instance anyway, the janitor settles anything still owed and deletes itself.

## Related links

- [Workflow overview]({{% ref "workflow-overview.md" %}})
- [Workflow architecture]({{% ref "workflow-architecture.md" %}})
- [Workflow concurrency limits]({{% ref "workflow-concurrency.md" %}})
- [Preview features]({{% ref "support-preview-features.md" %}})
- [How-To: Enable preview features]({{% ref "preview-features.md" %}})
- [Configure metrics]({{% ref "metrics-overview.md" %}})
- [Workflow history signing]({{% ref "workflow-history-signing.md" %}})
- [Dapr Shared]({{% ref "kubernetes-dapr-shared" %}})
