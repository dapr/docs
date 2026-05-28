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
            foreach (var evt in history.Events)
            {
                // evt.Name, evt.InstanceId, evt.AppId
                // evt.Activities — activity results for this ancestor
                // evt.Workflows  — child workflow results for this ancestor
            }
        }

        return await context.CallActivityAsync<PaymentResult>(
            nameof(ChargeCardActivity), order);
    }
}
```

### PropagatedHistory type

`GetPropagatedHistory()` returns a `PropagatedHistory` object (or `null`). Its `Events` property is an ordered list of `PropagatedHistoryEvent` values — one per ancestor workflow, in execution order (oldest ancestor first, immediate parent last).

Each `PropagatedHistoryEvent` represents a single ancestor workflow's contribution to the propagated history:

| Member | Type | Description |
|---|---|---|
| `AppId` | `string` | Dapr app ID that ran this workflow |
| `InstanceId` | `string` | Workflow instance ID |
| `Name` | `string` | The name of the workflow |
| `Activities` | `IReadOnlyList<PropagatedHistoryActivityResult>` | Activity results for this workflow, in execution order |
| `Workflows` | `IReadOnlyList<PropagatedHistoryWorkflowResult>` | Child workflow results for this workflow, in execution order |

### PropagatedHistoryActivityResult type

Each `PropagatedHistoryActivityResult` is a sealed record describing a single activity invocation:

| Member | Type | Description |
|---|---|---|
| `Name` | `string` | The scheduled name of the activity |
| `Status` | `PropagatedHistoryStatus` | Lifecycle status — `Pending`, `Completed`, or `Failed` |
| `Input` | `string?` | JSON-encoded input payload, or `null` when unset |
| `Output` | `string?` | JSON-encoded output payload, or `null` when the activity has not completed |
| `FailureDetails` | `WorkflowTaskFailureDetails?` | Failure details when `Status` is `Failed`, otherwise `null` |

### PropagatedHistoryWorkflowResult type

Each `PropagatedHistoryWorkflowResult` is a sealed record describing a single child workflow invocation:

| Member | Type | Description |
|---|---|---|
| `Name` | `string` | The scheduled name of the child workflow |
| `Status` | `PropagatedHistoryStatus` | Lifecycle status — `Pending`, `Completed`, or `Failed` |
| `Output` | `string?` | JSON-encoded output payload, or `null` when the workflow has not completed |
| `FailureDetails` | `WorkflowTaskFailureDetails?` | Failure details when `Status` is `Failed`, otherwise `null` |

### PropagatedHistoryStatus enum

`PropagatedHistoryStatus` reflects how far a task progressed past scheduling:

| Value | Description |
|---|---|
| `Pending` | The task was scheduled but has not yet completed or failed |
| `Completed` | The task completed successfully |
| `Failed` | The task failed |

## Query propagated history

### PropagatedHistory query methods

`PropagatedHistory` provides `Get` methods that return lists and `TryGet` methods that return a single match (the most recent) via an `out` parameter. All `Get` methods return an empty list when no match is found.

| Method | Return type | Description |
|---|---|---|
| `GetByAppId(string)` | `IReadOnlyList<PropagatedHistoryEvent>` | All events from the given Dapr app ID |
| `GetByInstanceId(string)` | `IReadOnlyList<PropagatedHistoryEvent>` | All events from the given workflow instance ID |
| `GetEventsByWorkflowName(string)` | `IReadOnlyList<PropagatedHistoryEvent>` | All events with the given workflow name |
| `TryGetLastWorkflowEventByName(string, out PropagatedHistoryEvent?)` | `bool` | Gets the most recent event matching the workflow name |
| `GetAppIds()` | `IReadOnlyList<string>` | Ordered, deduplicated list of app IDs in the history |

### PropagatedHistoryEvent query methods

Each `PropagatedHistoryEvent` also provides query methods to inspect the activities and child workflows within that ancestor:

| Method | Return type | Description |
|---|---|---|
| `GetActivitiesByName(string)` | `IReadOnlyList<PropagatedHistoryActivityResult>` | All activities matching the given name |
| `TryGetLastActivityByName(string, out PropagatedHistoryActivityResult?)` | `bool` | Gets the most recent activity matching the name |
| `GetWorkflowsByName(string)` | `IReadOnlyList<PropagatedHistoryWorkflowResult>` | All child workflows matching the given name |
| `TryGetLastWorkflowByName(string, out PropagatedHistoryWorkflowResult?)` | `bool` | Gets the most recent child workflow matching the name |

### Example

```csharp
var history = context.GetPropagatedHistory();

if (history != null)
{
    // By app ID — useful in multi-app workflows
    var fromOrderApp = history.GetByAppId("order-app");

    // By workflow instance ID
    var fromSpecificRun = history.GetByInstanceId("checkout-abc123");

    // By workflow name — returns all matches (e.g. recursion or ContinueAsNew)
    var checkoutEvents = history.GetEventsByWorkflowName(nameof(MerchantCheckoutWorkflow));

    // TryGet for a single match — avoids null ambiguity
    if (history.TryGetLastWorkflowEventByName(nameof(MerchantCheckoutWorkflow), out var parentEvent))
    {
        // Inspect the parent's activities
        var failedActivities = parentEvent.Activities
            .Where(a => a.Status == PropagatedHistoryStatus.Failed)
            .ToList();

        // Or look up a specific activity by name
        if (parentEvent.TryGetLastActivityByName(nameof(ValidateMerchantActivity), out var validation))
        {
            // validation.Status, validation.Output, validation.FailureDetails
        }
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
