---
type: docs
title: "Publish and subscribe overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the Pub/Sub API building block"
---

## Publish and subscribe pattern

The publish and subscribe pattern (Pub/Sub) enables microservices to communicate with each other using messages for event-driven architectures.

- The producer, or **publisher**, writes messages to an input channel and sends them to a topic, unaware which application will receive them.
- The consumer, or **subscriber**, subscribes to the topic and receives messages from an output channel, unaware which service produced these messages.

An intermediary message broker copies each message from a publisher's input channel to an output channel for all subscribers interested in that message. This pattern is especially useful when you need to decouple microservices from one another.

<img src="/images/pubsub-overview-pattern.png" width=1000>

<br></br>

## Pub/Sub API in Dapr

The Pub/Sub API in Dapr:
- Provides a platform-agnostic API to send and receive messages.
- Offers at-least-once message delivery guarantee.
- Integrates with various message brokers and queuing systems. 

The specific message broker used by your service is pluggable and configured as a Dapr Pub/Sub component at runtime. This removes the dependency from your service and makes your service more portable and flexible to changes.

When using Pub/Sub in Dapr:

1. Your service makes a network call to a Dapr Pub/Sub building block API.
1. The Pub/Sub building block makes calls into a Dapr Pub/Sub component that encapsulates a specific message broker.
1. To receive messages on a topic, Dapr subscribes to the Pub/Sub component on behalf of your service with a topic and delivers the messages to an endpoint on your service when they arrive.

In the diagram below, a "shipping" service and an "email" service have both subscribed to topics published by a "cart" service. Each service loads Pub/Sub component configuration files that point to the same Pub/Sub message bus component; for example: Redis Streams, NATS Streaming, Azure Service Bus, or GCP Pub/Sub.

<img src="/images/pubsub-overview-components.png" width=1000>
<br></br>

In the diagram below, the Dapr API posts an "order" topic from the publishing "cart" service to "order" endpoints on the "shipping" and "email" subscribing services.

<img src="/images/pubsub-overview-publish-API.png" width=1000>
<br></br>

[View the complete list of Pub/Sub components that Dapr supports]({{< ref supported-pubsub >}}).

## Dapr Pub/Sub API features

The Pub/Sub building block brings several features to your application.

### Sending messages using Cloud Events

Dapr Pub/Sub sends messages between services. To enable message routing and provide additional context with each message, Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr is automatically wrapped in a Cloud Events envelope, using [`Content-Type` header value]({{< ref "pubsub-overview.md#content-types" >}}) for `datacontenttype` attribute.

Dapr implements the following Cloud Events fields when creating a message topic.

* `id`
* `source`
* `specversion`
* `type`
* `traceparent`
* `datacontenttype` (optional)

The following example demonstrates an `orders` topic message sent by Dapr that includes a W3C `traceid` unique to the message, the `data` and the fields for the CloudEvent where the data content is serialized as JSON.

```json
{
    "topic": "orders",
    "pubsubname": "order_pub_sub",
    "traceid": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01",
    "tracestate": "",
    "data": {
    "orderId": 1
    },
    "id": "5929aaac-a5e2-4ca1-859c-edfe73f11565",
    "specversion": "1.0",
    "datacontenttype": "application/json; charset=utf-8",
    "source": "checkout",
    "type": "com.dapr.event.sent",
    "traceparent": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01"
}
```

As another example of a v1.0 CloudEvent, the following shows data as XML content in a CloudEvent message serialized as JSON:

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

#### Setting message content types

When publishing a message, it's important to specify the content type of the data being sent.
Unless specified, Dapr will assume `text/plain`.

For Dapr's HTTP API, the content type can be set in a `Content-Type` header.

gRPC clients and SDKs have a dedicated content type parameter.

#### Message delivery

In principle, Dapr considers a message successfully delivered once the subscriber processes the message and responds with a non-error response. For more granular control, Dapr's Pub/Sub API also provides explicit statuses, defined in the response payload, with which the subscriber indicates specific handling instructions to Dapr (for example, `RETRY` or `DROP`).

