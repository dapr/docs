---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 100
description: >
  Introduction to the Distributed Application Runtime
---

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless, and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks.

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="1120" height="630" src="https://www.youtube-nocookie.com/embed/9o9iDAgYBA8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Any language, any framework, anywhere

<img src="/images/overview.png" width=1200 style="padding-bottom:15px;">

With the current wave of cloud adoption, web + database application architectures (such as classic 3-tier designs) are trending more toward microservice application architectures, which are inherently distributed. You shouldn't have to become a distributed systems expert just to create microservices applications. 

This is where Dapr comes in. Dapr codifies the *best practices* for building microservice applications into open, independent APIs called [building blocks]({{< ref "#microservice-building-blocks-for-cloud-and-edge" >}}). Dapr's building blocks:
- Enable you to build portable applications using the language and framework of your choice. 
- Are completely independent 
- Have no limit to how many you use in your application

Using Dapr, you can incrementally migrate your existing applications to a microservices architecture, thereby adopting cloud native patterns such scale out/in, resiliency, and independent deployments.

Dapr is platform agnostic, meaning you can run your applications:
- Locally
- On any Kubernetes cluster
- On virtual or physical machines 
- In other hosting environments that Dapr integrates with. 

This enables you to build microservice applications that can run on the cloud and edge.

## Microservice building blocks for cloud and edge

<img src="/images/building_blocks.png" width=1200 style="padding-bottom:15px;">

Dapr provides distributed system building blocks for you to build microservice applications in a standard way and to deploy to any environment.

Each of these building block APIs is independent, meaning that you can use any number of them in your application. 

| Building Block | Description |
|----------------|-------------|
| [**Service-to-service invocation**]({{< ref "service-invocation-overview.md" >}})  | Resilient service-to-service invocation enables method calls, including retries, on remote services, wherever they are located in the supported hosting environment.
|  [**State management**]({{< ref "state-management-overview.md" >}}) | With state management for storing and querying key/value pairs, long-running, highly available, stateful services can be easily written alongside stateless services in your application. The state store is pluggable and examples include AWS DynamoDB, Azure Cosmos DB, Azure SQL Server, GCP Firebase, PostgreSQL or Redis, among others.
| [**Publish and subscribe**]({{< ref "pubsub-overview.md" >}}) | Publishing events and subscribing to topics between services enables event-driven architectures to simplify horizontal scalability and make them resilient to failure. Dapr provides at-least-once message delivery guarantee, message TTL, consumer groups and other advance features.
| [**Resource bindings**]({{< ref "bindings-overview.md" >}}) | Resource bindings with triggers builds further on event-driven architectures for scale and resiliency by receiving and sending events to and from any external source such as databases, queues, file systems, etc.
| [**Actors**]({{< ref "actors-overview.md" >}}) | A pattern for stateful and stateless objects that makes concurrency simple, with method and state encapsulation. Dapr provides many capabilities in its actor runtime, including concurrency, state, and life-cycle management for actor activation/deactivation, and timers and reminders to wake up actors.
| [**Secrets**]({{< ref "secrets-overview.md" >}}) | The secrets management API integrates with public cloud and local secret stores to retrieve the secrets for use in application code.
| [**Configuration**]({{< ref "configuration-api-overview.md" >}})  | The configuration API enables you to retrieve and subscribe to application configuration items from configuration stores. 
| [**Distributed lock**]({{< ref "distributed-lock-api-overview.md" >}})  | The distributed lock API enables your application to acquire a lock for any resource that gives it exclusive access until either the lock is released by the application, or a lease timeout occurs. 
| [**Workflows**]({{< ref "workflow-overview.md" >}}) | The workflow API can be combined with other Dapr building blocks to define long running, persistent processes or data flows that span multiple microservices using Dapr workflows or workflow components. 
| [**Cryptography**]({{< ref "cryptography-overview.md" >}}) | The cryptography API provides an abstraction layer on top of security infrastructure such as key vaults. It contains APIs that allow you to perform cryptographic operations, such as encrypting and decrypting messages, without exposing keys to your applications.

### Cross-cutting APIs

Alongside its building blocks, Dapr provides cross-cutting APIs that apply across all the build blocks you use.

| Building Block | Description |
|----------------|-------------|
|  [**Resiliency**]({{< ref "resiliency-concept.md" >}}) | Dapr provides the capability to define and apply fault tolerance resiliency policies via a resiliency spec. Supported specs define policies for resiliency patterns such as timeouts, retries/back-offs, and circuit breakers.
|  [**Observability**]({{< ref "observability-concept.md" >}}) | Dapr emits metrics, logs, and traces to debug and monitor both Dapr and user applications. Dapr supports distributed tracing to easily diagnose and serve inter-service calls in production using the W3C Trace Context standard and Open Telemetry to send to different monitoring tools.
|  [**Security**]({{< ref "security-concept.md" >}}) | Dapr supports in-transit encryption of communication between Dapr instances using the Dapr control plane, Sentry service. You can bring in your own certificates, or let Dapr automatically create and persist self-signed root and issuer certificates.

## Sidecar architecture

