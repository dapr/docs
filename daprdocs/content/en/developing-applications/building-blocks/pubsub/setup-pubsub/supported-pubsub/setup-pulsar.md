---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "Detailed documentation on the Pulsar pubsub component"
---

## Setup Pulsar

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
Please refer to the following [Helm chart](https://pulsar.apache.org/docs/en/kubernetes-helm/) Documentation.
{{% /codetab %}}

{{< /tabs >}}

## Create a Dapr component

The next step is to create a Dapr component for Pulsar.

Create the following YAML file named pulsar.yaml:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.pulsar
  version: v1
  metadata:
  - name: host
    value: <REPLACE WITH PULSAR URL> #default is localhost:6650
  - name: enableTLS
    value: <TRUE/FALSE>

```

## Apply the configuration

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.

## Related links
- [Pub/Sub building block]({{< ref pubsub >}})