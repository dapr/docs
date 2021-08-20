---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
description: Detailed information on the Kubernetes secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## Default Kubernetes secret store component
When Dapr is deployed to a Kubernetes cluster, a secret store with the name `kubernetes` is automatically provisioned. This pre-provisioned secret store allows you to use the native Kubernetes secret store with no need to author, deploy or maintain a component configuration file for the secret store and is useful for developers looking to simply access secrets stored natively in a Kubernetes cluster.

A custom component definition file for a Kubernetes secret store can still be configured (See below for details). Using a custom definition decouples referencing the secret store in your code from the hosting platform as the store name is not fixed and can be customized, keeping you code more generic and portable. Additionally, by explicitly defining a Kubernetes secret store component you can connect to a Kubernetes secret store from a local Dapr self-hosted installation. This requires a valid [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file.

{{% alert title="Scoping secret store access" color="warning" %}}
When limiting access to secrets in your application using [secret scopes]({{<ref secrets-scopes.md>}}), it's important to include the default secret store in the scope definition in order to restrict it.
{{% /alert %}}

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
