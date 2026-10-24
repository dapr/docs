---
type: docs
title: "Search client usage"
linkTitle: "Client usage"
weight: 53100
description: Essential guidance for configuring and using the JavaScript Search client
---

Search is available through `DaprClient.search` in JavaScript SDK 3.19.0 or later and requires Dapr runtime 1.19 or later. HTTP and gRPC use the alpha Search API and expose the same methods and JavaScript result shapes.

## Client lifetime and configuration

Reuse a long-lived `DaprClient`. Await outstanding operations before calling `await client.stop()` during application shutdown.

HTTP is the default protocol. To explicitly configure gRPC:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

For HTTP, use `CommunicationProtocolEnum.HTTP` and the sidecar's HTTP port (default `"3500"`). Port values are strings. When host and port are not explicitly supplied, the SDK can use `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT` for the selected protocol, or fall back to the host and port defaults and `DAPR_HTTP_PORT` or `DAPR_GRPC_PORT`. The API token defaults to `DAPR_API_TOKEN`. See [client configuration]({{% ref "js-client#environment-variables" %}}).

## Choose an operation

`storeName` is the search component's `metadata.name`. All methods except `listIndexes` also take an index name. The optional options object is the last argument.

| Method | Result |
|--------|--------|
| `createIndex(storeName, index, options?)` | `Promise<void>` |
| `getIndex(storeName, index, options?)` | `Promise<SearchIndex>` |
| `listIndexes(storeName, options?)` | `Promise<string[]>` |
| `deleteIndex(storeName, index, options?)` | `Promise<void>` |
| `indexDocuments<T>(storeName, index, documents, options?)` | `Promise<IndexDocumentsResult>` |
| `getDocuments<T>(storeName, index, ids, options?)` | `Promise<SearchDocument<T>[]>` |
| `deleteDocuments(storeName, index, ids, options?)` | `Promise<IndexAck>` |
| `search<T>(storeName, index, query?, options?)` | `Promise<SearchResult<T>>` |

TypeScript applications can import `IClientSearch`, `SearchOptions`, `IndexingOptions`, `SearchDocument`, `SearchIndex`, `SearchQuery`, `SearchResult`, `IndexAck`, and `IndexDocumentsResult` as types from `@dapr/dapr`.

Every operation accepts `SearchOptions`: `metadata?: Readonly<Record<string, string>>` and `signal?: AbortSignal`. This metadata is component-specific **request metadata**, separate from stored document metadata. For example, `createIndex` uses it for provider-specific index settings. The SDK handles HTTP body or query-string placement and gRPC request fields.

`indexDocuments` and `deleteDocuments` accept `IndexingOptions`, which extends those options with write acknowledgement controls. `getDocuments` also accepts `includeContent?: boolean`.

## Document content and TypeScript types

`SearchDocument<T>` contains `id: string`, optional `content: T`, and optional string-map `metadata`. Content must serialize to a JSON object for indexing. The SDK uses JSON serialization independently of the application's custom `DaprClient` serializer, converts content to UTF-8 bytes, and decodes returned content automatically. Do not pass pre-encoded base64 or JSON text as content.

Returned `content` is undefined unless requested with `includeContent: true` on `getDocuments` or on the search query. Stored metadata defaults to an empty object when absent. It is returned unchanged and is never indexed, searched, or filtered.

Generics describe the returned content at compile time; they do not validate documents at runtime. Content defaults to `unknown` when a type is not supplied. In TypeScript, annotate reusable option objects to retain their string-literal types:

