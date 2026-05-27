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

### Caller and target applications

Workflow access policies describe what *caller* applications are allowed to do against a *target* application:

- The **target** application is the application that hosts the workflow or activity being scheduled. The policy is enforced inside the target's Dapr sidecar (callee-side enforcement). A policy applies to a target through the `spec.scopes` field, which lists the target App IDs the policy applies to.
- The **caller** application is the application that is invoking the workflow or activity. For cross-app calls, the caller's App ID is taken from the [SPIFFE](https://spiffe.io/) identity in the mTLS client certificate. For same-sidecar (self) calls, the local App ID is used directly.

The SPIFFE ID embedded in the mTLS certificate has the format `spiffe://<trustdomain>/ns/<namespace>/<appid>`. The App ID and namespace are extracted from this identity when a workflow access policy is evaluated.

### Workflow and activity name matching

Workflow and activity names in policy rules are matched as either exact names or glob patterns. Glob matching follows Go's [`path.Match`](https://pkg.go.dev/path#Match) semantics:

- `*` matches any sequence of non-separator characters
- `?` matches any single non-separator character
- `[abc]` matches any character in the set (a character class)

### Operations

Workflow and activity rules grant the listed callers permission to `schedule` the named workflow or activity. A parent workflow on one app can schedule a child workflow or activity on a target app; the target's policy decides whether the call is permitted.

- Workflow rules require an `operations` field. Set it to `[schedule]`.
- Activity rules don't have an `operations` field. Activities only support scheduling.

{{% alert title="Operations are scheduling-only today" color="warning" %}}
`schedule` is the only operation that takes effect through the standard Dapr workflow APIs. The CRD enum accepts additional values (`terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun`) for forward compatibility with future cross-app workflow APIs, but those operations currently target the local sidecar, resolve to self-calls, and so always succeed regardless of policy. Use `[schedule]` in your rules until cross-app variants of the other APIs are available.
{{% /alert %}}

## CRD specification

The example below shows every field in a workflow access policy. The policy is applied to `orders-target` in the `production` namespace (via `scopes`). It grants the `frontend` and `ops-console` applications (the `callers`) permission to schedule `OrderWF`, schedule any workflow whose name starts with `Report`, and schedule the `ChargePayment` activity and any activity whose name starts with `RefundEvent`.

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
          operations: [schedule]
        - name: "Report*"
          operations: [schedule]
      activities:
        - name: ChargePayment
        - name: "RefundEvent*"
```

### Spec fields

Fields are listed in the order they appear in the YAML document.

| Field | Required | Type | Description |
|-------|:--------:|------|-------------|
| `scopes` | N | list | Target App IDs this policy applies to. If omitted or empty, the policy applies to all applications. The policy is always enforced on the callee (target) side. |
| `rules` | N | list | Allow-list of rules. A call is permitted if any rule matches. If `rules` is omitted or empty while a policy is loaded for the target, all cross-app calls are denied. |
| `rules[].callers` | Y | list | List of caller objects this rule applies to. Must contain at least one entry. Every caller must be listed explicitly (with the exception of self-calls, which are always allowed). |
| `rules[].callers[].appID` | Y | string | The Dapr App ID of the calling application. The caller must be in the same namespace as the target; cross-namespace calls are denied when policies are active. |
| `rules[].workflows` | N* | list | Workflow rules granted to the matched callers. |
| `rules[].workflows[].name` | Y | string | Exact name or [glob pattern](https://pkg.go.dev/path#Match) of the workflow. |
| `rules[].workflows[].operations` | Y | list | Set to `[schedule]`. The CRD also accepts `terminate`, `raise`, `pause`, `resume`, `purge`, `get`, `rerun` for forward compatibility; these have no effect today because the matching public workflow APIs do not route cross-app. |
| `rules[].activities` | N* | list | Activity rules granted to the matched callers. |
| `rules[].activities[].name` | Y | string | Exact name or [glob pattern](https://pkg.go.dev/path#Match) of the activity. Activities only support the `schedule` operation, so there is no `operations` field. |

\* At least one of `workflows` or `activities` must be present in each rule.

## Policy semantics

1. **No policies loaded:** All workflow and activity requests are allowed. This preserves backward compatibility when no policies exist.
2. **One or more policies loaded:** The target defaults to deny. A cross-app schedule is permitted only if some rule matches the caller and the workflow or activity name.
3. **Self-calls are always allowed:** If the caller App ID is the same as the target App ID, the request is permitted regardless of policy contents. This means a target app does not need to list itself in its own policy to schedule its own workflows or activities (including the internal reminder-based execution path).
4. **Cross-namespace calls are denied** when policies are active. A policy is namespaced and applies to target apps in its own namespace via `scopes`. The caller must also be in the same namespace as the target; calls from any other namespace are rejected even if the caller App ID appears in a rule.
5. **mTLS is required for cross-app enforcement:** if any policy is loaded and mTLS is not active, cross-app calls are denied because the caller's SPIFFE identity cannot be verified.
6. **Glob matching:** `*`, `?`, and character classes work on both workflow and activity names.

## Enforcement paths

Workflow access policies are enforced inside the orchestrator and activity actors, under the actor lock, after the workflow's internal state has been loaded. This eliminates any time-of-check-to-time-of-use race between resolving a workflow's name and dispatching the operation.

The cross-app paths covered today are scheduling a child workflow or activity on another app: a parent workflow on the calling app reaches the target app's workflow/activity actor, which evaluates the policy before dispatching. The same enforcement point also blocks cross-app callers attempting non-subject actor methods or trying to inject reminders into a target actor.

## Example policies

### Scenario 1: Restrict who can schedule a cross-app workflow

Allow `orchestrator-app` to schedule `OrderWF` on the `order-service` application in the `default` namespace. No other applications can schedule this workflow, with the exception of `order-service` itself (self-calls are always allowed).

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-service-policy
  namespace: default
scopes:
  - order-service
spec:
  rules:
    - callers:
        - appID: orchestrator-app
      workflows:
        - name: OrderWF
          operations: [schedule]
```

### Scenario 2: Glob-matched workflow scheduling

Allow `analytics-app` to schedule any workflow whose name begins with `Report` on the `reporting-service` application.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: reporting-glob
  namespace: default
scopes:
  - reporting-service
spec:
  rules:
    - callers:
        - appID: analytics-app
      workflows:
        - name: "Report*"
          operations: [schedule]
```

### Scenario 3: Cross-app activities (multi-application workflows)

When using multi-application workflows, the target application does not need to list itself in the `callers` to execute its own activities. Self-calls are always allowed, so the policy only describes which *other* apps may schedule activities on the target. In the policy below, `orchestrator-app` can schedule the `TrainModel` and `ValidateModel` activities on the `ml-worker` application. No other applications can. The `orchestrator-app` must be in the same namespace as `ml-worker`, because cross-namespace calls are denied when policies are active.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: ml-worker-policy
  namespace: production
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

A single rule can grant a caller scheduling access to both workflows and activities. Here the `api-gateway` application can schedule the `ChargeCustomer` workflow, the `ChargePayment` activity, and any activity whose name starts with `Refund` on the `payments-service` application.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: payments-policy
  namespace: default
scopes:
  - payments-service
spec:
  rules:
    - callers:
        - appID: api-gateway
      workflows:
        - name: ChargeCustomer
          operations: [schedule]
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

In self-hosted mode, place the workflow access policy YAML in the resources directory (`$HOME/.dapr/components` by default, or the path passed via `--resources-path`).

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
          operations: [schedule]
```

For cross-app enforcement, mTLS must be enabled by running Sentry locally. See [Setup & configure mTLS certificates for self hosted]({{% ref mtls/#self-hosted %}}) for details on configuring mTLS in self-hosted mode.

{{% alert title="Local development without mTLS" color="primary" %}}
mTLS is required only for *cross-app* enforcement, because the caller identity is taken from the SPIFFE ID in the mTLS certificate. Same-sidecar (self) calls do not depend on mTLS and are always permitted, so you can develop and test a single-app workflow locally without running Sentry. As soon as you need to validate cross-app policy enforcement, run with mTLS enabled.
{{% /alert %}}

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
