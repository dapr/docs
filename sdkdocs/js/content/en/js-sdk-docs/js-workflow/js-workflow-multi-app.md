---
type: docs
title: "Multi-app workflows and history propagation in the JavaScript SDK"
linkTitle: "Multi-app workflows and history"
weight: 1200
description: Coordinate remote activities, child workflows, and detached workflows and inspect ancestor history
---

Use `targetAppId` to route activity and workflow calls to another Dapr application. This guide uses
`@dapr/dapr` **3.19.0-rc.4 or later** and Dapr runtime **1.19 or later**.
See [Multi Application Workflows]({{% ref workflow-multi-app.md %}}) for runtime architecture and constraints.

## Requirements

Participating apps must run in the same namespace and use the same workflow actor state store. Each destination
must register the name being called and run a workflow worker. Omit `targetAppId` for a local call.
For cross-language calls, agree on names, input/output schemas, and serialization.

## Call an activity or child workflow

```javascript
import { HistoryPropagationScope } from "@dapr/dapr";

function* orderWorkflow(ctx, order) {
  const payment = yield ctx.callActivity("chargePayment", order, {
    targetAppId: "payments",
    retryPolicy: { firstRetryInterval: 2, maxNumberOfAttempts: 3 },
    propagationScope: HistoryPropagationScope.OWN_HISTORY,
  });

  return yield ctx.callChildWorkflow(
    "fulfillmentWorkflow",
    { order, payment },
    undefined,
    {
      targetAppId: "fulfillment",
      propagationScope: HistoryPropagationScope.LINEAGE,
    },
  );
}
```

An activity call returns the activity result; a child call waits for the child and returns its output.
Failures are thrown at the corresponding `yield`. `callSubWorkflow` is an alias of `callChildWorkflow`.
The positional child arguments are `(workflow, input?, instanceId?, options?)`; omit the child ID to let the
SDK derive it. A retry policy can retry a child workflow as well as an activity. A custom child ID applies
to the first attempt; later retry attempts receive generated child IDs.

## Schedule an independent, detached workflow

Detached workflows require Dapr runtime **1.19 or later**:

```javascript
function* dispatchWorkflow(ctx, input) {
  const startAt = new Date(ctx.getCurrentUtcDateTime().getTime() + 60_000);
  const detachedId = yield ctx.scheduleNewDetachedWorkflow(
    "notificationWorkflow",
    input,
    undefined,
    startAt,
    { targetAppId: "notifications" },
  );
  return { detachedId };
}
```

The task returns the detached workflow's **instance ID**, not its output. The workflow runs independently:
its completion or failure does not flow back to the caller. Use a client to inspect the returned ID through
the destination app's sidecar. The arguments are `(workflow, input?, instanceId?, startAt?, options?)`.
Detached options support `targetAppId` and `allowPayloadReferences`, but **not retries or history propagation**.
Always yield the scheduling task so the workflow can record the scheduling action.

## Inspect propagated history

Activity and child-workflow options accept:

| `HistoryPropagationScope` | History shared with the callee |
| --- | --- |
| `NONE` | No history propagation; the default. |
| `OWN_HISTORY` | The calling workflow's own history. |
| `LINEAGE` | The caller's history together with its inherited ancestor history. |

From a workflow or activity, call `ctx.getPropagatedHistory()`. It returns `undefined` when no history was
supplied, otherwise a read-only `PropagatedHistoryView`:

```javascript
async function auditActivity(ctx, input) {
  const history = ctx.getPropagatedHistory();
  if (history) {
    console.log(history.appIDs);
    for (const ancestor of history.workflows) {
      console.log(ancestor.workflowName, ancestor.instanceId, ancestor.eventCount);
    }
  }
  return input;
}
```

| Member | Meaning |
| --- | --- |
| `scope`, `chunks` | Requested scope and ancestor chunks, oldest ancestor first and immediate parent last. |
| `events`, `appIDs` | Flattened events and distinct app IDs across chunks. |
| `workflows` | Chunks with `startEventIndex` and `eventCount` in the flattened view. |
| `getWorkflowByName(name)` | Oldest matching ancestor, or `null`. |
| `getEventsByAppID(id)`, `getEventsByInstanceID(id)` | Events matching an app or instance. |
| `getEventsByWorkflowName(name)` | Events from every matching workflow instance, not just the first match. |

Each chunk contains `appId`, `instanceId`, `workflowName`, decoded `events`, and original `rawEvents`,
`rawSignatures`, and `signingCertChains`. The SDK preserves these bytes but **does not verify signatures**.
Do not treat this view as SDK-verified evidence. Payloads in history remain serialized; reference envelopes
are not automatically resolved in this view.

History propagation increases data transferred to callees and can expose ancestor inputs, outputs, and
events. Select the narrowest scope needed. This is distinct from the unsupported stateful workflow client.

## Cross-app data references

With [binary-store payload support]({{% ref js-workflow-data-references.md %}}), cross-app activity, child,
and detached workflow inputs are **inline by default**. Set `allowPayloadReferences: true` only when the
destination understands the reference contract and can access the same stored objects.

The JavaScript SDK shares the version-1 reference envelope with the .NET SDK. Interoperation requires
compatible serializers, contracts, and storage access; JavaScript does not implement .NET payload-stage
reversal. Inlining only applies to the **top-level call input**: results, events, nested references, and
propagated history are not made compatible by that default. See
[cross-app reference handling]({{% ref js-workflow-data-references.md %}}#cross-app-and-cross-language-calls)
before enabling offloading in a multi-app topology.
