---
type: docs
title: "Platform perspective" 
linkTitle: "Platform perspective"
weight: 900
description: "Learn how to build a platform that can support a range of applications and services with Dapr"
---

## Dapr - Platform Perspective

A platform perspective in software engineering refers to the approach of designing, building, and managing software systems as a unified, modular platform that can support a range of applications and services. The goal of a platform perspective is to enable software developers to build applications more efficiently and effectively, by providing them with a set of well-defined and reusable building blocks that they can leverage in their work.

This document overviews Dapr from a platform perspective and covers the following topics:

- Building Blocks
- Components
- Configuration
- Resiliency
  - Timeouts
  - Retries & Back-offs
  - Circuit Breakers
- Observability
  - OTEL using Distributed Tracing
- Security
  - Secure communication with service invocation and pub/sub APIs.
  - Security policies on components and applied through configuration.
  - Operational security practices.
  - State security, focusing on data at rest.
  - mTLS
- Performance
- Portability

## Context and Problem Statement

Although Dapr provides a set of building blocks that can be used to build applications, it is not clear how these building blocks can be used to build a platform that can support a range of applications and services. This document provides insights on how to achieve these with Dapr. Also, this document explores the alternative considerations if Dapr is not used as a foundational element of a platform.

In distributed systems, applications and services often require related functionality, such as monitoring, logging, configuration, and networking services. These peripheral tasks can be implemented as separate components or services.

If they are tightly integrated into the application, they can run in the same process as the application, making efficient use of shared resources. However, this also means they are not well isolated, and an outage in one of these components can affect other components or the entire application. Also, they usually need to be implemented using the same language as the parent application. As a result, the component and the application have close interdependence on each other.

If the application is decomposed into services, then each service can be built using different languages and technologies. While this gives more flexibility, it means that each component has its own dependencies and requires language-specific libraries to access the underlying platform and any resources shared with the parent application. In addition, deploying these features as separate services can add latency to the application. Managing the code and dependencies for these language-specific interfaces can also add considerable complexity, especially for hosting, deployment, and management.

A solution to this problem is to co-locate a cohesive set of tasks with the primary application, but place them inside their own process or container, providing a homogeneous interface for platform services across languages. This approach is known as a sidecar.

**Sidecar** - A sidecar is a container that runs alongside an application container in the same pod. The sidecar container shares the same lifecycle as the application container. The sidecar container can be used to implement non-application specific concerns such as logging, monitoring, and security.

A sidecar service is not necessarily part of the application, but is connected to it. It goes wherever the parent application goes. Sidecars are supporting processes or services that are deployed with the primary application

An important concept Dapr provides in a Kubernetes environment is providing all of these solutions as a Sidecar container.

### Dapr

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks.

<img src="/images/service-mesh.png" width=1000 alt="Service mesh"/>

Dapr is a set of building blocks that can be used to build applications. These building blocks are:

- Service Invocation
- State Management
- Publish & Subscribe Messaging
- Resource Bindings
- Distributed Tracing
- Secrets Management
- Actor Runtime
- Workflows

From these building blocks, we will explore how to build a platform that can support a range of applications and services.

#### Building Blocks

A building block is an HTTP or gRPC API that can be called from your code and uses one or more Dapr components.

Building blocks address common challenges in building resilient, microservices applications and codify best practices and patterns. Dapr consists of a set of building blocks, with extensibility to add new building blocks.

| Building Block | Endpoint | Description |
|----------------|----------|-------------|
| [**Service-to-service invocation**] | `/v1.0/invoke` | Service invocation enables applications to communicate with each other through well-known endpoints in the form of http or gRPC messages. Dapr provides an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.
| [**State management**] | `/v1.0/state` | Application state is anything an application wants to preserve beyond a single session. Dapr provides a key/value-based state and query APIs with pluggable state stores for persistence.
| [**Publish and subscribe**] | `/v1.0/publish` `/v1.0/subscribe`|  Pub/Sub is a loosely coupled messaging pattern where senders (or publishers) publish messages to a topic, to which subscribers subscribe. Dapr supports the pub/sub pattern between applications.
| [**Bindings**] | `/v1.0/bindings` | A binding provides a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the  Dapr binding API, and it allows your application to be triggered by events sent by the connected service.
| [**Actors**] | `/v1.0/actors` |  An actor is an isolated, independent unit of compute and state with single-threaded execution. Dapr provides an actor implementation based on the virtual actor pattern which provides a single-threaded programming model and where actors are garbage collected when not in use.
| [**Observability**] | `N/A` |  Dapr system components and runtime emit metrics, logs, and traces to debug, operate and monitor Dapr system services, components and user applications.
| [**Secrets**] | `/v1.0/secrets` | Dapr provides a secrets building block API and integrates with secret stores such as public cloud stores, local stores and Kubernetes to store the secrets. Services can call the secrets API to retrieve secrets, for example to get a connection string to a database.
| [**Configuration**] | `/v1.0-alpha1/configuration` | The Configuration API enables you to retrieve and subscribe to application configuration items for supported configuration stores. This enables an application to retrieve specific configuration information, for example, at start up or when configuration changes are made in the store.
| [**Distributed lock**] | `/v1.0-alpha1/lock` | The distributed lock API enables you to take a lock on a resource so that multiple instances of an application can access the resource without conflicts and provide consistency guarantees.
| [**Workflows**] | `/v1.0-alpha1/workflow` | The Workflow API enables you to define long running, persistent processes or data flows that span multiple microservices using Dapr workflows or workflow components. The Workflow API can be combined with other Dapr API building blocks. For example, a workflow can call another service with service invocation or retrieve secrets, providing flexibility and portability.

