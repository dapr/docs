# Dapr use cases

This document briefly describes scenarios that Dapr enables for your microservices. Each use case is accompanied with a link to learn more details.

## Service invocation

Dapr provides a uniform API that your microservice can use to find and reliably communicate with other microservices in your system. By using this API, your code can seamlessly take advantage of several built-in features:

- HTTP and [gRPC](https://grpc.io) support
- Robust retry logic
- Intelligent error handling
- Distributed tracing

Visit the following documents to learn more:

- [More details on service invocation](https://github.com/dapr/docs/blob/master/concepts/service-invocation/README.md)
- [How to get started with service invocation](https://github.com/dapr/docs/tree/master/howto/invoke-and-discover-services)


## State management

Dapr provides an abstraction API that abstracts over [many different databases](https://github.com/dapr/docs/blob/master/howto/setup-state-store/supported-state-stores.md). Your microservice can leverage these APIs to utilize any supported database without finding or adding a third party SDK to your codebase.

Visit the following documents to learn more:

- [More details on state management](https://github.com/dapr/docs/blob/master/concepts/state-management/README.md)
- [How to get started with state management](https://github.com/dapr/docs/tree/master/howto/setup-state-store)

## Pub/Sub

Dapr provides an API that enables event-driven architectures in your system. Each microservice can utilize the same API to leverage one of [many supported event buses](https://github.com/dapr/docs/tree/master/howto/setup-pub-sub-message-broker#reference). Microservices can communicate each other by sending or subscribing to _events_ on specific _topics_. By leveraging this communication style, your microservices remain flexible and loosely coupled.

Visit the following documents to learn more:

- [More details on pub/sub](https://github.com/dapr/docs/blob/master/concepts/publish-subscribe-messaging/README.md)
- [How to get started with pub/sub](https://github.com/dapr/docs/tree/master/howto/setup-pub-sub-message-broker)

## Bindings

Similar to pub/sub, Dapr provides a mechanism that can trigger your app in response to an event. Dapr provides bindings to enable your app to respond to events that come from external (outside your system) sources, while pub/sub events come from internal sources.

For example, your microservice can respond to incoming Twilio/SMS messages using bindings. Your app can focus on the business logic to _responds_ to the incoming SMS event rather than adding and configuring a third party Twilio SDK.

Similarly, your application can _send_ messages to external destinations using the bindings feature. In the Twilio example, your application would send an SMS, again without adding or configuring a third party Twilio SDK.

Visit the following documents to learn more:

- [More details on bindings](https://github.com/dapr/docs/tree/master/concepts/bindings)
- [How to get started with receiving events using bindings](https://github.com/dapr/docs/tree/master/howto/trigger-app-with-input-binding)
- [How to get started with sending events using bindings](https://github.com/dapr/docs/tree/master/howto/send-events-with-output-bindings)

## Actors

Dapr provides an API and runtime that allows you to write your business logic as an isolated unit, without worrying about concurrency or other actors. Dapr calls this single isolated unit an "actor". Your running actors can send a message to another actor or can request to create a new actor. In the former case, Dapr manages routing the message to the proper destination. In the latter case, Dapr manages all the state management, synchronization, and concurrency involved with starting the new actor.

The [actor model](https://en.wikipedia.org/wiki/Actor_model) is a battle-tested programming pattern and as such, comes with very specific use cases:

- You have a large system composed of many (thousands or more) small microservices, in which the code to _manage_ these microservices (e.g. distribution across nodes, failover, ...) is very complex
- Your microservice(s) do not need concurrent access to state and can instead can [share state by communicating](https://blog.golang.org/codelab-share)
- Your code does operations that have unpredictable latency, such as I/O operations to external web services

Visit the following documents to learn more:

- [More details on actors](https://github.com/dapr/docs/tree/master/concepts/actors)
- [Getting started with actors on the .Net platform](https://github.com/dapr/dotnet-sdk/blob/master/docs/get-started-dapr-actor.md)
- [Getting started with actors with the Java SDK](https://github.com/dapr/java-sdk)

## Mutual TLS

Dapr enables code-free end-to-end encryption in communication between microservices, called [mutual TLS (mTLS)](https://www.codeproject.com/articles/326574/an-introduction-to-mutual-ssl-authentication). In short, mTLS is a commonly-used security mechanism that provides the following features:

- Two way authentication - the client proving its identify to the server, and vice-versa
- An encrypted channel for all in-flight communication, after two-way authentication is established  

Mutual TLS is useful in almost all scenarios, but especially so for systems subject to regulations such as [HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act) and [PCI](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard).

Visit the following documents to learn more:

- [More details on mTLS](https://github.com/dapr/docs/blob/master/concepts/security/README.md)
- [How to set up mTLS](https://github.com/dapr/docs/tree/master/howto/configure-mtls)

## Secrets storage

Dapr provides a consistent, secure API for accessing sensitive data, such as private keys for cloud services or database passwords, that your business logic needs. Using secret stores, you can remove secrets from your source code repositories and replace them with references to secrets in a Dapr secret store. Not only is doing so more secure, it also enables best security practices such as [key rotation](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-key-rotation-log-monitoring).

Visit the following documents to learn more:

- [More details on secrets storage](https://github.com/dapr/docs/tree/master/concepts/secrets)
- [How to set up secrets storage](https://github.com/dapr/docs/tree/master/howto/setup-secret-store)

