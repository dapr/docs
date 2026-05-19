---
type: docs
title: "Workflow history propagation in the .NET SDK"
linkTitle: "History propagation"
weight: 1700
description: Share ancestor workflow execution history with child workflows and activities using the .NET SDK
---

## Overview

Workflow history propagation allows a parent workflow to share its execution history — and optionally its full ancestor chain — with the child workflows and activities it calls. The child can then inspect those upstream events at runtime.

Common use cases include:

- Audit trails: Verifying a chain of custody across a multi-step workflow
- Fraud detection: Inspecting upstream decisions before committing a transaction
- AI agent orchestration: Passing context through hierarchical agent workflows

Conceptual guidance is covered in [Workflow history propagation]({{% ref "workflow-history-propagation.md" %}}).

{{% alert title="Note" color="primary" %}}
This feature requires Dapr .NET SDK v1.18.0 or later and Dapr runtime v1.18.0 or later.
{{% /alert %}}

## Propagation scopes

Propagation is **opt-in and per-call**. Each call to `CallActivityAsync` or `CallChildWorkflowAsync` can independently specify a `HistoryPropagationScope`:

| Scope | Description |
|---|---|
| `None` | Default. No history is propagated to the callee. |
| `OwnHistory` | Propagates the calling workflow's own events only. Ancestor history is dropped, acting as a trust boundary. |
| `Lineage` | Propagates the calling workflow's events plus the full ancestor chain it inherited from its own parent. |

## Propagate history to a child workflow

Use `WithHistoryPropagation` on `ChildWorkflowTaskOptions` to opt a child workflow into receiving the parent's history:

```csharp
public sealed class MerchantCheckoutWorkflow : Workflow<Order, CheckoutResult>
{
    public override async Task<CheckoutResult> RunAsync(WorkflowContext context, Order order)
    {
        // Activity without propagation — default behavior, no opt-in
        await context.CallActivityAsync(nameof(ValidateMerchantActivity), order.MerchantId);

        // Child workflow with full lineage propagation
        var options = new ChildWorkflowTaskOptions()
            .WithHistoryPropagation(HistoryPropagationScope.Lineage);

        var result = await context.CallChildWorkflowAsync<PaymentResult>(
            nameof(ProcessPaymentWorkflow), order, options);

        return new CheckoutResult(result);
    }
}
```

Calls that do not specify a propagation scope receive no history — other calls in the same workflow are unaffected by opt-ins.

## Propagate history to an activity

The same `WithHistoryPropagation` extension is available on `WorkflowTaskOptions` for activity calls:

```csharp
var options = new WorkflowTaskOptions()
    .WithHistoryPropagation(HistoryPropagationScope.OwnHistory);

var auditResult = await context.CallActivityAsync<AuditResult>(
    nameof(WriteAuditTrailActivity), payload, options);
```

## Read propagated history

Inside a child workflow, call `GetPropagatedHistory()` on `WorkflowContext` to retrieve the history passed by the parent. The method returns `null` if propagation was not requested for this invocation.

```csharp
public sealed class ProcessPaymentWorkflow : Workflow<Order, PaymentResult>
{
    public override async Task<PaymentResult> RunAsync(WorkflowContext context, Order order)
    {
        var history = context.GetPropagatedHistory();

        if (history != null)
        {
            foreach (var entry in history.Entries)
            {
                // entry.WorkflowName, entry.InstanceId, entry.AppId, entry.Events
            }
        }

        return await context.CallActivityAsync<PaymentResult>(
            nameof(ChargeCardActivity), order);
    }
}
```

### PropagatedHistory type

`GetPropagatedHistory()` returns a `PropagatedHistory` object (or `null`). Its `Entries` property is a collection of `PropagatedHistoryEntry` records, each representing one workflow in the ancestor chain:

| Member | Type | Description |
|---|---|---|
| `AppId` | `string` | Dapr app ID that hosted the workflow |
| `InstanceId` | `string` | Workflow instance ID |
| `WorkflowName` | `string` | Registered name of the workflow |
| `Events` | `IReadOnlyList<PropagatedHistoryEvent>` | History events for this workflow |

Each `PropagatedHistoryEvent` has:

| Member | Type | Description |
|---|---|---|
| `EventId` | `int` | Sequence number within the workflow history |
| `Kind` | `HistoryEventKind` | The type of event (see below) |
| `Timestamp` | `DateTimeOffset` | When the event occurred |

`HistoryEventKind` values include `ExecutionStarted`, `ExecutionCompleted`, `TaskScheduled`, `TaskCompleted`, `TaskFailed`, `SubOrchestrationInstanceCreated`, `SubOrchestrationInstanceCompleted`, `SubOrchestrationInstanceFailed`, `TimerCreated`, `TimerFired`, `OrchestratorStarted`, `OrchestratorCompleted`, `EventSent`, `EventRaised`, `ContinueAsNew`, `ExecutionSuspended`, and `ExecutionResumed`.

## Filter propagated history

`PropagatedHistory` provides filter methods to narrow the entries to a specific workflow in the chain:

```csharp
var history = context.GetPropagatedHistory();

if (history != null)
{
    // By app ID — useful in multi-app workflows
    var fromOrderApp = history.FilterByAppId("order-app");

    // By workflow instance ID
    var fromSpecificRun = history.FilterByInstanceId("checkout-abc123");

    // By workflow name
    var checkoutEntries = history.FilterByWorkflowName(nameof(MerchantCheckoutWorkflow));

    foreach (var entry in checkoutEntries)
    {
        var failedTasks = entry.Events
            .Where(e => e.Kind == HistoryEventKind.TaskFailed)
            .ToList();

        // Use failedTasks for audit or routing decisions
    }
}
```

## Security considerations

By default, Dapr uses mutual TLS (mTLS) between sidecars for all cross-app communication, providing transport-layer protection for propagated history in [multi-app workflow]({{% ref "dotnet-workflow-multi-app.md" %}}) scenarios.

For stronger guarantees in production, enable `WorkflowHistorySigning`. This feature uses SPIFFE identity to cryptographically sign each history chunk, so the receiving workflow can verify the integrity and origin of the propagated history. Without signing enabled, Dapr emits a warning that propagated chunks lack cryptographic verification.

See [Workflow history propagation]({{% ref "workflow-history-propagation.md" %}}) for details on configuring `WorkflowHistorySigning`.

## Next steps

- [Workflow history propagation]({{% ref "workflow-history-propagation.md" %}})
- [Multi-app workflows]({{% ref "dotnet-workflow-multi-app.md" %}})
- [Workflow management operations]({{% ref "dotnet-workflow-management-methods.md" %}})
