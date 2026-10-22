---
type: docs
title: "How to: Index and search documents with the Dapr .NET SDK"
linkTitle: "How to: Search documents"
weight: 54050
description: Create indexes, write typed documents, search, and retrieve documents using Dapr.Search
---

Use `DaprSearchClient` to index JSON documents and run full-text queries through a Dapr search component. In this guide, you will configure a local store, create an index, write and search typed documents, and delete them.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) and an [initialized Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0), [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0), or [.NET 11](https://dotnet.microsoft.com/download/dotnet/11.0)
- Dapr runtime 1.19 or later with Search support
- The [Dapr.Search](https://www.nuget.org/packages/Dapr.Search) NuGet package, version 1.19.0 or later

{{% alert title=".NET framework support" color="warning" %}}
Be advised that .NET 8 and .NET 9 reach end of support in November 2026. Support for both will be dropped
in Dapr v1.20; only .NET 10 and .NET 11 will be supported through the end of 2027.
{{% /alert %}}

Install the package in an ASP.NET Core project:

```sh
dotnet add package Dapr.Search
```

The [Search SDK overview]({{% ref dotnet-search %}}) describes the alpha API and release requirements.

## Configure a search component

Create `components\searchstore.yaml` in your application directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: searchstore
spec:
  type: search.in-memory
  version: v1
  metadata:
  - name: indexingDelay
    value: "0s"
```

The [in-memory component]({{% ref "/reference/components-reference/supported-search/in-memory.md" %}}) needs no external service. Data is lost when the sidecar stops and is not shared between sidecars. Use it for local development and testing, not durable storage.

For production, configure a supported [search component]({{% ref supported-search %}}). Component capabilities differ: for example, the in-memory component does not support highlighting or native queries.

## Register and resolve the client

Add the following to `Program.cs`. The client reads the sidecar endpoint and API token from configuration or the environment.

```csharp
using Dapr.Search;
using Dapr.Search.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprSearchClient();

var app = builder.Build();
var client = app.Services.GetRequiredService<DaprSearchClient>();
```

Place the remaining operation snippets after this code, then call `app.Run();` at the end of `Program.cs`. Create the document type in `Article.cs`:

```csharp
public sealed record Article(string Title, string Category, decimal Price);
```

Run the application with a sidecar that loads the component:

```sh
dapr run --app-id search-example --resources-path .\components -- dotnet run
```

The .NET Search client uses gRPC; it is separate from `DaprClient` and does not require `AddDaprClient()`.

## Create and inspect an index

```csharp
const string storeName = "searchstore";
const string indexName = "articles";

await client.CreateIndexAsync(storeName, indexName);

var info = await client.GetIndexAsync(storeName, indexName);
Console.WriteLine($"{info.Index}: approximately {info.DocumentCount} documents");

var indexes = await client.ListIndexesAsync(storeName);
Console.WriteLine(string.Join(", ", indexes));
```

Creating an existing index fails with `AlreadyExists`; it does not update the index settings. If you keep the sidecar running between executions, delete the example index before creating it again.

`CreateIndexAsync` accepts component-specific settings in its `metadata` argument. For example, the Meilisearch component requires `filterableAttributes` and `sortableAttributes` to declare fields used for filtering and sorting. These settings are not needed for the in-memory example.

## Index typed documents

```csharp
var writeOptions = new IndexingOptions
{
    Mode = IndexingMode.WaitForCompletion,
    WaitTimeout = TimeSpan.FromSeconds(10),
    OnWaitTimeout = IndexingWaitTimeoutAction.FailRequest
};

var write = await client.IndexDocumentsAsync<Article>(
    storeName,
    indexName,
    [
        new("doc-1", new Article("Getting started with Dapr", "guide", 10),
            new Dictionary<string, string> { ["author"] = "alice" }),
        new("doc-2", new Article("Dapr pub/sub deep dive", "guide", 25)),
        new("doc-3", new Article("Search API reference", "reference", 30))
    ],
    writeOptions);

foreach (var failure in write.FailedItems)
{
    Console.Error.WriteLine($"{failure.Id}: {failure.ErrorCode} {failure.ErrorMessage}");
}

if (write.FailedItems.Count != 0 || write.Ack != IndexAck.Completed)
{
    throw new InvalidOperationException("Not all documents were confirmed indexed.");
}
```

`SearchDocument<T>` contains an ID, typed content, and optional string metadata. The SDK serializes content to UTF-8 JSON using the client's JSON options. Content must serialize to a JSON **object**; invalid content is reported as an item failure by the runtime. IDs must be non-empty and unique within a write request. Writing an existing ID upserts that document.

Document metadata is stored and returned unchanged, but is not indexed or filterable. Filters address fields of `Content`, not `SearchDocument<T>.Metadata`.

Without `writeOptions`, a write returns on acceptance and can return `IndexAck.Queued`. An empty `FailedItems` list at that boundary does not guarantee eventual indexing success. The explicit wait above lets the following reads observe completed writes. See [write acknowledgement guidance]({{% ref "dotnet-search-client-usage.md#write-acknowledgements" %}}).

## Search and paginate

Add `using System.Text.Json;` at the top of `Program.cs`, then search for guides sorted by price:

```csharp
var query = new SearchQuery
{
    Text = "dapr",
    SearchFields = ["title"],
    Filter = JsonSerializer.Deserialize<JsonElement>("""{"category":{"$eq":"guide"}}"""),
    Sort = [new SortClause("price", SortOrder.Ascending)],
    IncludeContent = true,
    TopK = 1
};

SearchResult<Article> page;
do
{
    page = await client.SearchAsync<Article>(storeName, indexName, query);

    foreach (var hit in page.Hits)
    {
        Console.WriteLine($"{hit.Document.Id}: {hit.Document.Content?.Title} ({hit.Score})");
    }

    Console.WriteLine($"Total: {page.TotalHits}, accuracy: {page.TotalHitsRelation}");
    query = query with { ContinuationToken = page.ContinuationToken };
}
while (!string.IsNullOrEmpty(page.ContinuationToken));
```

The default JSON naming policy is camelCase, so field names use `title`, `category`, and `price`, not the .NET property names. A continuation token belongs to the query that produced it: keep the text, filter, sort, page size, and field options unchanged between pages.

`SearchAsync<T>` returns one page, not an automatically enumerated stream. Content is omitted unless `IncludeContent` is `true`. Omit the query, or omit both `Text` and `Native`, to match all documents, subject to any filter.

## Retrieve documents by ID

```csharp
var documents = await client.GetDocumentsAsync<Article>(
    storeName, indexName, ["doc-1", "missing"], includeContent: true);

foreach (var document in documents)
{
    Console.WriteLine($"{document.Id}: {document.Content?.Title}");
}
```

Found documents are returned in request order; missing IDs are omitted. Without `includeContent: true`, `Content` is `default(T)`.

## Delete documents and the index

```csharp
var ack = await client.DeleteDocumentsAsync(
    storeName, indexName, ["doc-2"], writeOptions);

if (ack != IndexAck.Completed)
{
    throw new InvalidOperationException("Document deletion was not confirmed complete.");
}

await client.DeleteIndexAsync(storeName, indexName);
```

Deleting a missing document ID is not an error. Deleting an index removes its documents as well.

## Next steps

- [Search client configuration, advanced queries, and generated typed clients]({{% ref dotnet-search-client-usage.md %}})
- [Search API reference]({{% ref search_api %}})
- [Store and query vectors in .NET]({{% ref dotnet-vector-howto.md %}})