#### Components

A component is a pluggable unit of code that provides a specific functionality, such as state storage, pub/sub, secrets, etc. Dapr provides a set of built-in components that can be used by applications. Dapr also allows you to extend the set of components by creating your own.

##### **Available component types**

| Component Type | Description |
|----------------|-------------|
| [**Bindings**] | A binding provides a bi-directional connection to an external cloud/on-premise service or system. Dapr allows you to invoke the external service through the  Dapr binding API, and it allows your application to be triggered by events sent by the connected service.
| [**Pub/Sub**] | Pub/Sub is a loosely coupled messaging pattern where senders (or publishers) publish messages to a topic, to which subscribers subscribe. Dapr supports the pub/sub pattern between applications.
| [**Secrets**] | Dapr provides a secrets building block API and integrates with secret stores such as public cloud stores, local stores and Kubernetes to store the secrets. Services can call the secrets API to retrieve secrets, for example to get a connection string to a database.
| [**State Stores**] | Application state is anything an application wants to preserve beyond a single session. Dapr provides a key/value-based state and query APIs with pluggable state stores for persistence.
| [**Name Resolution**] | Name resolution components are used with the service invocation building block to integrate with the hosting environment and provide service-to-service discovery. For example, the Kubernetes name resolution component integrates with the Kubernetes DNS service, self-hosted uses mDNS and clusters of VMs can use the Consul name resolution component.
| [**Configuration stores**] | The Configuration API enables you to retrieve and subscribe to application configuration items for supported configuration stores. This enables an application to retrieve specific configuration information, for example, at start up or when configuration changes are made in the store.
| [**Locks**] | The distributed lock API enables you to take a lock on a resource so that multiple instances of an application can access the resource without conflicts and provide consistency guarantees.
| [**Workflows**] | The Workflow API enables you to define long running, persistent processes or data flows that span multiple microservices using Dapr workflows or workflow components. The Workflow API can be combined with other Dapr API building blocks. For example, a workflow can call another service with service invocation or retrieve secrets, providing flexibility and portability.
| [**Middleware**] | Middleware components are used with the service invocation building block to provide cross-cutting concerns such as authentication, encryption, and message transformation. Dapr provides a set of built-in middleware components that can be used by applications. Dapr also allows you to extend the set of middleware components by creating your own.

#### Cross-Cutting Concerns Solved By Dapr

Dapr provides a set of cross-cutting concerns that are solved by the Dapr runtime. These concerns are:

- Service Discovery
- Distributed Tracing
- Metrics
- Logging
- Secret Management

**Service Discovery**:

In many microservice-based applications multiple services need the ability to communicate with one another. This inter-service communication requires that application developers handle problems like:

**Service discovery.** How do I discover my different services?
**Standardizing API calls between services.** How do I invoke methods between services?
**Secure inter-service communication.** How do I call other services securely with encryption and apply access control on the methods?
**Mitigating request timeouts or failures.** How do I handle retries and transient errors?
**Implementing observability and tracing.** How do I use tracing to see a call graph with metrics to diagnose issues in production?

Dapr addresses these challenges by providing a service invocation API that acts similar to a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing, metrics, error handling, encryption and more.

Dapr uses a sidecar architecture. To invoke an application using Dapr:

You use the invoke API on the Dapr instance.
Each application communicates with its own instance of Dapr.
The Dapr instances discover and communicate with each other.

<img src="/images/platform-service-invocation-flow.png" width=1000 alt="Dapr service invocation"/>

