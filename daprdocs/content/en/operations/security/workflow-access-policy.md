---
type: docs
title: "How-To: Apply workflow access policies for workflow and activity scheduling"
linkTitle: "Workflow access policy"
weight: 5000
description: "Restrict which applications can schedule workflows and activities on a target application"
---

Using workflow access policies, you can control which calling applications are permitted to schedule specific workflows and activities on a target application. A `WorkflowAccessPolicy` is a standalone Kubernetes CRD (or YAML file in self-hosted mode) that is evaluated on the callee side. You can scope it to one or more target applications with `scopes`, or omit `scopes` to apply the policy to all applications.

Workflow access policies use glob pattern matching for workflow and activity names and a specificity-based rule resolution system. The most specific matching rule wins, and deny takes precedence over allow at the same specificity level.

{{% alert title="Preview feature" color="warning" %}}
Workflow access policies are a preview feature. You must enable the `WorkflowAccessPolicy` feature flag in your Dapr Configuration to use this feature. See [Enable the feature flag](#enable-the-feature-flag) below.
{{% /alert %}}

[See example scenarios.](#example-scenarios)

## Prerequisites

- [Dapr installed with mTLS enabled]({{% ref mtls %}}) -- mTLS is required for cross-app enforcement because the caller's identity is extracted from the SPIFFE ID in the mTLS certificate.
- The `WorkflowAccessPolicy` feature flag enabled in your Dapr Configuration.

## Terminology

### Caller App ID

The Dapr application identity (App ID) of the application that is requesting to schedule a workflow or activity on the target application. The caller identity is extracted from the mTLS connection.

### SPIFFE Identity

Dapr uses [SPIFFE](https://spiffe.io/) identities embedded in mTLS certificates to identify callers. The SPIFFE ID has the format `spiffe://<trustdomain>/ns/<namespace>/<appid>`. The App ID is extracted from this identity when evaluating workflow access policies.

### Glob Pattern

Workflow and activity names in policy rules support glob pattern matching:
- `*` matches any sequence of characters
- `?` matches any single character
- `[abc]` matches any character in the set

### Specificity

When multiple rules match a given workflow or activity name, the most specific rule wins. Specificity is determined by the longest literal (non-glob) prefix. An exact match is always more specific than a glob pattern. If two rules have the same specificity, `deny` takes precedence over `allow`.

## CRD specification

Below is a complete example of a `WorkflowAccessPolicy` resource:

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-processing-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: app1
        - appID: app2
      operations:
        - type: workflow
          name: "OrderWorkflow"
          action: allow
        - type: activity
          name: "ProcessPayment"
          action: allow
    - callers:
        - appID: app3
      operations:
        - type: workflow
          name: "Report*"
          action: allow
  scopes:
    - order-app
```

### Spec fields

| Field | Required | Type | Description |
|-------|:--------:|------|-------------|
| `defaultAction` | N | string | Global default action when no rule matches. Accepted values: `allow` or `deny`. Defaults to `deny`. |
| `rules` | N | list | List of rules that define which callers can perform which operations. |
| `rules[].callers` | Y | list | List of caller objects that this rule applies to. |
| `rules[].callers[].appID` | Y | string | The Dapr App ID of the calling application. |
| `rules[].operations` | Y | list | List of operations (workflows or activities) that this rule controls. |
| `rules[].operations[].type` | Y | string | The type of operation: `workflow` or `activity`. |
| `rules[].operations[].name` | Y | string | The name of the workflow or activity. Supports glob patterns (`*`, `?`, `[abc]`). |
| `rules[].operations[].action` | Y | string | The access action: `allow` or `deny`. |
| `scopes` | N | list | List of App IDs to which this policy applies. If empty, the policy applies to all applications. |

## Policy rules

The following rules describe how workflow access policies are evaluated:

1. **No policies loaded:** If no workflow access policies are loaded for an application, all workflow and activity scheduling requests are allowed. This preserves backward compatibility.
2. **mTLS not active (remote calls):** If policies exist for the target application but mTLS is not active, remote cross-app calls are denied because the caller's SPIFFE identity cannot be verified. Local calls (same-sidecar) are enforced using the app ID directly and do not require mTLS.
3. **Scheduling operations (start workflow, call activity):** The caller's App ID is matched against the `callers` list, and the requested operation type and name are matched against the `operations` list. The matching rule's `action` is applied.
4. **Most specific rule wins:** If multiple rules match, the rule with the most specific name pattern wins (longest literal prefix). An exact name match beats a glob pattern. At the same specificity level, `deny` beats `allow`.
5. **Management operations (terminate, purge, raise event):** For these operations, the system checks whether the caller is known to any rule in the policy. If the caller appears in at least one rule, the management operation is permitted.
6. **Cross-namespace calls denied:** When workflow access policies are active, cross-namespace calls are denied.

## Enforcement paths

Workflow access policies are enforced at two levels, covering all paths into the workflow engine:
- **Remote calls (callee-side):** The target sidecar's internal gRPC handler (`CallActor`, `CallActorStream`, `CallActorReminder`) validates the caller's SPIFFE identity from the mTLS connection.
- **Local calls (same-sidecar):** The actor router enforces policies using the app's own ID before dispatching to the local workflow/activity actor.

Both the HTTP and gRPC public APIs (e.g., `StartWorkflow`) are covered because they dispatch through the actor system, which hits one of these enforcement points.

## Example scenarios

### Scenario 1: Allow specific callers for specific workflows

Allow `frontend-app` to start the `OrderWorkflow` and `CheckoutWorkflow` on the `order-service` application, while denying all other callers.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: order-service-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: frontend-app
      operations:
        - type: workflow
          name: "OrderWorkflow"
          action: allow
        - type: workflow
          name: "CheckoutWorkflow"
          action: allow
  scopes:
    - order-service
```

### Scenario 2: Deny-all with exceptions (recommended for production)

Start with a `deny` default and explicitly allow only the callers and operations that are needed. This is the recommended approach for production deployments.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: production-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: api-gateway
        - appID: scheduler-service
      operations:
        - type: workflow
          name: "ProcessOrder"
          action: allow
        - type: workflow
          name: "RefundOrder"
          action: allow
        - type: activity
          name: "SendNotification"
          action: allow
    - callers:
        - appID: admin-service
      operations:
        - type: workflow
          name: "*"
          action: allow
  scopes:
    - order-service
```

### Scenario 3: Glob patterns for workflow families

Use glob patterns to allow access to a family of related workflows without listing each one individually.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: reporting-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: analytics-app
      operations:
        - type: workflow
          name: "Report*"
          action: allow
        - type: activity
          name: "Generate*Report"
          action: allow
    - callers:
        - appID: analytics-app
      operations:
        - type: workflow
          name: "ReportFinancialAudit"
          action: deny
  scopes:
    - reporting-service
```

In this example, `analytics-app` can start any workflow beginning with `Report` except `ReportFinancialAudit`, which is explicitly denied. Because the exact name `ReportFinancialAudit` is more specific than the glob `Report*`, the deny rule wins.

### Scenario 4: Cross-app activity calls with self-invocation

When using multi-application workflows, the target application must include itself in the callers list so that it can execute activities internally via reminders. This is a common requirement for any app that hosts activities called from other apps.

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: ml-training-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: orchestrator-app
      operations:
        - type: activity
          name: "TrainModel"
          action: allow
        - type: activity
          name: "ValidateModel"
          action: allow
    - callers:
        - appID: ml-worker
      operations:
        - type: activity
          name: "TrainModel"
          action: allow
        - type: activity
          name: "ValidateModel"
          action: allow
  scopes:
    - ml-worker
```

{{% alert title="Important" color="warning" %}}
Activities are executed internally via actor reminders. When a remote app schedules an activity on the target, the target app itself must be listed in the `callers` for those activities. If the target app is not included, the internal reminder-based execution of the activity will be denied.
{{% /alert %}}

## Production best practices

- **Always use `defaultAction: deny`.** This ensures that only explicitly allowed callers and operations are permitted, following the principle of least privilege.
- **Include the target app itself in callers for activity execution.** Activities are dispatched internally via actor reminders. The target app must be an allowed caller for its own activities.
- **Use glob patterns conservatively.** Overly broad patterns like `*` can inadvertently allow access to workflows or activities that should be restricted. Prefer exact names when possible.
- **Enable mTLS.** mTLS is required for cross-app enforcement. Without mTLS, all requests are denied when policies are active.
- **Monitor warning logs for policy violations.** Dapr logs a warning when a request is denied by a workflow access policy. Use these logs to audit access and detect misconfiguration.
- **Use `scopes` to limit which apps load the policy.** Apply policies only to the applications that need them, reducing unnecessary policy evaluation overhead.

## Self-hosted setup

In self-hosted mode, place the workflow access policy YAML file in the components directory (default: `$HOME/.dapr/components` or the path specified with `--resources-path`).

```yaml
apiVersion: dapr.io/v1alpha1
kind: WorkflowAccessPolicy
metadata:
  name: my-policy
spec:
  defaultAction: deny
  rules:
    - callers:
        - appID: app1
      operations:
        - type: workflow
          name: "MyWorkflow"
          action: allow
  scopes:
    - my-app
```

Ensure that mTLS is enabled by running the Sentry service locally. See [Setup & configure mTLS certificates]({{% ref mtls %}}) for details on configuring mTLS in self-hosted mode.

## Kubernetes setup

In Kubernetes, apply the `WorkflowAccessPolicy` CRD to your cluster using `kubectl`:

```bash
kubectl apply -f workflow-access-policy.yaml
```

The Dapr operator watches for `WorkflowAccessPolicy` resources and distributes them to the appropriate sidecars based on the `scopes` field. mTLS is enabled by default in Kubernetes mode.

## Enable the feature flag

The `WorkflowAccessPolicy` feature must be enabled in your Dapr Configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
spec:
  features:
    - name: WorkflowAccessPolicy
      enabled: true
```

Apply this configuration to each application that needs workflow access policy enforcement.

## Hot-reload support

Workflow access policies support hot-reloading in both Kubernetes and self-hosted modes. When a policy is created, updated, or deleted, the changes take effect without restarting the Dapr sidecar. This allows you to adjust policies in real time without application downtime.

## Related links

- [Security concepts]({{% ref security-concept.md %}})
- [Multi-application workflows]({{% ref workflow-multi-app.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Service invocation access control]({{% ref invoke-allowlist.md %}})
- [Setup & configure mTLS certificates]({{% ref mtls %}})
- [WorkflowAccessPolicy CRD reference]({{% ref workflow-access-policy-schema.md %}})
- [Preview features]({{% ref support-preview-features.md %}})
