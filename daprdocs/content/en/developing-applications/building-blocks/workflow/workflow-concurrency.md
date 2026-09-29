---
type: docs
title: Workflow Concurrency Limits and Activity Dispatch
linkTitle: Concurrency and Dispatch
weight: 9000
description: "Configure how many workflows and activities run simultaneously, and how activities are distributed across replicas."
---

Dapr provides two kinds of control over how workflow work runs across an application's replicas:

- **Concurrency limits** cap how many workflows or activities run at once. They come at two levels: **per-sidecar limits** control a single Dapr instance, and **global limits** control the total across all replicas, enforced by the scheduler.
- **Activity dispatch mode** decides *which* replica runs an activity. The default hashes each activity to a replica; the opt-in pull mode lets the scheduler hand each activity to a replica with a free slot.

Limits and dispatch mode are configured together in the `workflow` section of the application's [Configuration]({{% ref configuration-overview.md %}}) and work together: a pull-dispatched activity still passes every configured limit before it runs.

## Per-sidecar limits

Per-sidecar limits restrict concurrency within a single Dapr sidecar. Because they apply to each instance independently, the effective capacity of the application scales with the number of replicas: 10 replicas with a per-sidecar limit of 100 give an effective capacity of up to 1000. Use per-sidecar limits to protect individual instances from resource exhaustion, not to enforce a true application-wide limit.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    maxConcurrentWorkflowInvocations: 100
    maxConcurrentActivityInvocations: 1000
```

| Property | Type | Description |
|----------|------|-------------|
| `maxConcurrentWorkflowInvocations` | int32 | Max concurrent workflow executions per sidecar. Default: unlimited. |
| `maxConcurrentActivityInvocations` | int32 | Max concurrent activity executions per sidecar. Default: unlimited. Also the number of activity slots a replica offers to the scheduler under [pull dispatch]({{% ref "workflow-concurrency.md#activity-dispatch-modes" %}}). |

These limits do not distinguish between different workflow or activity names. They apply to all workflows and activities running in the sidecar.

## Global limits

Global limits enforce a maximum across **all replicas** of your application. The Dapr scheduler divides the limit among its instances and holds back triggers when the limit is reached, dispatching them as capacity becomes available.

### All workflows or all activities

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    globalMaxConcurrentWorkflowInvocations: 50
    globalMaxConcurrentActivityInvocations: 200
```

| Property | Type | Description |
|----------|------|-------------|
| `globalMaxConcurrentWorkflowInvocations` | int32 | Max concurrent workflow executions across all replicas. Default: unlimited. |
| `globalMaxConcurrentActivityInvocations` | int32 | Max concurrent activity executions across all replicas. Default: unlimited. |

### Per-name limits

You can set concurrency limits for specific workflow or activity names. This is useful when certain workflows or activities call rate-limited external services.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    globalMaxConcurrentActivityInvocations: 200
    activityConcurrencyLimits:
      - name: SendEmail
        maxConcurrent: 5
      - name: CallPaymentAPI
        maxConcurrent: 10
    workflowConcurrencyLimits:
      - name: OrderProcess
        maxConcurrent: 20
