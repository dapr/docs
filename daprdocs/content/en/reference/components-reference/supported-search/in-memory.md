---
type: docs
title: "In-memory"
linkTitle: "In-memory"
description: Detailed information on the in-memory search component
---

The in-memory search store keeps every index in the memory of the Dapr sidecar. Use it for local development and tests that need no external search service. It is not durable: indexes and documents are lost when the sidecar stops, and they aren't shared between sidecar instances.

## Component format

To set up an in-memory search store, create a component of type `search.in-memory`. See [this guide]({{% ref "howto-search.md#set-up-the-search-component" %}}) on how to create and apply a search store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: search.in-memory
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
| Full-text search | Y | See [scores and total hits](#scores-and-total-hits). |
| Filtering | Y | |
| Sorting | Y | |
| Highlighting | N | A query with `highlightFields` returns `UNIMPLEMENTED`. |
| Pagination | Y | Continuation tokens are offset based. |
| Native queries | N | A query with `native` returns `UNIMPLEMENTED`. |
| Queued acknowledgement | Y | Writes return `INDEX_ACK_QUEUED` when `indexingDelay` is set, so `INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC` is supported. Without a delay, writes return `INDEX_ACK_COMPLETED`. |
| Wait for completion | Y | With `indexingDelay` set, the request waits for the queued write, up to `waitTimeout`. |

## Scores and total hits

- A full-text query searches the `searchFields` of the query, or every content field when `searchFields` isn't set. Matching is case-insensitive, and text is split into words of letters and digits.
- A document matches only when every query term occurs in the searched fields. The hit score is the number of times the query terms occur.
- Without `sort`, hits are ordered by score, highest first, then by document ID. With `sort`, the score and document ID break ties.
- `totalHits` is exact and reported with `TOTAL_HITS_RELATION_EXACT`.
- When `topK` isn't set, the component returns up to 10 hits per page.

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Search API overview]({{% ref search-overview %}})
- [Search API reference]({{% ref search_api %}})
- [In-memory vector component]({{% ref "/reference/components-reference/supported-vector/in-memory.md" %}})
