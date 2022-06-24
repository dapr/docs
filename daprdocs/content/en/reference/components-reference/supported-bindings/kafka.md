---
type: docs
title: "Kafka binding spec"
linkTitle: "Kafka"
description: "Detailed documentation on the Kafka binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/kafka/"
---

## Component format

To setup Kafka binding create a component of type `bindings.kafka`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. For details on using `secretKeyRef`, see the guide on [how to reference secrets in components]({{< ref component-secrets.md >}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-binding
  namespace: default
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: topics # Optional. Used for input bindings.
    value: "topic1,topic2"
  - name: brokers # Required.
    value: "localhost:9092,localhost:9093"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: publishTopic # Optional. Used for output bindings.
    value: "topic3"
  - name: authRequired # Required.
    value: "true"
  - name: saslUsername # Required if authRequired is `true`.
    value: "user"
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: initialOffset # Optional. Used for input bindings.
    value: "newest"
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: version # Optional.
    value: 1.0.0
```

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| topics | N | Input | A comma-separated string of topics. | `"mytopic1,topic2"` |
| brokers | Y | Input/Output | A comma-separated string of Kafka brokers. | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"` |
| clientID            | N | Input/Output | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. | `"my-dapr-app"` |
| consumerGroup | N | Input | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic. | `"group1"` |
| consumeRetryEnabled | N | Input/Output | Enable consume retry by setting to `"true"`. Default to `false` in Kafka binding component. | `"true"`, `"false"` |
| publishTopic | Y | Output | The topic to publish to. | `"mytopic"` |
| authRequired | N | *Deprecated* | Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers. | `"true"`, `"false"` |
| authType            | Y | Input/Output | Configure or disable authentication. Supported values: `none`, `password`, `mtls`, or `oidc` | `"password"`, `"none"` |
| saslUsername | N | Input/Output | The SASL username used for authentication. Only required if `authRequired` is set to `"true"`. | `"adminuser"` |
| saslPassword | N | Input/Output | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authRequired` is set to `"true"`. | `""`, `"KeFg23!"` |
| initialOffset   | N | Input | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest". | `"oldest"` |
| maxMessageBytes | N | Input/Output | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024. | `2048` |
| oidcTokenEndpoint | N | Input/Output | Full URL to an OAuth2 identity provider access token endpoint. Required when `authType` is set to `oidc` | "https://identity.example.com/v1/token" |
| oidcClientID | N | Input/Output | The OAuth2 client ID that has been provisioned in the identity provider. Required when `authType` is set to `oidc` | `dapr-kafka` |
| oidcClientSecret | N | Input/Output | The OAuth2 client secret that has been provisioned in the identity provider: Required when `authType` is set to `oidc` | `"KeFg23!"` |
| oidcScopes | N | Input/Output | Comma-delimited list of OAuth2/OIDC scopes to request with the access token. Recommended when `authType` is set to `oidc`. Defaults to `"openid"` | `"openid,kafka-prod"` |

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`

## Authentication

Kafka supports a variety of authentication schemes and Dapr supports several: SASL password, mTLS, OIDC/OAuth2. [Learn more about Kafka's authentication method for both the Kafka binding and Kafka pub/sub components]({{< ref "setup-apache-kafka.md#authentication" >}}).

## Specifying a partition key

When invoking the Kafka binding, its possible to provide an optional partition key by using the `metadata` section in the request body.

The field name is `partitionKey`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myKafka \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "partitionKey": "key1"
        },
        "operation": "create"
      }'
```

### Response

An HTTP 204 (No Content) and empty body will be returned if successful.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
