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

* [State stores](https://github.com/dapr/components-contrib/tree/master/state)
* [Service discovery name resolution](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [Middleware](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Pub/sub brokers](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [Bindings](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Secret stores](https://github.com/dapr/components-contrib/tree/master/secretstores)


## State stores

State store components are databases that store key-value pairs as part of the [state management]({{< ref "state-management-overview.md" >}}) building block.

## Service discovery

Service discovery components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block to integrate with the hosting environment to provide service-to-service discovery. For example, the Kubernetes service discovery component integrates with the Kubernetes DNS service and self hosted uses mDNS.

## Middleware

Dapr allows custom [middleware]({{<ref "middleware-concept.md">}})  to be plugged into the request processing pipeline. Middleware can perform additional actions on a request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client. The middleware components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block.

## Pub/sub brokers

Pub/sub broker components are message busses that can pass messages to/from services as part of the [publish & subscribe]({{< ref pubsub-overview.md >}}) building block.

## Bindings

External resources can connect to Dapr in order to trigger a service or be invoked from a service as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

## Secret stores

In Dapr, a [secret]({{<ref "secrets-overview.md">}}) is any piece of private information that you want to guard against unwanted users. Secrets stores, used to store secrets, are Dapr components and can be used by any of the building blocks.
