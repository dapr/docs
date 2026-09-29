---
type: docs
title: "Search API reference"
linkTitle: "Search API"
description: "Detailed documentation on the search API"
weight: 1250
---

{{% alert title="Alpha" color="primary" %}}
The search API is currently in [alpha]({{% ref "certification-lifecycle.md#certification-levels" %}}).
{{% /alert %}}

Dapr provides an API to manage indexes and to index, retrieve, delete, and query documents in lexical (full-text) search engines. For an overview of concepts and features, see the [search API overview]({{% ref search-overview %}}).

All HTTP request and response bodies use the JSON mapping of the [search protobuf definitions](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/search.proto):

- Field names are in lowerCamelCase.
- `bytes` fields, such as document `content`, are base64-encoded strings.
- Enum values are sent and returned as their names, for example `INDEX_ACK_COMPLETED`.
- 64-bit integers, such as `documentCount` and `totalHits`, are returned as strings.
- Durations, such as `waitTimeout`, are strings with an `s` suffix, for example `"10s"` or `"1.5s"`.
- Fields with default values (empty, zero, or `false`) are omitted from responses.

## Create index

Creates an index in the search store.

```
POST http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component. [See a list of all available search components.]({{% ref supported-search %}}) |
| `index` | The name of the index to create |

### Request body

| Field | Description |
| ----- | ----------- |
| `metadata` | Component-specific index settings, such as attributes to declare as filterable or sortable. Optional |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Index created |
| `400` | Malformed request |
| `404` | Search store not found |
| `409` | Index already exists. Settings of the existing index are not changed |
| `500` | Search store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles \
  -H "Content-Type: application/json" \
  -d '{
        "metadata": {
          "filterableAttributes": "category,price",
          "sortableAttributes": "price"
        }
      }'
```

## Get index

Gets information about an index.

```
GET http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |
| `index` | The name of the index |

### Response content

| Field | Description |
| ----- | ----------- |
| `index` | The name of the index |
| `documentCount` | Approximate number of documents in the index. Search stores that can't supply this value efficiently return `0` |
| `properties` | Component-specific index properties |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Index information returned |
| `404` | Search store or index not found |
| `500` | Search store not configured or request failed |

### Example

```shell
curl http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles
```

```json
{
  "index": "articles",
  "documentCount": "3",
  "properties": {
    "filterableAttributes": "category,price",
    "primaryKey": "id",
    "sortableAttributes": "id,price"
  }
}
```

## List indexes

Lists the indexes in the search store.

```
GET http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |

### Response content

| Field | Description |
| ----- | ----------- |
| `indexes` | The names of the indexes in the search store |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Indexes returned |
| `404` | Search store not found |
| `500` | Search store not configured or request failed |

### Example

```shell
curl http://localhost:3500/v1.0-alpha1/search/mysearch/indexes
```

```json
{
  "indexes": ["articles", "products"]
}
```

## Delete index

Deletes an index and all the documents in it.

```
DELETE http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |
| `index` | The name of the index to delete |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Index deleted |
| `404` | Search store or index not found |
| `500` | Search store not configured or request failed |

### Example

```shell
curl -X DELETE http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles
```

## Index documents

Indexes documents with a keyed upsert. A document with an ID that already exists in the index is replaced.

```
POST http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>/documents
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |
| `index` | The name of the index |

### Request body

