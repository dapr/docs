---
type: docs
title: "How to: Store and query vectors with the Dapr JavaScript SDK"
linkTitle: "How to: Store and query vectors"
weight: 53050
description: Learn how to manage collections, store embeddings, and query similar vectors using the Dapr JavaScript SDK
---

Use `DaprClient.vector` to store precomputed embeddings and find similar records through a Dapr vector store component. This guide covers collection configuration, upserts, retrieval, similarity queries, batch queries, and deletes.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}}) with a Vector-capable runtime from the **1.19 release line or later**
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, **version 3.19.0-rc.4 or later**
- A configured vector store component, such as the in-memory component below

{{% alert title="Preview runtime support" color="warning" %}}
Dapr runtime 1.19.0-rc.0 through 1.19.0-rc.4 do not include the Vector API. For preview development, use a build that includes Vector, such as `edge`. Edge builds are development builds, not production releases.
{{% /alert %}}

In your application directory, initialize an npm project if you do not already have one, then install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0-rc.4
```

The examples use JavaScript ES modules and run as a `.mjs` file without a TypeScript compiler. The same APIs are available in TypeScript.

## Configure an in-memory vector store

Create a `components` directory in your application directory and save the following as `vectorstore.yaml` inside it:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vectorstore
spec:
  type: vector.in-memory
  version: v1
```

This component stores collections and records in the sidecar's memory. Data is lost when the sidecar stops and is not shared across sidecars. Use it for local development and testing, not durable storage.

The component's `metadata.name`, `vectorstore`, is the store name passed to every client operation. It is not the component's type or the YAML file name. A collection is a separate, named group of records within that store.

## Create a collection and query vectors

Save the following as `app.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

const storeName = "vectorstore";
const collection = "documents";
const writeOptions = {
  mode: "waitForCompletion",
  waitTimeout: "10s",
  onWaitTimeout: "failRequest",
};

try {
  await client.vector.createCollection(storeName, collection, {
    dimensions: 3,
    metric: "cosine",
  });

  const write = await client.vector.upsertVectors(
    storeName,
    collection,
    [
      {
        id: "doc-1",
        values: [1, 0, 0],
        payload: Buffer.from("Introduction to Dapr"),
        metadata: { category: "guide", details: { language: "en" } },
      },
      {
        id: "doc-2",
        values: [0.8, 0.6, 0],
        payload: Buffer.from("Building applications with Dapr"),
        metadata: { category: "guide", details: { language: "en" } },
      },
      {
        id: "doc-3",
        values: [0, 1, 0],
        metadata: { category: "reference", details: { language: "en" } },
      },
    ],
    writeOptions,
  );

  if (write.failedItems.length > 0) {
    console.error("Vector upsert failures:", write.failedItems);
    throw new Error("Not all vector records were stored");
  }
  if (write.ack !== "completed") {
    throw new Error("Vector indexing has not completed");
  }

  const result = await client.vector.queryVectors(storeName, collection, {
    vector: [1, 0, 0],
    topK: 2,
    includePayload: true,
    filter: { category: { $eq: "guide" } },
  });

  console.log("Metric:", result.metric);
  for (const match of result.matches) {
    console.log(
      match.record.id,
      match.score,
      match.record.payload === undefined
        ? "(no payload)"
        : Buffer.from(match.record.payload).toString("utf8"),
    );
  }
} finally {
  await client.stop();
}
```

Start the application with a Dapr sidecar, loading the component from `components`:

{{< tabpane text=true >}}
{{% tab "Linux/MacOS" %}}
```sh
dapr run --app-id vector-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path ./components -- node app.mjs
```
{{% /tab %}}
{{% tab "Windows" %}}
```powershell
dapr run --app-id vector-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```
{{% /tab %}}
{{< /tabpane >}}

The example creates a three-dimensional cosine collection, waits for indexing, and finds the two closest guide records. With the in-memory component, `doc-1` has a score of approximately `1` and `doc-2` approximately `0.8`. These illustrative vectors are supplied directly; the SDK does not generate embeddings.

To use gRPC instead, change `communicationProtocol` to `CommunicationProtocolEnum.GRPC` and `daprPort` to `"50001"`. All vector methods work with either protocol.

The examples below reuse `client`, `storeName`, `collection`, and `writeOptions`. Add them inside the `try` block, after the query and before the client is stopped. Run the delete examples last. Creating a collection that already exists fails; if you rerun against the same sidecar, reuse the existing collection or explicitly delete it first.

## Inspect collections and retrieve records

```javascript
console.log(await client.vector.listCollections(storeName));

const info = await client.vector.getCollection(storeName, collection);
console.log(info.collection, info.dimensions, info.metric, info.recordCount);

const records = await client.vector.getVectors(
  storeName,
  collection,
  ["doc-2", "missing", "doc-1"],
  { includeValues: true },
);
console.log(records);
```

`getCollection` returns the collection name, dimensions, effective metric, approximate record count, and component-specific `properties`. The count is `0` when unavailable.

`getVectors` omits missing IDs and retains request order for records it finds. It always retrieves payloads and record metadata, but returns `values: []` unless `includeValues` is `true`. Payloads are returned as `Uint8Array`, not automatically decoded text or JSON.

## Query by an existing record and filter metadata

Instead of supplying a vector, use `byId` to search using a stored record's vector:

```javascript
const similar = await client.vector.queryVectors(storeName, collection, {
  byId: "doc-1",
  topK: 5,
  includeValues: true,
  includePayload: true,
  scoreThreshold: 0.5,
  filter: {
    $and: [
      { category: { $eq: "guide" } },
      { "details.language": { $eq: "en" } },
    ],
  },
});
console.log(similar.matches);
```

Supply exactly one of `vector` or `byId`. A missing source record causes a single query to fail. Whether a `byId` query includes the source record among its matches depends on the component.

Filters apply to record metadata, not payload bytes. The portable filter DSL supports `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, and the boolean operators `$and`, `$or`, and `$not`. Use dotted paths for nested metadata fields.

For cosine and dot product, higher scores are better; for Euclidean distance, lower scores are better. `scoreThreshold` is inclusive on the metric's raw scale: a minimum score for cosine or dot product, or a maximum distance for Euclidean. It is not a normalized probability.

## Run multiple queries

`batchQueryVectors` runs queries against the same store and collection and returns one result per query in request order:

```javascript
const results = await client.vector.batchQueryVectors(storeName, collection, [
  { vector: [1, 0, 0], topK: 1 },
  { byId: "missing", topK: 1 },
]);

for (const [index, result] of results.entries()) {
  if (result.error !== undefined) {
    console.error("Query failed:", index, result.error.code, result.error.message);
  } else {
    console.log("Query matches:", index, result.response.matches);
  }
}
```

An individual runtime or provider failure stays in that query's result slot. Request-wide failures reject the whole call. Do not treat a resolved batch promise as proof that every query succeeded.

## Delete records and collections

```javascript
const ack = await client.vector.deleteVectors(
  storeName,
  collection,
  ["doc-1", "missing"],
  writeOptions,
);
console.log("Delete acknowledgement:", ack);

await client.vector.deleteCollection(storeName, collection);
```

Deleting missing record IDs is not an error. Deleting a collection removes the collection and its records; operations against a missing collection fail.

## Next steps

Read the [client usage guidance]({{% ref js-vector-client-usage.md %}}) for indexing acknowledgements, record replacement, query defaults, cancellation, and error handling.
