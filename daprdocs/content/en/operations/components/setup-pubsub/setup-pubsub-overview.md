---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of message brokers for Dapr Pub/Sub"
weight: 10000
type: docs
---

Dapr integrates with pub/sub message buses to provide apps with the ability to create event-driven, loosely coupled architectures where producers send events to consumers via topics.

Dapr supports the configuration of multiple, named, pub/sub components *per application*. Each pub/sub component has a name and this name is used when publishing a message topic

Pub/Sub message buses are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A pub/sub in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.<NAME>
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of pub/sub is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.
Even though you can put plain text secrets in there, it is recommended you use a [secret store](../../concepts/secrets) using a `secretKeyRef`

## Running locally

When running locally with the Dapr CLI, a component file for a Redis pub/sub is  created in a `components` directory, which for Linux/MacOS is `$HOME/.dapr/components` and for Windows is `%USERPROFILE%\.dapr\components`. See [Environment Setup](../getting-started/environment-setup.md#installing-dapr-in-self-hosted-mode)

You can make changes to this file the way you see fit, whether to change connection values or replace it with a different pub/sub.

## Running in Kubernetes

Dapr uses a Kubernetes Operator to update the sidecars running in the cluster with different components.
To setup a pub/sub in Kubernetes, use `kubectl` to apply the component file:

```bash
kubectl apply -f pubsub.yaml
```

## Related links

- [Setup Redis Streams](./setup-redis.md)
- [Setup NATS Streaming](./setup-nats-streaming.md)
- [Setup Azure Service bus](./setup-azure-servicebus.md)
- [Setup RabbitMQ](./setup-rabbitmq.md)
- [Setup GCP Pubsub](./setup-gcp.md)
- [Setup Hazelcast Pubsub](./setup-hazelcast.md)
- [Setup Azure Event Hubs](./setup-azure-eventhubs.md)
- [Setup SNS/SQS](./setup-snssqs.md)
- [Setup MQTT](./setup-mqtt.md)
- [Setup Apache Pulsar](./setup-pulsar.md)
- [Setup Kafka](./setup-kafka.md)
