---
type: docs
title: "How to: Store and query vectors with the Dapr .NET SDK"
linkTitle: "How to: Query vectors"
weight: 55050
description: Create collections, store typed vector records, query embeddings, and handle batch results using Dapr.Vector
---

Use `DaprVectorClient` to store precomputed embeddings and retrieve similar records through a Dapr vector component. This guide uses three-dimensional vectors for readability; real embeddings must match your model's dimensions.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) and an [initialized Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0), [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0), or [.NET 11](https://dotnet.microsoft.com/download/dotnet/11.0)
- Dapr runtime 1.19 or later with Vector support
- The [Dapr.Vector](https://www.nuget.org/packages/Dapr.Vector) NuGet package, version 1.19.0 or later

{{% alert title=".NET framework support" color="warning" %}}
Be advised that the .NET 8 and .NET 9 frameworks will fall out of support in November 2026.
As such, both will be dropped from the next v1.20 release, and only .NET 10 and .NET 11 will be
supported through the end of 2027.
{{% /alert %}}

Install the package in an ASP.NET Core project:

```sh
dotnet add package Dapr.Vector
```

The [Vector SDK overview]({{% ref dotnet-vector %}}) describes the alpha API and release requirements.

## Configure a vector component

Create `components\vectorstore.yaml` in your application directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vectorstore
spec:
  type: vector.in-memory
  version: v1
  metadata:
  - name: indexingDelay
    value: "0s"
```

The [in-memory component]({{% ref "/reference/components-reference/supported-vector/in-memory.md" %}}) needs no external database. Data is lost when the sidecar stops and is not shared between sidecars. Use a supported durable [vector component]({{% ref supported-vector %}}) for production.

## Register and resolve the client

Add the following to `Program.cs`:

```csharp
using Dapr.Vector;
using Dapr.Vector.Extensions;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprVectorClient();

var app = builder.Build();
var client = app.Services.GetRequiredService<DaprVectorClient>();
```

Place the remaining operation snippets after this code, then call `app.Run();` at the end of `Program.cs`. Create the payload type in `Product.cs`:

```csharp
public sealed record Product(string Title);
```

Run the application with a sidecar:

```sh
dapr run --app-id vector-example --resources-path .\components -- dotnet run
```

The client reads its endpoint and API token from configuration or the environment and uses gRPC. It is separate from `DaprClient` and does not require `AddDaprClient()`.

## Create and inspect a collection

```csharp
const string storeName = "vectorstore";
const string collectionName = "products";

await client.CreateCollectionAsync(
    storeName, collectionName, dimensions: 3, metric: DistanceMetric.Cosine);

var info = await client.GetCollectionAsync(storeName, collectionName);
Console.WriteLine($"{info.Collection}: {info.Dimensions} dimensions, {info.Metric}");
Console.WriteLine($"Approximately {info.RecordCount} records");

var collections = await client.ListCollectionsAsync(storeName);
Console.WriteLine(string.Join(", ", collections));
```

Dimensions must be positive and match every stored embedding. Creating an existing collection fails with `AlreadyExists`; it does not reconfigure the collection. Delete the example collection before rerunning against a sidecar that still holds it.

## Upsert records with typed payloads

```csharp
var writeOptions = new IndexingOptions
{
    Mode = IndexingMode.WaitForCompletion,
    WaitTimeout = TimeSpan.FromSeconds(10),
    OnWaitTimeout = IndexingWaitTimeoutAction.FailRequest
};

var attributes = JsonSerializer.Deserialize<JsonElement>("""{"category":"books"}""");
var write = await client.UpsertVectorsAsync<Product>(
    storeName,
    collectionName,
    [
        new("dapr", [1, 0, 0], new Product("Dapr guide"), attributes),
        new("distributed", [0.8f, 0.6f, 0], new Product("Distributed systems"), attributes),
        new("other", [0, 1, 0], new Product("Other topics"), attributes)
    ],
    writeOptions);

foreach (var failure in write.FailedItems)
{
    Console.Error.WriteLine($"{failure.Id}: {failure.ErrorCode} {failure.ErrorMessage}");
}

if (write.FailedItems.Count != 0 || write.Ack != IndexAck.Completed)
{
    throw new InvalidOperationException("Not all vector records were confirmed written.");
}
```

`VectorRecord<T>` has an `Id`, `IReadOnlyList<float>` embedding `Values`, optional typed `Payload`, and optional JSON-object `Metadata`. IDs must be non-empty and unique within the request. Upserting an existing ID replaces the stored record.

Metadata is structured and filterable; payloads are opaque to the vector component and are not filterable. This differs from Search document metadata, which is not indexed. Other than `byte[]`, payload types are serialized with the client's JSON options.

Without explicit options, writes can return `IndexAck.Queued` before records are queryable. Waiting for completion makes the following queries see completed writes, but you must still check `FailedItems`. Invalid vector dimensions or values can fail individual records while the rest succeed.

## Query by embedding

```csharp
var query = new VectorQuery
{
    Vector = [1, 0, 0],
    TopK = 2,
    Filter = JsonSerializer.Deserialize<JsonElement>("""{"category":{"$eq":"books"}}"""),
    ScoreThreshold = 0.75,
    IncludePayload = true,
    IncludeValues = true
};

var result = await client.QueryVectorsAsync<Product>(storeName, collectionName, query);

foreach (var match in result.Matches)
{
    Console.WriteLine($"{match.Record.Id}: {match.Record.Payload?.Title}, " +
        $"{result.Metric} score {match.Score}");
}
```

`VectorQuery.Vector` is directly a list of floats, not a `VectorRecord<T>`. For cosine similarity, higher scores are closer, and the inclusive threshold keeps scores at least `0.75`. See the [metric guidance]({{% ref "dotnet-vector-client-usage.md#distance-metrics-and-query-options" %}}) for dot product and Euclidean semantics.

Values and payloads are omitted by default on queries. Set `IncludeValues` and `IncludePayload` separately as needed.

## Query by stored ID and in batches

Use `ById` instead of `Vector` to reuse an existing record's embedding:

```csharp
var similar = await client.QueryVectorsAsync<Product>(
    storeName, collectionName,
    new VectorQuery { ById = "dapr", TopK = 2, IncludePayload = true });
```

Exactly one of `Vector` and `ById` is required. Batch queries target the same collection and return one outcome per query in request order:

```csharp
var batch = await client.BatchQueryVectorsAsync<Product>(
    storeName, collectionName,
    [
        query,
        new() { ById = "dapr", TopK = 1, IncludePayload = true },
        new() { ById = "missing", TopK = 1 }
    ]);

for (var i = 0; i < batch.Count; i++)
{
    if (batch[i].Error is { } error)
    {
        Console.Error.WriteLine($"Query {i}: {error.Code} {error.Message}");
    }
    else if (batch[i].Response is { } response)
    {
        Console.WriteLine($"Query {i}: {response.Matches.Count} matches ({response.Metric})");
    }
}
```

With the in-memory component, the missing ID produces an error in that query's slot without discarding the successful results. Invalid client-side query arguments, such as setting neither `Vector` nor `ById`, throw before **any** query in the batch is sent. Request-wide RPC failures also throw instead of producing per-query errors.

## Retrieve and delete records

```csharp
var records = await client.GetVectorsAsync<Product>(
    storeName, collectionName, ["dapr", "missing"], includeValues: true);

foreach (var record in records)
{
    Console.WriteLine($"{record.Id}: {record.Payload?.Title}, {record.Values.Count} values");
}

var ack = await client.DeleteVectorsAsync(
    storeName, collectionName, ["distributed"], writeOptions);

if (ack != IndexAck.Completed)
{
    throw new InvalidOperationException("Vector deletion was not confirmed complete.");
}

await client.DeleteCollectionAsync(storeName, collectionName);
```

Get returns found records in request order and omits missing IDs. Payloads are returned when present; values are omitted unless `includeValues` is true. There is no `includePayload` argument on `GetVectorsAsync<T>`. Deleting a missing record ID is not an error. Deleting a collection removes all its records.

## Next steps

- [Vector client configuration, opaque payloads, and generated typed clients]({{% ref dotnet-vector-client-usage.md %}})
- [Vector API reference]({{% ref vector_api %}})
- [Index and search documents in .NET]({{% ref dotnet-search-howto.md %}})
