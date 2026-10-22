---
type: docs
title: "Vector client usage"
linkTitle: "Client usage"
weight: 53100
description: Essential guidance for configuring and using the JavaScript Vector client
---

Vector is available through `DaprClient.vector` in JavaScript SDK 3.19.0 or later. Both HTTP and gRPC use the alpha Vector API and require a Vector-capable Dapr runtime from the 1.19 release line or later. Installing the JavaScript SDK alone does not enable the Vector API.

## Client lifetime and configuration

Reuse a long-lived `DaprClient` rather than creating a client for each operation. Await outstanding operations before calling `await client.stop()` during application shutdown.

The default protocol is HTTP. To explicitly configure a gRPC connection:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

Use `CommunicationProtocolEnum.HTTP` and the sidecar's HTTP port (by default `"3500"`) for HTTP. Supply port values as strings.

When you omit explicit host and port options, the SDK can use `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT` for the selected protocol. Otherwise, it uses the configured host and port, falling back to `127.0.0.1` and `DAPR_HTTP_PORT` or `DAPR_GRPC_PORT` (defaults: `3500` and `50001`). The API token defaults to `DAPR_API_TOKEN` if `daprApiToken` is not supplied. Vector requests use the same authentication settings as other client operations.

## Choose an operation

Every method takes a component name. Collection-bound operations also take a collection name. The options object is the last argument.

| Method | Result |
|--------|--------|
| `createCollection(storeName, collection, options)` | `Promise<void>` |
| `getCollection(storeName, collection, options?)` | `Promise<VectorCollection>` |
| `listCollections(storeName, options?)` | `Promise<string[]>` |
| `deleteCollection(storeName, collection, options?)` | `Promise<void>` |
| `upsertVectors(storeName, collection, records, options?)` | `Promise<VectorUpsertResult>` |
| `getVectors(storeName, collection, ids, options?)` | `Promise<VectorRecord[]>` |
| `deleteVectors(storeName, collection, ids, options?)` | `Promise<VectorIndexAck>` |
| `queryVectors(storeName, collection, query, options?)` | `Promise<VectorQueryResult>` |
| `batchQueryVectors(storeName, collection, queries, options?)` | `Promise<VectorBatchQueryResult[]>` |

TypeScript applications can import these result types, `IClientVector`, `VectorRecord`, `VectorQuery`, `VectorDistanceMetric`, `VectorOptions`, `VectorCreateCollectionOptions`, `VectorIndexingOptions`, `VectorError`, and `VectorErrorDetail` as types from `@dapr/dapr`.

`VectorOptions` provides `metadata?: Readonly<Record<string, string>>` and `signal?: AbortSignal`. Request metadata is component-specific and string-valued; it is separate from the structured, filterable metadata attached to each record.

## Collections and records

Creating a collection requires `dimensions`, a positive integer no greater than `4294967295`. Supported metric names are `"cosine"`, `"dotProduct"`, and `"euclidean"`. Omitting `metric` selects the component's documented default; a metric the component does not support is rejected by the runtime as an invalid argument. The `metadata` passed to `createCollection` carries component-specific collection settings, such as index parameters. `getCollection` returns the collection's `dimensions`, its effective `metric`, an approximate `recordCount` (which some components report as `0`), and component-specific `properties`. Component capabilities and limits can be narrower than the SDK's accepted inputs.

The alpha API covers dense vectors only. Sparse or named vectors, hybrid fusion, and result pagination are not available.

A `VectorRecord` contains a nonempty string `id`, a `values` array of numbers, optional `payload` bytes, and optional structured JSON `metadata`. IDs are scoped to a collection. Upserting an existing ID replaces its record rather than merging individual fields; supply all values, payload, and metadata you want to retain.

Provide dense embeddings as ordinary number arrays, not `Float32Array`. Coordinates must be finite and within the finite float32 range; float32 serialization can round them. Vector lengths must match the collection's dimensions, and components typically reject zero-magnitude vectors for cosine similarity. Dimension mismatches and other runtime record validation failures can appear in `failedItems` rather than rejecting the upsert.

Payloads accept `Uint8Array` or Node.js `Buffer` and are returned as `Uint8Array`. The SDK does not apply a custom serializer or generate embeddings from payloads. Encode and decode application content explicitly. Record metadata and query filters must be JSON objects.

`getVectors` always retrieves payloads and metadata. Set `{ includeValues: true }` to retrieve embeddings; otherwise `values` is an empty array. Missing IDs are omitted, and found records retain request order. Deleting missing IDs succeeds.

## Indexing acknowledgements and partial failures

`upsertVectors` and `deleteVectors` accept `VectorIndexingOptions`. The default mode, `"returnOnAcceptance"`, allows a write to return before indexing completes. An acknowledgement of `"queued"` means work was accepted, not that it succeeded or is queryable. Queued work can still fail later; this API does not expose its eventual result.

For a read-after-write flow, explicitly wait for completion:

```javascript
const write = await client.vector.upsertVectors(
  "vectorstore",
  "documents",
  [{ id: "doc-1", values: [1, 0, 0], metadata: { category: "guide" } }],
  {
    mode: "waitForCompletion",
    waitTimeout: "10s",
    onWaitTimeout: "failRequest",
  },
);

if (write.failedItems.length > 0) {
  console.error("Failed records:", write.failedItems);
  throw new Error("Vector upsert had partial failures");
}
if (write.ack !== "completed") {
  throw new Error("Vector indexing has not completed");
}
```

This snippet assumes an existing `client` and collection. Run it inside an async function or an ES module.

