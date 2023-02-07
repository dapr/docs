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
  - name: authType # Required.
    value: "password"
  - name: saslUsername # Required if authType is `password`.
    value: "adminuser"
  - name: saslPassword # Required if authType is `password`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: saslMechanism
    value: "SHA-512"
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: disableTls # Optional. Disable TLS. This is not safe for production!! You should read the `Mutual TLS` section for how to use TLS.
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| brokers             | Y | A comma-separated list of Kafka brokers. | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`
| consumerGroup       | N | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic. | `"group1"`
| clientID            | N | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. Defaults to `"sarama"`. | `"my-dapr-app"`
| authRequired        | N | *Deprecated* Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers. | `"true"`, `"false"`
| authType            | Y | Configure or disable authentication. Supported values: `none`, `password`, `mtls`, or `oidc` | `"password"`, `"none"`
| saslUsername        | N | The SASL username used for authentication. Only required if `authType` is set to `"password"`. | `"adminuser"`
| saslPassword        | N | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authType is set to `"password"`. | `""`, `"KeFg23!"`
| saslMechanism      | N | The SASL Authentication Mechanism you wish to use. Only required if `authType` is set to `"password"`. Defaults to `PLAINTEXT` | `"SHA-512", "SHA-256", "PLAINTEXT"`
| initialOffset       | N | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest". | `"oldest"`
| maxMessageBytes     | N | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024. | `2048`
| consumeRetryInterval | N | The interval between retries when attempting to consume topics. Treats numbers without suffix as milliseconds. Defaults to 100ms. | `200ms` |
| consumeRetryEnabled | N | Disable consume retry by setting `"false"` | `"true"`, `"false"` |
| version               | N | Kafka cluster version. Defaults to 2.0.0.0 | `0.10.2.0` |
| caCert | N | Certificate authority certificate, required for using TLS. Can be `secretKeyRef` to use a secret reference | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert | N | Client certificate, required for `authType` `mtls`. Can be `secretKeyRef` to use a secret reference | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | N | Client key, required for `authType` `mtls` Can be `secretKeyRef` to use a secret reference | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| skipVerify | N | Skip TLS verification, this is not recommended for use in production. Defaults to `"false"` | `"true"`, `"false"` |
| disableTls | N | Disable TLS for transport security. To disable, you're not required to set value to `"true"`. This is not recommended for use in production. Defaults to `"false"`. | `"true"`, `"false"` |
| oidcTokenEndpoint | N | Full URL to an OAuth2 identity provider access token endpoint. Required when `authType` is set to `oidc` | "https://identity.example.com/v1/token" |
| oidcClientID | N | The OAuth2 client ID that has been provisioned in the identity provider. Required when `authType` is set to `oidc` | `dapr-kafka` |
| oidcClientSecret | N | The OAuth2 client secret that has been provisioned in the identity provider: Required when `authType` is set to `oidc` | `"KeFg23!"` |
| oidcScopes | N | Comma-delimited list of OAuth2/OIDC scopes to request with the access token. Recommended when `authType` is set to `oidc`. Defaults to `"openid"` | `"openid,kafka-prod"` |

The `secretKeyRef` above is referencing  a [kubernetes secrets store]({{< ref kubernetes-secret-store.md >}}) to access the tls information. Visit [here]({{< ref setup-secret-store.md >}}) to learn more about how to configure a secret store component.

### Authentication

Kafka supports a variety of authentication schemes and Dapr supports several: SASL password, mTLS, OIDC/OAuth2. With the added authentication methods, the `authRequired` field has
been deprecated from the v1.6 release and instead the `authType` field should be used. If `authRequired` is set to `true`, Dapr will attempt to configure `authType` correctly
based on the value of `saslPassword`. There are four valid values for `authType`: `none`, `password`, `mtls`, and `oidc`. Note this is authentication only; authorization is still configured within Kafka.

#### None

Setting `authType` to `none` will disable any authentication. This is *NOT* recommended in production.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-noauth
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
  - name: authType # Required.
    value: "none"
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: disableTls
    value: "true"
```

#### SASL Password

