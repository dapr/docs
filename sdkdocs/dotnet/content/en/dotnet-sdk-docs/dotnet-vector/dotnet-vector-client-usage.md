---
type: docs
title: "Dapr Vector client"
linkTitle: "Vector client"
weight: 55100
description: Configure DaprVectorClient, interpret similarity scores, handle batch results, and generate typed collection clients
---

`DaprVectorClient` in `Dapr.Vector` implements the alpha Vector API through gRPC. Use .NET SDK 1.19.0 or later with a Dapr runtime and component that support Vector. See the [overview]({{% ref dotnet-vector %}}) for release requirements and the [how-to]({{% ref dotnet-vector-howto.md %}}) for a complete collection lifecycle.

## Client lifetime and configuration

Reuse a long-lived client. Dependency injection registers a singleton by default and disposes it when the container is disposed:

```csharp
using Dapr.Vector.Extensions;

builder.Services.AddDaprVectorClient((serviceProvider, clientBuilder) =>
{
    clientBuilder.UseGrpcEndpoint("http://localhost:50001");
});
```

The callback can resolve configuration or other services through `serviceProvider`. The optional `lifetime` argument supports other `ServiceLifetime` values.

Without dependency injection, create and dispose your own instance:

```csharp
using Dapr.Vector;

using var client = new DaprVectorClientBuilder()
    .UseGrpcEndpoint("http://localhost:50001")
    .Build();
```

The builder accepts an optional `IConfiguration`. Defaults use `DAPR_GRPC_ENDPOINT`, or the local endpoint with `DAPR_GRPC_PORT` (50001 by default), and `DAPR_API_TOKEN` for sidecar authentication. Explicit builder settings override defaults; use `UseDaprApiToken` to override the token.

Use `UseJsonSerializationOptions` for payload serialization and `UseGrpcChannelOptions` for gRPC settings. Retain `ThrowOperationCanceledOnCancellation = true` when replacing channel options. Shared HTTP endpoint, HTTP client factory, and HTTP timeout settings do not switch Vector operations to HTTP or establish a per-RPC deadline. Bound caller wait time with a time-limited `CancellationToken`, not `UseTimeout`.

## API coverage

Every operation accepts optional component-specific request `metadata` (`IReadOnlyDictionary<string, string>`) and a `CancellationToken`.

| Operation | Result |
| --- | --- |
| `CreateCollectionAsync` | Create a collection with positive `uint` dimensions and an optional distance metric. |
| `GetCollectionAsync` | `VectorCollection` with `Collection`, approximate `RecordCount`, `Properties`, `Dimensions`, and effective `Metric`. |
| `ListCollectionsAsync` | Collection names in the component. |
| `DeleteCollectionAsync` | Delete the collection and its records. |
| `UpsertVectorsAsync<T>` | `UpsertVectorsResult` with `Ack` and `FailedItems`. |
| `GetVectorsAsync<T>` | Found `VectorRecord<T>` entries in request order; `includeValues` defaults to false. |
| `DeleteVectorsAsync` | `IndexAck` for the deletion. |
| `QueryVectorsAsync<T>` | `VectorQueryResult<T>` with `Matches` and the effective `Metric`. |
| `BatchQueryVectorsAsync<T>` | Ordered `VectorBatchQueryResult<T>` entries, each containing a response or error. |

Request metadata configures an operation and is separate from each record's structured, filterable `Metadata`. There is no embedding-generation API, hybrid lexical/vector query, or continuation-token pagination in this alpha client. Generate embeddings in your application and use Search separately for lexical queries.

## Distance metrics and query options

| `DistanceMetric` | Interpretation |
| --- | --- |
| `Unspecified` | Component default at collection creation; collection metric when querying. |
| `Cosine` | Cosine similarity in `[-1, 1]`; higher is closer. |
| `DotProduct` | Unnormalized dot product; higher is closer. |
| `Euclidean` | Euclidean distance; lower is closer. |

`ScoreThreshold` is inclusive: cosine and dot-product matches must score **at least** the threshold; Euclidean matches must score **at most** it. Scores are not converted to a normalized relevance percentage. Interpret each response using its effective `Metric`. A query can request a metric override where the component supports it; unsupported metrics are rejected rather than silently substituted.

