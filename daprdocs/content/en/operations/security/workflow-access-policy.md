---
type: docs
title: "How-To: Apply workflow access policies"
linkTitle: "Workflow access policy"
weight: 5000
description: "Restrict which applications can invoke workflow and activity operations on a target application"
---

Using workflow access policies, you can control which calling applications are permitted to invoke specific workflow operations on a target application. A `WorkflowAccessPolicy` is a Kubernetes CRD (or YAML resource in self-hosted mode) that is evaluated on the callee side. You can scope it to one or more target applications with `scopes`, or omit `scopes` to apply the policy to all applications.

Workflow access policies are a pure allow-list. A request is permitted if, and only if, some rule in some loaded policy matches the caller, the operation, and the workflow or activity name. With no policies loaded, all calls are allowed (open by default), preserving backward compatibility. Self-calls (where the caller App ID is the same as the target App ID) are always allowed, regardless of policy contents.

## Prerequisites

- [Dapr installed with mTLS enabled]({{% ref mtls %}}). mTLS is required for cross-app enforcement because the caller's identity is extracted from the SPIFFE ID embedded in the mTLS client certificate.

## Terminology

### Caller App ID

The Dapr application identity (App ID) of the application making the request. For cross-app calls the caller identity is taken from the SPIFFE ID in the mTLS certificate. For same-sidecar (self) calls the local App ID is used directly.

### SPIFFE identity

