---
type: docs
title: "Secret store components"
linkTitle: "Secret stores"
description: "Guidance on setting up different secret store components"
weight: 3000
aliases:
  - "/operations/components/setup-state-store/secret-stores-overview/"
---

Dapr integrates with secret stores to provide apps and other components with secure storage and access to secrets such as access keys and passwords. Each secret store component has a name and this name is used when accessing a secret.

As with other building block components, secret store components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A secret store in Dapr is described using a `Component` file with the following fields:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
  namespace: default
spec:
  type: secretstores.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of secret store is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.

Different [supported secret stores]({{< ref supported-secret-stores >}}) will have different specific fields that would need to be configured. For example, when configuring a secret store which uses AWS Secrets Manager the file would look like this:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  version: v1
  metadata:
  - name: region
    value: "[aws_region]"
  - name: accessKey
    value: "[aws_access_key]"
  - name: secretKey
    value: "[aws_secret_key]"
  - name: sessionToken
    value: "[aws_session_token]"
```

## Cache for secret stores

For performance purposes, dapr provides a caching feature for the secret store.
Cache for secret stores can easily be configured by metadata configuration. Each secret store can have its own cache configuration.

### Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| cacheEnable               | N        | Enable cache for this secret store or not. Defaults to `false`.| `true`、`false`
| cacheTTL               | N        | TTL for cache items. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that will be processed as milliseconds. Valid time units are “ns”, “us” (or “µs”), “ms”, “s”, “m”, “h”. Defaults to `5m`  | `5000`、`15m`
| cacheMemoryLimit               | N        | Maximum length in bytes of the memory usages for cache. Since the value in memory is encrypted, so the memory usage will be lagger than the original secret bytes. When exceeds the limit old items will be evicted. Defaults to `10485760` (1M).  | `10485760`

Below is an example of secret store configuration with cache enabled.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  version: v1
  metadata:
  - name: region
    value: "[aws_region]"
  - name: accessKey
    value: "[aws_access_key]"
  - name: secretKey
    value: "[aws_secret_key]"
  - name: sessionToken
    value: "[aws_session_token]"
  - name: cacheEnable
    value: "true"
  - name: cacheTTL
    value: "5m" # 5 minutes
  - name: cacheMemoryLimit
    value: "10485760" # 10M
```

## Apply the configuration

Once you have created the component's YAML file, follow these instructions to apply it based on your hosting environment:


{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
{{% /codetab %}}

{{% codetab %}}
To deploy in Kubernetes, assuming your component file is named `secret-store.yaml`, run:

```bash
kubectl apply -f secret-store.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## Supported secret stores

Visit the [secret stores reference]({{< ref supported-secret-stores >}}) for a full list of supported secret stores.


## Related links

- [Supported secret store components]({{< ref supported-secret-stores >}})
- [Secrets building block]({{< ref secrets >}})
