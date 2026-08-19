---
type: docs
title: "Solace-AMQP"
linkTitle: "Solace-AMQP"
description: "Detailed documentation on the Solace-AMQP pubsub component, which also supports other AMQP 1.0 brokers such as Apache ActiveMQ Artemis"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-solace-amqp/"
---

## Component format

To set up Solace-AMQP pub/sub, create a component of type `pubsub.solace.amqp`. See the [pub/sub broker component file]({{% ref setup-pubsub.md %}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{% ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" %}}) on how to create and apply a pub/sub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: solace
spec:
  type: pubsub.solace.amqp
  version: v1
  metadata:
    - name: url
      value: 'amqp://localhost:5672'
    - name: username
      value: 'default'
    - name: password
      value: 'default'
    - name: consumerID
      value: 'channel1'
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
| consumerID        |    N     | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. | Can be set to string value (such as `"channel1"` in the example above) or string format value (such as `"{podName}"`, etc.). [See all of template tags you can use in your component metadata.]({{% ref "component-schema.md#templated-metadata-values" %}})
| anonymous | N | To connect to the broker without credential validation. Only works if enabled on the broker. A username and password would not be required if this is set to `true`. | `true`
| caCert | Required for using TLS | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | Required for using TLS | TLS client certificate in PEM format. Must be used with `clientKey`. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | Required for using TLS | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| topicAddressPrefix | N | Prefix prepended to the AMQP address of a topic, used for a bare topic name and for topics named `topic:<name>`. Defaults to the Solace addressing convention, `topic://`. Set it to the multicast prefix the broker is configured with, or to an empty value for brokers that address topics by name. | `topic://`
| queueAddressPrefix | N | Prefix prepended to the AMQP address of a queue, used for topics named `queue:<name>`. Defaults to the Solace addressing convention, `queue://`. Set it to the anycast prefix the broker is configured with, or to an empty value for brokers that address queues by name. | `queue://`

### Communication using TLS

To configure communication using TLS:

1. Ensure that the Solace broker is configured to support certificates.
1. Provide the `caCert`, `clientCert`, and `clientKey` metadata in the component configuration. 

For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: solace
spec:
  type: pubsub.solace.amqp
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
      name: mySolaceClientKey
      key: mySolaceClientKey
auth:
  secretStore: <SECRET_STORE_NAME>
```

> While the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

### Publishing/subscribing to topics and queues

By default, messages are published and subscribed over topics. If you would like your destination to be a queue, prefix the topic with `queue:` and the Solace AMQP component will connect to a queue.

The component turns the topic name into an AMQP address as follows, which is how Solace selects between a topic and a queue:

| Topic name | AMQP address |
|------------|--------------|
| `orders` | `topic://orders` |
| `topic:orders` | `topic://orders` |
| `queue:orders` | `queue://orders` |

The `topicAddressPrefix` and `queueAddressPrefix` metadata fields control the two prefixes. A topic name that already begins with one of the configured prefixes, such as `topic://orders`, is used as the AMQP address unchanged.

## Create a Solace broker

{{< tabpane text=true >}}

{{% tab "Self-Hosted" %}}
You can run a Solace broker [locally using Docker](https://hub.docker.com/r/solace/solace-pubsub-standard):

```bash
docker run -d -p 8080:8080 -p 55554:55555 -p 8008:8008 -p 1883:1883 -p 8000:8000 -p 5672:5672 -p 9000:9000 -p 2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
```

You can then interact with the server using the client port: `mqtt://localhost:5672`
{{% /tab %}}

{{% tab "SaaS" %}}
You can also sign up for a free SaaS broker on [Solace Cloud](https://console.solace.cloud/login/new-account?product=event-streaming).
{{% /tab %}}

{{< /tabpane >}}

## Using other AMQP 1.0 brokers

Because the address prefixes are configurable, this component can also be used with other AMQP 1.0 brokers, such as [Apache ActiveMQ Artemis](https://activemq.apache.org/components/artemis/). There are two ways to line the component's addresses up with the broker:

1. **Configure the prefixes on the broker.** Artemis acceptors accept routing prefixes, so `anycastPrefix=queue://;multicastPrefix=topic://` on the AMQP acceptor makes the broker interpret the component's default addresses and keep the queue/topic (`ANYCAST`/`MULTICAST`) distinction. No component metadata is needed.

2. **Address destinations by name from Dapr.** Set both prefixes to an empty value, so that a Dapr topic named `orders` is published and subscribed on an address named `orders`. This is the option to use when the destinations already exist on the broker under their plain names, or when the broker cannot be reconfigured:

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: artemis
    spec:
      type: pubsub.solace.amqp
      version: v1
      metadata:
        - name: url
          value: 'amqp://localhost:5672'
        - name: username
          value: 'artemis'
        - name: password
          value: 'artemis'
        - name: topicAddressPrefix
          value: ''
        - name: queueAddressPrefix
          value: ''
    ```

    With both prefixes empty, `queue:orders` addresses the same destination as `orders`, so the `queue:` prefix no longer selects a queue and the routing type is whatever the broker resolves for that address — on Artemis, the `default-address-routing-type` of the matching address setting. Use option 1 if you need Dapr to select the routing type.

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- Read [this guide]({{% ref "howto-publish-subscribe.md#step-2-publish-a-topic" %}}) for instructions on configuring pub/sub components
- [Pub/sub building block]({{% ref pubsub %}})
