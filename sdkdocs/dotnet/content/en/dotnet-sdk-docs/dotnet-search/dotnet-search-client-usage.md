---
type: docs
title: "Dapr Search client"
linkTitle: "Search client"
weight: 54100
description: Configure DaprSearchClient, shape queries, manage write acknowledgements, and generate typed index clients
---

`DaprSearchClient` in `Dapr.Search` implements the alpha Search API through gRPC. Use .NET SDK 1.19.0 or later with a Dapr runtime and component that support Search. See the [overview]({{% ref dotnet-search %}}) for release requirements and the [how-to]({{% ref dotnet-search-howto.md %}}) for a complete document lifecycle.

## Client lifetime and configuration

Reuse a long-lived client rather than creating one per operation. Dependency injection registers a singleton by default and owns its disposal:

```csharp
using Dapr.Search.Extensions;

builder.Services.AddDaprSearchClient((serviceProvider, clientBuilder) =>
{
    clientBuilder.UseGrpcEndpoint("http://localhost:50001");
});
```

The callback can resolve configuration or other services through `serviceProvider`. Use the optional `lifetime` argument to choose another `ServiceLifetime` when required.

For applications without dependency injection, create and dispose a client yourself:

```csharp
using Dapr.Search;

using var client = new DaprSearchClientBuilder()
    .UseGrpcEndpoint("http://localhost:50001")
    .Build();
```

The builder accepts an optional `IConfiguration`. Defaults resolve `DAPR_GRPC_ENDPOINT`, or fall back to the local endpoint using `DAPR_GRPC_PORT` (50001 by default); `DAPR_API_TOKEN` supplies sidecar authentication. Explicit builder settings override defaults; use `UseDaprApiToken` to override the token.

Use `UseJsonSerializationOptions` for document serialization and `UseGrpcChannelOptions` for gRPC settings. When supplying channel options, retain `ThrowOperationCanceledOnCancellation = true`. Although the shared builder also exposes HTTP endpoint, HTTP client factory, and HTTP timeout settings, Search operations use gRPC; changing the HTTP endpoint does not switch their transport, and `UseTimeout` is not a per-RPC deadline. Pass a time-limited `CancellationToken` to bound how long the caller waits.

## API coverage

All operations accept optional component-specific request `metadata` (`IReadOnlyDictionary<string, string>`) and a `CancellationToken`.

| Operation | Result |
| --- | --- |
| `CreateIndexAsync`, `DeleteIndexAsync` | Create or remove an index. Creation metadata supplies provider-specific settings. |
| `GetIndexAsync` | `SearchIndex` with `Index`, approximate `DocumentCount`, and component `Properties`. |
| `ListIndexesAsync` | Index names in the component. |
| `IndexDocumentsAsync<T>` | `IndexDocumentsResult` with `Ack` and `FailedItems`. |
| `GetDocumentsAsync<T>` | Found `SearchDocument<T>` entries in request order. |
| `DeleteDocumentsAsync` | `IndexAck` for the deletion. |
| `SearchAsync<T>` | One `SearchResult<T>` page. |

Request metadata configures an operation; it is separate from each document's stored, opaque `Metadata`.

## Query options and results

`SearchQuery` is a record, so use `with` expressions when changing only the continuation token.

| Property | Behavior |
| --- | --- |
| `Text` | Portable full-text query. Mutually exclusive with `Native`; neither means match all. |
| `Native` | Provider-native query represented by a JSON object (`JsonElement`). |
| `Filter` | Portable JSON-object filter addressing content fields, including dotted nested paths. |
| `TopK` | Nullable `uint` page size; null or zero selects the component default. |
| `ContinuationToken` | Opaque token from the previous response. Keep the rest of the query unchanged. |
| `SearchFields` | Content fields to search. |
| `Sort` | Ordered `SortClause` entries with `Ascending`, `Descending`, or provider-default `Unspecified` order. |
| `IncludeContent` | Null or false omits content; returned `Content` is `default(T)`. |
| `ReturnFields` | Fields projected into returned content. Use with `IncludeContent = true`. |
| `HighlightFields` | Fields for which highlighted fragments are requested, if the component supports them. |

Filters support `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$and`, `$or`, and `$not`. Multiple conditions in an object are ANDed, and a direct field value is an equality test. Use serialized JSON field names, which are camelCase by default. See the portable [filter language]({{% ref "search-overview.md#filter-language" %}}) and your component's requirements for filterable and sortable fields.

`SearchResult<T>.Hits` contains `SearchHit<T>` entries with a `Document`, unnormalized provider-specific `Score`, and a `Highlights` dictionary keyed by field. Higher scores indicate greater relevance within that result set; do not compare them across providers. `TotalHits` is nullable, and `TotalHitsRelation` is `Unspecified`, `Exact`, `LowerBound`, or `Estimate`. Stop paging when `ContinuationToken` is null or empty.

### Projection and highlighting

Using the `Article` type and client from the how-to, the following query requires a component that supports highlighting, such as Meilisearch:

```csharp
var page = await client.SearchAsync<Article>("searchstore", "articles", new SearchQuery
{
    Text = "dapr",
    IncludeContent = true,
    ReturnFields = ["title", "category"],
    HighlightFields = ["title"]
});

foreach (var hit in page.Hits)
{
    if (hit.Highlights.TryGetValue("title", out var title))
    {
        Console.WriteLine(title);
    }
}
```