Dapr uses [SPIFFE](https://spiffe.io/) identities embedded in mTLS certificates to identify callers. The SPIFFE ID has the format `spiffe://<trustdomain>/ns/<namespace>/<appid>`. The App ID is extracted from this identity when a workflow access policy is evaluated.

### Glob pattern

Workflow and activity names in policy rules support glob pattern matching:
- `*` matches any sequence of characters
- `?` matches any single character
- `[abc]` matches any character in the set

### Operations

A workflow rule grants the listed callers access to one or more of these operations:

| Operation | Triggered by |
| --- | --- |
| `schedule` | `StartWorkflow` / `CreateWorkflowInstance` |
| `terminate` | `TerminateWorkflow` |
| `raise` | `RaiseEventWorkflow` |
| `pause` | `PauseWorkflow` |
| `resume` | `ResumeWorkflow` |
| `purge` | `PurgeWorkflow` |
| `get` | `GetWorkflow` / `WaitForRuntimeStatus` |
| `rerun` | `RerunWorkflowFromEvent` |

Activities only support the `schedule` operation, so an activity rule has no `operations` field.

## CRD specification

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: orders-policy
  namespace: production
scopes:
  - orders-target
spec:
  rules:
    - callers:
        - appID: frontend
        - appID: ops-console
      workflows:
        - name: OrderWF
          operations:
            - schedule
            - terminate
            - raise
            - pause
            - resume
            - purge
            - get
            - rerun
        - name: "Report*"
          operations: [get]
      activities:
        - name: ChargePayment
        - name: "RefundEvent*"
```

### Spec fields

| Field | Required | Type | Description |
|-------|:--------:|------|-------------|
| `rules` | N | list | Allow-list of rules. A call is permitted if any rule matches. With no rules and policies loaded, all cross-app calls are denied. |
| `rules[].callers` | Y | list | List of caller objects this rule applies to. Must contain at least one entry. |
| `rules[].callers[].appID` | Y | string | The Dapr App ID of the calling application. |
| `rules[].workflows` | N* | list | Workflow rules granted to the matched callers. |
| `rules[].workflows[].name` | Y | string | Exact name or glob pattern of the workflow. |
| `rules[].workflows[].operations` | Y | list | One or more of `schedule`, `terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun`. |
| `rules[].activities` | N* | list | Activity rules granted to the matched callers. |
| `rules[].activities[].name` | Y | string | Exact name or glob pattern of the activity. Activities only support the `schedule` operation, so there is no `operations` field. |
| `scopes` | N | list | App IDs to which this policy applies. If omitted or empty, the policy applies to all applications. |

\* At least one of `workflows` or `activities` must be present in each rule.

## Policy semantics

1. **No policies loaded:** All workflow and activity requests are allowed. This preserves backward compatibility when no policies exist.
2. **One or more policies loaded:** The target defaults to deny. A request is permitted only if some rule matches the caller, the operation, and the workflow or activity name.
3. **Self-calls are always allowed:** If the caller App ID is the same as the target App ID, the request is permitted regardless of policy contents. This means a target app does not need to list itself in its own policy to call its own workflows or activities (including the internal reminder-based execution path).
4. **Cross-namespace calls are denied** when policies are active.
5. **mTLS is required for cross-app enforcement:** if any policy is loaded and mTLS is not active, cross-app calls are denied because the caller's SPIFFE identity cannot be verified.
6. **Glob matching:** `*`, `?`, and character classes work on both workflow and activity names.

## Enforcement paths

Workflow access policies are enforced inside the orchestrator and activity actors, under the actor lock, after the workflow's internal state has been loaded. This eliminates any time-of-check-to-time-of-use race between resolving a workflow's name and dispatching the operation.

The gRPC and HTTP public APIs (`StartWorkflow`, `TerminateWorkflow`, `RaiseEventWorkflow`, `PauseWorkflow`, `ResumeWorkflow`, `PurgeWorkflow`, `GetWorkflow`, `RerunWorkflowFromEvent`) all flow through this enforcement point, so coverage is the same regardless of which protocol the caller uses. Cross-app callers attempting non-subject actor methods, or attempting to inject reminders, are also denied.

## Example scenarios

### Scenario 1: Allow a frontend to drive a specific workflow

Allow `frontend-app` to schedule and observe `OrderWF` on the `order-service` application.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-service-policy
scopes:
  - order-service
spec:
  rules:
    - callers:
        - appID: frontend-app
      workflows:
        - name: OrderWF
          operations:
            - schedule
            - get
            - terminate
```

### Scenario 2: Read-only access for a reporting tool

Grant a reporting application read-only access to any workflow whose name begins with `Report`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: reporting-readonly
scopes:
  - reporting-service
spec:
  rules:
    - callers:
        - appID: analytics-app
      workflows:
        - name: "Report*"
          operations: [get]
```

### Scenario 3: Cross-app activities (multi-application workflows)

When using multi-application workflows, the target application no longer needs to list itself in the `callers` to execute its own activities. Self-calls are always allowed, so the policy only describes which other apps may schedule activities on the target.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: ml-worker-policy
scopes:
  - ml-worker
spec:
  rules:
    - callers:
        - appID: orchestrator-app
      activities:
        - name: TrainModel
        - name: ValidateModel
```

`ml-worker` can still schedule `TrainModel` and `ValidateModel` on itself without appearing in the rule because it is the local app.

### Scenario 4: Mixed workflow and activity access for a single caller

A single rule can grant a caller both workflow and activity access.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: payments-policy
scopes:
  - payments-service
spec:
  rules:
    - callers:
        - appID: api-gateway
      workflows:
        - name: ChargeCustomer
          operations: [schedule, get]
      activities:
        - name: ChargePayment
        - name: "Refund*"
```

## Production best practices

- **Use deny by default.** Loading any `WorkflowAccessPolicy` for a target automatically denies cross-app requests that are not explicitly listed. Keep policies minimal and review them when adding new workflows.
- **Use glob patterns conservatively.** Patterns like `*` can grant broader access than intended. Prefer exact names where possible, and use glob patterns only for stable name families.
- **Enable mTLS.** mTLS is required for cross-app enforcement. Without mTLS, cross-app requests are denied when any policy is loaded.
- **Audit denial logs.** Dapr logs a warning whenever a request is denied by a workflow access policy. Use these logs to spot misconfiguration and unauthorized callers.
- **Use `scopes` to target the policy.** Apply each policy only to the apps that should enforce it, reducing the surface area each daprd has to load.

## Self-hosted setup

In self-hosted mode, place the workflow access policy YAML in the resources directory (default: `$HOME/.dapr/components`, or the path passed via `--resources-path`).

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: my-policy
scopes:
  - my-app
spec:
  rules:
    - callers:
        - appID: frontend
      workflows:
        - name: MyWorkflow
          operations: [schedule, get]
```

Ensure mTLS is enabled by running Sentry locally. See [Setup & configure mTLS certificates]({{% ref mtls %}}) for details on configuring mTLS in self-hosted mode.

## Kubernetes setup

In Kubernetes, apply the `WorkflowAccessPolicy` CRD with `kubectl`:

```bash
kubectl apply -f workflow-access-policy.yaml
```

The Dapr operator watches for `WorkflowAccessPolicy` resources and distributes them to the appropriate sidecars based on the `scopes` field. mTLS is enabled by default in Kubernetes mode.

## Hot-reload support

Workflow access policies are hot-reloaded in both Kubernetes and self-hosted modes. Creating, updating, or deleting a policy takes effect without restarting the Dapr sidecar.

## Related links

- [Security concepts]({{% ref security-concept.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Service invocation access control]({{% ref invoke-allowlist.md %}})
- [Setup & configure mTLS certificates]({{% ref mtls %}})
- [WorkflowAccessPolicy CRD reference]({{% ref workflow-access-policy-schema.md %}})
