---
type: docs
title: "Meilisearch"
linkTitle: "Meilisearch"
description: Detailed information on the Meilisearch vector component
---

## Component format

To set up a Meilisearch vector store, create a component of type `vector.meilisearch`. See [this guide]({{% ref "howto-vector.md#set-up-the-vector-component" %}}) on how to create and apply a vector store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: vector.meilisearch
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
| Dense vectors | Y | Vectors are stored as [user-provided embeddings](https://www.meilisearch.com/docs/learn/ai_powered_search/search_with_user_provided_embeddings). |
| Distance metrics | Cosine only | See [distance metric and scores](#distance-metric-and-scores). |
| Query by ID | Y | `byId` queries use Meilisearch's [similar documents](https://www.meilisearch.com/docs/reference/api/similar) search. |
| Score threshold | Y | |
| Metadata filtering | Y | `$regex` isn't supported. |
| Batch query | Y | Each query is evaluated independently. |
| Queued acknowledgement | Y | Writes return `INDEX_ACK_QUEUED` when Meilisearch enqueues the task, so `INDEXING_WAIT_TIMEOUT_ACTION_CONTINUE_ASYNC` is supported. |
| Wait for completion | Y | See [waiting for writes](#waiting-for-writes). |

## Collection settings

A collection is a Meilisearch index with a single `userProvided` embedder named `default` with the requested `dimensions`. Record metadata is filterable by default.

You can pass the following Meilisearch [index settings](https://www.meilisearch.com/docs/reference/api/settings) as comma-separated values in the `metadata` of a [create collection]({{% ref "vector_api.md#create-collection" %}}) request:

| Metadata | Details | Example |
|----------|---------|---------|
| `filterableAttributes` | Additional Meilisearch attributes to declare as filterable. `daprMetadata` is always filterable. | `"daprMetadata.year"` |
| `sortableAttributes` | Meilisearch attributes to declare as sortable. | `"daprMetadata.year"` |

Creating a collection that already exists returns `ALREADY_EXISTS` and doesn't change its settings.

[Get collection]({{% ref "vector_api.md#get-collection" %}}) returns the following `properties`: `primaryKey` (always `id`), `filterableAttributes`, and `sortableAttributes` when set.

## Record mapping

- The record `id` is the Meilisearch primary key.
- The record `values` are stored in `_vectors.default`.
- The record `metadata` is stored as the `daprMetadata` object. Filter paths are translated to `daprMetadata.<path>`, so a filter on `dealer.city` addresses `daprMetadata.dealer.city`.
- The record `payload` is stored base64-encoded under the `daprPayload` attribute.

## Distance metric and scores

Meilisearch only supports cosine similarity for user-provided embeddings. `DISTANCE_METRIC_UNSPECIFIED` selects cosine, and any other metric in a create collection or query request returns `INVALID_ARGUMENT`.

For a vector query, Meilisearch reports a normalised ranking score of `(1 + cosine) / 2`. The component converts it back so that match scores are the cosine similarity in `[-1, 1]`, and translates a `scoreThreshold` of `t` into a Meilisearch `rankingScoreThreshold` of `(1 + t) / 2`.

When `topK` isn't set, the component returns up to 10 matches.

## Waiting for writes

Meilisearch processes writes asynchronously as [tasks](https://www.meilisearch.com/docs/learn/async/asynchronous_operations). With `INDEXING_MODE_WAIT_FOR_COMPLETION`, the component waits for the task to finish by polling the Meilisearch task API with exponential backoff.

When the experimental Meilisearch [`tasksStreamingRoute`](https://www.meilisearch.com/docs/learn/resources/experimental_features_overview) feature is enabled and the API key has the `tasks.get` permission, the component instead shares a single task-change stream for all waiting writes. If the route reports that it is unavailable, the component falls back to polling. The choice is transparent to your application.

A Meilisearch task is atomic: if the task fails, for example because one record's vector doesn't match the collection's dimensions, none of the records in it are written, and a request that waits for completion fails with the task's error. Records with no vector values are rejected in `failedItems` before the task is sent.

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
- [Vector API overview]({{% ref vector-overview %}})
- [Vector API reference]({{% ref vector_api %}})
- [Meilisearch search component]({{% ref "/reference/components-reference/supported-search/meilisearch.md" %}})
- [Meilisearch AI-powered search documentation](https://www.meilisearch.com/docs/learn/ai_powered_search/getting_started_with_ai_search)
