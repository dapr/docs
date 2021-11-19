---
type: docs
title: "Components"
linkTitle: "Components"
weight: 300
description: "Modular functionality used by building blocks and applications"
---

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition.  All of the components are pluggable so that you can swap out one component with the same interface for another. The [components contrib repository](https://github.com/dapr/components-contrib) is where you can contribute implementations for the component interfaces and extend Dapr's capabilities.

 A building block can use any combination of components. For example the [actors]({{<ref "actors-overview.md">}}) building block and the [state management]({{<ref "state-management-overview.md">}}) building block both use [state components](https://github.com/dapr/components-contrib/tree/master/state).  As another example, the [pub/sub]({{<ref "pubsub-overview.md">}}) building block uses [pub/sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

 You can get a list of current components available in the hosting environment using the `dapr components` CLI command.

The following are the component types provided by Dapr:

## State stores

State store components are data stores (databases, files, memory) that store key-value pairs as part of the [state management]({{< ref "state-management-overview.md" >}}) building block.

- [List of state stores]({{< ref supported-state-stores >}})
- [State store implementations](https://github.com/dapr/components-contrib/tree/master/state)

## Name resolution

Name resolution components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block to integrate with the hosting environment and provide service-to-service discovery. For example, the Kubernetes name resolution component integrates with the Kubernetes DNS service, self-hosted uses mDNS and clusters of VMs can use the Consul name resolution component.

- [List of name resolution components]({{< ref supported-name-resolution >}})
- [Name resolution implementations](https://github.com/dapr/components-contrib/tree/master/nameresolution)

## Pub/sub brokers

Pub/sub broker components are message brokers that can pass messages to/from services as part of the [publish & subscribe]({{< ref pubsub-overview.md >}}) building block.

- [List of pub/sub brokers]({{< ref supported-pubsub >}})
- [Pub/sub broker implementations](https://github.com/dapr/components-contrib/tree/master/pubsub)

## Bindings

External resources can connect to Dapr in order to trigger a method on an application or be called from an application as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

- [List of supported bindings]({{< ref supported-bindings >}})
- [Binding implementations](https://github.com/dapr/components-contrib/tree/master/bindings)

## Secret stores

A [secret]({{<ref "secrets-overview.md">}}) is any piece of private information that you want to guard against unwanted access. Secrets stores are used to store secrets that can be retrieved and used in applications.

- [List of supported secret stores]({{< ref supported-secret-stores >}})
- [Secret store implementations](https://github.com/dapr/components-contrib/tree/master/secretstores)

## Configuration stores

Configuration stores are used to save application data, which can then be read by application instances on startup or notified of when changes occur. This allows for dynamic configuration.

- [List of supported configuration stores]({{< ref supported-configuration-stores >}})
- [Configuration store implementations](https://github.com/dapr/components-contrib/tree/master/configuration)

## Middleware

Dapr allows custom [middleware]({{<ref "middleware.md">}})  to be plugged into the HTTP request processing pipeline. Middleware can perform additional actions on an HTTP request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client. The middleware components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block.

- [List of supported middleware components]({{< ref supported-middleware >}})
- [Middleware implementations](https://github.com/dapr/components-contrib/tree/master/middleware)