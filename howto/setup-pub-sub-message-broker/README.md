# Setup a Dapr pub/sub

Dapr integrates with existing message buses to provide apps with the ability to create event-driven, loosely coupled architectures where producers send events to consumers via topics.
Currently, Dapr supports the configuration of one message bus per cluster.

Pub/Sub message buses are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A pub/sub in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
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

The type of message bus is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.
Even though you can put plain text secrets in there, it is recommended you use a [secret store](../../concepts/components/secrets.md).

## Running locally

When running locally with the Dapr CLI, a component file for a Redis Streams pub/sub will be automatically created in a `components` directory in your current working directory.

You can make changes to this file the way you see fit, whether to change connection values or replace it with a different pub/sub.

## Running in Kubernetes

Dapr uses a Kubernetes Operator to update the sidecars running in the cluster with different components.
To setup a pub/sub in Kubernetes, use `kubectl` to apply the component file:

```bash
kubectl apply -f pubsub.yaml
```

## Reference

- [Setup Redis Streams](./setup-redis.md)
- [Setup NATS](./setup-nats.md)
- [Setup Azure Service bus](./setup-azure-servicebus.md)
- [Setup RabbitMQ](./setup-rabbitmq.md)
- [Setup GCP Pubsub](./setup-gcp.md)
- [Setup Hazelcast Pubsub](./setup-hazelcast.md)
- [Setup Azure Event Hubs](./setup-azure-eventhubs.md)
- [Setup SNS/SQS](./setup-snssqs.md)
- [Setup MQTT](./setup-mqtt.md)
- [Setup Apache Pulsar](./setup-pulsar.md)
- [Setup Kafka](./setup-kafka.md)
