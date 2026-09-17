---
type: docs
title: "Workflow history propagation"
linkTitle: "History propagation"
weight: 2500
description: "Share a parent workflow's execution history with child workflows and activities for chain-of-custody, audit, and AI-agent context"
---

By default, a child workflow or activity only sees the input it was scheduled with. The parent's execution history — what activities ran, what child workflows it spawned, what events it observed — is invisible. Workflow history propagation lets a parent opt-in to share that history with the workflows it schedules.

This is useful for:

- **Chain-of-custody and audit** — a fraud check, compliance gate, or settlement step can verify what already happened upstream rather than trusting the caller's claims.
- **Cross-app workflows** — a downstream app, often owned by a different team, can confirm an upstream activity ran without an out-of-band query.
- **AI agents and long-running orchestrations** — agents that loop with `ContinueAsNew` or fan out to sub-agents can carry context (tool calls, model outputs, intermediate decisions) forward without re-prompting expensive calls from scratch.

## Propagation scopes

Two scopes are exposed. The default is no propagation.

| Option helper | Scope value carried | What gets sent | When to use it |
| ------------- | ------------------- | -------------- | -------------- |
| `workflow.PropagateLineage()` | `LINEAGE` (`HISTORY_PROPAGATION_SCOPE_LINEAGE`) | Caller's own events plus the full ancestor chain inherited from the caller's parent | Full chain-of-custody, downstream wants to see everything that happened before, all the way to the root |
| `workflow.PropagateOwnHistory()` | `OWN_HISTORY` (`HISTORY_PROPAGATION_SCOPE_OWN_HISTORY`) | Caller's own events only, ancestral (parents) lineage is dropped | Trust boundary — the caller is willing to vouch for what *it* did but the receiver shouldn't see further upstream |

The helpers (`PropagateLineage` / `PropagateOwnHistory`) are what you pass when scheduling — each SDK has its own equivalent (see the examples below). The scope values (`LINEAGE` / `OWN_HISTORY`) are the runtime enum names carried on the propagation.

`PropagateOwnHistory` is the trust boundary: choosing it tells the runtime to stop forwarding any history the caller itself received. This is the right choice when the receiver is a less-trusted app, a third party, or operates under different compliance rules.

### Which scope should I use?

`PropagateLineage` is the most common choice, as most workflows will want the receiver to see the full chain of what happened upstream — that's what makes the chain-of-custody, audit, and agent-context use cases above work. The decision is about how far down the chain you're willing to share.

Use `PropagateOwnHistory` only when you're crossing a trust boundary: the receiver is a less-trusted app, a third party, or runs under different compliance rules, and you're willing to vouch for your own steps but not forward everything you inherited from your own parent. Outside those cases, prefer lineage.

{{% alert title="Mind the payload size" color="primary" %}}
Propagated history is carried as part of the scheduled call's payload and stored in the receiver's history. With `PropagateLineage` the payload grows with the depth of the ancestor chain — deep workflow trees and long-running orchestrations can approach Dapr's default gRPC message limit (4 MB), which is configurable. `PropagateOwnHistory` keeps the payload smaller by dropping the inherited ancestor chain.
{{% /alert %}}

## Setting it up

A parent enables propagation for a single child workflow or activity with a per-call option. Other calls in the same workflow are unaffected, and the default remains no propagation.

{{< tabpane text=true >}}

{{% tab header="Python" %}}

```python
import dapr.ext.workflow as wf

@wfr.workflow(name='MerchantCheckout')
def merchant_checkout(ctx: wf.DaprWorkflowContext, order_json: str):
    # The validate_merchant activity does NOT receive propagated history (default).
    yield ctx.call_activity(validate_merchant, input=order_json)

    # The process_payment child workflow DOES receive parent's history (LINEAGE).
    result = yield ctx.call_child_workflow(
        process_payment,
        input=order_json,
        propagation=wf.PropagationScope.LINEAGE,
    )
    return result
```

{{% /tab %}}

{{% tab header=".NET" %}}

```csharp
using Dapr.Workflow;

public sealed class MerchantCheckoutWorkflow : Workflow<Order, string>
{
    public override async Task<string> RunAsync(WorkflowContext ctx, Order order)
    {
        // The ValidateMerchantActivity does NOT receive propagated history (default).
        await ctx.CallActivityAsync<bool>(nameof(ValidateMerchantActivity), order);

        // The ProcessPaymentWorkflow child workflow DOES receive parent's history (Lineage).
        var childOptions = new ChildWorkflowTaskOptions()
            .WithHistoryPropagation(HistoryPropagationScope.Lineage);
        return await ctx.CallChildWorkflowAsync<string>(
            nameof(ProcessPaymentWorkflow),
            order,
            options: childOptions);
    }
}
```

