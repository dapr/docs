---
type: docs
title: "DaprSecretsManagementClient usage"
linkTitle: "DaprSecretsManagementClient usage"
weight: 52900
description: Essential tips and advice for using DaprSecretsManagementClient
---

## Lifetime management

A `DaprSecretsManagementClient` is a subset of the Dapr client that is dedicated to interacting with the Dapr Secrets
API. It can be registered alongside a `DaprClient` and other Dapr clients without issue.

It maintains access to networking resources in the form of TCP sockets used to communicate with the Dapr sidecar and
implements `IDisposable` to support the eager cleanup of resources.

For best performance, create a single long-lived instance of `DaprSecretsManagementClient` and provide access to that
shared instance throughout your application. `DaprSecretsManagementClient` instances are thread-safe and intended to be
shared.

This can be aided by utilizing the dependency injection functionality. The registration method supports registration
as a singleton, a scoped instance or as transient (meaning it's recreated every time it's injected), but also enables
registration to utilize values from an `IConfiguration` or other injected service in a way that's impractical when
creating the client from scratch in each of your classes.

Avoid creating a `DaprSecretsManagementClient` for each operation and disposing it when the operation is complete.

## Configuring DaprSecretsManagementClient via the DaprSecretsManagementClientBuilder

A `DaprSecretsManagementClient` can be configured by invoking methods on the `DaprSecretsManagementClientBuilder` class
before calling `.Build()` to create the client itself. The settings for each `DaprSecretsManagementClient` are separate
and cannot be changed after calling `.Build()`.

```cs
var daprSecretsClient = new DaprSecretsManagementClientBuilder()
    .UseDaprApiToken("abc123") // Specify the API token used to authenticate to other Dapr sidecars
    .Build();
```

The `DaprSecretsManagementClientBuilder` contains settings for:

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

Dapr's use of `CancellationToken` for cancellation relies on the configuration of the gRPC channel options. If you need
to configure these options yourself, make sure to enable the [ThrowOperationCanceledOnCancellation setting](https://grpc.github.io/grpc/csharp-dotnet/api/Grpc.Net.Client.GrpcChannelOptions.html#Grpc_Net_Client_GrpcChannelOptions_ThrowOperationCanceledOnCancellation).

```cs
var daprSecretsClient = new DaprSecretsManagementClientBuilder()
    .UseGrpcChannelOptions(new GrpcChannelOptions { ... ThrowOperationCanceledOnCancellation = true })
    .Build();
```

## Using cancellation with DaprSecretsManagementClient

The APIs on `DaprSecretsManagementClient` perform asynchronous operations and accept an optional `CancellationToken`
parameter. This follows a standard .NET practice for cancellable operations. Note that when cancellation occurs, there
is no guarantee that the remote endpoint stops processing the request, only that the client has stopped waiting for
completion.

When an operation is cancelled, it will throw an `OperationCancelledException`.

## Configuring DaprSecretsManagementClient via dependency injection

Using the built-in extension methods for registering the `DaprSecretsManagementClient` in a dependency injection
container can provide the benefit of registering the long-lived service a single time, centralize complex configuration
and improve performance by ensuring similarly long-lived resources are re-purposed when possible (e.g. `HttpClient`
instances).

There are three overloads available to give the developer the greatest flexibility in configuring the client for their
scenario. Each of these will register the `IHttpClientFactory` on your behalf if not already registered, and configure
the `DaprSecretsManagementClientBuilder` to use it when creating the `HttpClient` instance in order to re-use the same
instance as much as possible and avoid socket exhaustion and other issues.

In the first approach, there's no configuration done by the developer and the `DaprSecretsManagementClient` is
configured with the default settings.

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprSecretsManagementClient(); //Registers the `DaprSecretsManagementClient` to be injected as needed
var app = builder.Build();
```

Sometimes the developer will need to configure the created client using the various configuration options detailed
above. This is done through an overload that passes in the `DaprSecretsManagementClientBuilder` and exposes methods
for configuring the necessary options.

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprSecretsManagementClient((_, daprSecretsClientBuilder) => {
   //Set the API token
   daprSecretsClientBuilder.UseDaprApiToken("abc123");
   //Specify a non-standard HTTP endpoint
   daprSecretsClientBuilder.UseHttpEndpoint("http://dapr.my-company.com");
});

var app = builder.Build();
```

Finally, it's possible that the developer may need to retrieve information from another service in order to populate
these configuration values. That value may be provided from a `DaprClient` instance, a vendor-specific SDK or some
local service, but as long as it's also registered in DI, it can be injected into this configuration operation via the
last overload:

```cs
var builder = WebApplication.CreateBuilder(args);

//Register a fictional service that retrieves secrets from somewhere
builder.Services.AddSingleton<SecretService>();

builder.Services.AddDaprSecretsManagementClient((serviceProvider, daprSecretsClientBuilder) => {
    //Retrieve an instance of the `SecretService` from the service provider
    var secretService = serviceProvider.GetRequiredService<SecretService>();
    var daprApiToken = secretService.GetSecret("DaprApiToken").Value;

    //Configure the `DaprSecretsManagementClientBuilder`
    daprSecretsClientBuilder.UseDaprApiToken(daprApiToken);
});

var app = builder.Build();
```

## Chaining the source generator registration

The `AddDaprSecretsManagementClient()` method returns an `IDaprSecretsManagementBuilder` that enables chaining of
source-generator-produced registration methods. First, you need to create an appropriately decorated interface:

```cs
[SecretStore("my-vault")]
public partial interface IMyVaultSecrets
{
  /// <summary>
  /// The database connection string, retrieved from the "db-connection-string" secret key.
  /// </summary>
  [Secret("db-connection-string")]
  string DatabaseConnection { get; }

  /// <summary>
  /// The API key. Uses the property name "ApiKey" as the secret name.
  /// </summary>
  string ApiKey { get; }
}
```

Because this interface is decorated with the `[SecretStore]` attribute specifying the name of the secret store component it should use, the source generator emits an extension method you can chain directly (replacing the conventional "I" prefix with "Add" from your interface type name):

```cs
builder.Services.AddDaprSecretsManagementClient()
    .AddMyVaultSecrets()       // Generated from [SecretStore("my-vault")] on IMyVaultSecrets
    .AddPaymentSecrets();      // Generated from another typed interface
```

Each call registers the typed interface, its concrete implementation, and an `IHostedService` that pre-loads the secrets at startup.

From there, simply inject your `IMyVaultSecrets` into a type and the properties will be populated with the values from your secret store via Dapr.

## Understanding the API response shapes

### GetSecretAsync

`GetSecretAsync` returns an `IReadOnlyDictionary<string, string>`. Most secret stores return a single key-value pair,
but some (like Kubernetes) can store multiple values per secret key. Each entry in the dictionary represents one such
value.

### GetBulkSecretAsync

`GetBulkSecretAsync` returns an `IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>`. The outer key is
the secret name; the inner dictionary contains one or more key-value pairs representing the secret data for that key.

## Error handling

Methods on `DaprSecretsManagementClient` will throw a `DaprException` if an issue is encountered when communicating
with the Dapr sidecar. In case of illegal argument values, the appropriate standard exception will be thrown
(e.g. `ArgumentNullException` or `ArgumentException`) with the name of the offending argument. When an operation is
canceled via a `CancellationToken`, an `OperationCanceledException` will be thrown.

The most common cases of failure will be related to:

- Incorrect argument formatting (e.g. an empty store name or key)
- Transient failures such as a networking problem
- The specified secret store component not being configured or available

In any of these cases, you can examine more exception details through the `.InnerException` property.
