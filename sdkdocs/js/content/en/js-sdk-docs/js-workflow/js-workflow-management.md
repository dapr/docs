---
type: docs
title: "Manage workflow instances with the JavaScript SDK"
linkTitle: "Manage workflow instances"
weight: 1100
description: Schedule, inspect, control, list, and rerun workflow instances with DaprWorkflowClient
---

Use `DaprWorkflowClient` from application or administrative code, not inside a workflow generator.
This guide targets `@dapr/dapr` **3.19.0 or later** and runtime **1.19 or later**.

```javascript
import { DaprWorkflowClient, WorkflowRuntimeStatus } from "@dapr/dapr";

const client = new DaprWorkflowClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
});
```

The following snippets reuse `client`. The workflow name must be registered on the destination worker.
Call `await client.stop()` when the application shuts down.

## Choose the management client

`DaprWorkflowClient` is separate from `DaprClient.workflow`, the
[basic workflow API]({{% ref "developing-applications/sdks/js/js-client/_index.md" %}}#workflow-api).
The basic API supports HTTP or gRPC with `scheduleNewWorkflow`, `getWorkflowState`, `raiseEvent`, `pause`,
`resume`, `terminate`, and `purge`. Its old `start`, `get`, and `raise` names are deprecated aliases.
It returns a plain `WorkflowGetResponseType` with `properties`, rather than the `WorkflowState` described here.

Use `DaprWorkflowClient` for durable start/completion waits, listing, history retrieval, reruns, and integrated
payload-reference handling. Its methods and options are not interchangeable with the basic API:
for example, it uses `suspendWorkflow` rather than `pause`, and `getWorkflowState` requires the
`getInputsAndOutputs` argument.

## Schedule and wait

```javascript
const instanceId = await client.scheduleNewWorkflow(
  "orderWorkflow",
  { orderId: "order-123" },
  "order-123",
  new Date(Date.now() + 60_000),
);

await client.waitForWorkflowStart(instanceId, false, 120);
const state = await client.waitForWorkflowCompletion(instanceId, true, 300);
if (!state) throw new Error(`Workflow ${instanceId} was not found`);

if (state.runtimeStatus === WorkflowRuntimeStatus.COMPLETED) {
  console.log(state.getOutput());
} else {
  console.error(state.runtimeStatus, state.workflowFailureDetails);
}
```

The positional scheduling arguments are `(workflow, input?, instanceId?, startAt?, signal?)`.
`workflow` can be a registered name or a function; omitted instance IDs are generated. `startAt` is an optional
absolute `Date`. Using wall-clock time here is safe because this is client code, not replayed workflow code.

Both wait methods accept `(instanceId, fetchPayloads = true, timeoutInSeconds = 60, signal?)`.
A wait deadline or RPC failure rejects the promise. A workflow that reaches a failed or terminated state
can return a state rather than throw: check `runtimeStatus`, not just whether the wait resolved.

## Inspect state and failure details

`await client.getWorkflowState(instanceId, true)` returns a `WorkflowState` snapshot, or `undefined` for a
missing instance. Pass `false` to omit inputs and outputs when only metadata is needed.

| Member | Meaning |
| --- | --- |
| `name`, `instanceId`, `exists` | Registration name, instance ID, and existence (`true` for a returned state). |
| `runtimeStatus` | Compare with `WorkflowRuntimeStatus.RUNNING`, `COMPLETED`, `CONTINUED_AS_NEW`, `FAILED`, `CANCELED`, `TERMINATED`, `PENDING`, `SUSPENDED`, or `STALLED`. |
| `createdAt`, `lastUpdatedAt` | JavaScript `Date` values. |
| `getInput()`, `getOutput()`, `getCustomStatus()` | Deserialize with the client's configured serializer; TypeScript callers can provide a generic result type. |
| `serializedInput`, `serializedOutput`, `customStatus` | Serialized strings, not already-parsed objects. With payload support, resolved strings are prepared where possible. |
| `workflowFailureDetails` | `getErrorType()`, `getErrorMessage()`, `getStackTrace()`, `isNonRetriable`, and `getInnerFailure()` for nested details. `innerFailure` exposes the raw nested protobuf value. |
| `getInputReference()`, `getOutputReference()`, `getCustomStatusReference()` | Original top-level binary-store reference, if present. See [data references]({{% ref js-workflow-data-references.md %}}#read-client-results). |

Typed getters do not validate application schemas or reconstruct class instances automatically. Missing payload
fields return `undefined`. Missing binary-store objects or integrity failures are errors, not "workflow not found."

## Send events and control execution

| Method | Behavior |
| --- | --- |
| `raiseEvent(id, eventName, payload?, signal?)` | Deliver an event to a workflow's durable event wait. |
| `suspendWorkflow(id, reason?, signal?)` | Suspend instance execution. |
| `resumeWorkflow(id, reason?, signal?)` | Resume a suspended instance. |
| `terminateWorkflow(id, output?, signal?)` | Request termination with optional output; does not execute application compensation logic. |
| `purgeWorkflow(id, signal?)` | Purge retained instance state/history; returns whether an instance was deleted. Subject to runtime eligibility checks. |

For example:

```javascript
await client.suspendWorkflow(instanceId, "Investigating an order");
await client.resumeWorkflow(instanceId, "Investigation complete");
await client.raiseEvent(instanceId, "approval", { approved: true });
```

Do not use suspension or termination as a way to undo activity side effects. A canceled client request also
does not terminate the instance. Purging history does **not** delete binary-store payloads.

### Cancel client requests

Scheduling, state reads, waits, event delivery, suspend/resume, termination, and purge accept an optional
`AbortSignal` in their final argument:

```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);
try {
  await client.waitForWorkflowCompletion(instanceId, true, 60, controller.signal);
} finally {
  clearTimeout(timeout);
}
```

Aborting stops the request and associated payload I/O where supported, not the durable workflow. A request
may already have been accepted by the runtime before cancellation. Listing, history retrieval, and rerun
do not expose an `AbortSignal` parameter in this release.

## List instances

`listWorkflowInstanceIds(continuationToken?, pageSize?)` returns `{ instanceIds, continuationToken }`.
Continue until no token remains:

```javascript
let token;
do {
  const page = await client.listWorkflowInstanceIds(token, 100);
  for (const id of page.instanceIds) {
    console.log(id);
  }
  token = page.continuationToken;
} while (token);
```

The SDK validates `pageSize` as an integer from `1` to `4294967295`; the runtime may impose additional limits.
The response contains IDs, not state snapshots or filtered query results.

## Retrieve execution history

```javascript
const history = await client.getWorkflowHistory(instanceId);
for (const event of history) {
  console.log(event.eventId, event.eventType.case);
}
```

This returns the complete `HistoryEvent[]` using the SDK's protobuf types. Payload fields remain serialized
wire data, including any reference envelopes; retrieving history is not automatic payload hydration.
Missing-instance and other runtime errors are propagated.

## Rerun from an event

Inspect the source history to choose the event ID accepted by the runtime, then create a new instance:

```javascript
const rerunId = await client.rerunWorkflowFromEvent(instanceId, eventId, {
  newInstanceId: "order-123-rerun",
  input: { correctedAmount: 125 },
});
```

`eventId` is a history event ID, **not** the array index, and must be an unsigned 32-bit integer. This operation
creates a new instance; it does not modify the source instance. Replacement `input` applies to the
**activity targeted by the event**, not the original workflow input.

`newInstanceId` is optional but must not be empty. `overwriteInput` defaults to `true` when `input` is supplied;
set it to `false` to preserve the original activity input. The runtime decides which histories and events are
eligible and propagates errors for missing instances or invalid events. Reruns can repeat side effects:
review idempotency and retain any binary objects still referenced by the copied history.

## Next steps

- [Author workflows]({{% ref js-workflow-authoring.md %}})
- [Retain and clean up stored payloads]({{% ref js-workflow-data-references.md %}}#retention-and-cleanup)