{{% /tab %}}

{{% tab header="Go" %}}

```go
import (
    "github.com/dapr/durabletask-go/workflow"
)

func MerchantCheckout(ctx *workflow.WorkflowContext) (any, error) {
    // Activity does NOT receive propagated history (default).
    if err := ctx.CallActivity("ValidateMerchant").Await(nil); err != nil {
        return nil, err
    }

    // Child workflow DOES receive parent's history (LINEAGE).
    var result string
    if err := ctx.CallChildWorkflow("ProcessPayment",
        workflow.WithHistoryPropagation(workflow.PropagateLineage()),
    ).Await(&result); err != nil {
        return nil, err
    }
    return result, nil
}
```

{{% /tab %}}

{{< /tabpane >}}

## Accessing propagated history

Inside a child workflow or activity, call `GetPropagatedHistory()` (Go / .NET) or `get_propagated_history()` (Python). It returns the propagated history if the caller opted in, or `None` / `nil` if it didn't.

What you get back is a point-in-time snapshot of the caller's execution *at the moment it scheduled this call* — the steps that had already run, not anything the caller does afterward. In the `MerchantCheckout` parent above, `ValidateMerchant` completed before the child workflow was scheduled, so it appears in the propagated history the child receives.

The example below assumes the parent workflow shown above is registered as `MerchantCheckout` with an activity `ValidateMerchant` and a child workflow `ProcessPayment` (called with `Lineage`).

{{< tabpane text=true >}}

{{% tab header="Python" %}}

```python
import dapr.ext.workflow as wf

@wfr.workflow(name='FraudDetection')
def fraud_detection(ctx: wf.DaprWorkflowContext, order_json: str):
    history = ctx.get_propagated_history()
    if history is None:
        return 'no upstream history'

    # Logs once instead of repeatedly during replays — not required, just keeps logging clean.
    if not ctx.is_replaying:
        print(f'scope={history.scope}, workflows={[w.name for w in history.get_workflows()]}')

    try:
        merchant_wf = history.get_last_workflow_by_name('MerchantCheckout')
        validation = merchant_wf.get_last_activity_by_name('ValidateMerchant')
    except wf.PropagationNotFoundError as exc:
        return f'missing required upstream step: {exc}'

    if not validation.completed:
        return 'merchant validation did not complete, rejecting'
    return 'approved'
```

{{% /tab %}}

{{% tab header=".NET" %}}

```csharp
using Dapr.Workflow;

public sealed class FraudDetectionWorkflow : Workflow<Order, string>
{
    public override Task<string> RunAsync(WorkflowContext ctx, Order order)
    {
        var history = ctx.GetPropagatedHistory();
        if (history is null)
            return Task.FromResult("no upstream history");

        // Logs once instead of repeatedly during replays — not required, just keeps logging clean.
        if (!ctx.IsReplaying)
            Console.WriteLine($"received {history.Events.Count} ancestor workflow event(s)");

        // Verify MerchantCheckout is present in the ancestor chain.
        if (!history.TryGetLastWorkflowEventByName(nameof(MerchantCheckoutWorkflow), out _))
            return Task.FromResult("MerchantCheckout missing from propagated history, rejecting");

        return Task.FromResult("approved");
    }
}
```

{{% /tab %}}

{{% tab header="Go" %}}

```go
import (
    "fmt"

    "github.com/dapr/durabletask-go/workflow"
)

func FraudDetection(ctx *workflow.WorkflowContext) (any, error) {
    propagatedHistory := ctx.GetPropagatedHistory()
    if propagatedHistory == nil {
        return "no upstream history", nil
    }

    // The history exposes both raw events and per-app/per-instance chunks.
    fmt.Printf("scope: %s, %d events from apps %v\n",
        propagatedHistory.Scope(), len(propagatedHistory.Events()), propagatedHistory.GetAppIDs())

    // Drill into a specific upstream workflow's activities.
    merchantWf, err := propagatedHistory.GetLastWorkflowByName("MerchantCheckout")
    if err != nil {
        return nil, fmt.Errorf("expected MerchantCheckout in propagated history: %w", err)
    }
    validation, err := merchantWf.GetLastActivityByName("ValidateMerchant")
    if err != nil {
        return nil, fmt.Errorf("expected ValidateMerchant in propagated history: %w", err)
    }
    if !validation.Completed {
        return "merchant validation didn't complete, rejecting", nil
    }
    return "approved", nil
}
```

