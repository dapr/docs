---
type: docs
title: "How to: Author subscriptions and handle topic messages with the Dapr Messaging .NET SDK"
linkTitle: "Subscribe to topics"
weight: 61000
description: "Learn how to author topic handlers, configure streaming, programmatic, and HTTP delivery modes, and wire up reflection-free dispatchers with Dapr.Messaging"
---

This guide demonstrates how to author and manage Dapr topic subscriptions using the modern `Dapr.Messaging` SDK for .NET. You will learn how to author strongly-typed topic handlers with `ITopicHandler<TMessage>`, configure delivery modes and routing rules with `[DaprTopic]`, leverage compile-time source generation, and manage dynamic streaming subscriptions.

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

{{% alert title="Package references" color="primary" %}}
`Dapr.Messaging` is a meta-package that bundles the abstractions, runtime client, source generators, and Roslyn analyzers in a single package reference. Installing `Dapr.Messaging` automatically enables compile-time source generation and diagnostic analysis for your project.
{{% /alert %}}

## Define a topic handler

Topic subscribers implement the strongly-typed `ITopicHandler<TMessage>` interface (or its generic variant `ITopicHandler<TMessage, TResult>`) and are decorated with the `[DaprTopic]` attribute.

### Why use `ITopicHandler`?

- **Strongly-typed payloads**: Automatically deserializes incoming JSON or CloudEvent payloads into strongly-typed .NET models (`TMessage`) without manual boilerplate.
- **Explicit message disposition**: The `HandleAsync` method returns a `TopicResponseAction` (`Success`, `Retry`, or `Drop`), giving you precise control over acknowledgment, retries, and dead-letter queue routing.
- **Scoped dependency injection**: Handlers are resolved from an isolated `IServiceScope` for each message delivery, enabling clean constructor injection for scoped dependencies like Entity Framework `DbContext`, repositories, or loggers.
- **Compile-time source generation**: Annotated handlers are discovered by the Roslyn source generator at build time to emit reflection-free, Native AOT–compatible dispatchers.

{{% alert title="Analyzer Validation" color="primary" %}}
- **`DAPR1611` (Error)**: If a class decorated with `[DaprTopic]` does not implement `ITopicHandler<TMessage>` or `ITopicHandler<TMessage, TResult>`, `DAPR1611` triggers a build error.
- **`DAPR1612` (Warning)**: If a handler's message type is not registered in a source-generated `JsonSerializerContext` during Native AOT compilation, `DAPR1612` warns that AOT deserialization may fail.
{{% /alert %}}

{{% alert title="Dapr pub/sub delivery protocol" color="primary" %}}
In accordance with the Dapr runtime specification (gRPC `AppCallback.OnTopicEvent` and HTTP topic endpoints), topic delivery handlers return message acknowledgment status (`TopicResponseAction.Success`, `Retry`, or `Drop`). The Dapr pub/sub runtime does not accept arbitrary business data payloads in response to event delivery.
{{% /alert %}}

### Example: Topic handler with `ITopicHandler<TMessage>`

```csharp
using Dapr.Messaging;
using Dapr.Messaging.PublishSubscribe;

public record Order(string Id, decimal Total, string CustomerEmail);

[DaprTopic("pubsub", "orders")]
public sealed class OrderHandler(ILogger<OrderHandler> logger, IInventoryService inventory) 
    : ITopicHandler<Order>
{
    public async Task<TopicResponseAction> HandleAsync(
        Order message, 
        TopicContext context, 
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Processing order {OrderId} from pubsub {PubSub}", message.Id, context.PubsubName);

        try
        {
            await inventory.ReserveStockAsync(message.Id, cancellationToken);
            return TopicResponseAction.Success;
        }
        catch (InventoryUnavailableException ex)
        {
            logger.LogWarning(ex, "Insufficient inventory for order {OrderId}; dropping message", message.Id);
            return TopicResponseAction.Drop;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Transient error processing order {OrderId}; retrying", message.Id);
            return TopicResponseAction.Retry;
        }
    }
}
```

### Response actions

The `HandleAsync` method returns a `TopicResponseAction` that tells the Dapr runtime how to acknowledge the message:

| Response Action | Description |
| --- | --- |
| `TopicResponseAction.Success` | The message was processed successfully and should be acknowledged (deleted) from the pub/sub component. |
| `TopicResponseAction.Retry` | Processing failed due to a transient error; Dapr will redeliver the message according to the component's retry policy. |
| `TopicResponseAction.Drop` | Processing failed permanently; Dapr will delete the message or route it to a configured dead-letter topic without further retries. |

