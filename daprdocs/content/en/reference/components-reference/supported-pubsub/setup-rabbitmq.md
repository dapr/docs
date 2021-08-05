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
  - name: backOffPolicy
    value: "exponential"
  - name: backOffInitialInterval
    value: "100"
  - name: backOffMaxRetries
    value: "16"
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
| backOffPolicy              | N        | Retry policy, `"constant"` is a backoff policy that always returns the same backoff delay. `"exponential"` is a backoff policy that increases the backoff period for each retry attempt using a randomization function that grows exponentially. Defaults to `"constant"`. | `constant`、`exponential` |
| backOffDuration            | N        | The fixed interval only takes effect when the policy is constant. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"5s"`. | `"5s"`、`"5000"`                  |
| backOffInitialInterval     | N        | The backoff initial interval on retry. Only takes effect when the policy is exponential. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"500"`                         | `"50"`                       |
| backOffMaxInterval         | N        | The backoff initial interval on retry. Only takes effect when the policy is exponential. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"60s"`     | `"60000"`                     |
| backOffMaxRetries          | N        | The maximum number of retries to process the message before returning an error. Defaults to `"0"` which means the component will not retry processing the message. `"-1"` will retry indefinitely until the message is processed or the application is shutdown. Any positive number is treated as the maximum retry count. | `"3"` |
| backOffRandomizationFactor | N        | Randomization factor, between 1 and 0, including 0 but not 1. Randomized interval = RetryInterval * (1 ± backOffRandomizationFactor). Defaults to `"0.5"`.                 | `"0.5"`                       |
| backOffMultiplier          | N        | Backoff multiplier for the policy. Increments the interval by multiplying it with the multiplier. Defaults to `"1.5"`         | `"1.5"`      |
| backOffMaxElapsedTime      | N        | After MaxElapsedTime the ExponentialBackOff returns Stop. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"15m"` | `"15m"` |


### Backoff policy introduction
Backoff retry strategy can instruct the dapr sidecar how to resend the message. By default, the retry strategy is turned off, which means that the sidecar will send a message to the service once. When the service returns a result, the message will be marked as consumption regardless of whether it is correct or not. The above is based on the condition of `autoAck` and `requeueInFailure` is setting to false(if `requeueInFailure` is set to true, the message will get a second chance).

But in some cases, you may want dapr to retry pushing message with an (exponential or constant) backoff strategy until the message is processed normally or the number of retries is exhausted. This maybe useful when your service breaks down abnormally but the sidecar is not stopped together. Adding backoff policy will retry the message pushing during the service downtime, instead of marking these message as consumed.


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
