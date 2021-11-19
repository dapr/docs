---
type: docs
title: "Building blocks"
linkTitle: "Building blocks"
weight: 200
description: "Modular best practices accessible over standard HTTP or gRPC APIs"
---

A [building block]({{< ref building-blocks >}}) is an HTTP or gRPC API that can be called from your code and uses one or more Dapr components.

Building blocks address common challenges in building resilient, microservices applications and codify best practices and patterns. Dapr consists of a set of building blocks, with extensibility to add new building blocks.

The diagram below shows how building blocks expose a public API that is called from your code, using components to implement the building blocks' capability.

<img src="/images/concepts-building-blocks.png" width=250>

The following are the building blocks provided by Dapr:

<img src="/images/building_blocks.png" width=1000>

| Building Block | Endpoint | Description |
|----------------|----------|-------------|
| [**Service-to-service invocation**]({{<ref "service-invocation-overview.md">}}) | `/v1.0/invoke` | Service invocation enables applications to communicate with each other through well-known endpoints in the form of http or gRPC messages. Dapr provides an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.
| [**State management**]({{<ref "state-management-overview.md">}}) | `/v1.0/state` | Application state is anything an application wants to preserve beyond a single session. Dapr provides a key/value-based state API with pluggable state stores for persistence.
| [**Publish and subscribe**]({{<ref "pubsub-overview.md">}}) | `/v1.0/publish` `/v1.0/subscribe`|  Pub/Sub is a loosely coupled messaging pattern where senders (or publishers) publishes messages to a topic, to which subscribers subscribe. Dapr supports the pub/sub pattern between applications.
| [**Resource bindings**]({{<ref "bindings-overview.md">}}) | `/v1.0/bindings` | A binding provides a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the  Dapr binding API, and it allows your application to be triggered by events sent by the connected service.
| [**Actors**]({{<ref "actors-overview.md">}}) | `/v1.0/actors` |  An actor is an isolated, independent unit of compute and state with single-threaded execution. Dapr provides an actor implementation based on the Virtual Actor pattern which provides a single-threaded programming model and where actors are garbage collected when not in use.
| [**Observability**]({{<ref "observability-concept.md">}}) | `N/A` |  Dapr system components and runtime emit metrics, logs, and traces to debug, operate and monitor Dapr system services, components and user applications.
| [**Secrets**]({{<ref "secrets-overview.md">}}) | `/v1.0/secrets` | Dapr provides a secrets building block API and integrates with secret stores such as Hashicorp valut, local files, Azure Key Vault and Kubernetes to store the secrets. Services can call the secrets API to retrieve secrets, for example to get a connection string to a database.
| [**Configuration**]({{<ref "app-configuration-overview.md">}}) | `/v1.0/configuration` | Dapr provides a Configuration API that enables you to retrieve and subscribe to application configuration items for Dapr supported configuration stores. This enables an application to set specific configuration information for example at start up or when configuration changes are made in the stores. 
