---
type: docs
title: "Workflow serialization in the JavaScript SDK"
linkTitle: "Workflow serialization"
weight: 1400
description: Configure payload serialization consistently across JavaScript workflow clients and workers
---

The JavaScript SDK uses JSON by default. With `@dapr/dapr` **3.19.0-rc.4 or later**, clients and workers can
share a custom `IDaprSerializer` through their `serializer` option. Serializer selection is client-side;
it does not by itself require binary-store support.

## Default JSON behavior

Workflow payloads use `JSON.stringify` and `JSON.parse`. Use JSON-compatible application contracts:
dates deserialize as strings, prototypes are not reconstructed, `BigInt` requires explicit handling,
and cyclic values cannot be serialized. TypeScript generics describe the expected result but do not
validate or instantiate that type at runtime.

`WorkflowState.getInput<T>()`, `getOutput<T>()`, and `getCustomStatus<T>()` use the client's serializer.
Their serialized counterparts are strings, not parsed application values.

## Configure a serializer

The serializer contract converts values to and from **strings**:

```typescript
import {
  DaprWorkflowClient,
  JsonSerializer,
  WorkflowRuntime,
  type IDaprSerializer,
} from "@dapr/dapr";

const serializer: IDaprSerializer = new JsonSerializer();
const options = { daprHost: "127.0.0.1", daprPort: "50001", serializer };
const client = new DaprWorkflowClient(options);
const runtime = new WorkflowRuntime(options);
```

For a custom format, implement `serialize<T>(value: T): string` and
`deserialize<T = unknown>(data: string): T`. An optional `contentType` identifies the media type for
SDK APIs that use it; it is not a workflow wire-format negotiation mechanism. Binary formats can use
Base64 to satisfy the string contract, at the cost of added size. Serialize deterministically and throw
on invalid input rather than silently returning defaults.

{{% alert title="Persisted-history compatibility" color="warning" %}}
Deploy compatible serializers to every client, activity worker, and workflow worker that participates in
the workflow. Changing the encoding or schema can break existing histories, results, events, and reruns.
The SDK does not automatically migrate persisted data or negotiate formats across apps. Keep the old
decoder available or introduce a separate workflow contract and registration name.
{{% /alert %}}

For cross-language workflows, agree on the wire format and property names. The default JavaScript JSON
behavior is not a replacement for the .NET SDK's case-insensitive deserialization or other language-specific
conversion rules.

## Combine serialization with data references

[Workflow data references]({{% ref js-workflow-data-references.md %}}) offload the serialized UTF-8 string to
a binary store. Offloading is separate from choosing a serializer and is evaluated **after serialization**.
The reference envelope itself is versioned JSON, independent of the application serializer.

Supply the same serializer to the `BinaryStoreWorkflowPayloadResolver` and all clients and workers.
When a workflow client or runtime has `payloads` but no explicit `serializer`, it uses `payloads.serializer`.
An explicit `serializer` overrides that choice; do not configure incompatible serializers in those two places.
Only top-level `PayloadReference` objects receive special envelope handling, not references nested within
an application object.
