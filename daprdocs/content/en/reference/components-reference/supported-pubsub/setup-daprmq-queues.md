---
type: docs
title: "DaprMQ Queues"
linkTitle: "DaprMQ Queues"
description: "Detailed documentation on the DaprMQ Queues pubsub component"
---

## Component format

To set up DaprMQ Queues pub/sub, create a component of type `pubsub.daprmq.queues`. Read the [How-to: Publish and Subscribe guide]({{% ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" %}}) on how to create and apply a pub/sub configuration.

> [DaprMQ](https://github.com/olitomlinson/dapr-mq) is a message queue built on Dapr actors. This component maps each Dapr topic to a DaprMQ queue of the same name: every subscriber to the topic competes for its messages, and each message is delivered to one of them.
> For fan-out, where every consumer ID receives its own copy of each message, see the [DaprMQ Topics pubsub component]({{% ref "setup-daprmq-topics" %}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: daprmq-pubsub
spec:
  type: pubsub.daprmq.queues
  version: v1
  metadata:
  - name: httpEndpoint
    value: "http://daprmq-gateway.daprmq.svc.cluster.local:8080"
  - name: grpcEndpoint
    value: "daprmq-gateway.daprmq.svc.cluster.local:8081"
  # - name: receiveMode # Optional
  #   value: "stream"
  # - name: lockTTL # Optional
  #   value: "30s"
  # - name: maxActiveMessages # Optional
  #   value: 100
  # - name: allowCompetingConsumers # Optional
  #   value: "true"
  # - name: concurrencyMode # Optional
  #   value: "parallel"
  # - name: maxConcurrentHandlers # Optional
  #   value: 0
  # - name: maxRetriableErrorsPerSec # Optional
  #   value: 10
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `httpEndpoint` | Y | Base URL of the DaprMQ REST API. | `"http://localhost:8002"` |
| `grpcEndpoint` | Y | Address of the DaprMQ gRPC API. | `"localhost:8102"` |
| `receiveMode` | N | How messages are received. `"stream"` holds a gRPC stream open: the server keeps up to `maxActiveMessages` delivered, refills as they are settled, and renews their locks. `"poll"` polls the queue in batches of `dequeueCount` and renews locks from the component. Default: `"stream"` | `"stream"`, `"poll"` |
| `lockTTL` | N | How long a delivered message stays locked to this instance. Locks are renewed until the message is settled; if this instance goes away without settling, the message is redelivered once its lock runs out. Default: `"30s"` | `"2m"` |
| `maxActiveMessages` | N | Stream mode: the most messages delivered to this instance and not yet settled (1-1000). Forced to `1` when `allowCompetingConsumers` is `false` or `concurrencyMode` is `"single"`, to keep order. Default: `100` | `20` |
| `lockRenewalInterval` | N | Poll mode: how often the locks of messages taken but not yet settled are extended. Must be less than `lockTTL`. Set to `"0s"` to disable renewal, in which case `lockTTL` must exceed the time a message waits for and spends in its handler. Default: `"10s"` | `"20s"` |
| `dequeueCount` | N | Poll mode: the most messages taken from the queue per poll (1-1000). Default: `10` | `100` |
| `pollInterval` | N | Poll mode: how long to wait before polling again when the queue is empty or locked. Default: `"1s"` | `"250ms"` |
| `allowCompetingConsumers` | N | Lets each subscriber hold its own locks, so every subscriber to the queue consumes concurrently. When `false`, one subscriber at a time holds locks on the queue, which keeps delivery strictly in order. Default: `"true"` | `"true"`, `"false"` |
| `concurrencyMode` | N | Calls the subscriber for one message at a time (`"single"`) or several at once (`"parallel"`). Default: `"parallel"` | `"single"`, `"parallel"` |
| `maxConcurrentHandlers` | N | The most messages handled at once when `concurrencyMode` is `"parallel"`. `0` is unlimited, which in stream mode means up to `maxActiveMessages`. Default: `0` | `20` |
| `maxRetriableErrorsPerSec` | N | The most failed messages returned for redelivery per second, so a message that keeps failing can't be redelivered in a tight loop. `0` is unlimited. Default: `10` | `5` |

## Ordering

DaprMQ queues are FIFO. To receive messages strictly in the order they were published, set `allowCompetingConsumers` to `"false"`, which lets one subscriber instance at a time hold locks on the queue, and `concurrencyMode` to `"single"`.

## Message metadata

### Sending a message with metadata

To set DaprMQ metadata when publishing a message, set the query parameters on the HTTP request or the gRPC metadata as documented [here]({{% ref "pubsub_api.md#metadata" %}}).

- `metadata.priority`: a non-negative integer. Lower values are delivered first; `0` is a fast lane ahead of all other messages. Default: `1`

### Receiving a message with metadata

In stream mode, Dapr attaches the following metadata when it calls your application:

- `metadata.DeliveryCount`: how many times this message has been delivered, including this delivery.

## Sending multiple messages

DaprMQ Queues supports the bulk publish API. All entries in a bulk publish request are enqueued in a single call, so they succeed or fail together.

## Retries and dead-letter queues

When your application fails to process a message, the component returns it to its original position in the queue and DaprMQ increments its delivery count. Once the count exceeds the server's maximum delivery count (`DAPRMQ_MAX_DELIVERY_COUNT`, default `10`), DaprMQ moves the message to the queue `{topic}-deadletter` instead. A message that can't be decoded is moved to the dead-letter queue straight away.

You can also use Dapr's own [dead-letter topics]({{% ref pubsub-deadletter %}}) with a resiliency policy that controls how to retry.

## Create a DaprMQ instance

{{< tabpane text=true >}}

{{% tab "Self-Hosted" %}}
Clone the [DaprMQ repository](https://github.com/olitomlinson/dapr-mq) and start it with Docker Compose:

```bash
docker compose up -d
```

The REST API listens on `localhost:8002` and the gRPC API on `localhost:8102`.
{{% /tab %}}

{{% tab "Kubernetes" %}}
DaprMQ needs the Dapr control plane and a Dapr state store that supports actors in the namespace it is installed into. See the [chart documentation](https://github.com/olitomlinson/dapr-mq/blob/main/helm/README.md) for setting one up, then install DaprMQ with Helm:

```bash
helm install daprmq oci://ghcr.io/olitomlinson/charts/daprmq \
  -n daprmq \
  --set dapr.stateStoreName=statestore
```

The REST API is served on `daprmq-gateway.daprmq.svc.cluster.local:8080` and the gRPC API on `daprmq-gateway.daprmq.svc.cluster.local:8081`.
{{% /tab %}}

{{< /tabpane >}}

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Pub/Sub building block]({{% ref pubsub %}})
- Read [this guide]({{% ref "howto-publish-subscribe.md#step-2-publish-a-topic" %}}) for instructions on configuring pub/sub components
