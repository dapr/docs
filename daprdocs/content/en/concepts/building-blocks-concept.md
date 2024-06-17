---
type: docs
title: "Building blocks"
linkTitle: "Building blocks"
weight: 200
description: "Modular best practices accessible over standard HTTP or gRPC APIs"
---

A [building block]({{< ref building-blocks >}}) is an HTTP or gRPC API that can be called from your code and uses one or more Dapr components. Dapr consists of a set of API building blocks, with extensibility to add new building blocks. Dapr's building blocks:
- Address common challenges in building resilient, microservices applications 
- Codify best practices and patterns

The diagram below shows how building blocks expose a public API that is called from your code, using components to implement the building blocks' capability.

<img src="/images/concepts-building-blocks.png" width=250>

Dapr provides the following building blocks:

<img src="/images/building_blocks.png" width=1200>

| Building Block | Endpoint | Description |
|----------------|----------|-------------|
| [**Service-to-service invocation**]({{< ref "service-invocation-overview.md" >}}) | `/v1.0/invoke` | Service invocation enables applications to communicate with each other through well-known endpoints in the form of http or gRPC messages. Dapr provides an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.
| [**Publish and subscribe**]({{< ref "pubsub-overview.md" >}}) | `/v1.0/publish` `/v1.0/subscribe`|  Pub/Sub is a loosely coupled messaging pattern where senders (or publishers) publish messages to a topic, to which subscribers subscribe. Dapr supports the pub/sub pattern between applications.
| [**Workflows**]({{< ref "workflow-overview.md" >}}) | `/v1.0-beta1/workflow` | The Workflow API enables you to define long running, persistent processes or data flows that span multiple microservices using Dapr workflows or workflow components. The Workflow API can be combined with other Dapr API building blocks. For example, a workflow can call another service with service invocation or retrieve secrets, providing flexibility and portability. 
| [**State management**]({{< ref "state-management-overview.md" >}}) | `/v1.0/state` | Application state is anything an application wants to preserve beyond a single session. Dapr provides a key/value-based state and query APIs with pluggable state stores for persistence.
| [**Bindings**]({{< ref "bindings-overview.md" >}}) | `/v1.0/bindings` | A binding provides a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the  Dapr binding API, and it allows your application to be triggered by events sent by the connected service.
| [**Actors**]({{< ref "actors-overview.md" >}}) | `/v1.0/actors` |  An actor is an isolated, independent unit of compute and state with single-threaded execution. Dapr provides an actor implementation based on the virtual actor pattern which provides a single-threaded programming model and where actors are garbage collected when not in use.
| [**Secrets**]({{< ref "secrets-overview.md" >}}) | `/v1.0/secrets` | Dapr provides a secrets building block API and integrates with secret stores such as public cloud stores, local stores and Kubernetes to store the secrets. Services can call the secrets API to retrieve secrets, for example to get a connection string to a database.
| [**Configuration**]({{< ref "configuration-api-overview.md" >}}) | `/v1.0/configuration` | The Configuration API enables you to retrieve and subscribe to application configuration items for supported configuration stores. This enables an application to retrieve specific configuration information, for example, at start up or when configuration changes are made in the store. 
| [**Distributed lock**]({{< ref "distributed-lock-api-overview.md" >}}) | `/v1.0-alpha1/lock` | The distributed lock API enables you to take a lock on a resource so that multiple instances of an application can access the resource without conflicts and provide consistency guarantees.  
| [**Cryptography**]({{< ref "cryptography-overview.md" >}}) | `/v1.0-alpha1/crypto` | The Cryptography API enables you to perform cryptographic operations, such as encrypting and decrypting messages, without exposing keys to your application.