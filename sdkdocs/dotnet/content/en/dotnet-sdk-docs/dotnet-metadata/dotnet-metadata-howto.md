---
type: docs
title: "How to: Retrieve Dapr runtime metadata with the .NET SDK"
linkTitle: "How to: Retrieve runtime metadata"
weight: 54010
description: Learn how to retrieve Dapr runtime metadata using the Dapr Metadata .NET SDK
---

Let's walk through how to retrieve Dapr runtime metadata using the `Dapr.Metadata` package. The package registers a
hosted service that retrieves metadata from the Dapr sidecar during application startup, then exposes the typed
`DaprMetadata` value through the .NET options pattern. In this guide, you will:

- Install and register the Dapr Metadata .NET SDK
- Inject metadata through `IOptions<DaprMetadata>`, `IOptionsSnapshot<DaprMetadata>`, or `IOptionsMonitor<DaprMetadata>`
- Read runtime metadata, component metadata, subscriptions, actors, workflow, scheduler, and app connection details
- Configure the Dapr HTTP endpoint and API token used to retrieve metadata

## Prerequisites
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), or
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) installed
- [Dapr.Metadata](https://www.nuget.org/packages/Dapr.Metadata) NuGet package installed to your project

## Install the package

Install the Dapr Metadata package:

```sh
dotnet add package Dapr.Metadata
```

## Register Dapr Metadata with dependency injection

Register the metadata service during application startup with `AddDaprMetadata()`:

```csharp
using Dapr.Metadata.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprMetadata();

var app = builder.Build();
```

The registration adds the metadata options type and an internal hosted service that retrieves metadata from the Dapr
runtime when the application starts.

## Inject metadata with the options pattern

The `Dapr.Metadata` package exposes runtime metadata as `DaprMetadata` through the .NET options pattern. Choose the
options interface that matches the lifetime of the service consuming the metadata.

### Use `IOptions<DaprMetadata>`

Use `IOptions<DaprMetadata>` when a singleton-style view of the metadata is sufficient:

```csharp
using Dapr.Metadata.Abstractions;
using Microsoft.Extensions.Options;

public sealed class MetadataReporter(IOptions<DaprMetadata> metadata)
{
    public void PrintRuntimeDetails()
    {
        var value = metadata.Value;

        Console.WriteLine($"App ID: {value.AppId}");
        Console.WriteLine($"Runtime version: {value.RuntimeVersion}");
    }
}
```

### Use `IOptionsSnapshot<DaprMetadata>`

Use `IOptionsSnapshot<DaprMetadata>` in scoped services, such as request handlers or MVC controllers:

```csharp
using Dapr.Metadata.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

[ApiController]
[Route("metadata")]
public sealed class MetadataController(IOptionsSnapshot<DaprMetadata> metadata) : ControllerBase
{
    [HttpGet("components")]
    public IActionResult GetComponents()
    {
        var components = metadata.Value.Components.Select(component => new
        {
            component.Name,
            component.Type,
            component.Version,
            component.Capabilities
        });

        return Ok(components);
    }
}
```

### Use `IOptionsMonitor<DaprMetadata>`

Use `IOptionsMonitor<DaprMetadata>` when your application uses configuration hot reload, or when you want to ensure
the consumer reads the latest metadata values in case they have changed since application startup. This is the preferred
approach when freshness matters, with the tradeoff that retrieving the current value can introduce a brief delay while
the metadata value is loaded:

```csharp
using Dapr.Metadata.Abstractions;
using Microsoft.Extensions.Options;

public sealed class ComponentHealthReporter(IOptionsMonitor<DaprMetadata> metadata)
{
    public IReadOnlyCollection<string> GetLoadedComponentNames()
    {
        return metadata.CurrentValue.Components
            .Select(component => component.Name)
            .OfType<string>()
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToArray();
    }
}
```

## Read metadata values

The `DaprMetadata` type represents the response from the Dapr runtime metadata endpoint.

| Property | Description |
| -------- | ----------- |
| `AppId` | The application ID registered with Dapr. |
| `RuntimeVersion` | The Dapr runtime version. |
| `EnabledFeatures` | Named features enabled by Dapr configuration. |
| `Actors` | Registered actor types and counts. |
| `CustomAttributes` | Custom metadata attributes exposed by the runtime. |
| `Components` | Loaded component names, types, versions, and capabilities. |
| `HttpEndpoints` | Registered HTTP endpoint metadata. |
| `Subscriptions` | Pub/sub subscription metadata, including rules and dead letter topics. |
| `AppConnectionProperties` | App port, protocol, channel address, max concurrency, and health probe settings. |
| `SchedulerMetadata` | Connected scheduler host addresses. |
| `Workflows` | Workflow runtime metadata, including connected worker count. |

For example, you can inspect subscriptions and app connection properties:

```csharp
using Dapr.Metadata.Abstractions;
using Microsoft.Extensions.Options;

public sealed class RuntimeMetadataService(IOptions<DaprMetadata> metadata)
{
    public void PrintSubscriptions()
    {
        foreach (var subscription in metadata.Value.Subscriptions)
        {
            Console.WriteLine($"{subscription.PubSubName}: {subscription.Topic} ({subscription.Type})");

            foreach (var rule in subscription.Rules)
            {
                Console.WriteLine($"  {rule.Match} -> {rule.Path}");
            }
        }
    }

    public void PrintAppConnection()
    {
        var appConnection = metadata.Value.AppConnectionProperties;

        Console.WriteLine($"Protocol: {appConnection.Protocol}");
        Console.WriteLine($"Address: {appConnection.ChannelAddress}:{appConnection.Port}");
        Console.WriteLine($"Max concurrency: {appConnection.MaxConcurrency}");
        Console.WriteLine($"Health path: {appConnection.Health?.HealthCheckPath}");
    }
}
```

## Configure the Dapr endpoint

The metadata service retrieves metadata from the Dapr HTTP endpoint. By default, it uses the same Dapr configuration
values used by other .NET SDK clients:

| Key | Description |
| --- | ----------- |
| `DAPR_HTTP_ENDPOINT` | The HTTP endpoint for the Dapr sidecar. |
| `DAPR_HTTP_PORT` | The HTTP port for the local Dapr sidecar when `DAPR_HTTP_ENDPOINT` is not set. |
| `DAPR_API_TOKEN` | The API token for authenticating with the Dapr sidecar. |

These values can come from environment variables or any registered `IConfiguration` source.

### Configuration via `ConfigurationBuilder`

```csharp
using Dapr.Metadata.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["DAPR_HTTP_ENDPOINT"] = "http://localhost:3500",
    ["DAPR_API_TOKEN"] = "abc123"
});

builder.Services.AddDaprMetadata();
```

### Configuration via environment variables

Application settings can be accessed from environment variables available to your application.

| Key | Value |
| --- | ----- |
| `DAPR_HTTP_ENDPOINT` | `http://localhost:3500` |
| `DAPR_API_TOKEN` | `abc123` |

```csharp
using Dapr.Metadata.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddDaprMetadata();
```

### Configuration via prefixed environment variables

In shared-host scenarios, you can source prefixed environment variables into `IConfiguration` and register metadata
normally:

| Key | Value |
| --- | ----- |
| `myapp_DAPR_HTTP_ENDPOINT` | `http://localhost:3500` |
| `myapp_DAPR_API_TOKEN` | `abc123` |

```csharp
using Dapr.Metadata.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables(prefix: "myapp_");
builder.Services.AddDaprMetadata();
```

## Run locally

Start the application with a Dapr sidecar. The sidecar HTTP port must match your configured endpoint or port:

```sh
dapr run --app-id metadata-example --dapr-http-port 3500 -- dotnet run
```

> Dapr listens for HTTP requests at `http://localhost:3500`.

When the application starts, the metadata service retrieves metadata from the sidecar and makes the typed value available
through the registered options interfaces.