Dapr exposes its HTTP and gRPC APIs as a sidecar architecture, either as a container or as a process, not requiring the application code to include any Dapr runtime code. This makes integration with Dapr easy from other runtimes, as well as providing separation of the application logic for improved supportability.

<img src="/images/overview-sidecar-model.png" width=900>

## Hosting environments

Dapr can be hosted in multiple environments, including:
- Self-hosted on a Windows/Linux/macOS machine for local development 
- On Kubernetes or clusters of physical or virtual machines in production

### Self-hosted local development

In [self-hosted mode]({{< ref self-hosted-overview.md >}}), Dapr runs as a separate sidecar process, which your service code can call via HTTP or gRPC. Each running service has a Dapr runtime process (or sidecar) configured to use state stores, pub/sub, binding components, and the other building blocks.

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr-enabled application on your local machine. In the following diagram, Dapr's local development environment gets configured with the CLI `init` command. Try this out with the [getting started samples]({{< ref getting-started >}}). 

<img src="/images/overview-standalone.png" width=1200 alt="Architecture diagram of Dapr in self-hosted mode">

### Kubernetes

Kubernetes can be used for either:
- Local development (for example, with [minikube](https://minikube.sigs.k8s.io/docs/) and [k3S](https://k3s.io/)), or 
- In [production]({{< ref kubernetes >}}). 

In container hosting environments such as Kubernetes, Dapr runs as a sidecar container with the application container in the same pod.

Dapr's `dapr-sidecar-injector` and `dapr-operator` control plane services provide first-class integration to:
- Launch Dapr as a sidecar container in the same pod as the service container 
- Provide notifications of Dapr component updates provisioned in the cluster

<!-- IGNORE_LINKS -->
The `dapr-sentry` service is a certificate authority that enables mutual TLS between Dapr sidecar instances for secure data encryption, as well as providing identity via [Spiffe](https://spiffe.io/). For more information on the `Sentry` service, read the [security overview]({{< ref "security-concept.md#dapr-to-dapr-communication" >}})
<!-- END_IGNORE -->

Deploying and running a Dapr-enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. Visit the [Dapr on Kubernetes docs]({{< ref kubernetes >}}).

<img src="/images/overview-kubernetes.png" width=1200 alt="Architecture diagram of Dapr in Kubernetes mode">

### Clusters of physical or virtual machines

The Dapr control plane services can be deployed in high availability (HA) mode to clusters of physical or virtual machines in production. In the diagram below, the Actor `Placement` and security `Sentry` services are started on three different VMs to provide HA control plane. In order to provide name resolution using DNS for the applications running in the cluster, Dapr uses [Hashicorp Consul service]({{< ref setup-nr-consul >}}), also running in HA mode.  

<img src="/images/overview-vms-hosting.png" width=1200 alt="Architecture diagram of Dapr control plane and Consul deployed to VMs in high availability mode">

## Developer language SDKs and frameworks

Dapr offers a variety of SDKs and frameworks to make it easy to begin developing with Dapr in your preferred language.

### Dapr SDKs

To make using Dapr more natural for different languages, it also includes [language specific SDKs]({{< ref sdks >}}) for:
- Go
- Java
- JavaScript
- .NET
- PHP
- Python

These SDKs expose the functionality of the Dapr building blocks through a typed language API, rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of your choice. Since these SDKs share the Dapr runtime, you get cross-language actor and function support.

### Developer frameworks

Dapr can be used from any developer framework. Here are some that have been integrated with Dapr:

#### Web

| Language | Frameworks | Description |
|----------|------------|-------------|
| [.NET]({{< ref dotnet >}}) | [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore) | Brings stateful routing controllers that respond to pub/sub events from other services. Can also take advantage of [ASP.NET Core gRPC Services](https://docs.microsoft.com/aspnet/core/grpc/).
| [Java]({{< ref java >}}) | [Spring Boot](https://spring.io/) | Build Spring boot applications with Dapr APIs
| [Python]({{< ref python >}}) | [Flask]({{< ref python-flask.md >}}) | Build Flask applications with Dapr APIs
| [Javascript](https://github.com/dapr/js-sdk) | [Express](http://expressjs.com/) | Build Express applications with Dapr APIs
| [PHP]({{< ref php >}}) | | You can serve with Apache, Nginx, or Caddyserver.

#### Integrations and extensions

Visit the [integrations]({{< ref integrations >}}) page to learn about some of the first-class support Dapr has for various frameworks and external products, including:
- Public cloud services, like Azure and AWS
- Visual Studio Code
- GitHub

## Designed for operations

Dapr is designed for [operations]({{< ref operations >}}) and security. The Dapr sidecars, runtime, components, and configuration can all be managed and deployed easily and securely to match your organization's needs.

The [dashboard](https://github.com/dapr/dashboard), installed via the Dapr CLI, provides a web-based UI enabling you to see information, view logs, and more for running Dapr applications.

Dapr supports [monitoring tools]({{< ref observability >}}) for deeper visibility into the Dapr system services and sidecars, while the [observability capabilities]({{< ref "observability-concept.md" >}}) of Dapr provide insights into your application, such as tracing and metrics.
