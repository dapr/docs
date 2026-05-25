---
type: docs
title: "DaprStateManagementClient usage"
linkTitle: "DaprStateManagementClient usage"
weight: 53100
description: Essential tips and advice for using DaprStateManagementClient
---

## Lifetime management

A `DaprStateManagementClient` holds long-lived network resources (gRPC channels, HTTP connections). For best performance:

- Register a single shared instance and reuse it for the lifetime of the application.
- Avoid creating and disposing a client per operation — this can lead to socket exhaustion.
- The DI registration via `AddDaprStateManagementClient()` defaults to `ServiceLifetime.Singleton`, which is the   recommended approach for most applications.

The client is thread-safe and can be shared across concurrent requests.

## Client builder configuration

`DaprStateManagementClientBuilder` inherits from `DaprGenericClientBuilder<DaprStateManagementClient>` and supports the same configuration surface as the other Dapr .NET client builders.

### Builder methods

| Method | Description |
|--------|-------------|
| `UseGrpcEndpoint(string)` | Sets the gRPC endpoint for the Dapr sidecar. |
| `UseHttpEndpoint(string)` | Sets the HTTP endpoint for the Dapr sidecar. |
| `UseJsonSerializationOptions(JsonSerializerOptions)` | Configures custom JSON serializer options. |
| `UseDaprApiToken(string)` | Sets the API token for authenticating with the Dapr sidecar. |
| `UseGrpcChannelOptions(GrpcChannelOptions)` | Provides custom gRPC channel options. |
| `UseTimeout(TimeSpan)` | Configures an HTTP request timeout. |

### Environment variables

The builder reads the following environment variables automatically:

| Variable | Description |
|----------|-------------|
| `DAPR_GRPC_ENDPOINT` | gRPC endpoint address for the Dapr sidecar |
| `DAPR_HTTP_ENDPOINT` | HTTP endpoint address for the Dapr sidecar |
| `DAPR_API_TOKEN` | API token for authenticating with the Dapr sidecar |
| `DAPR_GRPC_PORT` | gRPC port (used as fallback if `DAPR_GRPC_ENDPOINT` is not set) |
| `DAPR_HTTP_PORT` | HTTP port (used as fallback if `DAPR_HTTP_ENDPOINT` is not set) |

Values explicitly set on the builder take precedence over environment variables.

## gRPC channel options

For fine-grained control over gRPC behavior:

```csharp
builder.Services.AddDaprStateManagementClient((sp, clientBuilder) =>
{
    clientBuilder.UseGrpcChannelOptions(new GrpcChannelOptions
    {
        MaxReceiveMessageSize = 16 * 1024 * 1024, // 16 MB
    });
});
```

## Cancellation tokens

All asynchronous methods on `DaprStateManagementClient` and `IDaprStateStoreClient` accept a `CancellationToken` parameter. Passing a token allows you to cancel long-running operations in response to timeouts or user cancellation:

```csharp
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

var widget = await client.GetStateAsync<Widget>("statestore", "my-widget",
    cancellationToken: cts.Token);
```

When canceled, an `OperationCanceledException` is thrown.

## Dependency injection registration

### Registration overloads

The `AddDaprStateManagementClient` method has the following signature:

```csharp
public static IDaprStateManagementBuilder AddDaprStateManagementClient(
    this IServiceCollection services,
    Action<IServiceProvider, DaprStateManagementClientBuilder>? configure = null,
    ServiceLifetime lifetime = ServiceLifetime.Singleton)
```

The returned `IDaprStateManagementBuilder` enables chaining typed state store registrations:

```csharp
builder.Services
    .AddDaprStateManagementClient()
    .WithWidgetStore()
    .WithCacheStore();
```

### Chaining source generator registrations

Each `[StateStore]`-annotated interface generates an extension method on `IDaprStateManagementBuilder`. The methods return `IDaprStateManagementBuilder`, so they chain naturally:

```csharp
builder.Services
    .AddDaprStateManagementClient((sp, clientBuilder) =>
    {
        clientBuilder.UseGrpcEndpoint("http://localhost:50001");
    })
    .WithWidgetStore()
    .WithCacheStore()
    .WithUserPreferencesStore();
```

## JSON serialization

By default, the client uses `System.Text.Json` with `JsonSerializerDefaults.Web`, which provides:

- `camelCase` property naming (`PropertyNamingPolicy = JsonNamingPolicy.CamelCase`)
- Case-insensitive property name matching (`PropertyNameCaseInsensitive = true`)
- Strings read as numbers allowed (`NumberHandling = JsonNumberHandling.AllowReadingFromString`)

