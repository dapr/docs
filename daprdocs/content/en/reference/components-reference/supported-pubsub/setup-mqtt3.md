---
type: docs
title: "MQTT3"
linkTitle: "MQTT3"
description: "Detailed documentation on the MQTT3 pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-mqtt3/"
  - "/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
---

## Component format

To setup a MQTT3 pubsub create a component of type `pubsub.mqtt3`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: url
      value: "tcp://[username][:password]@host.domain[:port]"
    # Optional
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: qos
      value: "1"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `url`    | Y  | Address of the MQTT broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication. | `"tcp://[username][:password]@host.domain[:port]"`
| `consumerID` | N | The client ID used to connect to the MQTT broker. Defaults to the Dapr app ID. | `"myMqttClientApp"`
| `retain` | N  | Defines whether the message is saved by the broker as the last known good value for a specified topic. Defaults to `"false"`. | `"true"`, `"false"`
| `cleanSession` | N | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"` ([more info](http://www.steves-internet-guide.com/mqtt-clean-sessions-example/)). Defaults to `"false"`. | `"true"`, `"false"`
| `caCert` | Required for using TLS | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | See example below
| `clientCert`  | Required for using TLS | TLS client certificate in PEM format. Must be used with `clientKey`. | See example below
| `clientKey` | Required for using TLS | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | See example below
| `qos`    | N  | Indicates the Quality of Service Level (QoS) of the message ([more info](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)). Defaults to `1`. |`0`, `1`, `2`

### Communication using TLS

To configure communication using TLS, ensure that the MQTT broker (e.g. emqx) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: url
      value: "ssl://host.domain[:port]"
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
    - name: qos
      value: 1
```

Note that while the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

### Consuming a shared topic

When consuming a shared topic, each consumer must have a unique identifier. By default, the application ID is used to uniquely identify each consumer and publisher. In self-hosted mode, invoking each `dapr run` with a different application ID is sufficient to have them consume from the same shared topic. However, on Kubernetes, multiple instances of an application pod will share the same application ID, prohibiting all instances from consuming the same topic. To overcome this, configure the component's `consumerID` metadata with a `{uuid}` tag (which will give each instance a randomly generated value on start up) or `{podName}` (which will use the Pod's name on Kubernetes). For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: consumerID
      value: "{uuid}"
    - name: cleanSession
      value: "true"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

Note that in the case, the value of the consumer ID is random every time Dapr restarts, so you should set `cleanSession` to `true` as well.

It is recommended to use [StatefulSets]({{< ref "howto-subscribe-statefulset.md" >}}) with shared subscriptions.

## Create a MQTT3 broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a MQTT broker like emqx [locally using Docker](https://hub.docker.com/_/emqx):

```bash
docker run -d -p 1883:1883 --name mqtt emqx:latest
```

You can then interact with the server using the client port: `tcp://localhost:1883`
{{% /codetab %}}

{{% codetab %}}
You can run a MQTT3 broker in kubernetes using following yaml:

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
          image: emqx:latest
          imagePullPolicy: IfNotPresent
          ports:
            - name: default
              containerPort: 1883
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
```

You can then interact with the server using the client port: `tcp://mqtt-broker.default.svc.cluster.local:1883`
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
