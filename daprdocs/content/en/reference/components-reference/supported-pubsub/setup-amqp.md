---
type: docs
title: "AMQP 1.0"
linkTitle: "AMQP 1.0"
description: "Detailed documentation on the AMQP 1.0 pubsub component, used with brokers such as Apache ActiveMQ Artemis and Solace PubSub+"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-solace-amqp/"
  - "/reference/components-reference/supported-pubsub/setup-solace-amqp/"
---

This component speaks AMQP 1.0. It is verified against [Apache ActiveMQ Artemis](https://activemq.apache.org/components/artemis/) and [Solace PubSub+](https://solace.com/products/event-broker/software/).

{{% alert title="AMQP 1.0, not AMQP 0-9-1" color="primary" %}}
AMQP 1.0 and AMQP 0-9-1 are different protocols. For RabbitMQ, use the [RabbitMQ component]({{% ref setup-rabbitmq.md %}}) instead, which speaks AMQP 0-9-1.
{{% /alert %}}

## Component format

To set up AMQP pub/sub, create a component of type `pubsub.amqp`. See the [pub/sub broker component file]({{% ref setup-pubsub.md %}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{% ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" %}}) on how to create and apply a pub/sub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: amqp-pubsub
spec:
  type: pubsub.amqp
  version: v1
  metadata:
    - name: url
      value: 'amqp://localhost:5672'
    - name: username
      value: 'default'
    - name: password
      value: 'default'
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url    | Y  | Address of the AMQP broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`amqp://`** URI scheme for non-TLS communication. <br> Use the **`amqps://`** URI scheme for TLS communication. | `"amqp://host.domain[:port]"`
| username | Y | The username to connect to the broker. Only required if anonymous is not specified or set to `false` .| `default`
| password | Y | The password to connect to the broker. Only required if anonymous is not specified or set to `false`. | `default`
| anonymous | N | To connect to the broker without credential validation. Only works if enabled on the broker. A username and password would not be required if this is set to `true`. | `true`
| caCert | N | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. Only needed when the broker certificate is not signed by a publicly trusted CA. Requires the `amqps://` scheme. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | N | TLS client certificate in PEM format, for mutual TLS. Must be used with `clientKey`, and requires the `amqps://` scheme. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | N | TLS client key in PEM format, for mutual TLS. Must be used with `clientCert`, and requires the `amqps://` scheme. Can be `secretKeyRef` to use a secret reference. | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| topicAddressPrefix | N | Prefix prepended to the AMQP address of a topic, used for a bare topic name and for topics named `topic:<name>`. Defaults to no prefix, which addresses the topic by name. See [Addressing topics and queues](#addressing-topics-and-queues). | `multicast://`
| queueAddressPrefix | N | Prefix prepended to the AMQP address of a queue, used for topics named `queue:<name>`. Defaults to no prefix, which addresses the queue by name. See [Addressing topics and queues](#addressing-topics-and-queues). | `anycast://`
| backOffPolicy | N | Retry policy used between attempts to re-open a subscription after the broker connection drops. Either `constant` or `exponential`. Defaults to `constant`. | `"constant"`
| backOffDuration | N | Delay between attempts to re-open a subscription, when `backOffPolicy` is `constant`. Defaults to `5s`. The component retries for as long as the subscription exists, so this sets the pace, not a limit. | `1s`
| backOffInitialInterval | N | First delay between attempts, when `backOffPolicy` is `exponential`. Defaults to `500ms`. | `100ms`
| backOffMaxInterval | N | Longest delay between attempts, when `backOffPolicy` is `exponential`. Defaults to `60s`. | `30s`

### Communication using TLS

To configure communication using TLS:

1. Ensure that the broker is configured to support certificates.
1. Provide the `caCert`, `clientCert`, and `clientKey` metadata in the component configuration.

For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: amqp-pubsub
spec:
  type: pubsub.amqp
  version: v1
  metadata:
  - name: url
    value: "amqps://host.domain[:port]"
  - name: username
    value: 'default'
  - name: password
    value: 'default'
  - name: caCert
    value: ${{ myLoadedCACert }}
  - name: clientCert
    value: ${{ myLoadedClientCert }}
  - name: clientKey
    secretKeyRef:
      name: myAmqpClientKey
      key: myAmqpClientKey
auth:
  secretStore: <SECRET_STORE_NAME>
```

> While the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

## Addressing topics and queues

The component turns a Dapr topic name into an AMQP address. `topicAddressPrefix` and `queueAddressPrefix` control that translation, and both default to no prefix. So out of the box the AMQP address is the Dapr topic name, unchanged:

| Dapr topic name | AMQP address, with the default prefixes |
|-----------------|------------------------------------------|
| `orders` | `orders` |
| `topic:orders` | `orders` |
| `queue:orders` | `orders` |

{{% alert title="`queue:` does nothing until the prefixes are configured" color="warning" %}}
A Dapr topic name may carry a `queue:` or `topic:` scheme. The scheme selects which of the two prefixes is applied — it does not select a routing type by itself.

With no prefixes configured, `queue:orders` and `orders` resolve to the same address, so the scheme has no effect and the routing type is whatever the broker resolves for that address.

To make `queue:` select a queue, set both prefixes to the values your broker uses. See [Brokers that namespace destinations](#brokers-that-namespace-destinations).
{{% /alert %}}

A topic name that already begins with one of the configured prefixes is used as the AMQP address unchanged.

## Brokers that namespace destinations

Some brokers select the routing type from a prefix on the address. Set `topicAddressPrefix` and `queueAddressPrefix` to the prefixes that broker uses, and the `queue:` and `topic:` schemes then select the routing type.

### Apache ActiveMQ Artemis

An Artemis acceptor takes `anycastPrefix` and `multicastPrefix` settings. If the acceptor is configured with `anycastPrefix=anycast://;multicastPrefix=multicast://`, configure the component to match:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: artemis
spec:
  type: pubsub.amqp
  version: v1
  metadata:
    - name: url
      value: 'amqp://localhost:5672'
    - name: username
      value: 'artemis'
    - name: password
      value: 'artemis'
    - name: topicAddressPrefix
      value: 'multicast://'
    - name: queueAddressPrefix
      value: 'anycast://'
```

A Dapr topic named `orders` is then addressed as `multicast://orders`, and `queue:orders` as `anycast://orders`.

Without these prefixes, the routing type comes from the broker instead, through the `default-address-routing-type` of the matching address setting.

### Solace PubSub+

Solace addresses topics as `topic://<name>` and queues as `queue://<name>`:

```yaml
    - name: topicAddressPrefix
      value: 'topic://'
    - name: queueAddressPrefix
      value: 'queue://'
```

{{% alert title="Interoperating with non-Dapr clients" color="primary" %}}
A prefix namespaces the address. A Dapr publisher using `topic://orders` and a non-Dapr client subscribing to `orders` are on two different addresses and never exchange messages. Make sure every client on a destination agrees on the address.
{{% /alert %}}

## When a subscriber returns an error

A message whose handler returns an error is returned to the broker as `modified`
with `delivery-failed`. The broker redelivers it and counts the attempt, so the
broker's own `redelivery-delay` and `max-delivery-attempts` settings apply and a
message that always fails eventually reaches the dead-letter address.

Redelivery pacing and the attempt limit are broker settings, not component
settings. On ActiveMQ Artemis they live in `address-settings`.

## Migrating from `pubsub.solace.amqp`

{{% alert title="Deprecated" color="warning" %}}
`pubsub.solace.amqp` is deprecated and replaced by `pubsub.amqp`. Existing components of type `pubsub.solace.amqp` keep working, and keep their `topic://` and `queue://` defaults. New components must use `pubsub.amqp`.
{{% /alert %}}

`pubsub.amqp` applies no address prefix by default, where `pubsub.solace.amqp` applies the Solace convention. To migrate a Solace component without changing the addresses it uses, change the type and set both prefixes explicitly:

```yaml
spec:
  type: pubsub.amqp          # was pubsub.solace.amqp
  version: v1
  metadata:
    - name: topicAddressPrefix
      value: 'topic://'
    - name: queueAddressPrefix
      value: 'queue://'
```

Everything else in the component stays the same.

## Create a broker

{{< tabpane text=true >}}

{{% tab "ActiveMQ Artemis" %}}
Run an Artemis broker [locally using Docker](https://hub.docker.com/r/apache/activemq-artemis):

```bash
docker run -d -p 5672:5672 -p 8161:8161 --env ARTEMIS_USER=artemis --env ARTEMIS_PASSWORD=artemis --name artemis apache/activemq-artemis:latest
```

The AMQP acceptor listens on `amqp://localhost:5672`, and the web console on `http://localhost:8161`.
{{% /tab %}}

{{% tab "Solace, self-hosted" %}}
Run a Solace broker [locally using Docker](https://hub.docker.com/r/solace/solace-pubsub-standard):

```bash
docker run -d -p 8080:8080 -p 55554:55555 -p 8008:8008 -p 1883:1883 -p 8000:8000 -p 5672:5672 -p 9000:9000 -p 2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
```

You can then interact with the server using the client port: `amqp://localhost:5672`
{{% /tab %}}

{{% tab "Solace, SaaS" %}}
You can also sign up for a free SaaS broker on [Solace Cloud](https://console.solace.cloud/login/new-account?product=event-streaming).
{{% /tab %}}

{{< /tabpane >}}

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- Read [this guide]({{% ref "howto-publish-subscribe.md#step-2-publish-a-topic" %}}) for instructions on configuring pub/sub components
- [Pub/sub building block]({{% ref pubsub %}})
