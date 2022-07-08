---
type: docs
title: "Dead Letter Topics"
linkTitle: "Dead Letter Topics"
weight: 4000
description: "Use subscription dead letter topics to forward undeliverable messages"
---

## Introduction

There are times when applications might not be able to handle messages for a variety of reasons. For example, there could be transient issues retrieving data needed to process a message or the app business logic fails returning an error.  Dead letter topics are used to forward messages that cannot be delivered to a subscribing app. This eases the pressure on app by freeing them from dealing with these failed messages, allowing developers to write code that reads from the dead letter topic and either fixes the message and resends this, or abandons it completely.

Dead letter topics are typically used in along with a retry resiliency policy and a dead letter subscription that handles the required logic for dealing with the messages forwarded from the dead letter topic.

When a dead letter topic is set, any message that failed to be delivered to an app for a configured topic is put on the dead letter topic to be forwarded to a subscription that handles these messages. This could be the same app or a completely different one.

Dapr enables dead letter topics for all of it's pub/sub components, even if the underlying system does not support this feature natively. For example the [AWS SNS Component]({{< ref "setup-aws-snssqs" >}}) has a dead letter queue and [RabbitMQ]({{< ref "setup-rabbitmq" >}}) has the dead letter topics. You will need to ensure that you configure components like this appropriately.

The diagram below is an example of how dead letter topics work. First a message is sent from a publisher on an `orders` topic. Dapr receives the message on behalf of a subscriber application, however the orders topic message fails to be delivered to the `/checkout` endpoint on the application, even after retries. As a result of the failure to deliver, the message is forwarded to the `poisonMessages` topic which delivers this to the `/failedMessages` endpoint to be processed, in this case on the same application. The `failedMessages` processing code could drop the message or resend a new message.

<img src="/images/pubsub_deadletter.png" width=1200>

## Configuring a dead letter topic with a declarative subscription

The following YAML shows how to configure a subscription with a dead letter topic named `poisonMessages` for messages consumed from the `orders` topic. This subscription is scoped to an app with a `checkout` ID.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: order
spec:
  topic: orders
  route: /checkout
  pubsubname: pubsub
  deadLetterTopic: poisonMessages
scopes:
- checkout
```

## Configuring a dead letter topic with programmatic subscription

The JSON returned from the `/subscribe` endpoint shows how to configure a dead letter topic named `poisonMessages` for messages consumed from the `orders` topic.

```javascript
app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "orders",
            route: "/checkout",
            deadLetterTopic: "poisonMessages"
        }
    ]);
});
```

## Retries and dead letter topics

By default, when a dead letter topic is set, any failing message immediately goes to the dead letter topic.  As a result it is recommend to always have a retry policy set when using dead letter topics in a subscription.
To enable the retry of a message before sending it to the dead letter topic, apply a [retry resiliency policy]({{< ref "policies.md#retries" >}}) to the pub/sub component.

This example shows how to set a constant retry policy named `pubsubRetry`, with 10 maximum delivery attempts applied every 5 seconds for the `pubsub` pub/sub component.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
spec:
  policies:
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10
  targets:
    components:
      pubsub:
        inbound:
          retry: pubsubRetry
```

## Configuring a subscription for handling the dead letter topics

Remember to now configure a subscription to handling the dead letter topics. For example you can create another declarative subscription to receive these on the same or a different application. The example below shows the checkout application subscribing to the `poisonMessages` topic with another subscription and sending these to be handled by the `/failedmessages` endpoint.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: deadlettertopics
spec:
  topic: poisonMessages
  route: /failedMessages
  pubsubname: pubsub
scopes:
- checkout
```

## Demo

Watch [this video for an overview of the dead letter topics](https://youtu.be/wLYYOJLt_KQ?t=69):

<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/wLYYOJLt_KQ?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Next steps

- For more information on resiliency policies, read [Resiliency overview]({{< ref resiliency-overview.md >}}).
- For more information on topic subscriptions, read [Declarative and programmatic subscription methods]({{< ref "pubsub-overview.md#message-subscription" >}}).
