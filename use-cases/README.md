# Dapr use cases

This document briefly describes scenarios that Dapr enables for your microservices. Each use case is accompanied with a link to learn more details.

## Pub/Sub

Dapr provides an API that enables event-driven architectures in your system. Each microservice can utilize the same API to leverage one of [many supported event buses](https://github.com/dapr/docs/tree/master/howto/setup-pub-sub-message-broker#reference). Microservices can communicate each other by sending or subscribing to _events_ on specific _topics_. By leveraging this communication style, your microservices remain flexible and loosely coupled.

Visit the following documents to learn more:

- [More details on pub/sub](https://github.com/dapr/docs/blob/master/concepts/publish-subscribe-messaging/README.md)
- [How to get started with pub/sub](https://github.com/dapr/docs/tree/master/howto/setup-pub-sub-message-broker)


