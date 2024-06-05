---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "Detailed documentation on the Apache Kafka pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## Component format

To set up Apache Kafka pub/sub, create a component of type `pubsub.kafka`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

All component metadata field values can carry [templated metadata values]({{< ref "component-schema.md#templated-metadata-values" >}}), which are resolved on Dapr sidecar startup.
For example, you can choose to use `{namespace}` as the `consumerGroup` to enable using the same `appId` in different namespaces using the same topics as described in [this article]({{< ref "howto-namespace.md#with-namespace-consumer-groups">}}).

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
    value: "{namespace}"
  - name: consumerID # Optional. If not supplied, runtime will create one.
    value: "channel1"
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
    value: 2.0.0
  - name: disableTls # Optional. Disable TLS. This is not safe for production!! You should read the `Mutual TLS` section for how to use TLS.
    value: "true"
  - name: schemaRegistryURL # Optional. When using Schema Registry Avro serialization/deserialization. The Schema Registry URL.
    value: http://localhost:8081
  - name: schemaRegistryAPIKey # Optional. When using Schema Registry Avro serialization/deserialization. The Schema Registry API Key.
    value: XYAXXAZ
  - name: schemaRegistryAPISecret # Optional. When using Schema Registry Avro serialization/deserialization. The Schema Registry credentials API Secret.
    value: "ABCDEFGMEADFF"
  - name: schemaCachingEnabled # Optional. When using Schema Registry Avro serialization/deserialization. Enables caching for schemas.
    value: true
  - name: schemaLatestVersionCacheTTL # Optional. When using Schema Registry Avro serialization/deserialization. The TTL for schema caching when publishing a message with latest schema available.
    value: 5m
  
```

> For details on using `secretKeyRef`, see the guide on [how to reference secrets in components]({{< ref component-secrets.md >}}).

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| brokers             | Y | A comma-separated list of Kafka brokers. | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`
| consumerGroup       | N | A kafka consumer group to listen on. Each record published to a topic is delivered to one consumer within each consumer group subscribed to the topic. If a value for `consumerGroup` is provided, any value for `consumerID` is ignored - a combination of the consumer group and a random unique identifier will be set for the `consumerID` instead. | `"group1"`
| consumerID       | N | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. If a value for `consumerGroup` is provided, any value for `consumerID` is ignored - a combination of the consumer group and a random unique identifier will be set for the `consumerID` instead.  | Can be set to string value (`"channel1"`) or string format value (`"{podName}"`, `"{namespace}"`). 
| clientID            | N | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. Defaults to `"namespace.appID"` for Kubernetes mode or `"appID"` for Self-Hosted mode. | `"my-namespace.my-dapr-app"`, `"my-dapr-app"`
| authRequired        | N | *Deprecated* Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers. | `"true"`, `"false"`
| authType            | Y | Configure or disable authentication. Supported values: `none`, `password`, `mtls`, `oidc` or `awsiam` | `"password"`, `"none"`
| saslUsername        | N | The SASL username used for authentication. Only required if `authType` is set to `"password"`. | `"adminuser"`
| saslPassword        | N | The SASL password used for authentication. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}). Only required if `authType is set to `"password"`. | `""`, `"KeFg23!"`
| saslMechanism      | N | The SASL Authentication Mechanism you wish to use. Only required if `authType` is set to `"password"`. Defaults to `PLAINTEXT` | `"SHA-512", "SHA-256", "PLAINTEXT"`
| initialOffset       | N | The initial offset to use if no offset was previously committed. Should be "newest" or "oldest". Defaults to "newest". | `"oldest"`
| maxMessageBytes     | N | The maximum size in bytes allowed for a single Kafka message. Defaults to 1024. | `2048`
| consumeRetryInterval | N | The interval between retries when attempting to consume topics. Treats numbers without suffix as milliseconds. Defaults to 100ms. | `200ms` |
| consumeRetryEnabled | N | Disable consume retry by setting `"false"` | `"true"`, `"false"` |
| version               | N | Kafka cluster version. Defaults to 2.0.0. Note that this must be set to `1.0.0` if you are using Azure EventHubs with Kafka. | `0.10.2.0` |
| caCert | N | Certificate authority certificate, required for using TLS. Can be `secretKeyRef` to use a secret reference | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert | N | Client certificate, required for `authType` `mtls`. Can be `secretKeyRef` to use a secret reference | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | N | Client key, required for `authType` `mtls` Can be `secretKeyRef` to use a secret reference | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| skipVerify | N | Skip TLS verification, this is not recommended for use in production. Defaults to `"false"` | `"true"`, `"false"` |
| disableTls | N | Disable TLS for transport security. To disable, you're not required to set value to `"true"`. This is not recommended for use in production. Defaults to `"false"`. | `"true"`, `"false"` |
| oidcTokenEndpoint | N | Full URL to an OAuth2 identity provider access token endpoint. Required when `authType` is set to `oidc` | "https://identity.example.com/v1/token" |
| oidcClientID | N | The OAuth2 client ID that has been provisioned in the identity provider. Required when `authType` is set to `oidc` | `dapr-kafka` |
| oidcClientSecret | N | The OAuth2 client secret that has been provisioned in the identity provider: Required when `authType` is set to `oidc` | `"KeFg23!"` |
| oidcScopes | N | Comma-delimited list of OAuth2/OIDC scopes to request with the access token. Recommended when `authType` is set to `oidc`. Defaults to `"openid"` | `"openid,kafka-prod"` |
| oidcExtensions | N | Input/Output | String containing a JSON-encoded dictionary of OAuth2/OIDC extensions to request with the access token | `{"cluster":"kafka","poolid":"kafkapool"}` |
| awsRegion | N | The AWS region where the Kafka cluster is deployed to. Required when `authType` is set to `awsiam` | `us-west-1` |
| awsAccessKey | N  | AWS access key associated with an IAM account. | `"accessKey"`
| awsSecretKey | N  | The secret key associated with the access key. | `"secretKey"`
| awsSessionToken | N  | AWS session token to use. A session token is only required if you are using temporary security credentials. | `"sessionToken"`
| awsIamRoleArn | N  | IAM role that has access to AWS Managed Streaming for Apache Kafka (MSK). This is another option to authenticate with MSK aside from the AWS Credentials. | `"arn:aws:iam::123456789:role/mskRole"`
| awsStsSessionName | N  | Represents the session name for assuming a role. | `"MSKSASLDefaultSession"`
| schemaRegistryURL | N | Required when using Schema Registry Avro serialization/deserialization. The Schema Registry URL. | `http://localhost:8081` |
| schemaRegistryAPIKey | N | When using Schema Registry Avro serialization/deserialization. The Schema Registry credentials API Key. | `XYAXXAZ` |
| schemaRegistryAPISecret | N | When using Schema Registry Avro serialization/deserialization. The Schema Registry credentials API Secret. | `ABCDEFGMEADFF` |
| schemaCachingEnabled | N | When using Schema Registry Avro serialization/deserialization. Enables caching for schemas. Default is `true` | `true` |
| schemaLatestVersionCacheTTL | N | When using Schema Registry Avro serialization/deserialization. The TTL for schema caching when publishing a message with latest schema available. Default is 5 min | `5m` |