**Distributed Tracing**:

Dapr uses the Open Telemetry (OTEL) and Zipkin protocols for distributed traces. OTEL is the industry standard and is the recommended trace protocol to use.

<img src="/images/platform-w3c-trace-context.png" width=1000 alt="W3C Trace Context example"/>

Dapr also takes care of creating the trace headers. However, when there are more than two services, you’re responsible for propagating the trace headers between them. Let’s go through the scenarios with examples:

<img src="/images/platform-spans.png" width=1000 alt="Traces and spans"/>

1. Single service invocation call (`service A -> service B`)

    Dapr generates the trace headers in service A, which are then propagated from service A to service B. No further propagation is needed.

2. Multiple sequential service invocation calls ( `service A -> service B -> service C`)

    Dapr generates the trace headers at the beginning of the request in service A, which are then propagated to service B. You are now responsible for taking the headers and propagating them to service C, since this is specific to your application.

     `service A -> service B -> propagate trace headers to -> service C` and so on to further Dapr-enabled services.

     In other words, if the app is calling to Dapr and wants to trace with an existing span (trace header), it must always propagate to Dapr (from service B to service C in this case). Dapr always propagates trace spans to an application.

    > **Note**: There are no helper methods exposed in Dapr SDKs to propagate and retrieve trace context. You need to use HTTP/gRPC clients to propagate and retrieve trace headers through HTTP headers and gRPC metadata.

3. Request is from external endpoint (for example, `from a gateway service to a Dapr-enabled service A`)

    An external gateway ingress calls Dapr, which generates the trace headers and calls service A. Service A then calls service B and further Dapr-enabled services. You must propagate the headers from service A to service B: `Ingress -> service A -> propagate trace headers -> service B`. This is similar to case 2 above.

4. Pub/sub messages
     Dapr generates the trace headers in the published message topic. These trace headers are propagated to any services listening on that topic.

**Metrics**

By default, each Dapr system process emits Go runtime/process metrics and has their own Dapr metrics. The Dapr sidecars exposes a Prometheus metrics endpoint that you can scrape to gain a greater understanding of how Dapr is behaving.

<img src="/images/platform-prometheus-scraper.png" width=1000 alt="Scraping Prometheus metrics"/>

**Logging**

Dapr produces structured logs to stdout, either in plain-text or JSON-formatted. By default, all Dapr processes (runtime, or sidecar, and all control plane services) write logs to the console (stdout) in plain-text. To enable JSON-formatted logging, you need to add the `--log-as-json` command flag when running Dapr processes.

```
{"app_id": "finecollectionservice", "instance": "TSTSRV03", "level": "info", "msg": "starting Dapr Runtime -- version 1.0 -- commit 196483d", "scope": "dapr.runtime", "time": "2021-01-12T16:11:39.4669323+01:00", "type": "log", "ver": "1.0"}
{"app_id": "finecollectionservice", "instance": "TSTSRV03", "level": "info", "msg": "log level set to: info", "scope": "dapr.runtime", "type": "log", "time": "2021-01-12T16:11:39.467933+01:00", "ver": "1.0"}
{"app_id": "finecollectionservice", "instance": "TSTSRV03", "level": "info", "msg": "metrics server started on :62408/", "scope": "dapr.metrics", "type": "log", "time": "2021-01-12T16:11:39.467933+01:00", "ver": "1.0"}
```

**Secret Management**

A more modern and secure practice is to isolate secrets in a secrets management tool like Hashicorp Vault or Azure Key Vault. These tools enable you to store secrets externally, vary credentials across environments, and reference them from application code. However, each tool has its complexities and learning curve.

Dapr offers a building block that simplifies managing secrets. The Dapr secrets management building block abstracts away the complexity of working with secrets and secret management tools.

<img src="/images/platform-secrets-flow.png" width=1000 alt="Retrieving a secret with the Dapr secrets API"/>

- It hides the underlying plumbing through a unified interface.
- It supports various pluggable secret store components, which can vary between development and production.
- Applications don't require direct dependencies on secret store libraries.
- Developers don't require detailed knowledge of each secret store.
- Dapr handles all of the above concerns.

Access to the secrets is secured through authentication and authorization. Only an application with sufficient rights can access secrets. Applications running in Kubernetes can also use its built-in secrets management mechanism.

#### Resiliency

Dapr provides a capability for defining and applying fault tolerance resiliency policies via a resiliency spec. Resiliency specs are saved in the same location as components specs and are applied when the Dapr sidecar starts. The sidecar determines how to apply resiliency policies to your Dapr API calls. In self-hosted mode, the resiliency spec must be named resiliency.yaml. In Kubernetes Dapr finds the named resiliency specs used by your application. Within the resiliency spec, you can define policies for popular resiliency patterns, such as:

- Timeouts
- Retries/back-offs
- Circuit breakers

Policies can then be applied to targets, which include:

- Apps via service invocation
- Components
- Actors

Additionally, resiliency policies can be scoped to specific apps.

Below is the general structure of a resiliency policy:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
# similar to subscription and configuration specs, scopes lists the Dapr App IDs that this
# resiliency spec can be used by.
scopes:
  - app1
  - app2
spec:
  # policies is where timeouts, retries and circuit breaker policies are defined.
  # each is given a name so they can be referred to from the targets section in the resiliency spec.
  policies:
    # timeouts are simple named durations.
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s

    # retries are named templates for retry configurations and are instantiated for life of the operation.
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever:
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # retry indefinitely

      important:
        policy: constant
        duration: 5s
        maxRetries: 30

      someOperation:
        policy: exponential
        maxInterval: 15s

      largeResponse:
        policy: constant
        duration: 5s
        maxRetries: 3

    # circuit breakers are automatically instantiated per component and app instance.
    # circuit breakers maintain counters that live as long as the Dapr sidecar is running. They are not persisted.
    circuitBreakers:
      simpleCB:
        maxRequests: 1
        timeout: 30s
        trip: consecutiveFailures >= 5

      pubsubCB:
        maxRequests: 1
        interval: 8s
        timeout: 45s
        trip: consecutiveFailures > 8

  # targets are what named policies are applied to. Dapr supports 3 target types - apps, components and actors
  targets:
    apps:
      appB:
        timeout: general
        retry: important
        # circuit breakers for services are scoped app instance.
        # when a breaker is tripped, that route is removed from load balancing for the configured `timeout` duration.
        circuitBreaker: simpleCB

    actors:
      myActorType: # custom Actor Type Name
        timeout: general
        retry: important
        # circuit breakers for actors are scoped by type, id, or both.
        # when a breaker is tripped, that type or id is removed from the placement table for the configured `timeout` duration.
        circuitBreaker: simpleCB
        circuitBreakerScope: both
        circuitBreakerCacheSize: 5000

    components:
      # for state stores, policies apply to saving and retrieving state.
      statestore1: # any component name -- happens to be a state store here
        outbound:
          timeout: general
          retry: retryForever
          # circuit breakers for components are scoped per component configuration/instance. For example myRediscomponent.
          # when this breaker is tripped, all interaction to that component is prevented for the configured `timeout` duration.
          circuitBreaker: simpleCB

      pubsub1: # any component name -- happens to be a pubsub broker here
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB

      pubsub2: # any component name -- happens to be another pubsub broker here
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
        inbound: # inbound only applies to delivery from sidecar to app
          timeout: general
          retry: important
          circuitBreaker: pubsubCB
