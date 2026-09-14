---
type: docs
title: "Part 5: gRPC AppCallback push subscriptions"
linkTitle: "Part 5: AppCallback push"
weight: 160500
description: "Receive pub/sub events through sidecar-initiated gRPC AppCallback calls"
---

The [AppCallback example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/05-AppCallbackPush) uses `DeliveryMode.Programmatic` for sidecar-to-application gRPC push.

## Define a programmatic subscriber

```csharp
[DaprTopic("pubsub", "payments", Delivery = DeliveryMode.Programmatic)]
public sealed class PaymentProcessingHandler : ITopicHandler<PaymentReceived>
{
    public Task<TopicResponseAction> HandleAsync(
        PaymentReceived payment,
        TopicContext context,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(
            payment.Amount <= 0
                ? TopicResponseAction.Drop
                : TopicResponseAction.Success);
    }
}
```

In this mode Dapr initiates the gRPC call to the application's AppCallback service. Unlike streaming subscriptions, the app must expose a reachable gRPC port.

## Map the generated endpoint

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprMessaging();

var app = builder.Build();
app.MapDaprMessaging();
app.Run();
```

`MapDaprMessaging()` exposes the generated AppCallback service and subscription discovery. Run the application with an app port and gRPC protocol, for example:

```powershell
dapr run --app-id appcallback-example --app-port 5000 --app-protocol grpc `
  --dapr-grpc-port 50001 -- dotnet run
```

## Test both layers

The unit tests verify that valid payments succeed and zero or negative amounts are dropped. The integration tests configure the test application with a gRPC server, start the harness, publish real payments, and observe the handler result. This distinction is important: unit tests validate business rules; integration tests validate AppCallback registration, reachability, and delivery.

```powershell
dotnet test examples\Messaging\05-AppCallbackPush\AppCallback.Example05.Tests\AppCallback.Example05.Tests.csproj
```

## Next

- [Part 6: HTTP push subscriptions]({{< ref dotnet-messaging-tutorial-http.md >}})
- [Subscribe to topics how-to]({{< ref dotnet-messaging-subscribe-howto.md >}})

