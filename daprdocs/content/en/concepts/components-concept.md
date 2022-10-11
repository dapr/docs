---
type: docs
title: "Components"
linkTitle: "Components"
weight: 300
description: "Modular functionality used by building blocks and applications"
---

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition. All of the components are interchangable so that you can swap out one component with the same interface for another.

The [components contrib repository](https://github.com/dapr/components-contrib) is where you can contribute implementations for the component interfaces and extend Dapr's capabilities. Alternatively, Dapr component interfaces can also be extended with [pluggable components](https://docs.dapr.io/concepts/components-concept/#pluggable-components).

A building block can use any combination of components. For example the [actors]({{<ref "actors-overview.md">}}) building block and the [state management]({{<ref "state-management-overview.md">}}) building block both use [state components](https://github.com/dapr/components-contrib/tree/master/state). As another example, the [pub/sub]({{<ref "pubsub-overview.md">}}) building block uses [pub/sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

You can get a list of current components available in the hosting environment using the `dapr components` CLI command.

## Component specification

Each component has a specification (or spec) that it conforms to. Components are configured at design-time with a YAML file which is stored in either a `components/local` folder within your solution, or globally in the `.dapr` folder created when invoking `dapr init`. These YAML files adhere to the generic [Dapr component schema]({{<ref "component-schema.md">}}), but each is specific to the component specification.

It is important to understand that the component spec values, particularly the spec `metadata`, can change between components of the same component type, for example between different state stores, and that some design-time spec values can be overridden at runtime when making requests to a component's API. As a result, it is strongly recommended to review a [component's specs]({{<ref "components-reference">}}), paying particular attention to the sample payloads for requests to set the metadata used to interact with the component.

The diagram below shows some examples of the components for each component type
<img src="/images/concepts-components.png" width=1200>

## Available component types

The following are the component types provided by Dapr:

### State stores

State store components are data stores (databases, files, memory) that store key-value pairs as part of the [state management]({{< ref "state-management-overview.md" >}}) building block.

- [List of state stores]({{< ref supported-state-stores >}})
- [State store implementations](https://github.com/dapr/components-contrib/tree/master/state)

### Name resolution

Name resolution components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block to integrate with the hosting environment and provide service-to-service discovery. For example, the Kubernetes name resolution component integrates with the Kubernetes DNS service, self-hosted uses mDNS and clusters of VMs can use the Consul name resolution component.

- [List of name resolution components]({{< ref supported-name-resolution >}})
- [Name resolution implementations](https://github.com/dapr/components-contrib/tree/master/nameresolution)

### Pub/sub brokers

Pub/sub broker components are message brokers that can pass messages to/from services as part of the [publish & subscribe]({{< ref pubsub-overview.md >}}) building block.

- [List of pub/sub brokers]({{< ref supported-pubsub >}})
- [Pub/sub broker implementations](https://github.com/dapr/components-contrib/tree/master/pubsub)

### Bindings

External resources can connect to Dapr in order to trigger a method on an application or be called from an application as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

- [List of supported bindings]({{< ref supported-bindings >}})
- [Binding implementations](https://github.com/dapr/components-contrib/tree/master/bindings)

### Secret stores

A [secret]({{<ref "secrets-overview.md">}}) is any piece of private information that you want to guard against unwanted access. Secrets stores are used to store secrets that can be retrieved and used in applications.

- [List of supported secret stores]({{< ref supported-secret-stores >}})
- [Secret store implementations](https://github.com/dapr/components-contrib/tree/master/secretstores)

### Configuration stores

Configuration stores are used to save application data, which can then be read by application instances on startup or notified of when changes occur. This allows for dynamic configuration.

- [List of supported configuration stores]({{< ref supported-configuration-stores >}})
- [Configuration store implementations](https://github.com/dapr/components-contrib/tree/master/configuration)

### Locks

Lock components are used as a distributed lock to provide mutually exclusive access to a resource such as a queue or database.

- [List of supported locks]({{< ref supported-locks >}})
- [Lock implementations](https://github.com/dapr/components-contrib/tree/master/lock)

### Middleware

Dapr allows custom [middleware]({{<ref "middleware.md">}}) to be plugged into the HTTP request processing pipeline. Middleware can perform additional actions on an HTTP request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the response is returned to the client. The middleware components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block.

- [List of supported middleware components]({{< ref supported-middleware >}})
- [Middleware implementations](https://github.com/dapr/components-contrib/tree/master/middleware)

## Pluggable components

Dapr allows for users to create their own self-hosted components called pluggable components. These are  components that do not need to be written in Go, exist outside the Dapr runtime and are able to "plug" into Dapr to utilize existing building block APIs.

Where possible we encourage donating components to the Dapr project and community. 

However, pluggable components are used in scenarios where you want to create your own private component and choose not to include this into the Dapr project.  This may be because you cannot include your component into the Dapr component repo since it is specific to your company or due to IP concerns. Or you want decouple your component updates from the Dapr release cycle.

For more information read [Pluggable components overview]({{<ref "pluggable-components-overview">}})


**Note:** Since pluggable components are not required to be written in Go, they follow a different implementation process than built-in Dapr components. For more information on that process read the documentation for [Developing new components](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)
