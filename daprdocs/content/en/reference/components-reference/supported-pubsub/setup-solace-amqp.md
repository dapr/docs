---
type: docs
title: "Solace-AMQP"
linkTitle: "Solace-AMQP"
description: "Detailed documentation on the Solace-AMQP pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-solace-amqp/"
---

## Component format

To setup Solace-AMQP pub/sub, create a component of type `pubsub.solace.amqp`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

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
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url    | Y  | Address of the AMQP broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`amqp://`** URI scheme for non-TLS communication. <br> Use the **`amqps://`** URI scheme for TLS communication. | `"amqp://host.domain[:port]"`
| username | Y | The username to connect to the broker. Only required if anonymous is not specified or set to `false` .| `default`
| password | Y | The password to connect to the broker. Only required if anonymous is not specified or set to `false`. | `default`
| anonymous | N | To connect to the broker without credential validation. Only works if enabled on the broker. A username and password would not be required if this is set to `true`. | `true`
| caCert | Required for using TLS | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | Required for using TLS | TLS client certificate in PEM format. Must be used with `clientKey`. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | Required for using TLS | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`

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

## Create a Solace broker

{{< tabs "Self-Hosted" "SaaS">}}

{{% codetab %}}
You can run a Solace broker [locally using Docker](https://hub.docker.com/r/solace/solace-pubsub-standard):

```bash
docker run -d -p 8080:8080 -p 55554:55555 -p 8008:8008 -p 1883:1883 -p 8000:8000 -p 5672:5672 -p 9000:9000 -p 2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
```

You can then interact with the server using the client port: `mqtt://localhost:5672`
{{% /codetab %}}

{{% codetab %}}
You can also sign up for a free SaaS broker on [Solace Cloud](https://console.solace.cloud/login/new-account?product=event-streaming).
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/sub building block]({{< ref pubsub >}})