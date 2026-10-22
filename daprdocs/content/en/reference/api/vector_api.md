---
type: docs
title: "Vector API reference"
linkTitle: "Vector API"
description: "Detailed documentation on the vector API"
weight: 1650
---

{{% alert title="Alpha" color="primary" %}}
The vector API is currently in [alpha]({{% ref "certification-lifecycle.md#certification-levels" %}}).
{{% /alert %}}

Dapr provides an API to manage collections and to upsert, retrieve, delete, and run similarity queries over dense vectors in vector databases. For an overview of concepts and features, see the [vector API overview]({{% ref vector-overview %}}).

All HTTP request and response bodies use the JSON mapping of the [vector protobuf definitions](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/vector.proto):

- Field names are in lowerCamelCase.
- `bytes` fields, such as record `payload`, are base64-encoded strings.
- Enum values are sent and returned as their names, for example `DISTANCE_METRIC_COSINE`.
- 64-bit integers, such as `recordCount`, are returned as strings.
- Durations, such as `waitTimeout`, are strings with an `s` suffix, for example `"10s"`.
- Responses include fields that hold their default value, for example `"recordCount": "0"`, `"score": 0`, or an empty `values` array. Fields declared `optional`, such as record `payload` and `metadata`, are omitted when unset.
- Unknown request fields are ignored.

Routes without a request body (get collection, list collections, and delete collection) take component-specific metadata as `metadata.<key>=<value>` query parameters.

## Create collection

Creates a collection in the vector store.

```
POST http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component. [See a list of all available vector components.]({{% ref supported-vector %}}) |
| `collection` | The name of the collection to create |

### Request body

| Field | Description |
| ----- | ----------- |
| `dimensions` | The length of every vector stored in the collection. Must be greater than `0`. Required |
| `metric` | The [distance metric](#distance-metrics) for the collection. When omitted or `DISTANCE_METRIC_UNSPECIFIED`, the component's default metric is used. A metric the component can't provide returns `INVALID_ARGUMENT`. Optional |
| `metadata` | Component-specific collection settings, such as index parameters. Optional |

#### Distance metrics

| Value | Description |
| ----- | ----------- |
| `DISTANCE_METRIC_UNSPECIFIED` | On create, the component's default metric. On query, the metric configured for the collection |
| `DISTANCE_METRIC_COSINE` | Cosine similarity. Higher scores indicate closer matches |
| `DISTANCE_METRIC_DOT_PRODUCT` | Dot-product similarity. Higher scores indicate closer matches |
| `DISTANCE_METRIC_EUCLIDEAN` | Euclidean distance. Lower scores indicate closer matches |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Collection created |
| `400` | Malformed request, missing `dimensions`, or unsupported metric |
| `404` | Vector store not found |
| `409` | Collection already exists |
| `500` | Vector store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars \
  -H "Content-Type: application/json" \
  -d '{
        "dimensions": 4,
        "metric": "DISTANCE_METRIC_COSINE"
      }'
```

## Get collection

Gets information about a collection.

```
GET http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection |

### Query parameters

| Parameter | Description |
| --------- | ----------- |
| `metadata.<key>` | Component-specific request metadata. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `collection` | The name of the collection |
| `recordCount` | Approximate number of records. Vector stores that can't supply this value efficiently return `0` |
| `dimensions` | The dimensions of the collection |
| `metric` | The effective distance metric. Always a concrete value |
| `properties` | Component-specific collection properties |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Collection information returned |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |

### Example

```shell
curl http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars
```

```json
{
  "collection": "cars",
  "recordCount": "3",
  "properties": {
    "filterableAttributes": "daprMetadata",
    "primaryKey": "id"
  },
  "dimensions": 4,
  "metric": "DISTANCE_METRIC_COSINE"
}
```

## List collections

Lists the collections in the vector store.

```
GET http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |

### Query parameters

| Parameter | Description |
| --------- | ----------- |
| `metadata.<key>` | Component-specific request metadata. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `collections` | The names of the collections in the vector store |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Collections returned |
| `404` | Vector store not found |
| `500` | Vector store not configured or request failed |

### Example

