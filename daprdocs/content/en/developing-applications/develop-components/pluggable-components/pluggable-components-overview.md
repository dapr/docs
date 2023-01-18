---
type: docs
title: "Pluggable components overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of pluggable component anatomy and supported component types"
---

Pluggable components are components that are not included as part the runtime, as opposed to the built-in components included with `dapr init`. You can configure Dapr to use pluggable components that leverage the building block APIs, but are registered differently from the [built-in Dapr components](https://github.com/dapr/components-contrib). 

<img src="/images/concepts-building-blocks.png" width=400>

## Pluggable components vs. built-in components

Dapr provides two approaches for registering and creating components:

- The built-in components included in the runtime and found in the [components-contrib repository ](https://github.com/dapr/components-contrib).
- Pluggable components which are deployed and registered independently. 

While both registration options leverage Dapr's building block APIs, each has a different implementation processes.

| Component details            | [Built-in Component](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)  | Pluggable Components                                                                                                                                                                                                                                       |
| ---------------------------- | :--------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language**                 | Can only be written in Go                                                                                  | [Can be written in any gRPC-supported language](https://grpc.io/docs/what-is-grpc/introduction/#protocol-buffer-versions) |
| **Where it runs**            | As part of the Dapr runtime executable                                                                      | As a distinct process or container in a pod. Runs separate from Dapr itself.                                                                                                                                                                                      |
| **Registers with Dapr**    | Included into the Dapr codebase                                                                     | Registers with Dapr via Unix Domain Sockets (using gRPC )                                                                                                                                                                                                 |
| **Distribution**             | Distributed with Dapr release. New features added to component are aligned with Dapr releases | Distributed independently from Dapr itself. New features can be added when needed and follows its own release cycle.                                                                                                                                 |
| **How component is activated** | Dapr starts runs the component (automatic)                                                                          | User starts component (manual)                                                                                                                                                                                                                          |

## Why create a pluggable component?

Pluggable components prove useful in scenarios where: 

- You require a private component. 
- You want to keep your component separate from the Dapr release process.
- You are not as familiar with Go, or implementing your component in Go is not ideal.

## Features

### Implement a pluggable component

In order to implement a pluggable component, you need to implement a gRPC service in the component. Implementing the gRPC service requires three steps:

1. Find the proto definition file
1. Create service scaffolding
1. Define the service

Learn more about [how to develop and implement a pluggable component]({{< ref develop-pluggable.md >}})

### Leverage multiple building blocks for a component

In addition to implementing multiple gRPC services from the same component (for example `StateStore`, `QueriableStateStore`, `TransactionalStateStore` etc.), a pluggable component can also expose implementations for other component interfaces. This means that a single pluggable component can simultaneously function as a state store, pub/sub, and input or output binding. In other words, you can implement multiple component interfaces into a pluggable component and expose them as gRPC services.

While exposing multiple component interfaces on the same pluggable component lowers the operational burden of deploying multiple components, it makes implementing and debugging your component harder. If in doubt, stick to a "separation of concerns" by merging multiple components interfaces into the same pluggable component only when necessary.

## Operationalize a pluggable component

Built-in components and pluggable components share one thing in common: both need a [component specification]({{< ref "components-concept.md#component-specification" >}}). Built-in components do not require any extra steps to be used: Dapr is ready to use them automatically.

In contrast, pluggable components require additional steps before they can communicate with Dapr. You need to first run the component and facilitate Dapr-component communication to kick off the registration process.

## Next steps

- [Implement a pluggable component]({{< ref develop-pluggable.md >}})
- [Pluggable component registration]({{< ref "pluggable-components-registration" >}})

[state.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/state.proto
[pubsub.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto
[bindings.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto
