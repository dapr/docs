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

These APIs are available from `Dapr.Workflow` 1.19.0. Earlier packages do not include them.
{{% /alert %}}

{{% alert title="Cross-app SDK compatibility" color="warning" %}}
Cross-app activity and workflow call inputs are **inline by default**. When using cross-app workflows with other .NET
applications, register `WithBinaryStorePayloads(...)` on every participating .NET application (with access to the
same binary store) to preserve compatibility across return values, propagated history, and forwarded references—and
**never unregister it** once enabled. The [JavaScript SDK]({{% ref js-workflow-data-references.md %}}) also
supports the version-1 reference envelope from `@dapr/dapr` 3.19.0, with compatible serialization and
storage access, but does not implement payload-stage reversal. Do not assume other SDKs support this scheme. See
[Cross-app input handling](#cross-app-input-handling) for requirements and limits.
{{% /alert %}}

Use this guide in the order that fits your application:

- **Get started:** [choose an approach](#choose-how-to-handle-payloads), [set up payload support](#set-up-payload-support),
  and [use automatic offloading, explicit references, or streaming](#use-payloads).
- **Configure policies:** review [options, write preferences, and inbound handling](#configuration-and-policy-reference).
- **Handle app boundaries:** configure [cross-app calls](#cross-app-input-handling) and [events](#event-payload-handling).
- **Migrate and operate:** [adopt references in existing workflows](#adopt-data-references-in-existing-workflows),
  [switch back to inline payloads](#switch-back-to-inline-payloads), and [manage stored payloads](#operate-workflows-with-stored-payloads).
- **Evaluate the tradeoffs:** see the [benchmark comparison](#benchmark-comparison).

## Choose how to handle payloads

| Approach | Application types | Behavior | Best for |
| --- | --- | --- | --- |
| Inline (default) | `DocumentPayload` | Full serialized values stay in history. No binary-store registration or access. | Small payloads that fit comfortably in workflow history. |
| Automatic offloading (`PreferReference`) | `DocumentPayload` | Eligible large values are stored externally. The SDK downloads and deserializes them wherever an ordinary value is required, including each workflow execution that receives the document. Cross-app inputs remain inline unless explicitly allowed. | Stepping-stone migrations toward explicit references, or ensuring compatibility with other .NET apps that already use data references without immediately changing local signatures. |
| Explicit references | `PayloadReference<DocumentPayload>` | The workflow can forward a reference without downloading the document. An activity or client explicitly resolves it to an object or opens a stream. | Workflows that coordinate steps without inspecting the payload themselves (deferring data access to the specific activities that need it), especially in single-app workflows or multi-app topologies where all participating applications use .NET and can be updated to support binary-store payloads. |

### Performance and memory tradeoffs

- **Both offloading modes shrink workflow history traffic:** in the [SDK benchmark](#benchmark-comparison) (a 2 MB
  document across nine activities), both modes reduced workflow protobuf traffic by **~99.9%**.
- **Automatic offloading does not eliminate repeated materialization:** because the workflow signature still takes
  `DocumentPayload`, the SDK downloads and deserializes the payload on every replay. Automatic offloading
  allocated **1.39x** as many managed bytes as inline processing in this
  benchmark. Enable automatic offloading primarily when you are **migrating toward explicit data
  references** or when you need **cross-app compatibility with another .NET application that already uses data
  references**, even if this application only uses automatic offloading for now.
- **Explicit references defer materialization:** passing `PayloadReference<T>` avoids downloading or deserializing the
  payload until an activity explicitly resolves or streams it, reducing both execution time and managed allocations.
  This is the best fit when you do not use multi-app workflows, or when all participating applications use .NET and
  can be updated to support binary-store payloads.

### How references work

Offloading happens **after serialization**, based on the UTF-8 byte count of the serialized value. The reference
envelope contains the store name, key, size, SHA-256 hash, and format version. Stored keys are content-addressed and
scoped to a workflow instance. Existing references pass through under `Preserve` and `PreferReference`, except
when a cross-app input requires inlining. `PreferInline` resolves outgoing references instead.

## Set up payload support

### Prerequisites

- `Dapr.Workflow` 1.19.0 or later. Payload support is included in `Dapr.Workflow`.
- Dapr runtime 1.19.0 or later.
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

- **`StoreName` and endpoints:** `StoreName` must match the component name. If you use a non-default sidecar gRPC
  endpoint, configure `DAPR_GRPC_ENDPOINT` consistently for the workflow and binary-store clients.
- **Builder chaining:** `WithBinaryStorePayloads` extends the workflow builder, not `IServiceCollection`. For
  subsequent service registrations, use `builder.Services` or the returned workflow builder's `Services` property.
- **Host-wide scope:** Offloading is configured for the host, not per workflow. Do not mix payload-aware and
  payload-unaware workers for the same app ID while offloaded workflows are running.

{{% alert title="Keep payload support registered indefinitely" color="warning" %}}
Once you opt into `WithBinaryStorePayloads(...)` in any .NET application—including any application that participates
in multi-app workflows with it—**never unregister it**, even if you later opt out of creating references. Retained
workflow histories, results, and events can still contain data references that require the registered services to
read. Instead, opt out of future offloading by setting `WritePreference = PayloadWritePreference.PreferInline` while
keeping `WithBinaryStorePayloads(...)` registered; see [Switch back to inline payloads](#switch-back-to-inline-payloads).
{{% /alert %}}

## Use payloads

The examples below use the registration above, which selects `PreferReference`. For other write behaviors and limits,
see [Configuration and policy reference](#configuration-and-policy-reference).

### Use automatic offloading

Keep ordinary input and output types. The SDK stores values that meet `OffloadThreshold` and resolves them before
passing them to your application code. These types work with or without `WithBinaryStorePayloads`:

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
boundaries, while the small integer result stays inline. Without payload registration—or with the default `Preserve`
preference and an ordinary input—the same document stays inline. You can safely change `OffloadThreshold` between
builds or deployments: it only affects whether newly written workflow history items are inlined or offloaded, and has
no impact on automatic resolution for existing workflows. (By contrast, changing `MaxInMemoryRehydrationSize` is **not**
safe without planning because it applies to all existing references; see
[Size and change `MaxInMemoryRehydrationSize` safely](#size-and-change-maxinmemoryrehydrationsize-safely).)

Because `DocumentWorkflow` accepts `DocumentPayload`, the SDK still downloads and deserializes the payload each time
the workflow replays; previously downloaded documents are not cached across executions.

### Pass explicit references

To avoid materializing the document in the workflow itself, change the workflow and activity inputs to
`PayloadReference<DocumentPayload>` and inject `IWorkflowPayloadResolver` into the activity that consumes it.
(For existing workflows, introduce contract changes in a new version; see
[Adopt data references in existing workflows](#adopt-data-references-in-existing-workflows).)

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

In client code, store the document before scheduling using the same instance ID for both calls:

```csharp
var client = services.GetRequiredService<DaprWorkflowClient>();
var resolver = services.GetRequiredService<IWorkflowPayloadResolver>();
var instanceId = $"document-{Guid.NewGuid():N}";
var document = new DocumentPayload(new string('a', 128 * 1024));

var reference = await resolver.StoreAsync(document, instanceId);
await client.ScheduleNewWorkflowAsync(
    nameof(ReferenceWorkflow), instanceId, reference);
```

Key rules for explicit references:

- **Creating references:** Call `StoreAsync` in client or activity code, never in replayed workflow code.
  `StoreAsync` writes the value regardless of `WritePreference` or `OffloadThreshold`.
- **Write preference:** Use `Preserve` or `PreferReference` for reference-typed workflows; `PreferInline` would
  convert the outgoing reference back into inline document content and fail the receiving contract.
- **Retries:** Activity retries can download the payload again; explicit references do not guarantee an
  exactly-once download.
- **In-workflow resolution:** If the workflow itself must read the value, call
  `await context.ResolvePayloadAsync(reference)` rather than calling the binary-store client directly.
  `context.HasPayloadResolver()` reports whether support is registered. Resolved values are cached only for the
  current workflow execution (up to `ResolutionCacheSize`), not across replays.

### Stream large payloads

`ResolveAsync<T>` buffers the serialized payload before deserialization and is subject to
`MaxInMemoryRehydrationSize`. A typed reference alone does not remove that limit. For larger data, use
`IWorkflowPayloadResolver.OpenAsync(reference)` in an activity or client (or `context.OpenPayloadAsync(reference)` in
a workflow, though activity processing is preferred to avoid replay overhead) and consume the stream
incrementally with asynchronous reads and `await using`:

- **Serialized content:** The stream contains the full serialized bytes, not just a document's inner property.
- **Write buffering:** Streaming avoids buffering the whole payload on read, but `StoreAsync` still serializes the
  value in memory on write.
- **Manual integrity check:** Streaming does **not** automatically verify the content hash. Consumers must check the
  bytes against `reference.ContentHash` and, where appropriate, `reference.Size`. See the
  [streaming activity example](https://github.com/dapr/dotnet-sdk/blob/622c5374db5b06d0cdf538e94927853f0beede88/examples/Workflow/WorkflowDataReferences/Activities/MeasurePayloadActivity.cs)
  for bounded-buffer reads and SHA-256 verification.

## Configuration and policy reference

### Configure offloading and read limits

Configure `BinaryStorePayloadOptions` in `WithBinaryStorePayloads(...)`:

| Option | Default | Purpose |
| --- | --- | --- |
| `StoreName` | Required | Binary-store component name. |
| `KeyPrefix` | `"workflow-payloads"` | Prefix for instance-scoped, content-addressed keys. |
| `WritePreference` | `PayloadWritePreference.Preserve` | Choose `Preserve`, `PreferReference`, or `PreferInline` for future writes, including events. Cross-app activity and workflow call inputs require inline data unless explicitly allowed per call. |
| `OffloadThreshold` | `64 * 1024` bytes | Under `PreferReference`, offload serialized values at or above this size. `null` offloads every non-empty payload at enabled boundaries; numeric values must be positive. |
| `OffloadSites` | `PayloadKind.All` | Select which boundaries can automatically create references under `PreferReference`. Does not restrict inlining or reads. |
| `MaxInMemoryRehydrationSize` | `16 * 1024 * 1024` bytes | Maximum serialized payload size for buffered resolution, including `ResolveAsync<T>` and outbound inlining. This is not a transport limit or a limit on total process memory. |
| `VerifyIntegrityOnRead` | `true` | Verify SHA-256 for buffered reads. Does not verify streams returned by `OpenAsync`. |
| `ResolutionCacheSize` | `128` | Maximum resolved entries cached by the workflow context resolver per execution. `0` disables this cache. |
| `SkipWriteIfExists` | `true` | Treat an already-existing content-addressed object as a successful write. Does not guarantee that a duplicate upload attempt transfers no bytes. |

`PayloadKind` flags cover workflow and activity inputs/outputs, external events, continue-as-new input, custom
status, and child workflow inputs/outputs (detached workflow inputs and rerun overrides use `PayloadKind.WorkflowInput`;
termination outputs use `PayloadKind.WorkflowOutput`). Combine flags to restrict automatic offloading:

```csharp
options.OffloadSites = PayloadKind.WorkflowInput | PayloadKind.ActivityInput;
```

Buffered reads throw `PayloadRehydrationLimitException` when exceeding `MaxInMemoryRehydrationSize`,
`PayloadNotFoundException` when the object is missing, or `PayloadIntegrityException` when hash verification fails.
Retain compatible payload readers and serialization settings for existing histories; changing the serializer does
not migrate stored data.

### Size and change `MaxInMemoryRehydrationSize` safely

Unlike `OffloadThreshold` (which only affects future writes), **`MaxInMemoryRehydrationSize` is not safe to change
casually**. It is enforced on every buffered read and inlining operation—including references already recorded in
workflow history. Lowering it below an existing payload's declared or actual size can cause:

1. Ordinary `T` inputs and outputs to throw `PayloadRehydrationLimitException` during materialization.
2. Cross-app boundary inlining to fail before the call is sent.
3. `PreferInline` conversion of existing references to fail.
4. Running workflows to fail when replay or a later turn encounters an older reference.

#### Sizing best practices

- **Keep the 16 MiB default** unless measured requirements justify changing it.
- **Allow modest headroom:** Set the limit above your expected serialized payload size with room for natural growth.
- **Account for concurrent memory pressure:** Keep the limit below a size that would cause excessive memory usage when
  multiplied by concurrent resolutions. For example, a 32 MiB limit with 20 concurrent materializations can require
  roughly 640 MiB for payload buffers alone, plus additional allocations during UTF-8 conversion and deserialization.
- **Prefer streaming for larger documents:** Use `PayloadReference<T>` and stream via `OpenAsync` rather than raising
  the in-memory limit indefinitely.
- **Align with transport limits:** If cross-app inlining is expected, ensure materialized payloads also fit the
  configured Dapr runtime and gRPC transport limits, including message overhead. Raising `MaxInMemoryRehydrationSize`
  does not raise transport limits.
- **Test boundary behavior:** Exercise payloads near and just above the configured limit in load and integration tests.

#### Changing `MaxInMemoryRehydrationSize` later

Treat `MaxInMemoryRehydrationSize` as a host compatibility and memory-safety boundary: keep it consistent across all
workers that can process the same workflow versions, and change it only through a reviewed deployment rather than
runtime mutation.

- **Increasing the limit** is generally backward-compatible, but requires reassessing memory concurrency and transport
  limits.
- **Lowering the limit** can break existing workflows whose histories contain references larger than the new value
  (failing during replay, typed state reads, automatic deserialization, `PreferInline` conversion, or cross-app
  inlining). Before lowering it:
  1. Identify the largest referenced payloads used by active workflow instances.
  2. Change large-payload consumers to accept `PayloadReference<T>` and stream content via `OpenAsync`.
  3. Version workflow and activity contracts when changing ordinary `T` inputs to `PayloadReference<T>` inputs.
  4. Keep old workflow versions and their previous limit available until existing instances complete or are retired.
  5. Roll out the lower limit gradually and monitor for `PayloadRehydrationLimitException`.

### Choose a write preference

`BinaryStorePayloadOptions.WritePreference` controls conversion of future outgoing top-level payloads.
It defaults to `PayloadWritePreference.Preserve`; registration alone does not enable automatic payload offloading.

| Preference | Ordinary outgoing value | Outgoing reference |
| --- | --- | --- |
| `Preserve` (default) | Serialize inline; no automatic upload. | Keep the reference. |
| `PreferReference` | Upload if the serialized value meets `OffloadThreshold` at an enabled `OffloadSites` boundary. Otherwise keep inline. | Keep the reference; do not upload it again. |
| `PreferInline` | Serialize inline; no automatic upload. | Resolve to its original serialized content and write that content inline. Fail if resolution cannot complete safely. |

Important policy rules:

- **Future writes only:** Write preferences affect future writes from both new and running workflows. They do not
  rewrite retained history, persist an instance-level setting, infer policy from a workflow's input, or automatically
  version workflows or activities.
- **No object provenance under `Preserve`:** `Preserve` means no automatic outbound conversion. If the SDK resolves a
  reference to an ordinary `T` and your code later returns that `T`, the output is serialized inline as a new value.
  Histories can legitimately contain both inline values and references.
- **Stopping automatic offloading:** Set `WritePreference = PayloadWritePreference.Preserve` (or
  `OffloadSites = PayloadKind.None` under `PreferReference`) to stop automatic reference creation while keeping
  reference reads and explicit `StoreAsync` writes active. To convert outgoing references back to inline data, see
  [Switch back to inline payloads](#switch-back-to-inline-payloads).

### Inbound handling preserves the recorded representation

Inbound handling is independent of `WritePreference` and works the same for local, cross-app, and event inputs:

| Received payload | Receiving contract | Behavior |
| --- | --- | --- |
| Inline data | Ordinary `T` | Deserialize normally. |
| Reference envelope | Ordinary `T` | Resolve and deserialize using registered payload support. |
| Reference envelope | `PayloadReference<T>` | Pass the reference through without automatically materializing it. |
| Inline data | `PayloadReference<T>` | Report a contract mismatch; do not upload data to manufacture a reference. |

Resolving a reference for application code does not rewrite workflow history or mutate retained wire metadata.
Received data also does not establish an outbound preference or prove the sender can consume reference-valued
responses. Unsupported envelope versions, missing data, integrity failures, and buffering-limit violations surface
as errors rather than falling back to ordinary application data.

## Cross-app and external boundaries

### Cross-app input handling

An automatic boundary switch makes binary-store payloads compatible with multi-app workflow calls by default for
top-level inputs. When an activity, child workflow, or detached workflow targets another app (`TargetAppId` differs
from the current app), the SDK marks the boundary as requiring inline data, overriding a host's `PreferReference`
setting:

- An ordinary input is kept inline.
- Any top-level `PayloadReference<T>` is resolved by the source app (after replay filters out already-recorded calls,
  so storage I/O does not run directly inside the deterministic workflow body) and its original serialized payload is
  sent inline before Dapr routes the call, without another deserialize/serialize cycle.

Key scope of the cross-app boundary switch:

- **Top-level cross-app inputs only:** Nested references inside DTO properties, return values/outputs, and propagated
  history are not automatically converted. Because those paths can still carry references, **every .NET application
  participating in a multi-app workflow should register `WithBinaryStorePayloads(...)`** (and never unregister it once
  enabled) to preserve compatibility.
- **Source app read access required:** The source app must have payload support registered and access to the referenced
  object in the binary store.
- **Transport limits still apply:** Normal Dapr, gRPC, scheduler, and state-store message-size limits apply after the
  payload is materialized inline.
- **Per-call opt-out:** Set `AllowPayloadReferences: true` when both apps support references and share access to the
  underlying binary store.

Configure the source app ID correctly: if it is unavailable, any non-empty `TargetAppId` is treated as cross-app and
inlined by default. Explicit same-app targets follow the normal host preference.

#### Use the inline default

For a top-level cross-app input, the sender resolves `reference` and sends ordinary `T` data inline (the sender still
needs `WithBinaryStorePayloads(...)` and storage access to resolve `reference`; if the destination is another .NET
application, register `WithBinaryStorePayloads(...)` there as well to preserve compatibility across return values and
propagated history):

```csharp
var length = await context.CallActivityAsync<int>(
    "MeasureDocumentActivity",
    reference,
    new WorkflowTaskOptions(TargetAppId: "document-service"));
```

#### Explicitly allow references for a known destination

Opt out per call with `AllowPayloadReferences: true` only when all of the following hold:

1. The destination supports the version-1 envelope with compatible payload contracts and serialization settings.
   The JavaScript SDK supports unstaged references from `@dapr/dapr` 3.19.0; it does not implement
   payload-stage reversal. Do not assume other language SDKs support this scheme.
2. The destination registers `WithBinaryStorePayloads(...)` in .NET, or a
   [payload resolver in JavaScript]({{% ref js-workflow-data-references.md %}}#register-a-resolver-on-clients-and-workers)
   (upgrading the SDK alone is not enough).
3. Both apps can access the same underlying storage objects via the named binary-store component in their respective
   sidecars (matching component names pointing to separate in-memory stores do not share data).
4. The sending host uses `Preserve` or `PreferReference` (`PreferInline` still forces inline content).

```csharp
// Activity call
var length = await context.CallActivityAsync<int>(
    "MeasureReferenceActivity",
    reference,
    new WorkflowTaskOptions(
        TargetAppId: "document-service",
        AllowPayloadReferences: true));

// Child workflow call
var childLength = await context.CallChildWorkflowAsync<int>(
    "ReferenceWorkflow",
    reference,
    new ChildWorkflowTaskOptions(
        TargetAppId: "document-service",
        AllowPayloadReferences: true));

// Detached workflow call (uses inline default unless AllowPayloadReferences: true is set)
var detachedId = await context.ScheduleNewDetachedWorkflowAsync(
    workflowName: "DocumentWorkflow",
    instanceId: null,
    input: reference,
    startTime: null,
    options: new WorkflowTaskOptions(TargetAppId: "document-service"));
```

`AllowPayloadReferences` applies only to that call's input and is retained across SDK retries. Detached workflow
options support routing and payload permission only; retry policies and history propagation are rejected.

#### Limits and scope

Cross-app inlining and `PreferInline` are **inline-or-error**, not best-effort fallbacks:

- **Strict validation:** Resolution checks `MaxInMemoryRehydrationSize` (against both declared size and bytes read)
  and verifies the SHA-256 hash when `VerifyIntegrityOnRead` is enabled. Missing storage, unsupported envelopes, or
  limit/integrity failures prevent the call from being submitted; the SDK never silently falls back to sending a
  reference.
- **No recursive or return-path rewriting:** Because only top-level call inputs are converted, plan compatible
  contracts, write preferences, and storage access independently for nested `PayloadReference<T>` properties, return
  values, and propagated history.

### Event payload handling

Event APIs do not expose `TargetAppId` or `AllowPayloadReferences` and instead follow the sender's `WritePreference`:

| Event path | Outgoing policy |
| --- | --- |
| `context.SendEvent` | Uses the workflow host's `WritePreference`. The target instance is in the current app; local events are not forced inline. |
| Client `RaiseEventAsync` | Uses the publishing client's configured `WritePreference`. The destination is determined by the sidecar endpoint configured for that client. |

Under `PreferReference`, automatic event offloading is controlled by `PayloadKind.ExternalEvent` in `OffloadSites`
and `OffloadThreshold`. Inbound events follow the standard
[inbound handling rules](#inbound-handling-preserves-the-recorded-representation).

Because an external application can point a client at a destination's sidecar and call `RaiseEventAsync`, same-app
routing does not guarantee compatible SDK support. When publishing from an external client to an app with unknown
reference support, configure `WritePreference = PayloadWritePreference.PreferInline` on that client (noting that
this applies to all payload writes from that client and follows the same [inline-or-error limits](#limits-and-scope)).

## Migration, rollback, and lifecycle

### Adopt data references in existing workflows

**Automatic offloading is a storage-format change; explicit references are an application-contract change.**

| Approach | Compatibility with existing workflows |
| --- | --- |
| Inline | Unchanged by default. `AddDaprWorkflow(...)` alone does not enable payload offloading. |
| Automatic offloading | Safe to enable for in-flight workflows without versioning. Existing `T` contracts stay unchanged; the SDK reads both historical inline values and new reference envelopes. |
| Explicit references | Changing `T` to `PayloadReference<T>` is a breaking contract change for histories containing inline `T`. Preserve the old contract and introduce `PayloadReference<T>` in a new workflow version. |

#### Enable automatic offloading safely

Enable `WritePreference = PayloadWritePreference.PreferReference` in `WithBinaryStorePayloads(...)`. Historical
inline values remain untouched, and outbound offloading applies only to newly emitted payloads after replay has
consumed recorded actions. Adjusting `OffloadThreshold` between builds is also safe—it only governs newly written
history items and does not affect how existing inline or referenced payloads are resolved. By contrast, do not lower
`MaxInMemoryRehydrationSize` below existing referenced payload sizes; see
[Size and change `MaxInMemoryRehydrationSize` safely](#size-and-change-maxinmemoryrehydrationsize-safely).

#### Introduce explicit references with file-based versioning

Use [name-based workflow versioning]({{% ref dotnet-workflow-versioning.md %}}#name-based-versioning) by copying the
workflow to a new file and giving the class a versioned name (such as `DocumentWorkflowV2`; renaming the file alone
does not create a version):

1. **Add new activities and the V2 workflow.** Create distinctly named activities for any changed `PayloadReference<T>`
   input or output contracts while keeping the original activities registered.
2. **Route new instances to V2.** Configure name-based versioning and keep both workflow versions registered (manual
   registration is no longer needed for workflows as of SDK v1.17.0 or activities as of v1.18.0). V2 can keep the
   original workflow input type `T` and obtain references from its new activities, unless V2 also changes its
   entry-point input to `PayloadReference<T>` (in which case clients must call `StoreAsync` before scheduling V2).

Note that automatic offloading remains host-wide: enabling `PreferReference` on a shared host affects eligible
payloads emitted by both V1 and V2.

#### When patch-based versioning is appropriate

`context.IsPatched(...)` can guard a new branch that calls reference-producing activities while keeping the
workflow's original entry-point input type `T`. It **cannot** guard a change to the workflow's entry-point input
type because the worker deserializes the input before invoking the workflow body.

### Switch back to inline payloads

**Never unregister `WithBinaryStorePayloads(...)`**, either in the primary application or in any .NET application that
participates with it in multi-app workflows. Instead, keep `WithBinaryStorePayloads(...)` and your binary-store
configuration in place so historical workflows that used data references remain readable, and opt out of future
offloading by preferring inline payloads:

- **From automatic offloading (ordinary `T` contracts):** Set `WritePreference = PayloadWritePreference.PreferInline`:
  ```csharp
  builder.Services.AddDaprWorkflow().WithBinaryStorePayloads(options =>
  {
      options.StoreName = "workflow-payloads";
      options.WritePreference = PayloadWritePreference.PreferInline;
  });
  ```
  `PreferInline` keeps future ordinary values inline and resolves any outgoing references before writing, without
  rewriting existing history or disabling reference reads.
- **From explicit references (`PayloadReference<T>` contracts):** Introduce a new workflow version and separately
  named activities that accept ordinary `T` contracts, and stop calling `StoreAsync` in the new path. While old and
  new versions share a host, use `Preserve` (not `PreferInline`, which would inline references still expected by
  the old version's `PayloadReference<T>` receivers) and keep `AllowPayloadReferences: true` on any old cross-app
  calls that still expect references.

### Operate workflows with stored payloads

#### Reading workflow metadata can download payloads

Client methods that fetch inputs and outputs attempt to resolve references before returning, while `ReadInputAs<T>`,
`ReadOutputAs<T>`, and `ReadCustomStatusAs<T>` remain synchronous:

- `state.ReadOutputAs<DocumentPayload>()` returns the deserialized document.
- `state.ReadOutputAs<PayloadReference<DocumentPayload>>()` exposes the retained reference (if the recorded value was
  offloaded), though requesting the reference after fetching metadata does not undo the download already performed by
  the fetch.
- If a payload exceeds `MaxInMemoryRehydrationSize` during metadata fetch, the state retains the reference so you
  can still read `PayloadReference<T>` and stream it via `OpenAsync`, whereas calling `ReadOutputAs<T>()` throws
  `PayloadRehydrationLimitException`. Other read errors (missing objects, integrity failures) fail the metadata fetch
  immediately.

When you only need completion status, avoid downloading inputs and outputs (and keep custom status small, as it is
resolved unconditionally):

```csharp
var state = await client.WaitForWorkflowCompletionAsync(
    instanceId, getInputsAndOutputs: false);

if (state.RuntimeStatus != WorkflowRuntimeStatus.Completed)
{
    throw new InvalidOperationException($"Workflow {instanceId} ended with {state.RuntimeStatus}.");
}
```

#### Retain and clean up payloads

Workflow completion and history purging do **not** automatically delete binary objects, and deleting objects still
referenced by any history, result, child workflow, or rerun will break replay or inspection:

1. **Register a durable manifest:** The default `IWorkflowPayloadManifest` is a no-op. To track objects for cleanup
   across restarts, implement a durable `IWorkflowPayloadManifest` and register it **after**
   `WithBinaryStorePayloads` via `builder.Services.WithPayloadManifest<YourDurableManifest>()`.
2. **Purge after history deletion:** Only after the owning workflow history is purged and no other workflow shares
   its references (forwarding a reference does not transfer ownership or reference-count it), resolve
   `WorkflowPayloadCleaner` and call `PurgeAsync(instanceId)`. Also account for orphaned payloads uploaded via
   `StoreAsync` when a subsequent scheduling call fails.

## Benchmark comparison

The [SDK benchmark](https://github.com/dapr/dotnet-sdk/tree/431e22f34e9384e63995e0e8bd68046837e139a7/benchmarks/Dapr.Workflow.Benchmarks)
compares three ways to process the same **2,000,000-byte serialized document** through **nine sequential
activities**. The first eight activities coordinate work using small values. Only activity nine needs the document,
and all three modes compute the same checksum.

| Case | Workflow input | Storage and materialization |
| --- | --- | --- |
| `Inline` | `BenchmarkDocument` | No payload registration. Full document in workflow history; deserialize at each workflow execution. |
| `Automatic` | `BenchmarkDocument` | Data in the binary store, references in history. Automatically retrieve and deserialize for each execution and the processing activity. |
| `References` | `PayloadReference<BenchmarkDocument>` | Replay only the reference. Retrieve and deserialize once, in activity nine. |

The current benchmark explicitly selects `PreferReference` for `Automatic` and `Preserve` for `References`.
The following sample results are not a latency or throughput guarantee:

| Mode | Median total ms | Median execution ms | Min..max total ms | Workflow protobuf bytes | Binary download bytes | Document deserializations | Allocated bytes | Total speedup |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| Inline | 302.9 | 302.9 | 269.0..370.2 | 12,010,505 | 0 | 11 | 74,661,448 | 1.00x |
| Automatic | 224.9 | 202.9 | 175.2..769.2 | 12,254 | 22,000,000 | 11 | 103,614,880 | 1.35x |
| References | 122.7 | 113.4 | 109.6..204.6 | 12,288 | 2,000,000 | 1 | 14,869,544 | 2.47x |

Except for the min/max range, the measurements shown are medians. Total time includes preparation and execution.
Both offloaded cases explicitly store the initial document before scheduling so that preparation
(serialization/upload) can be measured separately. Execution time covers scheduling through completion, including
any subsequent offloading. Total speedup is the inline median total time divided by the mode's median total time.

### What the results justify

- **Smaller workflow traffic with either offloading approach:** measured workflow protobuf bytes fell by about
  **99.9%**, from 12.01 MB to about 12.3 KB. This is workflow message traffic, not the persisted history size or total
  network traffic.
- **Automatic offloading allocates more than inline:** it was **1.35x faster** in this run (25.8% less
  total time), but deserialized the document 11 times, downloaded 22 MB, and allocated **1.39x** as many managed
  bytes as inline processing.
- **Deferring materialization matters:** explicit references were **2.47x faster** than inline processing (59.5%
  less total time) and allocated **80.1% fewer managed bytes**. Compared with automatic offloading, document
  deserializations dropped from 11 to 1 and binary downloads dropped by **90.9%**, from 22 MB to 2 MB.
- **Median speedups do not eliminate timing variability:** the total-time ranges for automatic offloading
  (175.2..769.2 ms) overlap those for both inline (269.0..370.2 ms) and explicit references (109.6..204.6 ms).
  Median speedups do not imply that every run is faster than another mode.

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
