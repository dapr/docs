---
type: docs
title: "Dapr Messaging configuration and usage"
linkTitle: "Configuration and usage"
weight: 69000
description: "Configuration, options, lifetime management, delivery modes, and advanced features for Dapr.Messaging in .NET"
---

This guide covers advanced configuration, service lifetimes, delivery mode trade-offs, serialization, Native AOT support, and resilience patterns when working with the `Dapr.Messaging` SDK.

The API coverage on this page targets SDK `1.19.0` or later.

## Lifetime management and thread safety

Understanding the lifetime of messaging services ensures optimal performance and prevents socket exhaustion or memory leaks.

### Client lifetime (`IDaprPublishSubscribeClient`)

`IDaprPublishSubscribeClient` (and its underlying implementation `DaprPublishSubscribeClient`) manages persistent TCP and gRPC channel resources to communicate with the Dapr sidecar.

- **Singleton registration**: The client is thread-safe and designed to be registered as a **Singleton** in your dependency injection container.
- **Connection pooling**: Reuses underlying `HttpClient` and `GrpcChannel` instances across requests.
- **Do not create per operation**: Avoid instantiating or disposing `DaprPublishSubscribeClient` per operation. A single shared client should serve your entire application.

```csharp
// Registers the Dapr Messaging stack, including IDaprPublishSubscribeClient and DaprPublishSubscribeClient as a Singleton
builder.Services.AddDaprMessaging();
```

### Handler lifetime (`ITopicHandler<TMessage>`)

When messages are delivered to an `ITopicHandler<TMessage>`:

- **Scoped execution**: The source-generated dispatcher resolves the topic handler from an isolated `IServiceScope` on every message delivery.
- **Constructor injection**: Handlers can safely inject transient or scoped dependencies (such as Entity Framework Core `DbContext` instances, repositories, or tenant context providers).
- **Automatic disposal**: Any disposable dependencies resolved by the handler are automatically disposed when the message handling turn completes.

```csharp
public sealed class OrderHandler(ApplicationDbContext dbContext, ILogger<OrderHandler> logger) 
    : ITopicHandler<Order>
{
    public async Task<TopicResponseAction> HandleAsync(Order message, TopicContext context, CancellationToken ct)
    {
        dbContext.Orders.Add(message);
        await dbContext.SaveChangesAsync(ct);
        return TopicResponseAction.Success;
    }
}
```

## Configuring options via `DaprMessagingOptions`

The SDK uses the standard `Microsoft.Extensions.Options` pattern. You can configure `DaprMessagingOptions` in code or bind it directly from `IConfiguration`.

```csharp
builder.Services.AddDaprMessaging(options =>
{
    options.DaprGrpcEndpoint = "http://localhost:50001";
    options.DaprApiToken = "my-secret-token";
    options.StreamingReconnectDelay = TimeSpan.FromSeconds(5);
    options.JsonSerializerOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
});
```

### Supported configuration options

| Option | Default | Description |
| --- | --- | --- |
| `DaprGrpcEndpoint` | `http://localhost:50001` | The gRPC endpoint URL of the Dapr sidecar. |
| `DaprApiToken` | `null` | The API token forwarded in outbound Dapr requests for sidecar authentication. |
| `StreamingReconnectDelay` | `5 seconds` | The delay interval applied before attempting to reconnect a dropped streaming subscription. |
| `JsonSerializerOptions` | `JsonSerializerDefaults.Web` | Options used by the messaging publishing client. Generated subscriber dispatchers currently use their generated default options. |

### Endpoint and environment precedence

The underlying builder understands the standard Dapr endpoint/port and API-token environment variables.
However, in SDK `1.19.0`, `AddDaprMessaging` applies the nonempty
`DaprMessagingOptions.DaprGrpcEndpoint` **after** creating the builder. Its default
`http://localhost:50001` therefore overrides the environment-derived gRPC address even when you did not
explicitly configure it.

Bind the correct endpoint when the sidecar uses another port:

```csharp
builder.Services.AddDaprMessaging(options =>
{
    options.DaprGrpcEndpoint =
        builder.Configuration["DAPR_GRPC_ENDPOINT"] ??
        $"http://127.0.0.1:{builder.Configuration["DAPR_GRPC_PORT"] ?? "50001"}";
});
```

