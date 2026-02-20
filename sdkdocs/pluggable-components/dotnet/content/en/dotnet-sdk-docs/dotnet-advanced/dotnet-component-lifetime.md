---
type: docs
title: "Lifetimes of .NET Dapr pluggable components"
linkTitle: "Component lifetime"
weight: 1000
description: How to control the lifetime of a .NET pluggable component
no_list: true
is_preview: true
---

There are two ways to register a component:

 - The component operates as a singleton, with lifetime managed by the SDK
 - A component's lifetime is determined by the pluggable component and can be multi-instance or a singleton, as needed

## Singleton components

Components registered _by type_ are singletons: one instance will serve all configured components of that type associated with that socket. This approach is best when only a single component of that type exists and is shared amongst Dapr applications.

```csharp
var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "service-a",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<SingletonStateStore>();
    });

app.Run();

class SingletonStateStore : IStateStore
{
    // ...
}
```

## Multi-instance components

Components can be registered by passing a "factory method". This method will be called for each configured component of that type associated with that socket. The method returns the instance to associate with that component (whether shared or not). This approach is best when multiple components of the same type may be configured with different sets of metadata, when component operations need to be isolated from one another, etc.

The factory method will be passed context, such as the ID of the configured Dapr component, that can be used to differentiate component instances.

```csharp
var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "service-a",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore(
            context =>
            {
                return new MultiStateStore(context.InstanceId);
            });
    });

app.Run();

class MultiStateStore : IStateStore
{
    private readonly string instanceId;

    public MultiStateStore(string instanceId)
    {
        this.instanceId = instanceId;
    }

    // ...
}
```

## Next steps

- [Learn more about the application environment]({{% ref "dotnet-application-environment" %}})
- [Learn more about multiple services]({{% ref "dotnet-multiple-services" %}})
- Learn more about using the Pluggable Component .NET SDK for:
  - [Bindings]({{% ref "dotnet-bindings" %}})
  - [Pub/sub]({{% ref "dotnet-pub-sub" %}})
  - [State store]({{% ref "dotnet-state-store" %}})