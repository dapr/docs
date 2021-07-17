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
  namespace: default
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
## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url    | Y  | Address of the MQTT broker  | Use `**tcp://**` scheme for non-TLS communication.   Use`**tcps://**` scheme for TLS communication.  <br> "tcp://[username][:password]@host.domain[:port]"
| qos    | N  | Indicates the Quality of Service Level (QoS) of the message. Default 0|`1`
| retain | N  | Defines whether the message is saved by the broker as the last known good value for a specified topic. Default `"false"`  | `"true"`, `"false"`
| cleanSession | N | will set the "clean session" in the connect message when client connects to an MQTT broker. Default `"true"`  | `"true"`, `"false"`
| caCert | Required for using TLS | Certificate authority certificate. Can be `secretKeyRef` to use a secret reference | `0123456789-0123456789`
| clientCert | Required for using TLS | Client certificate. Can be `secretKeyRef` to use a secret reference | `0123456789-0123456789`
| clientKey | Required for using TLS | Client key. Can be `secretKeyRef` to use a secret reference | `012345`
| backOffMaxRetries   | N  | The maximum number of retries to process the message before returning an error. Defaults to `"0"` which means the component will not retry processing the message. `"-1"` will retry indefinitely until the message is processed or the application is shutdown. And positive number is treated as the maximum retry count. The component will wait 5 seconds between retries. | `"3"`


### Communication using TLS
To configure communication using TLS, ensure mosquitto broker is configured to support certificates.
Pre-requisite includes `certficate authority certificate`, `ca issued client certificate`, `client private key`.
Here is an example.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
  namespace: default
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
  - name: url
    value: "tcps://host.domain[:port]"
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
      value: "false"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


## Create a MQTT broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a MQTT broker [locally using Docker](https://hub.docker.com/_/eclipse-mosquitto):

```bash
docker run -d -p 1883:1883 -p 9001:9001 --name mqtt eclipse-mosquitto:1.6.9
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
          image: eclipse-mosquitto:1.6.9
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
