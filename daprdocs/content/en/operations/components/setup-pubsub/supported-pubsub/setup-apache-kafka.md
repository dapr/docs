---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "Detailed documentation on the Apache Kafka pubsub component"
---

## Setup Kafka
{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image.
To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).
{{% /codetab %}}

{{% codetab %}}
To run Kafka on Kubernetes, you can use the [Helm Chart](https://github.com/helm/charts/tree/master/incubator/kafka#installing-the-chart).
{{% /codetab %}}

{{< /tabs >}}

## Create a Dapr component

The next step is to create a Dapr component for Kafka.

Create the following YAML file named `kafka.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.kafka
  metadata:
      # Kafka broker connection setting
    - name: brokers
      # Comma separated list of kafka brokers
      value: "dapr-kafka.dapr-tests.svc.cluster.local:9092"
      # Enable auth. Default is "false"
    - name: authRequired
      value: "false"
      # Only available is authRequired is set to true
    - name: saslUsername
      value: <username>
      # Only available is authRequired is set to true
    - name: saslPassword
      value: <password>
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Apply the configuration

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.

## Related links
- [Pub/Sub building block]({{< ref pubsub >}})