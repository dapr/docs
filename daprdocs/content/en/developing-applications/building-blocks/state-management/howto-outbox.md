---
type: docs
title: "How-To: Enable the transactional outbox pattern"
linkTitle: "How-To: Enable the transactional outbox pattern"
weight: 400
description: "Commit a single transaction across a state store and pub/sub message broker"
---

The transactional outbox pattern is a well known design pattern for sending notifications regarding changes in an application's state. The transactional outbox pattern uses a single transaction that spans across the database and the message broker delivering the notification. 

Developers are faced with many difficult technical challenges when trying to implement this pattern on their own, which often involves writing error-prone central coordination managers that, at most, support a combination of one or two databases and message brokers.

For example, you can use the outbox pattern to:  
1. Write a new user record to an account database. 
1. Send a notification message that the account was successfully created. 

With Dapr's outbox support, you can notify subscribers when an application's state is created or updated when calling Dapr's [transactions API]({{< ref "state_api.md#state-transactions" >}}).

The diagram below is an overview of how the outbox feature works:

1) Service A saves/updates state to the state store using a transaction.
2) A message is written to the broker under the same transaction. When the message is successfully delivered to the message broker, the transaction completes, ensuring the state and message are transacted together.
3) The message broker delivers the message topic to any subscribers - in this case, Service B.

<img src="/images/state-management-outbox.png" width=800 alt="Diagram showing the steps of the outbox pattern">

## Requirements

The outbox feature can be used with using any [transactional state store]({{< ref supported-state-stores >}}) supported by Dapr. All [pub/sub brokers]({{< ref supported-pubsub >}}) are supported with the outbox feature.

{{% alert title="Note" color="primary" %}} 
Message brokers that work with the competing consumer pattern (for example, [Apache Kafka]({{< ref setup-apache-kafka>}}) are encouraged to reduce the chances of duplicate events.
{{% /alert %}}

## Usage

To enable the outbox feature, add the following required and optional fields on a state store component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
  - name: outboxPubsub # Optional
    value: "myOutboxPubsub"
  - name: outboxDiscardWhenMissingState #Optional. Defaults to false
    value: false
```

### Metadata fields

| Name                | Required    | Default Value | Description                                            |
| --------------------|-------------|---------------|------------------------------------------------------- |
| outboxPublishPubsub | Yes         | N/A           | Sets the name of the pub/sub component to deliver the notifications when publishing state changes
| outboxPublishTopic  | Yes         | N/A           | Sets the topic that receives the state changes on the pub/sub configured with `outboxPublishPubsub`. The message body will be a state transaction item for an `insert` or `update` operation
| outboxPubsub        | No          | `outboxPublishPubsub`           | Sets the pub/sub component used by Dapr to coordinate the state and pub/sub transactions. If not set, the pub/sub component configured with `outboxPublishPubsub` is used. This is useful if you want to separate the pub/sub component used to send the notification state changes from the one used to coordinate the transaction
| outboxDiscardWhenMissingState  | No         | `false`           | By setting `outboxDiscardWhenMissingState` to `true`, Dapr discards the transaction if it cannot find the state in the database and does not retry. This setting can be useful if the state store data has been deleted for any reason before Dapr was able to deliver the message and you would like Dapr to drop the items from the pub/sub and stop retrying to fetch the state

### Combining outbox and non-outbox messages on the same state store

If you want to use the same state store for sending both outbox and non-outbox messages, simply define two state store components that connect to the same state store, where one has the outbox feature and the other does not.

#### MySQL state store without outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```

#### MySQL state store with outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
```

## Demo

Watch [this video for an overview of the outbox pattern](https://youtu.be/rTovKpG0rhY?t=1338):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/rTovKpG0rhY?si=1xlS54vcdYnLLtOL&amp;start=1338" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
