---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of secret stores for Dapr"
weight: 10000
type: docs
---

Dapr integrates with secret stores to provide apps and other components with secure store and access to secrets such as access keys and passwords.. Each secret store component has a name and this name is used when accessing a secret.

Secret stores are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A secret store in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
  namespace: default
spec:
  type: secretstores.<NAME>
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of secret store is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.

Visit [this guide]({{< ref "howto-secrets.md#setting-up-a-secret-store-component" >}}) for instructions on configuring a secret store component.

## Related links

- [Supported secret store components]({{< ref supported-secret-stores >}})
- [Secrets building block]({{< ref secrets >}})