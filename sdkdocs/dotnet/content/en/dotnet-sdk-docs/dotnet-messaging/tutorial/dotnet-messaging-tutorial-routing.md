---
type: docs
title: "Part 3: Content-based routing and dead-letter topics"
linkTitle: "Part 3: Routing and DLQs"
weight: 160300
description: "Route messages with CEL expressions and handle rejected messages with a dead-letter topic"
---

The [routing example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/03-RoutingAndDeadLetter) uses multiple generated subscriptions to route shipments and handle rejected messages.

## Add CEL matching rules

`Match` is evaluated against the CloudEvent. `Priority` controls rule ordering, with lower values evaluated first:

```csharp
[DaprTopic(
    "pubsub",
    "express-shipments",
    Match = "event.data.priorityTier == 'express'",
    Priority = 1,
    DeadLetterTopic = "deadletter-shipments")]
[DaprTopicMetadata("routingType", "express-tier")]
public sealed class ExpressShippingHandler : ITopicHandler<ShipmentPackage>
{
    public Task<TopicResponseAction> HandleAsync(
        ShipmentPackage shipment,
        TopicContext context,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(
            shipment.WeightKg <= 0
                ? TopicResponseAction.Drop
                : TopicResponseAction.Success);
    }
}
```

The example adds an international rule using `event.data.destinationCountry != 'US'` and a priority-10 catch-all handler for standard domestic shipments. `DaprTopicMetadata` adds custom key-value data to the generated subscription manifest.

## Handle the dead-letter topic

Subscribe to the configured dead-letter topic like any other topic:

```csharp
[DaprTopic("pubsub", "deadletter-shipments")]
public sealed class DeadLetterShipmentHandler : ITopicHandler<ShipmentPackage>
{
    public Task<TopicResponseAction> HandleAsync(
        ShipmentPackage shipment,
        TopicContext context,
        CancellationToken cancellationToken)
    {
        // Record or alert on the rejected message.
        return Task.FromResult(TopicResponseAction.Success);
    }
}
```

Messages can reach the dead-letter topic after a handler returns `Drop` or after retry delivery is exhausted according to the component configuration.

## Test routing decisions

The unit tests invoke each handler directly and cover an express shipment, an invalid weight, an international destination, a standard fallback, and a dead-letter message. These tests prove business decisions without pretending to validate CEL evaluation.

The integration tests are the place to validate the generated subscription manifest, CEL evaluation, priority ordering, and dead-letter forwarding against a real Dapr sidecar and broker.

```powershell
dotnet test examples\Messaging\03-RoutingAndDeadLetter\Routing.Example03.Tests\Routing.Example03.Tests.csproj
```

## Next

- [Part 4: Bulk subscriptions]({{< ref dotnet-messaging-tutorial-bulk.md >}})
- [Configuration and usage guide]({{< ref dotnet-messaging-pubsub-usage.md >}})

