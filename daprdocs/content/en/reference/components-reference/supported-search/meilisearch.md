---
type: docs
title: "Meilisearch"
linkTitle: "Meilisearch"
description: Detailed information on the Meilisearch search component
---

## Component format

To set up a Meilisearch search store, create a component of type `search.meilisearch`. See [this guide]({{% ref "howto-search.md#set-up-the-search-component" %}}) on how to create and apply a search store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: search.meilisearch
  version: v1
  metadata:
  - name: host
    value: "http://localhost:7700"
  - name: apiKey
    value: "<API_KEY>"
  - name: timeout
    value: "10s"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `host` | Y | The Meilisearch host URL. | `"http://localhost:7700"` |
| `apiKey` | N | The Meilisearch API key. Required when the Meilisearch instance is protected with a master key. | `"masterKey"` |
| `timeout` | N | The HTTP client timeout for requests to Meilisearch, as a Go duration. | `"10s"` |

## Supported features

| Feature | Supported | Details |
|---------|:---------:|---------|
| Full-text search | Y | `text` queries use Meilisearch's keyword search. |
| Filtering | Y | Filters must only use attributes declared in `filterableAttributes`. `$regex` isn't supported. |
| Sorting | Y | Sort fields must be declared in `sortableAttributes`. |
| Highlighting | Y | Highlighted fragments use `<em>` tags. |
| Pagination | Y | Continuation tokens are offset based. |
| Native queries | Y | See [native queries](#native-queries). |
| Queued acknowledgement | Y | Writes return `INDEX_ACK_QUEUED` when Meilisearch enqueues the task, so `INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC` is supported. |
| Wait for completion | Y | See [waiting for writes](#waiting-for-writes). |

## Index settings

Pass the following Meilisearch [index settings](https://www.meilisearch.com/docs/reference/api/settings) as comma-separated values in the `metadata` of a [create index]({{% ref "search_api.md#create-index" %}}) request:

| Metadata | Details | Example |
|----------|---------|---------|
| `filterableAttributes` | Content fields that filters can use. Meilisearch rejects filters on fields that aren't declared here. | `"category,price"` |
| `sortableAttributes` | Content fields that sorts can use. `id` is always added, because the component uses the document ID as a tie-breaker for stable pagination. | `"price,publishedAt"` |
| `searchableAttributes` | Content fields that full-text queries search, in order of importance. When omitted, all fields are searchable. | `"title,body"` |

Settings are only applied when an index is created. Creating an index that already exists returns `ALREADY_EXISTS` and doesn't change its settings.

[Get index]({{% ref "search_api.md#get-index" %}}) returns the following `properties`: `primaryKey` (always `id`), and `filterableAttributes`, `sortableAttributes`, and `searchableAttributes` when set.

## Document mapping

- The document `id` is the Meilisearch primary key.
- The keys of the document `content` are stored as top-level Meilisearch attributes. Don't use `id`, `daprMetadata`, or keys starting with `_` in `content`, because they are reserved by the component.
- The document `metadata` is stored under the reserved `daprMetadata` attribute and returned unchanged.

## Scores and total hits

- Hit scores are Meilisearch's [ranking score](https://www.meilisearch.com/docs/learn/relevancy/ranking_score), a value between `0` and `1` where higher is more relevant.
- `totalHits` is Meilisearch's estimated total number of hits, reported with `TOTAL_HITS_RELATION_ESTIMATE`.
- When `topK` isn't set, the component returns up to 20 hits per page.

## Native queries

The `native` field of a [search]({{% ref "search_api.md#search" %}}) request accepts the parameters of the [Meilisearch search API](https://www.meilisearch.com/docs/reference/api/search), for example `q`, `filter`, `matchingStrategy`, or `attributesToCrop`. Pagination and sorting use the portable request fields, so a native query must not set `offset`, `limit`, `page`, `hitsPerPage`, or `sort`.

```json
{
  "native": { "q": "dapr", "matchingStrategy": "all" },
  "topK": 10
}
```

## Waiting for writes

Meilisearch processes writes asynchronously as [tasks](https://www.meilisearch.com/docs/learn/async/asynchronous_operations). With `INDEXING_MODE_WAIT_FOR_COMPLETION`, the component waits for the task to finish by polling the Meilisearch task API with exponential backoff.

When the experimental Meilisearch [`tasksStreamingRoute`](https://www.meilisearch.com/docs/learn/resources/experimental_features_overview) feature is enabled and the API key has the `tasks.get` permission, the component instead shares a single task-change stream for all waiting writes. If the route reports that it is unavailable, the component falls back to polling. The choice is transparent to your application.

A Meilisearch task is atomic: if the task fails, none of the documents in it are indexed, and a request that waits for completion fails with the task's error.

## Setup Meilisearch

{{< tabpane text=true >}}

{{% tab "Self-hosted" %}}
Run Meilisearch locally with Docker:

```bash
docker run -d --name meilisearch -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:latest
```

Set `host` to `http://localhost:7700` and `apiKey` to `masterKey`.

For other installation options, see the [Meilisearch installation guide](https://www.meilisearch.com/docs/learn/self_hosted/install_meilisearch_locally).
{{% /tab %}}

{{% tab "Meilisearch Cloud" %}}
Create a project in [Meilisearch Cloud](https://www.meilisearch.com/cloud), then set `host` to the project URL and `apiKey` to an API key with the permissions your application needs.
{{% /tab %}}

{{< /tabpane >}}

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Search API overview]({{% ref search-overview %}})
- [Search API reference]({{% ref search_api %}})
- [Meilisearch vector component]({{% ref "/reference/components-reference/supported-vector/meilisearch.md" %}})
- [Meilisearch documentation](https://www.meilisearch.com/docs/)
