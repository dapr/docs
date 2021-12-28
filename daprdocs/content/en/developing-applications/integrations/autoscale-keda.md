---
type: docs
title: "Autoscaling a Dapr app with KEDA"
linkTitle: "Autoscale with KEDA"
description: "How to configure your Dapr application to autoscale using KEDA"
weight: 2000
---

Dapr, with its modular building-block approach, along with the 10+ different [pub/sub components]({{< ref pubsub >}}), make it easy to write message processing applications. Since Dapr can run in many environments (e.g. VM, bare-metal, Cloud, or Edge) the autoscaling of Dapr applications is managed by the hosting layer.

For Kubernetes, Dapr integrates with [KEDA](https://github.com/kedacore/keda), an event driven autoscaler for Kubernetes. Many of Dapr's pub/sub components overlap with the scalers provided by [KEDA](https://github.com/kedacore/keda) so it's easy to configure your Dapr deployment on Kubernetes to autoscale based on the back pressure using KEDA.

This how-to walks through the configuration of a scalable Dapr application along with the back pressure on Kafka topic, however you can apply this approach to any [pub/sub components]({{< ref pubsub >}}) offered by Dapr.

## Install KEDA

To install KEDA, follow the [Deploying KEDA](https://keda.sh/docs/latest/deploy/) instructions on the KEDA website.

## Install Kafka (optional)

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

When done, also deploy the Kafka client and wait until it's ready:

```shell
kubectl apply -n kafka -f deployment/kafka-client.yaml
kubectl wait -n kafka --for=condition=ready pod kafka-client --timeout=120s
```

Next, create the topic which is used in this example (for example `demo-topic`):

> The number of topic partitions is related to the maximum number of replicas KEDA creates for your deployments

```shell
kubectl -n kafka exec -it kafka-client -- kafka-topics \
		--zookeeper kafka-cp-zookeeper-headless:2181 \
		--topic demo-topic \
		--create \
		--partitions 10 \
		--replication-factor 3 \
		--if-not-exists
```

## Deploy a Dapr Pub/Sub component

Next, we'll deploy the Dapr Kafka pub/sub component for Kubernetes. Paste the following YAML into a file named `kafka-pubsub.yaml`:

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

The above YAML defines the pub/sub component that your application subscribes to, the `demo-topic` we created above. If you used the Kafka Helm install instructions above you can leave the  `brokers` value as is. Otherwise, change this to the connection string to your Kafka brokers.

Also notice the `autoscaling-subscriber` value set for `consumerID` which is used later to make sure that KEDA and your deployment use the same [Kafka partition offset](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.).

Now, deploy the component to the cluster:

```bash
kubectl apply -f kafka-pubsub.yaml
```

## Deploy KEDA autoscaler for Kafka

Next, we will deploy the KEDA scaling object that monitors the lag on the specified Kafka topic and configures the Kubernetes Horizontal Pod Autoscaler (HPA) to scale your Dapr deployment in and out.

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

A few things to review here in the above file:

* `name` in the `scaleTargetRef` section in the `spec:` is the Dapr ID of your app defined in the Deployment (The value of the `dapr.io/id` annotation)
* `pollingInterval` is the frequency in seconds with which KEDA checks Kafka for current topic partition offset
* `minReplicaCount` is the minimum number of replicas KEDA creates for your deployment. (Note, if your application takes a long time to start it may be better to set that to `1` to ensure at least one replica of your deployment is always running. Otherwise, set that to `0` and KEDA creates the first replica for you)
* `maxReplicaCount` is the maximum number of replicas for your deployment. Given how [Kafka partition offset](http://cloudurable.com/blog/kafka-architecture-topics/index.html#:~:text=Kafka%20continually%20appended%20to%20partitions,fit%20on%20a%20single%20server.) works, you shouldn't set that value higher than the total number of topic partitions
* `topic` in the Kafka `metadata` section which should be set to the same topic to which your Dapr deployment subscribe (In this example `demo-topic`)
* Similarly the `bootstrapServers` should be set to the same broker connection string used in the `kafka-pubsub.yaml` file
* The `consumerGroup` should be set to the same value as the `consumerID` in the `kafka-pubsub.yaml` file

> Note: setting the connection string, topic, and consumer group to the *same* values for both the Dapr service subscription and the KEDA scaler configuration is critical to ensure the autoscaling works correctly.

Next, deploy the KEDA scaler to Kubernetes:

```bash
kubectl apply -f kafka_scaler.yaml
```

All done!

Now, that the `ScaledObject` KEDA object is configured, your deployment will scale based on the lag of the Kafka topic. More information on configuring KEDA for Kafka topics is available [here](https://keda.sh/docs/2.0/scalers/apache-kafka/).

You can now start publishing messages to your Kafka topic `demo-topic` and watch the pods autoscale when the lag threshold is higher than `5` topics, as we have defined in the KEDA scaler manifest. You can publish messages to the Kafka Dapr component by using the Dapr [Publish]({{< ref dapr-publish >}}) CLI command
