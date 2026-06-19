---
type: docs
title: "Detached workflows"
linkTitle: "Detached workflows"
weight: 2600
description: "Schedule fire-and-forget workflows that run independently of their caller"
---

In addition to [child workflows]({{% ref "#child-workflows" %}}), a workflow can schedule another workflow as a _detached workflow_. With a _detached workflow_, however, the relationship is **fire-and-forget**: the calling workflow asks the runtime to start a new, fully independent workflow instance and then immediately continues with the rest of its own logic, without waiting for the detached workflow to complete.

When you schedule a detached workflow, the call returns the new instance ID synchronously. The detached workflow then runs as its own top-level instance, with its own instance ID, history, and lifecycle, exactly as if it had been scheduled directly by a client. There is no parent linkage: the detached workflow's success or failure does not flow back to the caller, and terminating the caller does not terminate the detached workflow.

This reference is one-directional. The calling workflow records the spawn as a single event in its own history, so it keeps a reference to the detached instance it created. The detached workflow, however, holds no reference back to its caller: it has no parent instance and behaves like a standalone, top-level workflow.

Recording the spawn in the caller's history is also what keeps the calling workflow deterministic. As with any workflow action, the spawn must be captured in the history so that, when the workflow [replays]({{% ref "workflow-features-concepts.md#workflow-replay" %}}), the runtime knows the detached workflow was already created and does not schedule it a second time. Without this event, a replay would have no way to know whether the detached workflow had already been started.

{{% alert title="Note" color="primary" %}}
Detached workflows are available in Dapr v1.19 and later. SDK support is currently available in Go, with support for the other SDKs being added soon.
{{% /alert %}}

## Detached workflows compared to child workflows

| | Child workflow | Detached workflow |
| --- | --- | --- |
| **Relationship to caller** | Coupled to the caller's lifecycle | Fully independent (fire-and-forget) |
| **Caller behavior** | Receives an awaitable task and typically awaits its completion | Receives the new instance ID synchronously and continues immediately |
| **Return value and errors** | Output and exceptions surface back to the caller | Nothing flows back to the caller |
| **Parent termination** | Terminating the caller terminates the child workflow | Terminating the caller has no effect on the detached workflow |
| **Retry policies** | Supported | Not applicable, as the caller does not track the outcome |

If you need the result of the scheduled workflow, want its failures to propagate, or want it to be terminated alongside its parent, use a [child workflow]({{% ref "workflow-features-concepts.md#child-workflows" %}}) instead.

## When to use detached workflows

Detached workflows are a good fit when a workflow needs to trigger independent work that should be isolated from the caller, such as:

- **Multi-tenant fan-out**: a workflow that iterates over tenants, organizations, or customers and starts an isolated workflow per entity, where you want hard isolation between each tenant's work and the orchestrating workflow.
- **Fire-and-forget downstream work**: triggering follow-on processing (notifications, audits, cleanup) whose outcome should not affect the workflow that started it.
- **Forking a new history chain**: starting a long-running or independently-managed workflow that should not inflate the caller's history or share its failure domain.

## Schedule a detached workflow

The following example schedules a detached `AuditWorkflow` from within `ParentWorkflow`. Unlike a child workflow, there is no task to await: the call returns the new instance ID synchronously and the scheduling workflow continues immediately. Both the scheduling workflow and the detached workflow must be registered with the worker, the same way as any other workflow.

{{< tabpane text=true >}}

{{% tab "Go" %}}

<!--go-->

```go
// ParentWorkflow schedules a detached workflow and continues immediately,
// without waiting for it to finish.
func ParentWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	// ScheduleNewWorkflow starts a detached, fire-and-forget workflow and
	// returns its instance ID synchronously. There is no task to await.
	instanceID, err := ctx.ScheduleNewWorkflow(AuditWorkflow,
		workflow.WithDetachedWorkflowInput("order-1234"),
	)
	if err != nil {
		return nil, err
	}

	// The parent continues without waiting. The detached workflow's success
	// or failure does not affect this workflow.
	return instanceID, nil
}

// AuditWorkflow runs independently as its own top-level workflow instance.
func AuditWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var orderID string
	if err := ctx.GetInput(&orderID); err != nil {
		return nil, err
	}
	if err := ctx.CreateTimer(3 * time.Second).Await(nil); err != nil {
		return nil, err
	}
	return "audit completed for " + orderID, nil
}
```

{{% /tab %}}

{{< /tabpane >}}

### Detached workflow options

When scheduling a detached workflow, you can set the following options to control the new instance. The exact API and naming depend on the SDK.

| Option | Description |
| --- | --- |
| **Instance ID** | The instance ID of the detached workflow. When omitted, a deterministic ID of the form `<caller-instance-id>-<n>` is generated. |
| **Input** | The input passed to the detached workflow. |
| **Start time** | Defers the start of the detached workflow until the given time. |
| **App ID** | Schedules the detached workflow on a different application by target app ID, subject to the [multi-application workflow]({{% ref workflow-multi-app.md %}}) rules. |
| **App namespace** | The Dapr namespace of the target application. Must be combined with the app ID and, per the multi-application rules, must match the caller's namespace. |

## Related links

- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow features and concepts]({{% ref workflow-features-concepts.md %}})
- [Child workflows]({{% ref "workflow-features-concepts.md#child-workflows" %}})
- [Multi application workflows]({{% ref workflow-multi-app.md %}})
- [How to: Author workflows]({{% ref howto-author-workflow.md %}})
