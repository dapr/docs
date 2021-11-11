---
type: docs
title: "MQTT binding spec"
linkTitle: "MQTT"
description: "Detailed documentation on the MQTT binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/mqtt/"
---

## Component format

To setup MQTT binding create a component of type `bindings.mqtt`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.mqtt
  version: v1
  metadata:
  - name: url
    value: "tcp://[username][:password]@host.domain[:port]"
  - name: topic
    value: "mytopic"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "true"
  - name: backOffMaxRetries
    value: "0"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|---------|---------|---------|
| url    | Y  | Input/Output | Address of the MQTT broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication. | `"tcp://[username][:password]@host.domain[:port]"`
| topic  | Y | Input/Output | The topic to listen on or send events to. | `"mytopic"` |
| consumerID | N | Input/Output | The client ID used to connect to the MQTT broker. Defaults to the Dapr app ID. | `"myMqttClientApp"`
| qos    | N  | Input/Output | Indicates the Quality of Service Level (QoS) of the message. Defaults to `0`. |`1`
| retain | N  | Input/Output | Defines whether the message is saved by the broker as the last known good value for a specified topic. Defaults to `"false"`.  | `"true"`, `"false"`
| cleanSession | N | Input/Output | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"`. Defaults to `"true"`.  | `"true"`, `"false"`
| caCert | Required for using TLS | Input/Output | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | Required for using TLS | Input/Output | TLS client certificate in PEM format. Must be used with `clientKey`. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | Required for using TLS | Input/Output | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| backOffMaxRetries | N | Input | The maximum number of retries to process the message before returning an error. Defaults to `"0"`, which means that no retries will be attempted. `"-1"` can be specified to indicate that messages should be retried indefinitely until they are successfully processed or the application is shutdown. The component will wait 5 seconds between retries. | `"3"`

### Communication using TLS

To configure communication using TLS, ensure that the MQTT broker (e.g. mosquitto) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
  namespace: default
spec:
  type: bindings.mqtt
  version: v1
  metadata:
  - name: url
    value: "ssl://host.domain[:port]"
  - name: topic
    value: "topic1"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
  - name: backoffMaxRetries
    value: "0"
  - name: caCert
    value: ${{ myLoadedCACert }}
  - name: clientCert
    value: ${{ myLoadedClientCert }}
  - name: clientKey
    secretKeyRef:
      name: myMqttClientKey
      key: myMqttClientKey
auth:
  secretStore: <SECRET_STORE_NAME>
```

Note that while the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

### Consuming a shared topic

When consuming a shared topic, each consumer must have a unique identifier. By default, the application ID is used to uniquely identify each consumer and publisher. In self-hosted mode, invoking each `dapr run` with a different application ID is sufficient to have them consume from the same shared topic. However, on Kubernetes, multiple instances of an application pod will share the same application ID, prohibiting all instances from consuming the same topic. To overcome this, configure the component's `consumerID` metadata with a `{uuid}` tag, which will give each instance a randomly generated `consumerID` value on start up. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
  namespace: default
spec:
  type: bindings.mqtt
  version: v1
  metadata:
  - name: consumerID
    value: "{uuid}"
  - name: url
    value: "tcp://admin:public@localhost:1883"
  - name: topic
    value: "topic1"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
  - name: backoffMaxRetries
    value: "0"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