```

| Property | Type | Description |
|----------|------|-------------|
| `activityConcurrencyLimits` | array | Per-activity-name settings. |
| `workflowConcurrencyLimits` | array | Per-workflow-name concurrency limits. |
| `activityConcurrencyLimits[].name` | string | Activity name the entry applies to. Names are matched exactly. |
| `activityConcurrencyLimits[].maxConcurrent` | int32 | Max concurrent executions across all replicas for this activity. Optional when the entry only sets `dispatchMode`. |
| `activityConcurrencyLimits[].dispatchMode` | string | Per-name [dispatch mode]({{% ref "workflow-concurrency.md#activity-dispatch-modes" %}}) override: `hashed` or `pull`. |
| `workflowConcurrencyLimits[].name` | string | Workflow name to limit. Names are matched exactly. |
| `workflowConcurrencyLimits[].maxConcurrent` | int32 | Max concurrent executions across all replicas for this workflow. |

A trigger must satisfy **all** applicable limits. For example, if `globalMaxConcurrentActivityInvocations` is 200 and `SendEmail` has a per-name limit of 5, then at most 5 `SendEmail` activities can run, and all activities combined cannot exceed 200.

Each activity name may appear at most once in `activityConcurrencyLimits`; a duplicate is rejected when the Configuration is loaded.

## Activity dispatch modes

### Why a dispatch mode exists

By default, every activity is placed on a replica by the actor placement service: the activity's ID is hashed and the replica it hashes to runs it. This is the `hashed` mode. It is cheap and spreads work evenly *in aggregate*, which is what you want when an application runs many short activities.

Hashing has two properties that matter when activities are few and long:

- **It is blind to load.** The hash does not know what a replica is already running. With three one-hour activities across three replicas it is common for one replica to receive two of them while another receives none.
- **It is sticky.** Once an activity is assigned to a replica it stays there. Nothing moves it to an idle peer, and a replica added later cannot take work that was assigned before it started.

Concurrency limits do not fix this. `maxConcurrentActivityInvocations` makes an overloaded replica queue its surplus locally instead of spilling it to an idle replica, so the imbalance shows up as latency. Global limits cap the cluster total, which protects a downstream service but does not redistribute anything.

### How pull dispatch works

`pull` mode moves the decision of which replica runs an activity from the placement hash to the scheduler, which already delivers every activity as a job and already enforces the global and per-name limits:

1. Each replica tells the scheduler how many activity slots it offers. The slot count is `maxConcurrentActivityInvocations`, which is why that field is required whenever pull is used. A replica offers slots only while it hosts the activity actor type, so a replica whose application worker has disconnected receives nothing.
1. When an activity becomes due, the scheduler picks the replica with the most free slots and delivers the activity there. Equally loaded replicas take turns. The receiving replica runs the activity itself instead of forwarding it to the replica the ID hashes to.
1. If no replica has a free slot, or a global or per-name limit is at its cap, the activity waits in the scheduler. Waiting activities are grouped by workflow instance and served round robin across instances, so one workflow with a large fan-out cannot starve other workflows.
1. The slot is released when the activity finishes, and the next waiting activity is dispatched into it.

Because the waiting work is held centrally, the scheduler can report how much of it there is. See [Autoscaling on the backlog]({{% ref "workflow-concurrency.md#autoscaling-on-the-backlog" %}}).

### Choosing a mode

| Workload | Recommended mode | Reason |
|----------|------------------|--------|
| Many short activities (milliseconds to seconds), high rate | `hashed` (default) | Hashing already spreads the work evenly, with no scheduler round trip per placement decision. |
| Few long activities (minutes to hours), low rate, expensive to run | `pull` | Each replica should run exactly as many as it has capacity for, and idle replicas should pick up waiting work. |
| A mix: a couple of expensive activity names in an otherwise high-volume application | `hashed` app-wide with `dispatchMode: pull` on the expensive names | Keeps cheap activities on the default path and pulls only the ones that benefit. See the caveat on mixing modes below. |
| Applications you want to autoscale on waiting work | `pull` | Only pull produces a backlog number, and only pull lets new replicas take work that is already waiting. |

### Configuring the dispatch mode

The application-wide default is set with `activityDispatchMode`. A per-name entry in `activityConcurrencyLimits` can override it in either direction with `dispatchMode`, and may carry a `maxConcurrent` limit at the same time or omit it.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    maxConcurrentActivityInvocations: 4    # slots each replica offers
    activityDispatchMode: hashed           # application default: hashed | pull
    activityConcurrencyLimits:
      - name: Transcode
        dispatchMode: pull                 # pulled; no global limit on this name
      - name: RenderPreview
        maxConcurrent: 40                  # global limit across all replicas
        dispatchMode: pull                 # and pulled
      - name: SendEmail
        maxConcurrent: 5                   # global limit, default (hashed) dispatch
```

| Property | Type | Description |
|----------|------|-------------|
| `activityDispatchMode` | string | Application-wide dispatch mode: `hashed` (default) or `pull`. |
| `activityConcurrencyLimits[].dispatchMode` | string | Overrides `activityDispatchMode` for one activity name, in either direction. Unset inherits the application value. Requires `name`. |

To pull every activity of an application, set `activityDispatchMode: pull` and omit the per-name overrides:

```yaml
spec:
  workflow:
    maxConcurrentActivityInvocations: 1
    activityDispatchMode: pull
```

With one slot per replica, as above, every replica runs at most one activity at a time and the scheduler keeps the rest waiting until a replica is free.

### Behaviour to be aware of

