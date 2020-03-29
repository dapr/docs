# FAQ

- **[Networking and service meshes](#networking-and-service-meshes)**
- **[Actors](#actors)**
- **[Developer language SDKs and frameworks](#developer-language-sdks-and-frameworks)**

## Networking and service meshes

### Understanding how Dapr works with service meshes

Dapr is a distributed application runtime.  Unlike a service mesh which is focused on networking concerns, Dapr is focused on providing building blocks that make it easier for developers to build microservices.  Dapr is developer-centric versus service meshes being infrastructure-centric.

Dapr can be used alongside any service mesh such as Istio and Linkerd. A service mesh is a dedicated network infrastructure layer designed to connect services to one another and provide insightful telemetry. A service mesh doesn’t introduce new functionality to an application.

That is where Dapr comes in. Dapr is a language agnostic programming model built on http and gRPC that provides distributed system building blocks via open APIs for asynchronous pub-sub, stateful services, service discovery and invocation, actors and distributed tracing. Dapr introduces new functionality to an app’s runtime. Both service meshes and Dapr run as side-car services to your application, one giving network features and the other distributed application capabilities.

### Understanding how Dapr interoperates with the service mesh interface (SMI)

SMI is an abstraction layer that provides a common API surface across different service mesh technology.  Dapr can leverage any service mesh technology including SMI.

### Differences between Dapr and Istio

Read [How does Dapr work with service meshes?](https://github.com/dapr/dapr/wiki/FAQ#how-does-dapr-work-with-service-meshes) Istio is an open source service mesh implementation that focuses on Layer7 routing, traffic flow management and mTLS authentication between services. Istio uses a sidecar to intercept traffic going into and out of a container and enforces a set of network policies on them.

Istio is not a programming model and does not focus on application level features such as state management, pub-sub, bindings etc. That is where Dapr comes in.

## Actors

### Relationship between Dapr, Orleans and Service Fabric Reliable Actors

The actors in Dapr are based on the same virtual actor concept that [Orleans](https://www.microsoft.com/research/project/orleans-virtual-actors/) started, meaning that they are activated when called and garbage collected after a period of time. If you are familiar with Orleans, Dapr C# actors will be familiar. Dapr C# actors are based on [Service Fabric Reliable Actors](https://docs.microsoft.com/azure/service-fabric/service-fabric-reliable-actors-introduction) (which also came from Orleans) and enable you to take Reliable Actors in Service Fabric and migrate them to other hosting platforms such as Kubernetes or other on-premise environments.
Also Dapr is about more than just actors. It provides you with a set of best practice building blocks to build into any microservices application. See [Dapr overview](https://github.com/dapr/docs/blob/master/overview.md)

### Differences between Dapr from an actor framework

Virtual actors capabilities are one of the building blocks that Dapr provides in its runtime. With Dapr because it is programming language agnostic with an http/gRPC API, the actors can be called from any language. This allows actors written in one language to invoke actors written in a different language.

Creating a new actor follows a local call like `http://localhost:3500/v1.0/actors/<actorType>/<actorId>/…`, for example `http://localhost:3500/v1.0/actors/myactor/50/method/getData` to call the `getData` method on the newly created `myactor` with id `50`.

The Dapr runtime SDKs have language specific actor frameworks. The .NET SDK for example has C# actors. The goal is for all the Dapr language SDKs to have an actor framework.

## Developer language SDKs and frameworks

### Does Dapr have any SDKs if I want to work with a particular programming language or framework?

To make using Dapr more natural for different languages, it includes language specific SDKs for Go, Java, JavaScript, .NET and Python. These SDKs expose the functionality in the Dapr building blocks, such as saving state, publishing an event or creating an actor, through a typed, language API rather than calling the http/gRPC API. This enables you to write a combination of stateless and stateful functions and actors all in the language of their choice. And because these SDKs share the Dapr runtime, you get cross-language actor and functions support.

Dapr can be integrated with any developer framework. For example, in the Dapr .NET SDK you can find ASP.NET Core integration, which brings stateful routing controllers that respond to pub/sub events from other services.
