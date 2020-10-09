---
title: "MQTT"
linkTitle: "MQTT"
type: docs
---

## Locally

You can run a MQTT broker [locally using Docker](https://hub.docker.com/_/eclipse-mosquitto):

```bash
docker run -d -p 1883:1883 -p 9001:9001 --name mqtt eclipse-mosquitto:1.6.9
```
You can then interact with the server using the client port: `mqtt://localhost:1883`

## Kubernetes

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

## Create a Dapr component

The next step is to create a Dapr component for MQTT.

Create the following yaml file named `mqtt.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.mqtt
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

To configure communication using TLS, ensure mosquitto broker is configured to support certificates.
Pre-requisite includes `certficate authority certificate`, `ca issued client certificate`, `client private key`.
Make following additional changes to mqtt pubsub components for supporting TLS.
```yaml
...
spec:
  type: pubsub.mqtt
  metadata:
  - name: url
    value: "tcps://host.domain[:port]"
  - name: caCert
    value: ''
  - name: clientCert
    value: ''
  - name: clientKey
    value: ''
```

Where:
* **url** (required) is the address of the MQTT broker.
    - use **tcp://** scheme for non-TLS communication.
    - use **tcps://** scheme for TLS communication.
* **qos** (optional) indicates the Quality of Service Level (QoS) of the message. (Default 0)
* **retain** (optional) defines whether the message is saved by the broker as the last known good value for a specified topic. (Default false)
* **cleanSession** (optional) will set the "clean session" in the connect message when client connects to an MQTT broker . (Default true)
* **caCert** (required for using TLS) is the certificate authority certificate.
* **clientCert** (required for using TLS) is the client certificate.
* **clientKey** (required for using TLS) is the client key.

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

## Apply the configuration

### In Kubernetes

To apply the MQTT pubsub to Kubernetes, use the `kubectl` CLI:

```bash
kubectl apply -f mqtt.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

