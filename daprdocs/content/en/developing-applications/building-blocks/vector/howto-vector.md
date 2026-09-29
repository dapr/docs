---
type: docs
title: "How-To: Store and query vectors"
linkTitle: "How-To: Query vectors"
weight: 2000
description: "Learn how to store embeddings and run similarity queries using the vector API"
---

{{% alert title="Alpha" color="primary" %}}
The vector API is currently in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Let's get started using the [vector API]({{% ref vector-overview %}}). In this guide, you'll learn how to:

- Set up a Meilisearch vector component.
- Create a collection.
- Upsert records with vectors, metadata, and payloads.
- Run similarity queries with metadata filters and score thresholds.
- Run several queries in one batch.
- Retrieve and delete records by ID.

The examples in this guide call the Dapr HTTP API with `curl` and use 4-dimensional vectors to keep them readable. In a real application, vectors come from an embedding model and typically have hundreds or thousands of dimensions. Dapr SDK support for the vector API is not yet available.

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

## Set up the vector component

Create a file called `vector.yaml` in your components directory (for example, `./components`):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myvectors
spec:
  type: vector.meilisearch
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

See the [vector component specs]({{% ref supported-vector %}}) for all supported vector components.

## Run the Dapr sidecar

Start a Dapr sidecar that loads the component:

```bash
dapr run --app-id vector-app --dapr-http-port 3500 --resources-path ./components
```

## Create a collection

Create a collection called `cars` for 4-dimensional vectors compared with cosine similarity:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars \
  -H "Content-Type: application/json" \
  -d '{
        "dimensions": 4,
        "metric": "DISTANCE_METRIC_COSINE"
      }'
```

Confirm the collection was created:

```bash
curl http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars
```

```json
{
  "collection": "cars",
  "properties": {
    "filterableAttributes": "daprMetadata",
    "primaryKey": "id"
  },
  "dimensions": 4,
  "metric": "DISTANCE_METRIC_COSINE"
}
```

## Upsert records

Each record has an `id`, the vector `values`, structured `metadata` that you can filter on, and an optional opaque `payload`. Because `payload` is defined as bytes, the HTTP API expects it base64-encoded. In this example, the payload of `car-1` is the base64 encoding of `{"name":"Model 3"}`.

The following request upserts three records and waits up to 10 seconds for them to be written:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/upsert \
  -H "Content-Type: application/json" \
  -d '{
        "records": [
          {
            "id": "car-1",
            "values": [1, 0, 0, 0],
            "metadata": { "make": "tesla", "year": 2023, "dealer": { "city": "Seattle" } },
            "payload": "eyJuYW1lIjoiTW9kZWwgMyJ9"
          },
          {
            "id": "car-2",
            "values": [0.9, 0.1, 0, 0],
            "metadata": { "make": "tesla", "year": 2025, "dealer": { "city": "Portland" } },
            "payload": "eyJuYW1lIjoiTW9kZWwgWSJ9"
          },
          {
            "id": "car-3",
            "values": [0, 1, 0, 0],
            "metadata": { "make": "ford", "year": 2024, "dealer": { "city": "Seattle" } }
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

{{% alert title="Note" color="primary" %}}
If you omit `options`, Dapr returns as soon as Meilisearch queues the write (`INDEX_ACK_QUEUED`). The records become queryable shortly afterwards, once Meilisearch has processed the task.
{{% /alert %}}

## Query the collection

Find the two records closest to a query vector, only for Teslas sold in Seattle or Portland, and return their payloads:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/query \
  -H "Content-Type: application/json" \
  -d '{
        "vector": { "values": [1, 0, 0, 0] },
        "topK": 2,
        "filter": {
          "make": "tesla",
          "dealer.city": { "$in": ["Seattle", "Portland"] }
        },
        "includePayload": true
      }'
```

```json
{
  "matches": [
    {
      "record": {
        "id": "car-1",
        "payload": "eyJuYW1lIjoiTW9kZWwgMyJ9",
        "metadata": { "dealer": { "city": "Seattle" }, "make": "tesla", "year": 2023 }
      },
      "score": 1
    },
    {
      "record": {
        "id": "car-2",
        "payload": "eyJuYW1lIjoiTW9kZWwgWSJ9",
        "metadata": { "dealer": { "city": "Portland" }, "make": "tesla", "year": 2025 }
      },
      "score": 0.9938837
    }
  ],
  "metric": "DISTANCE_METRIC_COSINE"
}
```

Scores are the cosine similarity between the query vector and each record, where `1` is identical.

### Filter by score

Use `scoreThreshold` to keep only matches that are close enough. For cosine similarity, matches with a score greater than or equal to the threshold are kept:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/query \
  -H "Content-Type: application/json" \
  -d '{
        "vector": { "values": [1, 0, 0, 0] },
        "topK": 10,
        "scoreThreshold": 0.5
      }'
```

### Query by record ID

To find records similar to one you've already stored, use `byId` instead of a query vector:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/query \
  -H "Content-Type: application/json" \
  -d '{
        "byId": "car-3",
        "topK": 3
      }'
```

## Run a batch of queries

Send several queries to the same collection in one call. Each query succeeds or fails independently, and results are returned in request order. In this example, the second query is invalid because it sets neither a vector nor a record ID, so its slot contains an error while the first query still returns matches (error `details` are omitted from the response below for brevity):

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/batch-query \
  -H "Content-Type: application/json" \
  -d '{
        "queries": [
          { "vector": { "values": [0, 1, 0, 0] }, "topK": 1 },
          { "topK": 1 }
        ]
      }'
```

```json
{
  "results": [
    {
      "response": {
        "matches": [
          { "record": { "id": "car-3", "metadata": { "dealer": { "city": "Seattle" }, "make": "ford", "year": 2024 } }, "score": 1 }
        ],
        "metric": "DISTANCE_METRIC_COSINE"
      }
    },
    {
      "error": {
        "code": 3,
        "message": "exactly one of vector or by_id must be set"
      }
    }
  ]
}
```

## Get records by ID

Fetch records by ID, including their vector values. Found records are returned in request order; IDs that don't exist are omitted:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/get \
  -H "Content-Type: application/json" \
  -d '{
        "ids": [ "car-1", "car-42" ],
        "includeValues": true
      }'
```

## Delete records

Deleting records is a write and takes the same `options` as upserting. IDs that don't exist are not an error:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars/vectors/delete \
  -H "Content-Type: application/json" \
  -d '{
        "ids": [ "car-2" ]
      }'
```

## Delete the collection

```bash
curl -X DELETE http://localhost:3500/v1.0-alpha1/vector/myvectors/collections/cars
```

## Next steps

- [Vector API reference]({{% ref vector_api %}})
- [Vector component specs]({{% ref supported-vector %}})
- [Conversation API overview]({{% ref conversation-overview %}})
