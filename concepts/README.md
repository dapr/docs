# Dapr concepts

This directory contains various Dapr concepts. The goal of these documents is to expand your knowledge on the [Dapr spec](../reference/api/README.md).

## Core Concepts

* [**Bindings**](./bindings/README.md)

  A binding provides a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the standard Dapr binding API, and it allows your application to be triggered by events sent by the connected service.

* [**Building blocks**](./architecture/building_blocks.md)

  A building block is a single-purposed API surface backed by one or more Dapr components. Dapr consists of a set of building blocks, with extensibility to add new building blocks.

* **Components**
  
  Dapr uses a modular design, in which functionalities are grouped and delivered by a number of *components*, such as  [pub/sub](./publish-subscribe-messaging/README.md) and [secrets](./components/secrets.md). Many of the components are pluggable so that you can swap out the default implementation with your custom implementations. 

* [**Configuration**](./configuration/README.md)

  Dapr configuration defines a policy that affects how a Dapr sidecar hebavies, such as [distributed tracing](distributed-tracing/README.md) and [custom pipeline](middleware/middleware.md).

* [**Distributed Tracing**](./distributed-tracing/README.md)

  Distributed tracing collects and aggregates trace events by transactions. It allows you to trace the entire call chain across multiple services. Dapr integrates with [OpenTelemetry](https://opentelemetry.io/) for distributed tracing and metrics collection. 

* [**Middleware**](./middleware/middleware.md)
  
  Dapr allows custom middleware to be plugged into the request processing pipeline. Middleware can perform additional actions on a request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client.

* [**Publish/Subscribe Messaging**](./publish-subscribe-messaging/README.md)
  
  Pub/Sub is a loosely coupled messaging pattern where senders (or publishers) publishes messages to a topic, to which subscribers subscribe. Dapr natively supports the pub/sub pattern.

* [**Secrets**](./components/secrets.md)

  In Dapr, a secret is any piece of private information that you want to guard against unwanted users. Dapr offers a simple secret API and integrates with secret stores such as Azure Key Vault and Kubernetes secret stores to store the secrets.

* [**Service Invocation**](./service-invocation/service-invocation.md)
  
  Service invocation enables applications to communicate with each other through well-known endpoints in the form of http or gRPC messages. Dapr provides an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.

* [**State**](./state-management/state-management.md)

  Application state is anything an application wants to preserve beyond a single session. Dapr allows pluggable state stores behind a key/value-based state API.

## Actors

* [Overview](./actor/actor_overview.md)
* [Features](./actor/actors_features.md)

## Extensibility

* [Components Contrib](https://github.com/dapr/components-contrib)
