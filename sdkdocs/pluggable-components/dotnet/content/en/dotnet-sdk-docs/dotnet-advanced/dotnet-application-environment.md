---
type: docs
title: "Application Environment of a .NET Dapr pluggable component"
linkTitle: "Application environment"
weight: 1000
description: How to configure the environment of a .NET pluggable component
no_list: true
is_preview: true
---

A .NET Dapr pluggable component application can be configured for dependency injection, logging, and configuration values similarly to ASP.NET applications.  The `DaprPluggableComponentsApplication` exposes a similar set of configuration properties to that exposed by `WebApplicationBuilder`.

## Dependency injection

Components registered with services can participate in dependency injection. Arguments in the components constructor will be injected during creation, assuming those types have been registered with the application. You can register them through the `IServiceCollection` exposed by `DaprPluggableComponentsApplication`.

```csharp
var app = DaprPluggableComponentsApplication.Create();

// Register MyService as the singleton implementation of IService.
app.Services.AddSingleton<IService, MyService>();

app.RegisterService(
    "<service name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();

interface IService
{
    // ...
}

class MyService : IService
{
    // ...
}

class MyStateStore : IStateStore
{
    // Inject IService on creation of the state store.
    public MyStateStore(IService service)
    {
        // ...
    }

    // ...
}
```

{{% alert title="Warning" color="warning" %}}
Use of `IServiceCollection.AddScoped()` is not recommended. Such instances' lifetimes are bound to a single gRPC method call, which does not match the lifetime of an individual component instance.
{{% /alert %}}

## Logging

.NET Dapr pluggable components can use the [standard .NET logging mechanisms](https://learn.microsoft.com/dotnet/core/extensions/logging). The `DaprPluggableComponentsApplication` exposes an `ILoggingBuilder`, through which it can be configured.

{{% alert title="Note" color="primary" %}}
Like with ASP.NET, logger services (for example, `ILogger<T>`) are pre-registered.
{{% /alert %}}

```csharp
var app = DaprPluggableComponentsApplication.Create();

// Reset the default loggers and setup new ones.
app.Logging.ClearProviders();
app.Logging.AddConsole();

app.RegisterService(
    "<service name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();

class MyStateStore : IStateStore
{
    // Inject a logger on creation of the state store.
    public MyStateStore(ILogger<MyStateStore> logger)
    {
        // ...
    }

    // ...
}
```

## Configuration Values

Since .NET pluggable components are built on ASP.NET, they can use its [standard configuration mechanisms](https://learn.microsoft.com/dotnet/core/extensions/configuration) and default to the same set of [pre-registered providers](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-6.0#default-application-configuration-sources). The `DaprPluggableComponentsApplication` exposes an `IConfigurationManager` through which it can be configured.

```csharp
var app = DaprPluggableComponentsApplication.Create();

// Reset the default configuration providers and add new ones.
((IConfigurationBuilder)app.Configuration).Sources.Clear();
app.Configuration.AddEnvironmentVariables();

// Get configuration value on startup.
const value = app.Configuration["<name>"];

app.RegisterService(
    "<service name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyStateStore>();
    });

app.Run();

class MyStateStore : IStateStore
{
    // Inject the configuration on creation of the state store.
    public MyStateStore(IConfiguration configuration)
    {
        // ...
    }

    // ...
}
```

## Next steps

- [Learn more about the component lifetime]({{% ref "dotnet-component-lifetime" %}})
- [Learn more about multiple services]({{% ref "dotnet-multiple-services" %}})
- Learn more about using the Pluggable Component .NET SDK for:
  - [Bindings]({{% ref "dotnet-bindings" %}})
  - [Pub/sub]({{% ref "dotnet-pub-sub" %}})
  - [State store]({{% ref "dotnet-state-store" %}})