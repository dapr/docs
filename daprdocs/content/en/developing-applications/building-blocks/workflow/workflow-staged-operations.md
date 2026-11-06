---
type: docs
title: "Workflow staged operations"
linkTitle: "Staged operations"
weight: 4600
description: "Accept workflow operations while no workflow worker is connected, and run them once one connects"
---

A workflow runs on a Dapr sidecar that has a workflow worker connected: your application, through a workflow SDK. Without staged operations, a start, raise event or other operation made while no sidecar of the app has a worker connected fails, or waits until the caller's deadline.

With staged operations, Dapr accepts these operations while no worker is connected. It saves them and returns at once. They run once a worker connects.

{{% alert title="Preview feature" color="warning" %}}
Staged operations are available in Dapr v1.20 and later as a [preview feature]({{% ref "support-preview-features.md" %}}) behind the `WorkflowsStagedOperations` feature gate. It is disabled by default and enabled per application through the [Configuration `features` list]({{% ref "preview-features.md" %}}).
{{% /alert %}}

## What happens while no worker is connected

| Operation | Result |
| --- | --- |
| Start, raise event, terminate, suspend (pause), resume, rerun | **Staged.** Dapr saves the operation and returns at once. The operation runs once a worker connects. |
| Get status, list instances, purge | **Completes at once**, as with a worker connected. |

- A staged operation returns the same synchronous errors as with a worker connected. For example, a start with an instance ID that is already in use fails with `AlreadyExists` (HTTP `500` with `ERR_START_WORKFLOW`).
- A staged start creates the instance at once. A status read returns it with the runtime status `PENDING`, and it appears in the list of instances.
- A staged terminate is applied only once a worker connects. Until then the instance is not terminal, so starting a new instance with the same ID fails with `AlreadyExists`.
- Calls from other applications work. An operation from another app into an app with no worker connected is staged in the same way. See [multi-application workflows]({{% ref "workflow-multi-app.md" %}}).
- Work in progress when the last worker leaves, such as a running activity or a timer, continues once a worker connects again.

## The `staged` response field

The responses to start, raise event, terminate, suspend, resume and rerun have a `staged` field. It is `true` only when Dapr staged the operation because no worker was connected. It is `false` when the operation ran on a sidecar with a worker. Purge and status reads are never staged.

Use it to notice operations that wait for a worker. For example, a call with the ID of an app that has no worker running is staged, and stays staged until a worker of that app connects.

- **Workflow SDKs (durabletask gRPC API):** `CreateInstanceResponse`, `RaiseEventResponse`, `TerminateResponse`, `SuspendResponse`, `ResumeResponse` and `RerunWorkflowFromEventResponse` have a `staged` field. In Go, the workflow client methods `ScheduleWorkflowWithResult`, `RaiseEventWithResult`, `TerminateWorkflowWithResult`, `SuspendWorkflowWithResult`, `ResumeWorkflowWithResult` and `RerunWorkflowFromEventWithResult` return a result with a `Staged` field.
- **Dapr gRPC API:** `StartWorkflowResponse` has a `staged` field. Terminate, pause, resume and raise event return `TerminateWorkflowResponse`, `PauseWorkflowResponse`, `ResumeWorkflowResponse` and `RaiseEventWorkflowResponse`, each with a `staged` field, instead of `google.protobuf.Empty`. This is wire compatible: an older client ignores the field, and an older sidecar's response reads as not staged.
- **HTTP API:** the response body has `"staged": true` only when the operation was staged. See the [workflow API reference]({{% ref "workflow_api.md" %}}).

## How it works

Each Dapr sidecar of the app applies one rule on its own: it hosts the workflow actors if it has a workflow worker connected, or if no other sidecar of the app has one. A sidecar that hosts them with no worker connected is a *fallback host*.

- A fallback host saves operations and answers status reads and purges. It runs no workflow code. The Scheduler does not deliver workflow reminders to it, so saved work waits until a sidecar with a worker exists.
- Once no sidecar of the app has had a worker for a few seconds, every sidecar of the app becomes a fallback host. A sidecar whose last worker leaves stays a fallback host if no other sidecar has a worker.
- When a worker connects to a fallback host, that sidecar starts running workflows in place.
- When a worker connects to another sidecar, a fallback host gives up the workflow actors once that sidecar has had a worker for about 10 seconds. This way a worker that keeps restarting does not move instances between sidecars each time it connects.

No control plane change is needed.

## Enable staged operations

Enable the feature in the Configuration resource of the application that runs workflows:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  features:
    - name: WorkflowsStagedOperations
      enabled: true
```

The gate is read when the sidecar starts. After changing it, restart the sidecars of the application.

{{% alert title="Important" color="warning" %}}
Enable the feature only once every sidecar of the application runs Dapr v1.20 or later. An older sidecar with a worker connected does not tell the other sidecars that it has one. A sidecar with the feature enabled and no worker would then take a share of the application's instances that it cannot run.
{{% /alert %}}

- Set the feature only in the Configuration of the applications that run workflows, not of every application. A sidecar with the feature enabled hosts its application's workflow actors while that application has no worker connected, even when the application does not use workflows.
- To return at once from a staged operation on another application, the calling sidecar must run Dapr v1.20 or later. It does not need the feature enabled.

## Metrics

The sidecar exposes `dapr_runtime_workflow_staged_operation_count`, a counter of the operations staged while no worker was connected. Its tags are `app_id`, `namespace` and `operation`. The `operation` values are `create_workflow`, `raise_event`, `terminate_workflow`, `suspend_workflow`, `resume_workflow` and `rerun_workflow`.

Purges and status reads complete at once, so they are not counted. Events from a workflow's own progress, such as the start of a child workflow or a completion from another application, are not operations a user made, so they are not counted either.

A count that keeps rising means operations are waiting for a worker to connect. See [Configure metrics]({{% ref "metrics-overview.md" %}}).

## Related links

- [Workflow overview]({{% ref "workflow-overview.md" %}})
- [Workflow architecture]({{% ref "workflow-architecture.md" %}})
- [How to: Manage workflows]({{% ref "howto-manage-workflow.md" %}})
- [Workflow API reference]({{% ref "workflow_api.md" %}})
- [Preview features]({{% ref "support-preview-features.md" %}})
- [How-To: Enable preview features]({{% ref "preview-features.md" %}})
