---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 100
description: >
  Introduction to the Distributed Application Runtime
---

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks.

{{< youtube 9o9iDAgYBA8 >}}

## Any language, any framework, anywhere

<img src="/images/overview.png" width=1000>

Today we are experiencing a wave of cloud adoption. Developers are comfortable with web + database application architectures (for example classic 3-tier designs) but not with microservice application architectures which are inherently distributed. It’s hard to become a distributed systems expert, nor should you have to. Developers want to focus on business logic, while leaning on the platforms to imbue their applications with scale, resiliency, maintainability, elasticity and the other attributes of cloud-native architectures.

This is where Dapr comes in. Dapr codifies the *best practices* for building microservice applications into open, independent, building blocks that enable you to build portable applications with the language and framework of your choice. Each building block is completely independent and you can use one, some, or all of them in your application.

In addition Dapr is platform agnostic meaning you can run your applications locally, on any Kubernetes cluster, and other hosting environments that Dapr integrates with. This enables you to build microservice applications that can run on the cloud and edge.

Using Dapr you can easily build microservice applications using any language, any framework, and run them anywhere.

## Microservice building blocks for cloud and edge

<img src="/images/building_blocks.png" width=1000>

There are many considerations when architecting microservices applications. Dapr provides best practices for common capabilities when building microservice applications that developers can use in a standard way and deploy to any environment. It does this by providing distributed system building blocks.

Each of these building blocks is independent, meaning that you can use one, some or all of them in your application. In this initial release of Dapr, the following building blocks are provided:

| Building Block | Description |
|----------------|-------------|
| [**Service-to-service invocation**]({{<ref "service-invocation-overview.md">}})  | Resilient service-to-service invocation enables method calls, including retries, on remote services wherever they are located in the supported hosting environment.
|  [**State management**]({{<ref "state-management-overview.md">}}) | With state management for storing key/value pairs, long running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and can include Azure CosmosDB, Azure SQL Server, PostgreSQL, AWS DynamoDB or Redis among others.
| [**Publish and subscribe**]({{<ref "pubsub-overview.md">}}) | Publishing events and subscribing to topics | tween services enables event-driven architectures to simplify horizontal scalability and make them | silient to failure. Dapr provides at least once message delivery guarantee.
| [**Resource bindings**]({{<ref "bindings-overview.md">}}) | Resource bindings with triggers builds further on event-driven architectures for scale and resiliency by receiving and sending events to and from any external source such as databases, queues, file systems, etc.
| [**Actors**]({{<ref "actors-overview.md">}}) | A pattern for stateful and stateless objects that make concurrency simple with method and state encapsulation. Dapr provides many capabilities in its actor runtime including concurrency, state, life-cycle management for actor activation/deactivation and timers and reminders to wake-up actors.
|  [**Observability**]({{<ref "observability-concept.md">}}) | Dapr emit metrics, logs, and traces to debug and monitor both Dapr and user applications. Dapr supports distributed tracing to easily diagnose and serve inter-service calls in production using the W3C Trace Context standard and Open Telemetry to send to different monitoring tools. 
| [**Secrets**]({{<ref "secrets-overview.md">}}) | Dapr provides secrets management and integrates with public cloud and local secret stores to retrieve the secrets for use in application code.

## Sidecar architecture

Dapr exposes its APIs as a sidecar architecture, either as a container or as a process, not requiring the application code to include any Dapr runtime code. This makes integration with Dapr easy from other runtimes, as well as providing separation of the application logic for improved supportability.

## Hosting Environments
Dapr can be hosted in multiple environments, including self hosted for local development or to deploy to a group of VMs, Kubernetes and edge environments such as Azure IoT Edge.

### Self hosted

In self hosted mode Dapr runs as a separate side-car process which your service code can call via HTTP or gRPC. In self hosted mode, you can  also deploy Dapr onto a set of VMs.

<img src="/images/overview-sidecar.png" width=1000>

### Kubernetes hosted

In container hosting environments such as Kubernetes, Dapr runs as a side-car container with the application container in the same pod.

<img src="/images/overview-sidecar-kubernetes.png" width=1000>

## Developer language SDKs and frameworks

To make using Dapr more natural for different languages, it also includes [language specific SDKs]({{<ref sdks>}}) for C++, Go, Java, JavaScript, Python, Rust .NET and PHP. These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed, language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of their choice. And because these SDKs share the Dapr runtime, you get cross-language actor and functions support.