The `secretKeyRef` above is referencing  a [kubernetes secrets store]({{< ref kubernetes-secret-store.md >}}) to access the tls information. Visit [here]({{< ref setup-secret-store.md >}}) to learn more about how to configure a secret store component.

#### Note
The metadata `version` must be set to `1.0.0` when using Azure EventHubs with Kafka.

### Authentication

Kafka supports a variety of authentication schemes and Dapr supports several: SASL password, mTLS, OIDC/OAuth2. With the added authentication methods, the `authRequired` field has
been deprecated from the v1.6 release and instead the `authType` field should be used. If `authRequired` is set to `true`, Dapr will attempt to configure `authType` correctly
based on the value of `saslPassword`. The valid values for `authType` are: 
- `none`
- `password`
- `certificate`
- `mtls`
- `oidc` 
- `awsiam`

{{% alert title="Note" color="primary" %}}
`authType` is _authentication_ only. _Authorization_ is still configured within Kafka, except for `awsiam`, which can also drive authorization decisions configured in AWS IAM.
{{% /alert %}}

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

#### AWS IAM

Authenticating with AWS IAM is supported with MSK. Setting `authType` to `awsiam` uses AWS SDK to generate auth tokens to authenticate.
{{% alert title="Note" color="primary" %}}
The only required metadata field is `awsRegion`. If no `awsAccessKey` and `awsSecretKey` are provided, you can use AWS IAM roles for service accounts to have password-less authentication to your Kafka cluster.
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-awsiam
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
    value: "awsiam"
  - name: awsRegion # Required.
    value: "us-west-1"
  - name: awsAccessKey # Optional.
    value: <AWS_ACCESS_KEY>
  - name: awsSecretKey # Optional.
    value: <AWS_SECRET_KEY>
  - name: awsSessionToken # Optional.
    value: <AWS_SESSION_KEY>
  - name: awsIamRoleArn # Optional.
    value: "arn:aws:iam::123456789:role/mskRole"
  - name: awsStsSessionName # Optional.
    value: "MSKSASLDefaultSession"
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
    value: "certificate"
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: caCert # Certificate authority certificate.
    secretKeyRef:
      name: kafka-tls
      key: caCert
auth:
  secretStore: <SECRET_STORE_NAME>
