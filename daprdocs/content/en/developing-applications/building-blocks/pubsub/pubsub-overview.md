---
type: docs
title: "Publish and subscribe overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the Dapr Pub/Sub building block"
---

## Introduction

The [publish/subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) allows microservices to communicate with each other using messages. The **producer** sends messages to a **topic** without knowledge of what application will receive them. Similarly, a **consumer** will subscribe to the topic and receive its messages without any knowledge of what application produced these messages. This pattern is especially useful when you need to decouple microservices from one another.

The publish/subscribe API in Dapr provides an at-least-once guarantee and integrates with various message brokers and queuing systems. The specific implementation to your application is pluggable and configured externally at runtime. This approach removes the dependency from your application and, as a result, makes your application more portable. The complete list of available publish/subscribe implementations is available [here]({{< ref supported-pubsub >}}).

## Features

### Publish/Subscribe API

The publish/subscribe API is located in the [API reference]({{< ref pubsub_api.md >}}).

### Message Format

To enable message routing and to provide additional context with each message Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr will automatically be "wrapped" in Cloud Events envelope, using `Content-Type` header value for `datacontenttype` attribute.

Dapr implements the following Cloud Events fields:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)

The following example shows an XML content in CloudEvent v1.0 serialized as JSON:

```json
{
    "specversion" : "1.0",
    "type" : "xml.message",
    "source" : "https://example.com/message",
    "subject" : "Test XML Message",
    "id" : "id-1234-5678-9101",
    "time" : "2020-09-23T06:23:21Z",
    "datacontenttype" : "text/xml",
    "data" : "<note><to>User1</to><from>user2</from><message>hi</message></note>"
}
```

> Starting with v0.9 release, Dapr no longer wraps published content into CloudEvent if the published payload is already in the CloudEvent format. 

### Message Subscription 

Dapr allows two methods by which you can subscribe to topics: **declarative**, where a subscription is defined in an external file, and **programmatic**, where a subscription is defined in the user code. For more information see Dapr's documentation on [subscribing to a topic](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-publish-subscribe/#step-2-subscribe-to-topics).

### Message Delivery

In principle, Dapr considers message successfully delivered when the subscriber responds with a non-error response after processing the message. For more granular control, Dapr's publish/subscribe API also provides explicit statuses, defined in the response payload, which the subscriber can use to indicate the specific handling instructions to Dapr (e.g. `RETRY` or `DROP`). For more information message routing see [Dapr publish/subscribe API documentation]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### At-Least-Once guarantee

Dapr guarantees at-least-once semantics for message delivery. That means that when an application publishes a message to a topic using the publish/subscribe API, Dapr ensures that this message will be delivered at least once to every subscriber.

### Consumer groups and multiple instances

The burden of dealing with concepts like consumer groups and multiple application instances using a single consumer group is all handled automatically by Dapr. When multiple instances of the same application (same IDs) subscribe to a topic, Dapr delivers each message to only one instance of that application. Similarly, if two different applications (different IDs) subscribe to the same topic, Dapr will deliver each message to only one instance of each application.

### Topic scoping

By default, all topics backing the Dapr publish/subscribe component (e.g. Kafka, Redis, RabbitMQ) are available to every application configured with that component. To limit which application can publish or subscribe to topics, Dapr provides topic scoping. See [publish/subscribe topic scoping]({{< ref pubsub-scopes.md >}}) for more information.

## Next steps

- Read the How-To guide on [publishing and subscribing]({{< ref howto-publish-subscribe.md >}})
- Learn about [Pub/Sub scopes]({{< ref pubsub-scopes.md >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
