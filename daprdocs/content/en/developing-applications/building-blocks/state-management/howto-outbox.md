---
type: docs
title: "How-To: Enable the transactional outbox pattern"
linkTitle: "How-To: Enable the transactional outbox pattern"
weight: 400
description: "Commit a single transaction across a state store and pub/sub message broker"
---

The transactional outbox pattern is a well known design pattern for sending notifications about a change in an application's state using a single transaction that spans across the database and the message broker used to deliver the notification. Developers are faced with many difficult technical challenges when trying to implement this pattern on their own, which often involves writing error-prone central coordination managers that end up supporting a combination of one or two databases and message brokers at most.

An example scenario for using the outbox pattern is writing a new user record to an account database and then sending a notification message that the account was successfully created. The user only wants to receive a message if this was successful.

With Dapr's outbox support, you can notify subscribers when an application's state is created or updated when calling Dapr's [transactions API]({{< ref "state_api.md#state-transactions" >}}).

## Requirements

The outbox feature can be used with using any [transactional state store]({{< ref supported-state-stores >}}) supported by Dapr. All [pub/sub brokers]({{< ref supported-pubsub >}}) are supported with the outbox feature.

*Note: Message brokers that work with the competing consumer pattern are encouraged to reduce the chances of duplicate events*

## Usage

To enable the outbox feature, add the following required and optional fields on a state store component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mydb
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
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
| outboxPublishTopic  | Yes         | N/A           | Sets the topic to send the state changes to on the pub/sub configured with `outboxPublishPubsub`. The message body will be a state transaction item for an insert or update operation
| outboxPubsub        | No          | `outboxPublishPubsub`           | Sets the pub/sub component to use by Dapr to coordinate the state and pub/sub transactions. If not set, the pub/sub component configured with `outboxPublishPubsub` is used. This is useful if you want to separate the pub/sub component used to send the notification state changes from the one used to coordinate the transaction.
| outboxDiscardWhenMissingState  | No         | `false`           | By setting `outboxDiscardWhenMissingState` to `true`, Dapr will discard the transaction if it cannot find the state in the database and not retry again

### Combining outbox and non-outbox messages on the same state store

If you want to use the same state store for sending both outbox and non-outbox messages, simply define two state store components, where one has the outbox feature and the other does not.

#### Redis state store without outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mydb
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

#### Redis state store with outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mydb-outbox
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
```