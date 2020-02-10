# Dapr concepts

This directory contains Dapr concepts. The goal of these documents provide an understanding of the key concepts used in the Dapr documentation and the [Dapr spec](../reference/api/README.md).

## Building blocks

A [building block](./architecture/building_blocks.md) is as an Http or gRPC API that can be called from user code and uses one or more Dapr components. Dapr consists of a set of building blocks, with extensibility to add new building blocks.

The diagram below shows how building blocks expose a public API that is called from your code, using components to implement the building blocks capability.
  
![Dapr Building Blocks and Components](../images/concepts-building-blocks.png)
  
The following are the building blocks provided by Dapr:

* [**Resource Bindings**](./bindings/README.md)

  A binding provides a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the  Dapr binding API, and it allows your application to be triggered by events sent by the connected service.

* [**Distributed Tracing**](./distributed-tracing/README.md)

  Distributed tracing collects and aggregates trace events, metrics and performance numbers between Dapr instances. It allows you to trace the entire call chain across multiple services, or see call metrics on a user service. Dapr currently integrates with  [Open Census](https://opencensus.io/) and when ready [OpenTelemetry](https://opentelemetry.io/) for distributed tracing and metrics collection.

* [**Publish/Subscribe Messaging**](./publish-subscribe-messaging/README.md)
  
  Pub/Sub is a loosely coupled messaging pattern where senders (or publishers) publishes messages to a topic, to which subscribers subscribe. Dapr supports the pub/sub pattern between applications.

* [**Service Invocation**](./service-invocation/service-invocation.md)
  
  Service invocation enables applications to communicate with each other through well-known endpoints in the form of http or gRPC messages. Dapr provides an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.

* [**State Management**](./state-management/state-management.md)

  Application state is anything an application wants to preserve beyond a single session. Dapr provides a key/value-based state API with pluggable state stores for persistence.

* [**Actors**](./actor/actor_overview.md)

  An actor is an isolated, independent unit of compute and state with single-threaded execution. Dapr provides an actor implementation based on the Virtual Actor pattern which provides a single-threaded programming model and where actors are garbage collected when not in use.
  * [Actor Overview](./actor/actor_overview.md)
  * [Actor Features](./actor/actors_features.md)

## Components
 
Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition.  All of the components are pluggable so that you can swap out one component with the same interface for another. The [components contrib repo](https://github.com/dapr/components-contrib) is where you can contribute implementations for the component interfaces and extends Dapr's capabilities.
  
 A building block can use any combination of components. For example the [actors](./actor/actor_overview.md) building block and the state management building block both use state  components.  As another example, the pub/sub building block uses [pub/sub](./publish-subscribe-messaging/README.md) components.

 You can get a list of current components available in the current hosting environment using the `dapr components` CLI command.

 The following are the component types provided by Dapr:

* Bindings
* Tracing exporters
* Middleware
* Pub/sub
* Secret store
* Service discovery
* State

## Configuration

Dapr [Configuration](./configuration/README.md) defines a policy that affects how any Dapr sidecar instance behaves, such as using [distributed tracing](distributed-tracing/README.md) or a [custom pipeline](middleware/middleware.md). Configuration can be applied to Dapr sidecar instances dynamically.

 You can get a list of current configurations available in the current the hosting environment using the `dapr configuration` CLI command.

## Middleware

Dapr allows custom [**middleware**](./middleware/middleware.md) to be plugged into the request processing pipeline. Middleware are components. Middleware can perform additional actions on a request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client.
  
## Secrets

In Dapr, a [**Secret**](./components/secrets.md) is any piece of private information that you want to guard against unwanted users. Dapr offers a simple secret API and integrates with secret stores such as Azure Key Vault and Kubernetes secret stores to store the secrets. Secretstores, used to store secrets, are Dapr components.

## Hosting environments

Dapr can run on multiple hosting platforms. The supported hosting platforms are:

* [**Self hosted**](../overview.md#running-dapr-on-a-local-developer-machine-in-standalone-mode). Dapr runs on a single machine either as a process or in a container. Used for local development or running on a single machine execution 
* [**Kubernetes**](../overview.md#running-dapr-in-kubernetes-mode). Dapr runs on any Kubernetes cluster either from a cloud provider or on-premises.