Setting `authType` to `password` enables [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication. This requires setting the `saslUsername` and `saslPassword` fields.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-sasl
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
  - name: authType # Required.
    value: "password"
  - name: saslUsername # Required if authType is `password`.
    value: "adminuser"
  - name: saslPassword # Required if authType is `password`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: saslMechanism
    value: "SHA-512"
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: caCert
    secretKeyRef:
      name: kafka-tls
      key: caCert
```

#### Mutual TLS

Setting `authType` to `mtls` uses a x509 client certificate (the `clientCert` field) and key (the `clientKey` field) to authenticate. Note that mTLS as an
authentication mechanism is distinct from using TLS to secure the transport layer via encryption. mTLS requires TLS transport (meaning `disableTls` must be `false`), but securing
the transport layer does not require using mTLS. See [Communication using TLS](#communication-using-tls) for configuring underlying TLS transport.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-mtls
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
  - name: authType # Required.
    value: "mtls"
  - name: caCert
    secretKeyRef:
      name: kafka-tls
      key: caCert
  - name: clientCert
    secretKeyRef:
      name: kafka-tls
      key: clientCert
  - name: clientKey
    secretKeyRef:
      name: kafka-tls
      key: clientKey
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
```

#### OAuth2 or OpenID Connect

Setting `authType` to `oidc` enables SASL authentication via the **OAUTHBEARER** mechanism. This supports specifying a bearer token from an external OAuth2 or [OIDC](https://en.wikipedia.org/wiki/OpenID) identity provider. Currently, only the **client_credentials** grant is supported.

Configure `oidcTokenEndpoint` to the full URL for the identity provider access token endpoint.

Set `oidcClientID` and `oidcClientSecret` to the client credentials provisioned in the identity provider.

If `caCert` is specified in the component configuration, the certificate is appended to the system CA trust for verifying the identity provider certificate. Similarly, if `skipVerify` is specified in the component configuration, verification will also be skipped when accessing the identity provider.

By default, the only scope requested for the token is `openid`; it is **highly** recommended that additional scopes be specified via `oidcScopes` in a comma-separated list and validated by the Kafka broker. If additional scopes are not used to narrow the validity of the access token,
a compromised Kafka broker could replay the token to access other services as the Dapr clientID.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
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
  - name: authType # Required.
    value: "oidc"
  - name: oidcTokenEndpoint # Required if authType is `oidc`.
    value: "https://identity.example.com/v1/token"
  - name: oidcClientID      # Required if authType is `oidc`.
    value: "dapr-myapp"
  - name: oidcClientSecret  # Required if authType is `oidc`.
    secretKeyRef:
      name: kafka-secrets
      key: oidcClientSecret
  - name: oidcScopes        # Recommended if authType is `oidc`.
    value: "openid,kafka-dev"
  - name: caCert            # Also applied to verifying OIDC provider certificate
    secretKeyRef:
      name: kafka-tls
      key: caCert
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
```

### Communication using TLS

By default TLS is enabled to secure the transport layer to Kafka. To disable TLS, set `disableTls` to `true`. When TLS is enabled, you can
control server certificate verification using `skipVerify` to disable verification (*NOT* recommended in production environments) and `caCert` to
specify a trusted TLS certificate authority (CA). If no `caCert` is specified, the system CA trust will be used. To also configure mTLS authentication,
see the section under _Authentication_.
Below is an example of a Kafka pubsub component configured to use transport layer TLS:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
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
  - name: authType # Required.
    value: "password"
  - name: saslUsername # Required if authType is `password`.
    value: "adminuser"
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: caCert # Certificate authority certificate.
    secretKeyRef:
      name: kafka-tls
      key: caCert
auth:
  secretStore: <SECRET_STORE_NAME>
```

## Sending and receiving multiple messages

Apache Kafka component supports sending and receiving multiple messages in a single operation using the bulk Pub/sub API.

### Configuring bulk subscribe

When subscribing to a topic, you can configure `bulkSubscribe` options. Refer to [Subscription methods]({{< ref subscription-methods >}}) for more details. Learn more about [the bulk subscribe API]({{< ref pubsub-bulk.md >}}).

| Configuration | Default |
|----------|---------|
| `maxBulkAwaitDurationMs` | `10000` (10s) |
| `maxBulkSubCount` | `80` |

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

### Message headers

All other metadata key/value pairs (that are not `partitionKey`) are set as headers in the Kafka message. Here is an example setting a `correlationId` for the message.

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.correlationId=myCorrelationID&metadata.partitionKey=key1 \
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
