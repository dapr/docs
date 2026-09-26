---
type: docs
title: "Part 4: Bulk subscriptions"
linkTitle: "Part 4: Bulk subscriptions"
weight: 160400
description: "Configure bounded bulk delivery for high-throughput pub/sub consumers"
---

The [bulk subscription example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/04-BulkSubscribe) combines bulk publishing with a subscription configured for high-throughput ingestion.

## Configure batching

Set `BulkSubscribe` and its limits on the topic attribute:

```csharp
[DaprTopic(
    "pubsub",
    "telemetry",
    BulkSubscribe = true,
    MaxMessagesCount = 50,
    MaxAwaitDurationMs = 500)]
public sealed class TelemetryBulkHandler : ITopicHandler<DeviceTelemetry>
{
    public Task<TopicResponseAction> HandleAsync(
        DeviceTelemetry reading,
        TopicContext context,
        CancellationToken cancellationToken)
    {
        if (reading.TemperatureCelsius < -273.15 ||
            reading.HumidityPercent is < 0 or > 100)
        {
            return Task.FromResult(TopicResponseAction.Drop);
        }

        return Task.FromResult(TopicResponseAction.Success);
    }
}
```

`MaxMessagesCount` bounds the batch size and `MaxAwaitDurationMs` bounds how long Dapr waits before delivering a partial batch. Choose values based on throughput, latency, and broker behavior. The handler remains responsible for the individual message decision.

## Publish single events or batches

```csharp
await client.PublishEventAsync("pubsub", "telemetry", reading, cancellationToken);

var response = await client.BulkPublishEventAsync(
    "pubsub",
    "telemetry",
    readings,
    options: null,
    cancellationToken: cancellationToken);
```

Inspect `response.FailedEntries` when bulk publishing because a batch can contain partial failures.

## Test batching-related behavior

The unit tests cover valid telemetry and invalid temperature and humidity values. The integration tests publish readings and batches through a real Dapr pub/sub harness to validate the generated bulk subscription configuration and delivery semantics.

```powershell
dotnet test examples\Messaging\04-BulkSubscribe\BulkSubscribe.Example04.Tests\BulkSubscribe.Example04.Tests.csproj
```

## Next

- [Part 5: gRPC AppCallback push]({{< ref dotnet-messaging-tutorial-appcallback.md >}})
- [Dapr Messaging configuration and usage guide]({{< ref dotnet-messaging-pubsub-usage.md >}})

