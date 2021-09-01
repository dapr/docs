---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "Detailed documentation on the Pulsar pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-pulsar/"
---

## Component format
To setup Pulsar pubsub create a component of type `pubsub.pulsar`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pulsar-pubsub
  namespace: default
spec:
  type: pubsub.pulsar
  version: v1
  metadata:
  - name: host
    value: "localhost:6650"
  - name: enableTLS
    value: "false"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| host               | Y  | Address of the Pulsar broker. Default is `"localhost:6650"` | `"localhost:6650"`|
| enableTLS          | N  | Enable TLS.  Default: `"false"` | `"true"`, `"false"`|


### Delay queue

When invoking the Pulsar pub/sub, its possible to provide an optional delay queue by using the `metadata` query param in the request url.

These param names are `deliverAt` or `deliverAfter`.

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| deliverAt | N | delay queue configuration param. Default is empty | `"2021-09-01 10:00:00"`|
| deliverAfter | N | delay queue configuration param. Default is empty | `"4h5m3s"`|

Example:


```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAt='2021-09-01 10:00:00' \
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
