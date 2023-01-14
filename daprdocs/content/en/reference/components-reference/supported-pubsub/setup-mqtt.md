---
type: docs
title: "MQTT"
linkTitle: "MQTT"
description: "Detailed documentation on the MQTT pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
---

## Component format

To setup MQTT pubsub create a component of type `pubsub.mqtt`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
  - name: url
    value: "tcp://[username][:password]@host.domain[:port]"
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

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url    | Y  | Address of the MQTT broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication. | `"tcp://[username][:password]@host.domain[:port]"`
| consumerID | N | The client ID used to connect to the MQTT broker for the consumer connection. Defaults to the Dapr app ID.<br>Note: if `producerID` is not set, `-consumer` is appended to this value for the consumer connection | `"myMqttClientApp"`
| producerID | N | The client ID used to connect to the MQTT broker for the producer connection. Defaults to `{consumerID}-producer`. | `"myMqttProducerApp"`
| qos    | N  | Indicates the Quality of Service Level (QoS) of the message ([more info](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)). Defaults to `1`. |`0`, `1`, `2`
| retain | N  | Defines whether the message is saved by the broker as the last known good value for a specified topic. Defaults to `"false"`.  | `"true"`, `"false"`
| cleanSession | N | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"` ([more info](http://www.steves-internet-guide.com/mqtt-clean-sessions-example/)). Defaults to `"false"`.  | `"true"`, `"false"`
| caCert | Required for using TLS | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | Required for using TLS | TLS client certificate in PEM format. Must be used with `clientKey`. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | Required for using TLS | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`

### Enabling message delivery retries

The MQTT pub/sub component has no built-in support for retry strategies. This means that sidecar sends a message to the service only once. If the service marks the message as not processed, the message won't be acknowledged to the broker. Only if broker resends the message, it would be retried.

To make Dapr use more spohisticated retry policies, you can apply a [retry resiliency policy]({{< ref "policies.md#retries" >}}) to the MQTT pub/sub component.

There is a crucial difference between the two ways of retries:

1. Re-delivery of unacknowledged messages is completely dependent to the broker. Dapr does not guarantee it. Some brokers like [emqx](https://www.emqx.io/), [vernemq](https://vernemq.com/) etc. support it but it not a part of [MQTT3 spec](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718103).

2. Using Resiliency makes the same Dapr sidecar retry redelivering the messages. So it will be the same Dapr sidecar and the same app receiving the same message.

### Communication using TLS

To configure communication using TLS, ensure that the MQTT broker (e.g. mosquitto) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
  - name: url
    value: "ssl://host.domain[:port]"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
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
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
    - name: consumerID
      value: "{uuid}"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
    - name: cleanSession
      value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

Note that in the case, the value of the consumer ID is random every time Dapr restarts, so we are setting `cleanSession` to true as well.

## Create a MQTT broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a MQTT broker [locally using Docker](https://hub.docker.com/_/eclipse-mosquitto):

```bash
docker run -d -p 1883:1883 -p 9001:9001 --name mqtt eclipse-mosquitto:1.6
```

You can then interact with the server using the client port: `mqtt://localhost:1883`
{{% /codetab %}}

{{% codetab %}}
You can run a MQTT broker in kubernetes using following yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mqtt-broker
  labels:
    app-name: mqtt-broker
spec:
  replicas: 1
  selector:
    matchLabels:
      app-name: mqtt-broker
  template:
    metadata:
      labels:
        app-name: mqtt-broker
    spec:
      containers:
        - name: mqtt
          image: eclipse-mosquitto:1.6
          imagePullPolicy: IfNotPresent
          ports:
            - name: default
              containerPort: 1883
              protocol: TCP
            - name: websocket
              containerPort: 9001
              protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  name: mqtt-broker
  labels:
    app-name: mqtt-broker
spec:
  type: ClusterIP
  selector:
    app-name: mqtt-broker
  ports:
    - port: 1883
      targetPort: default
      name: default
      protocol: TCP
    - port: 9001
      targetPort: websocket
      name: websocket
      protocol: TCP
```

You can then interact with the server using the client port: `tcp://mqtt-broker.default.svc.cluster.local:1883`
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