```typescript
import type { IndexingOptions, SearchDocument, SearchQuery } from "@dapr/dapr";

type Article = { title: string; category: string; price: number };

const documents: SearchDocument<Article>[] = [
  { id: "doc-1", content: { title: "Dapr guide", category: "guide", price: 10 } },
];
const waitOptions: IndexingOptions = {
  mode: "waitForCompletion",
  waitTimeout: "10s",
  onWaitTimeout: "failRequest",
};
const query: SearchQuery = {
  text: "dapr",
  includeContent: true,
  returnFields: ["title", "price"],
};

const indexed = await client.search.indexDocuments(storeName, indexName, documents, waitOptions);
if (indexed.failedItems.length > 0) {
  console.error("Documents not indexed:", indexed.failedItems);
  throw new Error("Document indexing had item failures");
}
const result = await client.search.search<Pick<Article, "title" | "price">>(
  storeName,
  indexName,
  query,
);
for (const hit of result.hits) {
  console.log(hit.document.content?.title);
}
```

This snippet assumes an existing `client`, `storeName`, and `indexName`. Use a content type that reflects the selected `returnFields`, not the complete stored document type, when projecting fields.

## Write acknowledgements and partial failures

Indexing documents and deleting documents can be asynchronous. `IndexAck` is `"queued"` or `"completed"`; these are SDK strings, not the protobuf enum names used by raw HTTP requests.

| Options | Behavior |
|---------|----------|
| Omitted, or `mode: "returnOnAcceptance"` | Return when the provider accepts the write. `"queued"` does not mean the documents are searchable or deleted yet. A provider can return `"completed"` if work is already finished. |
| `mode: "waitForCompletion"` | Wait for completion up to `waitTimeout`. Requires both a positive protobuf duration, such as `"10s"` or `"0.250s"`, and an explicit `onWaitTimeout`. |
| `onWaitTimeout: "continueAsync"` | On wait timeout, return `"queued"` and let provider-side work continue. Requires a provider that supports queued acknowledgement. |
| `onWaitTimeout: "failRequest"` | On wait timeout, reject with `DEADLINE_EXCEEDED`. Provider-side work may still complete. |

Do not supply `waitTimeout` or `onWaitTimeout` without `mode: "waitForCompletion"`. Keep `waitTimeout` shorter than the request deadline. If a component resiliency timeout is configured, leave a margin of at least 10% of that timeout and at least 100 ms, as described in the [Search API overview]({{% ref "search-overview.md#write-acknowledgements" %}}).

`indexDocuments` resolves to `{ ack, failedItems }`. Always inspect `failedItems`, even when the promise resolves and `ack` is `"completed"`. Each failure contains `id`, numeric `errorCode` (a canonical non-OK `google.rpc.Code`), `errorMessage`, and `details`. For example, non-object content can produce an item failure with code `3` (`INVALID_ARGUMENT`) while valid documents in the same batch are indexed.

Only failures known at the acknowledgement boundary are returned. Queued work can fail later, and this API does not provide an operation handle or a method to retrieve its eventual outcome. Use completion mode when subsequent operations depend on write visibility. `deleteDocuments` returns the acknowledgement string directly, not `{ ack }`.

Document IDs must be non-empty and unique within a write request. Duplicate IDs reject the request rather than producing partial item failures. Upserting the same IDs allows idempotent retries, but do not assume a timeout, cancellation, or failed wait means the provider rolled back the write.

## Query options

Pass `SearchQuery` directly as the third argument of `client.search.search`, not inside a `{ query: ... }` wrapper.

| Field | Behavior |
|-------|----------|
| `text` | Portable full-text search string. Mutually exclusive with `native`. |
| `native` | Provider-native JSON query object. Mutually exclusive with `text`. |
| `filter` | Portable JSON filter over content fields. Supports `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$and`, `$or`, and `$not`. Dotted paths address nested fields. |
| `topK` | Page size. Omitted or `0` uses the provider default. Must be an integer from `0` to `4294967295`; providers can impose smaller limits. |
| `continuationToken` | Opaque token from the previous page. Pass it unchanged with the same query shape. |
| `includeContent` | Defaults to `false`. Set to `true` to return document content. |
| `returnFields` | Content fields to project. Does not implicitly enable `includeContent`. |
| `searchFields` | Fields to search with the portable text query. |
| `sort` | Ordered `{ field, order?: "asc" \| "desc" }` clauses. Omitted order means ascending. |
| `highlightFields` | Fields for which to return highlighted fragments. |