| Field | Description |
| ----- | ----------- |
| `documents` | The [documents](#document) to index. Every document must have a non-empty `id` that is unique within the request. Required |
| `options` | [Indexing options](#indexing-options) that control when the request returns. Optional |
| `metadata` | Component-specific request metadata. Optional |

#### Document

| Field | Description |
| ----- | ----------- |
| `id` | Caller-supplied document identifier, unique within the index. Required |
| `content` | Base64-encoded UTF-8 JSON object. Field-level request options (`searchFields`, `returnFields`, `highlightFields`, `sort`, and `filter`) address its top-level and dotted nested keys. A document whose content is not a JSON object is reported in `failedItems` with `INVALID_ARGUMENT` and is not sent to the search store |
| `metadata` | Opaque string key/value pairs stored with the document and returned unchanged. Metadata is not indexed, not filterable, and not addressable by field-level request options. Optional |

#### Indexing options

The same options apply to every write: [index documents](#index-documents), [delete documents](#delete-documents), and the vector API's [upsert]({{% ref "vector_api.md#upsert-vectors" %}}) and [delete]({{% ref "vector_api.md#delete-vectors" %}}) operations.

| Field | Description |
| ----- | ----------- |
| `mode` | When the request returns. One of:<ul><li>`INDEXING_MODE_RETURN_ON_ACCEPTANCE`: return after the search store durably accepts the write for background processing. No eventual result is exposed by the API.</li><li>`INDEXING_MODE_WAIT_FOR_COMPLETION`: wait for the final result, up to `waitTimeout`.</li><li>`INDEXING_MODE_UNSPECIFIED` (default): same as `INDEXING_MODE_RETURN_ON_ACCEPTANCE`.</li></ul> |
| `waitTimeout` | How long to wait for the write to complete, for example `"10s"`. Required and must be positive with `INDEXING_MODE_WAIT_FOR_COMPLETION`, and must not be set with any other mode. When the request has a deadline, the remaining time must be longer than `waitTimeout` |
| `onWaitTimeout` | What happens when `waitTimeout` expires. Required with `INDEXING_MODE_WAIT_FOR_COMPLETION`, and must not be set with any other mode. One of:<ul><li>`INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC`: return `INDEX_ACK_QUEUED` and let the queued write continue. Rejected with `INVALID_ARGUMENT` by search stores that have no queued acknowledgement.</li><li>`INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST`: fail the request with `DEADLINE_EXCEEDED`. This does not guarantee that the search store cancels the write.</li></ul> |

### Response content

| Field | Description |
| ----- | ----------- |
| `ack` | The acknowledgement boundary the write reached. Always set on success. One of:<ul><li>`INDEX_ACK_QUEUED`: the search store accepted the write for asynchronous processing. This does not indicate that any document has been indexed.</li><li>`INDEX_ACK_COMPLETED`: the search store completed the write, and `failedItems` contains every item-specific failure.</li></ul> |
| `failedItems` | Item-specific failures known when the request returns. Each item has the document `id` and an `error` with a canonical [gRPC status code](https://grpc.io/docs/guides/status-codes/) (`code`), a `message`, and optional `details` |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Request accepted. Check `ack` and `failedItems` for the outcome of each document |
| `400` | Malformed request, empty or duplicate document ID, or invalid indexing options |
| `404` | Search store or index not found |
| `500` | Search store not configured or request failed |
| `504` | `waitTimeout` expired with `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST` |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/documents \
  -H "Content-Type: application/json" \
  -d '{
        "documents": [
          {
            "id": "doc-1",
            "content": "eyJ0aXRsZSI6IkdldHRpbmcgc3RhcnRlZCB3aXRoIERhcHIiLCJjYXRlZ29yeSI6Imd1aWRlIiwicHJpY2UiOjEwfQ==",
            "metadata": { "author": "alice" }
          },
          {
            "id": "doc-2",
            "content": "WyJub3QiLCAiYW4iLCAib2JqZWN0Il0="
          }
        ],
        "options": {
          "mode": "INDEXING_MODE_WAIT_FOR_COMPLETION",
          "waitTimeout": "10s",
          "onWaitTimeout": "INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST"
        }
      }'
```

In this example, the content of `doc-2` is a JSON array rather than an object, so it is rejected while `doc-1` is indexed:

```json
{
  "failedItems": [
    {
      "id": "doc-2",
      "error": {
        "code": 3,
        "message": "content must be a JSON object"
      }
    }
  ],
  "ack": "INDEX_ACK_COMPLETED"
}
```

## Get documents

Gets documents by ID.

```
POST http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>/documents/get
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |
| `index` | The name of the index |

### Request body

| Field | Description |
| ----- | ----------- |
| `ids` | The IDs of the documents to get. Required |
| `includeContent` | Whether to return document `content`. When `false` (default), only `id` and `metadata` are returned. Optional |
| `metadata` | Component-specific request metadata. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `documents` | The found [documents](#document), in request order. IDs that don't exist are omitted |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Documents returned |
| `400` | Malformed request |
| `404` | Search store or index not found |
| `500` | Search store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/documents/get \
  -H "Content-Type: application/json" \
  -d '{
        "ids": ["doc-1", "doc-42"],
        "includeContent": true
      }'
```

```json
{
  "documents": [
    {
      "id": "doc-1",
      "content": "eyJjYXRlZ29yeSI6Imd1aWRlIiwicHJpY2UiOjEwLCJ0aXRsZSI6IkdldHRpbmcgc3RhcnRlZCB3aXRoIERhcHIifQ==",
      "metadata": { "author": "alice" }
    }
  ]
}
```

## Delete documents

Deletes documents by ID. Deleting is a write and shares the acknowledgement model of [index documents](#index-documents). IDs that don't exist are not an error, and deletions never report failed items.

```
POST http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>/documents/delete
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |
| `index` | The name of the index |

### Request body

| Field | Description |
| ----- | ----------- |
| `ids` | The IDs of the documents to delete. Required |
| `options` | [Indexing options](#indexing-options) that control when the request returns. Optional |
| `metadata` | Component-specific request metadata. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `ack` | `INDEX_ACK_QUEUED` or `INDEX_ACK_COMPLETED`, with the same meaning as for [index documents](#index-documents). Always set on success |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Deletion accepted or completed |
| `400` | Malformed request or invalid indexing options |
| `404` | Search store or index not found |
| `500` | Search store not configured or request failed |
| `504` | `waitTimeout` expired with `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST` |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/documents/delete \
  -H "Content-Type: application/json" \
  -d '{
        "ids": ["doc-1", "doc-2"]
      }'
```

```json
{
  "ack": "INDEX_ACK_QUEUED"
}
```

## Search

Queries an index.

```
POST http://localhost:<daprPort>/v1.0-alpha1/search/<storeName>/indexes/<index>/query
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the search component |
| `index` | The name of the index |

### Request body

| Field | Description |
| ----- | ----------- |
| `text` | A full-text query. Mutually exclusive with `native` |
| `native` | A provider-native query as a JSON object, passed to the search store. See the [component reference]({{% ref supported-search %}}) for the supported format. Mutually exclusive with `text` |
| `filter` | A filter written in the portable [filter language](#filter-language). Optional |
| `topK` | The maximum number of hits to return in this page. When `0` or omitted, the component default is used. Optional |
| `continuationToken` | The token returned by the previous page. Empty for the first page. Optional |
| `searchFields` | Restricts the full-text query to these content fields. Optional |
| `returnFields` | Returns only these content fields in each hit. Optional |
| `includeContent` | Whether to return document `content` in each hit. When `false` (default) and `returnFields` is empty, only `id` and `metadata` are returned. Optional |
| `sort` | Sort clauses, applied in order. Each clause has a `field` and an `order` of `SORT_ORDER_ASC` or `SORT_ORDER_DESC`. Optional |
| `highlightFields` | Content fields for which to return highlighted fragments. Optional |
| `metadata` | Component-specific request metadata. Optional |

#### Filter language

Filters are JSON objects that search components translate into their native query language. Field paths address keys of the document content and use dotted notation for nested keys, for example `customer.region`. A field set directly to a value is an equality match, and multiple conditions in the same object are combined with a logical AND.

| Type | Operators |
| ---- | --------- |
| Comparison | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` |
| Set | `$in`, `$nin` |
| Existence | `$exists` (boolean) |
| Logical | `$and`, `$or`, `$not` |

```json
{
  "$and": [
    { "category": { "$in": ["guide", "reference"] } },
    { "price": { "$gte": 10, "$lt": 50 } },
    { "$not": { "author.name": "bob" } }
  ]
}
```

### Response content

| Field | Description |
| ----- | ----------- |
| `hits` | The matching documents. Each hit has a `document`, a `score`, and `highlights` |
| `hits[].document` | The matching [document](#document). `content` is included when `includeContent` is `true` or `returnFields` is set |
| `hits[].score` | Unnormalised, provider-specific relevance score. Higher values indicate a more relevant match |
| `hits[].highlights` | Highlighted fragments, keyed by field name |
| `totalHits` | Best-effort total number of matching documents. Omitted when the search store can't supply one |
| `totalHitsRelation` | The accuracy of `totalHits`: `TOTAL_HITS_RELATION_EXACT`, `TOTAL_HITS_RELATION_LOWER_BOUND`, or `TOTAL_HITS_RELATION_ESTIMATE`. Omitted when `totalHits` is omitted |
| `continuationToken` | An opaque token to get the next page. Omitted when there are no more results |

A continuation token is bound to the query that produced it. To get the next page, send the same request with the token; changing the query, filter, sort, or field options returns `INVALID_ARGUMENT`. If the search store's cursor behind the token has expired, the request fails with `FAILED_PRECONDITION` and the `SEARCH_CONTINUATION_EXPIRED` [error reason](#error-reasons).

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Search results returned |
| `400` | Malformed request, invalid filter, invalid continuation token, or expired continuation token |
| `404` | Search store or index not found |
| `500` | Search store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "text": "dapr",
        "filter": { "category": "guide" },
        "sort": [ { "field": "price", "order": "SORT_ORDER_ASC" } ],
        "highlightFields": ["title"],
        "includeContent": true,
        "topK": 10
      }'
```

```json
{
  "hits": [
    {
      "document": {
        "id": "doc-1",
        "content": "eyJjYXRlZ29yeSI6Imd1aWRlIiwicHJpY2UiOjEwLCJ0aXRsZSI6IkdldHRpbmcgc3RhcnRlZCB3aXRoIERhcHIifQ==",
        "metadata": { "author": "alice" }
      },
      "score": 0.9,
      "highlights": {
        "title": "Getting started with <em>Dapr</em>"
      }
    }
  ],
  "totalHits": "1",
  "totalHitsRelation": "TOTAL_HITS_RELATION_ESTIMATE"
}
```

## Errors

Errors the Dapr runtime detects itself, such as a missing search store or an invalid request, are returned in the standard Dapr error format with the following error codes:

| Error code | HTTP status | gRPC code | Description |
| ---------- | ----------- | --------- | ----------- |
| `ERR_SEARCH_STORE_NOT_FOUND` | `404` | `NOT_FOUND` | The named search store doesn't exist |
| `ERR_SEARCH_STORE_NOT_CONFIGURED` | `500` | `FAILED_PRECONDITION` | No search store is configured |
| `ERR_SEARCH_INVALID_REQUEST` | `400` | `INVALID_ARGUMENT` | The request failed validation, for example an empty or duplicate document ID or an invalid combination of indexing options |
| `ERR_MALFORMED_REQUEST` | `400` | N/A | The HTTP request body is not valid JSON |

Errors returned by the search store are passed through with their canonical [gRPC status code](https://grpc.io/docs/guides/status-codes/) and details. Over HTTP, the status code is mapped to the equivalent HTTP status, and the response body uses the canonical code name as `errorCode`:

```json
{
  "errorCode": "ALREADY_EXISTS",
  "message": "meilisearch index \"articles\" already exists"
}
```

### Error reasons

Some errors carry a [`google.rpc.ErrorInfo`](https://cloud.google.com/apis/design/errors#error_info) detail in the `dapr.io` domain with one of the following reasons:

| Reason | Code | Description |
| ------ | ---- | ----------- |
| `SEARCH_CONTINUATION_EXPIRED` | `FAILED_PRECONDITION` | The search store cursor referenced by a continuation token has expired. Restart the query from the first page |
| `INDEXING_OUTCOME_UNKNOWN` | Varies | The search store reported a batch-level failure but could not establish which items were applied. Retry the request; keyed upserts and deletes are idempotent |

## gRPC API

The search API is also available over gRPC through the `Dapr` service in the [Dapr runtime protos](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/search.proto):

| RPC | Description |
| --- | ----------- |
| `CreateIndexAlpha1` | [Create an index](#create-index) |
| `GetIndexAlpha1` | [Get an index](#get-index) |
| `ListIndexesAlpha1` | [List indexes](#list-indexes) |
| `DeleteIndexAlpha1` | [Delete an index](#delete-index) |
| `IndexDocumentsAlpha1` | [Index documents](#index-documents) |
| `GetDocumentsAlpha1` | [Get documents](#get-documents) |
| `DeleteDocumentsAlpha1` | [Delete documents](#delete-documents) |
| `SearchAlpha1` | [Search an index](#search) |

Over gRPC, `storeName` and `index` are fields of the request message and `content` is sent as raw bytes.

## Next steps

- [Search API overview]({{% ref search-overview %}})
- [How-To: Index and search documents]({{% ref howto-search %}})
- [Search component specs]({{% ref supported-search %}})
