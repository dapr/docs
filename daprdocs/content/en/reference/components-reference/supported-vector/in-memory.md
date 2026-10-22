---
type: docs
title: "In-memory"
linkTitle: "In-memory"
description: Detailed information on the in-memory vector component
---

The in-memory vector store keeps every collection in the memory of the Dapr sidecar. Use it for local development and tests that need no external vector database. It is not durable: collections and records are lost when the sidecar stops, and they aren't shared between sidecar instances.

## Component format

To set up an in-memory vector store, create a component of type `vector.in-memory`. See [this guide]({{% ref "howto-vector.md#set-up-the-vector-component" %}}) on how to create and apply a vector store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: vector.in-memory
  version: v1
  metadata:
  - name: indexingDelay
    value: "0s"
```

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `indexingDelay` | N | Queues every write and applies it once this delay has passed, so that you can test queued acknowledgements and wait timeouts. Defaults to `"0s"`, which applies writes before the call returns. | `"2s"` |

## Supported features

| Feature | Supported | Details |
|---------|:---------:|---------|
| Dense vectors | Y | |
| Distance metrics | Cosine, dot product, Euclidean | `DISTANCE_METRIC_UNSPECIFIED` selects cosine when a collection is created. A query can use a different metric from the collection's. |
| Query by ID | Y | A `byId` that matches no record fails that query with `NOT_FOUND`. |
| Score threshold | Y | |
| Metadata filtering | Y | |
| Batch query | Y | Each query is evaluated independently. |
| Queued acknowledgement | Y | Writes return `INDEX_ACK_QUEUED` when `indexingDelay` is set, so `INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC` is supported. Without a delay, writes return `INDEX_ACK_COMPLETED`. |
| Wait for completion | Y | With `indexingDelay` set, the request waits for the queued write, up to `waitTimeout`. |

## Queries and records

- A query compares the query vector with every record in the collection, so query time grows with the number of records.
- A record whose number of values differs from the collection's dimensions, or whose values aren't finite numbers, is reported in `failedItems` with `INVALID_ARGUMENT`. Under cosine similarity, a vector whose values are all zero is also rejected. The rest of the records are still written.
- When `topK` isn't set, the component returns up to 10 matches.

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Vector API overview]({{% ref vector-overview %}})
- [Vector API reference]({{% ref vector_api %}})
- [In-memory search component]({{% ref "/reference/components-reference/supported-search/in-memory.md" %}})