An explicitly configured `DaprApiToken` overrides the builder's environment-derived token. Do not hard-code
production tokens in source; obtain them from your deployment's configuration or secret mechanism.

## Choosing the right delivery mode

`Dapr.Messaging` unifies three delivery modes under a single `[DaprTopic]` attribute. Choose the mode that fits your architectural requirements:

| Dimension | Streaming (`DeliveryMode.Streaming`) | Programmatic (`DeliveryMode.Programmatic`) | HTTP (`DeliveryMode.Http`) |
| --- | --- | --- | --- |
| **Direction** | Outbound from App (App dials sidecar via gRPC stream) | Inbound to App (Sidecar dials app's gRPC server) | Inbound to App (Sidecar dials app's HTTP port) |
| **Endpoint Required** | **None** | gRPC `AppCallback` service | HTTP endpoint (`/dapr/subscribe`) |
| **App Configuration** | Works with sidecar alone (no `app-port` required) | Requires app gRPC port configured on sidecar | Requires app HTTP port configured on sidecar |
| **Backpressure** | Client-side buffered queue | Runtime-managed concurrency | Web server / ASP.NET pipeline |
| **Best Used For** | Workers, console apps, microservices without inbound listeners | High-throughput gRPC services, low latency | Traditional web APIs, existing HTTP routing setups |
| **Endpoint Registration** | None | `app.MapDaprMessaging()` | `app.MapDaprMessaging()` |

## Advanced messaging patterns

### Bulk publish and subscribe

Bulk operations allow publishing and consuming multiple events in batches, reducing network round-trips to the sidecar:

#### Bulk publishing
```csharp
var orders = new List<Order>
{
    new("101", 49.99m, "user1@example.com"),
    new("102", 99.50m, "user2@example.com")
};

var response = await pubsubClient.BulkPublishEventAsync("pubsub", "orders", orders);

foreach (var failed in response.FailedEntries)
{
    logger.LogError("Failed to publish order {OrderId}: {Error}", failed.Entry.EventData.Id, failed.ErrorMessage);
}
```

#### Bulk subscribing
Configure bulk consumption by enabling `BulkSubscribe = true` on the `[DaprTopic]` attribute:

```csharp
[DaprTopic("pubsub", "orders", Delivery = DeliveryMode.Http,
    BulkSubscribe = true, MaxMessagesCount = 50, MaxAwaitDurationMs = 500)]
public sealed class BulkOrderHandler : ITopicHandler<Order>
{
    public async Task<TopicResponseAction> HandleAsync(
        Order message,
        TopicContext context, 
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Processing order {OrderId}", message.Id);
        // Process one message from the runtime-delivered batch.
        return TopicResponseAction.Success;
    }
}
```

Bulk delivery batches messages at the Dapr protocol level, but the current SDK dispatches
each entry to the handler separately. The handler therefore implements `ITopicHandler<Order>`,
not `ITopicHandler<IReadOnlyList<Order>>`.

Bulk subscription requires HTTP or programmatic push delivery and `app.MapDaprMessaging()`.
Leaving the default streaming delivery mode would ignore the bulk settings.

### Dead-letter topics

Configure a dead-letter topic to capture unprocessable or poison messages:

```csharp
[DaprTopic("pubsub", "orders", DeadLetterTopic = "orders-poison")]
public sealed class ResilientOrderHandler : ITopicHandler<Order>
{
    public Task<TopicResponseAction> HandleAsync(Order message, TopicContext context, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(message.CustomerEmail))
        {
            // Dropping routes the message to 'orders-poison' because DeadLetterTopic is configured
            return Task.FromResult(TopicResponseAction.Drop);
        }

        return Task.FromResult(TopicResponseAction.Success);
    }
}
```

### Working with CloudEvents

You can publish typed CloudEvents and inspect the exposed CloudEvent headers on delivery:

#### Publishing typed CloudEvents
```csharp
var cloudEvent = new CloudEvent<Order>(order)
{
    Source = new Uri("urn:service:checkout"),
    Type = "com.myapp.order.created",
    Subject = $"orders/{order.Id}",
    Time = DateTimeOffset.UtcNow
};

await pubsubClient.PublishEventAsync("pubsub", "orders", cloudEvent);
```