### Accessing delivery context with `TopicContext`

The `TopicContext` passed to `HandleAsync` provides rich metadata about the delivery:

```csharp
public async Task<TopicResponseAction> HandleAsync(Order message, TopicContext context, CancellationToken cancellationToken)
{
    var pubsubName = context.PubsubName;       // Name of the Dapr pub/sub component
    var topicName = context.TopicName;         // Name of the topic
    var messageId = context.MessageId;         // Unique message identifier
    var metadata = context.Metadata;           // Additional component-specific metadata
    var headers = context.Headers;             // CloudEvent headers forwarded with the delivery
    var rawBytes = context.RawPayload;         // Raw payload bytes (when EnableRawPayload is true)
    var cloudEvent = context.CloudEvent;       // Strongly-typed CloudEvent envelope
    
    return TopicResponseAction.Success;
}
```

## Configure subscriptions with `[DaprTopic]`

The `[DaprTopic]` attribute specifies which topic to subscribe to and how messages are delivered.

### Positional constructor arguments

The `[DaprTopic]` constructor requires two positional string arguments:

1. **`pubsubName`** (1st argument): The name of the Dapr pub/sub component (as defined in your component YAML's `metadata.name`, e.g., `"pubsub"` or `"messagebus"`).
2. **`topicName`** (2nd argument): The name of the topic or queue to subscribe to (e.g., `"orders"` or `"orders.us"`).

```csharp
// Subscribes to the "orders" topic on the "pubsub" component
[DaprTopic("pubsub", "orders")]
public class OrderHandler : ITopicHandler<Order> { /* ... */ }
```

### Attribute definition and properties

```csharp
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = false)]
public sealed class DaprTopicAttribute(string pubsubName, string topicName) : Attribute
{
    public string PubsubName { get; }
    public string TopicName { get; }
    public DeliveryMode Delivery { get; set; } = DeliveryMode.Streaming;
    public string? Route { get; set; }
    public string? Match { get; set; }
    public int Priority { get; set; }
    public string? DeadLetterTopic { get; set; }
    public bool EnableRawPayload { get; set; }
    public bool BulkSubscribe { get; set; }
    public int MaxMessagesCount { get; set; } = 100;
    public int MaxAwaitDurationMs { get; set; } = 1000;
    public string[]? MetadataKeys { get; set; }
}
```

### Property applicability by delivery mode

Not all properties on `[DaprTopic]` are relevant to every delivery mode. The table below outlines which properties apply to each mode:

| Property | Description | `DeliveryMode.Streaming` | `DeliveryMode.Programmatic` | `DeliveryMode.Http` |
| --- | --- | :---: | :---: | :---: |
| `PubsubName` | Name of the Dapr pub/sub component | **Required** | **Required** | **Required** |
| `TopicName` | Name of the topic | **Required** | **Required** | **Required** |
| `Delivery` | Delivery mode (`Streaming`, `Programmatic`, `Http`) | Optional (Default) | Optional | Optional |
| `Route` | Target HTTP path for event dispatching | *Ignored* | *Ignored* | **Applicable** |
| `Match` | CEL expression for content-based routing | *Ignored* | **Applicable** | **Applicable** |
| `Priority` | Priority order for matching CEL rules | *Ignored* | **Applicable** | **Applicable** |
| `DeadLetterTopic` | Fallback topic for dropped/failed messages | **Applicable** | **Applicable** | **Applicable** |
| `EnableRawPayload` | Forward raw bytes without CloudEvent parsing | **Applicable** | **Applicable** | **Applicable** |
| `BulkSubscribe` | Enable batch message delivery | *Ignored* | **Applicable** | **Applicable** |
| `MaxMessagesCount` | Maximum batch size for bulk subscriptions | *Ignored* | **Applicable** | **Applicable** |
| `MaxAwaitDurationMs` | Maximum wait duration (ms) for batch assembly | *Ignored* | **Applicable** | **Applicable** |
| `MetadataKeys` | Keys linking `[DaprTopicMetadata]` to this topic | **Applicable** | **Applicable** | **Applicable** |

{{% alert title="Property scope rules & analyzer validation" color="primary" %}}
- **`Route`**: Only used when `Delivery = DeliveryMode.Http`. In `Streaming` and `Programmatic` modes, events are delivered directly over gRPC streams or gRPC services rather than HTTP routes, so setting `Route` has no effect.
- **Routing Rules (`Match` / `Priority`)**: CEL rule evaluation is handled by the Dapr runtime when pushing events via `Programmatic` (gRPC) or `Http`. In `Streaming` mode, the client initiates the stream directly for the topic without server-side HTTP/gRPC routing rules.
- **Bulk Subscriptions (`BulkSubscribe`, `MaxMessagesCount`, `MaxAwaitDurationMs`)**: Configures server-side batch aggregation when Dapr pushes events via `Programmatic` or `Http`.
- **Compile-time property validation (`DAPR1616` & `DAPR1617`)**: Roslyn analyzers inspect `[DaprTopic]` configurations at build time. `DAPR1616` warns if you opt into a feature (like `BulkSubscribe = true`) without setting required companion properties (`MaxMessagesCount`, `MaxAwaitDurationMs`). `DAPR1617` warns if you populate properties that are ignored for the selected delivery mode or feature set (such as setting `Route` or `Match` on non-HTTP topics).
{{% /alert %}}

### The three delivery modes

`DeliveryMode` controls the communication protocol between the Dapr sidecar and your application:

1. **`DeliveryMode.Streaming` (Default)**:
   - The application initiates a persistent bidirectional gRPC stream (`SubscribeTopicEventsAlpha1`) to the Dapr sidecar.
   - Messages are pulled by the application with client-side backpressure buffering.
   - **No inbound HTTP or gRPC endpoints need to be mapped** for streaming subscriptions.
   - Ignores HTTP routing properties like `Route`.

   ```csharp
   [DaprTopic("pubsub", "orders", Delivery = DeliveryMode.Streaming)]
   public class StreamingOrderHandler : ITopicHandler<Order> { /* ... */ }
   ```

2. **`DeliveryMode.Programmatic`**:
   - The Dapr sidecar pushes messages to your application's `AppCallback` gRPC service.
   - Subscriptions are discovered automatically at startup via `ListTopicSubscriptions` and invoked via `OnTopicEvent`.
   - Requires calling `app.MapDaprMessaging()` on the endpoint pipeline.
   - Supports CEL routing rules (`Match`, `Priority`) and `BulkSubscribe`. Ignores `Route`.

   ```csharp
   [DaprTopic("pubsub", "orders", Delivery = DeliveryMode.Programmatic)]
   public class ProgrammaticOrderHandler : ITopicHandler<Order> { /* ... */ }
   ```

3. **`DeliveryMode.Http`**:
   - The Dapr sidecar discovers subscriptions by calling `GET /dapr/subscribe` and pushes events via `POST <route>`.
   - Requires calling `app.MapDaprMessaging()` on the endpoint pipeline.
   - `Route` defines the HTTP path where events are posted (defaults to the topic name if omitted).

   ```csharp
   [DaprTopic("pubsub", "orders", Delivery = DeliveryMode.Http, Route = "/api/orders")]
   public class HttpOrderHandler : ITopicHandler<Order> { /* ... */ }
   ```

{{% alert title="Delivery mode & endpoint analyzer validation" color="warning" %}}
- **`DAPR1610` (Error)**: Ensures the same pub/sub component and topic are not registered with conflicting delivery modes across different handlers.
- **`DAPR1613` (Warning)**: Warns when programmatic subscriptions are declared but endpoint mapping (`app.MapDaprMessaging()`) is omitted from the application pipeline. Includes an automated IDE Code Fix.
- **`DAPR1615` (Warning)**: Warns when endpoint mapping or subscriber registration methods are called without matching topic subscribers in the application.
{{% /alert %}}

### Content-based routing with CEL

You can filter and route messages based on Common Expression Language (CEL) expressions using the `Match` and `Priority` properties:

```csharp
[DaprTopic("pubsub", "orders", Match = "event.type == \"priority\"", Priority = 1)]
public sealed class PriorityOrderHandler : ITopicHandler<Order> { /* ... */ }

[DaprTopic("pubsub", "orders", Priority = 2)]
public sealed class StandardOrderHandler : ITopicHandler<Order> { /* ... */ }
```

### Dead-letter topics and bulk subscription

- **Dead-letter topic**: Set `DeadLetterTopic = "orders-dlq"` to route dropped messages to a dead-letter queue.
- **Bulk subscription**: Set `BulkSubscribe = true`, `MaxMessagesCount`, and `MaxAwaitDurationMs` to receive batches of messages.
- **Raw payloads**: Set `EnableRawPayload = true` to receive the unparsed event payload without CloudEvent envelope parsing.

### Topic metadata with `[DaprTopicMetadata]`

You can attach key-value metadata to your topic subscription using the `[DaprTopicMetadata]` attribute:

```csharp
[DaprTopic("pubsub", "orders", MetadataKeys = ["rawPayload"])]
[DaprTopicMetadata("rawPayload", "true")]
public sealed class RawOrderHandler : ITopicHandler<byte[]> { /* ... */ }
```

### Handling multiple topics on a single handler

`[DaprTopic]` allows multiple attributes on a single handler class. The handler processes messages from each configured topic:

```csharp
[DaprTopic("pubsub", "orders.us")]
[DaprTopic("pubsub", "orders.eu")]
[DaprTopic("pubsub", "orders.asia")]
public sealed class MultiRegionOrderHandler : ITopicHandler<Order>
{
    public Task<TopicResponseAction> HandleAsync(Order message, TopicContext context, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Received order from topic: {context.TopicName}");
        return Task.FromResult(TopicResponseAction.Success);
    }
}
```

## What the source generator produces

When you build your project, the `Dapr.Messaging.Generators` Roslyn source generator discovers all `[DaprTopic]` classes implementing `ITopicHandler<TMessage>` and emits:

| Generated Artifact | Purpose |
| --- | --- |
| **Typed Dispatchers** | Direct, strongly-typed invokers that deserialize message payloads using the configured serializer and invoke `HandleAsync` without reflection. |
| **`IDaprMessagingSubscriberRegistry`** | A centralized registry containing `TopicSubscriptionDescriptor` definitions for all discovered topics. |
| **`AddDaprMessaging()`** | An `IServiceCollection` extension method generated into your assembly that automatically registers options, the publishing client, handlers, dispatchers, subscriber registries, and required hosting services into your DI container. |

Because dispatching is code-generated at compile time, execution is fully trim-safe and Native AOT compatible.

## Register at startup

Register Dapr messaging services in `Program.cs` using `builder.Services.AddDaprMessaging()`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Register the complete Dapr messaging stack (options, publisher client, and source-generated subscribers)
builder.Services.AddDaprMessaging(options =>
{
    // Optional: configure Dapr sidecar connection options
    options.DaprGrpcEndpoint = "http://localhost:50001";
});

var app = builder.Build();

// Automatically map the endpoints required by the discovered delivery modes
app.MapDaprMessaging();

app.Run();
```

{{% alert title="Registration & endpoint analyzer validation" color="primary" %}}
- **`DAPR1614` (Warning)**: Emitted if application code attempts to invoke the internal `DaprMessagingRegistration` class directly instead of using the source-generated `builder.Services.AddDaprMessaging()` extension.
- **`DAPR1613` (Warning)**: Triggers if programmatic topic subscriptions are registered but `app.MapDaprMessaging()` (or `app.MapDaprAppCallback()`) is missing from `Program.cs`.
- **`DAPR1615` (Warning)**: Triggers if `app.MapDaprMessaging()` or subscriber registration endpoints are present when no corresponding HTTP or programmatic topic handlers exist.
{{% /alert %}}

### Explicit runtime topic registration

If you need to register a topic handler dynamically at runtime without source generator attributes, use `AddTopic<THandler>`:

```csharp
builder.Services.AddDaprMessaging()
    .AddTopic<OrderHandler>("pubsub", "orders", descriptor =>
    {
        descriptor.Delivery = DeliveryMode.Programmatic;
        descriptor.DeadLetterTopic = "orders-dlq";
    });
```

## Dynamic streaming subscriptions

In addition to declarative `[DaprTopic]` handlers, `DaprPublishSubscribeClient` allows creating imperative, dynamic streaming subscriptions at runtime:

```csharp
var messagingClient = app.Services.GetRequiredService<DaprPublishSubscribeClient>();

// Configure subscription options
var options = new DaprSubscriptionOptions(
    new MessageHandlingPolicy(
        TimeoutDuration: TimeSpan.FromSeconds(10), 
        DefaultResponseAction: TopicResponseAction.Retry))
{
    DeadLetterTopic = "orders-dlq",
    MaximumQueuedMessages = 500,
    MaximumCleanupTimeout = TimeSpan.FromSeconds(15),
    ErrorHandler = async (DaprException ex) =>
    {
        Console.WriteLine($"Subscription error: {ex.Message}");
    }
};

// Start the dynamic subscription
var subscription = await messagingClient.SubscribeAsync(
    "pubsub", 
    "dynamic-orders", 
    options, 
    async (TopicMessage message, CancellationToken ct) =>
    {
        var payload = Encoding.UTF8.GetString(message.Data.Span);
        Console.WriteLine($"Received dynamic message: {payload}");
        return TopicResponseAction.Success;
    });

// The subscription runs in the background. To observe completion or background faults:
_ = subscription.Completion.ContinueWith(t =>
{
    if (t.IsFaulted)
    {
        Console.WriteLine($"Subscription faulted: {t.Exception}");
    }
});

// When finished, cancel and clean up resources:
await subscription.DisposeAsync();
```

## Analyzers and diagnostics

`Dapr.Messaging` ships with Roslyn analyzers that enforce correct messaging practices at build time:

| ID | Title | Severity | Description |
| --- | --- | --- | --- |
| `DAPR1610` | Duplicate topic with conflicting delivery modes | **Error** | Triggered when the same `(pubsubName, topicName)` is configured with different `DeliveryMode` values across `[DaprTopic]` attributes. |
| `DAPR1611` | Handler must implement `ITopicHandler<T>` | **Error** | Triggered when `[DaprTopic]` is placed on a class that does not implement `ITopicHandler<TMessage>` or `ITopicHandler<TMessage, TResult>`. |
| `DAPR1612` | Message type not registered in `JsonSerializerContext` | **Warning** | Warns when a message type is not covered by `[JsonSerializable]` in a Native AOT compilation. |
| `DAPR1613` | Map endpoints for programmatic subscriptions | **Warning** | Warns when programmatic subscriptions are configured without `app.MapDaprAppCallback()` or `app.MapDaprMessaging()`. Includes an automated Code Fix. |
| `DAPR1614` | Do not call `DaprMessagingRegistration` directly | **Warning** | Warns when `DaprMessagingRegistration` is called directly from application code instead of calling `services.AddDaprMessaging()`. |
| `DAPR1615` | Remove unused subscriber registration | **Warning** | Warns when subscriber registration or endpoint mapping is present without matching HTTP or programmatic topic subscribers. |
| `DAPR1616` | Incomplete `[DaprTopic]` configuration | **Warning** | Warns when `[DaprTopic]` opts into a feature (like `BulkSubscribe = true`) without setting its required companion properties (`MaxMessagesCount`, `MaxAwaitDurationMs`). |
| `DAPR1617` | Ignored `[DaprTopic]` configuration | **Warning** | Warns when `[DaprTopic]` sets a property that is ignored for the selected delivery mode or feature set (e.g., `Route` or `Match` on non-HTTP topics). |

For a complete reference of all Roslyn analyzers, diagnostic severities, and available automated code fixes across the Dapr .NET SDK, see [Dapr source code analyzers and generators]({{< ref dotnet-guidance-source-generators.md >}}).

## Best practices

- **Prefer `DeliveryMode.Streaming`** for background workers, console apps, and services where you want bidirectional streaming and client-side backpressure without hosting an inbound HTTP or gRPC server.
- **Prefer `DeliveryMode.Programmatic`** for high-throughput gRPC services where the Dapr sidecar pushes events directly into ASP.NET Core gRPC endpoints.
- **Always handle transient vs permanent errors**: Return `TopicResponseAction.Retry` for transient errors (network timeouts, database locks) and `TopicResponseAction.Drop` for unrecoverable errors (poison messages, schema violations) to route them to a dead-letter topic.
- **Inject scoped services**: `ITopicHandler<TMessage>` instances are resolved per message within an isolated `IServiceScope`, ensuring safe resolution of scoped dependencies like Entity Framework `DbContext`.
- **Register `JsonSerializerContext` for AOT**: When compiling with Native AOT, annotate your `JsonSerializerContext` with `[JsonSerializable(typeof(TMessage))]` for every message type.

## Next steps

- [How-To: Publish events with IDaprPublishSubscribeClient]({{< ref dotnet-messaging-publish-howto.md >}})
- [Dapr Messaging configuration and usage guide]({{< ref dotnet-messaging-pubsub-usage.md >}})
- [Dapr Pub/Sub component specification]({{% ref pubsub-overview %}})