### Receiving messages with topic subscriptions

Dapr applications can subscribe to published topics via two methods that support the same features: declarative and programmatic.

| Subscription method | Description |
| ------------------- | ----------- |
| **Declarative** | Subscription is defined in an **external file**. The declarative approach removes the Dapr dependency from your code and allows for existing applications to subscribe to topics, without having to change code. |
| **Programmatic** | Subscription is defined in the **user code**. The programmatic approach implements the subscription in your code. |

For more information, read [about the subscriptions in the how-to]({{< ref howto-publish-subscribe.md >}}).

### Message routing

Dapr provides [content-based routing](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) pattern. [Pub/Sub routing]({{< ref howto-route-messages.md >}}) is an implementation of this pattern that allows developers to use expressions to route [CloudEvents](https://cloudevents.io) based on their contents to different URIs/paths and event handlers in your application. If no route matches, an optional default route is used. This is useful as your applications expands to support multiple event versions or special cases.

This feature is available to both the declarative and programmatic subscription approaches.

For more information on message routing, read [Dapr Pub/Sub API reference]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### At-least-once guarantee

Dapr guarantees at-least-once semantics for message delivery. When an application publishes a message to a topic using the Pub/Sub API, Dapr ensures the message is delivered *at least once* to every subscriber.

### Consumer groups and competing consumers pattern

Dapr automatically handles the burden of dealing with concepts like consumer groups and competing consumers pattern. The competing consumers pattern refers to multiple application instances using a single consumer group. When multiple instances of the same application (running same app IDs) subscribe to a topic, Dapr delivers each message to *only one instance of **that** application*. This concept is illustrated in the diagram below.

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

Similarly, if two different applications (with different app-IDs) subscribe to the same topic, Dapr delivers each message to *only one instance of **each** application*.

### Scoping topics for added security

By default, all topics backing the Dapr Pub/Sub component are available to every application configured with that component. You can limit which application can publish or subscribe to topics with Dapr topic scoping. For more information, read: [Pub/Sub topic scoping]({{< ref pubsub-scopes.md >}}).

### Message Time-to-Live (TTL)

Dapr can set a timeout message on a per-message basis, meaning that if the message is not read from the Pub/Sub component, then the message is discarded. This timeout message prevents a build up of unread messages. If a message has been in the queue longer than the configured TTL, it is marked as dead.

For more information, read [Pub/Sub message TTL]({{< ref pubsub-message-ttl.md >}}).

{{% alert title="Note" color="primary" %}}
 You can also set message TTL for a given queue at component creation. Look at the specific characteristic of the component that you are using.

{{% /alert %}}

### Communication with applications not using Dapr and CloudEvents

If one of your applications uses Dapr while another doesn't, you can disable the CloudEvent wrapping for a publisher or subscriber. This allows partial adoption of Dapr Pub/Sub in applications that cannot adopt Dapr all at once.

For more information, read [how to use Pub/Sub without CloudEvents]({{< ref "pubsub-cloudevents.md#publishing-raw-messages" >}}).

## Try it out

Want to put the Dapr Pub/Sub API to the test? Walk through the following quickstart and tutorials to see Pub/Sub in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Pub/Sub quickstart]({{< ref pubsub-quickstart.md >}}) | Send and receive messages using the publish and subscribe API. |
| [Pub/Sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component. |

## Next steps

* Learn [how Dapr Pub/Sub can work in your environment]({{< ref howto-publish-subscribe.md >}}).
* Follow the [How-To: Configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
* Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
* Learn about [message TTL]({{< ref pubsub-message-ttl.md >}})
* Learn more about [Pub/Sub with and without CloudEvent]({{< ref pubsub-cloudevents.md >}})
* List of [Pub/Sub components]({{< ref supported-pubsub.md >}})
* Read the [Pub/Sub API reference]({{< ref pubsub_api.md >}})