#### Consuming CloudEvent headers in handlers
```csharp
public Task<TopicResponseAction> HandleAsync(Order message, TopicContext context, CancellationToken cancellationToken)
{
    if (context.CloudEvent is not null)
    {
        var correlationId = context.CloudEvent.TraceId;
        var eventSource = context.CloudEvent.Source;
        logger.LogInformation("Processing CloudEvent {Id} from {Source}", context.CloudEvent.Id, eventSource);
    }

    return Task.FromResult(TopicResponseAction.Success);
}
```

## Native AOT and trimming considerations

The `Dapr.Messaging.Generators` source generator produces dispatch logic and subscriber
registries at build time, avoiding reflection for handler discovery and registration.
Generated subscriber dispatchers currently deserialize messages with runtime
`System.Text.Json` metadata. Native AOT and trimming scenarios therefore require
explicit validation with the target SDK version; configuring `DaprMessagingOptions.JsonSerializerOptions`
does not currently replace the generated subscriber deserializer.

{{% alert title="AOT Analyzer warning DAPR1612" color="primary" %}}
If a message type used with `ITopicHandler<TMessage>` is not included in a source-generated
`JsonSerializerContext`, analyzer `DAPR1612` emits a build warning. The analyzer warning
does not by itself make the generated subscriber deserialization trim-safe.
{{% /alert %}}

## Resiliency and error handling

### Backpressure management in streaming mode

When using `DeliveryMode.Streaming` or dynamic streaming subscriptions, the SDK queues incoming messages in
application memory. `MaximumQueuedMessages` is nullable and defaults to an unbounded queue; set a positive
limit to bound client buffering and apply backpressure.

You can tune the queue size and cleanup timeout in `DaprSubscriptionOptions`:

```csharp
var options = new DaprSubscriptionOptions(
    new MessageHandlingPolicy(
        TimeoutDuration: TimeSpan.FromSeconds(15), 
        DefaultResponseAction: TopicResponseAction.Retry))
{
    MaximumQueuedMessages = 1000,                    // Max backlog held in-memory
    MaximumCleanupTimeout = TimeSpan.FromSeconds(30), // Max wait to flush ACKs on shutdown
    ErrorHandler = async (exception) =>
    {
        // Invoked on sidecar streaming or connection faults
        logger.LogError(exception, "Streaming subscription encountered an error");
    }
};
```

### Graceful shutdown

Streaming subscriptions attempt to flush pending acknowledgments within `MaximumCleanupTimeout` (30 seconds
by default). This is a bounded, best-effort shutdown, not a zero-loss or exactly-once guarantee. Delivery can be
repeated when an acknowledgment is not received, including after processing succeeded. Make handlers idempotent.

### Observe background subscription failures

`SubscribeAsync` returns `IAsyncDisposable`, but its runtime handle implements `IDaprSubscription`.
Observe `IDaprSubscription.Completion` to detect a stream or acknowledgment-loop failure after startup.
`ErrorHandler` is a notification callback, not a recovery mechanism: the original fault still completes the
subscription exceptionally. If that callback also throws, the completion task reports both failures through
an `AggregateException`. Recreate a failed dynamic subscription according to an application-owned retry policy.

Generated streaming subscribers use the configured reconnect delay. Do not assume that an arbitrary dynamic
subscription automatically reconnects because generated hosting does.

## Existing DaprClient and ASP.NET integrations

`DaprClient.PublishEventAsync` and `BulkPublishEventAsync`, as well as `Dapr.AspNetCore` `[Topic]`,
CloudEvents middleware, and subscription endpoint mapping, remain separate supported API surfaces.
The generated `[DaprTopic]`/`ITopicHandler<T>` model does not require a wholesale migration of existing
subscribers. The dedicated publisher uses `PublishOptions`; the older client uses metadata dictionaries.
Avoid registering duplicate subscriptions while migrating a topic.

## Next steps

- [How-To: Publish events with IDaprPublishSubscribeClient]({{< ref dotnet-messaging-publish-howto.md >}})
- [How-To: Author subscriptions and handle topic messages]({{< ref dotnet-messaging-subscribe-howto.md >}})
- [Tutorial: Dapr.Messaging by example]({{< ref "tutorial/_index.md" >}})
- [Dapr Pub/Sub overview]({{% ref pubsub-overview %}})
- [Dapr components specification]({{% ref supported-pubsub %}})
