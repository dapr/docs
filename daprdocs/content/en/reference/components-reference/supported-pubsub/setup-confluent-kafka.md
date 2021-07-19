---
type: docs
title: "Apache Kafka (confluent kafka)"
linkTitle: "Apache Kafka (confluent kafka)"
description: "Detailed documentation on the Apache Kafka pubsub component by using confluent kafka sdk"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-confluent-kafka/"
---

## Component format

To setup Apache Kafka pubsub using confluent kafka sdk create a component of type `pubsub.confluentkafka`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

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
      # Kafka broker connection setting
    - name: configJson
      value: "{\"group.id\": \"dapr_test_group\",\"bootstrap.servers\" : \"1.2.3.4,5.6.7.8\",\"security.protocol\" : \"sasl_ssl\",\"sasl.mechanism\" : \"PLAIN\",\"sasl.username\" : \"username\",\"sasl.password\" : \"password\",\"ssl.ca.location\": \"/path/to/ca\",\"api.version.request\": true,\"message.max.bytes\": 1000000,\"linger.ms\": 10,\"retries\": 30,\"retry.backoff.ms\": 1000,\"acks\": \"1\"}"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| configJson             | Y  | A json string consists of configurations of the sdk client. For more settings, see [confluent kafka configuration reference](https://docs.confluent.io/platform/current/installation/configuration/)  | 

## Per-call metadata fields

### Partition

When invoking the Kafka pub/sub, it's possible to provide an optional partition section by using the `metadata` query param in the request url.

The param name is `partition`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.partition=3 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

### Key

It's also possible to pass in an optional key for the message.

The param name is `key`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.key=key1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

### headers

Unlimited number of headers can also be passed in.

The param name is begin with `header.`.

Example:
```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.header.header1=1header&metadata.header.header2=2header \
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