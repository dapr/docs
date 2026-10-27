---
type: docs
title: "Workflow data references in the JavaScript SDK"
linkTitle: "Data references (alpha)"
weight: 1500
description: Offload large workflow payloads to a binary store and defer materialization with explicit references
---

Workflow data references keep large payloads out of inline workflow history. The JavaScript SDK stores the
serialized value in a Dapr binary store and records a small, versioned reference envelope instead. You can
keep ordinary workflow inputs and let the SDK retrieve data automatically, or forward explicit
`PayloadReference` values without downloading the document in the workflow.

{{% alert title="Alpha feature" color="warning" %}}
The binary-store building block and this SDK integration are alpha and subject to change.
These APIs require **`@dapr/dapr` 3.19.0 or later**, Dapr runtime **1.19 or later**, and a binary-store
component in addition to the normal workflow infrastructure.
{{% /alert %}}

## Choose how to handle payloads

| Approach | Behavior | Best for |
| --- | --- | --- |
| Inline (default) | Serialized values travel in workflow history. No binary-store access is required. | Small payloads. |
| Automatic offloading | `PreferReference` stores eligible large values. Ordinary input/result contracts trigger automatic download and deserialization. | Reducing history size while preserving existing application contracts. |
| Explicit references | Register reference inputs and request reference results; forward envelopes without downloading the data. Resolve or stream only where needed. | Workflows that coordinate large documents but do not inspect their contents. |

### Performance and memory tradeoffs

Offloading replaces repeated large history values with small references, reducing history storage and
workflow protocol traffic. It does not make storage I/O free:

- **Automatic offloading still materializes values.** An ordinary workflow input, activity result, or event
  must be downloaded and deserialized when consumed. Replays repeat those reads; the cache is scoped to
  a single orchestrator execution, not shared across replays.
- **Explicit references avoid unnecessary reads.** A workflow can pass the same reference through several
  activities without loading the document itself. Only consumers that need the content resolve or stream it.
- **Streaming avoids full buffering.** It trades the convenience of a deserialized object for incremental
  access to the raw serialized bytes.

