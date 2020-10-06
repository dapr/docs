---
title: "Frequently Asked Questions and Answers"
linkTitle: "FAQs"
weight: 60
description: >
  Common questions we get asked about Dapr
---

## Networking and service meshes

### Understanding how Dapr works with service meshes

Dapr is a distributed application runtime.  Unlike a service mesh which is focused on networking concerns, Dapr is focused on providing building blocks that make it easier for developers to build microservices.  Dapr is developer-centric versus service meshes being infrastructure-centric.

Dapr can be used alongside any service mesh such as Istio and Linkerd. A service mesh is a dedicated network infrastructure layer designed to connect services to one another and provide insightful telemetry. A service mesh doesn’t introduce new functionality to an application.

That is where Dapr comes in. Dapr is a language agnostic programming model built on http and gRPC that provides distributed system building blocks via open APIs for asynchronous pub-sub, stateful services, service discovery and invocation, actors and distributed tracing. Dapr introduces new functionality to an app’s runtime. Both service meshes and Dapr run as side-car services to your application, one giving network features and the other distributed application capabilities.

Watch this [video](https://www.youtube.com/watch?v=xxU68ewRmz8&feature=youtu.be&t=140) on how Dapr and service meshes work together.

### Understanding how Dapr interoperates with the service mesh interface (SMI)

SMI is an abstraction layer that provides a common API surface across different service mesh technology.  Dapr can leverage any service mesh technology including SMI.

### Differences between Dapr, Istio and Linkerd

Read [How does Dapr work with service meshes?](https://github.com/dapr/dapr/wiki/FAQ#how-does-dapr-work-with-service-meshes) Istio is an open source service mesh implementation that focuses on Layer7 routing, traffic flow management and mTLS authentication between services. Istio uses a sidecar to intercept traffic going into and out of a container and enforces a set of network policies on them.

Istio is not a programming model and does not focus on application level features such as state management, pub-sub, bindings etc. That is where Dapr comes in.

## Performance Benchmarks
The Dapr project is focused on performance due to the inherent discussion of Dapr being a sidecar to your application. This [performance benchmark video](https://youtu.be/4kV3SHs1j2k?t=783) discusses and demos the work that has been done so far. The performance benchmark data is planned to be published on a regular basis. You can also run the perf tests in your own environment to get perf numbers. 

## Actors

### What is the relationship between Dapr, Orleans and Service Fabric Reliable Actors?

The actors in Dapr are based on the same virtual actor concept that [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) started, meaning that they are activated when called and deactivated after a period of time. If you are familiar with Orleans, Dapr C# actors will be familiar. Dapr C# actors are based on [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (which also came from Orleans) and enable you to take Reliable Actors in Service Fabric and migrate them to other hosting platforms such as Kubernetes or other on-premise environments.
Also Dapr is about more than just actors. It provides you with a set of best practice building blocks to build into any microservices application. See [Dapr overview](https://github.com/dapr/docs/blob/master/overview/README.md).

### Differences between Dapr from an actor framework

Virtual actors capabilities are one of the building blocks that Dapr provides in its runtime. With Dapr because it is programming language agnostic with an http/gRPC API, the actors can be called from any language. This allows actors written in one language to invoke actors written in a different language.

Creating a new actor follows a local call like `http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`, for example `http://localhost:3500/v1.0/actors/myactor/50/method/getData` to call the `getData` method on the newly created `myactor` with id `50`.

The Dapr runtime SDKs have language specific actor frameworks. The .NET SDK for example has C# actors. The goal is for all the Dapr language SDKs to have an actor framework. Currently .NET, Java and Python SDK have actor frameworks.

## Developer language SDKs and frameworks

### Does Dapr have any SDKs if I want to work with a particular programming language or framework?

To make using Dapr more natural for different languages, it includes language specific SDKs for Go, Java, JavaScript, .NET,  Python, RUST and C++. 

These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed, language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of their choice. And because these SDKs share the Dapr runtime, you get cross-language actor and functions support.

### What frameworks does Dapr integrated with?
Dapr can be integrated with any developer framework. For example, in the Dapr .NET SDK you can find ASP.NET Core integration, which brings stateful routing controllers that respond to pub/sub events from other services.

Dapr is integrated with the following frameworks;

- Logic Apps with Dapr [Workflows](https://github.com/dapr/workflows)
- Functions with Dapr [Azure Functions Extension](https://github.com/dapr/azure-functions-extension)
- Spring Boot Web apps in Java SDK
- ASP.NET Core in .NET SDK
- [Azure API Management](https://cloudblogs.microsoft.com/opensource/2020/09/22/announcing-dapr-integration-azure-api-management-service-apim/)
