---
type: docs
title: "Workflow history propagation"
linkTitle: "History propagation"
weight: 2500
description: "Share a parent workflow's execution history with child workflows and activities for chain-of-custody, audit, and AI-agent context"
---

By default, a child workflow or activity only sees the input it was scheduled with. The parent's execution history — what activities ran, what child workflows it spawned, what events it observed — is invisible. Workflow history propagation lets a parent opt-in to share that history with the work it schedules.

This is useful for:

- **Chain-of-custody and audit** — a fraud check, compliance gate, or settlement step can verify what already happened upstream rather than trusting the caller's claims.
- **Cross-app workflows** — a downstream app, often owned by a different team, can confirm an upstream activity ran without an out-of-band query.
- **AI agents and long-running orchestrations** — agents that loop with `ContinueAsNew` or fan out to sub-agents can carry context (tool calls, model outputs, intermediate decisions) forward without re-prompting from scratch.

## Propagation scopes

Two scopes are exposed. The default is no propagation.

| Scope | What gets sent                                                                          | When to use it                                                                                                    |
| ----- |-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `PropagateLineage` | Caller's own events plus the full ancestor chain inherited from the caller's own parent | Full chain-of-custody, downstream wants to see everything that happened before, all the way to the root           |
| `PropagateOwnHistory` | Caller's own events only, ancestral lineage is dropped                              | Trust boundary — the caller is willing to vouch for what *it* did but the receiver shouldn't see further upstream |

`PropagateOwnHistory` is the trust boundary: choosing it tells the runtime to stop forwarding any history the caller itself received. This is the right choice when the receiver is a less-trusted app, a third party, or operates under different compliance rules.

## Setting it up

A parent opts a single `CallActivity` or `CallChildWorkflow` into propagation via the `WithHistoryPropagation` option. Other activity / child calls in the same workflow are unaffected.

```go
import (
    "github.com/dapr/durabletask-go/api"
    "github.com/dapr/durabletask-go/task"
)

func ParentWorkflow(ctx *workflow.WorkflowContext) (any, error) {
    // Activity does NOT receive propagated history (default).
    if err := ctx.CallActivity("validateMerchant").Await(nil); err != nil {
        return nil, err
    }

    // Child workflow DOES receive parent's history (LINEAGE).
    var result string
    if err := ctx.CallChildWorkflow("processPayment",
        task.WithHistoryPropagation(api.PropagateLineage()),
    ).Await(&result); err != nil {
        return nil, err
    }
    return result, nil
}
```

## Receiving propagated history

Inside a child workflow or activity, call `ctx.GetPropagatedHistory()`. It returns the propagated history if the caller opted in, or `nil` if it didn't.

```go
func FraudCheck(ctx *workflow.WorkflowContext) (any, error) {
    ph := ctx.GetPropagatedHistory()
    if ph == nil {
        return "no upstream history", nil
    }

    // The history exposes both raw events and per-app/per-instance chunks.
    fmt.Printf("scope: %s, %d events from apps %v\n",
        ph.Scope(), len(ph.Events()), ph.GetAppIDs())

    // Drill into a specific upstream workflow's activities:
    merchantWf, err := ph.GetWorkflowByName("MerchantCheckout")
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

The returned `PropagatedHistory` carries:

- `Events()` — the flat list of upstream `HistoryEvent`s in order
- `Scope()` — which scope the parent chose (`OWN_HISTORY` or `LINEAGE`)
- `GetWorkflows()` — per-workflow chunks (each is a `WorkflowResult` tagged with `appId`, `workflowName`, `instanceId`, `startEventIndex`, `eventCount`)
- `GetAppIDs()` — deduplicated list of every app that contributed events
- Top-level filters: `GetWorkflowByName(name)`, `GetWorkflowsByName(name)`, `GetEventsByAppID(appID)`, `GetEventsByInstanceID(id)`, `GetEventsByWorkflowName(name)`

Each `WorkflowResult` further exposes:

- `GetActivityByName(name)` / `GetActivitiesByName(name)` — find activities the upstream workflow ran. Returns an `ActivityResult` with `Completed bool` and the result payload.
- `GetChildWorkflowByName(name)` / `GetChildWorkflowsByName(name)` — find child workflows the upstream workflow scheduled.

The singular `*ByName` methods return `ErrPropagationNotFound` when no match exists, the plural variants return an empty slice.

## Cross-app workflows

When a parent workflow in App A calls a child workflow in App B, the propagated chunks travel between sidecars. Two security knobs apply:

- **mTLS** — when Dapr is deployed with mTLS (the default for Helm / `dapr init -k`), inter-sidecar traffic is encrypted and authenticated.
- **`WorkflowHistorySigning`** — an opt-in `Configuration` feature that signs each propagated chunk with the producing app's SPIFFE identity. Receivers can verify chunks weren't tampered with after they left the producer.

If `WorkflowHistorySigning` is not enabled, daprd logs a warning per dispatch:

> `propagating unsigned workflow history to child workflow '...' (signing is not configured; chunks cannot be cryptographically verified by the receiver)`

{{% alert title="Treat unsigned chunks as untrusted" color="warning" %}}
Without signing, propagated chunks are functional but not cryptographically verifiable. Don't treat unsigned propagated history as authoritative for high-value decisions (payments, approvals). Enable `WorkflowHistorySigning` for production deployments that depend on chain-of-custody.
{{% /alert %}}

## ContinueAsNew and rerun

Propagated history flows correctly through both `ContinueAsNew` and rerun:

- A workflow that received propagated history and calls `ContinueAsNew` passes the same incoming chunks to its next generation.
- Rerunning a workflow re-issues activity / child-workflow calls with the same propagation scope they were originally scheduled with — `LINEAGE` stays `LINEAGE`, `OWN_HISTORY` stays `OWN_HISTORY`.

This makes long-running agents and crash-recovery scenarios behave the way you'd expect: the receiving generation/rerun sees the same history the original run did.

## Next steps

{{< button text="Workflow patterns >>" page="workflow-patterns.md" >}}

## Related links

- [Workflow overview]({{< ref workflow-overview.md >}})
- [Workflow features and concepts]({{< ref workflow-features-concepts.md >}})
- [Workflow architecture]({{< ref workflow-architecture.md >}})
- [How to author a workflow]({{< ref howto-author-workflow.md >}})
- [Workflow API reference]({{< ref workflow_api.md >}})
- Try out the full SDK example:
  - [Go example](https://github.com/dapr/go-sdk/tree/main/examples/workflow-history-propagation)
