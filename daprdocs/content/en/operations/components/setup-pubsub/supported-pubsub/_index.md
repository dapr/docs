---
type: docs
title: "Supported pub/sub components"
linkTitle: "Supported pub/sub"
weight: 30000
description: List of all the supported external pubsub brokers that can interface with Dapr
no_list: true
---

### Generic

| Name                                                  | Status |
|-------------------------------------------------------|--------|
| [Apache Kafka]({{< ref setup-apache-kafka.md >}})     | Alpha  | 
| [Hazelcast]({{< ref setup-hazelcast.md >}})           | Alpha  | 
| [MQTT]({{< ref setup-mqtt.md >}})                     | Alpha  | 
| [NATS Streaming]({{< ref setup-nats-streaming.md >}}) | Alpha  | 
| [Pulsar]({{< ref setup-pulsar.md >}})                 | Alpha  | 
| [RabbitMQ]({{< ref setup-rabbitmq.md >}})             | Alpha  | 
| [Redis Streams]({{< ref setup-redis-pubsub.md >}})    | Alpha  | 

### Amazon Web Services (AWS)

| Name                                              | Status |
|---------------------------------------------------|--------|
| [AWS SNS/SQS]({{< ref setup-aws-snssqs.md >}})    | Alpha  | 

### Google Cloud Platform (GCP)

| Name                                              | Status |
|---------------------------------------------------|--------|
| [GCP Pub/Sub]({{< ref setup-gcp-pubsub.md >}})    | Alpha  | 

### Microsoft Azure

| Name                                                      | Status |
|-----------------------------------------------------------|--------|
| [Azure Events Hub]({{< ref setup-azure-eventhubs.md >}})  | Alpha  | 
| [Azure Service Bus]({{< ref setup-azure-servicebus.md >}})| Alpha  | 