{{% /tab %}}

{{< /tabpane >}}

Every SDK gives you the same underlying model — an execution-ordered chain of ancestor workflows, each carrying its identity (app ID, instance ID, name) plus the activities and child workflows it ran. From the returned object you can:

- **List the ancestor chain** — one entry per ancestor workflow, in execution order.
- **Look up an ancestor workflow by name** — either the most-recent match or all matches.
- **Look up activities or child workflows within an entry** by name, with the same pattern.
- **See which apps contributed** to the chain (deduplicated).
- **Read the propagation scope** the parent chose (`LINEAGE` or `OWN_HISTORY`), where the SDK exposes it on the receiver.

For exact method signatures in each language see the runnable examples linked under [Related links](#related-links).

## History propagation in multi-app workflows

When a parent workflow in App A calls a child workflow in App B using multi-app workflow calling, the propagated context travels across the network between the two sidecars. Two things secure that hop: the channel it travels over, and the signature on the context itself.

### Transport security (mTLS)

The propagated context rides the inter-sidecar gRPC channel, so it inherits whatever protects that channel. When Dapr runs with mTLS — the default for Helm and `dapr init -k` — that traffic is encrypted and the two sidecars are mutually authenticated, so the context can't be read or injected by anything sitting between App A and App B. mTLS is also the prerequisite for signing below: the SPIFFE X.509 identity it provides is the key the producer signs with.

### Workflow history signing

mTLS protects the context in transit, but says nothing about whether the contents are authentic once they arrive. Signing closes that gap. With the `WorkflowHistorySigning` `Configuration` feature enabled, the producing app signs each propagated chunk with its SPIFFE identity, and the receiver can cryptographically verify the chunk wasn't tampered with after it left the producer. For the full mechanism — how signatures are chained, stored, and verified on load — see [Workflow history signing]({{% ref "workflow-history-signing.md" %}}).

If `WorkflowHistorySigning` is not enabled, daprd logs a warning per dispatch:

> `propagating unsigned workflow history to child workflow '...' (signing is not configured; context cannot be cryptographically verified by the receiver)`

{{% alert title="Treat unsigned chunks as untrusted" color="warning" %}}
Without signing, propagated context is functional but not cryptographically verifiable. Don't treat unsigned propagated history as authoritative for high-value decisions (payments, approvals). Enable `WorkflowHistorySigning` for production deployments that depend on chain-of-custody.
{{% /alert %}}

## ContinueAsNew and rerun

Propagated history is correctly maintained with both `ContinueAsNew` and `Rerun` workflow operations. 

- A workflow that received propagated history and calls `ContinueAsNew` passes the same incoming context to its next generation.
- Re-running a workflow re-issues activity / child-workflow calls with the same propagation scope they were originally scheduled with — `LINEAGE` stays `LINEAGE`, `OWN_HISTORY` stays `OWN_HISTORY`.

This makes long-running agents and crash-recovery scenarios behave the way you'd expect: the receiving generation/rerun sees the same history the original run did.

## Next steps

Discover [how to apply workflow history signing]({{% ref "workflow-history-signing.md" %}}) to cryptographically attest the validity of a previous workflow or activity step.

{{< button text="Workflow patterns >>" page="workflow-patterns.md" >}}

## Related links

- [Workflow history signing]({{< ref workflow-history-signing.md >}})
- [Workflow overview]({{< ref workflow-overview.md >}})
- [Workflow features and concepts]({{< ref workflow-features-concepts.md >}})
- [Workflow architecture]({{< ref workflow-architecture.md >}})
- [How to author a workflow]({{< ref howto-author-workflow.md >}})
- [Workflow API reference]({{< ref workflow_api.md >}})
- Try out the example code in each SDK:
  - [Python example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/history_propagation.py)
  - [.NET quickstart](https://github.com/dapr/quickstarts/tree/master/workflows/csharp/sdk-context-propagation)
  - [Go example](https://github.com/dapr/go-sdk/tree/main/examples/workflow-history-propagation)