```

## Consuming from multiple topics

When consuming from multiple topics using a single pub/sub component, there is no guarantee about how the consumers in your consumer group are balanced across the topic partitions. 

For instance, let's say you are subscribing to two topics with 10 partitions per topic and you have 20 replicas of your service consuming from the two topics. There is no guarantee that 10 will be assigned to the first topic and 10 to the second topic. Instead, the partitions could be divided unequally, with more than 10 assigned to the first topic and the rest assigned to the second topic. 

This can result in idle consumers listening to the first topic and over-extended consumers on the second topic, or vice versa. This same behavior can be observed when using auto-scalers such as HPA or KEDA.

If you run into this particular issue, it is recommended that you configure a single pub/sub component per topic with uniquely defined consumer groups per component. This guarantees that all replicas of your service are fully allocated to the unique consumer group, where each consumer group targets one specific topic.

For example, you may define two Dapr components with the following configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-topic-one
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: consumerGroup
    value: "{appID}-topic-one"
```

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-topic-two
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: consumerGroup
    value: "{appID}-topic-two"
```

## Sending and receiving multiple messages

Apache Kafka component supports sending and receiving multiple messages in a single operation using the bulk Pub/sub API.

### Configuring bulk subscribe

When subscribing to a topic, you can configure `bulkSubscribe` options. Refer to [Subscribing messages in bulk]({{< ref "pubsub-bulk#subscribing-messages-in-bulk" >}}) for more details. Learn more about [the bulk subscribe API]({{< ref pubsub-bulk.md >}}).

Apache Kafka supports the following bulk metadata options:

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

## Avro Schema Registry serialization/deserialization
You can configure pub/sub to publish or consume data encoded using [Avro binary serialization](https://avro.apache.org/docs/), leveraging an [Apache Schema Registry](https://developer.confluent.io/courses/apache-kafka/schema-registry/) (for example, [Confluent Schema Registry](https://developer.confluent.io/courses/apache-kafka/schema-registry/), [Apicurio](https://www.apicur.io/registry/)).

### Configuration

{{% alert title="Important" color="warning" %}}
Currently, only message value serialization/deserialization is supported. Since cloud events are not supported, the `rawPayload=true` metadata must be passed when publishing Avro messages.
Please note that `rawPayload=true` should NOT be set for consumers, as the message value will be wrapped into a CloudEvent and base64-encoded. Leaving `rawPayload` as default (i.e. `false`) will send the Avro-decoded message to the application as a JSON payload.
{{% /alert %}}

When configuring the Kafka pub/sub component metadata, you must define:
- The schema registry URL 
- The API key/secret, if applicable

Schema subjects are automatically derived from topic names, using the standard naming convention. For example, for a topic named `my-topic`, the schema subject will be `my-topic-value`.
When interacting with the message payload within the service, it is in JSON format. The payload is transparently serialized/deserialized within the Dapr component.
Date/Datetime fields must be passed as their [Epoch Unix timestamp](https://en.wikipedia.org/wiki/Unix_time) equivalent (rather than typical Iso8601). For example:
- `2024-01-10T04:36:05.986Z` should be passed as `1704861365986` (the number of milliseconds since Jan 1st, 1970)
- `2024-01-10` should be passed as `19732` (the number of days since Jan 1st, 1970)

### Publishing Avro messages
In order to indicate to the Kafka pub/sub component that the message should be using Avro serialization, the `valueSchemaType` metadata must be set to `Avro`.

{{< tabs curl "Python SDK">}}

{{% codetab %}}
```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/my-topic?metadata.rawPayload=true&metadata.valueSchemaType=Avro -H "Content-Type: application/json" -d '{"order_number": "345", "created_date": 1704861365986}'
```
{{% /codetab %}}

{{% codetab %}}
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'order_number': '345',
        'created_date': 1704861365986
    }
    # Create a typed message with content type and body
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic_name='my-topic',
        data=json.dumps(req_data),
        publish_metadata={'rawPayload': 'true', 'valueSchemaType': 'Avro'}
    )
    # Print the request
    print(req_data, flush=True)
```
{{% /codetab %}}

{{< /tabs >}}


### Subscribing to Avro topics
In order to indicate to the Kafka pub/sub component that the message should be deserialized using Avro, the `valueSchemaType` metadata must be set to `Avro` in the subscription metadata.

{{< tabs "Python (FastAPI)" >}}

{{% codetab %}}

```python
from fastapi import APIRouter, Body, Response, status
import json
import sys

app = FastAPI()

router = APIRouter()


@router.get('/dapr/subscribe')
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub',
                      'topic': 'my-topic',
                      'route': 'my_topic_subscriber',
                      'metadata': {
                          'valueSchemaType': 'Avro',
                      } }]
    return subscriptions

@router.post('/my_topic_subscriber')
def my_topic_subscriber(event_data=Body()):
    print(event_data, flush=True)
      return Response(status_code=status.HTTP_200_OK)

app.include_router(router)

```

{{% /codetab %}}

{{< /tabs >}} 



## Create a Kafka instance

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image.
To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).
{{% /codetab %}}

{{% codetab %}}
To run Kafka on Kubernetes, you can use any Kafka operator, such as [Strimzi](https://strimzi.io/quickstarts/).
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
