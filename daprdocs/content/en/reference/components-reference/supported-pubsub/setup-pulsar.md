---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "Detailed documentation on the Pulsar pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-pulsar/"
---

## Component format

To setup Apache Pulsar pubsub create a component of type `pubsub.pulsar`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration. For more information on Apache Pulsar [read the docs](https://pulsar.apache.org/docs/en/concepts-overview/)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pulsar-pubsub
spec:
  type: pubsub.pulsar
  version: v1
  metadata:
  - name: host
    value: "localhost:6650"
  - name: enableTLS
    value: "false"
  - name: tenant
    value: "public"
  - name: token
    value: "eyJrZXlJZCI6InB1bHNhci1wajU0cXd3ZHB6NGIiLCJhbGciOiJIUzI1NiJ9.eyJzd"
  - name: namespace
    value: "default"
  - name: persistent
    value: "true"
  - name: backOffPolicy
    value: "constant"
  - name: backOffMaxRetries
    value: "-1"
  - name: disableBatching
    value: "false"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| host               | Y  | Address of the Pulsar broker. Default is `"localhost:6650"` | `"localhost:6650"` OR `"http://pulsar-pj54qwwdpz4b-pulsar.ap-sg.public.pulsar.com:8080"`|
| enableTLS          | N  | Enable TLS.  Default: `"false"` | `"true"`, `"false"` |
| token              | N  | Enable Authentication.  | [How to create pulsar token](https://pulsar.apache.org/docs/en/security-jwt/#generate-tokens)|
| tenant             | N  | The topic tenant within the instance. Tenants are essential to multi-tenancy in Pulsar, and spread across clusters.  Default: `"public"` | `"public"` |
| namespace          | N  | The administrative unit of the topic, which acts as a grouping mechanism for related topics.  Default: `"default"` | `"default"`
| persistent         | N  | Pulsar supports two kind of topics: [persistent](https://pulsar.apache.org/docs/en/concepts-architecture-overview#persistent-storage) and [non-persistent](https://pulsar.apache.org/docs/en/concepts-messaging/#non-persistent-topics). With persistent topics, all messages are durably persisted on disks (if the broker is not standalone, messages are durably persisted on multiple disks), whereas data for non-persistent topics is not persisted to storage disks. Note: the default retry behavior is to retry until it succeeds, so when you use a non-persistent theme, you can reduce or prohibit retries by defining `backOffMaxRetries` to `0`. Default: `"true"` | `"true"`, `"false"`
| backOffPolicy              | N        | Retry policy, `"constant"` is a backoff policy that always returns the same backoff delay. `"exponential"` is a backoff policy that increases the backoff period for each retry attempt using a randomization function that grows exponentially. Defaults to `"constant"`. | `constant`、`exponential` |
| backOffDuration            | N        | The fixed interval only takes effect when the `backOffPolicy` is `"constant"`. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"5s"`. | `"5s"`、`"5000"`                  |
| backOffInitialInterval     | N        | The backoff initial interval on retry. Only takes effect when the `backOffPolicy` is `"exponential"`. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"500"`                         | `"50"`                       |
| backOffMaxInterval         | N        | The backoff initial interval on retry. Only takes effect when the `backOffPolicy` is `"exponential"`. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"60s"`     | `"60000"`                     |
| backOffMaxRetries          | N        | The maximum number of retries to process the message before returning an error. Defaults to `"0"` which means the component will not retry processing the message. `"-1"` will retry indefinitely until the message is processed or the application is shutdown. Any positive number is treated as the maximum retry count. | `"3"` |
| backOffRandomizationFactor | N        | Randomization factor, between 1 and 0, including 0 but not 1. Randomized interval = RetryInterval * (1 ± backOffRandomizationFactor). Defaults to `"0.5"`.                 | `"0.5"`                       |
| backOffMultiplier          | N        | Backoff multiplier for the policy. Increments the interval by multiplying it with the multiplier. Defaults to `"1.5"`         | `"1.5"`      |
| backOffMaxElapsedTime      | N        | After MaxElapsedTime the ExponentialBackOff returns Stop. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Defaults to `"15m"` | `"15m"` |
| disableBatching | N | disable batching.When batching enabled default batch delay is set to 10 ms and default batch size is 1000 messages,Setting `disableBatching: true` will make the producer to send messages individually. Default: `"false"` | `"true"`, `"false"`|
| batchingMaxPublishDelay | N | batchingMaxPublishDelay set the time period within which the messages sent will be batched,if batch messages are enabled. If set to a non zero value, messages will be queued until this time interval or  batchingMaxMessages (see below) or  batchingMaxSize (see below). There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h". Default: `"10ms"` | `"10ms"`, `"10"`|
| batchingMaxMessages | N | batchingMaxMessages set the maximum number of messages permitted in a batch.If set to a value greater than 1, messages will be queued until this threshold is reached or  batchingMaxSize (see below) has been reached or the batch interval has elapsed. Default: `"1000"` | `"1000"`|
| batchingMaxSize | N | batchingMaxSize sets the maximum number of bytes permitted in a batch. If set to a value greater than 1, messages will be queued until this threshold is reached or batchingMaxMessages (see above) has been reached or the batch interval has elapsed. Default: `"128KB"` | `"131072"`|

### Delay queue

When invoking the Pulsar pub/sub, it's possible to provide an optional delay queue by using the `metadata` query parameters in the request url.

These optional parameter names are `metadata.deliverAt` or `metadata.deliverAfter`:

- `deliverAt`: Delay message to deliver at a specified time (RFC3339 format), e.g. `"2021-09-01T10:00:00Z"`
- `deliverAfter`: Delay message to deliver after a specified amount of time, e.g.`"4h5m3s"`

Examples:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAt='2021-09-01T10:00:00Z' \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

Or

```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAfter='4h5m3s' \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## Create a Pulsar instance

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

```
docker run -it \
  -p 6650:6650 \
  -p 8080:8080 \
  --mount source=pulsardata,target=/pulsar/data \
  --mount source=pulsarconf,target=/pulsar/conf \
  apachepulsar/pulsar:2.5.1 \
  bin/pulsar standalone

```

{{% /codetab %}}

{{% codetab %}}
Refer to the following [Helm chart](https://pulsar.apache.org/docs/en/kubernetes-helm/) Documentation.
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