These defaults match the `DaprClient` package, ensuring **serialization compatibility** — data written by one client can be read correctly by the other.

To customize:

```csharp
builder.Services.AddDaprStateManagementClient((sp, clientBuilder) =>
{
    clientBuilder.UseJsonSerializationOptions(new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    });
});
```

> **Note:** Changing serializer settings can break compatibility with data previously written using default settings. Test thoroughly when customizing.

## API response shapes

### GetStateAsync

`GetStateAsync<TValue>` returns `TValue?`. If the key does not exist in the store, `default(T)` is returned (i.e., `null` for reference types).

### GetStateAndETagAsync

`GetStateAndETagAsync<TValue>` returns `(TValue? Value, string? ETag)`. The ETag can be passed to `TrySaveStateAsync` or `TryDeleteStateAsync` for optimistic concurrency control.

### GetBulkStateAsync

`GetBulkStateAsync<TValue>` returns `IReadOnlyList<BulkStateItem<TValue>>`. Each `BulkStateItem<TValue>` contains:

| Property | Type | Description |
|----------|------|-------------|
| `Key` | `string` | The state key |
| `Value` | `TValue?` | The deserialized value, or `null` if the key was not found |
| `ETag` | `string` | The ETag for optimistic concurrency control |

### TrySaveStateAsync / TryDeleteStateAsync

Both return `bool` — `true` if the operation succeeded, `false` if the ETag did not match (indicating a concurrent modification).

### QueryStateAsync

`QueryStateAsync<TValue>` returns `StateQueryResponse<TValue>`, which contains:

| Property | Type | Description |
|----------|------|-------------|
| `Results` | `IReadOnlyList<StateQueryItem<TValue>>` | The list of matching items |
| `Token` | `string?` | Pagination token for continuing the query, or `null` if no more results |
| `Metadata` | `IReadOnlyDictionary<string, string>` | Additional metadata returned by the state store |

Each `StateQueryItem<TValue>` contains:

| Property | Type | Description |
|----------|------|-------------|
| `Key` | `string` | The state key |
| `Data` | `TValue?` | The deserialized value |
| `ETag` | `string?` | The ETag for the item |
| `Error` | `string?` | An error message if the item could not be retrieved, or `null` on success |

## StateOptions

The `StateOptions` class controls consistency and concurrency behavior for individual operations:

```csharp
var options = new StateOptions
{
    Consistency = ConsistencyMode.Strong,
    Concurrency = ConcurrencyMode.FirstWrite,
};

await client.SaveStateAsync("statestore", "my-widget", widget, stateOptions: options);
```

| Property | Values | Description |
|----------|--------|-------------|
| `Consistency` | `Eventual`, `Strong` | Controls whether reads reflect the latest write. `null` uses the store default. |
| `Concurrency` | `FirstWrite`, `LastWrite` | Controls conflict resolution. `FirstWrite` fails on ETag mismatch; `LastWrite` always overwrites. `null` uses the store default. |

## Error handling

Methods on `DaprStateManagementClient` will throw a `DaprException` if an issue is encountered when communicating with the Dapr sidecar. In case of illegal argument values, the appropriate standard exception will be thrown (e.g. `ArgumentNullException` or `ArgumentException`) with the name of the offending argument. When an operation is canceled via a `CancellationToken`, an `OperationCanceledException` will be thrown.

The most common cases of failure will be related to:

- Incorrect argument formatting (e.g. an empty store name or key)
- Transient failures such as a networking problem
- The specified state store component not being configured or available
- ETag mismatches when using optimistic concurrency (for `TrySaveStateAsync` and `TryDeleteStateAsync`, these return
  `false` rather than throwing)

In any of these cases, you can examine more exception details through the `.InnerException` property.

## Migration from DaprClient

If you are migrating from the `DaprClient` state management methods to the new `Dapr.StateManagement` package, note
the following:

- The API surface is very similar. Methods like `GetStateAsync`, `SaveStateAsync`, `DeleteStateAsync`, `GetBulkStateAsync`, and `ExecuteStateTransactionAsync` are all present with the same semantics.
- The default JSON serialization settings (`JsonSerializerDefaults.Web`) are identical, so data written by `DaprClient` is fully compatible with `DaprStateManagementClient` and vice versa.
- The new package additionally provides `IDaprStateStoreClient` and the `[StateStore]` source generator for strongly-typed, store-scoped access. This reduces boilerplate and eliminating store name strings at call sites.
- `DaprStateManagementClient` is registered independently from `DaprClient`. Both can coexist in the same application during a gradual migration.
