---
type: docs
title: "Workflow data references in the .NET SDK"
linkTitle: "Data references (alpha)"
weight: 1550
description: Offload large workflow payloads to a binary store and defer reading them with explicit data references
---

Workflow data references let you keep large payloads out of workflow history. The .NET SDK stores the serialized
payload in a Dapr binary store and records a small reference instead. You can either keep your existing workflow
and activity types and let the SDK retrieve the data automatically, or pass `PayloadReference<T>` values and read
the data only where it is needed.

{{% alert title="Alpha feature" color="warning" %}}
The **binary store is an alpha building block and is subject to change**. The .NET SDK's workflow data-reference
implementation is **also alpha**; its APIs and behavior are subject to change.

Use an SDK build that includes that implementation; do not assume an earlier published package includes these APIs.
{{% /alert %}}

{{% alert title="Cross-app SDK compatibility" color="warning" %}}
Cross-app activity and workflow call inputs are **inline by default**. Only opt into forwarding references to
compatible, payload-aware .NET destinations with access to the stored data. Other Dapr language SDKs do not
presently support this scheme. See [Cross-app input handling](#cross-app-input-handling) for requirements and limits.
{{% /alert %}}

Use this guide in the order that fits your application:

- **Get started:** [choose an approach](#choose-how-to-handle-payloads), [set up payload support](#set-up-payload-support),
  then [use automatic offloading or explicit references](#use-payloads).
- **Understand behavior:** review [payload policies and limits](#understand-payload-policies),
  [cross-app calls](#cross-app-input-handling), and [events](#event-payload-handling).
- **Deploy and operate:** [adopt references in existing workflows](#adopt-data-references-in-existing-workflows),
  [switch back to inline payloads](#switch-back-to-inline-payloads), and [manage stored payloads](#operate-workflows-with-stored-payloads).
- **Evaluate the tradeoffs:** see the [benchmark comparison](#benchmark-comparison).

## Choose how to handle payloads

| Approach | Application types | Behavior |
| --- | --- | --- |
| Inline (default) | `DocumentPayload` | Full serialized values stay in history. No binary-store registration or access. |
| Automatic offloading (`PreferReference`) | `DocumentPayload` | Eligible large values are stored externally. The SDK downloads and deserializes them wherever an ordinary value is required, including each orchestration execution that receives the document. Cross-app inputs remain inline unless explicitly allowed. |
| Explicit references | `PayloadReference<DocumentPayload>` | The workflow can forward a reference without downloading the document. An activity or client explicitly resolves it to an object or opens a stream. |

Automatic offloading is useful when you need smaller history without changing workflow signatures. It does **not**
eliminate repeated materialization (downloading and deserializing the payload). Explicit references are useful when
the orchestrator only coordinates work and a later activity is the first consumer of the data. See the
[benchmark comparison](#benchmark-comparison) for measured tradeoffs.

Offloading happens **after serialization**, based on the UTF-8 byte count of the serialized value. The reference
envelope contains the store name, key, size, SHA-256 hash, and format version. Stored keys are content-addressed and
scoped to a workflow instance. Existing references pass through under `Preserve` and `PreferReference`, except
when a cross-app input requires inlining. `PreferInline` resolves outgoing references instead.

## Set up payload support

### Prerequisites

- A build of `Dapr.Workflow` containing the PR revision described above. Payload support is included in
  `Dapr.Workflow`; a separate `Dapr.Workflow.BinaryStore` package is not required.
- Dapr runtime 1.19.0-rc.3 or later with binary-store support.
- A configured binary-store component, in addition to the workflow's usual actor state store, placement, and scheduler.
- Payload support registered on every client and worker that writes or reads these workflows, with access to the
  referenced component and compatible serialization settings.

The SDK manages the references; the workflow runtime protocol does not need native data-reference support.
Adding a component alone does not enable offloading.

### Configure a binary-store component

For a disposable local experiment, add this component to the sidecar's resources directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: workflow-payloads
spec:
  type: binarystore.in-memory
  version: v1
  metadata: []
```

{{% alert title="In-memory storage is for experiments only" color="warning" %}}
This component loses all payloads when the sidecar stops, even if workflow history remains in a durable state store, and
is strictly intended for ephemeral testing. Those histories can no longer resolve their references. Use durable
binary storage for workflows that must survive restarts, and retain payloads for as long as any history or
consumer needs them.
{{% /alert %}}

### Register payload support

Chain `WithBinaryStorePayloads` from `AddDaprWorkflow` or `AddDaprWorkflowBuilder`. For example, in an application's
startup code, register the workflow and activity types used below:

```csharp
using Dapr.Workflow;
using Dapr.Workflow.Payloads;
using Microsoft.Extensions.DependencyInjection;

builder.Services.AddDaprWorkflow().WithBinaryStorePayloads(options =>
{
    options.StoreName = "workflow-payloads";
    options.WritePreference = PayloadWritePreference.PreferReference;
    options.OffloadThreshold = 64 * 1024;
});
```

`StoreName` must match the component name. If you use a non-default sidecar gRPC endpoint, configure
`DAPR_GRPC_ENDPOINT` consistently for the workflow and binary-store clients.

`WithBinaryStorePayloads` extends the workflow builder, not `IServiceCollection`. For subsequent service
registrations, use `builder.Services` or the returned workflow builder's `Services` property.

Offloading is configured for the host, not separately for each workflow. Do not mix payload-aware and
payload-unaware workers for the same app ID while offloaded workflows are running.

{{% alert title="Keep payload support registered indefinitely" color="warning" %}}
Once you opt into `WithBinaryStorePayloads(...)`, **do not unregister it**. Keep this registration in place
indefinitely, including after you stop creating references or switch back to inline payloads. Removing it risks
breaking your application: retained workflow histories, results, and events can still contain references that
require the registered services to resolve.

To return to inline payloads, configure `WritePreference = PayloadWritePreference.PreferInline` instead of removing
the registration. This changes future writes, not historical data, and leaves reference resolution available.
First ensure receiving contracts accept inline values; see [Switch back to inline payloads](#switch-back-to-inline-payloads)
for the migration path when older workflow versions still require `PayloadReference<T>`.
{{% /alert %}}

## Use payloads

The examples below use the registration above, which selects `PreferReference`. For other write behavior, see
[Choose a write preference](#choose-a-write-preference).

### Use automatic offloading

Keep ordinary input and output types. The SDK stores values that meet the threshold and resolves them before passing
them to your application code. These types work with or without `WithBinaryStorePayloads`:

```csharp
using Dapr.Workflow;

public sealed record DocumentPayload(string Content);

public sealed class DocumentWorkflow : Workflow<DocumentPayload, int>
{
    public override Task<int> RunAsync(WorkflowContext context, DocumentPayload input)
        => context.CallActivityAsync<int>(nameof(MeasureDocumentActivity), input);
}

public sealed class MeasureDocumentActivity : WorkflowActivity<DocumentPayload, int>
{
    public override Task<int> RunAsync(WorkflowActivityContext context, DocumentPayload input)
        => Task.FromResult(input.Content.Length);
}
```

From client code, resolve `DaprWorkflowClient` from the application's service provider and schedule as usual:

```csharp
var client = services.GetRequiredService<DaprWorkflowClient>();
var document = new DocumentPayload(new string('a', 128 * 1024));

var instanceId = await client.ScheduleNewWorkflowAsync(
    nameof(DocumentWorkflow), input: document);
```

With the registration above, the document exceeds 64 KiB and is offloaded at the workflow and activity input
boundaries. The small integer result stays inline. Without payload registration, or with the default `Preserve`
preference and an ordinary input, the same document stays inline.

Automatic offloading reduces the data carried in history, but this workflow still needs a materialized
`DocumentPayload` each time the orchestrator executes. Replaying a workflow does not imply that previously
downloaded documents remain cached across executions.

### Pass explicit references

To avoid materializing the document in the orchestrator, change the workflow and activity inputs to
`PayloadReference<DocumentPayload>`. Inject `IWorkflowPayloadResolver` into the activity that actually needs it.

For an existing workflow, introduce these contract changes in a new workflow version rather than replacing the
types used by retained histories. See [Adopt data references in existing workflows](#adopt-data-references-in-existing-workflows).

```csharp
using Dapr.Workflow;
using Dapr.Workflow.Payloads;

public sealed class ReferenceWorkflow : Workflow<PayloadReference<DocumentPayload>, int>
{
    public override Task<int> RunAsync(
        WorkflowContext context, PayloadReference<DocumentPayload> input)
        => context.CallActivityAsync<int>(nameof(MeasureReferenceActivity), input);
}

public sealed class MeasureReferenceActivity(IWorkflowPayloadResolver resolver)
    : WorkflowActivity<PayloadReference<DocumentPayload>, int>
{
    public override async Task<int> RunAsync(
        WorkflowActivityContext context, PayloadReference<DocumentPayload> input)
    {
        var document = await resolver.ResolveAsync<DocumentPayload>(input);
        return document.Content.Length;
    }
}
```

In client code, store the document before scheduling. Use the same instance ID for storage and scheduling:

```csharp
var client = services.GetRequiredService<DaprWorkflowClient>();
var resolver = services.GetRequiredService<IWorkflowPayloadResolver>();
var instanceId = $"document-{Guid.NewGuid():N}";
var document = new DocumentPayload(new string('a', 128 * 1024));

var reference = await resolver.StoreAsync(document, instanceId);
await client.ScheduleNewWorkflowAsync(
    nameof(ReferenceWorkflow), instanceId, reference);
```

`StoreAsync` explicitly stores the value regardless of the write preference or automatic offload threshold.
Use `Preserve` or `PreferReference` for the reference-typed workflow above; `PreferInline` would send document
content instead of its required reference. Create references in
client or activity code, not in replayed orchestrator code. The workflow above only forwards a reference; the
activity downloads and deserializes the document. Activity retries can read it again, so this is not an exactly-once
download guarantee.

If the orchestrator itself needs the value, use `await context.ResolvePayloadAsync(reference)` rather than calling
the binary-store client directly. The SDK's context extensions coordinate reads with workflow execution.
`context.HasPayloadResolver()` reports whether support is registered. Resolved values are cached only for the
current orchestration execution, up to `ResolutionCacheSize`; the cache does not span replays.

### Stream large payloads

`ResolveAsync<T>` buffers the serialized payload before deserialization and is subject to
`MaxInMemoryRehydrationSize`. A typed reference alone does not remove that limit. For larger data, use
`IWorkflowPayloadResolver.OpenAsync(reference)` in an activity or client and consume the returned stream
incrementally with asynchronous reads. Dispose it with `await using`.

The stream contains the serialized bytes, not just a document's content property. Streaming avoids buffering
the whole payload on read, but `StoreAsync` still serializes the value in memory on write. The streaming path does
**not** automatically verify the content hash: the consumer must check the bytes against `reference.ContentHash`
and, where appropriate, `reference.Size`. The
[streaming activity example](https://github.com/dapr/dotnet-sdk/blob/622c5374db5b06d0cdf538e94927853f0beede88/examples/Workflow/WorkflowDataReferences/Activities/MeasurePayloadActivity.cs)
demonstrates bounded-buffer reads and SHA-256 verification.

For orchestrator reads, `context.OpenPayloadAsync(reference)` is the corresponding SDK-managed API. Use
asynchronous reads and disposal; prefer doing payload processing in an activity to avoid repeating it on replay.

## Understand payload policies

### Choose a write preference

`BinaryStorePayloadOptions.WritePreference` controls conversion of future outgoing top-level payloads.
It defaults to `PayloadWritePreference.Preserve`; registration alone does not enable automatic payload offloading.
The [registration example](#register-payload-support) explicitly selects `PreferReference`.

| Preference | Ordinary outgoing value | Outgoing reference |
| --- | --- | --- |
| `Preserve` (default) | Serialize inline; no automatic upload. | Keep the reference. |
| `PreferReference` | Upload if the serialized value meets `OffloadThreshold` at an enabled `OffloadSites` boundary. Otherwise keep inline. | Keep the reference; do not upload it again. |
| `PreferInline` | Serialize inline; no automatic upload. | Resolve to its original serialized content and write that content inline. Fail if resolution cannot complete safely. |

The cross-app input rule can require inline data regardless of the host preference. Allowing references on a
cross-app call restores the normal host preference; it does not force offloading or override `PreferInline`.
`OffloadSites` and `OffloadThreshold` only govern automatic reference creation under `PreferReference`, not inlining
or inbound reads. Explicit `IWorkflowPayloadResolver.StoreAsync` writes under every preference.

These policies do not rewrite retained history, persist an instance-level setting, or infer policy from a
workflow's input. They affect future writes from **both new and already-running workflows**. Changing host
configuration does not automatically version workflows or activities.

In particular, `Preserve` means no automatic outbound conversion, not preservation of object provenance. If
the SDK reads a reference as an ordinary `T`, and application code subsequently returns a `T`, that output is
a new inline value. Histories can legitimately contain both forms. Applications that already use automatic
offloading must explicitly select `PreferReference` to continue that behavior.

`PreferInline` requires receiving contracts that accept ordinary values. Do not apply it indiscriminately to
applications whose workflows or activities still expect `PayloadReference<T>`. See
[Switch back to inline payloads](#switch-back-to-inline-payloads).

### Inbound handling preserves the recorded representation

Inbound handling is independent of the write preference and works the same for local and cross-app inputs:

| Received payload | Receiving contract | Behavior |
| --- | --- | --- |
| Inline data | Ordinary `T` | Deserialize normally. |
| Reference envelope | Ordinary `T` | Resolve and deserialize using registered payload support. |
| Reference envelope | `PayloadReference<T>` | Pass the reference through without automatically materializing it. |
| Inline data | `PayloadReference<T>` | Report a contract mismatch; do not upload data to manufacture a reference. |

Resolution for application code does not replace the received reference in workflow history or mutate retained
wire metadata. Raw and propagated history continue to expose the originally recorded representation. Received
data does not establish an outbound preference or prove the sender can consume reference-valued responses.

Readers must understand the envelope version, use compatible serialization, and have access to the referenced
objects. Unsupported versions, missing data, integrity failures, and buffering-limit violations surface as errors;
they are not silently treated as ordinary application data.

### Configure offloading and read limits

| Option | Default | Purpose |
| --- | --- | --- |
| `StoreName` | Required | Binary-store component name. |
| `KeyPrefix` | `"workflow-payloads"` | Prefix for instance-scoped, content-addressed keys. |
| `WritePreference` | `PayloadWritePreference.Preserve` | Choose `Preserve`, `PreferReference`, or `PreferInline` for future writes, including events. Cross-app activity and workflow call inputs require inline data unless explicitly allowed per call. |
| `OffloadThreshold` | `64 * 1024` bytes | Under `PreferReference`, offload serialized values at or above this size. `null` offloads every non-empty payload at enabled boundaries; numeric values must be positive. |
| `OffloadSites` | `PayloadKind.All` | Select which boundaries can automatically create references under `PreferReference`. Does not restrict inlining or reads. |
| `MaxInMemoryRehydrationSize` | `16 * 1024 * 1024` bytes | Maximum serialized payload size for buffered resolution, including `ResolveAsync<T>` and outbound inlining. This is not a transport limit or a limit on total process memory. |
| `VerifyIntegrityOnRead` | `true` | Verify SHA-256 for buffered reads. Does not verify streams returned by `OpenAsync`. |
| `ResolutionCacheSize` | `128` | Maximum resolved entries cached by the orchestrator's context resolver per execution. `0` disables this cache. |
| `SkipWriteIfExists` | `true` | Treat an already-existing content-addressed object as a successful write. Does not guarantee that a duplicate upload attempt transfers no bytes. |

`PayloadKind` includes workflow and activity inputs and outputs, external events, continue-as-new input,
custom status, and child workflow inputs and outputs. Detached workflow inputs and rerun input overrides use
`PayloadKind.WorkflowInput`; termination outputs use `PayloadKind.WorkflowOutput`. Combine flags to restrict
automatic offloading, for example:

```csharp
options.OffloadSites = PayloadKind.WorkflowInput | PayloadKind.ActivityInput;
```

To stop automatic reference creation while preserving reference reads and explicit forwarding, keep
`WithBinaryStorePayloads` registered and set `WritePreference = PayloadWritePreference.Preserve`.
`OffloadSites = PayloadKind.None` remains an alternative when using `PreferReference`.
Explicit `StoreAsync` calls still write payloads. These settings stop automatic reference creation but do not
convert outgoing references to inline data. To do that, use `PreferInline` with compatible contracts as described
in [Switch back to inline payloads](#switch-back-to-inline-payloads). In every case, keep
`WithBinaryStorePayloads(...)` registered indefinitely; never remove it as a way to disable offloading.

Buffered reads fail with `PayloadRehydrationLimitException` when they exceed the configured size limit,
`PayloadNotFoundException` when the object is missing, or `PayloadIntegrityException` when hash verification fails.
Retain compatible payload readers and serialization settings for existing histories; changing the serializer does
not migrate stored data.

## Cross-app input handling

### Compatibility requirements

Cross-app activity, child workflow, and detached workflow **inputs are sent inline by default**. The sending SDK
does not automatically offload these inputs, and resolves a top-level reference to its stored serialized content
before submitting the call. This overrides a host's `PreferReference` write preference.

Opt out per-call with `AllowPayloadReferences: true` only when the destination supports reference envelopes,
registers payload support with `WithBinaryStorePayloads(...)` (if a .NET application), and can access the stored data. This is an explicit
compatibility assertion, not capability negotiation. Payload contracts and serialization settings must also match.

Each reader resolves the reference's store name and key through its own configured Dapr sidecar. The named
binary-store component must be available to each reader and address the same stored objects, with the required
access permissions. Matching component names alone is not enough if they point to different storage locations.
Separate in-memory stores do not share payloads across sidecars.

As of v1.19, only the .NET SDK presently supports this data-reference scheme. The versioned envelope is intended for a future
cross-SDK proposal; support in other SDKs must not be assumed. Do not enable reference forwarding to other SDKs
or to older or payload-unaware .NET applications. Upgrading the SDK without registering payload support is not enough.

The default protects top-level call inputs, not nested reference properties, return values, or propagated history.

### Use the inline default

When an activity, child workflow, or detached workflow call specifies a `TargetAppId` different from the current
app, the default is to require inline input.
An explicit same-app target follows the normal host preference. The SDK handles the outgoing input after workflow
execution has removed calls already recorded in history, before submitting the remaining actions to the runtime.
Storage I/O does not run directly in the deterministic workflow body.

Configure the source app ID correctly: if it is unavailable, a non-empty `TargetAppId` still requires inline input
unless the call explicitly allows references. The SDK cannot infer that the target is the same app.

An ordinary input is kept inline even under `PreferReference`. A top-level `PayloadReference<T>` is resolved on
the sender, and the original serialized content is sent without another deserialize/serialize cycle or
automatic re-offloading. The destination should accept `T`:

```csharp
var length = await context.CallActivityAsync<int>(
    "MeasureDocumentActivity",
    reference,
    new WorkflowTaskOptions(TargetAppId: "document-service"));
```

This call sends document data, not a reference. It can work with a payload-unaware destination, provided its
ordinary input contract and serialization are compatible. The sender still needs registered payload support
and access to the referenced object.

### Explicitly allow references for a known destination

If the destination deliberately expects `PayloadReference<DocumentPayload>`, opt out of cross-app inlining:

```csharp
var length = await context.CallActivityAsync<int>(
    "MeasureReferenceActivity",
    reference,
    new WorkflowTaskOptions(
        TargetAppId: "document-service",
        AllowPayloadReferences: true));
```

The sending host must also use a compatible write preference (`Preserve` or `PreferReference`) to retain that
explicit reference. Permission applies only to this call's input and is retained by SDK retries. It does not
advertise capabilities to the destination or control the representation of the returned value.

For a child workflow, use the equivalent `ChildWorkflowTaskOptions`:

```csharp
var length = await context.CallChildWorkflowAsync<int>(
    "ReferenceWorkflow",
    reference,
    new ChildWorkflowTaskOptions(
        TargetAppId: "document-service",
        AllowPayloadReferences: true));
```

For a detached workflow, use the overload with explicit routing options:

```csharp
var detachedId = await context.ScheduleNewDetachedWorkflowAsync(
    workflowName: "DocumentWorkflow",
    instanceId: null,
    input: reference,
    startTime: null,
    options: new WorkflowTaskOptions(TargetAppId: "document-service"));
```

This example uses the inline default. Set `AllowPayloadReferences: true` only for a reference-aware destination.
Detached options support routing and payload permission, not retry policies or history propagation; unsupported
options are rejected. Existing detached calls without options continue to schedule locally.

### Limits and scope

Cross-app inlining and `PreferInline` are **inline-or-error**, not best-effort fallback policies:

- Resolution checks `MaxInMemoryRehydrationSize` against both the declared reference size and the bytes actually
  read. Buffered content is checked against its hash when `VerifyIntegrityOnRead` is enabled.
- Missing or inaccessible storage, unsupported envelope versions or transformations, and integrity or buffering
  failures prevent the outgoing call from being submitted. The SDK does not silently send the reference instead.
- A buffering limit is not a transport limit. The SDK's configured gRPC message limits still apply, and remote
  runtime, scheduler, state-store, and destination limits may be smaller. Message overhead and multiple actions
  can make a request larger than one serialized payload. These remote limits are not negotiated by the SDK.
  Transport/runtime errors must be handled normally; successful materialization does not guarantee delivery.
- Only top-level inputs are converted. The SDK does not recursively replace reference-valued properties in
  arbitrary DTOs, because that would change their schemas.
- Return values and propagated history are not covered by the input override. Retained propagated history is
  not rewritten. Plan compatible contracts, write preferences, and storage access independently for these paths.

## Event payload handling

Current event APIs do not expose `TargetAppId` or a per-event `AllowPayloadReferences` option. They use the normal
write preference rather than the automatic cross-app input override described above:

| Event path | Outgoing policy |
| --- | --- |
| `context.SendEvent` | Uses the workflow host's `WritePreference`. The target instance is in the current app; local events are not forced inline. |
| Client `RaiseEventAsync` | Uses the publishing client's configured `WritePreference`. The destination is determined by the sidecar endpoint configured for that client. |

`context.SendEvent` also requires runtime support for workflow-originated events. Dapr `1.19.0-rc.3`
rejects the resulting `EventSent` message, regardless of payload representation. The policy described above
is the SDK's serialization behavior, not a guarantee of event delivery on that runtime.

Under `PreferReference`, automatic event offloading is governed by `PayloadKind.ExternalEvent` in `OffloadSites`
and the configured `OffloadThreshold`. `Preserve` keeps ordinary event values inline but still forwards explicit
references. `PreferInline` also resolves outgoing top-level references to their original serialized content.

**Same-app routing does not guarantee same-app authorship or compatible SDK support.** An external application
can configure a client against the destination's sidecar and raise an event. The SDK cannot infer the publisher's
or receiver's reference capabilities merely from the instance ID or the fact that an event was received.

For an external publisher targeting an app whose reference support is unknown, configure
`WritePreference = PayloadWritePreference.PreferInline`. The publisher needs payload support and storage access
to resolve any references it supplies. The [inlining limits and failure behavior](#limits-and-scope) still apply:
inlining errors are surfaced rather than falling back to sending a reference. This preference affects the
client's other payload writes too; it is not a per-event override.

Inbound events follow the same [representation-preserving read rules](#inbound-handling-preserves-the-recorded-representation)
as other payloads. A consumer awaiting an ordinary `T` can receive inline data or a resolvable reference. A consumer
awaiting `PayloadReference<T>` receives a reference without automatic materialization, but inline data is a contract
mismatch. Reading an event does not rewrite its recorded history or establish a preference for later writes.

No additional event policy is required for the currently supported APIs. If explicit cross-app event routing is
introduced, it should use the same inline-by-default rule and per-call reference permission as other cross-app
calls. Those event-routing options are not currently available.

## Adopt data references in existing workflows

**Automatic offloading is a storage-format change; explicit references are an application-contract change.**
In the current alpha implementation, you can safely enable automatic offloading for existing, in-flight workflows
without changing their workflow version, provided the application logic and serialization contract stay unchanged
and the documented storage requirements and read limits are met. To introduce explicit references, add new
activities with reference-based contracts and a new workflow version that consumes those contracts, while
preserving the old workflows and activities.

| Approach | Compatibility with existing workflows |
| --- | --- |
| Inline | Unchanged by default. `AddDaprWorkflow(...)` alone does not enable payload offloading. |
| Automatic offloading | Existing workflow and activity parameter and return types stay unchanged. The SDK accepts both historical inline values and reference envelopes, resolving references before deserialization. |
| Explicit references | Changing `T` to `PayloadReference<T>` is not automatically compatible with histories containing inline `T`. Preserve the old contract and introduce the reference-based contract in a new version. |

### Enable automatic offloading safely

Historical inline values are not rewritten. Only newly emitted payloads at enabled boundaries are candidates for
offloading, so a workflow history can contain both inline values and references. The SDK passes ordinary serialized
values through on read and applies outbound offloading after replay has consumed previously recorded actions.

Select `WritePreference = PayloadWritePreference.PreferReference` and the desired offload boundaries through
`WithBinaryStorePayloads(...)` during registration. The SDK manages
storage and materialization at workflow and activity boundaries; application code continues to use its existing
parameter and return types. You do not implement or independently coordinate readers and writers within the workflow
for automatic offloading.

If you want activities to return `PayloadReference<T>` values instead of materialized `T` values, that is an
explicit-reference contract change, not an automatic-offloading configuration change. Introduce new activities and
a new workflow version as described below.

For rollback, stop explicit writes on the new ordinary-payload path and follow
[Switch back to inline payloads](#switch-back-to-inline-payloads) to select a compatible write preference.
Keep `WithBinaryStorePayloads(...)` registered indefinitely; rollback must not remove payload support.

### Introduce explicit references with file-based versioning

Use [name-based workflow versioning]({{% ref dotnet-workflow-versioning.md %}}#name-based-versioning) for a safe
file-based migration: copy the workflow to a new file and give its class a new versioned name, such as
`DocumentWorkflowV2`. Renaming the file alone does not create a workflow version.

1. **Add new activities and the reference-based workflow version.** Introduce a distinctly named activity that
   stores the payload and returns `PayloadReference<T>`. In V2, call that activity with the corresponding typed
   result, such as `CallActivityAsync<PayloadReference<DocumentPayload>>(...)`, and pass the reference to activities
   that consume it. Give those activities distinct names wherever their input or output contracts change, and keep
   the original activities registered. A workflow version does not automatically version shared activities or
   convert persisted payloads.
2. **Automatic routing to V2.** Configure name-based versioning and keep both workflow versions registered (recall
that as of v1.17.0 of the Dapr .NET SDK, you no longer need to manually register workflows and as of v1.18.0, you
do not need to register activities either). With the
   numeric naming strategy, new starts using the canonical workflow name select the latest version, while existing
   instances retain their recorded version. V2 can keep the original workflow input type and obtain references from
   its new activities, so clients do not need to create references just to start that workflow.

Only if V2 also changes its entry-point input from `T` to `PayloadReference<T>` must clients store the input and
supply a reference before starting V2. Selecting a workflow version does not convert an inline input into a
reference; keep client requests compatible with the selected version's entry-point contract.

Automatic offloading remains application-wide, not workflow-version-scoped. V1 and V2 can coexist with different
application contracts, but enabling automatic offloading on their shared host makes newly emitted payloads from
either version eligible for offloading.

### When patch-based versioning is appropriate

`context.IsPatched(...)` can protect an internal change while keeping the workflow's original input type. For
example, a new branch can call a new activity that stores data and returns a reference, while the old branch keeps
the original activity sequence.

A patch check **cannot protect an incompatible change to the workflow's entry-point input type**: the worker
deserializes the input before calling workflow code, so execution can fail before reaching `IsPatched`. Keep the
original input type for a patch-based migration, and create references in clients or activities, never through
storage writes in replayed orchestrator code.

### Switch back to inline payloads

**Keep `WithBinaryStorePayloads(...)` registered indefinitely.** For ordinary `T` contracts, switch the host's
write preference to `PreferInline` rather than unregistering payload support:

```csharp
builder.Services.AddDaprWorkflow().WithBinaryStorePayloads(options =>
{
    options.StoreName = "workflow-payloads";
    options.WritePreference = PayloadWritePreference.PreferInline;
});
```

Keep your existing store configuration so historical references remain resolvable. `PreferInline` keeps ordinary
values inline and materializes explicit references encountered on future writes. It does not rewrite existing
history, delete stored data, or disable reference reads. Referenced objects must remain available for as long as
any history or consumer needs them.

If existing versions use explicit `PayloadReference<T>` contracts, introduce a new workflow version and separately
named activities with ordinary `T` contracts. Stop calling `StoreAsync` in that new path and pass ordinary values
when starting the new version. Keep old workflow and activity contracts registered for existing instances.

When both versions share a host, use `Preserve` to retain old explicit references while new ordinary values stay
inline. A host-wide `PreferInline` would also convert future references produced by the old version and could
break its reference-typed receivers. A new workflow version alone does not isolate host-wide write preferences.
Likewise, old reference-aware cross-app calls must explicitly allow references if they need to continue forwarding
them. Retain storage and readers for as long as any old history or consumer needs them.

## Operate workflows with stored payloads

### Reading workflow metadata can download payloads

Client operations that fetch inputs and outputs also attempt to resolve their references before returning.
`ReadInputAs<T>`, `ReadOutputAs<T>`, and `ReadCustomStatusAs<T>` remain synchronous; they do not initiate storage I/O.
Reading an ordinary result with `state.ReadOutputAs<DocumentPayload>()` returns the deserialized document; for
offloaded output, `state.ReadOutputAs<PayloadReference<DocumentPayload>>()` exposes the retained reference.
Asking for the reference after fetching metadata does **not** undo downloads already performed by that fetch.

If buffered resolution exceeds `MaxInMemoryRehydrationSize`, the state retains the reference and the read error.
You can still obtain `PayloadReference<T>` and stream it with the resolver, but requesting the ordinary `T` throws
`PayloadRehydrationLimitException`. This handling is specific to buffering-limit errors: missing objects, integrity
failures, and other read errors still fail the metadata fetch. Asking for `PayloadReference<T>` when the recorded
value is inline is a contract mismatch, not a request to upload it.

When you only need completion status, avoid requesting inputs and outputs:

```csharp
var state = await client.WaitForWorkflowCompletionAsync(
    instanceId, getInputsAndOutputs: false);

if (state.RuntimeStatus != WorkflowRuntimeStatus.Completed)
{
    throw new InvalidOperationException($"Workflow {instanceId} ended with {state.RuntimeStatus}.");
}
```

This also omits the workflow's output. It avoids the input/output inspection download that would otherwise occur
even when the workflow uses explicit references. Keep custom status small as well: returned custom status can also
contain a reference that the client resolves.

### Retain and clean up payloads

Payloads must be immutable and remain available while any workflow history, result, child workflow, or rerun
references them. Workflow completion and history purging do **not** automatically delete binary objects.
Conversely, deleting an object can break replay or result inspection even for a completed workflow.

The default `IWorkflowPayloadManifest` records nothing, so the default `WorkflowPayloadCleaner` cannot discover
payloads to delete. For explicit cleanup, implement a durable `IWorkflowPayloadManifest` and register it
**after** `WithBinaryStorePayloads` using `builder.Services.WithPayloadManifest<YourDurableManifest>()`.
The manifest must idempotently record references by instance ID, list them, and clear records after deletion.
An in-memory manifest is not sufficient for cleanup across restarts.

Only after the owning history has been purged and no other consumer needs its references, resolve
`WorkflowPayloadCleaner` from dependency injection and call `PurgeAsync(instanceId)`. Forwarding a reference to
another workflow does not transfer ownership or make cleanup reference-counted; your retention policy must account
for shared references. Also account for payloads stored before a scheduling operation that subsequently fails.

## Benchmark comparison

The [SDK benchmark](https://github.com/dapr/dotnet-sdk/tree/622c5374db5b06d0cdf538e94927853f0beede88/benchmarks/Dapr.Workflow.Benchmarks)
compares three ways to process the same **2,000,000-byte serialized document** through **nine sequential
activities**. The first eight activities coordinate work using small values. Only activity nine needs the document,
and all three modes compute the same checksum.

| Case | Workflow input | Storage and materialization |
| --- | --- | --- |
| `Inline` | `BenchmarkDocument` | No payload registration. Full document in workflow history; deserialize at each orchestration execution. |
| `Automatic` | `BenchmarkDocument` | Data in the binary store, references in history. Automatically retrieve and deserialize for each execution and the processing activity. |
| `References` | `PayloadReference<BenchmarkDocument>` | Replay only the reference. Retrieve and deserialize once, in activity nine. |

The current benchmark explicitly selects `PreferReference` for `Automatic` and `Preserve` for `References`.
The following results are from the previously documented sample run at
[revision `14071e21`](https://github.com/dapr/dotnet-sdk/tree/14071e21c548645d7b64b2fd84773ebbea9f6426/benchmarks/Dapr.Workflow.Benchmarks),
not a new measurement of the latest PR revision or a latency or throughput guarantee:

| Mode | Median total ms | Median execution ms | Min..max total ms | Workflow protobuf bytes | Binary download bytes | Document deserializations | Allocated bytes | Total speedup |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| Inline | 351.2 | 351.2 | 261.5..566.5 | 12,010,502 | 0 | 11 | 74,651,944 | 1.00x |
| Automatic | 205.0 | 192.5 | 165.6..254.8 | 12,263 | 22,000,000 | 11 | 177,754,120 | 1.71x |
| References | 140.2 | 126.6 | 109.8..211.1 | 12,278 | 2,000,000 | 1 | 24,988,960 | 2.51x |

Except for the min/max range, the measurements shown are medians. Total time includes preparation and execution.
Both offloaded cases explicitly store the initial document before scheduling so that preparation
(serialization/upload) can be measured separately. Execution time covers scheduling through completion, including
any subsequent offloading. Total speedup is the inline median total time divided by the mode's median total time.

### What the results justify

- **Smaller workflow traffic with either offloading approach:** measured workflow protobuf bytes fell by about
  **99.9%**, from 12.01 MB to about 12.3 KB. This is workflow message traffic, not the persisted history size or total
  network traffic.
- **Automatic offloading is not a memory optimization by itself:** it was **1.71x faster** in this run (41.6% less
  total time), but still deserialized the document 11 times, downloaded 22 MB, and allocated **2.38x** as many managed
  bytes as inline processing.
- **Deferring materialization matters:** explicit references were **2.51x faster** than inline processing (60.1%
  less total time) and allocated **66.5% fewer managed bytes**. Compared with automatic offloading, document
  deserializations dropped from 11 to 1 and binary downloads dropped by **90.9%**, from 22 MB to 2 MB.

These results support using explicit references when most workflow steps do not need the document. Automatic
offloading can reduce history pressure with less application change, but moves repeated reads to the binary store
rather than eliminating them.

### Measurement scope and limitations

Workflow protobuf bytes count serialized message bodies sent and received for scheduling, work items, completions,
and history fetches. They exclude status queries, health pings, transport framing, headers, TLS, and backend traffic.
Binary download bytes count file content returned to the SDK; the table does **not** include binary upload bytes.
Do not interpret the 99.9% reduction as an equivalent reduction in total network traffic.

"Document deserializations" is the benchmark's `Doc reads` count, not a count of storage calls: inline mode also has
11 deserializations despite making no binary-store reads. Allocated bytes are **process-wide managed allocations**
in the measurement window, not peak memory or sidecar allocations.

Connection warmup, dataset generation, host startup/shutdown, result inspection, and cleanup are outside the timed
window. Completion waits do not request inputs or outputs, avoiding an extra metadata download. Instrumentation,
including protobuf sizing and UTF-8 byte counting, adds work and contributes to the measured timings and allocations.

The benchmark's supplied component is an in-memory binary store, which minimizes backend latency. The summary above
does not specify hardware, runtime version, iteration count, or history-cache setting; those details should accompany
results used for capacity planning. The benchmark can run with history caching enabled or disabled. Cached history
can reduce repeated inline transfers without eliminating document deserialization; do not generalize full-history
results to cached-history deployments.

Before choosing a mode for production, repeat the benchmark with representative payloads, replay patterns, and
durable storage. Follow the benchmark README to capture both history-cache configurations and the JSON report of
individual samples. Small payloads or workflows that need the document on every execution may not benefit from
external storage.

## Related links

- [Workflow data-reference example](https://github.com/dapr/dotnet-sdk/tree/622c5374db5b06d0cdf538e94927853f0beede88/examples/Workflow/WorkflowDataReferences)
- [Workflow serialization]({{% ref dotnet-workflow-serialization.md %}})
- [Workflow payload size]({{% ref workflow-payload-size.md %}})
- [Multi-application workflows in the .NET SDK]({{% ref dotnet-workflow-multi-app.md %}})
