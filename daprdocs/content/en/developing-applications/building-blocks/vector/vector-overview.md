---
type: docs
title: "Vector overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the vector API building block"
---

{{% alert title="Alpha" color="primary" %}}
The vector API is currently in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Dapr's vector API provides a single, portable way to store, retrieve, and run similarity queries over dense vectors (embeddings) in vector databases such as Meilisearch, Pinecone, Qdrant, Milvus, and pgvector. It is the storage and retrieval layer for AI patterns like retrieval-augmented generation (RAG), semantic search, and recommendations: your application writes embeddings with some metadata, then asks for the records closest to a query vector. You swap the underlying vector database by changing the [vector component]({{% ref supported-vector %}}).

The vector API stores vectors that are already embedded. Generating embeddings is out of scope; your application generates them, for example with an embedding model, before calling the API. For keyword and full-text search over JSON documents, use the [search API]({{% ref search-overview %}}) instead.

You can pair the vector API with Dapr functionality, like:

- The [conversation API]({{% ref conversation-overview %}}) to send the retrieved context to a large language model (LLM)
- [Resiliency policies]({{% ref resiliency-overview %}}) including circuit breakers, timeouts, and retries for calls to the vector database
- Observability with metrics and distributed tracing using OpenTelemetry and Zipkin
- [Secret store references]({{% ref component-secrets %}}) for vector database credentials

## Concepts

| Concept | Description |
| ------- | ----------- |
| Vector store | A Dapr [vector component]({{% ref supported-vector %}}) that connects to a vector database. |
| Collection | A named container of records. Every collection has fixed `dimensions` and a distance `metric`. |
| Record | A caller-supplied `id`, a dense vector of float `values`, structured `metadata` that can be filtered on, and an opaque `payload` that is stored and returned unchanged but never filterable. |
| Match | A record returned by a query, with its similarity `score`. |

## Features

### Collection management

Create, get, list, and delete collections. When you create a collection, you set:

- `dimensions` (required): the length of every vector stored in the collection.
- `metric` (optional): the distance metric used to compare vectors. When unspecified, the component's default metric is used. Requesting a metric the vector database can't provide returns `INVALID_ARGUMENT`.

Creating a collection that already exists returns `ALREADY_EXISTS`. Getting a collection returns its effective dimensions and metric, an approximate record count, and component-specific properties.

### Distance metrics and scores

| Metric | Score |
| ------ | ----- |
| `DISTANCE_METRIC_COSINE` | Cosine similarity in `[-1, 1]`. Higher is closer. |
| `DISTANCE_METRIC_DOT_PRODUCT` | Dot product. Higher is closer. |
| `DISTANCE_METRIC_EUCLIDEAN` | Euclidean distance. Lower is closer. |

Scores are the unnormalised value of the metric, so you can reason about them the same way across vector databases. A query can set a `scoreThreshold` to drop weak matches. The threshold is inclusive and uses the metric's own scale: matches with a score greater than or equal to the threshold are kept for cosine and dot product, and matches with a score less than or equal to it are kept for Euclidean.

### Keyed upserts

Records are written with a keyed upsert. Every record carries a non-empty `id` that must be unique within the request, so retrying the same request is idempotent. Record `values` must have the collection's dimensions. Records that fail individually are reported in `failedItems`, while the rest of the batch is still written.

Records can be read back by ID in request order, optionally with their vector values, and deleted by ID. Deleting an ID that does not exist is not an error.

### Write acknowledgements

Vector writes share the acknowledgement model of the search API. Upserts and deletes accept the same `options` to either return as soon as the vector database accepts the write (`INDEXING_MODE_RETURN_ON_ACCEPTANCE`, the default), or wait for the final result (`INDEXING_MODE_WAIT_FOR_COMPLETION`) with a timeout and a timeout action. See [write acknowledgements]({{% ref "search-overview.md#write-acknowledgements" %}}) in the search overview.

### Querying

A query finds the `topK` records closest to either:

- A query vector (`vector.values`), or
- The stored vector of an existing record (`byId`).

Queries can be combined with:

- **Metadata filters** written in the portable [filter language](#filter-language)
- **Score thresholds** to keep only sufficiently close matches
- **Projection** with `includeValues` and `includePayload` to control whether vector values and payloads are returned

### Batch queries

A batch query runs several queries against the same collection in one call. Each query succeeds or fails on its own, and the response contains one result per query in request order: either the query's matches or its error. Only request-wide failures, such as a missing collection or invalid credentials, fail the whole call.

### Filter language

Filters address the structured `metadata` of a record, using dotted notation for nested fields, for example `dealer.city`. The filter language is the same as the [search API's]({{% ref "search-overview.md#filter-language" %}}):

| Type | Operators |
| ---- | --------- |
| Comparison | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` |
| Set | `$in`, `$nin` |
| Existence | `$exists` (boolean) |
| Logical | `$and`, `$or`, `$not` |

For example, the following filter matches records for Tesla cars sold by a dealer in Seattle or Portland:

```json
{
  "make": "tesla",
  "dealer.city": { "$in": ["Seattle", "Portland"] }
}
```

## Try out the vector API

### How-to guide

Now that you've learned what the vector API building block provides, learn how it can work in your application with the following how-to guide:

- [How-To: Store and query vectors]({{% ref howto-vector %}})

## Next steps

- [How-To: Store and query vectors]({{% ref howto-vector %}})
- [Vector API reference]({{% ref vector_api %}})
- [Vector component specs]({{% ref supported-vector %}})
- [Search API overview]({{% ref search-overview %}})
