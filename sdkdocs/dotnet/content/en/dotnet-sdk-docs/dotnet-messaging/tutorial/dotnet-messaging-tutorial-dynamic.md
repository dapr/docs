---
type: docs
title: "Part 7: Dynamic streaming subscriptions"
linkTitle: "Part 7: Dynamic streaming"
weight: 160700
description: "Open imperative streaming subscriptions for topics chosen at runtime"
---

The [dynamic streaming example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/07-DynamicStreaming) uses `SubscribeAsync` when topics or subscription lifetime cannot be fixed at compile time.

## Register the client and worker

```csharp
builder.Services.AddDaprPubSubClient();
builder.Services.AddHostedService<DynamicSubscriberWorker>();
```

The worker opens a subscription to a runtime-selected topic:

```csharp
var options = new DaprSubscriptionOptions(
    new MessageHandlingPolicy(
        TimeoutDuration: TimeSpan.FromSeconds(10),
        DefaultResponseAction: TopicResponseAction.Retry))
{
    DeadLetterTopic = "tenant-events-dlq",
    ErrorHandler = exception =>
    {
        logger.LogWarning("Subscription error: {Message}", exception.Message);
        return Task.CompletedTask;
    }
};

await using var subscription = await client.SubscribeAsync(
    "pubsub",
    "tenant-events",
    options,
    HandleDynamicMessageAsync,
    stoppingToken);

await ((IDaprSubscription)subscription).Completion.WaitAsync(stoppingToken);
```

`SubscribeAsync` returns an async-disposable subscription and an `IDaprSubscription.Completion` task. A supervisor can await completion, log faults, delay, and open a new subscription. Always dispose the subscription and honor the host cancellation token.

## Handle untyped messages safely

Dynamic subscriptions receive `TopicMessage`, so the handler is responsible for decoding and validating the payload:

```csharp
try
{
    var tenantEvent = JsonSerializer.Deserialize<TenantEvent>(message.Data.Span);
    if (tenantEvent is null || string.IsNullOrWhiteSpace(tenantEvent.TenantId))
    {
        return Task.FromResult(TopicResponseAction.Drop);
    }

    return Task.FromResult(
        tenantEvent.EventType.StartsWith("RETRY-", StringComparison.OrdinalIgnoreCase)
            ? TopicResponseAction.Retry
            : TopicResponseAction.Success);
}
catch (JsonException)
{
    return Task.FromResult(TopicResponseAction.Drop);
}
```

Malformed JSON is a permanent input problem and is dropped; transient processing errors should request retry.

## Test the supervisor and handler

The unit tests create `TopicMessage` instances with serialized valid, retry, invalid, and malformed payloads and assert the response action. The integration test registers the worker with `DaprTestApplicationBuilder`, publishes real tenant events, and waits on a concurrent log sink for processing and drop results. This pattern tests asynchronous background work without relying on arbitrary sleeps.

```powershell
dotnet test examples\Messaging\07-DynamicStreaming\DynamicStreaming.Example07.Tests\DynamicStreaming.Example07.Tests.csproj
```

## Next steps

- [Dapr Messaging overview]({{< ref _index.md >}})
- [Subscribe to topics how-to]({{< ref dotnet-messaging-subscribe-howto.md >}})

