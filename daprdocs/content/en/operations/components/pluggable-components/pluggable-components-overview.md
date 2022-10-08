---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 4500
description: "Anatomy and supported types"
---

With pluggable components, you can configure Dapr to use components that are not natively supported by the runtime. These components leverage existing Dapr building block APIs, but are configured differently from [community-maintained built-in Dapr components](https://github.com/dapr/components-contrib).

<img src="/images/concepts-building-blocks.png" width=400>

## Pluggable components vs. Built-in components

Dapr provides two pathways for creating new components:

 - The pluggable component route
 - The built-in components route found in the [components-contrib repository ](https://github.com/dapr/components-contrib). 
 
While both component options leverage Dapr's building block APIs, each have different implementation processes.

| Component details            | [Built-in Component](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)  | Pluggable Components                                                                                                                                                                                                                                        |
| ---------------------------- | :--------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language**                 | Can only be written in Go                                                                                  | [Can be written in any gRPC-supported language](https://grpc.io/docs/what-is-grpc/introduction/#:~:text=Protocol%20buffer%20versions,-While%20protocol%20buffers&text=Proto3%20is%20currently%20available%20in,with%20more%20languages%20in%20development.) |
| **Where it runs**            | As part of the Dapr executable itself                                                                      | As distinct process, container or pod. Runs seperate from Dapr itself                                                                                                                                                                                       |
| **Integration with Dapr**    | Integrated directly into Dapr codebase                                                                     | Integrates with Dapr via Unix Domain Sockets (using gRPC )                                                                                                                                                                                                  |
| **Hosting**                  | Hosted in Dapr repository                                                                                  | Hosted in your own repository                                                                                                                                                                                                                               |
| **Distribution**             | Distributed with Dapr release (i.e., new features added to component need to be aligned with Dapr releases | Distributed independently from Dapr itself (i.e., new features can be added _whenever_ and follow your release cycle).                                                                                                                                      |
| **How component is started** | Dapr starts component (automatic)                                                                          | User starts component (manual)                                                                                                                                                                                                                              |

## When to create a pluggable component

- There are homegrown components you want to use with Dapr APIs and those homegrown cannot be contributed to the project.
- You want to keep your component seperate from the Dapr release process.
- You are not as familiar with Go, or implementing your component in Go is not ideal.

## Supported component types

Pluggable components is a **preview feature**. Currently, only State Stores (type `state`), PubSub (type `pubsub`) and Bindings (type `bindings`) are supported. Read more about [preview features
]({{< ref "support-preview-features.md" >}})

|  Component  |    Type    | gRPC definition  |                       Built-in Reference Implementation                        | Docs                                                                                                                                                                  |
| :---------: | :--------: | :--------------: | :----------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State Store |  `state`   |  [state.proto]   |  [Redis](https://github.com/dapr/components-contrib/tree/master/state/redis)   | [concept]({{<ref "state-management-overview">}}), [howto]({{<ref "howto-get-save-state">}}), [api spec]({{<ref "state_api">}})                                        |
|   PubSub    |  `pubsub`  |  [pubsub.proto]  |  [Redis](https://github.com/dapr/components-contrib/tree/master/pubsub/redis)  | [concept]({{<ref "pubsub-overview">}}), [howto]({{<ref "howto-publish-subscribe">}}), [api spec]({{<ref "pubsub_api">}})                                              |
|  Bindings   | `bindings` | [bindings.proto] | [Kafka](https://github.com/dapr/components-contrib/tree/master/bindings/kafka) | [concept]({{<ref "bindings-overview">}}), [input howto]({{<ref "howto-triggers">}}), [output howto]({{<ref "howto-bindings">}}), [api spec]({{<ref "bindings_api">}}) |

## Anatomy of a pluggable component

At high level, a pluggable component is a server that implements and exposes one or more of the gRPC service interfaces defined in the provided [gRPC protobuf files](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1).

#### Implementing a gRPC service requires three main steps:

1. **Find the proto definition file.** Proto definitions are provided for each supported service interface (state store, pubsub, bindings).
2. **Create service scaffolding.** Use [protocol buffers and gRPC tools](https://grpc.io) to create the necessary scaffolding for the service. We recomend for the reader to get acquaited with [gRPC concepts by reading its documentation](https://grpc.io/docs/what-is-grpc/core-concepts/).
3. **Define the service**. Provide a concrete implementation of the desired service.

Here's an example of a gRPC service definition file used to create a pluggable component state store ([state.proto]).

```protobuf=
// StateStore service provides a gRPC interface for state store components.
service StateStore {
  // Initializes the state store component with the given metadata.
  rpc Init(InitRequest) returns (InitResponse) {}
  // Returns a list of implemented state store features.
  rpc Features(FeaturesRequest) returns (FeaturesResponse) {}
  // Deletes the specified key from the state store.
  rpc Delete(DeleteRequest) returns (DeleteResponse) {}
  // Get data from the given key.
  rpc Get(GetRequest) returns (GetResponse) {}
  // Sets the value of the specified key.
  rpc Set(SetRequest) returns (SetResponse) {}
  // Ping the state store. Used for liveness porpuses.
  rpc Ping(PingRequest) returns (PingResponse) {}

  // Deletes many keys at once.
  rpc BulkDelete(BulkDeleteRequest) returns (BulkDeleteResponse) {}
  // Retrieves many keys at once.
  rpc BulkGet(BulkGetRequest) returns (BulkGetResponse) {}
  // Set the value of many keys at once.
  rpc BulkSet(BulkSetRequest) returns (BulkSetResponse) {}
}
```

The interface for the `StateStore` service exposes 9 methods:

- 2 methods for initialization and components capability advertisement,
- 3 methods for CRUD, healthness or liveness check
- 3 methods for bulk operations.

As a first step, protocol buffers tools are used to create the server code for this service. After that, the next step is to define concrete implementations for these 9 methods.

Each component has a service definition for its core functionality. For instance, every pluggable State Store **must** provide a implementation for its `StateStore` service interface. In addition to this core functionality, some components might also expose additional functionality under other **optinal** services. For State Stores, there's also an option to add additional functionality by defining the implementation for a `QueriableStateStore` service and for a `TransactionalStateStore` service.

PubSub components, for instance, only have a single core service interface defined [pubsub.proto]. They have no optional service interface. The same applies for Input Bindings and Output Bindings components: both have a single core service definition on [bindings.proto].

### Leveraging multiple building blocks for a component

In addition to implementing multiple gRPC services from the same component (e.g., `StateStore`, `QueriableStateStore`, `TransactionalStateStore` etc.), a single pluggable component can also expose implementations for other types of components. This means that a single pluggable component can function as a state Store, pubsub, and input or output binding, all at the same time.

Having multiple building blocks behind the same pluggable component is a path to lower the operational burdern of deploying and operationalizing multiple components. On the other hand, it will make implementing and debugging your component harder. If in doubt, we suggest sticking to a separation of concerns strategy and merging multiple components under the same pluggable component only when striclty needed.

## Operationalizing a pluggable component

One aspect in which built-in components and pluggable components diverge is in the operational work required to use each of them.
Aside from providing a [Component specification]({{<ref "components-concept.md#component-specification">}}), built-in components do not require any extra steps to be used and Dapr starts them automatically.

In contrast, pluggable components require additional steps before they can communicate with Dapr. The component needs first needs to be started before Dapr and facilitate Dapr-Component communication this process is called Service Discovery.

## Next steps

- [Pluggable Component Service Discovery]({{<ref "pluggable-components-discovery">}})

[state.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/state.proto
[pubsub.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto
[bindings.proto]: https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto
