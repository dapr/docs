---
type: docs
title: "How to: Index and search documents with the Dapr JavaScript SDK"
linkTitle: "How to: Search documents"
weight: 53050
description: Learn how to configure a search component and manage and query documents using the Dapr JavaScript SDK
---

Use `DaprClient.search` to manage indexes and search JSON documents through a Dapr search component. This guide uses Meilisearch and covers index creation, document writes, full-text search, filtering, sorting, pagination, retrieval, and deletion. All examples work over HTTP or gRPC.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}}) with Dapr runtime 1.19 or later
- [Node.js](https://nodejs.org/) 18 or later
- [Docker](https://docs.docker.com/get-docker/) to run Meilisearch locally
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, version 3.19.0 or later

In your application directory, initialize an npm project if you do not already have one, then install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

The examples use JavaScript ES modules and run as a `.mjs` file without a TypeScript compiler. The same APIs are available in TypeScript.

## Configure Meilisearch

Start a local Meilisearch instance:

```sh
docker run -d --name meilisearch -p 7700:7700 -e MEILI_MASTER_KEY=masterKey getmeili/meilisearch:v1.43
```

Create a `components` directory in your application directory and save the following as `components\search.yaml`:

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
This configuration uses a plain-text key for local development. Use a [secret store reference]({{% ref component-secrets.md %}}) for production credentials.
{{% /alert %}}

The component's `metadata.name`, `mysearch`, is the store name passed to every client operation. It is not the component type or the YAML file name. See the [Meilisearch component reference]({{% ref "reference/components-reference/supported-search/meilisearch.md" %}}) for settings and provider restrictions.

## Create an index and search documents

Save the following as `app.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

const storeName = "mysearch";
const indexName = "articles";
const waitOptions = {
  mode: "waitForCompletion",
  waitTimeout: "10s",
  onWaitTimeout: "failRequest",
};

try {
  await client.search.createIndex(storeName, indexName, {
    metadata: {
      filterableAttributes: "category,price",
      sortableAttributes: "price",
      searchableAttributes: "title",
    },
  });

  const indexed = await client.search.indexDocuments(
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
  if (indexed.failedItems.length > 0) {
    console.error("Documents not indexed:", indexed.failedItems);
    throw new Error("Document indexing had item failures");
  }
  console.log("Write acknowledgement:", indexed.ack);

  const query = {
    text: "dapr",
    filter: { category: { $eq: "guide" } },
    sort: [{ field: "price", order: "asc" }],
    highlightFields: ["title"],
    includeContent: true,
    topK: 1,
  };
  let continuationToken;
  do {
    const page = await client.search.search(storeName, indexName, {
      ...query,
      continuationToken,
    });
    for (const hit of page.hits) {
      console.log(hit.document.id, hit.document.content, hit.score, hit.highlights);
    }
    continuationToken = page.continuationToken;
  } while (continuationToken);
} finally {
  await client.stop();
}
```

Start the application with a Dapr sidecar, loading the component from `components`:

```sh
dapr run --app-id search-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```

To use gRPC instead, change `communicationProtocol` to `CommunicationProtocolEnum.GRPC` and `daprPort` to `"50001"`. No other search code changes are required.

The example waits for indexing to complete before searching, then returns `doc-1` and `doc-2` in ascending price order across two pages. Meilisearch highlights matches with `<em>` tags. Scores and total-hit estimates are provider dependent; do not depend on a particular score value.

Creating an existing index fails with `ALREADY_EXISTS` and does not update its settings. Before rerunning this application against the same Meilisearch instance, delete the example index using `deleteIndex` below, or choose a new index name. Unlike an in-memory store, Meilisearch can retain documents across sidecar restarts.

The following snippets reuse `client`, `storeName`, `indexName`, and `waitOptions`. Add them inside the `try` block after the search loop and before the client is stopped. Run the deletion examples last.

## Inspect indexes

```javascript
const indexes = await client.search.listIndexes(storeName);
console.log("Indexes:", indexes);

const index = await client.search.getIndex(storeName, indexName);
console.log(index.index, index.documentCount, index.properties);
```

`documentCount` is an approximate count, or `0` if the provider cannot supply one efficiently. For Meilisearch, `properties` includes `primaryKey` and the configured attribute settings. Meilisearch requires filter and sort attributes to be declared at index creation; the component adds `id` as a sortable tie-breaker for pagination.

## Retrieve and update documents

```javascript
const documents = await client.search.getDocuments(
  storeName,
  indexName,
  ["doc-2", "missing", "doc-1"],
  { includeContent: true },
);
console.log(documents);

const updated = await client.search.indexDocuments(
  storeName,
  indexName,
  [
    {
      id: "doc-1",
      content: { title: "Updated Dapr guide", category: "guide", price: 12 },
      metadata: { author: "alice", revision: "2" },
    },
  ],
  waitOptions,
);
if (updated.failedItems.length > 0) {
  console.error("Documents not updated:", updated.failedItems);
  throw new Error("Document update had item failures");
}
```

Retrieval returns found documents in request order and omits missing IDs. Without `includeContent: true`, it returns IDs and stored metadata, with `content` undefined. Indexing uses keyed upserts: submit an existing ID to update that document. Supply the complete intended content and metadata rather than assuming a partial-patch operation.

Pass ordinary JSON objects as `content`; the SDK serializes them and handles transport encoding, including base64 for HTTP. Do not base64-encode or stringify content yourself. Stored document metadata is opaque and is not searchable or filterable. Fields to search, filter, or sort must be in `content`.

For Meilisearch, document IDs must be 1 to 511 bytes of ASCII letters, digits, hyphens, and underscores. Content must not contain the reserved top-level keys `id`, `daprMetadata`, `daprPayload`, or keys beginning with `_`. Invalid content is reported in `failedItems`, while valid documents in the batch can still be indexed.

## Shape search results

Restrict full-text search to selected fields and return only the content fields you need:

```javascript
const projected = await client.search.search(storeName, indexName, {
  text: "dapr",
  searchFields: ["title"],
  filter: {
    $and: [
      { category: { $eq: "guide" } },
      { price: { $lt: 20 } },
    ],
  },
  includeContent: true,
  returnFields: ["title", "price"],
  topK: 10,
});
console.log(projected.hits.map((hit) => hit.document.content));
```

`returnFields` alone does not request content; set `includeContent: true` as well. Omit the query to match all documents, or specify only a filter to browse a subset:

```javascript
const all = await client.search.search(storeName, indexName);
const guides = await client.search.search(storeName, indexName, {
  filter: { category: "guide" },
  includeContent: true,
});
console.log(all.hits, guides.hits);
```

Each call returns one page, not necessarily every match. Follow `continuationToken` as in the complete example. Keep all query fields, including `topK`, unchanged between pages; only change the token. Tokens are opaque: do not decode, edit, or URL-encode them.

### Use a provider-native query

Use `native` instead of `text` for provider-specific search features:

```javascript
const native = await client.search.search(storeName, indexName, {
  native: { q: "dapr", matchingStrategy: "all" },
  topK: 10,
  includeContent: true,
});
console.log(native.hits);
```

`text` and `native` are mutually exclusive. For Meilisearch, native queries must not set `offset`, `limit`, `page`, `hitsPerPage`, or `sort`; use the portable `topK`, `continuationToken`, and `sort` fields instead. A native filter is ANDed with the portable filter.

## Delete documents and the index

```javascript
const ack = await client.search.deleteDocuments(
  storeName,
  indexName,
  ["doc-2", "missing"],
  waitOptions,
);
console.log("Delete acknowledgement:", ack);

await client.search.deleteIndex(storeName, indexName);
```

Deleting missing document IDs is not an error. Document deletion uses the same write acknowledgement options as indexing, but returns the acknowledgement string directly. Deleting an index removes the index and all of its documents.

## Next steps

Read the [client usage guidance]({{% ref js-search-client-usage.md %}}) for the full query and result shapes, write acknowledgement modes, cancellation, and error handling. See the [Search API overview]({{% ref search-overview.md %}}) and [Search API reference]({{% ref search_api.md %}}) for runtime semantics.
