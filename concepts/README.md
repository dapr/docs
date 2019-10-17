# Dapr concepts

This directory contains various Dapr concepts. The goal of these documents is to expand your knowledge on the [Dapr spec](../reference/api/README.md).

## Core Concepts

* [**Bindings**](./bindings/Readme.md)
  
  A binding provides defines a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the standard Dapr binding API, and it allows your application to be triggered by events sent by the connected service.

* [**Building blocks**](./architecture/building_blocks.md)

  A building block is a single-purposed API surface backed by one or more Dapr components. Dapr consists of a set of building blocks, with extensibility to add new building blocks.

* **Components**
  
  Dapr uses a modular design, in which functionalities are grouped and delivered by a number of *components*, such as  [pub-sub](./publish-subscribe-messaging/Readme.md) and [secrets](./state-management/state-management.md). Many of the components are pluggable so that you can swap out the default implemenation with your custom implementations. 

* [**Distributed Tracing**](./tracing-logging/tracing-logging.md)

  Distirbuted tracing collects and aggregates trace events by transactions. It allows you to trace the entire call chain across multiple services. Dapr integrates with [OpenTelemetry](https://opentelemetry.io/) for distributed tracing and metrics collection. 

* [**Pub-sub**](./publish-subscribe-messaging/pub-sub-messaging.md)
  
  Pub-sub is a loosely coupled messaging pattern where senders (or publishers) publishes messages to a topic, to which subscribers subscribe. Dapr natively supports the pub-sub pattern.

* [**Secrets**](./components/secrets.md)

  In Dapr, a secret is any piece of private information that you want to guard against unwanted users. Dapr offers a simple secret API and integrates with secret stores such as Azure Key Vault and Kubernetes secret stores to store the secrets.

* [**State**](./state-management/state-management.md)

  Application state is anything an application wants to perserve beyound a single session. Dapr allows pluggable state stores behind a key/value-based state API.

## Actors

* [Overview](./actor/actor_overview.md)
* [Features](./actor/actors_features.md)

## Extensibility

* [Components Contrib](https://github.com/dapr/components-contrib)
