---
type: docs
title: "How to: Manage secrets with the Dapr Secrets Management .NET SDK"
linkTitle: "How to: Manage secrets"
weight: 52050
description: Learn how to retrieve and manage secrets using the Dapr Secrets Management .NET SDK
---

Let's walk through how to retrieve secrets from a Dapr secret store using the `Dapr.SecretsManagement` package. We'll
use the [sample project provided here](https://github.com/dapr/dotnet-sdk/tree/master/examples/SecretManagement) for
the following demonstration, covering direct secret retrieval, bulk secret retrieval, and strongly-typed access via the
included source generator. In this guide, you will:

- Deploy a .NET Web API application ([SecretManagementSample](https://github.com/dapr/dotnet-sdk/tree/master/examples/SecretManagement/SecretManagementSample))
- Utilize the Dapr .NET Secrets Management SDK to retrieve individual and bulk secrets
- Use the source generator to create a strongly-typed interface for your secret store

In the .NET example project:
- The main [`Program.cs`](https://github.com/dapr/dotnet-sdk/tree/master/examples/SecretManagement/SecretManagementSample/Program.cs) contains all three usage patterns.
- The [`IMyVaultSecrets.cs`](https://github.com/dapr/dotnet-sdk/tree/master/examples/SecretManagement/SecretManagementSample/IMyVaultSecrets.cs) file demonstrates the typed secret store interface.

## Prerequisites
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), or
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) installed
- [Dapr.SecretsManagement](https://www.nuget.org/packages/Dapr.SecretsManagement) NuGet package installed to your project

## Set up the environment
Clone the [.NET SDK repo](https://github.com/dapr/dotnet-sdk).

```sh
git clone https://github.com/dapr/dotnet-sdk.git
```

From the .NET SDK root directory, navigate to the Dapr Secrets Management example.

```sh
cd examples/SecretManagement
```

## Run the application locally

To run the Dapr application, you need to start the .NET program and a Dapr sidecar. Navigate to the `SecretManagementSample` directory.

```sh
cd SecretManagementSample
```

We'll run a command that starts both the Dapr sidecar and the .NET program at the same time.

```sh
dapr run --app-id secretsapp --app-port 6543 --dapr-grpc-port 4001 --dapr-http-port 3500 -- dotnet run
```

> Dapr listens for HTTP requests at `http://localhost:3500` and internal gRPC requests at `http://localhost:4001`.

## Register the Dapr Secrets Management client with dependency injection
The Dapr Secrets Management SDK provides an extension method to simplify the registration of the client. Before completing the dependency injection registration in `Program.cs`, add the following line:

```cs
var builder = WebApplication.CreateBuilder(args);

//Add anywhere between these two lines
builder.Services.AddDaprSecretsManagementClient();

var app = builder.Build();
```

It's possible that you may want to provide some configuration options to the client that should be present with each call to the sidecar, such as a Dapr API token or a non-standard HTTP or gRPC endpoint. This is possible through use of an overload of the registration method that allows configuration of a `DaprSecretsManagementClientBuilder` instance:

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprSecretsManagementClient((_, daprSecretsClientBuilder) =>
{
    daprSecretsClientBuilder.UseDaprApiToken("abc123");
    daprSecretsClientBuilder.UseHttpEndpoint("http://localhost:8512"); //Non-standard sidecar HTTP endpoint
});

var app = builder.Build();
```

Still, it's possible that whatever values you wish to inject need to be retrieved from some other source, itself registered as a dependency. There's one more overload you can use to inject an `IServiceProvider` into the configuration action method. In the following example, we register a fictional singleton that can retrieve configuration values from somewhere and pass it into the configuration method for `AddDaprSecretsManagementClient` so we can retrieve our Dapr API token from somewhere else for registration here:

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SecretRetriever>();
builder.Services.AddDaprSecretsManagementClient((serviceProvider, daprSecretsClientBuilder) =>
{
    var secretRetriever = serviceProvider.GetRequiredService<SecretRetriever>();
    var daprApiToken = secretRetriever.GetSecret("DaprApiToken").Value;
    daprSecretsClientBuilder.UseDaprApiToken(daprApiToken);

    daprSecretsClientBuilder.UseHttpEndpoint("http://localhost:8512");
});

var app = builder.Build();
```

## Use the Dapr Secrets Management client using IConfiguration
It's possible to configure the Dapr Secrets Management client using the values in your registered `IConfiguration` as well without explicitly specifying each of the value overrides using the `DaprSecretsManagementClientBuilder` as demonstrated in the previous section. Rather, by populating an `IConfiguration` made available through dependency
injection the `AddDaprSecretsManagementClient()` registration will automatically use these values over their respective defaults.

Start by populating the values in your configuration. This can be done in several different ways as demonstrated below.

### Configuration via `ConfigurationBuilder`
Application settings can be configured without using a configuration source and by instead populating the value in-memory using a `ConfigurationBuilder` instance:

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
builder.Services.AddDaprSecretsManagementClient(); //This will automatically populate the HTTP and gRPC endpoints and API token values from the IConfiguration
```

### Configuration via Environment Variables
Application settings can be accessed from environment variables available to your application.

The following environment variables will be used to populate both the HTTP endpoint and API token used to register the Dapr Secrets Management client.

| Key | Value |
| --- | --- |
| DAPR_HTTP_ENDPOINT | http://localhost:54321 |
| DAPR_API_TOKEN | abc123 |

```csharp
var builder = WebApplication.CreateBuilder();

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddDaprSecretsManagementClient();
```

The Dapr Secrets Management client will be configured to use both the HTTP endpoint `http://localhost:54321` and populate
all outbound requests with the API token header `abc123`.

## Retrieve a single secret

To retrieve a single secret from a Dapr secret store, use the `GetSecretAsync` method on the
`DaprSecretsManagementClient`. The method accepts the name of the secret store component, the secret key, and an
optional metadata dictionary.

```cs
app.MapGet("/secrets/{storeName}/{key}", async (
    string storeName,
    string key,
    DaprSecretsManagementClient secretsClient,
    CancellationToken cancellationToken) =>
{
    var secret = await secretsClient.GetSecretAsync(storeName, key, cancellationToken: cancellationToken);
    return Results.Ok(secret);
});
```

The result is a `IReadOnlyDictionary<string, string>`. Some secret stores (such as Kubernetes) can store multiple values
per key — each entry in the dictionary represents one such value.

## Retrieve bulk secrets

To retrieve all secrets that the application is allowed to access from a secret store, use the `GetBulkSecretAsync`
method:

```cs
app.MapGet("/secrets/{storeName}", async (
    string storeName,
    DaprSecretsManagementClient secretsClient,
    CancellationToken cancellationToken) =>
{
    var secrets = await secretsClient.GetBulkSecretAsync(storeName, cancellationToken: cancellationToken);
    return Results.Ok(secrets);
});
```

The result is a nested `IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>`. The outer key is the secret
name; the inner dictionary contains one or more key-value pairs representing the secret data.

## Passing metadata

Both `GetSecretAsync` and `GetBulkSecretAsync` accept an optional `metadata` parameter. This allows you to pass
additional context to the secret store component. The valid metadata keys and values are determined by the type of
secret store in use.

```cs
var metadata = new Dictionary<string, string>
{
    { "version", "2" }
};

var secret = await secretsClient.GetSecretAsync("my-vault", "db-password", metadata: metadata);
```

## Use the source generator for strongly-typed secrets

The `Dapr.SecretsManagement` package includes an incremental source generator that produces strongly-typed access to
your secret store via a simple interface definition. This eliminates the need to pass store names and key strings
throughout your codebase.

### Define a typed secret store interface

Create a `partial interface` decorated with the `[SecretStore]` attribute, specifying the Dapr secret store component
name. Each property maps to a single secret key.

```cs
using Dapr.SecretsManagement.Abstractions;

[SecretStore("my-vault")]
public partial interface IMyVaultSecrets
{
    [Secret("db-connection-string")]
    string DatabaseConnection { get; }

    string ApiKey { get; } // Uses the property name "ApiKey" as the secret key
}
```

The `[Secret]` attribute is optional. When applied, it overrides the secret key to the specified value. When omitted,
the property name is used as the secret key.

### Register the typed secret store

The source generator produces a DI registration extension method named after your interface (e.g., `AddMyVaultSecrets()`).
Chain it after `AddDaprSecretsManagementClient()`:

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprSecretsManagementClient()
    .AddMyVaultSecrets();

var app = builder.Build();
```

### How it works

The source generator emits:

1. A concrete implementation of your interface that is backed by `DaprSecretsManagementClient.GetBulkSecretAsync`.
2. An `IHostedService` that pre-loads all mapped secrets at application startup.
3. A typed DI registration extension method on `IDaprSecretsManagementBuilder`.

Because secrets are loaded in bulk at startup, properties are synchronous and available immediately after host startup
without requiring callers to manage async flows.

### Consume the typed secrets

Once registered, inject your interface anywhere via standard dependency injection:

```cs
app.MapGet("/do-something", (IMyVaultSecrets secrets, IOtherSvc svc) =>
{
    var svcInstance = svc.Build(secrets.ApiKey);
    return svcInstnce.DoSomething();
});
```

## Testing your application

### Unit testing with the direct API

`DaprSecretsManagementClient` is an abstract class that provides a natural seam for mocking. You can mock it directly
in your unit tests:

```cs
var mockClient = new Mock<DaprSecretsManagementClient>();
mockClient
    .Setup(c => c.GetSecretAsync("my-vault", "db-password", null, It.IsAny<CancellationToken>()))
    .ReturnsAsync(new Dictionary<string, string> { { "db-password", "s3cr3t" } });
```

### Unit testing with the source generator

The generated implementation wraps a plain interface with get-only properties, so you can mock it directly:

```cs
var mockSecrets = new Mock<IMyVaultSecrets>();
mockSecrets.Setup(s => s.DatabaseConnection).Returns("Server=localhost;...");
mockSecrets.Setup(s => s.ApiKey).Returns("my-api-key");
```

### Integration testing

For integration tests, register via `AddDaprSecretsManagementClient()` and configure the builder to point at a
real or test sidecar. The generated `IHostedService` will pre-load secrets at startup using the real client, testing
the full end-to-end flow.
