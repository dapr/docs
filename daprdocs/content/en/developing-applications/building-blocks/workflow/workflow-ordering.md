---
type: docs
title: "Workflow ordering keys"
linkTitle: "Ordering keys"
weight: 2650
description: "Run workflows that share a key one at a time, in start order"
---

An _ordering key_ runs the workflows of an app that share the key one at a time, in the order they were started: a queued workflow runs no code until the ones before it have finished.

Ordering keys let you process related work strictly in sequence, such as the orders of one customer or the steps of one deployment, without putting a message broker in front of your workflows. Workflows with different keys, and workflows without a key, run in parallel as usual.

{{% alert title="Note" color="primary" %}}
Ordering keys are available in Dapr v1.20 and later. The ordering option needs an SDK release that supports it.
{{% /alert %}}

The following diagram shows three workflows started with the same key. The first runs at once; the other two queue behind it. The first one fails, so the second, started with the `BLOCK` [failure policy](#when-a-workflow-fails), waits and holds up the third until the failed workflow is run again under its instance ID and completes.

{{< mermaid >}}
sequenceDiagram
    participant Cl as Client
    participant K as Ordering key
    participant A as Workflow A
    participant B as Workflow B<br/>(BLOCK)
    participant C as Workflow C<br/>(CONTINUE)
    Cl->>K: Start A
    K->>A: Release: run
    Cl->>K: Start B
    Cl->>K: Start C
    Note over B,C: PENDING: queued behind A, no code runs
    A-->>K: Ended FAILED
    Note over K,C: B blocks on the failure and holds up C
    Cl->>K: Start A again, same instance ID
    K->>A: Release: run ahead of B
    A-->>K: Ended COMPLETED
    K->>B: Release: run
    B-->>K: Ended COMPLETED
    K->>C: Release: run
{{< /mermaid >}}

## How ordering keys work

- **Queue per key and app.** A key names a queue within the app that runs the workflow. A workflow started on another app with the [cross-app]({{% ref workflow-multi-app.md %}}) target queues in the target app.
- **Start order.** Workflows run in the order their starts reach the queue. Two starts sent at the same time have no defined order between them.
- **Release.** The next workflow starts once the previous one has finished or is force purged. If the previous one did not complete successfully, the next one's [failure policy](#when-a-workflow-fails) decides what it does. A workflow that continues as new keeps the key until its last generation finishes.
- **Queued workflows exist at once.** A queued workflow reports the `PENDING` status, and you can get, wait for, raise events to, or terminate it like any other workflow. Events raised to it are delivered when it starts. The start call returns as soon as the workflow is queued. List the queued workflows of an app with `dapr workflow list --app-id <app-id> --filter-status PENDING`.
- **Terminating a queued workflow.** It completes as `TERMINATED` without running any of its code, and leaves the queue.
- **Start time.** A queued workflow with a start time takes its place in the queue when it is started, and once it reaches the front, starts no earlier than its start time. It holds the key while it waits.
- **Instance IDs.** You can reuse the ID of a finished keyed workflow; it queues again.
- **Stalls.** A workflow that stalls, for example because its version is not registered, holds its key until it is fixed or terminated.
- **Not ordered.** [Re-runs]({{% ref "howto-manage-workflow.md" %}}) of a keyed workflow use a new instance ID and do not take part in its key's queue, and neither do its child and detached workflows.

A key may hold letters, digits, `-` and `_`, and is at most 64 characters long. Keys need no setup: a key's queue exists while it holds workflows.

{{% alert title="Warning" color="warning" %}}
During a rolling upgrade from a Dapr version without ordering keys, an older sidecar that takes over a queued workflow runs it at once. Upgrade every sidecar of an app before you start keyed workflows on it.
{{% /alert %}}

## When a workflow fails

Each keyed workflow can set what it does when the workflow before it under its key ran and did not complete successfully, that is, ended `FAILED` or `TERMINATED`:

| Policy | The workflow |
| --- | --- |
| `CONTINUE` (default) | Runs anyway. |
| `BLOCK` | Stays `PENDING`, holding up every workflow behind it, until the failed workflow is resolved (see below). |
| `CANCEL` | Completes as `TERMINATED` without running any code. Its output names the failed workflow. |

The policy belongs to the waiting workflow, so steps of one key can differ: a deployment step can block or cancel while a clean-up or notification step continues.

- **Workflows that never ran are skipped.** A workflow cancelled by its policy, or terminated while queued, is nobody's predecessor: the next workflow applies its own policy to the same failure, so a run of `CANCEL` workflows cancels in turn until a `CONTINUE` or `BLOCK` workflow.
- **Failures are remembered.** A workflow started after a failure, when nothing else is queued, still sees it.
- **Resolving a failure.** A `BLOCK` workflow waits until the failed workflow is either:
  - started again under the same instance ID: the new run goes first, ahead of the waiting workflows, and its outcome then decides; or
  - [purged]({{% ref "workflow_api.md#purge-workflow-request" %}}), explicitly or by a [retention policy]({{% ref workflow-history-retention-policy.md %}}): that skips it, and the blocked workflow runs. With a retention policy on failed workflows, a `BLOCK` workflow waits at most for the retention period.

  Starting the failed workflow under another ordering key, or with none, also skips it.

## Start a workflow with an ordering key

The following examples queue a deployment step that waits for the step before it to succeed.

{{< tabpane text=true >}}

{{% tab "Python" %}}

```python
from dapr.ext.workflow import DaprWorkflowClient, OrderingFailurePolicy, WorkflowOrdering

client = DaprWorkflowClient()
client.schedule_new_workflow(
    workflow=deploy_step,
    instance_id=step.id,
    input=step,
    ordering=WorkflowOrdering(
        key=f"env-{step.environment}",
        on_predecessor_failure=OrderingFailurePolicy.BLOCK,
    ),
)
```

{{% /tab %}}

{{% tab "JavaScript" %}}

```javascript
import { OrderingFailurePolicy } from "@dapr/dapr";

await workflowClient.scheduleNewWorkflow(deployStep, step, step.id, undefined, undefined, {
  key: `env-${step.environment}`,
  onPredecessorFailure: OrderingFailurePolicy.BLOCK,
});
```

{{% /tab %}}

{{% tab ".NET" %}}

```csharp
await workflowClient.ScheduleNewWorkflowWithOptionsAsync(
    nameof(DeployStepWorkflow),
    new StartWorkflowOptions
    {
        InstanceId = step.Id,
        Ordering = new WorkflowOrdering($"env-{step.Environment}", OrderingFailurePolicy.Block),
    },
    step);
```

{{% /tab %}}

{{% tab "Java" %}}

```java
workflowClient.scheduleNewWorkflow(DeployStepWorkflow.class, new NewWorkflowOptions()
    .setInstanceId(step.getId())
    .setInput(step)
    .setOrdering(new WorkflowOrdering("env-" + step.getEnvironment(), OrderingFailurePolicy.BLOCK)));
```

{{% /tab %}}

{{% tab "Go" %}}

```go
id, err := client.ScheduleWorkflow(ctx, "DeployStep",
	workflow.WithInstanceID(step.ID),
	workflow.WithInput(step),
	workflow.WithOrdering(workflow.Ordering{
		Key:                  "env-" + step.Environment,
		OnPredecessorFailure: workflow.OrderingFailurePolicyBlock,
	}),
)
```

{{% /tab %}}

{{% tab "gRPC API" %}}

Pass the key in the `dapr.workflow.ordering_key` option of the `StartWorkflowBeta1` call, and the policy, `continue`, `block` or `cancel`, in `dapr.workflow.ordering_on_predecessor_failure`:

```json
{
  "workflow_component": "dapr",
  "workflow_name": "DeployStep",
  "instance_id": "step-1234",
  "options": {
    "dapr.workflow.ordering_key": "env-prod",
    "dapr.workflow.ordering_on_predecessor_failure": "block"
  }
}
```

{{% /tab %}}

{{< /tabpane >}}

## Related links

- [Manage workflows]({{% ref howto-manage-workflow.md %}})
- [Workflow concurrency]({{% ref workflow-concurrency.md %}})
