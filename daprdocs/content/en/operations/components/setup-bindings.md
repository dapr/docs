---
type: docs
title: "Bindings components"
linkTitle: "Bindings"
description: "Guidance on setting up Dapr bindings components"
weight: 4000
---

Dapr integrates with external resources to allow apps to both be triggered by external events and interact with the resources. Each binding component has a name and this name is used when interacting with the resource.

As with other building block components, binding components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A binding in Dapr is described using a `Component` file with the following fields:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of binding is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.

Different [supported bindings]({{< ref supported-bindings >}}) will have different specific fields that would need to be configured. For example, when configuring a binding for [Azure Blob Storage]({{< ref blobstorage>}}), the file would look like this:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
  - name: decodeBase64
    value: <bool>
  - name: getBlobRetryCount
    value: <integer>
```

## Apply the configuration

Once you have created the component's YAML file, follow these instructions to apply it based on your hosting environment:


{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
{{% /codetab %}}

{{% codetab %}}
To deploy in Kubernetes, assuming your component file is named `mybinding.yaml`, run:

```bash
kubectl apply -f mybinding.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## Supported bindings

Visit the [bindings reference]({{< ref supported-bindings >}}) for a full list of supported resources.

## Related links
- [Bindings building block]({{< ref bindings >}})
- [Supported bindings]({{<ref supported-bindings >}})