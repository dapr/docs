---
type: docs
title: "Subscription spec"
linkTitle: "Subscription"
weight: 2000
description: "The basic spec for a Dapr subscription"
---

The `Subscription` Dapr resource allows you to subscribe declaratively to a topic using an external component YAML file. This guide demonstrates two subscription API versions:

- `v2alpha` (default spec)
- `v1alpha1` (deprecated)

## `v2alpha1` format

The following is the basic `v2alpha1` spec for a `Subscription` resource. `v2alpha1` is the default spec for the subscription API.

```yml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: <REPLACE-WITH-NAME>
spec:
  topic: <REPLACE-WITH-TOPIC-NAME> # Required
  routes: # Required
    rules:
      - match: <REPLACE-WITH-CEL-FILTER>
        path: <REPLACE-WITH-PATH>
  pubsubname: <REPLACE-WITH-PUBSUB-NAME> # Required
  deadLetterTopic: <REPLACE-WITH-DEADLETTERTOPIC-NAME> # Optional
  bulkSubscribe: # Optional
    enabled: <REPLACE-WITH-BOOLEAN-VALUE>
    maxMessagesCount: <REPLACE-WITH-VALUE>
    maxAwaitDurationMs: <REPLACE-WITH-VALUE>
scopes:
- <REPLACE-WITH-SCOPED-APPIDS>
```

### Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| topic | Y | The name of the topic to which your component subscribes. | `orders` |
| routes | Y | The routes configuration for this topic, including specifying the condition for sending a message to a specific path. Includes the following fields: <br><ul><li>match: The CEL expression used to match the event. If not specified, the route is considered the default. </li><li>path: The path for events that match this rule. </li></ul>The endpoint to which all topic messages are sent. | `match: event.type == "widget"` <br>`path: /widgets` |
| pubsubname | N | The name of your pub/sub component. | `pubsub` |
| deadLetterTopic | N | The name of the dead letter topic that forwards undeliverable messages. | `poisonMessages` |
| bulkSubscribe | N | Enable bulk subscribe properties. | `true`, `false` |


## `v1alpha1` format

The following is the basic version `v1alpha1` spec for a `Subscription` resource. `v1alpha1` is now deprecated.

```yml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: <REPLACE-WITH-RESOURCE-NAME>
spec:
  topic: <REPLACE-WITH-TOPIC-NAME> # Required
  route: <REPLACE-WITH-ROUTE-NAME> # Required
  pubsubname: <REPLACE-WITH-PUBSUB-NAME> # Required
  deadLetterTopic: <REPLACE-WITH-DEAD-LETTER-TOPIC-NAME> # Optional
  bulkSubscribe: # Optional
  - enabled: <REPLACE-WITH-BOOLEAN-VALUE>
  - maxMessagesCount: <REPLACE-WITH-VALUE>
  - maxAwaitDurationMs: <REPLACE-WITH-VALUE>
scopes:
- <REPLACE-WITH-SCOPED-APPIDS>
```

### Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| topic | Y | The name of the topic to which your component subscribes. | `orders` |
| route | Y | The endpoint to which all topic messages are sent. | `/checkout` |
| pubsubname | N | The name of your pub/sub component. | `pubsub` |
| deadlettertopic | N | The name of the dead letter topic that forwards undeliverable messages. | `poisonMessages` |
| bulksubscribe | N | Enable bulk subscribe properties. | `true`, `false` |

## Related links
- [Learn more about the declarative subscription method]({{< ref "subscription-methods.md#declarative-subscriptions" >}})
- [Learn more about dead letter topics]({{< ref pubsub-deadletter.md >}})
- [Learn more about routing messages]({{< ref "howto-route-messages.md#declarative-subscription" >}})
- [Learn more about bulk subscribing]({{< ref pubsub-bulk.md >}})