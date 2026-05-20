---
type: docs
title: "How to: Manage state with the Dapr State Management .NET SDK"
linkTitle: "How to: Manage state"
weight: 53050
description: Learn how to save, retrieve, delete, and query state using the Dapr State Management .NET SDK
---

Let's walk through how to manage state using the `Dapr.StateManagement` package. We'll use the
[sample project provided here](https://github.com/dapr/dotnet-sdk/tree/master/examples/StateManagement) for the following demonstration, covering typed state store clients via the source generator, direct client usage for bulk operations and transactions, and optimistic concurrency control with ETags. In this guide, you will:

- Deploy a .NET application ([StateManagementExample](https://github.com/dapr/dotnet-sdk/tree/master/examples/StateManagement/StateManagementExample))
- Utilize the Dapr .NET State Management SDK to save, retrieve, and delete state entries
- Use ETags for optimistic concurrency control
- Perform bulk operations and state transactions
- Use the source generator to create a strongly-typed, store-scoped interface

In the .NET example project:
- The main [`Program.cs`](https://github.com/dapr/dotnet-sdk/tree/master/examples/StateManagement/StateManagementExample/Program.cs) contains both usage patterns (typed store and direct client).
- The [`IWidgetStore.cs`](https://github.com/dapr/dotnet-sdk/tree/master/examples/StateManagement/StateManagementExample/IWidgetStore.cs) file demonstrates the typed state store interface.

## Prerequisites
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), or
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) installed
- [Dapr.StateManagement](https://www.nuget.org/packages/Dapr.StateManagement) NuGet package installed to your project

## Set up the environment
Clone the [.NET SDK repo](https://github.com/dapr/dotnet-sdk).

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

From the .NET SDK root directory, navigate to the Dapr State Management example.

```sh
cd examples/StateManagement
```

## Run the application locally

To run the Dapr application, you need to start the .NET program and a Dapr sidecar. Navigate to the `StateManagementExample` directory.

```sh
cd StateManagementExample
```

We'll run a command that starts both the Dapr sidecar and the .NET program at the same time.

```sh
dapr run --app-id statemanagement-example --dapr-grpc-port 50001 -- dotnet run
```

> Dapr listens for gRPC requests at `http://localhost:50001`.

## Register the client

The `DaprStateManagementClient` is registered through the `AddDaprStateManagementClient()` extension method on `IServiceCollection`. This returns an `IDaprStateManagementBuilder` that can be used to further register source-generated typed state store clients.

### Default registration

Register the client with default settings. The Dapr endpoint and API token will be read from environment variables or `IConfiguration` automatically.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprStateManagementClient();
```

### Registration with custom configuration

If you need to configure the client (for example, to override the gRPC endpoint or JSON serializer options), pass a callback:

```csharp
builder.Services.AddDaprStateManagementClient((sp, clientBuilder) =>
{
    clientBuilder.UseGrpcEndpoint("http://localhost:50001");
});
```

### Registration with `IServiceProvider`

The configuration callback receives the `IServiceProvider`, allowing you to resolve other services:

```csharp
builder.Services.AddDaprStateManagementClient((sp, clientBuilder) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var endpoint = config["DaprGrpcEndpoint"];
    if (!string.IsNullOrEmpty(endpoint))
    {
        clientBuilder.UseGrpcEndpoint(endpoint);
    }
});
```

## Configure the client from `IConfiguration`

The client builder inherits from `DaprGenericClientBuilder<T>`, which supports reading configuration values from `IConfiguration`. The following configuration keys are recognized:

| Key                | Description                             |
|--------------------|-----------------------------------------|
| `DAPR_GRPC_ENDPOINT` | The gRPC endpoint for the Dapr sidecar |
| `DAPR_HTTP_ENDPOINT` | The HTTP endpoint for the Dapr sidecar |
| `DAPR_API_TOKEN`     | The API token for authenticating with the Dapr sidecar |

These values can be provided via environment variables, `appsettings.json`, or any other `IConfiguration` source.

Using in-memory configuration:
```csharp
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["DAPR_GRPC_ENDPOINT"] = "http://localhost:50001",
});

builder.Services.AddDaprStateManagementClient();
```

Using prefixed environment variables:
```csharp
builder.Configuration.AddEnvironmentVariables(prefix: "MYAPP_");

// MYAPP_DAPR_GRPC_ENDPOINT will be read automatically
builder.Services.AddDaprStateManagementClient();
```

## Save and retrieve state

Use `GetStateAsync<TValue>` to retrieve a single value and `SaveStateAsync<TValue>` to save one:

```csharp
var client = app.Services.GetRequiredService<DaprStateManagementClient>();

// Save a widget
var widget = new Widget("medium", "blue");
await client.SaveStateAsync("statestore", "my-widget", widget);

// Retrieve it
var loaded = await client.GetStateAsync<Widget>("statestore", "my-widget");
Console.WriteLine($"Widget: {loaded?.Size} / {loaded?.Color}");
```

## Delete state

```csharp
await client.DeleteStateAsync("statestore", "my-widget");
```

## Optimistic concurrency with ETags

Use `GetStateAndETagAsync` to retrieve a value along with its ETag, then use `TrySaveStateAsync` or `TryDeleteStateAsync` to conditionally write only if the value hasn't changed:

```csharp
// Read the value and its ETag
var (existingValue, etag) = await client.GetStateAndETagAsync<Widget>("statestore", "my-widget");

if (etag is not null)
{
    // Modify the value
    var updated = existingValue! with { Color = "green" };

    // Save only if nobody else has modified it since our read
    bool saved = await client.TrySaveStateAsync("statestore", "my-widget", updated, etag);
    Console.WriteLine(saved ? "ETag save succeeded." : "ETag mismatch — concurrent modification.");
}
```

And similar for deletes:

```csharp
var (_, etag) = await client.GetStateAndETagAsync<Widget>("statestore", "my-widget");

if (etag is not null)
{
    bool deleted = await client.TryDeleteStateAsync("statestore", "my-widget", etag);
    Console.WriteLine(deleted ? "Deleted." : "ETag mismatch.");
}
```

## Bulk operations

### Save multiple entries

```csharp
await client.SaveBulkStateAsync("statestore", new List<SaveStateItem<Widget>>
{
    new("widget-a", new Widget("small", "red")),
    new("widget-b", new Widget("large", "white")),
});
```

### Retrieve multiple entries

```csharp
var bulk = await client.GetBulkStateAsync<Widget>("statestore", new[] { "widget-a", "widget-b" });

foreach (var item in bulk)
{
    Console.WriteLine($"Key={item.Key}, Size={item.Value?.Size}, Color={item.Value?.Color}");
}
```

### Delete multiple entries

```csharp
await client.DeleteBulkStateAsync("statestore", new List<BulkDeleteStateItem>
{
    new("widget-a"),
    new("widget-b"),
});
```

## State transactions

Execute multiple upsert and delete operations atomically within a single transaction. Not all state stores support transactions — check the [Dapr documentation](https://docs.dapr.io/reference/components-reference/supported-state-stores/) for your specific store.

```csharp
await client.ExecuteStateTransactionAsync("statestore", new List<StateTransactionRequest>
{
    new("widget-a", null, StateOperationType.Delete),
    new("widget-b", null, StateOperationType.Delete),
});
```

## Query state

If the underlying state store supports queries, you can use `QueryStateAsync` with a JSON query expression:

```csharp
var query = """
{
    "filter": {
        "EQ": { "value.Color": "blue" }
    },
    "sort": [
        { "key": "value.Size", "order": "ASC" }
    ]
}
""";

var response = await client.QueryStateAsync<Widget>("statestore", query);

foreach (var item in response.Results)
{
    Console.WriteLine($"Key={item.Key}, Size={item.Data?.Size}, Color={item.Data?.Color}");
}
```

> Query support depends on the state store component. Refer to the [Dapr state store query API documentation](https://docs.dapr.io/developing-applications/building-blocks/state-management/howto-state-query-api/) for details. Do note that this functionality is not expected to receive any additional implementation support and is thus effectively deprecated.

## Pass metadata to requests

Most state management operations accept an optional `metadata` parameter. Metadata is a dictionary of string key-value pairs whose valid keys and values depend on the state store component being used:

```csharp
var metadata = new Dictionary<string, string>
{
    ["partitionKey"] = "widgets",
};

await client.SaveStateAsync("statestore", "my-widget", widget, metadata: metadata);
var loaded = await client.GetStateAsync<Widget>("statestore", "my-widget", metadata: metadata);
```

## Use the source generator for typed state store access

For a cleaner, more maintainable, and testable approach, use the source generator to create a strongly-typed interface bound to a specific state store. This eliminates repeated store name strings throughout your code.

### Step 1: Define the interface

Create a `partial interface` that extends `IDaprStateStoreClient` and annotate it with `[StateStore("storeName")]`:

```csharp
using Dapr.StateManagement;

[StateStore("statestore")]
public partial interface IWidgetStore : IDaprStateStoreClient;
```

At compile time, a source generator produces:
1. A sealed internal implementation class that forwards all `IDaprStateStoreClient` calls to
   `DaprStateManagementClient` with the store name `"statestore"` pre-filled.
2. A DI registration extension method on `IDaprStateManagementBuilder` named `WithWidgetStore()` (the leading `I` is stripped from the interface name).

### Step 2: Register the typed store

Chain the generated extension method onto `AddDaprStateManagementClient()`:

```csharp
builder.Services
    .AddDaprStateManagementClient()
    .WithWidgetStore();
```

### Step 3: Inject and use

Inject `IWidgetStore` into your service. All methods mirror `IDaprStateStoreClient` but omit the `storeName` parameter:

```csharp
public class WidgetService(IWidgetStore store)
{
    public async Task<Widget?> GetWidgetAsync(string id)
    {
        return await store.GetStateAsync<Widget>(id);
    }

    public async Task SaveWidgetAsync(string id, Widget widget)
    {
        await store.SaveStateAsync(id, widget);
    }

    public async Task<bool> UpdateWidgetAsync(string id, Widget widget)
    {
        var (_, etag) = await store.GetStateAndETagAsync<Widget>(id);
        if (etag is null)
            return false;

        return await store.TrySaveStateAsync(id, widget, etag);
    }
}
```

### Registering multiple typed stores

You can define multiple interfaces for different Dapr state store components and register them all:

```csharp
[StateStore("statestore")]
public partial interface IWidgetStore : IDaprStateStoreClient;

[StateStore("cachestore")]
public partial interface ICacheStore : IDaprStateStoreClient;
```

```csharp
builder.Services
    .AddDaprStateManagementClient()
    .WithWidgetStore()
    .WithCacheStore();
```

## Testing

### Testing with the direct client

Because `DaprStateManagementClient` is an abstract class, you can mock it using any mocking framework:

```csharp
var mockClient = new Mock<DaprStateManagementClient>();
mockClient
    .Setup(c => c.GetStateAsync<Widget>(
        "statestore", "my-widget", null, null, default))
    .ReturnsAsync(new Widget("medium", "blue"));

var service = new WidgetService(mockClient.Object);
```

### Testing with typed store clients

Since typed stores implement `IDaprStateStoreClient`, mock the interface directly:

```csharp
var mockStore = new Mock<IWidgetStore>();
mockStore
    .Setup(s => s.GetStateAsync<Widget>("my-widget", null, null, default))
    .ReturnsAsync(new Widget("medium", "blue"));

var service = new WidgetService(mockStore.Object);
```
