---
type: docs
title: "How to: Publish events with the Dapr Messaging .NET SDK"
linkTitle: "Publish events"
weight: 60000
description: "Learn how to publish JSON events, CloudEvents, raw payloads, and bulk batches using IDaprPublishSubscribeClient in Dapr.Messaging"
---

This guide demonstrates how to publish events to Dapr pub/sub topics using the modern `Dapr.Messaging` SDK for .NET.

## Prerequisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}}) installed
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0), [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), or [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) installed
- `Dapr.Messaging` package installed:

```xml
<ItemGroup>
  <PackageReference Include="Dapr.Messaging" Version="..." />
</ItemGroup>
```

## Register the publishing client in `Program.cs`

Register Dapr messaging services and the pub/sub client using dependency injection:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Register Dapr Messaging services and the publish/subscribe client
builder.Services.AddDaprMessaging(options =>
{
    // Optional: configure sidecar connection endpoints or serializer
    options.DaprGrpcEndpoint = "http://localhost:50001";
});

var app = builder.Build();
```

{{% alert title="Singleton client lifetime" color="primary" %}}
`IDaprPublishSubscribeClient` is thread-safe and registered as a **Singleton**. It maintains persistent gRPC/HTTP channel resources to the Dapr sidecar and should be reused across your application rather than instantiated per operation.
{{% /alert %}}

## Publish events

Inject `IDaprPublishSubscribeClient` (or `DaprPublishSubscribeClient`) into your controllers, minimal API route handlers, or background services.

### 1. Publish standard JSON events

To publish a serialized object to a topic, call `PublishEventAsync<TData>`:

```csharp
public record Order(string Id, decimal Total, string CustomerEmail);

public sealed class OrderService(IDaprPublishSubscribeClient pubsub, ILogger<OrderService> logger)
{
    public async Task PlaceOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Publishing order {OrderId} to 'orders' topic", order.Id);

        // Publishes the order object serialized as JSON with Content-Type: application/json
        await pubsub.PublishEventAsync(
            pubsubName: "pubsub",
            topicName: "orders",
            data: order,
            cancellationToken: cancellationToken);
    }
}
```

### 2. Publish with custom CloudEvent metadata and `PublishOptions`

You can attach custom CloudEvent properties (such as event type, subject, traceparent, or component TTL metadata) using `PublishOptions`:

```csharp
var options = new PublishOptions
{
    Id = Guid.NewGuid().ToString(),
    Type = "com.myapp.order.created",
    Subject = $"orders/{order.Id}",
    Metadata =
    {
        ["ttlInSeconds"] = "120", // Dapr message TTL
        ["cloudevent.source"] = "urn:service:checkout"
    }
};

await pubsub.PublishEventAsync("pubsub", "orders", order, options, cancellationToken);
```

### 3. Publish strongly-typed CloudEvents

When you want complete control over the CloudEvent envelope, wrap your payload in `CloudEvent<TData>`:

```csharp
var cloudEvent = new CloudEvent<Order>(order)
{
    Id = Guid.NewGuid().ToString(),
    Source = new Uri("urn:service:checkout"),
    Type = "com.myapp.order.created",
    Subject = $"orders/{order.Id}",
    Time = DateTimeOffset.UtcNow,
    TraceId = Activity.Current?.TraceId.ToString()
};

// Publishes with Content-Type: application/cloudevents+json
await pubsub.PublishEventAsync("pubsub", "orders", cloudEvent, cancellationToken);
```

### 4. Publish raw byte payloads

If you are transmitting binary data, pre-serialized payloads, or proprietary encodings, use `PublishByteEventAsync`:

```csharp
byte[] binaryPayload = GetCompressedPayload();

await pubsub.PublishByteEventAsync(
    pubsubName: "pubsub",
    topicName: "raw-telemetry",
    data: binaryPayload,
    dataContentType: "application/octet-stream",
    cancellationToken: cancellationToken);
```

### 5. Publish empty notification events

To publish a notification event with no payload body:

```csharp
await pubsub.PublishEventAsync("pubsub", "cache-invalidated", cancellationToken);
```

## Bulk publish multiple events

Bulk publishing lets you publish a batch of events to a topic in a single request, significantly reducing round-trip overhead:

```csharp
var orders = new List<Order>
{
    new("101", 49.99m, "user1@example.com"),
    new("102", 99.50m, "user2@example.com"),
    new("103", 14.25m, "user3@example.com")
};

var response = await pubsub.BulkPublishEventAsync(
    pubsubName: "pubsub",
    topicName: "orders",
    events: orders,
    cancellationToken: cancellationToken);

if (response.FailedEntries.Count > 0)
{
    foreach (var failed in response.FailedEntries)
    {
        logger.LogError(
            "Failed to publish entry {EntryId} (Order {OrderId}): {Error}",
            failed.Entry.EntryId,
            failed.Entry.EventData.Id,
            failed.ErrorMessage);
    }
}
else
{
    logger.LogInformation("All {Count} orders published successfully", orders.Count);
}
```

## Using the publisher without dependency injection

While dependency injection is recommended, you can construct a `DaprPublishSubscribeClient` instance directly using `DaprPublishSubscribeClientBuilder`:

```csharp
var client = new DaprPublishSubscribeClientBuilder()
    .UseGrpcEndpoint("http://localhost:50001")
    .UseDaprApiToken("my-token")
    .Build();

await client.PublishEventAsync("pubsub", "orders", new Order("101", 19.99m, "a@b.com"));
```

## Best practices

- **Reuse the client**: Register `IDaprPublishSubscribeClient` once as a singleton; do not instantiate and dispose clients per message.
- **Pass cancellation tokens**: Always pass a `CancellationToken` to handle application cancellation and HTTP request aborts gracefully.
- **Inspect bulk publish responses**: Bulk publishing returns partial success when only some entries fail. Always inspect `response.FailedEntries`.
- **Propagate distributed tracing**: The SDK automatically propagates active OpenTelemetry/W3C trace contexts (`Activity.Current`) in CloudEvent headers.

## Next steps

- [Tutorial: Dapr.Messaging by example]({{< ref "tutorial/_index.md" >}})
- [How-To: Author subscriptions and handle topic messages]({{< ref dotnet-messaging-subscribe-howto.md >}})
- [Dapr Messaging configuration and usage reference]({{< ref dotnet-messaging-pubsub-usage.md >}})
- [Dapr Pub/Sub building block overview]({{% ref pubsub-overview %}})
