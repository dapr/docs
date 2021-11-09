---
type: docs
title: "Pub/sub brokers component specs"
linkTitle: "Pub/sub brokers"
weight: 2000
description: The supported pub/sub brokers that interface with Dapr
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/"
no_list: true
---

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component
### Generic

| Name                                                  | Status | Component version | Since |
|-------------------------------------------------------|--------| -----| ------------- |
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Stable | v1 | 1.5 |
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha  | v1 | 1.0 |
| [MQTT]({{< ref setup-mqtt.md >}})                     | Alpha  | v1 | 1.0 |
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Beta   | v1 | 1.0 |
| [In Memory]({{< ref setup-inmemory.md >}})            | Alpha  | v1 | 1.4 |
| [JetStream]({{< ref setup-jetstream.md >}})           | Alpha  | v1 | 1.4 |
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha  | v1 | 1.0 |
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Alpha  | v1 | 1.0 |
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | Stable | v1 | 1.0 |

### Amazon Web Services (AWS)

| Name                                              | Status | Component version | Since |
|---------------------------------------------------|--------| ---- |---------------|
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}})    | Alpha  | v1 | 1.0 |

### Google Cloud Platform (GCP)

| Name                                              | Status | Component version | Since |
|---------------------------------------------------|--------| ---- | --------------|
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}})    | Alpha  | v1 | 1.0 |

### Microsoft Azure

| Name                                                      | Status | Component version | Since |
|-----------------------------------------------------------|--------| ----------------| -- |
| [Azure Event Hubs]({{< ref setup-azure-eventhubs.md >}})  | Alpha  | v1 | 1.0 |
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}})| Stable | v1 | 1.0 |
