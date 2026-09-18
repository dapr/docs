---
type: docs
title: "WorkflowAccessPolicy spec"
linkTitle: "WorkflowAccessPolicy"
description: "The basic spec for a Dapr WorkflowAccessPolicy resource"
weight: 6000
---

The `WorkflowAccessPolicy` is a Dapr resource that controls which applications can perform workflow operations (schedule, terminate, raise event, pause, resume, purge, get, rerun) and schedule activities cross-app on a target application. Policies are a pure allow-list: a call is permitted if any loaded rule matches.

{{% alert title="Cross-namespace workflows are not supported" color="warning" %}}
Workflows are always scoped to a single namespace. Cross-namespace workflow and activity calls are always denied, regardless of policy contents and regardless of whether any policy is loaded. All callers and targets in a multi-application workflow must be in the same namespace.
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
          operations: [schedule, terminate, raise, pause, resume, purge, get, rerun]
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
| `rules[].workflows[].operations` | Y | list | Set of granted operations: `schedule`, `terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun`. Each operation is enforced when a cross-app caller invokes it against the named workflow. | `[schedule, terminate]` |
| `rules[].activities` | N* | list | Activity rules granted to the matched callers. Activities only support scheduling, so there is no `operations` field. | See below |
| `rules[].activities[].name` | Y | string | Exact name or [glob pattern](https://pkg.go.dev/path#Match) of the activity. | `ChargePayment`, `Refund*` |

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

## Related links

- [Learn more about how to configure workflow access policies]({{% ref workflow-access-policy.md %}})
- [Security concepts]({{% ref security-concept.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
