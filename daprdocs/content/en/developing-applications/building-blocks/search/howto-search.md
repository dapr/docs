---
type: docs
title: "How-To: Index and search documents"
linkTitle: "How-To: Search documents"
weight: 2000
description: "Learn how to index, query, and manage documents using the search API"
---

{{% alert title="Alpha" color="primary" %}}
The search API is currently in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Let's get started using the [search API]({{% ref search-overview %}}). In this guide, you'll learn how to:

- Set up a Meilisearch search component.
- Create an index.
- Index documents and wait for the write to complete.
- Run full-text searches with filters, sorting, and pagination.
- Retrieve and delete documents by ID.

The examples in this guide call the Dapr HTTP API with `curl`. Dapr SDK support for the search API is not yet available.

## Pre-requisites

- [Dapr CLI and initialised environment](https://docs.dapr.io/getting-started)
- [Docker](https://docs.docker.com/get-docker/)

## Start Meilisearch

Run a local Meilisearch instance with Docker:

```bash
docker run -d --name meilisearch -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:latest
```

## Set up the search component

Create a file called `search.yaml` in your components directory (for example, `./components`):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysearch
spec:
  type: search.meilisearch
  version: v1
  metadata:
  - name: host
    value: "http://localhost:7700"
  - name: apiKey
    value: "masterKey"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. Using a secret store is recommended to store the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

See the [search component specs]({{% ref supported-search %}}) for all supported search components.

## Run the Dapr sidecar

Start a Dapr sidecar that loads the component:

```bash
dapr run --app-id search-app --dapr-http-port 3500 --resources-path ./components
```

## Create an index

Create an index called `articles`. Index settings are component specific and are passed as `metadata`. Meilisearch only filters and sorts on attributes that are declared up front, so declare `category` and `price` here:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles \
  -H "Content-Type: application/json" \
  -d '{
        "metadata": {
          "filterableAttributes": "category,price",
          "sortableAttributes": "price"
        }
      }'
```

Creating an index that already exists returns HTTP `409` (`ALREADY_EXISTS`), and Dapr does not change the settings of the existing index.

Confirm the index was created. The Meilisearch component always adds `id` to the sortable attributes, because it uses the document ID as a tie-breaker for stable pagination:

```bash
curl http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles
```

```json
{
  "index": "articles",
  "properties": {
    "filterableAttributes": "category,price",
    "primaryKey": "id",
    "sortableAttributes": "id,price"
  }
}
```

## Index documents

Document `content` must be a JSON object. Because the field is defined as bytes, the HTTP API expects it base64-encoded. For example, the content of the first document below is the base64 encoding of `{"title":"Getting started with Dapr","category":"guide","price":10}`.

The following request indexes three documents and waits up to 10 seconds for Meilisearch to finish indexing them:

```bash
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
            "content": "eyJ0aXRsZSI6IkRhcHIgcHViL3N1YiBkZWVwIGRpdmUiLCJjYXRlZ29yeSI6Imd1aWRlIiwicHJpY2UiOjI1fQ=="
          },
          {
            "id": "doc-3",
            "content": "eyJ0aXRsZSI6IlNlYXJjaCBBUEkgcmVmZXJlbmNlIiwiY2F0ZWdvcnkiOiJyZWZlcmVuY2UiLCJwcmljZSI6MzB9"
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
  "ack": "INDEX_ACK_COMPLETED"
}
```

If some documents could not be indexed, they are listed in `failedItems` with their error, while the rest of the batch is still indexed.

{{% alert title="Note" color="primary" %}}
If you omit `options`, Dapr returns as soon as Meilisearch queues the write (`INDEX_ACK_QUEUED`). The documents become searchable shortly afterwards, once Meilisearch has processed the task.
{{% /alert %}}

## Search the index

Run a full-text search for `dapr`, restricted to guides, sorted by price, and highlighting matches in the `title` field:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "text": "dapr",
        "filter": { "category": "guide" },
        "sort": [ { "field": "price", "order": "SORT_ORDER_ASC" } ],
        "highlightFields": [ "title" ],
        "includeContent": true,
        "topK": 1
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
  "totalHits": "2",
  "continuationToken": "eyJ...",
  "totalHitsRelation": "TOTAL_HITS_RELATION_ESTIMATE"
}
```

Because `topK` is `1` and there are more results, the response includes a `continuationToken`. To get the next page, send the same request again with the token:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "text": "dapr",
        "filter": { "category": "guide" },
        "sort": [ { "field": "price", "order": "SORT_ORDER_ASC" } ],
        "highlightFields": [ "title" ],
        "includeContent": true,
        "topK": 1,
        "continuationToken": "<token from the previous response>"
      }'
```

A continuation token is only valid for the query that produced it. Changing the query, filter, sort, or field options between pages returns an `INVALID_ARGUMENT` error.

### Use a provider-native query

When you need a feature the portable request does not cover, send a provider-native query in `native` instead of `text`. For Meilisearch, `native` accepts the fields of the [Meilisearch search request](https://www.meilisearch.com/docs/reference/api/search), except for pagination and sort fields, which must use the portable `topK`, `continuationToken`, and `sort` fields:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "native": { "q": "dapr", "matchingStrategy": "all" },
        "topK": 10
      }'
```

## Get documents by ID

Fetch documents by ID. Found documents are returned in request order; IDs that don't exist are omitted:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/documents/get \
  -H "Content-Type: application/json" \
  -d '{
        "ids": [ "doc-1", "doc-42" ],
        "includeContent": true
      }'
```

## Delete documents

Deleting documents is a write and takes the same `options` as indexing. IDs that don't exist are not an error:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/documents/delete \
  -H "Content-Type: application/json" \
  -d '{
        "ids": [ "doc-2" ],
        "options": {
          "mode": "INDEXING_MODE_WAIT_FOR_COMPLETION",
          "waitTimeout": "10s",
          "onWaitTimeout": "INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC"
        }
      }'
```

## Delete the index

```bash
curl -X DELETE http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles
```

## Next steps

- [Search API reference]({{% ref search_api %}})
- [Search component specs]({{% ref supported-search %}})
- [How-To: Store and query vectors]({{% ref howto-vector %}})
