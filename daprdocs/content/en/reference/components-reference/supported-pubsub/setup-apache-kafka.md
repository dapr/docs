---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "Detailed documentation on the Apache Kafka pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## Component format

To setup Apache Kafka pubsub create a component of type `pubsub.kafka`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration. For details on using `secretKeyRef`, see the guide on [how to reference secrets in components]({{< ref component-secrets.md >}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authRequired # Required.
    value: "true"
  - name: saslUsername # Required if authRequired is `true`.
    value: "adminuser"
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| brokers             | Y | A comma-separated list of Kafka brokers. | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`
| consumerGroup       | N | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic. | `"group1"`
| clientID            | N | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. Defaults to `"sarama"`. | `"my-dapr-app"`
| authRequired        | Y | Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers. | `"true"`, `"false"`
| saslUsername        | N | The SASL username used for authentication. Only required if `authRequired` is set to `"true"`. | `"adminuser"`
| saslPassword        | N | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authRequired` is set to `"true"`. | `""`, `"KeFg23!"`
| initialOffset       | N | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest". | `"oldest"`
| maxMessageBytes     | N | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024. | `2048`

## Per-call metadata fields

### Partition Key

When invoking the Kafka pub/sub, its possible to provide an optional partition key by using the `metadata` query param in the request url.

The param name is `partitionKey`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.partitionKey=key1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## Create a Kafka instance

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image.
To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).
{{% /codetab %}}

{{% codetab %}}
To run Kafka on Kubernetes, you can use any Kafka operator, such as [Strimzi](https://strimzi.io/docs/operators/latest/quickstart.html#ref-install-prerequisites-str).
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})