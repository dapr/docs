---
type: docs
title: "How to: Autoscale a Dapr app with KEDA"
linkTitle: "How to: Autoscale with KEDA"
description: "How to configure your Dapr application to autoscale using KEDA"
weight: 3000
---

Dapr, with its building-block API approach, along with the many [pub/sub components]({{< ref pubsub >}}), makes it easy to write message processing applications. Since Dapr can run in many environments (for example VMs, bare-metal, Cloud or Edge Kubernetes) the autoscaling of Dapr applications is managed by the hosting layer.

For Kubernetes, Dapr integrates with [KEDA](https://github.com/kedacore/keda), an event driven autoscaler for Kubernetes. Many of Dapr's pub/sub components overlap with the scalers provided by [KEDA](https://github.com/kedacore/keda), so it's easy to configure your Dapr deployment on Kubernetes to autoscale based on the back pressure using KEDA.

In this guide, you configure a scalable Dapr application, along with the back pressure on Kafka topic. However, you can apply this approach to _any_ [pub/sub components]({{< ref pubsub >}}) offered by Dapr.

{{% alert title="Note" color="primary" %}}
 If you're working with Azure Container Apps, refer to the official Azure documentation for [scaling Dapr applications using KEDA scalers](https://learn.microsoft.com/azure/container-apps/dapr-keda-scaling).

{{% /alert %}}

## Install KEDA

To install KEDA, follow the [Deploying KEDA](https://keda.sh/docs/latest/deploy/) instructions on the KEDA website.

## Install and deploy Kafka

If you don't have access to a Kafka service, you can install it into your Kubernetes cluster for this example by using Helm:

```bash
helm repo add confluentinc https://confluentinc.github.io/cp-helm-charts/
helm repo update
kubectl create ns kafka
helm install kafka confluentinc/cp-helm-charts -n kafka \
		--set cp-schema-registry.enabled=false \
		--set cp-kafka-rest.enabled=false \
		--set cp-kafka-connect.enabled=false
```

To check on the status of the Kafka deployment:

```shell
kubectl rollout status deployment.apps/kafka-cp-control-center -n kafka
kubectl rollout status deployment.apps/kafka-cp-ksql-server -n kafka
kubectl rollout status statefulset.apps/kafka-cp-kafka -n kafka
kubectl rollout status statefulset.apps/kafka-cp-zookeeper -n kafka
```

Once installed, deploy the Kafka client and wait until it's ready:

```shell
kubectl apply -n kafka -f deployment/kafka-client.yaml
kubectl wait -n kafka --for=condition=ready pod kafka-client --timeout=120s
```

## Create the Kafka topic

Create the topic used in this example (`demo-topic`):

```shell
kubectl -n kafka exec -it kafka-client -- kafka-topics \
		--zookeeper kafka-cp-zookeeper-headless:2181 \
		--topic demo-topic \
		--create \
		--partitions 10 \
		--replication-factor 3 \
		--if-not-exists
```

> The number of topic `partitions` is related to the maximum number of replicas KEDA creates for your deployments.

## Deploy a Dapr pub/sub component

Deploy the Dapr Kafka pub/sub component for Kubernetes. Paste the following YAML into a file named `kafka-pubsub.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: autoscaling-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: kafka-cp-kafka.kafka.svc.cluster.local:9092
    - name: authRequired
      value: "false"
    - name: consumerID
      value: autoscaling-subscriber
```

The above YAML defines the pub/sub component that your application subscribes to and that [you created earlier (`demo-topic`)]({{< ref "#create-the-kakfa-topic" >}}). 

If you used the [Kafka Helm install instructions]({{< ref "#install-and-deploy-kafka" >}}), you can leave the `brokers` value as-is. Otherwise, change this value to the connection string to your Kafka brokers.

Notice the `autoscaling-subscriber` value set for `consumerID`. This value is used later to ensure that KEDA and your deployment use the same [Kafka partition offset](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.).

Now, deploy the component to the cluster:

```bash
kubectl apply -f kafka-pubsub.yaml
```

## Deploy KEDA autoscaler for Kafka

Deploy the KEDA scaling object that:
- Monitors the lag on the specified Kafka topic
- Configures the Kubernetes Horizontal Pod Autoscaler (HPA) to scale your Dapr deployment in and out

Paste the following into a file named `kafka_scaler.yaml`, and configure your Dapr deployment in the required place:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: subscriber-scaler
spec:
  scaleTargetRef:
    name: <REPLACE-WITH-DAPR-DEPLOYMENT-NAME>
  pollingInterval: 15
  minReplicaCount: 0
  maxReplicaCount: 10
  triggers:
  - type: kafka
    metadata:
      topic: demo-topic
      bootstrapServers: kafka-cp-kafka.kafka.svc.cluster.local:9092
      consumerGroup: autoscaling-subscriber
      lagThreshold: "5"
```

Let's review a few metadata values in the file above:

| Values | Description |
| ------ | ----------- |
| `scaleTargetRef`/`name` | The Dapr ID of your app defined in the Deployment (The value of the `dapr.io/id` annotation). |
| `pollingInterval` | The frequency in seconds with which KEDA checks Kafka for current topic partition offset. |
| `minReplicaCount` | The minimum number of replicas KEDA creates for your deployment. If your application takes a long time to start, it may be better to set this to `1` to ensure at least one replica of your deployment is always running. Otherwise, set to `0` and KEDA creates the first replica for you. |
| `maxReplicaCount` | The maximum number of replicas for your deployment. Given how [Kafka partition offset](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.) works, you shouldn't set that value higher than the total number of topic partitions. |
| `triggers`/`metadata`/`topic` | Should be set to the same topic to which your Dapr deployment subscribed (in this example, `demo-topic`). |
| `triggers`/`metadata`/`bootstrapServers` | Should be set to the same broker connection string used in the `kafka-pubsub.yaml` file. |
| `triggers`/`metadata`/`consumerGroup` | Should be set to the same value as the `consumerID` in the `kafka-pubsub.yaml` file. |

{{% alert title="Important" color="warning" %}}
 Setting the connection string, topic, and consumer group to the *same* values for both the Dapr service subscription and the KEDA scaler configuration is critical to ensure the autoscaling works correctly.

{{% /alert %}}


Deploy the KEDA scaler to Kubernetes:

```bash
kubectl apply -f kafka_scaler.yaml
```

All done!

## See the KEDA scaler work

Now that the `ScaledObject` KEDA object is configured, your deployment will scale based on the lag of the Kafka topic. [Learn more about configuring KEDA for Kafka topics](https://keda.sh/docs/2.0/scalers/apache-kafka/).

As defined in the KEDA scaler manifest, you can now start publishing messages to your Kafka topic `demo-topic` and watch the pods autoscale when the lag threshold is higher than `5` topics. Publish messages to the Kafka Dapr component by using the Dapr [Publish]({{< ref dapr-publish >}}) CLI command.

## Next steps

[Learn about scaling your Dapr pub/sub or binding application with KEDA in Azure Container Apps](https://learn.microsoft.com/azure/container-apps/dapr-keda-scaling)