---
type: docs
title: "MQTT3 binding spec"
linkTitle: "MQTT3"
description: "Detailed documentation on the MQTT3 binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/mqtt3/"
  - "/operations/components/setup-bindings/supported-bindings/mqtt/"
---

## Component format

To setup a MQTT3 binding create a component of type `bindings.mqtt3`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.mqtt3
  version: v1
  metadata:
    - name: url
      value: "tcp://[username][:password]@host.domain[:port]"
    - name: topic
      value: "mytopic"
    - name: consumerID
      value: "myapp"
    # Optional
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: backOffMaxRetries
      value: "0"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|---------|---------|---------|
| `url`    | Y  | Input/Output | Address of the MQTT broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication. | `"tcp://[username][:password]@host.domain[:port]"`
| `topic`  | Y | Input/Output | The topic to listen on or send events to. | `"mytopic"` |
| `consumerID` | Y | Input/Output | The client ID used to connect to the MQTT broker. | `"myMqttClientApp"`
| `retain` | N  | Input/Output | Defines whether the message is saved by the broker as the last known good value for a specified topic. Defaults to `"false"`.  | `"true"`, `"false"`
| `cleanSession` | N | Input/Output | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"`. Defaults to `"false"`.  | `"true"`, `"false"`
| `caCert` | Required for using TLS | Input/Output | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | See example below
| `clientCert`  | Required for using TLS | Input/Output | TLS client certificate in PEM format. Must be used with `clientKey`. | See example below
| `clientKey` | Required for using TLS | Input/Output | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | See example below
| `backOffMaxRetries` | N | Input | The maximum number of retries to process the message before returning an error. Defaults to `"0"`, which means that no retries will be attempted. `"-1"` can be specified to indicate that messages should be retried indefinitely until they are successfully processed or the application is shutdown. The component will wait 5 seconds between retries. | `"3"`

### Communication using TLS

To configure communication using TLS, ensure that the MQTT broker (e.g. emqx) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
spec:
  type: bindings.mqtt3
  version: v1
  metadata:
    - name: url
      value: "ssl://host.domain[:port]"
    - name: topic
      value: "topic1"
    - name: consumerID
      value: "myapp"
    # TLS configuration
    - name: caCert
      value: |
        -----BEGIN CERTIFICATE-----
        ...
        -----END CERTIFICATE-----
    - name: clientCert
      value: |
        -----BEGIN CERTIFICATE-----
        ...
        -----END CERTIFICATE-----
    - name: clientKey
      secretKeyRef:
        name: myMqttClientKey
        key: myMqttClientKey
    # Optional
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: backoffMaxRetries
      value: "0"
```

> Note that while the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

### Consuming a shared topic

When consuming a shared topic, each consumer must have a unique identifier. If running multiple instances of an application, you configure the component's `consumerID` metadata with a `{uuid}` tag, which will give each instance a randomly generated `consumerID` value on start up. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
  namespace: default
spec:
  type: bindings.mqtt3
  version: v1
  metadata:
  - name: consumerID
    value: "{uuid}"
  - name: url
    value: "tcp://admin:public@localhost:1883"
  - name: topic
    value: "topic1"
  - name: retain
    value: "false"
  - name: cleanSession
    value: "true"
  - name: backoffMaxRetries
    value: "0"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

> In this case, the value of the consumer ID is random every time Dapr restarts, so you should set `cleanSession` to `true` as well.

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`: publishes a new message

## Set topic per-request

You can override the topic in component metadata on a per-request basis:

```json
{
  "operation": "create",
  "metadata": {
    "topic": "myTopic"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
