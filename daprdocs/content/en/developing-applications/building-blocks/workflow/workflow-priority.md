---
type: docs
title: Workflow Priority and Fairness
linkTitle: Priority and Fairness
weight: 9100
description: "Order waiting workflow turns and activities by priority level and share capacity between workflows by fairness weight."
---

When an application's slots are full, new workflow turns and activities wait at the Scheduler until a slot frees up. By default they go in arrival order, so a burst of low-value work can hold up the work you care about. Priority lets you say which work goes first, and fairness lets you say how the remaining capacity is shared.

Workflow priority is available in Dapr v1.20 and later. Setting a start value from code is currently available in the Go SDK, with the other SDKs following.

## How waiting work is ordered

Every workflow turn and every activity carries a **priority level** and a **fairness weight**. A workflow turn is one step of the workflow itself: its start, the handling of a completed activity, a timer firing, an event arriving. When the Scheduler has more work than free slots, it picks the next one to run:

1. By level: `critical`, then `high`, `normal`, `low`, `background`. A higher level always goes first.
2. Within a level, by name in proportion to weight. A name with weight 3 gets three turns for every one turn a name with weight 1 gets. For a workflow turn the name is the workflow's, for an activity it is the activity's.
3. Within a name, round robin across workflow instances, so one instance with many pending activities cannot starve another.
4. Then arrival order.

Work with no level runs at `normal`. Work with no weight runs at weight `1`.

