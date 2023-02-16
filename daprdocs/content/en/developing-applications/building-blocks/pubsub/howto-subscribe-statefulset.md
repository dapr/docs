---
type: docs
title: "How to: Horizontally scale subscribers with StatefulSets"
linkTitle: "How to: Horizontally scale subscribers with StatefulSets"
weight: 6000
description: "Learn how to subscribe with StatefulSet and scale horizontally with consistent consumer IDs"
---

Unlike Deployments, where Pods are ephemeral, [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) allows deployment of stateful applications on Kubernetes by keeping a sticky identity for each Pod.

Below is an example of a StatefulSet with Dapr:
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: python-subscriber
spec:
  selector:
    matchLabels:
      app: python-subscriber  # has to match .spec.template.metadata.labels
  serviceName: "python-subscriber"
  replicas: 3
  template:
    metadata:
      labels:
        app: python-subscriber # has to match .spec.selector.matchLabels
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "python-subscriber"
        dapr.io/app-port: "5001"
    spec:
      containers:
      - name: python-subscriber
        image: ghcr.io/dapr/samples/pubsub-python-subscriber:latest
        ports:
        - containerPort: 5001
        imagePullPolicy: Always
```

When subscribing to a pub/sub topic via Dapr, the application can define the `consumerID`, which determines the subscriber's position in the queue or topic. With the StatefulSets sticky identity of Pods, you can have a unique `consumerID` per Pod, allowing each horizontal scale of the subscriber application. Dapr keeps track of the name of each Pod, which can be used when declaring components using the `{podName}` marker.

On scaling the number of subscribers of a given topic, each Dapr component has unique settings that determine the behavior. Usually, there are two options for multiple consumers:

 - Broadcast: each message published to the topic will be consumed by all subscribers.
 - Shared: a message is consumed by any subscriber (but not all).

Kafka isolates each subscriber by `consumerID` with its own position in the topic. When an instance restarts, it reuses the same `consumerID` and continues from its last known position, without skipping messages. The component below demonstrates how a Kafka component can be used by multiple Pods:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: my-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092
  - name: consumerID
    value: "{podName}"
  - name: authRequired
    value: "false"
```

The MQTT3 protocol has shared topics, allowing multiple subscribers to "compete" for messages from the topic, meaning a message is only processed by one of them. For example:

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
      value: "{podName}"
    - name: cleanSession
      value: "true"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
```

## Next steps

- Try the [pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub).
- Learn about [messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}}) and when you might want to [send messages without CloudEvents]({{< ref pubsub-raw.md >}}).
- Review the list of [pub/sub components]({{< ref setup-pubsub >}}).
- Read the [API reference]({{< ref pubsub_api.md >}}).
