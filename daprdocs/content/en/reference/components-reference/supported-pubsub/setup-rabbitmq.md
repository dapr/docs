---
type: docs
title: "RabbitMQ"
linkTitle: "RabbitMQ"
description: "Detailed documentation on the RabbitMQ pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-rabbitmq/"
---

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rabbitmq-pubsub
  namespace: default
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: durable
    value: "false"
  - name: deletedWhenUnused
    value: "false"
  - name: autoAck
    value: "false"
  - name: deliveryMode
    value: "0"
  - name: requeueInFailure
    value: "false"
  - name: prefetchCount
    value: "0"
  - name: reconnectWait
    value: "0"
  - name: concurrencyMode
    value: parallel
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| host               | Y        | Connection-string for the rabbitmq host  | `amqp://user:pass@localhost:5672`
| durable            | N        | Whether or not to use [durable](https://www.rabbitmq.com/queues.html#durability) queues. Defaults to `"false"`  | `"true"`, `"false"`
| deletedWhenUnused  | N        | Whether or not the queue should be configured to [auto-delete](https://www.rabbitmq.com/queues.html) Defaults to `"true"` | `"true"`, `"false"`
| autoAck  | N        | Whether or not the queue consumer should [auto-ack](https://www.rabbitmq.com/confirms.html) messages. Defaults to `"false"` | `"true"`, `"false"`
| deliveryMode  | N        | Persistence mode when publishing messages. Defaults to `"0"`. RabbitMQ treats `"2"` as persistent, all other numbers as non-persistent | `"0"`, `"2"`
| requeueInFailure  | N        | Whether or not to requeue when sending a [negative acknowledgement](https://www.rabbitmq.com/nack.html) in case of a failure. Defaults to `"false"` | `"true"`, `"false"`
| prefetchCount  | N        | Number of messages to [prefetch](https://www.rabbitmq.com/consumer-prefetch.html). Consider changing this to a non-zero value for production environments. Defaults to `"0"`, which means that all available messages will be pre-fetched. | `"2"`
| reconnectWait  | N        | How long to wait (in seconds) before reconnecting if a connection failure occurs | `"0"`
| concurrencyMode | N        | `parallel` is the default, and allows processing multiple messages in parallel (limited by the `app-max-concurrency` annotation, if configured). Set to `single` to disable parallel processing. In most situations there's no reason to change this. | `parallel`, `single`


## Create a RabbitMQ server

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run a RabbitMQ server locally using Docker:

```bash
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```

You can then interact with the server using the client port: `localhost:5672`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install RabbitMQ on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/rabbitmq):

```bash
helm install rabbitmq stable/rabbitmq
```

Look at the chart output and get the username and password.

This will install RabbitMQ into the `default` namespace.
To interact with RabbitMQ, find the service with: `kubectl get svc rabbitmq`.

For example, if installing using the example above, the RabbitMQ server client address would be:

`rabbitmq.default.svc.cluster.local:5672`
{{% /codetab %}}

{{< /tabs >}}


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}}) in the Related links section
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