For a document of size `S` forwarded through multiple steps, inline history repeatedly carries data on the
order of `S`; reference-based history repeatedly carries the much smaller envelope. This is a traffic model,
not a JavaScript latency or allocation benchmark. Actual performance depends on document size, replay
frequency, store latency, and how many consumers materialize the data. Small values may be faster inline.
Do not apply the [.NET benchmark results]({{% ref dotnet-workflow-data-references.md %}}#benchmark-comparison)
to JavaScript; measure your own workload.

## Set up payload support

### Configure a binary-store component

For a disposable local experiment, save this as `components\workflow-payloads.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: workflow-payloads
spec:
  type: binarystore.in-memory
  version: v1
  metadata:
    - name: maxSize
      value: "4Mi"
    - name: maxTotalSize
      value: "512Mi"
```

{{% alert title="In-memory storage is for experiments only" color="warning" %}}
In-memory payloads disappear when the sidecar stops and are not shared between sidecars. Durable workflow
history can outlive those objects and become unreadable. Use durable binary storage for workflows that must
survive restarts, and retain objects for as long as histories or downstream consumers reference them.
{{% /alert %}}

See the [binary-store guide]({{% ref js-binarystore-howto.md %}}) for component and transport details.
Adding a component alone does not enable workflow offloading.

### Register a resolver on clients and workers

```javascript
import {
  BinaryStoreWorkflowPayloadResolver,
  CommunicationProtocolEnum,
  DaprClient,
  DaprWorkflowClient,
  PayloadWritePreference,
  WorkflowRuntime,
} from "@dapr/dapr";

const connection = { daprHost: "127.0.0.1", daprPort: "50001" };
const dapr = new DaprClient({
  ...connection,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});
const payloads = new BinaryStoreWorkflowPayloadResolver(dapr.binaryStore, {
  storeName: "workflow-payloads",
  writePreference: PayloadWritePreference.PreferReference,
  offloadThreshold: 64 * 1024,
});
const client = new DaprWorkflowClient({ ...connection, payloads });
const runtime = new WorkflowRuntime({ ...connection, payloads });
```

The resolver uses `DaprClient.binaryStore`, which supports HTTP or gRPC; the workflow transport itself
still uses gRPC. Configure endpoints and API tokens consistently if the clients connect to different endpoints.
`storeName` must match the component name. All readers need access to the referenced store/key and compatible
serialization. Merely constructing a resolver uses `Preserve`, not automatic offloading; the example
explicitly selects `PreferReference`.

## Use automatic offloading

With the registration above, keep ordinary inputs:

```javascript
function* documentWorkflow(ctx, document) {
  return yield ctx.callActivity("measureDocument", document);
}

async function measureDocument(_ctx, document) {
  return document.content.length;
}

runtime.registerWorkflow(documentWorkflow).registerActivity(measureDocument);

try {
  await runtime.start();
  const id = await client.scheduleNewWorkflow(documentWorkflow, {
    content: "a".repeat(128 * 1024),
  });
  const state = await client.waitForWorkflowCompletion(id, true, 60);
  console.log(state?.getOutput());
} finally {
  await runtime.stop();
  await client.stop();
  await dapr.stop();
}
```

Combine this snippet with the imports and resolver setup above in `app.mjs`, then run:

```sh
dapr run --app-id document-workflow --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```

The document exceeds the threshold and is offloaded at eligible boundaries. The workflow still receives an
ordinary object and downloads it on replay; the small numeric result stays inline.

## Pass explicit references

JavaScript types are erased at runtime. A TypeScript annotation such as `PayloadReference<DocumentPayload>`
alone does **not** change how inputs are read. Register each workflow and activity that accepts an envelope
with **`{ inputAsReference: true }`**.

Use this alternative to the automatic example, with the same resolver setup:

```javascript
function* referenceWorkflow(ctx, documentReference) {
  return yield ctx.callActivity("measureReference", documentReference);
}

async function measureReference(ctx, documentReference) {
  const document = await ctx.payloads.resolve(documentReference);
  return document.content.length;
}

runtime
  .registerWorkflow(referenceWorkflow, { inputAsReference: true })
  .registerActivity(measureReference, { inputAsReference: true });

try {
  await runtime.start();
  const instanceId = "document-reference-1";
  const reference = await payloads.store(
    { content: "a".repeat(128 * 1024) },
    instanceId,
  );
  await client.scheduleNewWorkflow(referenceWorkflow, reference, instanceId);
  const state = await client.waitForWorkflowCompletion(instanceId, true, 60);
  console.log(state?.getOutput());
} finally {
  await runtime.stop();
  await client.stop();
  await dapr.stop();
}
```

`store(value, instanceId, signal?)` explicitly stores the serialized value, independently of the automatic
threshold or write preference. The workflow only forwards its reference; the activity downloads the document.
A reference-input contract rejects an inline value instead of silently storing or converting it.

### Keep activity and child results as references

Activities can return a reference created by `ctx.payloads.store(value, ctx.getWorkflowInstanceId())`.
Request `resultAsReference: true` on `ctx.callActivity` or `ctx.callChildWorkflow` to receive that reference
without automatically resolving it:

```javascript
function* documentPipeline(ctx, input) {
  const reference = yield ctx.callActivity("createDocument", input, {
    resultAsReference: true,
  });
  return yield ctx.callActivity("measureReference", reference);
}
```

The producing activity must actually return a reference, or its result must be offloaded by policy.
An inline result fails a reference-result contract, including a small result below the offload threshold.
`resultAsReference` does not force a write. Forward `PayloadReference` objects directly, not a plain object
containing one: nested references are not recursively converted or resolved.

### Resolve inside a workflow only when necessary

`ctx.hasPayloadResolver()` reports whether payload support is configured.
`yield ctx.resolvePayload(reference)` downloads and deserializes the data through an SDK task.
`yield ctx.openPayload(reference)` obtains a raw Node.js readable stream; consuming it asynchronously requires
an async generator. These read-only APIs are supported, but repeat during replay and sacrifice the principal
benefit of keeping the document out of the orchestrator. Prefer resolving or streaming in activities.
Do not perform arbitrary storage writes from workflow code.

## Stream payloads in activities

`ctx.payloads.open(reference, signal?)` returns a Node.js `Readable` over the raw stored UTF-8 serialized bytes.
It does not deserialize the document:

```javascript
async function countStoredBytes(ctx, reference) {
  const stream = ctx.payloads.open(reference);
  let bytes = 0;
  try {
    for await (const chunk of stream) {
      bytes += chunk.length;
    }
  } finally {
    stream.destroy();
  }
  return bytes;
}

runtime.registerActivity(countStoredBytes, { inputAsReference: true });
```

Streaming bypasses `maxInMemoryRehydrationSize`, but also bypasses buffered SHA-256 verification and
payload-stage reversal. If needed, compute and verify a hash while consuming the stream.
Destroy streams on early exit and handle stream errors. Creating the stream alone does not download all data.
The byte count includes JSON syntax and encoding, not just the length of an application string.

## Configuration and policy reference

Offloading uses the serialized value's **UTF-8 byte count**, not JavaScript string length. Keys have the form
`<keyPrefix>/<instanceId>/<sha256>`. References contain the store, key, size, SHA-256 hash, format version,
and optional stage metadata. The version-1 wire envelope uses the reserved `$daprRef` property.

| Resolver option | Default and behavior |
| --- | --- |
| `storeName` | Required binary-store component name. Reads use the store recorded in each reference. |
| `keyPrefix` | `"workflow-payloads"`; prefix for new content-addressed keys. |
| `writePreference` | `PayloadWritePreference.Preserve`. See the policy table below. |
| `offloadSites` | `PayloadKind.All`; bitwise combination of eligible boundary kinds. |
| `offloadThreshold` | `64 * 1024` bytes, inclusive. Positive integer; `null` offloads every nonempty serialized snapshot eligible under `PreferReference`. |
| `skipWriteIfExists` | `true`; tolerates an already-existing content-addressed object rather than overwriting it. Does not mean the SDK skips every upload attempt. |
| `maxInMemoryRehydrationSize` | `16 * 1024 * 1024` bytes. Enforced against both the envelope size and actual buffered bytes. |
| `verifyIntegrityOnRead` | `true`; buffered reads verify the SHA-256 hash. |
| `resolutionCacheSize` | `128` entries per orchestrator execution. `0` disables caching. |
| `resolutionCacheBytes` | `64 * 1024 * 1024` summed envelope bytes per execution. `0` disables caching; values exceeding the budget are read without being cached. |
| `manifest` | Optional durable, idempotent `IWorkflowPayloadManifest` implementation for explicit cleanup. |

The cache retains serialized reads, not a durable cross-replay object cache. Both the entry and byte bounds apply.

| Write preference | Ordinary values | Existing top-level references |
| --- | --- | --- |
| `Preserve` | Stay inline. | Pass through, except where a cross-app input requires inlining. |
| `PreferReference` | Offload if the site and threshold allow it. | Pass through, except where a cross-app input requires inlining. |
| `PreferInline` | Stay inline. | Resolve before writing the outgoing value. |

`offloadSites` combines `PayloadKind.WorkflowInput`, `WorkflowOutput`, `ActivityInput`, `ActivityOutput`,
`ExternalEvent`, `ContinueAsNewInput`, `CustomStatus`, `ChildWorkflowInput`, and `ChildWorkflowOutput`.
For example, `PayloadKind.ActivityInput | PayloadKind.ActivityOutput` limits automatic offloading to activity
boundaries. `PayloadKind.None` disables new automatic offloading without disabling reads or forwarding.
Detached inputs use `WorkflowInput`, termination output uses `WorkflowOutput`, and rerun replacement input
uses `WorkflowInput`.

### Read limits and errors

Buffered resolution rejects staged references because JavaScript does not implement stage reversal.
It also throws `PayloadRehydrationLimitError` above the configured limit, `PayloadNotFoundError` for a
missing object, and `PayloadIntegrityError` for a hash mismatch when verification is enabled.
`PayloadNotResolvableError` indicates missing resolver support. Invalid or unsupported reserved reference
envelopes throw rather than being treated as ordinary application data.

Changing the write threshold affects new writes only. Lowering the rehydration limit can break **existing**
ordinary-value consumers and `PreferInline` conversions. Plan that change against all retained payloads;
use explicit references and streaming for values that must not be fully buffered.

## Read client results

`getWorkflowState` and the wait methods prepare referenced input, output, and custom status before returning.
With a compatible resolver, the ordinary getters use the resolved serialized data. This means fetching
payloads can trigger downloads even when you intend to inspect a reference.

`state.getInputReference()`, `getOutputReference()`, and `getCustomStatusReference()` expose the original
reference. If buffered resolution was refused because the resolver is absent or the size exceeds its limit,
the reference remains accessible, while the corresponding typed getter throws the preparation error:

```javascript
const state = await client.getWorkflowState(instanceId, true);
const reference = state?.getOutputReference();
if (reference) {
  const stream = payloads.open(reference);
  try {
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
  } finally {
    stream.destroy();
  }
}
```

Use an appropriate rehydration limit on clients intended to stream large results.
Missing objects and integrity failures reject the state request instead of being deferred.
Serialized getters can still contain the raw envelope when preparation could not resolve it; do not treat
that envelope as an application object. Metadata-only state reads omit input/output fields.
History retrieval and propagated-history views preserve their wire payloads and do not hydrate them.

## Cross-app and cross-language calls

Cross-app activity, child, and detached workflow inputs are **inline by default**, even under
`PreferReference`. The sender resolves an existing top-level reference before submission; a failed read
prevents submission. The destination should accept an ordinary value for that input.

To forward references, explicitly allow them on the call:

```javascript
const result = yield ctx.callActivity("remoteDocumentConsumer", reference, {
  targetAppId: "document-service",
  allowPayloadReferences: true,
});
```

This permits the resolver's write policy; it does not force offloading or override `PreferInline`.
Every reader must resolve the recorded store and key to the **same binary object** through its own sidecar.
Separate in-memory components do not meet that requirement.

The JavaScript and .NET SDKs share a version-1 envelope, but cross-language use also requires compatible
serialization and contracts. JavaScript buffered reads do not reverse .NET payload stages. Use unstaged,
compatible payloads for such calls; other SDKs must not be assumed to support this scheme.

The inline default protects only top-level **call inputs**. It does not inline nested references, return
values, external events, or references in propagated ancestor history. Coordinate payload support across
the entire topology before enabling it; do not mix payload-aware and payload-unaware workers for one app ID.

## Events and continuation

`client.raiseEvent` and workflow `ctx.sendEvent` apply the `ExternalEvent` write policy.
`ctx.waitForExternalEvent(name)` resolves an offloaded event as an ordinary value; use
`ctx.waitForExternalEvent(name, { asReference: true })` to receive an envelope without downloading.
The sender must actually supply a reference or produce an offloaded event for that contract.

`continueAsNew` applies the `ContinueAsNewInput` policy. Unconsumed reference events preserved with
`saveEvents: true` are carried forward without being materialized. Ensure the next generation's input
contract is compatible with the new input.

## Adopt references in existing applications

First deploy resolver support with `Preserve` everywhere that may read the histories. This keeps ordinary
new values inline while allowing existing references to be read. Next, enable `PreferReference` at selected
sites after assessing storage durability, read limits, and every downstream consumer.

Moving from ordinary input to `inputAsReference: true` is a **contract change**: old inline histories cannot
satisfy it. Introduce a new registration name/version and route new instances to that contract, keeping the
old implementation for existing instances. Likewise, `resultAsReference` and `asReference` must not be
introduced into histories that still contain inline results or events.

To stop creating new automatic references, use `Preserve`; to inline outgoing references as well, use
`PreferInline`. **Keep the resolver registered** while any history, result, event, or consumer can still
contain a reference. Switching write policy does not rewrite retained history.

## Retention and cleanup

Neither workflow completion nor `purgeWorkflow` deletes binary-store objects. A failed scheduling request can
also leave an uploaded object behind. Retain objects for suspended workflows, replay, reruns, descendants,
and forwarded references; deleting a source instance's objects can break another instance that still uses them.

For explicit cleanup, supply a durable `IWorkflowPayloadManifest` with asynchronous
`record(instanceId, reference, signal?)`, `list(instanceId, signal?)`, and `clear(instanceId, signal?)`
methods, then call `await payloads.deletePayloads(instanceId)` only when no consumer needs those objects.
The resolver records writes in the manifest; it does not discover every forwarded-reference consumer.
Cleanup without a manifest throws. Missing objects are tolerated during deletion; other errors propagate,
and the manifest is cleared only after deletions succeed.

Use application-level retention and access control appropriate to the data. A reference is a locator,
not authorization or a substitute for protecting the binary-store component.