Projection can omit members expected by your model. Choose a compatible result type or `JsonElement` for partial documents. Highlight fragments can contain provider-generated markup; treat them as untrusted content when rendering a UI.

### Provider-native queries

Pass a JSON object in `Native` rather than `Text` for provider-specific features:

```csharp
using System.Text.Json;

var page = await client.SearchAsync<JsonElement>("searchstore", "articles", new SearchQuery
{
    Native = JsonSerializer.Deserialize<JsonElement>(
        """{"q":"dapr","matchingStrategy":"all"}"""),
    IncludeContent = true,
    TopK = 10
});
```

This example uses Meilisearch syntax and will not work with the in-memory component. Meilisearch pagination and sorting must still use the portable `TopK`, `ContinuationToken`, and `Sort` properties. Setting both `Text` and `Native`, or supplying a non-object `Native` or `Filter`, throws `ArgumentException` before sending an RPC.

## Write acknowledgements

`IndexDocumentsAsync<T>` and `DeleteDocumentsAsync` accept `Dapr.Search.IndexingOptions`.

| Setting | Behavior |
| --- | --- |
| Omitted options, `ReturnOnAcceptance`, or `Unspecified` mode | Return after acceptance. `IndexAck.Queued` means background work was accepted, not that indexing succeeded. Synchronous components can return `Completed`. |
| `WaitForCompletion` | Requires a positive `WaitTimeout` and explicit `OnWaitTimeout`. `Completed` means the final write result is available, including any item failures. |
| `OnWaitTimeout = ContinueAsync` | Return `Queued` if the wait expires; requires component support for queued acknowledgement. |
| `OnWaitTimeout = FailRequest` | Fail with `DeadlineExceeded` if the wait expires. Provider-side work may still complete. |

Do not supply `WaitTimeout` or `OnWaitTimeout` with acceptance mode. `WaitTimeout` must be shorter than any remaining RPC deadline and must leave headroom below the store resiliency timeout of at least 10% of that timeout and at least 100 ms. See the runtime [acknowledgement rules]({{% ref "search-overview.md#write-acknowledgements" %}}).

Always inspect both `IndexDocumentsResult.Ack` and `FailedItems`. A completed batch can contain failed documents without throwing for the whole request. Each `SearchFailedItem` includes `Id`, canonical numeric `ErrorCode`, `ErrorMessage`, and `Details` preserving protobuf `TypeUrl` and raw `Value` bytes. At a queued boundary, only failures already known can be reported; there is no client API to poll for a final indexing result.

## Serialization

Content uses `System.Text.Json` with `JsonSerializerDefaults.Web` by default. Pass .NET objects to `SearchDocument<T>`; do not manually base64-encode them or pass an already serialized JSON string, which would serialize as a string rather than an object. Use `JsonElement` for document shapes without a fixed .NET model.

For source-generated JSON serialization, configure the client with a context covering the content type:

```csharp
using System.Text.Json.Serialization;
using Dapr.Search.Extensions;

builder.Services.AddDaprSearchClient((_, clientBuilder) =>
    clientBuilder.UseJsonSerializationOptions(SearchJsonContext.Default.Options));

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(Article))]
internal partial class SearchJsonContext : JsonSerializerContext
{
}
```

The generated index client below does not generate JSON serialization metadata. Configure JSON options separately when reflection-free serialization is required.

## Generate a typed index client

The `Dapr.Search` package bundles a source generator. Declare a top-level, non-generic `partial` interface, extending exactly one `IDaprSearchIndex<T>`, without additional abstract members:

```csharp
using Dapr.Search;

[SearchIndex("searchstore", "articles")]
public partial interface IArticleSearch : IDaprSearchIndex<Article>
{
}
```

The component and index names must be non-empty. The generator supplies `AddArticleSearch`, named after the interface with its leading `I` removed:

```csharp
builder.Services.AddDaprSearchClient().AddArticleSearch();
```

Inject the interface instead of repeatedly specifying the component, index, and generic type:

```csharp
public sealed class ArticleService(IArticleSearch articles)
{
    public Task<SearchResult<Article>> FindAsync(string text, CancellationToken cancellationToken) =>
        articles.SearchAsync(
            new SearchQuery { Text = text, IncludeContent = true },
            cancellationToken: cancellationToken);
}
```

The generated wrapper exposes the index-scoped operations in the API table, but not store-wide `ListIndexesAsync`. It forwards options, request metadata, and cancellation unchanged, inherits the registered client's lifetime, and does not own or dispose that client. Registration does not create the index; call `CreateIndexAsync` explicitly.

Invalid declarations, bindings, or contracts produce build errors `DAPR1801`, `DAPR1802`, or `DAPR1803`, respectively.

## Cancellation and errors

Invalid client arguments throw argument exceptions before an RPC. RPC failures throw `DaprException` with the original `Grpc.Core.RpcException` as `InnerException`, preserving its status and trailers:

```csharp
using Dapr;
using Grpc.Core;

try
{
    await client.CreateIndexAsync("searchstore", "articles");
}
catch (DaprException ex) when (
    ex.InnerException is RpcException { StatusCode: StatusCode.AlreadyExists })
{
    Console.Error.WriteLine("The index already exists; its settings were not changed.");
}
```

This is distinct from item failures returned by a successful indexing call. Caller cancellation can throw `OperationCanceledException` and does not guarantee that the provider stopped processing a write. Retry and timeout policies are configured through Dapr [resiliency]({{% ref "search-overview.md#resiliency" %}}), not by this client.
