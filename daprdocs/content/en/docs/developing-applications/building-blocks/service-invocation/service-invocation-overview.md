---
title: "Service invocation"
linkTitle: "Overview"
description: "An overview of the features and capabilities of the service invocation building block"
weight: 100
---

Using service invocation, your application can discover and reliably and securely communicate with other applications using the standard protocols of [gRPC](https://grpc.io) or [HTTP](https://www.w3.org/Protocols/). 

## Overview
In many environments with multiple services that need to communicate with each other, developers often ask themselves the following questions:

* How do I discover and invoke methods on different services?
* How do I call other services securely?
* How do I handle retries and transient errors?
* How do I use distributed tracing to see a call graph to diagnose issues in production?

Dapr allows you to overcome these challenges by providing an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing, metrics, error handling and more.

Dapr uses a sidecar, decentralized architecture. To invoke an application using Dapr, you use the `invoke` API on any Dapr instance. The sidecar programming model encourages each applications to talk to its own instance of Dapr. The Dapr instances discover and communicate with one another.

The diagram below is an overview of how Dapr's service invocation works.

![Service Invocation Diagram](/images/service-invocation.png)

1. Service A makes an http/gRPC call meant for Service B.  The call goes to the local Dapr sidecar.  
2. Dapr discovers Service B's location using the [name resolution component](https://github.com/dapr/components-contrib/tree/master/nameresolution) installed for the given hosting platform.
3. Dapr forwards the message to Service B's Dapr sidecar 
    * Note: All calls between Dapr sidecars go over gRPC for performance. Only calls between services and Dapr sidecars are either HTTP or gRPC
4. Service B's Dapr sidecar forwards the request to the specified endpoint (or method) on Service B.  Service B then runs its business logic code.
5. Service B sends a response to Service A.  The response goes to Service B's sidecar.
6. Dapr forwards the response to Service A's Dapr sidecar.
7. Service A receives the response.

### Example
As an example for the above call sequence, suppose you have the applications as described in the [hello world sample](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md), where a python app invokes a node.js app.

In such a scenario, the python app would be "Service A" above, and the Node.js app would be "Service B".

The diagram below shows sequence 1-7 again on a local machine showing the API call:

![Service Invocation Diagram](../../images/service-invocation-example.png)

1. Suppose the Node.js app has a Dapr app ID of `nodeapp`, as in the sample.  The python app invokes the Node.js app's `neworder` method by posting `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`, which first goes to the python app's local Dapr sidecar.
2. Dapr discovers the Node.js app's location using multicast DNS component which runs on your local machine.
3. Dapr forwards the request to the Node.js app's sidecar.
4. The Node.js app's sidecar forwards the request to the Node.js app.  The Node.js app performs its business logic, which, as described in the sample, is to log the incoming message and then persist the order ID into Redis (not shown in the diagram above).

    Steps 5-7 are the same as above.

## Features
Service invocation provides several features to make it easy for you to call methods on remote applications.

- [Namespaces scoping](#namespaces-scoping)
- [Retries](#Retries)
- [Service-to-service security](#service-to-service-security)
- [Service access security](#service-access-security)
- [Observability: Tracing, logging and metrics](#observability)
- [Pluggable service discovery](#pluggable-service-discovery)


### Namespaces scoping
Service invocation supports calls across namespaces. On all supported hosting platforms, Dapr app IDs conform to a valid FQDN format that includes the target namespace. 

For example, the following string contains the app ID `nodeapp` in addition to the namespace the app runs in `production`.

```
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

This is especially useful in cross namespace calls in a Kubernetes cluster. Watch this [video](https://youtu.be/LYYV_jouEuA?t=495) for a demo on how to use namespaces with service invocation.

### Retries
Service invocation performs automatic retries with backoff time periods in the event of call failures and transient errors.
Errors that cause retries are:

* Network errors including endpoint unavailability and refused connections
* Authentication errors due to a renewing certificate on the calling/callee Dapr sidecars

Per call retries are performed with a backoff interval of 1 second up to a threshold of 3 times.
Connection establishment via gRPC to the target sidecar has a timeout of 5 seconds. 

### Service-to-service security
All calls between Dapr applications can be made secure with mutual (mTLS) authentication on hosted platforms, including automatic certificate rollover, via the Dapr Sentry service. The diagram below shows this for self hosted applications.

For more information read the [service-to-service security](../security#mtls-self-hosted) article.

![Self Hosted service to service security](../../images/security-mTLS-sentry-selfhosted.png)

### Service access security
Applications can control which other applications are allowed to call them and what they are authorized to do via access policies. This enables you to restrict sensitive applications, that say have personnel information, from being accessed by unauthorized applications, and combined with service-to-service secure communication, provides for soft multi-tenancy deployments.

For more information read the [access control allow lists for service invocation](../configuration#access-control-allow-lists-for-service-invocation) article.

### Observability
By default, all calls between applications are traced and metrics are gathered to provide insights and diagnostics for applications, which is especially important in production scenarios.  

For more information read the [observability](../concepts/observability) article.

### Pluggable service discovery
Dapr can run on any [hosting platform](../concepts/hosting). For the supported hosting platforms this means they have a [name resolution component](https://github.com/dapr/components-contrib/tree/master/nameresolution) developed for them that enables service discovery. For example, the Kubernetes name resolution component uses the Kubernetes DNS service to resolve the location of other applications running in the cluster.

## Next steps

* Follow these guide on
    * [How-to: Get started with HTTP service invocation](../../howto/invoke-and-discover-services)
    * [How-to: Get started with Dapr and gRPC](../../howto/create-grpc-app)
* Try out the [hello world sample](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) which shows how to use HTTP service invocation or visit the samples in each of the [Dapr SDKs](https://github.com/dapr/docs#further-documentation)
* Read the [service invocation API specification](../../reference/api/service_invocation_api.md)