{{% alert title="Requires pull dispatch" color="primary" %}}
Priority only applies to work the Scheduler holds while waiting for a slot. That happens under [pull dispatch](#pull-dispatch): set `dispatchMode: pull` together with `maxConcurrentWorkflowInvocations` and `maxConcurrentActivityInvocations`. Under the default hashed dispatch, work goes straight to a replica and is never ordered.
{{% /alert %}}

## Pull dispatch

Dapr can deliver workflow work to your replicas in two ways.

- **Hashed dispatch**, the default. When a workflow turn or an activity is due, the Scheduler sends it straight to the replica that owns that workflow or activity, chosen by hashing its ID. Each replica then queues its own work in arrival order. There is no shared line, so nothing can be ordered across replicas.
- **Pull dispatch.** Each replica tells the Scheduler how many free slots it has: `maxConcurrentWorkflowInvocations` for workflow turns and `maxConcurrentActivityInvocations` for activities, less what it is running. The Scheduler only sends work to a replica with a free slot of the right kind, and parks the rest in one queue, ordered as described above. That queue is the single line that priority and fairness apply to.

Turn it on in the `workflow` section of the application's Configuration. `pull` requires both per-replica limits, since they are the slot counts the Scheduler relies on, and the application fails to start without them.

```yaml
spec:
  workflow:
    dispatchMode: pull
    maxConcurrentWorkflowInvocations: 20
    maxConcurrentActivityInvocations: 20
```

Activities can run on any replica, so they run wherever the Scheduler sends them. A workflow turn can only run on the replica that owns the workflow, and it only takes a slot there. When the Scheduler also serves actor placement, it knows the owner and sends the turn there, waiting in its queue for that replica to have a free slot. With a separate Placement service the Scheduler does not know the owner at first, so it sends the turn to a replica with a free slot. If that replica is not the owner, it hands the turn back with the owner's address instead of running it, and the Scheduler sends the turn to the owner, or waits for the owner's slot. The Scheduler remembers the owner for the workflow's later turns.

Pull dispatch works with either placement setup. It turns off the workflow fast path for the application, so every piece of work goes through the Scheduler. A per-name `dispatchMode: hashed` entry in `activityConcurrencyLimits` keeps one activity on hashed dispatch while the rest of the application pulls. See [Workflow Concurrency Limits]({{% ref workflow-concurrency.md %}}) for the limits themselves.

## Configure priority

Priority is set in the `workflow` section of the application's [Configuration]({{% ref configuration-overview.md %}}). You can set a default for the whole application, and override it per workflow name or per activity name.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    dispatchMode: pull
    maxConcurrentWorkflowInvocations: 20
    maxConcurrentActivityInvocations: 20
    priority:
      default:
        priorityLevel: normal
        fairnessWeight: 1
      workflows:
        - name: PaymentTransfer
          priorityLevel: critical
          fairnessWeight: 10
        - name: MonthlyStatements
          priorityLevel: background
      activities:
        - name: SendReceipt
          fairnessWeight: 3
```

| Property | Type | Description |
|----------|------|-------------|
| `priority.default` | object | Applies to every workflow and activity without an entry of its own. |
| `priority.workflows` | array | Per-workflow-name values. They apply to the workflow's own turns. Every activity the workflow calls inherits them, and so does every child workflow it starts. |
| `priority.activities` | array | Per-activity-name values. These beat the calling workflow's values. |
| `[].name` | string | The workflow or activity name the entry applies to. |
| `[].priorityLevel` | string | One of `critical`, `high`, `normal`, `low` or `background`, in any case. |
| `[].fairnessWeight` | int | 1 to 1000. |

Both fields are optional in every entry. An entry that sets only a level leaves the weight to the next source in the order below, and the other way round.

Workflow names are matched exactly. Level names are matched in any case, so `Critical` and `critical` are the same level.

## Set a priority when starting a workflow

Code can set a level and weight on the start request. This is the right place for a priority that depends on the request, such as a paying customer's order, that the operator cannot know ahead of time.

```go
import "github.com/dapr/durabletask-go/api"

id, err := client.ScheduleNewWorkflow(ctx, "OrderWF",
	api.WithInput(order),
	api.WithPriority("high", 5))
```

`WithPriority` takes a level name and a weight. An empty level or a weight of `0` leaves that field unset, so `api.WithPriority("high", 0)` sets only the level. With the `workflow` package client, wrap the option: `workflow.NewWorkflowOptions(api.WithPriority("high", 5))`.

A start is rejected with `InvalidArgument` when the level is not one of the five names, or the weight is above 1000.

## Which value wins

Level and weight are resolved separately. For each field, the first source that sets it wins:

| Order | For a workflow | For an activity |
|-------|----------------|-----------------|
| 1 | Its own entry in `workflows` | Its own entry in `activities` |
| 2 | The start value, or what its parent passed down | Its calling workflow's resolved value |
| 3 | `default` | `default` |

So an entry in Configuration always beats a value from code, a value from code beats `default`, and a workflow with neither gets `default`. With the example above:

- `PaymentTransfer` runs at `critical` with weight 10, whatever the start request said.
- `OrderWF` started with `api.WithPriority("high", 5)` runs at `high` 5, because it has no entry of its own. Started with no priority, it runs at `normal` 1 from `default`.
- `SendReceipt` called from `PaymentTransfer` runs at `critical` with weight 3: the level from the workflow, the weight from its own entry.

## Inheritance

A workflow passes its resolved level and weight down to everything it starts:

- **Child workflows** start with the parent's values, then apply their own entry on top, so a child with an entry that sets only a level still inherits the parent's weight. A grandchild inherits the same way.
- **Continue-as-new** keeps the values of the execution it continues.
- **Reruns and retries** keep the values of the original run, including a start value.
- **Detached workflows** inherit nothing. They have no parent, so they resolve from their own entry, else `default`.

Values are fixed when the child starts. Changing `default` later changes new workflows, not children already started under the old one.

## Priority across applications

Each application has its own Configuration, so when a workflow calls an activity or child workflow on another application, the values resolve in two steps: the caller resolves its own, sends them with the call, and the target applies its Configuration on top.

| Order | On the target application |
|-------|---------------------------|
| 1 | The target's own entry for that activity or workflow name |
| 2 | What the caller sent |
| 3 | The target's `default` |

Two consequences worth knowing:

- The caller's `default` travels with the call, because the caller resolves it before sending. A `default` on the target only applies when the caller sends nothing at all, which means the caller has no entry and no `default` either.
- The target's entry always wins, so an application can protect itself from callers by listing its activities in `priority.activities`.

See [Multi Application Workflows]({{% ref workflow-multi-app.md %}}) for how to call across applications.

## Related links

- [Workflow Concurrency Limits]({{% ref workflow-concurrency.md %}})
- [Multi Application Workflows]({{% ref workflow-multi-app.md %}})
- [Dapr Configuration reference]({{% ref configuration-overview.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
