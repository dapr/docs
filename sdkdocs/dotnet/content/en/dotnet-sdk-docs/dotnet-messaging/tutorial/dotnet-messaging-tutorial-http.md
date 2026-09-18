---
type: docs
title: "Part 6: HTTP push subscriptions"
linkTitle: "Part 6: HTTP subscriptions"
weight: 160600
description: "Expose generated HTTP subscription discovery and custom event routes"
---

The [HTTP subscription example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/06-HttpSubscription) shows `DeliveryMode.Http` for applications that use normal HTTP ingress or reverse proxies.

## Define a routed handler

```csharp
[DaprTopic(
    "pubsub",
    "invoices",
    Delivery = DeliveryMode.Http,
    Route = "api/events/invoices")]
public sealed class InvoiceProcessingHandler : ITopicHandler<InvoiceGenerated>
{
    public Task<TopicResponseAction> HandleAsync(
        InvoiceGenerated invoice,
        TopicContext context,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(
            invoice.TotalAmount <= 0
                ? TopicResponseAction.Drop
                : TopicResponseAction.Success);
    }
}
```

## Map the generated routes

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprMessaging();

var app = builder.Build();
app.MapDaprMessaging();
app.Run();
```

The generated mapping exposes `GET /dapr/subscribe` for Dapr to discover subscriptions and maps `POST /api/events/invoices` for the topic's CloudEvents. The route is generated from the `Route` property; it does not need a separate controller or action.

Run with the application's HTTP port:

```powershell
dapr run --app-id http-subscriber-example --app-port 5000 `
  --dapr-grpc-port 50001 -- dotnet run
```

Inspect the generated manifest with `curl http://localhost:5000/dapr/subscribe`.

## Test HTTP delivery

The unit tests invoke the invoice handler directly for valid, zero, and negative amounts. The integration tests use the test application and a real Dapr sidecar to verify subscription discovery and HTTP push delivery. This lets the test cover route mapping and CloudEvent dispatch without coupling business-rule tests to ASP.NET hosting.

```powershell
dotnet test examples\Messaging\06-HttpSubscription\HttpSubscription.Example06.Tests\HttpSubscription.Example06.Tests.csproj
```

## Next

- [Part 7: Dynamic streaming subscriptions]({{< ref dotnet-messaging-tutorial-dynamic.md >}})
- [Dapr Messaging configuration and usage guide]({{< ref dotnet-messaging-pubsub-usage.md >}})