```shell
curl http://localhost:3500/v1.0-alpha1/vector/myvectors/collections
```

```json
{
  "collections": ["cars", "products"]
}
```

## Delete collection

Deletes a collection and all the records in it.

```
DELETE http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection to delete |

### Query parameters

| Parameter | Description |
| --------- | ----------- |
| `metadata.<key>` | Component-specific request metadata. Optional |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Collection deleted |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |

When a [resiliency]({{% ref resiliency-overview %}}) retry policy retries the delete and a later attempt finds that the collection no longer exists, the delete succeeds, because an earlier attempt most likely deleted it. A `NOT_FOUND` on the first attempt is returned as is.

### Example

```shell
curl -X DELETE http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars
```

## Upsert vectors

Writes records with a keyed upsert. A record with an ID that already exists in the collection is replaced.

```
POST http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>/vectors
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection |

### Request body

| Field | Description |
| ----- | ----------- |
| `records` | The [records](#record) to upsert. Every record must have a non-empty `id` that is unique within the request. Required |
| `options` | [Indexing options]({{% ref "search_api.md#indexing-options" %}}) that control when the request returns. Optional |
| `metadata` | Component-specific request metadata. Optional |

#### Record

| Field | Description |
| ----- | ----------- |
| `id` | Caller-supplied record identifier, unique within the collection. Required |
| `values` | The dense vector, as an array of floats. Its length must equal the collection's `dimensions`. Required |
| `metadata` | Structured JSON object attributes that queries can filter on using the [filter language](#filter-language). Optional |
| `payload` | Base64-encoded opaque bytes stored with the record and returned unchanged. Not filterable. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `ack` | The acknowledgement boundary the write reached. Always set on success. One of:<ul><li>`INDEX_ACK_QUEUED`: the vector store accepted the write for asynchronous processing. This does not indicate that any record has been written. Also returned when the vector store reports an acknowledgement that Dapr doesn't recognize.</li><li>`INDEX_ACK_COMPLETED`: the vector store completed the write, and `failedItems` contains every item-specific failure.</li></ul> |
| `failedItems` | Item-specific failures known when the request returns. Each item has the record `id` and an `error` with a canonical [gRPC status code](https://grpc.io/docs/guides/status-codes/) (`code`), a `message`, and `details` |

An upsert with no records returns `INDEX_ACK_COMPLETED` without calling the vector store.

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Request accepted. Check `ack` and `failedItems` for the outcome of each record |
| `400` | Malformed request, empty or duplicate record ID, or invalid indexing options |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |
| `504` | `waitTimeout` expired with `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST` |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/vectors \
  -H "Content-Type: application/json" \
  -d '{
        "records": [
          {
            "id": "car-1",
            "values": [1, 0, 0, 0],
            "metadata": { "make": "tesla", "year": 2023, "dealer": { "city": "Seattle" } },
            "payload": "eyJuYW1lIjoiTW9kZWwgMyJ9"
          }
        ],
        "options": {
          "mode": "INDEXING_MODE_WAIT_FOR_COMPLETION",
          "waitTimeout": "10s",
          "onWaitTimeout": "INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST"
        }
      }'
```

```json
{
  "failedItems": [],
  "ack": "INDEX_ACK_COMPLETED"
}
```

## Get vectors

Gets records by ID.

```
POST http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>/vectors/get
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection |

### Request body

| Field | Description |
| ----- | ----------- |
| `ids` | The IDs of the records to get. Required |
| `includeValues` | Whether to return the vector `values` of each record. Defaults to `false`. Optional |
| `metadata` | Component-specific request metadata. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `records` | The found [records](#record), in request order. IDs that don't exist are omitted. When `includeValues` isn't `true`, `values` is an empty array |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Records returned |
| `400` | Malformed request |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/vectors/get \
  -H "Content-Type: application/json" \
  -d '{
        "ids": ["car-1", "car-42"],
        "includeValues": true
      }'
```

```json
{
  "records": [
    {
      "id": "car-1",
      "values": [1, 0, 0, 0],
      "payload": "eyJuYW1lIjoiTW9kZWwgMyJ9",
      "metadata": { "dealer": { "city": "Seattle" }, "make": "tesla", "year": 2023 }
    }
  ]
}
```

## Delete vectors

Deletes records by ID. Deleting is a write and shares the acknowledgement model of [upsert vectors](#upsert-vectors). IDs that don't exist are not an error.

```
POST http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>/vectors/delete
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection |

### Request body

| Field | Description |
| ----- | ----------- |
| `ids` | The IDs of the records to delete. Required |
| `options` | [Indexing options]({{% ref "search_api.md#indexing-options" %}}) that control when the request returns. Optional |
| `metadata` | Component-specific request metadata. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `ack` | `INDEX_ACK_QUEUED` or `INDEX_ACK_COMPLETED`, with the same meaning as for [upsert vectors](#upsert-vectors). Always set on success |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Deletion accepted or completed |
| `400` | Malformed request or invalid indexing options |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |
| `504` | `waitTimeout` expired with `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST` |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/vectors/delete \
  -H "Content-Type: application/json" \
  -d '{
        "ids": ["car-1", "car-2"]
      }'
```

```json
{
  "ack": "INDEX_ACK_QUEUED"
}
```

## Query vectors

Finds the records closest to a query vector or to an existing record.

```
POST http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>/query
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection |

### Request body

| Field | Description |
| ----- | ----------- |
| `query` | The [vector query](#vector-query). Required |
| `metadata` | Component-specific request metadata. Optional |

#### Vector query

| Field | Description |
| ----- | ----------- |
| `vector` | The query vector, as an object with `values`. Only `values` is read and it must not be empty; other record fields are ignored. Exactly one of `vector` or `byId` is required |
| `byId` | The ID of a stored record whose vector is used as the query. Exactly one of `vector` or `byId` is required |
| `topK` | The maximum number of matches to return. When `0` or omitted, the component default is used. Optional |
| `filter` | A filter over record `metadata` written in the portable [filter language](#filter-language). Optional |
| `includeValues` | Whether to return the vector `values` of each match. Defaults to `false`. Optional |
| `includePayload` | Whether to return the `payload` of each match. Defaults to `false`. Optional |
| `metric` | The [distance metric](#distance-metrics) used to interpret `score` and `scoreThreshold`. When omitted, the collection's metric is used. A metric the component can't evaluate for the collection returns `INVALID_ARGUMENT`. Optional |
| `scoreThreshold` | Inclusive score cutoff on the metric's own, unnormalised scale. Matches with a score greater than or equal to this value are kept for cosine and dot product, and matches with a score less than or equal to it are kept for Euclidean. Optional |

All query fields go inside `query`; because unknown fields are ignored, a field such as `vector` placed at the top level of the request body has no effect and the request is rejected for a missing query.

#### Filter language

Filters are JSON objects that vector components translate into their native query language. Field paths address keys of the record `metadata` and use dotted notation for nested keys, for example `dealer.city`. A field set directly to a value is an equality match, and multiple conditions in the same object are combined with a logical AND.

| Type | Operators |
| ---- | --------- |
| Comparison | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` |
| Set | `$in`, `$nin` |
| Existence | `$exists` (boolean) |
| Logical | `$and`, `$or`, `$not` |

```json
{
  "$or": [
    { "make": "tesla", "year": { "$gte": 2024 } },
    { "dealer.city": { "$in": ["Seattle", "Portland"] } }
  ]
}
```

### Response content

| Field | Description |
| ----- | ----------- |
| `matches` | The closest records, ordered from closest to furthest. Each match has a `record` and a `score` |
| `matches[].record` | The matching [record](#record). `id` is always returned and `metadata` is returned when the record has it. `values` is an empty array unless `includeValues` is `true`, and `payload` is returned only when `includePayload` is `true` |
| `matches[].score` | The unnormalised value of the effective metric |
| `metric` | The effective metric used for scores. Always a concrete value, even when the request doesn't set `metric` |

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Query results returned |
| `400` | Malformed request, missing `query`, neither or both of `vector` and `byId` set, empty query vector, invalid filter, or unsupported metric |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/query \
  -H "Content-Type: application/json" \
  -d '{
        "query": {
          "vector": { "values": [1, 0, 0, 0] },
          "topK": 2,
          "filter": { "make": "tesla" },
          "includePayload": true,
          "scoreThreshold": 0.5
        }
      }'
```

```json
{
  "matches": [
    {
      "record": {
        "id": "car-1",
        "values": [],
        "payload": "eyJuYW1lIjoiTW9kZWwgMyJ9",
        "metadata": { "dealer": { "city": "Seattle" }, "make": "tesla", "year": 2023 }
      },
      "score": 1
    }
  ],
  "metric": "DISTANCE_METRIC_COSINE"
}
```

## Batch query vectors

Runs multiple queries against the same collection. Each query is evaluated independently and succeeds or fails on its own.

```
POST http://localhost:<daprPort>/v1.0-alpha1/vector/<storeName>/collections/<collection>/batch-query
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `daprPort` | The Dapr port |
| `storeName` | The name of the vector component |
| `collection` | The name of the collection |

### Request body

| Field | Description |
| ----- | ----------- |
| `queries` | The [vector queries](#vector-query) to run, each with the same fields as the `query` object of a [query vectors](#query-vectors) request. Every query runs against the store and collection in the URL. Required |
| `metadata` | Component-specific request metadata. Applies to every query. Optional |

### Response content

| Field | Description |
| ----- | ----------- |
| `results` | One result per query, in request order. Each result has either a `response` with the same shape as the [query vectors](#query-vectors) response, or an `error` with a canonical [gRPC status code](https://grpc.io/docs/guides/status-codes/) (`code`), a `message`, and `details` |

A query that fails validation, for example one that sets neither `vector` nor `byId` or has an empty query vector, isn't sent to the vector store. Its slot holds an `INVALID_ARGUMENT` error with the `DAPR_VECTOR_INVALID_REQUEST` reason and a `google.rpc.BadRequest` field violation that names the query by its position, for example `queries[1]` or `queries[1].vector.values`. The other queries still run.

Only request-wide failures, such as a missing vector store or collection, invalid credentials, or a transport error, fail the whole request.

### HTTP response codes

| Code | Description |
| ---- | ----------- |
| `200` | Results returned. Check each result for a `response` or an `error` |
| `400` | Malformed request |
| `404` | Vector store or collection not found |
| `500` | Vector store not configured or request failed |

### Example

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/batch-query \
  -H "Content-Type: application/json" \
  -d '{
        "queries": [
          { "vector": { "values": [1, 0, 0, 0] }, "topK": 1 },
          { "topK": 1 },
          { "byId": "car-1", "topK": 1, "metric": "DISTANCE_METRIC_EUCLIDEAN" }
        ]
      }'
```

In this example, the second query sets neither `vector` nor `byId`, so Dapr rejects it without calling the vector store. The third query asks for a metric that Meilisearch doesn't support, so the vector store reports an error in its slot. The first query returns matches:

```json
{
  "results": [
    {
      "response": {
        "matches": [
          {
            "record": {
              "id": "car-1",
              "values": [],
              "metadata": { "dealer": { "city": "Seattle" }, "make": "tesla", "year": 2023 }
            },
            "score": 1
          }
        ],
        "metric": "DISTANCE_METRIC_COSINE"
      }
    },
    {
      "error": {
        "code": 3,
        "message": "exactly one of vector or by_id must be set",
        "details": [
          {
            "@type": "type.googleapis.com/google.rpc.BadRequest",
            "fieldViolations": [
              {
                "field": "queries[1]",
                "description": "exactly one of vector or by_id must be set",
                "reason": "",
                "localizedMessage": null
              }
            ]
          },
          {
            "@type": "type.googleapis.com/google.rpc.ResourceInfo",
            "resourceType": "vector",
            "resourceName": "myvectors",
            "owner": "",
            "description": ""
          },
          {
            "@type": "type.googleapis.com/google.rpc.ErrorInfo",
            "reason": "DAPR_VECTOR_INVALID_REQUEST",
            "domain": "dapr.io",
            "metadata": {}
          }
        ]
      }
    },
    {
      "error": {
        "code": 3,
        "message": "meilisearch only supports the cosine distance metric for user-provided embeddings",
        "details": []
      }
    }
  ]
}
```

## Errors

Errors the Dapr runtime detects itself, such as a missing vector store or an invalid request, are returned in the standard Dapr error format with the following error codes:

| Error code | HTTP status | gRPC code | Description |
| ---------- | ----------- | --------- | ----------- |
| `ERR_VECTOR_STORE_NOT_FOUND` | `404` | `NOT_FOUND` | The named vector store doesn't exist |
| `ERR_VECTOR_STORE_NOT_CONFIGURED` | `500` | `FAILED_PRECONDITION` | No vector store is configured |
| `ERR_VECTOR_INVALID_REQUEST` | `400` | `INVALID_ARGUMENT` | The request failed validation, for example `dimensions` set to `0`, an empty or duplicate record ID, a missing `query`, neither or both of `vector` and `byId` set, an empty query vector, or invalid [indexing options]({{% ref "search_api.md#indexing-options" %}}). A `google.rpc.BadRequest` detail names the offending field, such as `dimensions`, `records.id`, `query`, `query.vector.values`, `options`, or `options.wait_timeout`. In a [batch query](#batch-query-vectors), the error is returned in the failing query's slot instead |
| `ERR_MALFORMED_REQUEST` | `400` | N/A | The HTTP request body is not valid JSON |

Errors returned by the vector store, such as a missing collection, are passed through with their canonical [gRPC status code](https://grpc.io/docs/guides/status-codes/) and details. Over HTTP, the response body uses the canonical code name as `errorCode`, carries the status details in `details`, and the HTTP status is mapped from the code in the same way as for the [search API]({{% ref "search_api.md#errors" %}}), for example `NOT_FOUND` to `404`, `ALREADY_EXISTS` to `409`, `UNAVAILABLE` to `503`, and `DEADLINE_EXCEEDED` to `504`:

```json
{
  "errorCode": "ALREADY_EXISTS",
  "message": "meilisearch collection \"cars\" already exists"
}
```

A vector store error that carries no gRPC status is reported as `INTERNAL`.

A write whose outcome can't be determined, because the vector store reported a batch-level failure without saying which records were applied, carries a `google.rpc.ErrorInfo` detail with the `INDEXING_OUTCOME_UNKNOWN` reason in the `dapr.io` domain. Retry the request; keyed upserts and deletes are idempotent.

### Resiliency

Vector store calls run under the store's [resiliency]({{% ref resiliency-overview %}}) policy:

- Retry policies can match the vector store's canonical gRPC code with `matching.gRPCStatusCodes`.
- A policy timeout is returned as `DEADLINE_EXCEEDED`, a cancelled request as `CANCELLED`, and an open circuit breaker as `UNAVAILABLE`.
- `ALREADY_EXISTS` on a retried [create collection](#create-collection) is returned unchanged, because the collection may belong to another caller. `NOT_FOUND` on a retried [delete collection](#delete-collection) is treated as success.
- A write whose `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST` wait expired isn't retried.

## gRPC API

The vector API is also available over gRPC through the `Dapr` service in the [Dapr runtime protos](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/vector.proto):

| RPC | Description |
| --- | ----------- |
| `CreateCollectionAlpha1` | [Create a collection](#create-collection) |
| `GetCollectionAlpha1` | [Get a collection](#get-collection) |
| `ListCollectionsAlpha1` | [List collections](#list-collections) |
| `DeleteCollectionAlpha1` | [Delete a collection](#delete-collection) |
| `UpsertVectorsAlpha1` | [Upsert vectors](#upsert-vectors) |
| `GetVectorsAlpha1` | [Get vectors](#get-vectors) |
| `DeleteVectorsAlpha1` | [Delete vectors](#delete-vectors) |
| `QueryVectorsAlpha1` | [Query vectors](#query-vectors) |
| `BatchQueryVectorsAlpha1` | [Batch query vectors](#batch-query-vectors) |

Over gRPC, `storeName` and `collection` are fields of the request message and `payload` is sent as raw bytes.

## Next steps

- [Vector API overview]({{% ref vector-overview %}})
- [How-To: Store and query vectors]({{% ref howto-vector %}})
- [Vector component specs]({{% ref supported-vector %}})
