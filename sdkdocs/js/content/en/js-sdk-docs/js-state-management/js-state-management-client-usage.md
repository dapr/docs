---
type: docs
title: "State client usage"
linkTitle: "Client usage"
weight: 53100
description: Configuration, options, serialization, response shapes, and protocol-specific behavior of the JavaScript state client
---

State management is available through `DaprClient.state`. This page describes the implementation in **3.19.0-rc.4** and the behavior to account for when using that package or a later compatible release.

## Client lifetime and configuration

Reuse a long-lived `DaprClient` instead of constructing one per operation. Await outstanding requests before calling `await client.stop()` during shutdown.

HTTP is the default protocol. To use gRPC:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

For HTTP, use `CommunicationProtocolEnum.HTTP` and the sidecar's HTTP port, normally `"3500"`. Port options are strings.

When explicit host and port options are omitted, the client can read `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT` for the selected protocol. Otherwise it uses host/port options with defaults of `127.0.0.1` and `DAPR_HTTP_PORT` or `DAPR_GRPC_PORT` (normally `3500` and `50001`). The API token defaults to `DAPR_API_TOKEN`.

## Choose an operation

Every method takes a state store component name as its first argument.

| Method | Purpose | Successful result |
|--------|---------|-------------------|
| `save(storeName, items, options?)` | Save one or more key/value items. | `{}` |
| `get(storeName, key, options?)` | Read a single value. | The value, not an item containing an ETag. |
| `getBulk(storeName, keys, options?)` | Read values and ETags for multiple keys. | Array of result items. |
| `delete(storeName, key, options?)` | Delete one key, optionally checking an ETag. | `{}` |
| `deleteBulk(storeName, items, options?)` | Delete multiple keys without supplying values. | `{}` |
| `transaction(storeName, operations?, metadata?)` | Atomically execute upserts and deletes in a supporting store. | `undefined` (`Promise<void>`). |
| `query(storeName, query)` | Filter, sort, and paginate a supporting store. | `{ results, token? }` |

The SDK does not expose a separate single-item save, a `getWithETag` method, a boolean-returning conditional write, or a generic `get<T>` method. Use a one-element array for single saves and bulk reads that need an ETag. The broadly typed read results do not perform runtime schema validation.

## State options

Import `StateConsistencyEnum` and `StateConcurrencyEnum` from `@dapr/dapr` rather than passing the HTTP wire-format strings:

| Option | Values | Meaning |
|--------|--------|---------|
| `consistency` | `CONSISTENCY_UNSPECIFIED`, `CONSISTENCY_EVENTUAL`, `CONSISTENCY_STRONG` | Select the store default, eventual consistency, or strong consistency. |
| `concurrency` | `CONCURRENCY_UNSPECIFIED`, `CONCURRENCY_FIRST_WRITE`, `CONCURRENCY_LAST_WRITE` | Select the store default, detect conflicting writes with ETags, or use last-write-wins behavior. |

These are members of the corresponding enum. Support depends on the state store. ETags are opaque version strings; do not invent or increment them.

Options have different locations depending on the operation:

| Operation | Where to put options |
|-----------|----------------------|
| `save` | Each item's `options: { concurrency, consistency }` and optional string `etag`. The final argument accepts shared `metadata` only. |
| `get` | Final argument: `{ consistency, metadata }`, with either field optional. |
| `getBulk` | Final argument: `{ parallelism, metadata }`. There is no consistency option. |
| `delete` | Final argument: `{ concurrency, consistency, etag, metadata }`, with fields optional. |
| `deleteBulk` | Each item's `options`, `etag`, and `metadata`; final argument accepts shared `metadata` only. |
| `transaction` | Each operation's `request.options`; transaction-wide metadata is the third argument. See the limitations below. |

When supplying an item's `options` from TypeScript, its `IStateOptions` type requires both `concurrency` and `consistency`. Use the respective `UNSPECIFIED` enum member when you want the store default for one of them.

## Metadata and TTL

Use string key/value metadata supported by the component, such as `ttlInSeconds`, `partitionKey`, or `contentType`. State metadata is not an arbitrary HTTP header collection.

