# Dapr use cases

This document briefly describes scenarios that Dapr enables for your microservices. Each use case is accompanied with a link to learn more details.

## Pub/Sub

Dapr provides an API that enables event-driven architectures in your system. Each microservice can utilize the same API to leverage one of [many supported event buses](https://github.com/dapr/docs/tree/master/howto/setup-pub-sub-message-broker#reference). Microservices can communicate each other by sending or subscribing to _events_ on specific _topics_. By leveraging this communication style, your microservices remain flexible and loosely coupled.

Visit the following documents to learn more:

- [More details on pub/sub](https://github.com/dapr/docs/blob/master/concepts/publish-subscribe-messaging/README.md)
- [How to get started with pub/sub](https://github.com/dapr/docs/tree/master/howto/setup-pub-sub-message-broker)

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

