
# Dapr overview

Dapr is a portable, event-driven runtime that makes it easy for enterprise developers to build resilient, microservice stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks. 


## Any language, any framework, anywhere

Today we are experiencing a wave of cloud adoption. Developers are comfortable with web + database application architectures (for example classic 3-tier designs), but not with microservice application architectures which are inherently distributed. It’s hard to become a distributed systems expert, nor should you have to. Developers want to focus on business logic, while leaning on he platforms to imbue their applications with scale, resiliency, maintainability, elasticity and the other attributes of cloud-native architectures.

This is where Dapr comes in. Darp codifies the *best practices* for building microservice applications into open, independent building blocks that enable you to build portable applications with the language and framework of your choice. Each building block is completely independent and you can use one, some or all of them in your application.

In addition Dapr is platform agnostic meaning you can run your applications locally, on any Kubernetes cluster and other hosting environments that Dapr integrates with. This enables you to build microservice applications that can run on both the cloud and edge. 

In summary, you can use Dapr to build microservice applications using any language, any framework, and run them anywhere.

## What capabilities does Dapr provide?

There are many considerations when architecting and building microservices applications. Dapr provides best practices for common capabilities when building microservice applications that developers can use in a standard way and deploy to any environment. It does this by providing distributed system building blocks.

Each of these building blocks are independent, meaning that you can use one, some or all of them in your application.  In this first release of Dapr, the following building blocks are provided;

• **Service invocation** Resilent service-to-service invocaton enables method calls, including retries, on remote services wherever they are located in the supported hosting environment.

• **State Management** With state management for key/value pairs, long running, highly available, stateful services as well as shorter lived, stateless services can be easily written in the same application. The state store is pluggable and can include Azure Cosmos, AWS DynamoDB or Redis among  others.

• **Publish and subscribe messaging between services** Publishing events and subscribing to topics between services enables event-driven architectures to simplify horizontal scalability and make them resilient to failure. Dapr provides at least once message delivery guarantee.

• **Event driven resource bindings**. Resource bindings and triggers further builds on event-driven architectures for scale and resiliency by receiving and sending events to and from any external resource such as databases, queues, file systems, etc.

• **Actors** as the pattern for stateless and stateful objects that make concurrency simple with method and state encapsulation. Dapr provides many capabilities in its actor runtime including concurrency, state, life-cycle management for actor activation/deactivation and timers and reminders to wake up actors. Dapr also includes language specific actor SDKs built on this runtime for improved usability. And because these SDK share a common actor runtime, you even get cross-language actor support.  

•**Distributed tracing between services** to easily diagnose and observe inter-service calls in production using the W3C Trace Context standard.

## Dapr distributed system building blocks 

The diagram below shows the distributed system building blocks provides by Dapr, exposed with standard APIs. These APIs can be used from any developer code over http or gRPC. Dapr integrates with any hosting platform to enable application portability including across cloud and edge.

![Dapr overview](images/overview.png)
