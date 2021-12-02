---
type: docs
title: "NATS Streaming"
linkTitle: "NATS Streaming"
description: "Detailed documentation on the NATS Streaming pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-nats-streaming/"
---

## Component format
To setup NATS Streaming pubsub create a component of type `pubsub.natsstreaming`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: natsstreaming-pubsub
  namespace: default
spec:
  type: pubsub.natsstreaming
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: natsStreamingClusterID
    value: "clusterId"
    # below are subscription configuration.
  - name: subscriptionType
    value: <REPLACE-WITH-SUBSCRIPTION-TYPE> # Required. Allowed values: topic, queue.
  - name: ackWaitTime
    value: "" # Optional.
  - name: maxInFlight
    value: "" # Optional.
  - name: durableSubscriptionName
    value: "" # Optional.
  # following subscription options - only one can be used
  - name: deliverNew
    value: <bool>
  - name: startAtSequence
    value: 1
  - name: startWithLastReceived
    value: false
  - name: deliverAll
    value: false
  - name: startAtTimeDelta
    value: ""
  - name: startAtTime
    value: ""
  - name: startAtTimeFormat
    value: ""
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

{{% alert title="Warning" color="warning" %}}
NATS Streaming has been [deprecated](https://github.com/nats-io/nats-streaming-server/#warning--deprecation-notice-warning).
Please consider using [NATS JetStream]({{< ref setup-jetstream >}}) going forward.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| natsURL            | Y  | NATS server address URL   | "`nats://localhost:4222`"|
| natsStreamingClusterID  | Y  | NATS cluster ID   |`"clusterId"`|
| subscriptionType   | Y | Subscription type. Allowed values `"topic"`, `"queue"` | `"topic"` |
| ackWaitTime        | N | See [here](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements) | `"300ms"`|
| maxInFlight        | N | See [here](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements) | `"25"` |
| durableSubscriptionName | N | [Durable subscriptions](https://docs.nats.io/developing-with-nats-streaming/durables) identification name. | `"my-durable"`|
| deliverNew         | N | Subscription Options. Only one can be used. Deliver new messages only  | `"true"`, `"false"` |
| startAtSequence    | N | Subscription Options. Only one can be used. Sets the desired start sequence position and state  | `"100000"`, `"230420"` |
| startWithLastReceived | N | Subscription Options. Only one can be used. Sets the start position to last received. | `"true"`, `"false"` |
| deliverAll         | N | Subscription Options. Only one can be used. Deliver all available messages  | `"true"`, `"false"` |
| startAtTimeDelta   | N | Subscription Options. Only one can be used. Sets the desired start time position and state using the delta  | `"10m"`, `"23s"` |
| startAtTime        | N | Subscription Options. Only one can be used. Sets the desired start time position and state  | `"Feb 3, 2013 at 7:54pm (PST)"` |
| startAtTimeDelta   | N | Must be used with `startAtTime`. Sets the format for the time  | `"Jan 2, 2006 at 3:04pm (MST)"` |

## Create a NATS server

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a NATS server locally using Docker:

```bash
docker run -d --name nats-streaming -p 4222:4222 -p 8222:8222 nats-streaming
```

You can then interact with the server using the client port: `localhost:4222`.
{{% /codetab %}}

{{% codetab %}}
Install NATS on Kubernetes by using the [kubectl](https://docs.nats.io/running-a-nats-service/introduction/running/nats-kubernetes/minimal-setup#minimal-nats-setup):

```bash
# Single server NATS

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/single-server-nats.yml

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-streaming-server/single-server-stan.yml
```

This installs a single NATS-Streaming and Nats into the `default` namespace.
To interact with NATS, find the service with: `kubectl get svc stan`.

For example, if installing using the example above, the NATS Streaming address would be:

`<YOUR-HOST>:4222`
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
- [NATS Streaming Deprecation Notice](https://github.com/nats-io/nats-streaming-server/#warning--deprecation-notice-warning)