| Operation | HTTP behavior | gRPC behavior |
|-----------|---------------|---------------|
| `save` | Sends item metadata in the body and shared metadata as query parameters. | Merges shared metadata into each item, overriding duplicate keys. |
| `get` | Forwards `options.metadata`. | Does **not** forward `options.metadata` in this implementation. |
| `getBulk` | Forwards `options.metadata`. | Forwards `options.metadata`. |
| `delete` | Forwards `options.metadata`. | Does **not** forward `options.metadata` in this implementation. |
| `deleteBulk` | Merges shared metadata over item metadata, then forwards it in individual deletes. | Merges shared metadata over item metadata in one bulk-delete RPC. |
| `transaction` | Forwards transaction-wide metadata and each request's metadata. | Forwards transaction-wide metadata, but not each request's metadata. |
| `query` | No separate metadata argument. | No separate metadata argument. |

For saves, shared metadata takes precedence over matching item metadata keys. TTL values belong in metadata, not in state options. See [state store TTL]({{% ref state-store-ttl.md %}}).

If a component requires per-request metadata to locate an entry, do not assume single-key reads and deletes behave identically across protocols. Use HTTP for those calls, or use `getBulk` and `deleteBulk` with metadata where appropriate.

## Response shapes

### Single read

`get` returns the deserialized value, or text if the default JSON parse fails. It does not return the HTTP headers or the gRPC response envelope. A missing key returns an empty string in the standard no-data response, not a guaranteed `undefined` or `null`.

Do not use a truthiness check to distinguish a missing key from a legitimate stored value such as `false`, `0`, or `""`. If your application needs an unambiguous presence check, store a document envelope and use a bulk read to examine the item and ETag, taking the component's capabilities into account.

### Bulk read

Items contain `key`, `data`, and an optional `etag`. HTTP returns the runtime's item objects, which may also include `error` and `metadata`. A missing HTTP item's data can be absent or `null`; gRPC maps empty data to `""`.

Without a configured serializer, gRPC bulk reads return only `key`, `data`, and `etag`; per-item `error` and `metadata` are not preserved by that mapping. With a serializer configured, gRPC preserves those fields as well. Where available, inspect each item's `error` even when the overall request succeeded. Match items by key, not array position.

Set `parallelism` explicitly if your application needs a particular concurrency limit for bulk reads. When it is omitted, the protocols differ in this implementation: gRPC sends the SDK default of `10`, while HTTP omits the field and the runtime default applies.

### Writes and deletes

`save`, `delete`, and `deleteBulk` return a `StateSaveResponseType`: an empty object on success, with an optional `error` on HTTP failure. They do not return a new ETag. Read it again before the next conditional update.

### Query

`query` returns `results` and an optional pagination `token`. Each result has `key`, `data`, and optional `etag` and `error`. Data decoding depends on protocol and serializer configuration; see [query guidance]({{% ref js-state-management-query.md %}}).

## Bulk deletion

`deleteBulk` accepts a readonly array of items shaped like save items **without** the required `value`. Existing key/value arrays are also accepted; their values are ignored and the serializer is not invoked.

HTTP sends individual deletes concurrently and waits for all requests to finish. It returns the first error in **input order**, not necessarily the first request to fail. gRPC sends one `DeleteBulkState` RPC and rejects on RPC failure. An empty batch returns `{}` without initializing the sidecar connection.

Bulk deletion is not atomic on either protocol. A reported failure does not mean no keys were deleted, and the response does not provide a complete per-key outcome list. Reconcile partial completion if your application needs to retry safely.

## Transactions

Use `upsert` and `delete` operation names. The underlying component must support transactions; `save` and `deleteBulk` do not provide equivalent atomicity.

There are important differences in this implementation:

- Without an explicit serializer, gRPC transaction upserts pass the supplied value to `Buffer.from` rather than applying `save`'s object serialization. Configure `JsonSerializer` for object-valued transactions, or supply appropriately encoded data for that protocol.
- gRPC does not forward individual `request.metadata` fields. Use transaction-wide metadata where the component supports it.
- The transaction request type declares `etag` as `{ value: string }`, but the gRPC implementation calls `toString()` on that object rather than reading its `value`. Do not rely on transaction ETags for portable conditional writes in this release. Use the documented single-item save/delete pattern when atomic multi-key conditions are not required, or verify a later SDK fix before relying on conditional transactions.

## Serialization

With no serializer configured, the SDK retains its legacy behavior:

| Operation | HTTP | gRPC |
|-----------|------|------|
| Save | Values are part of a JSON request body. | Objects are JSON-stringified; primitives are converted to strings. |
| Get | Parses JSON when possible, otherwise returns text. | Parses JSON when possible, otherwise returns text. |
| Bulk get | Returns the runtime's JSON item data. | Parses each item's bytes as JSON when possible, otherwise returns text. |
| Query | Returns the runtime's JSON item data. | Returns raw `Uint8Array` item data. |

For consistent JSON value encoding, explicitly configure the exported `JsonSerializer`:

```javascript
import { DaprClient, JsonSerializer } from "@dapr/dapr";

const client = new DaprClient({
  serializer: new JsonSerializer(),
});
```

The serializer is a **client-wide** setting, not a per-state-call option. For state, it serializes saved values and transaction upsert values, and deserializes values returned by single reads, bulk reads, and queries. It does not serialize keys, ETags, metadata, delete values, or query filter expressions.

TypeScript applications can implement the exported `IDaprSerializer` interface, with synchronous `serialize<T>(value): string` and `deserialize<T>(data: string): T` methods and an optional `contentType`. A JSON media type (the default, `application/json`, or a `+json` media type) must produce valid JSON. A non-JSON serializer's output is stored as a JSON string inside the Dapr envelope; encode binary formats as text, for example using base64. This does not turn state management into a streaming file API.

The serializer's `contentType` controls SDK encoding; it does not automatically add state component `contentType` metadata. Supply that metadata explicitly when required by the store, such as when storing queryable JSON documents.

All readers and writers must agree on the stored representation. Opting in to `JsonSerializer` can change existing string behavior, especially gRPC values previously stored as unquoted text. Test old data and cross-protocol readers before migrating. Custom serializers can also change which document fields are available to state queries. Type parameters do not supply runtime schema validation or automatically restore class instances.

## Error handling

Await operations and handle both returned write errors and promise rejections:

```javascript
try {
  const result = await client.state.save("statestore", [
    { key: "widget-a", value: { color: "blue" } },
  ]);
  if (result.error) {
    throw result.error;
  }
} catch (error) {
  console.error("Could not save widget-a:", error);
  throw error;
}
```

This snippet assumes an existing `client` and an async function or ES module.

| Failure path | Behavior |
|--------------|----------|
| HTTP `save` and `delete` request failures | Logged by the SDK and returned as `{ error }`. |
| HTTP `deleteBulk` request failures | Individual deletes log failures; the bulk call returns the first error in input order after all deletes finish. |
| HTTP `get`, `getBulk`, `transaction`, and `query` request failures | Reject the promise. |
| gRPC state RPC failures | Reject the promise, preserving the transport error, normally a `ConnectError`. |
| Serialization or local request construction failures | Can reject before a request is sent, including on write operations. |

HTTP runtime errors normally have a JSON-encoded `Error.message` with `status`, `error`, and `error_msg`. Transport errors can have other shapes; do not unconditionally parse every error message as JSON. Do not interpret gRPC error codes as HTTP status codes.

An ETag conflict is an error, not a `false` result. Read or query calls can also succeed at the request level while containing item-level errors. Avoid retrying a whole non-atomic batch without considering partial completion.

## Cancellation

The state methods in this release do **not** accept an `AbortSignal`, cancellation token, or per-operation deadline. Do not copy the Binary Store client's `signal` option into state calls. Racing a promise against a timer does not cancel the underlying state request. Use runtime [resiliency policies]({{% ref resiliency-overview.md %}}) where appropriate for component timeouts and retries, accounting for the semantics of the operation.
