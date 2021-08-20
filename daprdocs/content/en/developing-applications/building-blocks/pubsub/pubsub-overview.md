---
type: docs
title: "Publish and subscribe overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the Pub/Sub building block"
---

## Introduction

The [publish/subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) allows microservices to communicate with each other using messages. The **producer or publisher** sends messages to a **topic** without knowledge of what application will receive them. This involves writing them to an input channel. Similarly, a **consumer or subscriber** subscribes to the topic and receive its messages without any knowledge of what service produced these messages. This involves receiving messages from an output channel. An intermediary message broker is responsible for copying each message from an input channel to an output channels for all subscribers interested in that message. This pattern is especially useful when you need to decouple microservices from one another.

The publish/subscribe API in Dapr provides an at-least-once guarantee and integrates with various message brokers and queuing systems. The specific implementation used by your service is pluggable and configured as a Dapr pub/sub component at runtime. This approach removes the dependency from your service and, as a result, makes your service more portable and flexible to changes.

The complete list of Dapr pub/sub components is [here]({{< ref supported-pubsub >}}).

<img src="/images/pubsub-overview-pattern.png" width=1000>

<br></br>

The Dapr pub/sub building block provides a platform-agnostic API to send and receive messages. Your services publish messages to a named topic and also subscribe to a topic to consume the messages.

The service makes a network call to a Dapr pub/sub building block, exposed as a sidecar. This building block then makes calls into a Dapr pub/sub component that encapsulates a specific message broker product. To receive topics, Dapr subscribes to the Dapr pub/sub component on behalf of your service and delivers the messages to an endpoint when they arrive.

The diagram below shows an example of a "shipping" service and an "email" service that have both subscribed to topics that are published by the "cart" service. Each service loads pub/sub component configuration files that point to the same pub/sub message bus component, for example Redis Streams, NATS Streaming, Azure Service Bus, or GCP Pub/Sub.

<img src="/images/pubsub-overview-components.png" width=1000>
<br></br>

The diagram below has the same services, however this time showing the Dapr publish API that sends an "order" topic and order endpoints on the subscribing services that these topic messages are delivered posted to by Dapr.

<img src="/images/pubsub-overview-publish-API.png" width=1000>
<br></br>

## Features
The pub/sub building block provides several features to your application.

### Cloud Events message format

To enable message routing and to provide additional context with each message, Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr is automatically  "wrapped" in a Cloud Events envelope, using `Content-Type` header value for `datacontenttype` attribute.

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

### Message subscription

Dapr applications can subscribe to published topics. Dapr allows two methods by which your applications can subscribe to topics:

 - **Declarative**, where a subscription is defined in an external file,
 - **Programmatic**, where a subscription is defined in the user code.

 Both declarative and programmatic approaches support the same features. The declarative approach removes the Dapr dependency from your code and allows for existing applications to subscribe to topics, without having to change code. The programmatic approach implements the subscription in your code.

  For more information read [How-To: Publish a message and subscribe to a topic]({{< ref howto-publish-subscribe >}}).


### Message delivery

In principle, Dapr considers message successfully delivered when the subscriber responds with a non-error response after processing the message. For more granular control, Dapr's publish/subscribe API also provides explicit statuses, defined in the response payload, which the subscriber can use to indicate the specific handling instructions to Dapr (e.g. `RETRY` or `DROP`). For more information on message routing read [Dapr publish/subscribe API documentation]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### At-least-once guarantee

Dapr guarantees "At-Least-Once" semantics for message delivery. That means that when an application publishes a message to a topic using the publish/subscribe API, Dapr ensures that this message will be delivered at least once to every subscriber.

### Consumer groups and competing consumers pattern

The burden of dealing with concepts like consumer groups and multiple application instances using a single consumer group is all handled automatically by Dapr. When multiple instances of the same application (running same app-IDs) subscribe to a topic, Dapr delivers each message to *only one instance of **that** application*. This is commonly known as the competing consumers pattern and is illustrated in the diagram below.

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

Similarly, if two different applications (different app-IDs) subscribe to the same topic, Dapr deliver each message to *only one instance of **each** application*.

### Topic scoping

By default, all topics backing the Dapr pub/sub component (e.g. Kafka, Redis Stream, RabbitMQ) are available to every application configured with that component. To limit which application can publish or subscribe to topics, Dapr provides topic scoping. This enables to you say which topics an application is allowed to publish and which topics an application is allowed to subscribe to. For more information read [publish/subscribe topic scoping]({{< ref pubsub-scopes.md >}}).

### Message Time-to-Live (TTL)
Dapr can set a timeout message on a per message basis, meaning that if the message is not read from the pub/sub component, then the message is discarded. This is to prevent the build up of messages that are not read. A message that has been in the queue for longer than the configured TTL is said to be dead.  For more information read [publish/subscribe message time-to-live]({{< ref pubsub-message-ttl.md >}}).

- Note: Message TTL can also be set for a given queue at the time of component creation. Look at the specific characteristic of the component that you are using.

### Communication with applications not using Dapr and CloudEvents
For scenarios where one application uses Dapr but another doesn't, CloudEvent wrapping can be disabled for a publisher or subscriber. This allows partial adoption of Dapr pubsub in applications that cannot adopt Dapr all at once. For more information read [how to use pubsub without CloudEvent]({{< ref pubsub-raw.md >}}).

### Publish/Subscribe API

The publish/subscribe API is located in the [API reference]({{< ref pubsub_api.md >}}).

## Next steps

* Follow these guides on:
    * [How-To: Publish a message and subscribe to a topic]({{< ref howto-publish-subscribe.md >}})
    * [How-To: Configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
* Try out the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/pub-sub)
* Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
* Learn about [message time-to-live (TTL)]({{< ref pubsub-message-ttl.md >}})
* Learn about [pubsub without CloudEvent]({{< ref pubsub-raw.md >}})
* List of [pub/sub components]({{< ref supported-pubsub.md >}})
* Read the [pub/sub API reference]({{< ref pubsub_api.md >}})
