---
type: docs
title: "Part 2: Declarative streaming subscriptions"
linkTitle: "Part 2: Streaming"
weight: 160200
description: "Consume pub/sub events over an application-initiated streaming gRPC connection"
---

The [streaming example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/02-Streaming) shows the recommended declarative subscription model for fixed topics.

## Define a handler

Implement `ITopicHandler<TMessage>` and decorate the handler with `DaprTopic`:

```csharp
[DaprTopic("pubsub", "orders", Delivery = DeliveryMode.Streaming)]
public sealed class OrderProcessingHandler : ITopicHandler<OrderPlaced>
{
    public Task<TopicResponseAction> HandleAsync(
        OrderPlaced order,
        TopicContext context,
        CancellationToken cancellationToken)
    {
        if (order.Quantity <= 0 || string.IsNullOrWhiteSpace(order.ItemSku))
        {
            return Task.FromResult(TopicResponseAction.Drop);
        }

        if (order.ItemSku.StartsWith("RETRY-", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(TopicResponseAction.Retry);
        }

        return Task.FromResult(TopicResponseAction.Success);
    }
}
```

`Success` acknowledges the message, `Retry` requests redelivery for a transient failure, and `Drop` rejects an invalid or poison message. The handler also receives `TopicContext`, which contains the pub/sub name, topic, message ID, headers, and metadata.

## Configure the application

```csharp
builder.Services.AddDaprMessaging();
```

The source generator discovers the attributed handlers, registers them in DI, and starts the streaming subscriber hosted service. Streaming is application-initiated, so the application does not need an inbound HTTP or gRPC endpoint for delivery. The SDK manages the stream and reconnects when the connection drops.

## Test the handler and the stream

Unit tests construct handlers with mocked loggers and a small `TopicContext`, then assert `Success`, `Retry`, and `Drop` for representative inputs. This keeps validation and acknowledgement logic fast and independent of infrastructure.

The integration test uses `DaprTestApplicationBuilder` and configures `AddDaprMessaging` with the harness's gRPC endpoint. It publishes through the sidecar and waits on a test log sink for successful processing, inventory handling, and dropping an invalid order. This verifies the hosted service and real streaming delivery without requiring an application ingress port.

```powershell
dotnet test examples\Messaging\02-Streaming\Streaming.Example02.Tests\Streaming.Example02.Tests.csproj
```

## Next

- [Part 3: Content-based routing and dead-letter topics]({{< ref dotnet-messaging-tutorial-routing.md >}})
- [Subscribe to topics how-to]({{< ref dotnet-messaging-subscribe-howto.md >}})

