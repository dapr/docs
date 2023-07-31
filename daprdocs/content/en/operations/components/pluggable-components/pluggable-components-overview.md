---
type: docs
title: "Pluggable components overview"
linkTitle: "Overview"
weight: 4400
description: "Overview of pluggable component anatomy and supported component types"
---

Pluggable components are components that are not included as part the runtime, as opposed to built-in ones that are included. You can configure Dapr to use pluggable components that leverage the building block APIs, but these are registered differently from the [built-in Dapr components](https://github.com/dapr/components-contrib). For example, you can configure a pluggable component for scenarios where you require a private component. 

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
| **How component is activated** | Dapr starts runs the component (automatic)                                                                          | User starts component (manual)                                                                                                                                                                                                                             |

## When to create a pluggable component

- This is a private component. 
- You want to keep your component separate from the Dapr release process.
- You are not as familiar with Go, or implementing your component in Go is not ideal.

## Implementing a pluggable component

In order to implement a pluggable component you need to implement a gRPC service in the component. Implementing the gRPC service requires three steps:

1. **Find the proto definition file.** Proto definitions are provided for each supported service interface (state store, pub/sub, bindings).

Currently, the following component APIs are supported:

- State stores
- Pub/sub
- Bindings


|  Component  |    Type    | gRPC definition  |                       Built-in Reference Implementation                        | Docs                                                                                                                                                                  |
| :---------: | :--------: | :--------------: | :----------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State Store |  `state`   |  [state.proto]   |  [Redis](https://github.com/dapr/components-contrib/tree/master/state/redis)   | [concept]({{<ref "state-management-overview">}}), [howto]({{<ref "howto-get-save-state">}}), [api spec]({{<ref "state_api">}})                                        |
|   Pub/sub   |  `pubsub`  |  [pubsub.proto]  |  [Redis](https://github.com/dapr/components-contrib/tree/master/pubsub/redis)  | [concept]({{<ref "pubsub-overview">}}), [howto]({{<ref "howto-publish-subscribe">}}), [api spec]({{<ref "pubsub_api">}})                                              |
|  Bindings   | `bindings` | [bindings.proto] | [Kafka](https://github.com/dapr/components-contrib/tree/master/bindings/kafka) | [concept]({{<ref "bindings-overview">}}), [input howto]({{<ref "howto-triggers">}}), [output howto]({{<ref "howto-bindings">}}), [api spec]({{<ref "bindings_api">}}) |

Here's a snippet of the gRPC service definition for pluggable component state stores ([state.proto]).

```protobuf
// StateStore service provides a gRPC interface for state store components.
service StateStore {
  // Initializes the state store component with the given metadata.
  rpc Init(InitRequest) returns (InitResponse) {}
  // Returns a list of implemented state store features.
  rpc Features(FeaturesRequest) returns (FeaturesResponse) {}
  // Ping the state store. Used for liveness purposes.
  rpc Ping(PingRequest) returns (PingResponse) {}
  
  // Deletes the specified key from the state store.
  rpc Delete(DeleteRequest) returns (DeleteResponse) {}
  // Get data from the given key.
  rpc Get(GetRequest) returns (GetResponse) {}
  // Sets the value of the specified key.
  rpc Set(SetRequest) returns (SetResponse) {}


  // Deletes many keys at once.
  rpc BulkDelete(BulkDeleteRequest) returns (BulkDeleteResponse) {}
  // Retrieves many keys at once.
  rpc BulkGet(BulkGetRequest) returns (BulkGetResponse) {}
  // Set the value of many keys at once.
  rpc BulkSet(BulkSetRequest) returns (BulkSetResponse) {}
}
```

The interface for the `StateStore` service exposes 9 methods:

- 2 methods for initialization and components capability advertisement (Init and Features)
- 1 method for health-ness or liveness check (Ping)
- 3 methods for CRUD (Get, Set, Delete)
- 3 methods for bulk CRUD operations (BulkGet, BulkSet, BulkDelete)

2. **Create service scaffolding.** Use [protocol buffers and gRPC tools](https://grpc.io) to create the necessary scaffolding for the service. You may want to get acquainted with [the gRPC concepts documentation](https://grpc.io/docs/what-is-grpc/core-concepts/).

The tools can generate code targeting [any gRPC-supported language](https://grpc.io/docs/what-is-grpc/introduction/#protocol-buffer-versions). This code  serves as the base for your server and it provides functionality to handle client calls along with infrastructure to decode incoming requests, execute service methods, and encode service responses.

The generated code is not complete. It is missing a concrete implementation for the methods your target service defines, i.e., the core of your pluggable component. This is further explored in the next topic. Additionally, you also have to provide code on how to handle Unix Socket Domain integration, which is Dapr specific, and code handling integration with your downstream services.

3. **Define the service.** Provide a concrete implementation of the desired service.

As a first step, [protocol buffers](https://developers.google.com/protocol-buffers/docs/overview) and [gRPC](https://grpc.io/docs/what-is-grpc/introduction/) tools are used to create the server code for this service. After that, the next step is to define concrete implementations for these 9 methods.

Each component has a gRPC service definition for its core functionality which is the same as the core component interface. For example:

- **State stores**
A pluggable state store **must** provide an implementation of the `StateStore` service interface. In addition to this core functionality, some components might also expose functionality under other **optional** services. For example, you can add extra functionality by defining the implementation for a `QueriableStateStore` service and a `TransactionalStateStore` service.

- **Pub/sub**
 Pluggable pub/sub components only have a single core service interface defined ([pubsub.proto]). They have no optional service interfaces.
 
- **Bindings**
 Pluggable input and output bindings have a single core service definition on [bindings.proto]. They have no optional service interfaces.

Following the State Store example from step 1, after generating its service scaffolding code using gRPC and protocol buffers tools (step 2), 
the next step is to define concrete implementations for the 9 methods defined under `service StateStore`, along with code to initialize and communicate with your dependencies.
This concrete implementation and auxiliary code are the core of your pluggable component: they define how your component behaves when handling gRPC requests from Dapr.

### Leveraging multiple building blocks for a component

In addition to implementing multiple gRPC services from the same component (for example `StateStore`, `QueriableStateStore`, `TransactionalStateStore` etc.), a pluggable component can also expose implementations for other component interfaces. This means that a single pluggable component can function as a state store, pub/sub, and input or output binding, all at the same time. In other words, you can implement multiple component interfaces into a pluggable component and exposes these as gRPC services.

While exposing multiple component interfaces on the same pluggable component lowers the operational burden of deploying multiple components, it makes implementing and debugging your component harder. If in doubt, stick to a "separation of concerns" by merging multiple components interfaces into the same pluggable component only when necessary.

## Operationalizing a pluggable component

Built-in components and pluggable components share one thing in common: both need a [component specification]({{<ref "components-concept.md#component-specification">}}). Built-in components do not require any extra steps to be used: Dapr is ready to use them automatically.

In contrast, pluggable components require additional steps before they can communicate with Dapr. You need to first run the component and facilitate Dapr-component communication to kick off the registration process.

## Next steps

- [Pluggable component registration]({{<ref "pluggable-components-registration">}})

[state.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/state.proto
[pubsub.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto
[bindings.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto
