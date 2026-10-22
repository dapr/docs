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

The HTTP API uses the [JSON mapping of the protobuf messages](https://protobuf.dev/programming-guides/json/): field names are camelCase, 64-bit integers are strings, and bytes are base64-encoded. Responses include fields set to their zero value and omit optional fields that aren't set. The SDKs hide these details: document content is a plain object, and enumerations are short strings such as `"completed"` or `"asc"`.

## Pre-requisites

- [Dapr CLI and initialised environment](https://docs.dapr.io/getting-started)
- [Docker](https://docs.docker.com/get-docker/)

## Start Meilisearch

Run a local Meilisearch instance with Docker:

```bash
docker run -d --name meilisearch -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:v1.43
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

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

Create a Node.js project and install the Dapr SDK (version **3.19.0-rc.5 or later**):

```bash
npm init -y
npm install @dapr/dapr@3.19.0-rc.5
```

The examples below go in a single `app.mjs` file. Create the client once and reuse it for every call. The search API is available over both HTTP and gRPC; the gRPC protocol sends document content as raw bytes, while HTTP base64-encodes it for you.

```javascript
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: process.env.DAPR_GRPC_PORT,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});

const storeName = "mysearch";
const indexName = "articles";
```

Run the application with a sidecar:

```bash
dapr run --app-id search-app --resources-path ./components -- node app.mjs
```

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

```bash
dapr run --app-id search-app --dapr-http-port 3500 --resources-path ./components
```

Run the `curl` commands below in a separate terminal.

{{% /tab %}}

{{< /tabpane >}}

## Create an index

Create an index called `articles`. Index settings are component specific and are passed as `metadata`. Meilisearch only filters and sorts on attributes that are declared up front, so declare `category` and `price` here:

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

```javascript
await client.search.createIndex(storeName, indexName, {
  metadata: {
    filterableAttributes: "category,price",
    sortableAttributes: "price",
  },
});
```

Creating an index that already exists fails with `ALREADY_EXISTS` (HTTP `409`), and Dapr does not change the settings of the existing index.

Confirm the index was created. The Meilisearch component always adds `id` to the sortable attributes, because it uses the document ID as a tie-breaker for stable pagination:

```javascript
const info = await client.search.getIndex(storeName, indexName);
console.log(info);
// {
//   index: 'articles',
//   documentCount: 0,
//   properties: {
//     filterableAttributes: 'category,price',
//     primaryKey: 'id',
//     sortableAttributes: 'id,price'
//   }
// }

const indexes = await client.search.listIndexes(storeName);
console.log(indexes); // [ 'articles' ]
```

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

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
  "documentCount": "0",
  "properties": {
    "filterableAttributes": "category,price",
    "primaryKey": "id",
    "sortableAttributes": "id,price"
  }
}
```

{{% /tab %}}

{{< /tabpane >}}

## Index documents

Document `content` must be a JSON object. The following request indexes three documents and waits up to 10 seconds for Meilisearch to finish indexing them:

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

Pass the content as a plain object; the SDK serializes it for you. Documents can carry optional `metadata`, which is stored alongside the content and returned with it.

```javascript
const waitOptions = {
  mode: "waitForCompletion",
  waitTimeout: "10s",
  onWaitTimeout: "failRequest",
};

const result = await client.search.indexDocuments(
  storeName,
  indexName,
  [
    {
      id: "doc-1",
      content: { title: "Getting started with Dapr", category: "guide", price: 10 },
      metadata: { author: "alice" },
    },
    {
      id: "doc-2",
      content: { title: "Dapr pub/sub deep dive", category: "guide", price: 25 },
    },
    {
      id: "doc-3",
      content: { title: "Search API reference", category: "reference", price: 30 },
    },
  ],
  waitOptions,
);

console.log(result.ack); // "completed"

if (result.failedItems.length > 0) {
  for (const item of result.failedItems) {
    console.error(`Failed to index ${item.id}: ${item.errorCode} ${item.errorMessage}`);
  }
}
```

If some documents could not be indexed, they are listed in `failedItems` with their error, while the rest of the batch is still indexed. For example, a document whose `content` isn't a JSON object, or uses an attribute that the Meilisearch component reserves, is reported with error code `3` (`INVALID_ARGUMENT`).

{{% alert title="Note" color="primary" %}}
If you omit the options, Dapr returns as soon as Meilisearch queues the write (`ack` is `"queued"`). The documents become searchable shortly afterwards, once Meilisearch has processed the task.
{{% /alert %}}

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

Because the `content` field is defined as bytes, the HTTP API expects it base64-encoded. For example, the content of the first document below is the base64 encoding of `{"title":"Getting started with Dapr","category":"guide","price":10}`.

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
  "failedItems": [],
  "ack": "INDEX_ACK_COMPLETED"
}
```

If some documents could not be indexed, they are listed in `failedItems` with their error, while the rest of the batch is still indexed. For example, a document whose `content` isn't a JSON object, or uses an attribute that the Meilisearch component reserves, is reported with `INVALID_ARGUMENT`.

{{% alert title="Note" color="primary" %}}
If you omit `options`, Dapr returns as soon as Meilisearch queues the write (`INDEX_ACK_QUEUED`). The documents become searchable shortly afterwards, once Meilisearch has processed the task.
{{% /alert %}}

{{% /tab %}}

{{< /tabpane >}}

## Search the index

Run a full-text search for `dapr`, restricted to guides, sorted by price, and highlighting matches in the `title` field. Because `topK` is `1` and there are more results, the response includes a `continuationToken` that you send back to fetch the next page.

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

The loop below pages through all matching documents by passing the `continuationToken` from each response into the next query:

```javascript
let continuationToken;

do {
  const page = await client.search.search(storeName, indexName, {
    text: "dapr",
    filter: { category: { $eq: "guide" } },
    sort: [{ field: "price", order: "asc" }],
    highlightFields: ["title"],
    includeContent: true,
    topK: 1,
    continuationToken,
  });

  for (const hit of page.hits) {
    console.log(hit.document.id, hit.score, hit.document.content?.title);
    console.log(hit.highlights?.title); // "Getting started with <em>Dapr</em>"
  }

  console.log(`${page.totalHits} total hits (${page.totalHitsRelation})`);
  continuationToken = page.continuationToken;
} while (continuationToken);
```

A continuation token is only valid for the query that produced it. Changing the query, `topK`, filter, sort, or field options between pages fails with `INVALID_ARGUMENT`.

To list every document in the index, call `search` without a query, or with a query that has neither `text` nor `native`. A `filter` still applies:

```javascript
const all = await client.search.search(storeName, indexName);

const guides = await client.search.search(storeName, indexName, {
  filter: { category: { $eq: "guide" } },
  topK: 50,
});
```

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

The query is set in the `query` field of the request:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "query": {
          "text": "dapr",
          "filter": { "category": "guide" },
          "sort": [ { "field": "price", "order": "SORT_ORDER_ASC" } ],
          "highlightFields": [ "title" ],
          "includeContent": true,
          "topK": 1
        }
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

To get the next page, send the same request again with the token:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "query": {
          "text": "dapr",
          "filter": { "category": "guide" },
          "sort": [ { "field": "price", "order": "SORT_ORDER_ASC" } ],
          "highlightFields": [ "title" ],
          "includeContent": true,
          "topK": 1,
          "continuationToken": "<token from the previous response>"
        }
      }'
```

A continuation token is only valid for the query that produced it. Changing the query, `topK`, filter, sort, or field options between pages returns an `INVALID_ARGUMENT` error.

To list every document in the index, omit `query`, or send a `query` without `text` or `native`. A `filter` still applies.

{{% /tab %}}

{{< /tabpane >}}

### Use a provider-native query

When you need a feature the portable request does not cover, send a provider-native query in `native` instead of `text`. For Meilisearch, `native` accepts the fields of the [Meilisearch search request](https://www.meilisearch.com/docs/reference/api/search), except for pagination and sort fields, which must use the portable `topK`, `continuationToken`, and `sort` fields:

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

```javascript
const strict = await client.search.search(storeName, indexName, {
  native: { q: "dapr", matchingStrategy: "all" },
  topK: 10,
});
```

Setting both `text` and `native` on the same query throws a `TypeError` before the request is sent.

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/query \
  -H "Content-Type: application/json" \
  -d '{
        "query": {
          "native": { "q": "dapr", "matchingStrategy": "all" },
          "topK": 10
        }
      }'
```

{{% /tab %}}

{{< /tabpane >}}

## Get documents by ID

Fetch documents by ID. Found documents are returned in request order; IDs that don't exist are omitted:

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

```javascript
const docs = await client.search.getDocuments(storeName, indexName, ["doc-1", "doc-42"], {
  includeContent: true,
});

for (const doc of docs) {
  console.log(doc.id, doc.content, doc.metadata);
}
// doc-1 { title: 'Getting started with Dapr', category: 'guide', price: 10 } { author: 'alice' }
```

Without `includeContent`, each returned document has `content` set to `undefined`.

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles/documents/get \
  -H "Content-Type: application/json" \
  -d '{
        "ids": [ "doc-1", "doc-42" ],
        "includeContent": true
      }'
```

{{% /tab %}}

{{< /tabpane >}}

## Delete documents

Deleting documents is a write and takes the same options as indexing. IDs that don't exist are not an error:

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

```javascript
const ack = await client.search.deleteDocuments(storeName, indexName, ["doc-2"], {
  mode: "waitForCompletion",
  waitTimeout: "10s",
  onWaitTimeout: "continueAsync",
});

console.log(ack); // "completed", or "queued" if the wait timed out
```

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

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

{{% /tab %}}

{{< /tabpane >}}

## Delete the index

{{< tabpane text=true >}}

{{% tab "JavaScript" %}}

```javascript
await client.search.deleteIndex(storeName, indexName);
```

{{% /tab %}}

{{% tab "HTTP API (Bash)" %}}

```bash
curl -X DELETE http://localhost:3500/v1.0-alpha1/search/mysearch/indexes/articles
```

Requests without a body (get, list, and delete index) take request metadata as `metadata.<key>=<value>` query parameters.

{{% /tab %}}

{{< /tabpane >}}

## Next steps

- [Search API reference]({{% ref search_api %}})
- [Search component specs]({{% ref supported-search %}})
- [How-To: Store and query vectors]({{% ref howto-vector %}})
