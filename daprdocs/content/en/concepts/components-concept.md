---
type: docs
title: "Components"
linkTitle: "Components"
weight: 300
description: "Modular functionality used by building blocks and applications"
---

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition. All of the components are interchangeable so that you can swap out one component with the same interface for another.

You can contribute implementations and extend Dapr's component interfaces capabilities via:

- The [components-contrib repository](https://github.com/dapr/components-contrib)
- [Pluggable components]({{< ref "components-concept.md#built-in-and-pluggable-components" >}}).

A building block can use any combination of components. For example, the [actors]({{< ref "actors-overview.md" >}}) and the [state management]({{< ref "state-management-overview.md" >}}) building blocks both use [state components](https://github.com/dapr/components-contrib/tree/master/state).

As another example, the [pub/sub]({{< ref "pubsub-overview.md" >}}) building block uses [pub/sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

You can get a list of current components available in the hosting environment using the `dapr components` CLI command.

{{% alert title="Note" color="primary" %}} 
For any component that returns data to the app, it is recommended to set the memory capacity of the Dapr sidecar accordingly (process or container) to avoid potential OOM panics. For example in Docker use the `--memory` option. For Kubernetes, use the `dapr.io/sidecar-memory-limit` annotation. For processes this depends on the OS and/or process orchestration tools.*
{{% /alert %}}

## Component specification

Each component has a specification (or spec) that it conforms to. Components are configured at design-time with a YAML file which is stored in either:

- A `components/local` folder within your solution, or
- Globally in the `.dapr` folder created when invoking `dapr init`.

These YAML files adhere to the generic [Dapr component schema]({{< ref "component-schema.md" >}}), but each is specific to the component specification.

It is important to understand that the component spec values, particularly the spec `metadata`, can change between components of the same component type, for example between different state stores, and that some design-time spec values can be overridden at runtime when making requests to a component's API. As a result, it is strongly recommended to review a [component's specs]({{< ref "components-reference" >}}), paying particular attention to the sample payloads for requests to set the metadata used to interact with the component.

The diagram below shows some examples of the components for each component type
<img src="/images/concepts-components.png" width=1200>

## Built-in and pluggable components

Dapr has built-in components that are included as part of the runtime. These are public components that are developed and donated by the community and are available to use in every release. 

Dapr also allows for users to create their own private components called pluggable components. These are components that are self-hosted (process or container), do not need to be written in Go, exist outside the Dapr runtime, and are able to "plug" into Dapr to utilize the building block APIs.

Where possible, donating built-in components to the Dapr project and community is encouraged.

However, pluggable components are ideal for scenarios where you want to create your own private components that are not included into the Dapr project. 
For example:
- Your component may be specific to your company or pose IP concerns, so it cannot be included in the Dapr component repo. 
- You want decouple your component updates from the Dapr release cycle.

For more information read [Pluggable components overview]({{< ref "pluggable-components-overview" >}})

## Hot Reloading

With the [`HotReload` feature enabled]({{< ref "support-preview-features.md" >}}), components are able to be "hot reloaded" at runtime.
This means that you can update component configuration without restarting the Dapr runtime.
Component reloading occurs when a component resource is created, updated, or deleted, either in the Kubernetes API or in self-hosted mode when a file is changed in the `resources` directory.
When a component is updated, the component is first closed, and then reinitialized using the new configuration.
The component is unavailable for a short period of time during reload and reinitialization.

## Available component types

The following are the component types provided by Dapr:

### State stores

State store components are data stores (databases, files, memory) that store key-value pairs as part of the [state management]({{< ref "state-management-overview.md" >}}) building block.

- [List of state stores]({{< ref supported-state-stores >}})
- [State store implementations](https://github.com/dapr/components-contrib/tree/master/state)

### Name resolution

Name resolution components are used with the [service invocation]({{< ref "service-invocation-overview.md" >}}) building block to integrate with the hosting environment and provide service-to-service discovery. For example, the Kubernetes name resolution component integrates with the Kubernetes DNS service, self-hosted uses mDNS and clusters of VMs can use the Consul name resolution component.

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

A [secret]({{< ref "secrets-overview.md" >}}) is any piece of private information that you want to guard against unwanted access. Secrets stores are used to store secrets that can be retrieved and used in applications.

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

### Workflows

A [workflow]({{< ref workflow-overview.md >}}) is custom application logic that defines a reliable business process or data flow. Workflow components are workflow runtimes (or engines) that run the business logic written for that workflow and store their state into a state store.  

<!--- [List of supported workflows]()
- [Workflow implementations](https://github.com/dapr/components-contrib/tree/master/workflows)-->

### Cryptography

[Cryptography]({{< ref cryptography-overview.md >}}) components are used to perform crypographic operations, including encrypting and decrypting messages, without exposing keys to your application.

- [List of supported cryptography components]({{< ref supported-cryptography >}})
- [Cryptography implementations](https://github.com/dapr/components-contrib/tree/master/crypto) 

### Middleware

Dapr allows custom [middleware]({{< ref "middleware.md" >}}) to be plugged into the HTTP request processing pipeline. Middleware can perform additional actions on an HTTP request (such as authentication, encryption, and message transformation) before the request is routed to the user code, or the response is returned to the client. The middleware components are used with the [service invocation]({{< ref "service-invocation-overview.md" >}}) building block.

- [List of supported middleware components]({{< ref supported-middleware >}})
- [Middleware implementations](https://github.com/dapr/components-contrib/tree/master/middleware)

{{% alert title="Note" color="primary" %}} 
Since pluggable components are not required to be written in Go, they follow a different implementation process than built-in Dapr components. For more information on developing built-in components, read [developing new components](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md).
{{% /alert %}}