| `VectorQuery` property | Behavior |
| --- | --- |
| `Vector` | Non-empty `IReadOnlyList<float>` query embedding. Mutually exclusive with `ById`. |
| `ById` | Non-empty stored record ID whose embedding is used as the query. Exactly one query source is required. |
| `TopK` | Nullable `uint` maximum match count; null or zero uses the component default. |
| `Filter` | Portable JSON-object filter addressing record metadata, including dotted paths. |
| `IncludeValues` | Null or false omits embedding values; returned `Values` is empty. |
| `IncludePayload` | Null or false omits payloads; returned `Payload` is `default(T)`. |
| `Metric` | Requested metric, defaulting to `Unspecified`. |
| `ScoreThreshold` | Optional inclusive cutoff in the metric's own scale. |

Filters support `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$and`, `$or`, and `$not`. Multiple conditions in the same object are ANDed. For example:

```csharp
using System.Text.Json;
using Dapr.Vector;

var query = new VectorQuery
{
    Vector = [1, 0, 0],
    Filter = JsonSerializer.Deserialize<JsonElement>(
        """{"category":"books","dealer.city":{"$in":["Seattle","Portland"]}}"""),
    TopK = 10,
    Metric = DistanceMetric.Cosine,
    IncludePayload = true
};
```

The filter addresses record metadata, not payload properties. Metadata and filters must be JSON objects. See the [component specifications]({{% ref supported-vector %}}) for restrictions and the [filter language]({{% ref "vector-overview.md#filter-language" %}}).

## Payload serialization

`VectorRecord<T>` stores an optional payload separately from its embedding and metadata. Most payload types use `System.Text.Json` with `JsonSerializerDefaults.Web` by default; the client deserializes returned payloads to the `T` selected by your read or query call. Use a compatible type, or `JsonElement` for variable JSON shapes.

For opaque binary payloads, use **`byte[]` as the generic type**. The SDK transfers these bytes unchanged instead of JSON/base64-serializing them:

```csharp
var write = await client.UpsertVectorsAsync<byte[]>(
    "vectorstore", "products",
    [new("binary", [1, 0, 0], new byte[] { 0, 255, 128 })],
    new IndexingOptions
    {
        Mode = IndexingMode.WaitForCompletion,
        WaitTimeout = TimeSpan.FromSeconds(10),
        OnWaitTimeout = IndexingWaitTimeoutAction.FailRequest
    });

foreach (var failure in write.FailedItems)
{
    Console.Error.WriteLine($"{failure.Id}: {failure.ErrorMessage}");
}

if (write.FailedItems.Count != 0 || write.Ack != IndexAck.Completed)
{
    throw new InvalidOperationException("The binary record was not confirmed written.");
}

var records = await client.GetVectorsAsync<byte[]>(
    "vectorstore", "products", ["binary"], includeValues: true);
```

Read the bytes back with `GetVectorsAsync<byte[]>` or `QueryVectorsAsync<byte[]>` (with `IncludePayload = true`). An absent binary payload is null, while a present empty payload remains an empty byte array. This raw-byte behavior applies specifically to `T = byte[]`, not arbitrary memory types or a `byte[]` passed as `object`.

For source-generated JSON serialization, configure a context covering your payload type, such as the `Product` record from the how-to:

```csharp
using System.Text.Json.Serialization;
using Dapr.Vector.Extensions;

builder.Services.AddDaprVectorClient((_, clientBuilder) =>
    clientBuilder.UseJsonSerializationOptions(ProductJsonContext.Default.Options));

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(Product))]
internal partial class ProductJsonContext : JsonSerializerContext
{
}
```

The typed collection generator does not generate JSON serialization metadata. Configure it separately for reflection-free payload serialization; opaque `byte[]` payloads bypass the JSON serializer.

## Write acknowledgements and partial failures

Vector upserts and record deletions accept `Dapr.Vector.IndexingOptions`. These have the same behavior as the [Search write options]({{% ref "dotnet-search-client-usage.md#write-acknowledgements" %}}), but are distinct types in the `Dapr.Vector` namespace.

