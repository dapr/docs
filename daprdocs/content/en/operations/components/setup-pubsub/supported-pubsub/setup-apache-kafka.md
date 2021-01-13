---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "Detailed documentation on the Apache Kafka pubsub component"
---

## Component format

To setup Apache Kafka pubsub create a component of type `pubsub.kafka`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
      # Kafka broker connection setting
    - name: brokers
      value: "dapr-kafka.myapp.svc.cluster.local:9092"
    - name: authRequired
      value: "true"
    - name: saslUsername
      value: "adminuser"
    - name: saslPassword
      value: "KeFg23!"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| brokers             | Y  | Comma separated list of kafka brokers  | `localhost:9092`, `dapr-kafka.myapp.svc.cluster.local:9092`
| authRequired        | N  | Enable authentication on the Kafka broker. Defaults to `"false"`.   |`"true"`, `"false"`
| saslUsername        | N  | Username used for authentication. Only required if authRequired is set to true.   | `"adminuser"`
| saslPassword        | N  | Password used for authentication. Can be `secretKeyRef` to use a secret reference. Only required if authRequired is set to true. Can be `secretKeyRef` to use a secret reference  |  `""`, `"KeFg23!"`


## Create a Kafka instance
{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image.
To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).
{{% /codetab %}}

{{% codetab %}}
To run Kafka on Kubernetes, you can use the [Helm Chart](https://github.com/helm/charts/tree/master/incubator/kafka#installing-the-chart).
{{% /codetab %}}

{{< /tabs >}}


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})