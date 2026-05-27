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
- **AI agents and long-running orchestrations** — agents that loop with `ContinueAsNew` or fan out to sub-agents can carry context (tool calls, model outputs, intermediate decisions) forward without re-prompting from scratch.

## Propagation scopes

Two scopes are exposed. The default is no propagation.

| Option helper | Scope value on `propagatedHistory.Scope()` | What gets sent | When to use it |
| ------------- | --------------------------- | -------------- | -------------- |
| `workflow.PropagateLineage()` | `LINEAGE` (`HISTORY_PROPAGATION_SCOPE_LINEAGE`) | Caller's own events plus the full ancestor chain inherited from the caller's own parent | Full chain-of-custody, downstream wants to see everything that happened before, all the way to the root |
| `workflow.PropagateOwnHistory()` | `OWN_HISTORY` (`HISTORY_PROPAGATION_SCOPE_OWN_HISTORY`) | Caller's own events only, ancestral lineage is dropped | Trust boundary — the caller is willing to vouch for what *it* did but the receiver shouldn't see further upstream |

The helpers (`PropagateLineage` / `PropagateOwnHistory`) are what you pass when scheduling. The scope values (`LINEAGE` / `OWN_HISTORY`) are what `propagatedHistory.Scope()` returns on the receiver — they're the same thing.

`PropagateOwnHistory` is the trust boundary: choosing it tells the runtime to stop forwarding any history the caller itself received. This is the right choice when the receiver is a less-trusted app, a third party, or operates under different compliance rules.

## Setting it up

A parent opts a single child workflow or activity into propagation via a per-call option. Other calls in the same workflow are unaffected. The default is no propagation.

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
        return await ctx.CallChildWorkflowAsync<string>(
            nameof(ProcessPaymentWorkflow),
            order,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));
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

    if not ctx.is_replaying:
        print(f'scope={history.scope}, workflows={[w.name for w in history.get_workflows()]}')

    try:
        merchant_wf = history.get_workflow_by_name('MerchantCheckout')
        validation = merchant_wf.get_activity_by_name('ValidateMerchant')
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

        if (!ctx.IsReplaying)
            Console.WriteLine($"received {history.Entries.Count} workflow segment(s)");

        // Verify MerchantCheckout is present in the ancestor chain.
        var merchant = history.FilterByWorkflowName(nameof(MerchantCheckoutWorkflow));
        if (merchant.Entries.Count == 0)
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
    merchantWf, err := propagatedHistory.GetWorkflowByName("MerchantCheckout")
    if err != nil {
        return nil, fmt.Errorf("expected MerchantCheckout in propagated history: %w", err)
    }
    validation, err := merchantWf.GetActivityByName("ValidateMerchant")
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

For all SDKs the returned `propagated-history`object exposes the same properties:

- **Events** — A list of upstream history events in order
- **Scope** — which scope the parent chose (`OWN_HISTORY` or `LINEAGE`)
- **Per-workflow entries** — one entry per ancestor workflow, each tagged with that workflow's app ID, name, instance ID, and the index range of events it covers
- **App IDs** — deduplicated list of every app that contributed events to the chain
- **Filters** — convenience accessors to find an entry by workflow name, or events by app / instance / workflow name. Drilling into an entry lets you look up the specific activities or child workflows the upstream workflow ran

Exact method names differ by SDK (`GetWorkflowByName` in Go and .NET, `get_workflow_by_name` in Python; `WorkflowResult` vs `Entries`; etc.) — see the per-SDK docs for the precise surface.

## History propagation in multi-app workflows

When a parent workflow in App A calls a child workflow in App B using multi-app workflow calling, the propagated contexts travels between applications. In this usage there are two security settings:

- **mTLS** — when Dapr is deployed with mTLS (the default for Helm / `dapr init -k`), inter-sidecar traffic is encrypted and authenticated.
- **`WorkflowHistorySigning`** — an opt-in `Configuration` feature that signs each propagated chunk with the producing app's SPIFFE identity. Receivers can verify chunks weren't tampered with after they left the producer.

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

{{< button text="Workflow patterns >>" page="workflow-patterns.md" >}}

## Related links

- [Workflow overview]({{< ref workflow-overview.md >}})
- [Workflow features and concepts]({{< ref workflow-features-concepts.md >}})
- [Workflow architecture]({{< ref workflow-architecture.md >}})
- [How to author a workflow]({{< ref howto-author-workflow.md >}})
- [Workflow API reference]({{< ref workflow_api.md >}})
- Try out the example code in each SDK:
  - [Python example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/history_propagation.py)
  - [.NET quickstart](https://github.com/dapr/quickstarts/tree/master/workflows/csharp/sdk-context-propagation)
  - [Go example](https://github.com/dapr/go-sdk/tree/main/examples/workflow-history-propagation)
