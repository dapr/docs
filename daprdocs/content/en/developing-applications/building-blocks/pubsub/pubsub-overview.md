---
type: docs
title: "Publish and subscribe overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the pub/sub API building block"
---

Publish and subscribe (pub/sub) enables microservices to communicate with each other using messages for event-driven architectures.

- The producer, or **publisher**, writes messages to an input channel and sends them to a topic, unaware which application will receive them.
- The consumer, or **subscriber**, subscribes to the topic and receives messages from an output channel, unaware which service produced these messages.

An intermediary message broker copies each message from a publisher's input channel to an output channel for all subscribers interested in that message. This pattern is especially useful when you need to decouple microservices from one another.

<img src="/images/pubsub-overview-pattern.png" width=1000>

<br></br>

## Pub/sub API

The pub/sub API in Dapr:
- Provides a platform-agnostic API to send and receive messages.
- Offers at-least-once message delivery guarantee.
- Integrates with various message brokers and queuing systems. 

The specific message broker used by your service is pluggable and configured as a Dapr pub/sub component at runtime. This removes the dependency from your service and makes your service more portable and flexible to changes.

When using pub/sub in Dapr:

1. Your service makes a network call to a Dapr pub/sub building block API.
1. The pub/sub building block makes calls into a Dapr pub/sub component that encapsulates a specific message broker.
1. To receive messages on a topic, Dapr subscribes to the pub/sub component on behalf of your service with a topic and delivers the messages to an endpoint on your service when they arrive.

In the diagram below, a "shipping" service and an "email" service have both subscribed to topics published by a "cart" service. Each service loads pub/sub component configuration files that point to the same pub/sub message broker component; for example: Redis Streams, NATS Streaming, Azure Service Bus, or GCP pub/sub.

<img src="/images/pubsub-overview-components.png" width=1000>
<br></br>

In the diagram below, the Dapr API posts an "order" topic from the publishing "cart" service to "order" endpoints on the "shipping" and "email" subscribing services.

<img src="/images/pubsub-overview-publish-API.png" width=1000>
<br></br>

[View the complete list of pub/sub components that Dapr supports]({{< ref supported-pubsub >}}).

## Features

The pub/sub API building block brings several features to your application.

### Sending messages using Cloud Events

To enable message routing and provide additional context with each message between services, Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr is automatically wrapped in a Cloud Events envelope, using [`Content-Type` header value]({{< ref "pubsub-overview.md#content-types" >}}) for `datacontenttype` attribute.

For more information, read about [messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}}), or [sending raw messages without CloudEvents]({{< ref pubsub-raw.md >}}).

### Communication with applications not using Dapr and CloudEvents

If one of your applications uses Dapr while another doesn't, you can disable the CloudEvent wrapping for a publisher or subscriber. This allows partial adoption of Dapr pub/sub in applications that cannot adopt Dapr all at once.

For more information, read [how to use pub/sub without CloudEvents]({{< ref pubsub-raw.md >}}).

### Setting message content types

When publishing a message, it's important to specify the content type of the data being sent. Unless specified, Dapr will assume `text/plain`.

- HTTP client: the content type can be set in a `Content-Type` header
- gRPC client and SDK: have a dedicated content type parameter

### Message delivery

In principle, Dapr considers a message successfully delivered once the subscriber processes the message and responds with a non-error response. For more granular control, Dapr's pub/sub API also provides explicit statuses, defined in the response payload, with which the subscriber indicates specific handling instructions to Dapr (for example, `RETRY` or `DROP`).

### Receiving messages with topic subscriptions

Dapr applications can subscribe to published topics via two methods that support the same features: declarative and programmatic.

| Subscription method | Description |
| ------------------- | ----------- |
| **Declarative** | Subscription is defined in an **external file**. The declarative approach removes the Dapr dependency from your code and allows for existing applications to subscribe to topics, without having to change code. |
| **Programmatic** | Subscription is defined in the **user code**. The programmatic approach implements the subscription in your code. |

For more information, read [about the subscriptions in Subscription Methods]({{< ref subscription-methods.md >}}).

### Message routing

Dapr provides [content-based routing](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) pattern. [Pub/sub routing]({{< ref howto-route-messages.md >}}) is an implementation of this pattern that allows developers to use expressions to route [CloudEvents](https://cloudevents.io) based on their contents to different URIs/paths and event handlers in your application. If no route matches, an optional default route is used. This is useful as your applications expands to support multiple event versions or special cases.

This feature is available to both the declarative and programmatic subscription approaches.

For more information on message routing, read [Dapr pub/sub API reference]({{< ref "pubsub_api.md#provide-routes-for-dapr-to-deliver-topic-events" >}})

### Handling failed messages with dead letter topics

Sometimes, messages can't be processed because of a variety of possible issues, such as erroneous conditions within the producer or consumer application or an unexpected state change that causes an issue with your application code. Dapr allows developers to set dead letter topics to deal with messages that cannot be delivered to an application. This feature is available on all pub/sub components and prevents consumer applications from endlessly retrying a failed message. For more information, read about [dead letter topics]({{< ref "pubsub-deadletter.md">}})

### Namespace consumer groups

Dapr solves multi-tenancy at-scale with [namespaces for consumer groups]({{< ref howto-namespace >}}). Simply include the `"{namespace}"` value in your component metadata for consumer groups to allow multiple namespaces with applications of the same `app-id` to publish and subscribe to the same message broker.

### At-least-once guarantee

Dapr guarantees at-least-once semantics for message delivery. When an application publishes a message to a topic using the pub/sub API, Dapr ensures the message is delivered *at least once* to every subscriber.

### Consumer groups and competing consumers pattern

Dapr automatically handles the burden of dealing with concepts like consumer groups and competing consumers pattern. The competing consumers pattern refers to multiple application instances using a single consumer group. When multiple instances of the same application (running same Dapr app ID) subscribe to a topic, Dapr delivers each message to *only one instance of **that** application*. This concept is illustrated in the diagram below.

<img src="/images/pubsub-overview-pattern-competing-consumers.png" width=1000>
<br></br>

Similarly, if two different applications (with different app-IDs) subscribe to the same topic, Dapr delivers each message to *only one instance of **each** application*.

### Scoping topics for added security

By default, all topic messages associated with an instance of a pub/sub component are available to every application configured with that component. You can limit which application can publish or subscribe to topics with Dapr topic scoping. For more information, read: [pub/sub topic scoping]({{< ref pubsub-scopes.md >}}).

### Message Time-to-Live (TTL)

Dapr can set a timeout message on a per-message basis, meaning that if the message is not read from the pub/sub component, then the message is discarded. This timeout message prevents a build up of unread messages. If a message has been in the queue longer than the configured TTL, it is marked as dead. For more information, read [pub/sub message TTL]({{< ref pubsub-message-ttl.md >}}).

### Publish and subscribe to bulk messages

Dapr supports sending and receiving multiple messages in a single request. When writing applications that need to send or receive a large number of messages, using bulk operations allows achieving high throughput by reducing the overall number of requests. For more information, read [pub/sub bulk messages]({{< ref pubsub-bulk.md >}}).

### Scaling subscribers with StatefulSets

When running on Kubernetes, subscribers can have a sticky `consumerID` per instance when using StatefulSets in combination with the `{podName}` marker. See [how to horizontally scale subscribers with StatefulSets]({{< ref "howto-subscribe-statefulset.md" >}}).

## Try out pub/sub

### Quickstarts and tutorials

Want to put the Dapr pub/sub API to the test? Walk through the following quickstart and tutorials to see pub/sub in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Pub/sub quickstart]({{< ref pubsub-quickstart.md >}}) | Send and receive messages using the publish and subscribe API. |
| [Pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component. |

### Start using pub/sub directly in your app

Want to skip the quickstarts? Not a problem. You can try out the pub/sub building block directly in your application to publish messages and subscribe to a topic. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the pub/sub API starting with [the pub/sub how-to guide]({{< ref howto-publish-subscribe.md >}}).


## Next steps

- Learn about [messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}}) and when you might want to [send messages without CloudEvents]({{< ref pubsub-raw.md >}}).
- Follow [How-To: Configure pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}}).
- Review the list of [pub/sub components]({{< ref setup-pubsub >}}).
- Read the [API reference]({{< ref pubsub_api.md >}}).
