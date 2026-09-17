---
type: docs
title: "Part 1: Publish events with Dapr.Messaging"
linkTitle: "Part 1: Publishing"
weight: 160100
description: "Publish typed, bulk, metadata-rich, and raw events with IDaprPublishSubscribeClient"
---

The [publishing example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/01-Publishing) introduces `IDaprPublishSubscribeClient`, the publishing API in `Dapr.Messaging`.

## Register the client

`AddDaprMessaging()` registers the client with dependency injection:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprMessaging();
var app = builder.Build();
```

Inject `IDaprPublishSubscribeClient` into an endpoint, service, or background worker. The client is intended to be reused rather than created for every message.

## Publish typed events

```csharp
app.MapPost("/orders", async (
    OrderPlaced order,
    IDaprPublishSubscribeClient client,
    CancellationToken cancellationToken) =>
{
    await client.PublishEventAsync(
        "pubsub",
        "orders",
        order,
        cancellationToken);

    return Results.Accepted($"/orders/{order.OrderId}");
});
```

Typed payloads are serialized as JSON and published as Dapr CloudEvents. Pass the request cancellation token through the SDK call.

## Add metadata and publish in bulk

Use `PublishOptions` for CloudEvent attributes and component metadata such as a message TTL:

```csharp
var options = new PublishOptions
{
    Metadata =
    {
        ["cloudevent.type"] = "priority.order",
        ["ttlInSeconds"] = "60"
    }
};

await client.PublishEventAsync("pubsub", "orders", priorityOrder, options, cancellationToken);
```

For batches, inspect the response because publishing can partially succeed:

```csharp
var response = await client.BulkPublishEventAsync(
    "pubsub",
    "orders",
    orders,
    cancellationToken: cancellationToken);

foreach (var failed in response.FailedEntries)
{
    logger.LogError("Failed entry {EntryId}: {Error}",
        failed.Entry.EntryId, failed.ErrorMessage);
}
```

## Publish raw bytes

Use `PublishByteEventAsync` when the payload is already serialized or uses a non-JSON format:

```csharp
var payload = Encoding.UTF8.GetBytes("RAW_PAYLOAD_DATA_SAMPLE");

await client.PublishByteEventAsync(
    "pubsub",
    "raw-orders",
    payload,
    dataContentType: "text/plain",
    cancellationToken: cancellationToken);
```

## Test the publisher

The unit tests use Moq to verify that the client receives the expected topic, payload, options, and content type. They do not start Dapr. The integration tests use `DaprHarnessBuilder.BuildPubSub()`, connect a real client to the harness's dynamic gRPC and HTTP ports, and verify typed, bulk, and raw publishing against the sidecar and Redis.

Run the example from the SDK repository:

```powershell
dotnet test examples\Messaging\01-Publishing\Publishing.Example01.Tests\Publishing.Example01.Tests.csproj
```

## Next

- [Part 2: Declarative streaming subscriptions]({{< ref dotnet-messaging-tutorial-streaming.md >}})
- [Publish events how-to]({{< ref dotnet-messaging-publish-howto.md >}})

