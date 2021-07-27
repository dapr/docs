---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 100
description: >
  Introduction to the Distributed Application Runtime
---

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks.

<iframe width="1120" height="630" src="https://www.youtube.com/embed/9o9iDAgYBA8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Any language, any framework, anywhere

<img src="/images/overview.png" width=1000>

Today we are experiencing a wave of cloud adoption. Developers are comfortable with web + database application architectures (for example classic 3-tier designs) but not with microservice application architectures which are inherently distributed. It’s hard to become a distributed systems expert, nor should you have to. Developers want to focus on business logic, while leaning on the platforms to imbue their applications with scale, resiliency, maintainability, elasticity and the other attributes of cloud-native architectures.

This is where Dapr comes in. Dapr codifies the *best practices* for building microservice applications into open, independent building blocks that enable you to build portable applications with the language and framework of your choice. Each building block is completely independent and you can use one, some, or all of them in your application.

In addition, Dapr is platform agnostic, meaning you can run your applications locally, on any Kubernetes cluster, and in other hosting environments that Dapr integrates with. This enables you to build microservice applications that can run on the cloud and edge.

Using Dapr you can easily build microservice applications using any language and any framework, and run them anywhere.

## Microservice building blocks for cloud and edge

<img src="/images/building_blocks.png" width=1000>

There are many considerations when architecting microservices applications. Dapr provides best practices for common capabilities when building microservice applications that developers can use in a standard way, and deploy to any environment. It does this by providing distributed system building blocks.

Each of these building blocks is independent, meaning that you can use one, some, or all of them in your application. Today, the following building blocks are available:

| Building Block | Description |
|----------------|-------------|
| [**Service-to-service invocation**]({{<ref "service-invocation-overview.md">}})  | Resilient service-to-service invocation enables method calls, including retries, on remote services, wherever they are located in the supported hosting environment.
|  [**State management**]({{<ref "state-management-overview.md">}}) | With state management for storing key/value pairs, long-running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and can include Azure CosmosDB, Azure SQL Server, PostgreSQL, AWS DynamoDB or Redis, among others.
| [**Publish and subscribe**]({{<ref "pubsub-overview.md">}}) | Publishing events and subscribing to topics | tween services enables event-driven architectures to simplify horizontal scalability and make them | silient to failure. Dapr provides at-least-once message delivery guarantee.
| [**Resource bindings**]({{<ref "bindings-overview.md">}}) | Resource bindings with triggers builds further on event-driven architectures for scale and resiliency by receiving and sending events to and from any external source such as databases, queues, file systems, etc.
| [**Actors**]({{<ref "actors-overview.md">}}) | A pattern for stateful and stateless objects that makes concurrency simple, with method and state encapsulation. Dapr provides many capabilities in its actor runtime, including concurrency, state, and life-cycle management for actor activation/deactivation, and timers and reminders to wake up actors.
|  [**Observability**]({{<ref "observability-concept.md">}}) | Dapr emits metrics, logs, and traces to debug and monitor both Dapr and user applications. Dapr supports distributed tracing to easily diagnose and serve inter-service calls in production using the W3C Trace Context standard and Open Telemetry to send to different monitoring tools.
| [**Secrets**]({{<ref "secrets-overview.md">}}) | Dapr provides secrets management, and integrates with public-cloud and local-secret stores to retrieve the secrets for use in application code.

## Sidecar architecture

Dapr exposes its HTTP and gRPC APIs as a sidecar architecture, either as a container or as a process, not requiring the application code to include any Dapr runtime code. This makes integration with Dapr easy from other runtimes, as well as providing separation of the application logic for improved supportability.

<img src="/images/overview-sidecar-model.png" width=700>

## Hosting environments

Dapr can be hosted in multiple environments, including self-hosted on a Windows/Linux/macOS machine and on Kubernetes.

### Self-hosted

In [self-hosted mode]({{< ref self-hosted-overview.md >}}) Dapr runs as a separate sidecar process which your service code can call via HTTP or gRPC. Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks.

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr-enabled application on your local machine. Try this out with the [getting started samples]({{< ref getting-started >}}).

<img src="/images/overview_standalone.png" width=1000 alt="Architecture diagram of Dapr in self-hosted mode">

### Kubernetes hosted

In container hosting environments such as Kubernetes, Dapr runs as a sidecar container with the application container in the same pod.

The `dapr-sidecar-injector` and `dapr-operator` services provide first-class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned in the cluster.

The `dapr-sentry` service is a certificate authority that enables mutual TLS between Dapr sidecar instances for secure data encryption. For more information on the `Sentry` service, read the [security overview]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

Deploying and running a Dapr-enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. Visit the [Dapr on Kubernetes docs]({{< ref kubernetes >}})

<img src="/images/overview_kubernetes.png" width=1000 alt="Architecture diagram of Dapr in Kubernetes mode">

## Developer language SDKs and frameworks

Dapr offers a variety of SDKs and frameworks to make it easy to begin developing with Dapr in your preferred language.

### Dapr SDKs

To make using Dapr more natural for different languages, it also includes [language specific SDKs]({{<ref sdks>}}) for:
- C++
- Go
- Java
- JavaScript
- Python
- Rust
- .NET
- PHP

These SDKs expose the functionality of the Dapr building blocks through a typed language API, rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of your choice. And because these SDKs share the Dapr runtime, you get cross-language actor and function support.

### Developer frameworks

Dapr can be used from any developer framework. Here are some that have been integrated with Dapr:

#### Web

| Language | Frameworks | Description |
|----------|------------|-------------|
| [.NET]({{< ref dotnet >}}) | [ASP.NET]({{< ref dotnet-aspnet.md >}}) | Brings stateful routing controllers that respond to pub/sub events from other services. Can also take advantage of [ASP.NET Core gRPC Services](https://docs.microsoft.com/en-us/aspnet/core/grpc/).
| [Java]({{< ref java >}} | [Spring Boot](https://spring.io/)
| [Python]({{< ref python >}}) | [Flask]({{< ref python-flask.md >}})
| [Javascript](https://github.com/dapr/js-sdk) | [Express](http://expressjs.com/)
| [PHP]({{< ref php >}}) | | You can serve with Apache, Nginx, or Caddyserver.

#### Integrations and extensions

Visit the [integrations]({{< ref integrations >}}) page to learn about some of the first-class support Dapr has for various frameworks and external products, including:
- Azure Functions runtime
- Azure Logic Apps runtime
- Azure API Management
- KEDA
- Visual Studio Code

## Designed for operations

Dapr is designed for [operations]({{< ref operations >}}) and security. The Dapr sidecars, runtime, components, and configuration can all be managed and deployed easily and securly to match your organization's needs.

The [services dashboard](https://github.com/dapr/dashboard), installed via the Dapr CLI, provides a web-based UI enabling you to see information, view logs and more for the Dapr sidecars.

The [monitoring tools support]({{< ref monitoring >}}) provides deeper visibility into the Dapr system services and side-cars and the [observability capabilities]({{<ref "observability-concept.md">}}) of Dapr provide insights into your application such as tracing and metrics.
