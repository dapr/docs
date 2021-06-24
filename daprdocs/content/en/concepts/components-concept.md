---
type: docs
title: "Components"
linkTitle: "Components"
weight: 300
description: "Modular functionality used by building blocks and applications"
---

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition.  All of the components are pluggable so that you can swap out one component with the same interface for another. The [components contrib repo](https://github.com/dapr/components-contrib) is where you can contribute implementations for the component interfaces and extends Dapr's capabilities.

 A building block can use any combination of components. For example the [actors]({{<ref "actors-overview.md">}}) building block and the [state management]({{<ref "state-management-overview.md">}}) building block both use [state components](https://github.com/dapr/components-contrib/tree/master/state).  As another example, the [Pub/Sub]({{<ref "pubsub-overview.md">}}) building block uses [Pub/Sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

 You can get a list of current components available in the current hosting environment using the `dapr components` CLI command.

 The following are the component types provided by Dapr:

## State stores

State store components are data stores (databases, files, memory) that store key-value pairs as part of the [state management]({{< ref "state-management-overview.md" >}}) building block.

- [List of state stores]({{< ref supported-state-stores >}})
- [State store implementations](https://github.com/dapr/components-contrib/tree/master/state)

## Service discovery

Service discovery components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block to integrate with the hosting environment to provide service-to-service discovery. For example, the Kubernetes service discovery component integrates with the Kubernetes DNS service and self hosted uses mDNS.

- [Service discovery name resolution implementations](https://github.com/dapr/components-contrib/tree/master/nameresolution)

## Middleware

Dapr allows custom [middleware]({{<ref "middleware.md">}})  to be plugged into the request processing pipeline. Middleware can perform additional actions on a request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client. The middleware components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block.

- [Middleware implementations](https://github.com/dapr/components-contrib/tree/master/middleware)

## Pub/sub brokers

Pub/sub broker components are message brokers that can pass messages to/from services as part of the [publish & subscribe]({{< ref pubsub-overview.md >}}) building block.

- [List of pub/sub brokers]({{< ref supported-pubsub >}})
- [Pub/sub broker implementations](https://github.com/dapr/components-contrib/tree/master/pubsub)

## Bindings

External resources can connect to Dapr in order to trigger a service or be called from a service as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

- [List of supported bindings]({{< ref supported-bindings >}})
- [Binding implementations](https://github.com/dapr/components-contrib/tree/master/bindings)

## Secret stores

In Dapr, a [secret]({{<ref "secrets-overview.md">}}) is any piece of private information that you want to guard against unwanted users. Secrets stores are used to store secrets that can be retrieved and used in services.

- [List of supported secret stores]({{< ref supported-secret-stores >}})
- [Secret store implementations](https://github.com/dapr/components-contrib/tree/master/secretstores)
