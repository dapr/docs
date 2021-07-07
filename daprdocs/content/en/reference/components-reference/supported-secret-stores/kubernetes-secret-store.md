---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
description: Detailed information on the Kubernetes secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## Create the Kubernetes Secret Store component

To setup a Kubernetes secret store create a component of type `secretstores.kubernetes`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mycustomsecretstore
  namespace: default
spec:
  type: secretstores.kubernetes
  version: v1
  metadata:
  - name: ""
```
{{% alert title="Warning" color="warning" %}}
When Dapr is deployed to Kubernetes a secret store with name `kubernetes` is automatically provisioned. We discourage use of this secret store.
{{% /alert %}}

>Note: By explicitly defining a Kubernetes secret store component you can connect to a Kubernetes secret store from a local standalone Dapr installation. This requires a valid [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
