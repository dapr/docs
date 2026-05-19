---
type: docs
title: "How to: Set up pub/sub namespace consumer groups"
linkTitle: "How to: Namespace consumer groups"
weight: 5000
description: "Learn how to use the metadata-based namespace consumer group in your component" 
---

You've set up [Dapr's pub/sub API building block]({{% ref pubsub-overview %}}), and your applications are publishing and subscribing to topics smoothly, using a centralized message broker. What if you'd like to perform simple A/B testing, blue/green deployments, or even canary deployments for your applications? Even with using Dapr, this can prove difficult.

Dapr solves multi-tenancy at-scale with its pub/sub namespace consumer groups construct. 

## Without namespace consumer groups

Let's say you have a Kubernetes cluster, with two applications (App1 and App2) deployed to the same namespace (namespace-a). App2 publishes to a topic called `order`, while App1 subscribes to the topic called `order`. This will create two consumer groups, named after your applications (App1 and App2).

<img src="/images/howto-namespace/basic-pubsub.png" width=1000 alt="Diagram showing basic pubsub process.">

In order to perform simple testing and deployments while using a centralized message broker, you create another namespace with two applications of the same `app-id`, App1 and App2. 

Dapr creates consumer groups using the `app-id` of individual applications, so the consumer group names will remain App1 and App2. 

<img src="/images/howto-namespace/without-namespace.png" width=1000 alt="Diagram showing complications around multi-tenancy without Dapr namespace consumer groups.">

To avoid this, you'd then need to have something "creep" into your code to change the `app-id`, depending on the namespace on which you're running. This workaround is cumbersome and a significant painpoint.

## With namespace consumer groups

Not only can Dapr allow you to change the behavior of a consumer group with a consumerID for your UUID and pod names, Dapr also provides a **namespace construct** that lives in the pub/sub component metadata. For example, using Redis as your message broker:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: consumerID
    value: "{namespace}"
```

By configuring `consumerID` with the `{namespace}` value, you'll be able to use the same `app-id` with the same topics from different namespaces.

<img src="/images/howto-namespace/with-namespace.png" width=1000 alt="Diagram showing how namespace consumer groups help with multi-tenancy.">

In the diagram above, you have two namespaces, each with applications of the same `app-id`, publishing and subscribing to the same logical topic `orders`. Dapr namespaces the underlying broker entities so the two namespaces do not interfere with each other.

Without you needing to change your code/`app-id`, the namespace consumer group allows you to:
- Add more namespaces
- Use the same topic names **in your application code** across namespaces
- Keep the same `app-id` across namespaces
- Have your entire deployment pipeline remain intact

Simply include the `"{namespace}"` consumer group construct in your component metadata. You don't need to encode the namespace in the metadata. Dapr understands the namespace it is running in and completes the namespace value for you, like a dynamic metadata value injected by the runtime.

{{% alert title="Important: how namespacing appears on the broker" color="warning" %}}
When `{namespace}` appears anywhere in a pub/sub component's metadata, Dapr namespace-scopes the **whole component** — not just the `consumerID` field. The Kubernetes namespace is prefixed onto **both** the topic and the subscription/consumer-group on every publish and subscribe.

For example, with namespace `team-a` and a logical topic `orders`, the entities created on the broker are:
- Topic: `team-aorders`
- Subscription / consumer group: `team-a.<appID>`

From your application code's perspective the topic name is preserved end-to-end — Dapr strips the prefix on the receive path before delivering messages to your app, and the `app is subscribed to the following topics: [...]` sidecar log line also shows the un-prefixed name. The prefix only exists on the wire and on the broker.

This behavior applies to **all** pub/sub brokers (the prefix is applied in the broker-agnostic runtime layer), including brokers where topics and consumer groups are distinct concepts (e.g., Azure Service Bus, Kafka, RabbitMQ). If you want a **shared** broker topic with unique-per-app subscriptions, drop `{namespace}` from the component metadata and make the `consumerID` unique another way (for example, `consumerID: "{appID}"`).
{{% /alert %}}

{{% alert title="Note" color="primary" %}}
If you add the namespace consumer group to your metadata afterwards, Dapr updates everything for you. This means that you can add namespace metadata value to existing pub/sub deployments.
{{% /alert %}}

## Demo

Watch [this video for an overview on pub/sub multi-tenancy](https://youtu.be/eK463jugo0c?t=1188):

{{< youtube id=eK463jugo0c start=1188 >}}

## Next steps

- Learn more about configuring Pub/Sub components with multiple namespaces [pub/sub namespaces]({{% ref pubsub-namespaces %}}).