- **`maxConcurrentActivityInvocations` is required for pull.** It is the slot count each replica offers. Without it the sidecar refuses to start with `workflow activity dispatchMode pull requires maxConcurrentActivityInvocations to be set to a positive value`. This is deliberate: with no slot count the scheduler would deliver everything on arrival and pull would silently degrade to hashed with extra hops.
- **`maxConcurrent` keeps its meaning.** On an `activityConcurrencyLimits` entry it is a limit across all replicas, exactly as without pull. It is not the per-replica slot count.
- **Global and per-name limits still apply.** A pull activity takes a slot and passes the global and per-name gates together, all or nothing, so a limit can never be exceeded by pull. Activities held back by a limit also wait in the scheduler and count towards the backlog.
- **Slots are shared with hashed activities.** The slot count is the same per-replica cap that hashed activities consume. When both modes run in one application, a pull activity can be delivered to a replica the scheduler counted as free but whose cap is taken by hashed work, and it then waits there for a local slot instead of going to an idle replica. Prefer one mode per application when you can; when mixing, keep the hashed activities short.
- **Cross-application activities.** For an activity scheduled on [another application]({{% ref workflow-multi-app.md %}}), the *target* application's Configuration decides the dispatch mode, because the target application creates and runs the activity.
- **Changing the mode requires a sidecar restart.** Activities that were scheduled before the change keep the mode they were scheduled with; only activities scheduled after the restart follow the new setting.
- **The fast path is disabled.** Enabling pull turns off the `WorkflowsFastPath` preview for that application, the same as configuring a global limit does, because the fast path runs activities on the replica the ID hashes to. The sidecar logs this at startup.
- **Execution stays at-least-once.** If a replica dies while running a pull activity, the scheduler redelivers the activity to another replica and a late result from the first run is discarded. The same guarantee applies in hashed mode, but pull moves the retry to a different replica straight away rather than waiting for the original one, so a duplicate run after a crash is somewhat more likely. Expensive activities should be idempotent.
- **Replicas can come and go.** A replica that joins receives waiting work as soon as it connects. A replica that leaves has its in-flight pull activities redelivered and its slots removed from consideration. If no replica offers slots at all (for example, during a rollout to a version that does not support pull), pull activities fall back to hashed routing.
- **Orchestrations are unaffected.** Dispatch modes apply to activities only. Workflow (orchestrator) turns always run on the replica the workflow instance hashes to.

### Autoscaling on the backlog

Under hashed dispatch there is no single number that says how much activity work an application has waiting: pending activities are scattered across the replicas they hashed to, and scaling out does not help because the pending work is already pinned to the existing replicas. Under pull the scheduler holds the waiting work, so it can report it, and new replicas take it as soon as they connect.

The scheduler exports the gauge `dapr_scheduler_workflow_activity_backlog`, the number of pull activities currently waiting for a free slot, with labels:

| Label | Value |
|-------|-------|
| `namespace` | The application's namespace. |
| `app_id` | The application ID. |
| `activity_name` | The activity name. |

The gauge is reported by each scheduler instance for the work it holds, so sum it across instances when querying. It counts waiting work only, not activities that are running. It falls to `0` when the backlog drains, and it is not reported for applications in hashed mode.

With one slot per replica, scaling on `sum(dapr_scheduler_workflow_activity_backlog{app_id="<app>"})` with a threshold of `1` converges on one replica per waiting activity. For a complete walkthrough, including the Prometheus and KEDA setup and the scale-in caveats, see [How to: Autoscale workflow activities with KEDA]({{% ref autoscale-keda-workflow.md %}}).

## How the levels interact

| Limit type | Scope | Enforcement point | Effect of scaling replicas |
|------------|-------|-------------------|---------------------------|
| Per-sidecar | Single instance | Dapr sidecar | Effective max = limit x replicas |
| Global (type) | All replicas | Scheduler | Fixed total regardless of replicas |
| Global (per-name) | All replicas | Scheduler | Fixed total regardless of replicas |

When both per-sidecar and global limits are configured, both apply. The global limit prevents the cluster-wide total from exceeding the configured value, while the per-sidecar limit prevents any single instance from consuming too much local resources.

The dispatch mode is not a limit. It decides which replica runs an activity within whatever the limits allow: under pull, the per-sidecar activity limit becomes each replica's slot supply and the global limits become the cluster-wide ceiling above it.

## How global limits work with multiple scheduler replicas

The scheduler divides a global limit among its instances. Each instance gets the limit divided by the instance count, and the remainder goes to the lowest-numbered instances, so the cluster-wide total equals the configured limit. With a global limit of 100 and 3 scheduler replicas, the instances enforce 34, 33 and 33. When the limit is smaller than the number of scheduler replicas, each instance allows 1 so that no instance is starved, and the cluster-wide total then exceeds the configured limit.

Pull slots are not divided: a replica's stream is connected to exactly one scheduler instance, and that instance enforces the full slot count for it.

## Comparison with other rate limiting options

Dapr provides several ways to control concurrency and rate limiting:

| Approach | What it controls | Granularity | Scope |
|----------|-----------------|-------------|-------|
| [Workflow concurrency limits]({{% ref "workflow-concurrency.md" %}}) | Workflow and activity executions | Per-type or per-name | Per-sidecar or global |
| [`app-max-concurrency`]({{% ref "control-concurrency.md" %}}) | All requests and events to an app | All traffic | Per-sidecar |
| [Rate limit middleware]({{% ref "middleware-rate-limit.md" %}}) | HTTP requests per second | Per remote IP | Per-sidecar |

## Related links

- [How to: Autoscale workflow activities with KEDA]({{% ref autoscale-keda-workflow.md %}})
- [Dapr Configuration reference]({{% ref configuration-overview.md %}})
- [Control concurrency and rate limit applications]({{% ref control-concurrency.md %}})
- [Rate limit middleware]({{% ref middleware-rate-limit.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow architecture]({{% ref workflow-architecture.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