Omitted options use `ReturnOnAcceptance`. `IndexAck.Queued` means work was accepted, not that it succeeded or is queryable. `WaitForCompletion` requires a positive `WaitTimeout` and explicit `OnWaitTimeout`. `ContinueAsync` returns `Queued` if the wait expires and requires queued-ack support; `FailRequest` raises `DeadlineExceeded`, but provider work may still complete. Wait fields are invalid with acceptance mode.

The wait timeout must fit below any remaining RPC deadline and leave at least 10% and at least 100 ms of headroom below the store resiliency timeout. It is a provider wait limit, not a cancellation deadline for your application.

Inspect both `UpsertVectorsResult.Ack` and `FailedItems`. Each `VectorFailedItem` includes `Id`, canonical numeric `ErrorCode`, `ErrorMessage`, and raw protobuf error `Details` (`TypeUrl` and `Value`). A completed batch can have individual failures. The SDK leaves dimension and value validation to the runtime/component so invalid records can fail individually without discarding valid records. At a queued boundary only known failures are returned, and this client has no final-result polling API.

If you use Search and Vector together, qualify or alias `IndexingOptions`, `IndexingMode`, `IndexingWaitTimeoutAction`, and `IndexAck` to avoid ambiguous names.

## Batch query errors

`BatchQueryVectorsAsync<T>` submits queries against one component and collection with shared request metadata. Results preserve query order and have exactly one populated property:

- `Response`: a `VectorQueryResult<T>` with matches and effective metric.
- `Error`: a `VectorQueryError` with canonical numeric `Code`, `Message`, and preserved protobuf `Details`.

Check each outcome, even if other queries succeeded. The [batch example]({{% ref "dotnet-vector-howto.md#query-by-stored-id-and-in-batches" %}}) demonstrates both outcomes.

Local argument validation occurs for the entire batch before sending the RPC. A query with neither source, both sources, an empty vector, a blank ID, a non-object filter, or an invalid metric throws instead of becoming a per-query result. A valid query that fails during runtime evaluation, such as a missing stored ID, can return an error in its own slot. Request-wide RPC failures throw `DaprException`.

## Generate a typed collection client

The `Dapr.Vector` package bundles a source generator. Define a top-level, non-generic `partial` interface extending exactly one `IDaprVectorCollection<T>` with no additional abstract members:

```csharp
using Dapr.Vector;

[VectorCollection("vectorstore", "products")]
public partial interface IProductVectors : IDaprVectorCollection<Product>
{
}
```

The component and collection names must be non-empty. Register the generated wrapper after the underlying client:

```csharp
builder.Services.AddDaprVectorClient().AddProductVectors();
```

`AddProductVectors` is named after the interface with the leading `I` removed. Inject the interface to query without repeating the component, collection, or payload type:

```csharp
public sealed class RecommendationService(IProductVectors products)
{
    public Task<VectorQueryResult<Product>> FindAsync(
        IReadOnlyList<float> embedding, CancellationToken cancellationToken) =>
        products.QueryVectorsAsync(
            new VectorQuery { Vector = embedding, TopK = 5, IncludePayload = true },
            cancellationToken: cancellationToken);
}
```

The wrapper exposes all collection-scoped operations, including creation (which still requires dimensions and accepts an optional metric), writes, reads, single/batch queries, and deletion. Store-wide `ListCollectionsAsync` remains on `DaprVectorClient`. The wrapper forwards metadata, options, and cancellation, inherits the client's registered lifetime, and does not dispose that client. Registration alone does not create a collection.

Invalid declarations, bindings, or contracts produce build errors `DAPR1901`, `DAPR1902`, or `DAPR1903`, respectively.

## Cancellation and errors

RPC failures throw `DaprException` whose `InnerException` is the original `Grpc.Core.RpcException`; inspect its `StatusCode` and trailers for provider/runtime errors. Argument validation and JSON serialization errors are distinct from RPC failures. Batch query errors and upsert item failures are returned in their result models, not thrown as request-wide errors.

Every operation accepts a `CancellationToken`. Caller cancellation can throw `OperationCanceledException`, but does not guarantee the database stopped processing a write. Configure retries and timeout policies through Dapr [resiliency]({{% ref "vector-overview.md#error-reporting-and-resiliency" %}}).