### SDKs

- **[C++ SDK](https://github.com/dapr/cpp-sdk)**
- **[Go SDK](https://github.com/dapr/go-sdk)**
- **[Java SDK](https://github.com/dapr/java-sdk)**
- **[Javascript SDK](https://github.com/dapr/js-sdk)**
- **[Python SDK](https://github.com/dapr/python-sdk)**
- **[RUST SDK](https://github.com/dapr/rust-sdk)**
- **[.NET SDK](https://github.com/dapr/dotnet-sdk)**
- **[PHP SDK](https://github.com/dapr/php-sdk)**

> Note: Dapr is language agnostic and provides a [RESTful HTTP API]({{< ref api >}}) in addition to the protobuf clients.

### Developer frameworks
Dapr can be used from  any developer framework. Here are some that have been integrated with Dapr.

#### Web
 In the Dapr [.NET SDK](https://github.com/dapr/dotnet-sdk) you can find [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet) integration, which brings stateful routing controllers that respond to pub/sub events from other services. 
 
 In the Dapr [Java SDK](https://github.com/dapr/java-sdk) you can find [Spring Boot](https://spring.io/) integration.
 
Dapr integrates easily with Python [Flask](https://pypi.org/project/Flask/) and node [Express](http://expressjs.com/). See examples in the [Dapr quickstarts](https://github.com/dapr/quickstarts).

In the Dapr [PHP-SDK](https://github.com/dapr/php-sdk) you can serve with Apache, Nginx, or Caddyserver.

#### Actors
Dapr SDKs support for [virtual actors]({{< ref actors >}}) which are stateful objects that make concurrency simple, have method and state encapsulation, and are designed for scalable, distributed applications.

#### Azure Functions
Dapr integrates with the Azure Functions runtime via an extension that lets a function seamlessly interact with Dapr. Azure Functions provides an event-driven programming model and Dapr provides cloud-native building blocks. With this  extension, you can bring both together for serverless and event-driven apps. For more information read
[Azure Functions extension for Dapr](https://cloudblogs.microsoft.com/opensource/2020/07/01/announcing-azure-functions-extension-for-dapr/) and visit the [Azure Functions extension](https://github.com/dapr/azure-functions-extension) repo to try out the samples.

#### Dapr workflows
To enable developers to easily build workflow applications that use Dapr’s capabilities including diagnostics and multi-language support, you can use Dapr workflows. Dapr integrates with workflow engines such as Logic Apps.  For more information read
[cloud-native workflows using Dapr and Logic Apps](https://cloudblogs.microsoft.com/opensource/2020/05/26/announcing-cloud-native-workflows-dapr-logic-apps/) and visit the [Dapr workflow](https://github.com/dapr/workflows) repo to try out the samples.

## Designed for Operations
Dapr is designed for [operations](/operations/). The [services dashboard](https://github.com/dapr/dashboard), installed via the Dapr CLI, provides a web-based UI enabling you to see information, view logs and more for the Dapr sidecars.

The [monitoring tools support](/operations/monitoring/) provides deeper visibility into the Dapr system services and side-cars and the [observability capabilities]({{<ref "observability-concept.md">}}) of Dapr provide insights into your application such as tracing and metrics.

## Run anywhere

### Running Dapr on a local developer machine in self hosted mode

Dapr can be configured to run on your local developer machine in [self-hosted mode]({{< ref self-hosted >}}). Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks. 

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr enabled application on your local machine. Try this out with the [getting started samples]({{< ref getting-started >}}). 

<img src="/images/overview_standalone.png" width=800>

### Running Dapr in Kubernetes mode

Dapr can be configured to run on any [Kubernetes cluster]({{< ref kubernetes >}}). In Kubernetes the `dapr-sidecar-injector` and `dapr-operator` services provide first class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned into the cluster. 

The `dapr-sentry` service is a certificate authority that enables mutual TLS between Dapr sidecar instances for secure data encryption. For more information on the `Sentry` service read the [security overview]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})

<img src="/images/overview_kubernetes.png" width=800>

Deploying and running a Dapr enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. You can see some examples [here](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes/deploy) in the Kubernetes getting started sample. Try this out with the [Kubernetes quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes).
