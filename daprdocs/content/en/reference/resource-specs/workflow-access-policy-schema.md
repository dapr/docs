---
type: docs
title: "WorkflowAccessPolicy spec"
linkTitle: "WorkflowAccessPolicy"
description: "The basic spec for a Dapr WorkflowAccessPolicy resource"
weight: 6000
---

The `WorkflowAccessPolicy` is a Dapr resource that controls which applications can invoke workflow and activity operations on a target application. Policies are a pure allow-list: a call is permitted if any loaded rule matches.

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: <REPLACE-WITH-NAME>
scopes:
  - <TARGET-APP-ID>
spec:
  rules:
    - callers:
        - appID: <CALLER-APP-ID>
      workflows:
        - name: <WORKFLOW-NAME-OR-GLOB-PATTERN>
          operations:
            - <OPERATION>
      activities:
        - name: <ACTIVITY-NAME-OR-GLOB-PATTERN>
```

## Spec fields

| Field | Required | Type | Description | Example |
|-------|:--------:|------|-------------|---------|
| `rules` | N | list | Allow-list of rules. A call is permitted if any rule matches. If `rules` is omitted or empty while policies are loaded, all cross-app calls are denied. | See below |
| `rules[].callers` | Y | list | List of caller objects that this rule applies to. Must contain at least one entry. | See below |
| `rules[].callers[].appID` | Y | string | The Dapr App ID of the calling application. | `frontend-app` |
| `rules[].workflows` | N* | list | Workflow rules granted to the matched callers. | See below |
| `rules[].workflows[].name` | Y | string | Exact name or glob pattern of the workflow. Glob: `*`, `?`, `[abc]`. | `OrderWF`, `Report*` |
| `rules[].workflows[].operations` | Y | list | One or more of: `schedule`, `terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun`. | `[schedule, get]` |
| `rules[].activities` | N* | list | Activity rules granted to the matched callers. Activities only have the `schedule` operation, so no `operations` field. | See below |
| `rules[].activities[].name` | Y | string | Exact name or glob pattern of the activity. | `ChargePayment`, `Refund*` |
| `scopes` | N | list | App IDs to which this policy applies. If omitted or empty, the policy applies to all applications. | `["order-service"]` |

\* At least one of `workflows` or `activities` must be present in each rule.

## Example

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-processing-policy
scopes:
  - order-service
spec:
  rules:
    - callers:
        - appID: frontend-app
        - appID: api-gateway
      workflows:
        - name: OrderWF
          operations: [schedule, get, terminate]
        - name: CheckoutWF
          operations: [schedule, get]
      activities:
        - name: ProcessPayment
    - callers:
        - appID: admin-app
      workflows:
        - name: "*"
          operations: [schedule, terminate, raise, pause, resume, purge, get, rerun]
      activities:
        - name: "*"
```

## Related links

- [Learn more about how to configure workflow access policies]({{% ref workflow-access-policy.md %}})
- [Security concepts]({{% ref security-concept.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
