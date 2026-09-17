---
type: docs
title: "How to: Author and manage Dapr streaming subscriptions in the .NET SDK"
linkTitle: "How to: Author & manage streaming subscriptions"
weight: 61000
description: Learn how to author and manage Dapr streaming subscriptions using the .NET SDK
---

Let's create a subscription to a pub/sub topic or queue at runtime using the streaming capability. We'll use the
[simple example provided here](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/StreamingSubscriptionExample),
for the following demonstration and walk through it as an explainer of how you can configure message handlers at
runtime and which do not require an endpoint to be pre-configured. In this guide, you will:

- Deploy a .NET Web API application ([StreamingSubscriptionExample](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging/StreamingSubscriptionExample))
- Utilize the Dapr .NET Messaging SDK to subscribe dynamically to a pub/sub topic.
- Automatically reconnect the subscription after a stream termination and observe subscription errors.

## Prerequisites
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), or
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) installed
- [Dapr.Messaging](https://www.nuget.org/packages/Dapr.Messaging) NuGet package installed to your project

## Set up the environment
Clone the [.NET SDK repo](https://github.com/dapr/dotnet-sdk).

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

From the .NET SDK root directory, navigate to the Dapr streaming PubSub example.

```sh
cd examples/Messaging
```

## Run the application locally

To run the Dapr application, you need to start the .NET program and a Dapr sidecar. Navigate to the `StreamingSubscriptionExample` directory.

```sh
cd StreamingSubscriptionExample
```

We'll run a command that starts both the Dapr sidecar and the .NET program at the same time.

```sh
dapr run --app-id pubsubapp --dapr-grpc-port 4001 --dapr-http-port 3500 -- dotnet run
```
> Dapr listens for HTTP requests at `http://localhost:3500` and internal Jobs gRPC requests at `http://localhost:4001`.

## Register the Dapr PubSub client with dependency injection
The Dapr Messaging SDK provides an extension method to simplify the registration of the Dapr PubSub client. Before
completing the dependency injection registration in `Program.cs`, add the following line:

```csharp
var builder = WebApplication.CreateBuilder(args);

//Add anywhere between these two
builder.Services.AddDaprPubSubClient(); //That's it

var app = builder.Build();
```

It's possible that you may want to provide some configuration options to the Dapr PubSub client that
should be present with each call to the sidecar such as a Dapr API token, or you want to use a non-standard
HTTP or gRPC endpoint. This be possible through use of an overload of the registration method that allows configuration
of a `DaprPublishSubscribeClientBuilder` instance:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprPubSubClient((_, daprPubSubClientBuilder) => {
    daprPubSubClientBuilder.UseDaprApiToken("abc123");
    daprPubSubClientBuilder.UseHttpEndpoint("http://localhost:8512"); //Non-standard sidecar HTTP endpoint
});

var app = builder.Build();
```

Still, it's possible that whatever values you wish to inject need to be retrieved from some other source, itself registered as a dependency. There's one more overload you can use to inject an `IServiceProvider` into the configuration action method. In the following example, we register a fictional singleton that can retrieve secrets from somewhere and pass it into the configuration method for `AddDaprJobClient` so
we can retrieve our Dapr API token from somewhere else for registration here:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SecretRetriever>();
builder.Services.AddDaprPubSubClient((serviceProvider, daprPubSubClientBuilder) => {
    var secretRetriever = serviceProvider.GetRequiredService<SecretRetriever>();
    var daprApiToken = secretRetriever.GetSecret("DaprApiToken").Value;
    daprPubSubClientBuilder.UseDaprApiToken(daprApiToken);
    
    daprPubSubClientBuilder.UseHttpEndpoint("http://localhost:8512");
});

var app = builder.Build();
```

## Use the Dapr PubSub client using IConfiguration
It's possible to configure the Dapr PubSub client using the values in your registered `IConfiguration` as well without
explicitly specifying each of the value overrides using the `DaprPublishSubscribeClientBuilder` as demonstrated in the previous
section. Rather, by populating an `IConfiguration` made available through dependency injection the `AddDaprPubSubClient()`
registration will automatically use these values over their respective defaults.

Start by populating the values in your configuration. This can be done in several different ways as demonstrated below.

### Configuration via `ConfigurationBuilder`
Application settings can be configured without using a configuration source and by instead populating the value in-memory
using a `ConfigurationBuilder` instance:

```csharp
var builder = WebApplication.CreateBuilder();

//Create the configuration
var configuration = new ConfigurationBuilder()
    .AddInMemoryCollection(new Dictionary<string, string> {
            { "DAPR_HTTP_ENDPOINT", "http://localhost:54321" },
            { "DAPR_API_TOKEN", "abc123" }
        })
    .Build();

builder.Configuration.AddConfiguration(configuration);
builder.Services.AddDaprPubSubClient(); //This will automatically populate the HTTP endpoint and API token values from the IConfiguration
```

### Configuration via Environment Variables
Application settings can be accessed from environment variables available to your application.

The following environment variables will be used to populate both the HTTP endpoint and API token used to register the
Dapr PubSub client.

| Key                | Value                  |
|--------------------|------------------------|
| DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| DAPR_API_TOKEN     | abc123                 |

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddDaprPubSubClient();
```

The Dapr PubSub client will be configured to use both the HTTP endpoint `http://localhost:54321` and populate all outbound
requests with the API token header `abc123`.

### Configuration via prefixed Environment Variables
However, in shared-host scenarios where there are multiple applications all running on the same machine without using
containers or in development environments, it's not uncommon to prefix environment variables. The following example
assumes that both the HTTP endpoint and the API token will be pulled from environment variables prefixed with the
value "myapp_". The two environment variables used in this scenario are as follows:

| Key                      | Value                  |
|--------------------------|------------------------|
| myapp_DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| myapp_DAPR_API_TOKEN     | abc123                 |

These environment variables will be loaded into the registered configuration in the following example and made available
without the prefix attached.

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables(prefix: "myapp_");
builder.Services.AddDaprPubSubClient();
```

The Dapr PubSub client will be configured to use both the HTTP endpoint `http://localhost:54321` and populate all outbound
requests with the API token header `abc123`.

## Use the Dapr PubSub client without relying on dependency injection
While the use of dependency injection simplifies the use of complex types in .NET and makes it easier to
deal with complicated configurations, you're not required to register the `DaprPublishSubscribeClient` in this way.
Rather, you can also elect to create an instance of it from a `DaprPublishSubscribeClientBuilder` instance as
demonstrated below:

```cs

public class MySampleClass
{
    public void DoSomething()
    {
        var daprPubSubClientBuilder = new DaprPublishSubscribeClientBuilder();
        var daprPubSubClient = daprPubSubClientBuilder.Build();

        //Do something with the `daprPubSubClient`
    }
}
```

## Set up message handler
The streaming subscription implementation in Dapr gives you greater control over handling backpressure from events by
leaving the messages in the Dapr runtime until your application is ready to accept them. The .NET SDK supports a
high-performance queue for maintaining a local cache of these messages in your application while processing is pending.
These messages will persist in the queue until processing either times out for each one or a response action is taken
for each (typically after processing succeeds or fails). Until this response action is received by the Dapr runtime,
the messages will be persisted by Dapr and made available in case of a service failure.

The various response actions available are as follows:
| Response Action | Description |
| --- | --- |
| Retry | The event should be delivered again in the future. |
| Drop | The event should be deleted (or forwarded to a dead letter queue, if configured) and not attempted again. |
| Success | The event should be deleted as it was successfully processed. |

The handler will receive only one message at a time and if a cancellation token is provided to the subscription,
this token will be provided during the handler invocation.

The handler must be configured to return a `Task<TopicResponseAction>` indicating one of these operations, even if from
a try/catch block. If an exception is not caught by your handler, the subscription will use the response action configured
in the options during subscription registration.

A best practice is to catch *specific* exception types rather than swallowing every exception with a bare `catch`. The
response you return for a given failure should match the nature of that failure: a malformed payload that will never
parse should be **dropped** so Dapr does not redeliver it endlessly (a "poison-message" loop), while a transient
failure — such as a downstream dependency being momentarily unavailable — should be **retried** so Dapr redelivers the
message for another attempt. The handler below, taken from the example, follows this pattern: it catches
`JsonException` to drop unparseable messages and falls back to a general `catch` that retries on any other failure.

```csharp
// The message handler processes each topic message and returns the action the sidecar should take.
// Returning Retry asks Dapr to redeliver the message; Success acknowledges it; Drop discards it.
// Catch specific exceptions rather than swallowing everything — an unparseable message, for
// example, should be dropped (not retried) to avoid a poison-message loop.
Task<TopicResponseAction> HandleMessageAsync(TopicMessage message, CancellationToken cancellationToken)
{
    try
    {
        var body = Encoding.UTF8.GetString(message.Data.Span);
        Console.WriteLine($"Received: {body}");
        return Task.FromResult(TopicResponseAction.Success);
    }
    catch (JsonException)
    {
        // Malformed payload — don't retry, drop it.
        return Task.FromResult(TopicResponseAction.Drop);
    }
    catch (Exception ex)
    {
        // Transient failure — let Dapr redeliver.
        Console.WriteLine($"Message handler error: {ex.Message}");
        return Task.FromResult(TopicResponseAction.Retry);
    }
}
```

Note that the handler receives the `CancellationToken` passed to the subscription (without a default value), so it can
cooperatively respond to cancellation alongside the rest of the subscription lifecycle.

## Configure and subscribe to the PubSub topic
Configuration of the streaming subscription requires the name of the PubSub component registered with Dapr, the name
of the topic or queue being subscribed to, the `DaprSubscriptionOptions` providing the configuration for the subscription,
the message handler and an optional cancellation token. The only required argument to the `DaprSubscriptionOptions` is
the default `MessageHandlingPolicy` which consists of a per-event timeout and the `TopicResponseAction` to take when
that timeout occurs.

Other options are as follows:

| Property Name         | Description                                                                                                                                                                                                    |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Metadata              | Additional subscription metadata.                                                                                                                                                                              |
| DeadLetterTopic       | The optional name of the dead-letter topic to send dropped messages to.                                                                                                                                       |
| MaximumQueuedMessages | By default, there is no maximum boundary enforced for the internal queue, but setting this property would impose an upper limit.                                                                              |
| MaximumCleanupTimeout | When the subscription is disposed of or the token flags a cancellation request, this specifies the maximum amount of time available to process the remaining messages in the internal queue.                   |
| ErrorHandler          | An optional callback invoked when background tasks (sidecar streaming, acknowledgement processing, message processing) fault after a successful initial subscription. If not set, the fault propagates to `IDaprSubscription.Completion` as a `DaprException`. If the handler itself throws, both the original fault and the handler failure are surfaced as an `AggregateException` on `Completion`. |

Subscription is then configured as in the following example. Rather than subscribing once and assuming the gRPC stream
will live forever, the example wraps the subscription in a **reconnection loop**: after the stream terminates for any
reason (sidecar restart, network blip, background-task fault), the loop re-establishes the subscription by calling
`SubscribeAsync` again. The supervisor inside `PublishSubscribeReceiver` resets its state on every termination, so
re-calling `SubscribeAsync` always works — even after a fault.

Each iteration:

1. Builds a `DaprSubscriptionOptions`, including an optional `ErrorHandler` that receives background faults (for example,
   the gRPC stream dropping). When an `ErrorHandler` is configured it is invoked once per fault and `Completion`
   **completes normally**, so the loop simply continues and re-subscribes. If the handler itself throws, `Completion`
   faults with an `AggregateException` (caught below).
2. Calls `SubscribeAsync`, which returns an `IAsyncDisposable` that also implements `IDaprSubscription`.
3. Casts the returned subscription to `IDaprSubscription` to access the `Completion` task and awaits it, blocking the
   loop until the subscription terminates.
4. Handles the three ways `Completion` can finish: `OperationCanceledException` (the caller cancelled — exit the loop),
   `AggregateException` (the `ErrorHandler` itself threw), and `DaprException` (no `ErrorHandler` was configured, or
   the fault could not be handled).
5. Disposes the subscription (`await using`) and waits briefly before reconnecting, to avoid a tight loop if the sidecar
   is down.

```csharp
var messagingClient = app.Services.GetRequiredService<DaprPublishSubscribeClient>();

using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));

// Reconnection loop: re-establishes the subscription after any stream termination
// (sidecar restart, network blip, background-task fault, etc.). The supervisor
// resets its state on every termination, so re-calling SubscribeAsync always works.
while (!cts.Token.IsCancellationRequested)
{
    var options = new DaprSubscriptionOptions(
        new MessageHandlingPolicy(TimeSpan.FromSeconds(10), TopicResponseAction.Retry))
    {
        // The ErrorHandler receives background faults (e.g. the gRPC stream drops).
        // If configured, it is invoked once per fault and Completion completes
        // normally — the loop continues and re-subscribes. If the handler itself
        // throws, Completion faults with an AggregateException (caught below).
        ErrorHandler = ex =>
        {
            Console.WriteLine($"Subscription error: {ex.InnerException?.Message ?? ex.Message}");
            return Task.CompletedTask;
        }
    };

    await using var subscription = await messagingClient.SubscribeAsync(
        "pubsub", "myTopic", options, HandleMessageAsync, cts.Token);

    // The returned IAsyncDisposable also implements IDaprSubscription.
    // Await Completion to block until the subscription terminates.
    var completion = ((IDaprSubscription)subscription).Completion;

    try
    {
        await completion.WaitAsync(cts.Token);
    }
    catch (OperationCanceledException)
    {
        // Caller cancelled — exit the loop.
        break;
    }
    catch (AggregateException ex)
    {
        // The ErrorHandler itself threw — its exception is combined with the original DaprException.
        Console.WriteLine($"Subscription faulted (handler error): {ex.Flatten().InnerException?.Message}");
    }
    catch (DaprException ex)
    {
        // No ErrorHandler was configured, or the fault could not be handled.
        Console.WriteLine($"Subscription faulted: {ex.InnerException?.Message ?? ex.Message}");
    }

    // Brief delay before reconnecting to avoid a tight loop if the sidecar is down.
    try { await Task.Delay(TimeSpan.FromSeconds(3), cts.Token); }
    catch (OperationCanceledException) { break; }
}
```

## Observe subscription lifetime and handle errors
The object returned by `SubscribeAsync` is an `IAsyncDisposable` that also implements the `IDaprSubscription`
interface. `IDaprSubscription` exposes a single property, `Completion`, which is a `Task` that completes when the
subscription's background processing finishes. This gives you a way to observe the subscription's lifetime — and any
faults — independently of disposing it.

| Outcome | Behavior of `Completion` |
|---|---|
| The stream ends cleanly or the subscription is cancelled | Completes normally (or with `OperationCanceledException` if you awaited with a token). |
| A background task faults and **no** `ErrorHandler` is configured | Faults with a `DaprException` wrapping the original error. |
| A background task faults and an `ErrorHandler` **is** configured | The handler is invoked; `Completion` completes normally. |
| The `ErrorHandler` itself throws | `Completion` faults with an `AggregateException` combining the original fault and the handler failure. |

Because the receiver resets its internal state on every termination, you can always observe a fault via `Completion`
and then re-establish the subscription by calling `SubscribeAsync` again — even after a fault. Callers that never retry
can still observe errors through `Completion`, which replaces the previous cache-and-rethrow-on-next-subscribe model.
This is what makes the reconnection loop shown above reliable.

## Terminate and clean up subscription
When you've finished with your subscription and wish to stop receiving new events, simply await a call to
`DisposeAsync()` on your subscription instance. This will cause the client to unregister from additional events and
proceed to finish processing all the events still leftover in the backpressure queue, if any, before disposing of any
internal resources. This cleanup will be limited to the timeout interval provided in the `DaprSubscriptionOptions` when
the subscription was registered and by default, this is set to 30 seconds.

In the reconnection loop above, each subscription is scoped to a single iteration with `await using`, so it is disposed
automatically before the next `SubscribeAsync` call. Disposing a subscription does not throw if the underlying stream
has already terminated — it simply releases the subscription's resources. To shut down the whole loop, cancel the
`CancellationTokenSource`; the awaited `Completion` (or the next `Task.Delay`) will throw
`OperationCanceledException`, which the loop catches to exit cleanly.