---
type: docs
title: "How to: Create and use Dapr Distributed Lock in the .NET SDK"
linkTitle: "How to: Use the Distributed Lock client"
weight: 61050
description: Learn how to create and use the Dapr Distributed Lock client using the .NET SDK
---

## Prerequisites
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0),
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0), or
  [.NET 11](https://dotnet.microsoft.com/download/dotnet/11.0) installed
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)

## Installation

{{% alert title=".NET framework support" color="warning" %}}
Be advised that .NET 8 and .NET 9 reach end of support in November 2026. Support for both will be dropped
in Dapr v1.20; only .NET 10 and .NET 11 will be supported through the end of 2027.
{{% /alert %}}

To get started with the Dapr Distributed lock .NET SDK client, install the [Dapr.Distributed Lock package](https://www.nuget.org/packages/Dapr.DistributedLock) from NuGet:
```sh
dotnet add package Dapr.DistributedLock
```

The examples below target SDK `1.19.0` or later and require a configured distributed lock component,
such as a Redis lock store named `lockstore`. Import `Dapr.DistributedLock` and
`Dapr.DistributedLock.Extensions`. This API is experimental (`DAPR_DISTRIBUTEDLOCK`).

A `DaprDistributedLockClient` maintains access to networking resources in the form of TCP sockets used to communicate with the Dapr sidecar.

### Dependency Injection

The `AddDaprDistributedLock()` method will register the Dapr client ASP.NET Core dependency injection and is the recommended approach
for using this package. This method accepts an optional options delegate for configuring the `DaprDistributedLockClient` and a
`ServiceLifetime` argument, allowing you to specify a different lifetime for the registered services instead of the default `Singleton`
value.

The following example assumes all default values are acceptable and is sufficient to register the `DaprDistributedLockClient`:

```csharp
services.AddDaprDistributedLock();
```

The optional configuration delegate is used to configure the `DaprDistributedLockClient` by specifying options on the
`DaprDistributedLockBuilder` as in the following example:
```csharp
services.AddSingleton<DefaultOptionsProvider>();
services.AddDaprDistributedLock((serviceProvider, clientBuilder) => {
     //Inject a service to source a value from
     var optionsProvider = serviceProvider.GetRequiredService<DefaultOptionsProvider>();
     var standardTimeout = optionsProvider.GetStandardTimeout();
     
     //Configure the value on the client builder
     clientBuilder.UseTimeout(standardTimeout);
});
```

### Manual Instantiation
Rather than using dependency injection, a `DaprDistributedLockClient` can also be built using the static client builder.

For best performance, create a single long-lived instance of `DaprDistributedLockClient` and provide access to that shared instance throughout
your application. `DaprDistributedLockClient` instances are thread-safe and intended to be shared.

Avoid creating a `DaprDistributedLockClient` per-operation.

A `DaprDistributedLockClient` can be configured by invoking methods on the `DaprDistributedLockBuilder` class before calling `.Build()`
to create the client. The settings for each `DaprDistributedLockClient` are separate and cannot be changed after calling `.Build()`.

```csharp
var daprDistributedLockClient = new DaprDistributedLockBuilder()
    .UseGrpcEndpoint("http://localhost:50001")
    .Build();
```

See the .NET [documentation here]({{% ref dotnet-distributed-lock %}}) for more information about the options available 
when configuring the Dapr Distributed Lock client via the builder.

## Try it out
Put the Dapr Distributed Lock .NET SDK to the test. Walk through the samples to see Dapr in action:

| SDK Samples | Description |
| ----------- | ----------- |
| [SDK samples](https://github.com/dapr/dotnet-sdk/tree/master/examples) | Clone the SDK repo to try out some examples and get started. |

## Building Blocks

This part of the .NET SDK allows you to interface with the Distributed Lock API to place and remove locks for managing
resource exclusivity across your distributed applications.

## Acquire and automatically release a lock

`TryLockAsync` makes one acquisition attempt. It returns a `LockResponse` when acquired and `null` when
the resource could not be locked. It does not wait until another owner releases the lock.

```csharp
var owner = Guid.NewGuid().ToString("N");
await using var resourceLock = await daprDistributedLockClient.TryLockAsync(
    "lockstore", "orders/42", owner, expiryInSeconds: 60,
    cancellationToken: cancellationToken);

if (resourceLock is null)
{
    Console.WriteLine("The resource is already locked; work was not started.");
}
else
{
    await ProcessOrderAsync(cancellationToken);
}
```

`LockResponse` contains `StoreName`, `ResourceId`, and `LockOwner` and implements `IAsyncDisposable`.
At the end of the scope, disposal attempts to unlock with that identity. It does not expose the unlock
status to the caller. Use explicit unlock when you need to inspect the result, rather than assuming
disposal confirms successful release.

Choose an owner unique to the acquisition attempt, not just a shared app ID. The expiry must be a positive
number of seconds. Ensure protected work finishes before expiry; this client does not renew leases or
provide fencing tokens. Cancellation of the caller does not extend a lease or undo completed work.

## Explicit unlock and status

Pass the same component, resource, and owner values to `TryUnlockAsync`:

```csharp
using Dapr.DistributedLock.Models;

var result = await daprDistributedLockClient.TryUnlockAsync(
    "lockstore", "orders/42", owner, cancellationToken);

if (result.Status != LockStatus.Success)
{
    throw new InvalidOperationException($"Unlock did not succeed: {result.Status}");
}
```

| `LockStatus` | Meaning |
| --- | --- |
| `Success` | The lock was released. |
| `LockDoesNotExist` | The lock no longer exists, for example because it expired. |
| `LockBelongsToOthers` | The supplied owner does not own this lock. |
| `InternalError` | The runtime/component reported an unlock error. |

Invalid arguments raise standard argument exceptions. gRPC failures are wrapped in `DaprException`;
inspect `InnerException`. A normal acquisition conflict is `null`, not a transport exception.

## Migration from DaprClient

The older `DaprClient.Lock` returns `TryLockResponse` with a `Success` property, whereas
`DaprDistributedLockClient.TryLockAsync` returns a nullable disposable handle. Likewise, use
`TryUnlockAsync` rather than `DaprClient.Unlock` and inspect the dedicated client's `LockStatus`.
The two response models are not interchangeable.
