---
type: docs
title: "DaprPublishSubscribeClient usage"
linkTitle: "DaprPublishSubscribeClient usage"
weight: 69000
description: Essential tips and advice for using DaprPublishSubscribeClient
---

## Lifetime management

A `DaprPublishSubscribeClient` is a version of the Dapr client that is dedicated to interacting with the Dapr Messaging API. 
It can be registered alongside a `DaprClient` and other Dapr clients without issue.

It maintains access to networking resources in the form of TCP sockets used to communicate with the Dapr sidecar and implements
`IAsyncDisposable` to support the eager cleanup of resources.

For best performance, create a single long-lived instance of `DaprPublishSubscribeClient` and provide access to that shared
instance throughout your application. `DaprPublishSubscribeClient` instances are thread-safe and intended to be shared. 

This can be aided by utilizing the dependency injection functionality. The registration method supports registration using
as a singleton, a scoped instance or as transient (meaning it's recreated every time it's injected), but also enables
registration to utilize values from an `IConfiguration` or other injected service in a way that's impractical when
creating the client from scratch in each of your classes.

Avoid creating a `DaprPublishSubscribeClient` for each operation and disposing it when the operation is complete. It's
intended that the `DaprPublishSubscribeClient` should only be disposed when you no longer wish to receive events on the
subscription as disposing it will cancel the ongoing receipt of new events.

## Configuring DaprPublishSubscribeClient via the DaprPublishSubscribeClientBuilder
A `DaprPublishSubscribeClient` can be configured by invoking methods on the `DaprPublishSubscribeClientBuilder` class 
before calling `.Build()` to create the client itself. The settings for each `DaprPublishSubscribeClient` are separate
and cannot be changed after calling `.Build()`.

```cs
var daprPubsubClient = new DaprPublishSubscribeClientBuilder()
    .UseDaprApiToken("abc123") // Specify the API token used to authenticate to other Dapr sidecars
    .Build();
```

The `DaprPublishSubscribeClientBuilder` contains settings for:

- The HTTP endpoint of the Dapr sidecar
- The gRPC endpoint of the Dapr sidecar
- The `JsonSerializerOptions` object used to configure JSON serialization
- The `GrpcChannelOptions` object used to configure gRPC
- The API token used to authenticate requests to the sidecar
- The factory method used to create the `HttpClient` instance used by the SDK
- The timeout used for the `HttpClient` instance when making requests to the sidecar

The SDK will read the following environment variables to configure the default values:

- `DAPR_HTTP_ENDPOINT`: used to find the HTTP endpoint of the Dapr sidecar, example: `https://dapr-api.mycompany.com`
- `DAPR_GRPC_ENDPOINT`: used to find the gRPC endpoint of the Dapr sidecar, example: `https://dapr-grpc-api.mycompany.com`
- `DAPR_HTTP_PORT`: if `DAPR_HTTP_ENDPOINT` is not set, this is used to find the HTTP local endpoint of the Dapr sidecar
- `DAPR_GRPC_PORT`: if `DAPR_GRPC_ENDPOINT` is not set, this is used to find the gRPC local endpoint of the Dapr sidecar
- `DAPR_API_TOKEN`: used to set the API token

### Configuring gRPC channel options
Dapr's use of `CancellationToken` for cancellation relies on the configuration of the gRPC channel options. If you 
need to configure these options yourself, make sure to enable the [ThrowOperationCanceledOnCancellation setting](https://grpc.github.io/grpc/csharp-dotnet/api/Grpc.Net.Client.GrpcChannelOptions.html#Grpc_Net_Client_GrpcChannelOptions_ThrowOperationCanceledOnCancellation).

```cs
var daprPubsubClient = new DaprPublishSubscribeClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();
```

## Using cancellation with `DaprPublishSubscribeClient`

The APIs on `DaprPublishSubscribeClient` perform asynchronous operations and accept an optional `CancellationToken` 
parameter. This follows a standard .NET practice for cancellable operations. Note that when cancellation occurs, there is 
no guarantee that the remote endpoint stops processing the request, only that the client has stopped waiting for completion.

When an operation is cancelled, it will throw an `OperationCancelledException`.

## Configuring `DaprPublishSubscribeClient` via dependency injection

Using the built-in extension methods for registering the `DaprPublishSubscribeClient` in a dependency injection container 
can provide the benefit of registering the long-lived service a single time, centralize complex configuration and improve 
performance by ensuring similarly long-lived resources are re-purposed when possible (e.g. `HttpClient` instances).

There are three overloads available to give the developer the greatest flexibility in configuring the client for their 
scenario. Each of these will register the `IHttpClientFactory` on your behalf if not already registered, and configure 
the `DaprPublishSubscribeClientBuilder` to use it when creating the `HttpClient` instance in order to re-use the same 
instance as much as possible and avoid socket exhaustion and other issues.

In the first approach, there's no configuration done by the developer and the `DaprPublishSubscribeClient` is configured with 
the default settings.

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.DaprPublishSubscribeClient(); //Registers the `DaprPublishSubscribeClient` to be injected as needed
var app = builder.Build();
```

Sometimes the developer will need to configure the created client using the various configuration options detailed above. This is done through an overload that passes in the `DaprJobsClientBuiler` and exposes methods for configuring the necessary options.

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprJobsClient((_, daprPubSubClientBuilder) => {
   //Set the API token
   daprPubSubClientBuilder.UseDaprApiToken("abc123");
   //Specify a non-standard HTTP endpoint
   daprPubSubClientBuilder.UseHttpEndpoint("http://dapr.my-company.com");
});

var app = builder.Build();
```

Finally, it's possible that the developer may need to retrieve information from another service in order to populate these configuration values. That value may be provided from a `DaprClient` instance, a vendor-specific SDK or some local service, but as long as it's also registered in DI, it can be injected into this configuration operation via the last overload:

```cs
var builder = WebApplication.CreateBuilder(args);

//Register a fictional service that retrieves secrets from somewhere
builder.Services.AddSingleton<SecretService>();

builder.Services.AddDaprPublishSubscribeClient((serviceProvider, daprPubSubClientBuilder) => {
    //Retrieve an instance of the `SecretService` from the service provider
    var secretService = serviceProvider.GetRequiredService<SecretService>();
    var daprApiToken = secretService.GetSecret("DaprApiToken").Value;

    //Configure the `DaprPublishSubscribeClientBuilder`
    daprPubSubClientBuilder.UseDaprApiToken(daprApiToken);
});

var app = builder.Build();
```

## Subscription lifecycle and error handling
A streaming subscription is long-lived, but the underlying gRPC stream is not guaranteed to live forever. Sidecar
restarts, network blips, or faults in the background processing tasks can all terminate the stream. The following
best practices keep a subscription resilient.

### Use a reconnection loop
Wrap `SubscribeAsync` in a loop that re-establishes the subscription after `IDaprSubscription.Completion` terminates.
The receiver resets its internal state on every termination, so re-calling `SubscribeAsync` always works — even after
a fault. Add a short delay before reconnecting to avoid a tight loop if the sidecar is down. Cancel a single
`CancellationTokenSource` to shut the whole loop down.

### Observe faults through `IDaprSubscription.Completion`
The `IAsyncDisposable` returned by `SubscribeAsync` also implements `IDaprSubscription`, whose `Completion` task
completes when background processing finishes. Await it to block until termination, then handle the three ways it can
finish: `OperationCanceledException` (caller cancelled), `DaprException` (a background task faulted and no
`ErrorHandler` was configured), and `AggregateException` (an `ErrorHandler` was configured but itself threw).

### Configure an `ErrorHandler`
Set `DaprSubscriptionOptions.ErrorHandler` to receive background faults (such as the gRPC stream dropping). When
configured, the handler is invoked once per fault and `Completion` completes normally, so your reconnection loop
simply continues. If the handler itself throws, both the original fault and the handler failure surface as an
`AggregateException` on `Completion`. Without an `ErrorHandler`, faults propagate to `Completion` as a
`DaprException`. Note that the handler runs on a thread-pool thread, so implementations should be thread-safe.

### Catch specific exceptions in the message handler
Catch specific exception types and return a `TopicResponseAction` that matches the failure: `Drop` unparseable
messages so Dapr does not redeliver them in a poison-message loop, and `Retry` only transient failures. A bare
`catch` that always retries will redeliver a message that can never succeed.

### Keep the client shared, the subscription scoped
Keep a single long-lived `DaprPublishSubscribeClient` shared across your application, but scope each subscription to a
single loop iteration with `await using` so it is disposed before the next `SubscribeAsync` call. Disposing a
subscription that has already terminated simply releases its resources — it does not throw.