# Autoscaling a Dapr app with KEDA

Dapr is a programming model that's being installed and operated using a sidecar, and thus leaves autoscaling to the hosting layer, for example Kubernetes.
Many of Dapr's [bindings](../../concepts/bindings#supported-bindings-and-specs) overlap with those of [KEDA](https://github.com/kedacore/keda), an Event Driven Autoscaler for Kubernetes.

For apps that use these bindings, it is easy to configure a KEDA autoscaler.

## Install KEDA

To install KEDA, follow the [Deploying KEDA](https://keda.sh/docs/latest/deploy/) instructions on the KEDA website.

## Create KEDA enabled Dapr binding

For this example, we'll be using Kafka.

You can install Kafka in your cluster by using Helm:

```bash
$ helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
$ helm install my-kafka incubator/kafka
```

Next, we'll create the Dapr Kafka binding for Kubernetes.

Paste the following in a file named kafka.yaml:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafkaevent
  namespace: default
spec:
  type: bindings.kafka
  metadata:
  - name: brokers
    value: "my-kafka:9092"
  - name: topics
    value: "myTopic"
  - name: consumerGroup
    value: "group1"
```

The following YAML defines a Kafka component that listens for the topic `myTopic`, with consumer group `group1` and that connects to a broker at `my-kafka:9092`.

Deploy the binding to the cluster:

```bash
$ kubectl apply -f kafka.yaml
```

## Create the KEDA autoscaler for Kafka

Paste the following to a file named kafka_scaler.yaml, and put the name of your Deployment in the required places:

```yaml
apiVersion: keda.k8s.io/v1alpha1
kind: ScaledObject
metadata:
  name: kafka-scaler
  namespace: default
  labels:
    deploymentName: <REPLACE-WITH-DEPLOYMENT-NAME>
spec:
  scaleTargetRef:
    deploymentName: <REPLACE-WITH-DEPLOYMENT-NAME>
  triggers:
  - type: kafka
    metadata:
      type: kafkaTrigger
      direction: in
      name: event
      topic: myTopic
      bootstrapServers:  my-kafka:9092
      consumerGroup: group1
      dataType: binary
      lagThreshold: '5'
```

Deploy the KEDA scaler to Kubernetes:

```bash
$ kubectl apply -f kafka_scaler.yaml
```

All done!

You can now start publishing messages to your Kafka topic `myTopic` and watch the pods autoscale when the lag threshold is bigger than `5`, as defined in the KEDA scaler manifest.