Omitting both `text` and `native`, or omitting the query entirely, matches all documents subject to `filter`. A field assigned directly to a value in a filter is an equality test; conditions in the same object are ANDed. See the [portable filter language]({{% ref "search-overview.md#filter-language" %}}).

Provider capabilities determine supported query options and field restrictions. Meilisearch requires filterable and sortable attributes to be declared at index creation. Native query syntax is provider specific and is not portable between components.

## Results and pagination

`SearchResult<T>` has the following fields:

| Field | Meaning |
|-------|---------|
| `hits` | Array of `{ document: SearchDocument<T>, score: number, highlights: Record<string, string> }`. Empty when there are no matches. |
| `totalHits` | Optional best-effort count. Undefined when unavailable, not necessarily `0`. |
| `totalHitsRelation` | `"exact"`, `"lowerBound"`, `"estimate"`, or `"unspecified"`. Describes the accuracy of `totalHits`. |
| `continuationToken` | Optional token for the next page. Stop paginating when no token is returned. |

Scores are provider-specific, unnormalized values. Compare them only within the same result set. Highlight fragments are provider-generated strings, not a substitute for content; handle them appropriately before rendering in an application.

For each subsequent page, copy the original query and change only `continuationToken`. Changing text or native queries, page size, filters, sort, or field options invalidates the token. If a provider cursor expires, the runtime reports `FAILED_PRECONDITION` with reason `SEARCH_CONTINUATION_EXPIRED`; start a new query rather than editing the token.

Unlike raw HTTP responses, the SDK returns `documentCount` and `totalHits` as JavaScript numbers. Values beyond `Number.MAX_SAFE_INTEGER` reject with `RangeError` rather than silently losing precision. `SearchIndex` contains `index`, `documentCount`, and provider-specific string-map `properties`.

## Cancellation

Every search method accepts an `AbortSignal` in its final options argument. For example, cancel a search after 30 seconds:

```javascript
const result = await client.search.search(
  storeName,
  indexName,
  { text: "dapr", includeContent: true },
  { signal: AbortSignal.timeout(30_000) },
);
console.log(result.hits);
```

This snippet assumes an existing client and index. For writes, include `signal` alongside `mode`, `waitTimeout`, and `onWaitTimeout` in the same options object. An already-aborted signal rejects without sending the search operation. Cancellation is distinct from the provider's `waitTimeout` and does not guarantee cancellation of provider-side writes. Error shapes can differ by protocol.

## Errors

Await each operation and handle rejected promises at your application's error boundary, in addition to checking resolved indexing results for `failedItems`.

- **HTTP:** Runtime failures are JavaScript `Error` instances whose `message` is a JSON string containing `status` (HTTP status), `error` (status text), and `error_msg` (runtime response body). Transport, cancellation, and local validation failures can have different shapes; do not assume every error message is JSON.
- **gRPC:** Runtime failures preserve `ConnectError` codes from `@connectrpc/connect`, not HTTP status codes.
- **Invalid arguments:** Empty store, index, or document IDs, store or index names equal to `.` or `..`, non-string metadata values, conflicting `text` and `native`, or invalid option types reject locally. Invalid `topK` values and non-positive wait durations are rejected; invalid protobuf duration syntax also rejects. Provider-specific validation still happens at the runtime or component.

Creating an existing index fails with `ALREADY_EXISTS`; missing stores or indexes and unsupported queries also reject. Missing IDs in `getDocuments` are omitted, and deleting missing document IDs is not an error.

Per-item `details` are protobuf JSON objects over HTTP. Over gRPC, each detail is represented as `{ "@type": typeUrl, value: base64ProtobufBytes }`, because provider-specific schemas might not be available to decode it. Do not assume identical detail payloads across protocols.

See the [Search API reference]({{% ref "search_api.md#errors" %}}) for runtime error semantics and the [how-to guide]({{% ref js-search-howto.md %}}) for a complete setup and runnable example.
