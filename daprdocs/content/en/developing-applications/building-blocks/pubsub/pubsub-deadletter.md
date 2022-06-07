---
type: docs
title: "Dead Letter Topics"
linkTitle: "Dead Letter Topics"
weight: 2250
description: "Use dead letter topics to capture undeliverable messages"
---

## Introduction

Dead letter topics are used to hold messages that cannot be delivered to any receiver. This eases the pressure on receivers by freeing them from dealing with poison messages, while allowing developers to write code that reads from the dead letter topic and either fix the message or abandon it completely.

When a dead letter topic is set, any message that failed to be delivered to an app for a configured topic will be put on the dead letter topic.

Dapr enables dead letter topics for every all of it's pub/sub components, regardless if the underlying system supports this feature natively or not.

## Configuring a dead letter topic through YAML

The following YAML shows how to configure a dead letter topic named `poison` for messages consumed from the `orders` topic.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: orders
spec:
  topic: orders
  route: /checkout
  pubsubname: nats
  deadLetterTopic: poison
scopes:
- checkout
```

## Configuring a dead letter topic programatically

The JSON returned from the `/subscribe` endpoint shows how to configure a dead letter topic named `poison` for messages consumed from the `orders` topic.

```javascript
app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "nats",
            topic: "orders",
            route: "/checkout",
            deadLetterTopic: "poison"
        }
    ]);
});
```

## Retries and dead letter topics

By default, when a dead letter topic is set, any failing message will immediately go to the dead letter topic.
To allow Dapr to retry the message before sending it to the dead letter topic, you can use a [retry resiliency policy]({{< ref "policies.md#retries" >}}):

This example shows how to set a constant retry, with 10 maximum delivery attempts every 5 seconds for the `nats` pub/sub components.

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
      nats:
        inbound:
          retry: pubsubRetry
```

For more information on resiliency policies, read [here]({{< ref resiliency-overview.md >}}).