Waiting requires a positive protobuf duration string, such as `"10s"` or `"0.250s"`, and an explicit timeout action. `waitTimeout` must be shorter than the remaining request deadline. When the store has a resiliency timeout policy, it must be shorter than that timeout by at least a tenth of the timeout and by no less than 100 milliseconds.

| `onWaitTimeout` | Behavior |
|-----------------|----------|
| `"continueAsync"` | Return a `"queued"` acknowledgement if the wait expires; work can continue asynchronously. Invalid when the component has no queued acknowledgement. |
| `"failRequest"` | Fail the request with a deadline-exceeded error (HTTP `504`, gRPC `DeadlineExceeded`) if the wait expires. Provider-side work is not guaranteed to be cancelled. |

Do not supply `waitTimeout` or `onWaitTimeout` with `"returnOnAcceptance"` or without explicitly selecting `"waitForCompletion"`; the SDK rejects these combinations before sending the request.

`upsertVectors` returns `{ ack, failedItems }`. Inspect `failedItems` even when the promise resolves and `ack` is `"completed"`: completion does not mean every record succeeded. Each failed item contains its `id` and a structured `error`. Failures reported are those known at the acknowledgement boundary; a queued acknowledgement is not a final per-record report.

`deleteVectors` returns only `"queued"` or `"completed"`. Empty upsert and delete arrays are supported. Duplicate IDs in an upsert request are rejected by the runtime; do not rely on last-write-wins ordering within a batch.

## Queries, scores, and inclusion flags

A `VectorQuery` requires exactly one source: `vector: number[]` or `byId: string`. A `vector` array must be nonempty; the runtime rejects an empty array as an invalid argument. The remaining fields are optional:

| Field | Behavior |
|-------|----------|
| `topK` | Nonnegative uint32. Omitted or `0` uses the component's default match count. |
| `filter` | Portable filter DSL applied to record metadata, including dotted paths. Payloads are not filterable. |
| `includeValues` | Defaults to `false`; omitted embeddings are returned as `values: []`. |
| `includePayload` | Defaults to `false`; omitted payloads are returned as `undefined`. |
| `metric` | Omission uses the collection's metric. Unsupported overrides fail explicitly. |
| `scoreThreshold` | Finite, inclusive cutoff on the metric's unnormalized scale. |

Record metadata is returned with query matches independently of the values and payload flags. The result is `{ matches, metric }`; each match contains `{ record, score }`, and `metric` identifies the effective metric even when the query omitted it.

Cosine and dot product scores are higher-is-better; Euclidean distances are lower-is-better. Thresholds are minimum scores for cosine and dot product, and maximum distances for Euclidean. Do not treat scores as normalized probabilities or compare scores across different metrics as though they shared a scale. Whether a `byId` query returns the source record itself is component-dependent.

All queries in `batchQueryVectors` target the same store and collection, with their own query fields. Results preserve request order and contain exactly one of `{ response: VectorQueryResult }` or `{ error: VectorError }`. An empty query array returns an empty result array. Inspect every slot; individual runtime/provider failures do not reject the entire batch, but request-wide failures do.

## Cancellation

Every vector operation accepts `signal` in its options object. Pass an `AbortSignal` to cancel a request when an application deadline expires or a caller disconnects:

```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30_000);

try {
  const result = await client.vector.queryVectors(
    "vectorstore",
    "documents",
    { vector: [1, 0, 0], topK: 5 },
    { signal: controller.signal },
  );
  console.log(result.matches);
} finally {
  clearTimeout(timeout);
}
```

This snippet assumes an existing `client` and collection. Run it inside an async function or an ES module. Cancellation rejects the request but does not guarantee cancellation or rollback of provider-side indexing work. Do not assume both protocols report cancellation with the same error class.

## Errors

Await each operation and handle request failures at your application's error boundary. Check both `upsertVectors().failedItems` and each `batchQueryVectors()` result for failures that do not reject the call.

- **HTTP request failures:** Runtime failures are JavaScript `Error` instances whose `message` is a JSON string containing `status` (HTTP status code), `error` (status text), and `error_msg` (runtime response body). Transport and cancellation errors can have different shapes; do not assume every error message is JSON.
- **gRPC request failures:** Runtime failures preserve `ConnectError` codes from `@connectrpc/connect`. Do not handle them as HTTP status codes.
- **Structured item/query failures:** `VectorError` contains a canonical non-OK `google.rpc.Code` number (`1` through `16`), a `message`, and `details`. These codes are not HTTP status codes. Each detail contains `typeUrl` and `value`: HTTP preserves protobuf JSON fields without `@type`, while gRPC preserves the original protobuf bytes as `Uint8Array`.
- **Invalid arguments:** Empty store/collection names or record IDs, store/collection names equal to `.` or `..`, invalid payload types, unsupported metric names, nonfinite numbers, invalid JSON, and ambiguous query sources are rejected before the request is sent. Invalid dimensions, `topK`, or coordinates outside the finite float32 range are also rejected. Type and range failures use `TypeError` or `RangeError`; malformed protobuf duration strings can produce parser errors.

Creating an existing collection (HTTP `409`, gRPC `AlreadyExists`), accessing a missing collection or querying by a missing ID (HTTP `404`, gRPC `NotFound`), unsupported component capabilities, and invalid filters (HTTP `400`, gRPC `InvalidArgument`) cause runtime failures. In a batch, a missing `byId` source fails only that slot with `VectorError` code `5`. A valid query with no matches instead returns an empty `matches` array. Collection counts exceeding JavaScript's safe integer range and malformed responses are rejected rather than silently losing precision or substituting defaults.

See the [Vector how-to guide]({{% ref js-vector-howto.md %}}) for complete setup and runnable examples.