```

#### Performance

Dapr consists of a data plane, the sidecar that runs next to your app, and a control plane that configures the sidecars and provides capabilities such as cert and identity management.

The service invocation API is a reverse proxy with built-in service discovery to connect to other services. This includes tracing, metrics, mTLS for in-transit encryption of traffic, together with resiliency in the form of retries for network partitions and connection errors.

Using service invocation you can call from HTTP to HTTP, HTTP to gRPC, gRPC to HTTP, and gRPC to gRPC. Dapr does not use HTTP for the communication between sidecars, always using gRPC, while carrying over the semantics of the protocol used when called from the app. Service invocation is the underlying mechanism of communicating with Dapr Actors.

The test was conducted on a 3 node Kubernetes cluster, using commodity hardware running 4 cores and 8GB of RAM, without any network acceleration. The setup included a load tester (Fortio) pod with a Dapr sidecar injected into it that called the service invocation API to reach a pod on a different node.

Test parameters:

- 1000 requests per second
- Sidecar limited to 0.5 vCPU
- Sidecar mTLS enabled
- Sidecar telemetry enabled (tracing with a sampling rate of 0.1)
- Payload of 1KB

The baseline test included direct, non-encrypted traffic, without telemetry, directly from the load tester to the target app.

**Control plane performance**

The Dapr control plane uses a total of 0.009 vCPU and 61.6 Mb when running in non-HA mode, meaning a single replica per system compoment.
When running in a highly available production setup, the Dapr control plane consumes ~0.02 vCPU and 185 Mb.

| Component  | vCPU | Memory
| ------------- | ------------- | -------------
| Operator  | 0.001  | 12.5 Mb
| Sentry  | 0.005  | 13.6 Mb
| Sidecar Injector  | 0.002  | 14.6 Mb
| Placement | 0.001  | 20.9 Mb

There are a number of variants that affect the CPU and memory consumption for each of the system components. These variants are shown in the table below.

| Component  | vCPU | Memory
| ------------- | ------------- | ------------------------
| Operator  | Number of pods requesting components, configurations and subscriptions  |
| Sentry  | Number of certificate requests  |
| Sidecar Injector | Number of admission requests |
| Placement | Number of actor rebalancing operations | Number of connected actor hosts


**Data plane performance**

The Dapr sidecar uses 0.48 vCPU and 23Mb per 1000 requests per second.
End-to-end, the Dapr sidecars (client and server) add ~1.40 ms to the 90th percentile latency, and ~2.10 ms to the 99th percentile latency. End-to-end here is a call from one app to another app receiving a response.

In the test setup, requests went through the Dapr sidecar both on the client side (serving requests from the load tester tool) and the server side (the target app). mTLS and telemetry (tracing with a sampling rate of 0.1) and metrics were enabled on the Dapr test, and disabled for the baseline test.

<img src="/images/perf_invocation_p90.png" width=1000 alt="Latency for 90th percentile"/>

<img src="/images/perf_invocation_p99.png" width=1000 alt="Latency for 99th percentile"/>

#### Portability

Dapr is designed to be portable across any hosting environment. It is currently supported on Kubernetes and self-hosted (Linux, Windows and MacOS). Dapr is also designed to be portable across languages and runtimes. It currently supports applications written in Go, Java, Javascript, .NET and Python.

Through an architecture of pluggable components, Dapr greatly simplifies the plumbing behind distributed applications. It provides a dynamic glue that binds your application with infrastructure capabilities from the Dapr runtime.

<img src="/images/platform-building-blocks.png" width=1000 alt="Dapr building blocks"/>

Consider a requirement to make one of your services stateful? What would be your design. You could write custom code that targets a state store such as Redis Cache. However, Dapr provides state management capabilities out-of-the-box. Your service invokes the Dapr state management building block that dynamically binds to a state store component via a Dapr component configuration yaml file. Dapr ships with several pre-built state store components, including Redis. With this model, your service delegates state management to the Dapr runtime. Your service has no SDK, library, or direct reference to the underlying component. You can even change state stores, say, from Redis to MySQL or Cassandra, with no code changes.

<img src="/images/platform-building-blocks-integration.png" width=1000 alt="Dapr building block integration"/>

Building blocks invoke Dapr components that provide the concrete implementation for each resource. The code for your service is only aware of the building block. **It takes no dependencies on external SDKs or libraries - Dapr handles the plumbing for you.** Each building block is independent. You can use one, some, or all of them in your application. As a value-add, Dapr building blocks bake in industry best practices including comprehensive observability.

A sample list of Dapr state store components can be:

- AWS DynamoDB
- Aerospike
- Azure Blob Storage
- Azure CosmosDB
- Azure Table Storage
- Cassandra
- Cloud Firestore (Datastore mode)
- CloudState
- Couchbase
- Etcd
- HashiCorp Consul
- Hazelcast
- Memcached
- MongoDB
- PostgreSQL
- Redis
- RethinkDB
- SQL Server
- Zookeeper

Other building blocks supported by Dapr can be found at: [Component References](https://docs.dapr.io/reference/components-reference/)

### Alternatives Considered

If Dapr is not used and sidecar architecture is not used, then the following alternatives are considered for Java workloads. Some of them works out of box with Kubernetes and some of them needs additional configuration. However, the maintenance and implementation of these alternatives are not as easy as Dapr. As Dapr is installed and enabled outside of the application code, it is easy to maintain and implement. However, without using Dapr, all of the following features need to be implemented in the application code or as a separate service, deployed as a sidecar.

- Resiliency: Hystrix, resilience4j
- Service Discovery: Eureka, Consul
- Service Mesh: Istio, Linkerd
- Tracing: Jaeger, Zipkin
- Metrics: Prometheus
- Logging: ELK Stack
- Configuration: Spring Cloud Config
- Secret Management: Azure Key Vault, Hashicorp Vault
- State Management: Redis, Hazelcast
- Pub/Sub: Kafka, RabbitMQ

### Conclusion

Dapr is a great tool for microservices architecture. It is easy to implement, maintain, integrate with other tools and services and with other programming languages.

It provides a platform to the approach of designing, building, and managing software systems as a unified, modular platform that can support a range of applications and services.
