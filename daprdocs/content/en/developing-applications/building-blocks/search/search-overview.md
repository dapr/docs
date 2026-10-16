---
type: docs
title: "Search overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the search API building block"
---

{{% alert title="Alpha" color="primary" %}}
The search API is currently in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Dapr's search API provides a single, portable way to store, retrieve, and query documents in lexical (full-text) search engines such as Meilisearch, Elasticsearch, and OpenSearch. Instead of learning a different SDK and query language for each search engine, your application indexes JSON documents and queries them through the same API, and you swap the underlying engine by changing the [search component]({{% ref supported-search %}}).

The search API is scoped to storing and querying documents that are already index-ready. Text extraction, chunking, embedding generation, and ingestion pipeline orchestration are out of scope; your application performs those steps before calling the API. For similarity search over embeddings, use the [vector API]({{% ref vector-overview %}}) instead.

You can pair the search API with Dapr functionality, like:

- [Resiliency policies]({{% ref resiliency-overview %}}) including circuit breakers, timeouts, and retries for calls to the search engine
- Observability with metrics and distributed tracing using OpenTelemetry and Zipkin
- [Secret store references]({{% ref component-secrets %}}) for search engine credentials

## Concepts

| Concept | Description |
| ------- | ----------- |
| Search store | A Dapr [search component]({{% ref supported-search %}}) that connects to a search engine. |
| Index | A named container of documents in the search store. Index settings are component specific and are passed as metadata when the index is created. |
| Document | An index-ready item made of a caller-supplied `id`, a `content` JSON object that is indexed and searchable, and opaque string `metadata` that is stored and returned unchanged but never indexed or filterable. |
| Hit | A document returned by a search, with its relevance `score` and any requested `highlights`. |

## Features

### Index management

Create, get, list, and delete indexes. Creating an index that already exists returns `ALREADY_EXISTS`; Dapr never reconciles the settings of an existing index. Getting an index returns an approximate document count and component-specific properties, such as the configured filterable or sortable attributes.

### Keyed upserts

Documents are written with a keyed upsert. Every document carries a non-empty `id` that must be unique within the request, so retrying the same request is idempotent. Document `content` must be a UTF-8 encoded JSON object. Documents with any other content are reported individually in `failedItems` with `INVALID_ARGUMENT` and are never sent to the search engine, while the rest of the batch is still indexed.

Documents can be read back by ID in request order, and deleted by ID. Deleting an ID that does not exist is not an error.

### Write acknowledgements

Many search engines index documents asynchronously. Every write (indexing and deleting documents) accepts the same `options` to control when Dapr returns:

| Mode | Behaviour |
| ---- | -------- |
| `INDEXING_MODE_RETURN_ON_ACCEPTANCE` (default) | Return as soon as the search engine durably accepts the write. The response `ack` is `INDEX_ACK_QUEUED` when the engine queued the write, which does not mean any document has been indexed yet. |
| `INDEXING_MODE_WAIT_FOR_COMPLETION` | Wait for the final result, up to `waitTimeout`. The response `ack` is `INDEX_ACK_COMPLETED` and `failedItems` contains every item-specific failure. |

When waiting for completion, you must also set `onWaitTimeout` to decide what happens if the timeout expires:

- `INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC`: return `INDEX_ACK_QUEUED` and let the queued work continue. Only valid for search engines that provide a queued acknowledgement.
- `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST`: fail the request with `DEADLINE_EXCEEDED`. The search engine may still complete the write.

### Querying

A search request runs either:

- A portable full-text query (`text`), optionally restricted to specific `searchFields`, or
- A provider-native query (`native`) that is passed to the search engine for features not covered by the portable API.

Queries can be combined with:

- **Filters** written in the portable [filter language](#filter-language)
- **Sorting** on one or more fields in ascending or descending order
- **Highlighting** of matched fragments for selected fields
- **Field projection** with `returnFields`, or `includeContent: false` to return only document IDs and metadata
- **Pagination** using opaque continuation tokens

Hit scores are unnormalised, provider-specific relevance values where higher is more relevant. Compare scores only within the same result set.

### Pagination

Use `topK` to set the page size. When more results are available, the response includes a `continuationToken`; pass it unchanged in the next request to get the next page. A continuation token is bound to the shape of the query that produced it, so the next request must keep the same query, filter, sort, and field options. If the search engine's cursor behind a token expires, the request fails with `FAILED_PRECONDITION` and the `SEARCH_CONTINUATION_EXPIRED` error reason.

The response includes a best-effort `totalHits` along with a `totalHitsRelation` that describes its accuracy: `TOTAL_HITS_RELATION_EXACT`, `TOTAL_HITS_RELATION_LOWER_BOUND`, or `TOTAL_HITS_RELATION_ESTIMATE`.

### Filter language

Filters are JSON objects that every search component translates into its native query language. Field paths address keys of the document `content` and use dotted notation for nested keys, for example `customer.region`. A field set directly to a value is an equality match, and multiple conditions in the same object are combined with a logical AND.

| Type | Operators |
| ---- | --------- |
| Comparison | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` |
| Set | `$in`, `$nin` |
| Existence | `$exists` (boolean) |
| Logical | `$and`, `$or`, `$not` |

For example, the following filter matches guides that cost less than 20, or any document in the `reference` category:

```json
{
  "$or": [
    { "category": "guide", "price": { "$lt": 20 } },
    { "category": { "$in": ["reference"] } }
  ]
}
```

Some search engines require fields to be declared as filterable or sortable before they can be used. Check the [component reference]({{% ref supported-search %}}) for details.

### Error reporting

Errors that a search engine returns reach your application with their canonical gRPC status code and details, rather than being wrapped in a generic internal error. For example, creating an existing index returns `ALREADY_EXISTS` (HTTP `409`). See the [search API reference]({{% ref "search_api.md#errors" %}}) for details.

## Try out the search API

### How-to guide

Now that you've learned what the search API building block provides, learn how it can work in your application with the following how-to guide:

- [How-To: Index and search documents]({{% ref howto-search %}})

## Next steps

- [How-To: Index and search documents]({{% ref howto-search %}})
- [Search API reference]({{% ref search_api %}})
- [Search component specs]({{% ref supported-search %}})
- [Vector API overview]({{% ref vector-overview %}})
