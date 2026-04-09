---
type: docs
title: "WorkflowAccessPolicy spec"
linkTitle: "WorkflowAccessPolicy"
description: "The basic spec for a Dapr WorkflowAccessPolicy resource"
weight: 6000
---

The `WorkflowAccessPolicy` is a Dapr resource that controls which applications are permitted to schedule specific workflows and activities on a target application.

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: <REPLACE-WITH-NAME>
spec:
  defaultAction: <ALLOW-OR-DENY>
  rules:
    - callers:
        - appID: <CALLER-APP-ID>
      operations:
        - type: <WORKFLOW-OR-ACTIVITY>
          name: <OPERATION-NAME-OR-GLOB-PATTERN>
          action: <ALLOW-OR-DENY>
  scopes:
    - <TARGET-APP-ID>
```

## Spec fields

| Field | Required | Type | Description | Example |
|-------|:--------:|------|-------------|---------|
| `defaultAction` | N | string | Global default action when no rule matches. Accepted values: `allow` or `deny`. Defaults to `deny`. | `deny` |
| `rules` | N | list | List of access rules. Each rule maps callers to permitted or denied operations. | See below |
| `rules[].callers` | Y | list | List of caller objects that this rule applies to. | See below |
| `rules[].callers[].appID` | Y | string | The Dapr App ID of the calling application. | `frontend-app` |
| `rules[].operations` | Y | list | List of operations controlled by this rule. | See below |
| `rules[].operations[].type` | Y | string | The type of operation. Accepted values: `workflow` or `activity`. | `workflow` |
| `rules[].operations[].name` | Y | string | The name of the workflow or activity. Supports glob patterns: `*` (any sequence), `?` (single character), `[abc]` (character set). | `OrderWorkflow`, `Report*` |
| `rules[].operations[].action` | Y | string | The access action for this operation. Accepted values: `allow` or `deny`. | `allow` |
| `scopes` | N | list | List of target App IDs to which this policy applies. If omitted or empty, the policy applies to all applications. | `["order-service"]` |

## Example

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-processing-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: frontend-app
        - appID: api-gateway
      operations:
        - type: workflow
          name: "OrderWorkflow"
          action: allow
        - type: workflow
          name: "CheckoutWorkflow"
          action: allow
        - type: activity
          name: "ProcessPayment"
          action: allow
    - callers:
        - appID: admin-app
      operations:
        - type: workflow
          name: "*"
          action: allow
        - type: activity
          name: "*"
          action: allow
  scopes:
    - order-service
```

## Related links

- [Learn more about how to configure workflow access policies]({{% ref workflow-access-policy.md %}})
- [Security concepts]({{% ref security-concept.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
