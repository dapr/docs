---
type: docs
title: "Service invocation overview"
linkTitle: "Overview"
weight: 900
description: "Overview of the service invocation API building block"
---

## Introduction

Using service invocation, your application can reliably and securely communicate with other applications using the standard [gRPC](https://grpc.io) or [HTTP](https://www.w3.org/Protocols/) protocols.

In many environments with multiple services that need to communicate with each other, developers often ask themselves the following questions:

- How do I discover and invoke methods on different services?
- How do I call other services securely with encryption and apply access control on the methods?
- How do I handle retries and transient errors?
- How do I use tracing to see a call graph with metrics to diagnose issues in production?

Dapr addresses these challenges by providing a service invocation API that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing, metrics, error handling, encryption and more.

Dapr uses a sidecar architecture. To invoke an application using Dapr, you use the `invoke` API on any Dapr instance. The sidecar programming model encourages each applications to talk to its own instance of Dapr. The Dapr instances discover and communicate with one another.

### Service invocation

The diagram below is an overview of how Dapr's service invocation works.

<img src="/images/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation">

1. Service A makes an HTTP or gRPC call targeting Service B. The call goes to the local Dapr sidecar.
2. Dapr discovers Service B's location using the [name resolution component]({{< ref supported-name-resolution >}}) which is running on the given [hosting platform]({{< ref "hosting" >}}).
3. Dapr forwards the message to Service B's Dapr sidecar
   - **Note**: All calls between Dapr sidecars go over gRPC for performance. Only calls between services and Dapr sidecars can be either HTTP or gRPC
4. Service B's Dapr sidecar forwards the request to the specified endpoint (or method) on Service B.  Service B then runs its business logic code.
5. Service B sends a response to Service A.  The response goes to Service B's sidecar.
6. Dapr forwards the response to Service A's Dapr sidecar.
7. Service A receives the response.

## Features
Service invocation provides several features to make it easy for you to call methods between applications.

### Namespace scoping

Applications can be scoped to namespaces for deployment and security, and you can call between services deployed to different namespaces. For more information, read the [Service invocation across namespaces]({{< ref "service-invocation-namespaces.md" >}}) article.

### Service-to-service security

All calls between Dapr applications can be made secure with mutual (mTLS) authentication on hosted platforms, including automatic certificate rollover, via the Dapr Sentry service.

For more information read the [service-to-service security]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}) article.

### Access control

Applications can control which other applications are allowed to call them and what they are authorized to do via access policies. This enables you to restrict sensitive applications, that say have personnel information, from being accessed by unauthorized applications, and combined with service-to-service secure communication, provides for soft multi-tenancy deployments.

For more information read the [access control allow lists for service invocation]({{< ref invoke-allowlist.md >}}) article.

### Retries

Service invocation performs automatic retries with backoff time periods in the event of call failures and transient errors.

Errors that cause retries are:

- Network errors including endpoint unavailability and refused connections.
- Authentication errors due to a renewing certificate on the calling/callee Dapr sidecars.

Per call retries are performed with a backoff interval of 1 second up to a threshold of 3 times.
Connection establishment via gRPC to the target sidecar has a timeout of 5 seconds.

### Pluggable service discovery

Dapr can run on a variety of [hosting platforms]({{< ref hosting >}}). To enable service discovery and service invocation, Dapr uses pluggable [name resolution components]({{< ref supported-name-resolution >}}). For example, the Kubernetes name resolution component uses the Kubernetes DNS service to resolve the location of other applications running in the cluster. Self-hosted machines can use the mDNS name resolution component. The Consul name resolution component can be used in any hosting environment including Kubernetes or self-hosted.

### Round robin load balancing with mDNS

Dapr provides round robin load balancing of service invocation requests with the mDNS protocol, for example with a single machine or with multiple, networked, physical machines.

The diagram below shows an example of how this works. If you have 1 instance of an application with app ID `FrontEnd` and 3 instances of application with app ID `Cart` and you call from `FrontEnd` app to `Cart` app, Dapr round robins' between the 3 instances. These instance can be on the same machine or on different machines. .

<img src="/images/service-invocation-mdns-round-robin.png" width=600 alt="Diagram showing the steps of service invocation">

**Note**: You can have N instances of the same app with the same app ID as app ID is unique per app. And you can have multiple instances of that app where all those instances have the same app ID.

### Tracing and metrics with observability

By default, all calls between applications are traced and metrics are gathered to provide insights and diagnostics for applications, which is especially important in production scenarios. This gives you call graphs and metrics on the calls between your services. For more information read about [observability]({{< ref observability-concept.md >}}).

### Service invocation API

The API for service invocation can be found in the [service invocation API reference]({{< ref service_invocation_api.md >}}) which describes how to invoke a method on another service.

### gRPC proxying

Dapr allows users to keep their own proto services and work natively with gRPC. This means that you can use service invocation to call your existing gRPC apps without having to include any Dapr SDKs or include custom gRPC services. For more information, see the [how-to tutorial for Dapr and gRPC]({{< ref howto-invoke-services-grpc.md >}}).

## Example

Following the above call sequence, suppose you have the applications as described in the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md), where a python app invokes a node.js app. In such a scenario, the python app would be "Service A" , and a Node.js app would be "Service B".

The diagram below shows sequence 1-7 again on a local machine showing the API calls:

<img src="/images/service-invocation-overview-example.png" width=800 />

1. The Node.js app has a Dapr app ID of `nodeapp`. The python app invokes the Node.js app's `neworder` method by POSTing `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which first goes to the python app's local Dapr sidecar.
2. Dapr discovers the Node.js app's location using name resolution component (in this case mDNS while self-hosted) which runs on your local machine.
3. Dapr forwards the request to the Node.js app's sidecar using the location it just received.
4. The Node.js app's sidecar forwards the request to the Node.js app. The Node.js app performs its business logic, logging the incoming message and then persist the order ID into Redis (not shown in the diagram)
5. The Node.js app sends a response to the Python app through the Node.js sidecar.
6. Dapr forwards the response to the Python Dapr sidecar
7. The Python app receives the response.

## Next steps

- Follow these guides on:
  - [How-to: Invoke services using HTTP]({{< ref howto-invoke-discover-services.md >}})
  - [How-To: Configure Dapr to use gRPC]({{< ref grpc >}})
  - [How-to: Invoke services using gRPC]({{< ref howto-invoke-services-grpc.md >}})
- Try out the [hello world quickstart](https://github.com/dapr/quickstarts/blob/master/tutorials/hello-world/README.md) which shows how to use HTTP service invocation or try the samples in the [Dapr SDKs]({{< ref sdks >}})
- Read the [service invocation API specification]({{< ref service_invocation_api.md >}})
- Understand the [service invocation performance]({{< ref perf-service-invocation.md >}}) numbers
