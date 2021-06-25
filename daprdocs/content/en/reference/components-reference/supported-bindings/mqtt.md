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
    value: "topic1"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|---------|---------|---------|
| url    | Y  | Input/Output | Address of the MQTT broker  | Use `**tcp://**` scheme for non-TLS communication.   Use`**ssl://**` scheme for TLS communication.  <br> "tcp://[username][:password]@host.domain[:port]"
| topic | Y | Input/Output | The topic to listen on or send events to | `"mytopic"` |
| qos    | N  | Input/Output | Indicates the Quality of Service Level (QoS) of the message. Default 0|`1`
| retain | N  | Input/Output | Defines whether the message is saved by the broker as the last known good value for a specified topic. Default `"false"`  | `"true"`, `"false"`
| cleanSession | N | Input/Output | will set the "clean session" in the connect message when client connects to an MQTT broker. Default `"true"`  | `"true"`, `"false"`
| caCert | Required for using TLS | Input/Output | Certificate authority certificate. Can be `secretKeyRef` to use a secret reference | `0123456789-0123456789`
| clientCert | Required for using TLS | Input/Output | Client certificate. Can be `secretKeyRef` to use a secret reference | `0123456789-0123456789`
| clientKey | Required for using TLS | Input/Output | Client key. Can be `secretKeyRef` to use a secret reference | `012345`

### Communication using TLS
To configure communication using TLS, ensure mosquitto broker is configured to support certificates.
Pre-requisite includes `certficate authority certificate`, `ca issued client certificate`, `client private key`.
Here is an example.

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
  - name: caCert
    value: ''
  - name: clientCert
    value: ''
  - name: clientKey
    value: ''
```

### Consuming a shared topic

When consuming a shared topic, each consumer must have a unique identifier. By default, the application Id is used to uniquely identify each consumer and publisher. In self-hosted mode, running each Dapr run with a different application Id is sufficient to have them consume from the same shared topic. However on Kubernetes, a pod with multiple application instances shares the same application Id, prohibiting all instances from consuming the same topic. To overcome this, configure the component's `ConsumerID` metadata with a `{uuid}` tag, making each instance to have a randomly generated `ConsumerID` value on start up. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
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
