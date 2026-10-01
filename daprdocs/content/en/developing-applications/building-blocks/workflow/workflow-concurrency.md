---
type: docs
title: Workflow Concurrency Limits
linkTitle: Concurrency Limits
weight: 9000
description: "Configure concurrency limits for Dapr Workflows to control how many workflows and activities run simultaneously."
---

Dapr provides concurrency limits for workflows and activities at two levels:

- **Global limits** control the total across all replicas, enforced by the scheduler.
- **Per-sidecar limits** control how many workflows or activities a single Dapr instance can execute concurrently.

Both levels can be configured independently and work together. Global limits enforce namespace-wide capacity constraints, for example, to respect rate limits on downstream services. Per-sidecar limits protect individual instances from resource exhaustion.

Prefer global limits when you want to express a true concurrency limit. Because a per-sidecar limit applies to each instance independently, the effective namespace-wide limit is the per-sidecar value multiplied by the number of replicas, so it drifts every time you scale up or down. A global limit holds the same total regardless of how many replicas are running, which is usually what you mean when you say "at most N at a time".

## Global limits

Global limits enforce a maximum across **all replicas** of your application. The Dapr scheduler divides the limit among its instances and holds back triggers when the limit is reached, dispatching them as capacity becomes available.

Because the total is fixed regardless of how many replicas are running, a global limit is the most accurate way to express a true concurrency limit. This is the recommended starting point for most workloads.

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
| `activityConcurrencyLimits` | array | Per-activity-name concurrency limits. |
| `workflowConcurrencyLimits` | array | Per-workflow-name concurrency limits. |
| `activityConcurrencyLimits[].name` | string | Activity name to limit. |
| `activityConcurrencyLimits[].maxConcurrent` | int32 | Max concurrent executions across all replicas for this activity. |
| `workflowConcurrencyLimits[].name` | string | Workflow name to limit. |
| `workflowConcurrencyLimits[].maxConcurrent` | int32 | Max concurrent executions across all replicas for this workflow. |

A trigger must satisfy **all** applicable limits. For example, if `globalMaxConcurrentActivityInvocations` is 200 and `SendEmail` has a per-name limit of 5, then at most 5 `SendEmail` activities can run, and all activities combined cannot exceed 200.

## Per-sidecar limits

Per-sidecar limits restrict concurrency within a single Dapr sidecar. Because they apply to each instance independently, the effective namespace-wide capacity scales with the number of replicas: if you have 10 replicas with a per-sidecar limit of 100, the effective namespace-wide capacity is up to 1000. For this reason, reach for per-sidecar limits to protect individual instances from resource exhaustion rather than to enforce a true namespace-wide concurrency limit.

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
| `maxConcurrentActivityInvocations` | int32 | Max concurrent activity executions per sidecar. Default: unlimited. |

These limits do not distinguish between different workflow or activity names. They apply to all workflows and activities running in the sidecar.

## How the levels interact

| Limit type | Scope | Enforcement point | Effect of scaling replicas |
|------------|-------|-------------------|---------------------------|
| Global (type) | All replicas | Scheduler | Fixed total regardless of replicas |
| Global (per-name) | All replicas | Scheduler | Fixed total regardless of replicas |
| Per-sidecar | Single instance | Dapr sidecar | Effective max = limit x replicas |

When both per-sidecar and global limits are configured, both apply. The global limit prevents the namespace-wide total from exceeding the configured value, while the per-sidecar limit prevents any single instance from consuming too much local resources.

## How global limits work with multiple scheduler replicas

The scheduler divides global limits evenly among its instances using floor division. With a global limit of 100 and 3 scheduler replicas, each scheduler enforces a local limit of 33, for an effective namespace max of 99. This ensures the configured limit is never exceeded.

## Comparison with other rate limiting options

Dapr provides several ways to control concurrency and rate limiting:

| Approach | What it controls | Granularity | Scope |
|----------|-----------------|-------------|-------|
| [Workflow concurrency limits]({{% ref "workflow-concurrency.md" %}}) | Workflow and activity executions | Per-type or per-name | Per-sidecar or global |
| [`app-max-concurrency`]({{% ref "control-concurrency.md" %}}) | All requests and events to an app | All traffic | Per-sidecar |
| [Rate limit middleware]({{% ref "middleware-rate-limit.md" %}}) | HTTP requests per second | Per remote IP | Per-sidecar |

## Related links

- [Dapr Configuration reference]({{% ref configuration-overview.md %}})
- [Control concurrency and rate limit applications]({{% ref control-concurrency.md %}})
- [Rate limit middleware]({{% ref middleware-rate-limit.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
