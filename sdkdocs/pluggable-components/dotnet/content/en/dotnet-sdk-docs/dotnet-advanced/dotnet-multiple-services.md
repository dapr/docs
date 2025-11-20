---
type: docs
title: "Multiple services in a .NET Dapr pluggable component"
linkTitle: "Multiple services"
weight: 1000
description: How to expose multiple services from a .NET pluggable component
no_list: true
is_preview: true
---

A pluggable component can host multiple components of varying types. You might do this:
- To minimize the number of sidecars running in a cluster
- To group related components that are likely to share libraries and implementation, such as:
   - A database exposed both as a general state store, and
   - Output bindings that allow more specific operations.

Each Unix Domain Socket can manage calls to one component of each type. To host multiple components of the _same_ type, you can spread those types across multiple sockets. The SDK binds each socket to a "service", with each service composed of one or more component types.

## Registering multiple services

Each call to `RegisterService()` binds a socket to a set of registered components, where one of each type of component can be registered per service.

```csharp
var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "service-a",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<MyDatabaseStateStore>();
        serviceBuilder.RegisterBinding<MyDatabaseOutputBinding>();
    });

app.RegisterService(
    "service-b",
    serviceBuilder =>
    {
        serviceBuilder.RegisterStateStore<AnotherStateStore>();
    });

app.Run();

class MyDatabaseStateStore : IStateStore
{
    // ...
}

class MyDatabaseOutputBinding : IOutputBinding
{
    // ...
}

class AnotherStateStore : IStateStore
{
    // ...
}
```

## Configuring Multiple Components

Configuring Dapr to use the hosted components is the same as for any single component - the component YAML refers to the associated socket.

```yaml
#
# This component uses the state store associated with socket `state-store-a`
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-a
spec:
  type: state.service-a
  version: v1
  metadata: []
```

```yaml
#
# This component uses the state store associated with socket `state-store-b`
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-b
spec:
  type: state.service-b
  version: v1
  metadata: []
```

## Next steps

- [Learn more about the component lifetime]({{% ref "dotnet-component-lifetime" %}})
- [Learn more about the application environment]({{% ref "dotnet-application-environment" %}})
- Learn more about using the Pluggable Component .NET SDK for:
  - [Bindings]({{% ref "dotnet-bindings" %}})
  - [Pub/sub]({{% ref "dotnet-pub-sub" %}})
  - [State store]({{% ref "dotnet-state-store" %}})