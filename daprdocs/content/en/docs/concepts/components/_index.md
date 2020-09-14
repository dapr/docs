---
title: "Dapr Components"
linkTitle: "Components"
weight: 10
description: "Modular pieces of functionality used in Dapr."
---

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition.  All of the components are pluggable so that you can swap out one component with the same interface for another. The [components contrib repo](https://github.com/dapr/components-contrib) is where you can contribute implementations for the component interfaces and extends Dapr's capabilities.
  
 A building block can use any combination of components. For example the [actors](./actors) building block and the state management building block both use state  components.  As another example, the pub/sub building block uses [pub/sub](./publish-subscribe-messaging/README.md) components.

 You can get a list of current components available in the current hosting environment using the `dapr components` CLI command.

 The following are the component types provided by Dapr:

* [Service discovery](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [State](https://github.com/dapr/components-contrib/tree/master/state)
* [Pub/sub](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [Bindings](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Middleware](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Secret stores](https://github.com/dapr/components-contrib/tree/master/secretstores)
* [Tracing exporters](https://github.com/dapr/components-contrib/tree/master/exporters)

### Service invocation and service discovery components
Service discovery components are used with the [Service Invocation](./service-invocation/README.md) building block to integrate with the hosting environment to provide service-to-service discovery. For example, the Kubernetes service discovery component integrates with the kubernetes DNS service and self hosted uses mDNS.

### Service invocation and middleware components  
Dapr allows custom [**middleware**](./middleware/README.md) to be plugged into the request processing pipeline. Middleware can perform additional actions on a request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client. The middleware components are used with the [Service Invocation](./service-invocation/README.md) building block.

### Secret store components
In Dapr, a [**secret**](./secrets/README.md) is any piece of private information that you want to guard against unwanted users. Secretstores, used to store secrets, are Dapr components and can be used by any of the building blocks.