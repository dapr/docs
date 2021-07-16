---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
description: Detailed information on the Kubernetes secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## Default Kubernetes secret store component
When Dapr is deployed to a Kubernetes cluster, a secret store with the name `kubernetes` is automatically provisioned. This is meant to streamline the usage of the native Kubernetes secret store but generally, it is a better practice to create a component definition like the one below with a custom name. Using a custom definition decouples referencing the secret store in your code from the hosting platform (Kubernetes) keeping you code more generic and portable. Additionally, by explicitly defining a Kubernetes secret store component you can connect to a Kubernetes secret store from a local Dapr self-hosted installation. This requires a valid [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file.

When limiting access to secrets in your application using [secret scopes]({{<ref secrets-scopes.md>}}), it's important to remember this store was automatically created and so to include it in the scope definition.

## Create a custom Kubernetes secret store component

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
## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
- [How To: Use secret scoping]({{<ref secrets-scopes.md>}})
