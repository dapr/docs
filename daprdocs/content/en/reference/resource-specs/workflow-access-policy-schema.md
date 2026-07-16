---
type: docs
title: "WorkflowAccessPolicy spec"
linkTitle: "WorkflowAccessPolicy"
description: "The basic spec for a Dapr WorkflowAccessPolicy resource"
weight: 6000
---

The `WorkflowAccessPolicy` is a Dapr resource that controls which applications can schedule workflows and activities cross-app on a target application. Policies are a pure allow-list: a call is permitted if any loaded rule matches.

{{% alert title="Cross-namespace workflows are not supported" color="warning" %}}
Workflows are always scoped to a single namespace. Cross-namespace workflow and activity calls are always denied, regardless of policy contents and regardless of whether any policy is loaded. All callers and targets in a multi-application workflow must be in the same namespace.
{{% /alert %}}

{{% alert title="Scheduling is the only operation today" color="warning" %}}
Use `operations: [schedule]` in workflow rules. The CRD enum reserves additional values (`terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun`) for forward compatibility with future cross-app workflow APIs, but those operations currently target the local sidecar and resolve to self-calls, so they always succeed regardless of policy.
{{% /alert %}}

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: <REPLACE-WITH-NAME>
  namespace: <NAMESPACE>
scopes:
  - <TARGET-APP-ID>
spec:
  rules:
    - callers:
        - appID: <CALLER-APP-ID>
      workflows:
        - name: <WORKFLOW-NAME-OR-GLOB-PATTERN>
          operations: [schedule]
      activities:
        - name: <ACTIVITY-NAME-OR-GLOB-PATTERN>
```

## Spec fields

Fields are listed in the order they appear in the YAML document.

| Field | Required | Type | Description | Example |
|-------|:--------:|------|-------------|---------|
| `scopes` | N | list | Target App IDs that this policy applies to. If omitted or empty, the policy applies to all applications. The policy is enforced on the callee (target) side. | `["order-service"]` |
| `rules` | N | list | Allow-list of rules. A call is permitted if any rule matches. If `rules` is omitted or empty while policies are loaded, all cross-app calls are denied. | See below |
| `rules[].callers` | Y | list | List of caller objects that this rule applies to. Must contain at least one entry. | See below |
| `rules[].callers[].appID` | Y | string | The Dapr App ID of the calling application. The caller must be in the same namespace as the target; cross-namespace workflow calls are always denied and are not supported. | `frontend-app` |
| `rules[].workflows` | N* | list | Workflow rules granted to the matched callers. | See below |
| `rules[].workflows[].name` | Y | string | Exact name or [glob pattern](https://pkg.go.dev/path#Match) of the workflow. Supports `*`, `?`, and `[abc]` character classes. | `OrderWF`, `Report*` |
| `rules[].workflows[].operations` | Y | list | Set to `[schedule]`. The CRD also accepts `terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun` for forward compatibility; these have no effect today because the matching public workflow APIs do not route cross-app. | `[schedule]` |
| `rules[].workflows[].requires` | N | list | Optional ordered list of history events (max 20) that must all be present, in order, in the caller's [propagated history]({{% ref workflow-history-propagation.md %}}) for the rule to apply. Only valid when the rule's single operation is `schedule`. Requires [history signing]({{% ref workflow-history-signing.md %}}); with signing disabled a `requires` rule always denies. | See below |
| `rules[].activities` | N* | list | Activity rules granted to the matched callers. Activities only support scheduling, so there is no `operations` field. | See below |
| `rules[].activities[].name` | Y | string | Exact name or [glob pattern](https://pkg.go.dev/path#Match) of the activity. | `ChargePayment`, `Refund*` |
| `rules[].activities[].requires` | N | list | Optional ordered list of history events (max 20) that must all be present, in order, in the caller's propagated history for the rule to apply. Same entry shape as `workflows[].requires`. | See below |
| `requires[].eventType` | Y | string | The history event to match: one of `activity.started`, `activity.completed`, `workflow.started`, `workflow.completed`, `event.raised`. `workflow.started` matches a child workflow the caller scheduled, not its own execution. | `activity.completed` |
| `requires[].name` | Y | string | The activity name (`activity.*`), child-workflow name (`workflow.*`), or external event name (`event.raised`). | `fraud-check` |
| `requires[].appID` | Y | string | The App ID that must have produced the event; the event only matches when it came from this app's propagated history. | `checkout` |

\* At least one of `workflows` or `activities` must be present in each rule.

## Example

The policy below applies to the `order-service` application. It grants `frontend-app` and `api-gateway` permission to schedule `OrderWF`, `CheckoutWF`, and the `ProcessPayment` activity. A second rule grants `admin-app` permission to schedule any workflow or activity on `order-service`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-processing-policy
  namespace: production
scopes:
  - order-service
spec:
  rules:
    - callers:
        - appID: frontend-app
        - appID: api-gateway
      workflows:
        - name: OrderWF
          operations: [schedule]
        - name: CheckoutWF
          operations: [schedule]
      activities:
        - name: ProcessPayment
    - callers:
        - appID: admin-app
      workflows:
        - name: "*"
          operations: [schedule]
      activities:
        - name: "*"
```

## Example with `requires`

This policy allows `checkout` to schedule the `ChargeCard` activity on `payments-service` only when `checkout`'s [propagated history]({{% ref workflow-history-propagation.md %}}) shows a completed `fraud-check` followed by a completed `human-approval`, both produced by `checkout`. `requires` needs [history signing]({{% ref workflow-history-signing.md %}}) enabled.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: payments-requires
  namespace: production
scopes:
  - payments-service
spec:
  rules:
    - callers:
        - appID: checkout
      activities:
        - name: ChargeCard
          requires:
            - eventType: activity.completed
              name: fraud-check
              appID: checkout
            - eventType: activity.completed
              name: human-approval
              appID: checkout
```

## Related links

- [Learn more about how to configure workflow access policies]({{% ref workflow-access-policy.md %}})
- [Security concepts]({{% ref security-concept.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
- [Workflow history propagation]({{% ref workflow-history-propagation.md %}})
- [Workflow history signing]({{% ref workflow-history-signing.md %}})
