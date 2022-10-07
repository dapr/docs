---
type: docs
title: "Secrets management overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of secrets management API building block"
---

Applications usually store sensitive information in secrets by using a dedicated secret store. For example, you authenticate databases, services, and external systems with connection strings, keys, tokens, and other application-level secrets stored in a secret store, such as [AWS Secrets Manager, Azure Key Vault, Hashicorp Vault, etc]({{< ref supported-secret-stores >}}).

To access these secret stores, the application imports the secret store SDK, often requiring a fair amount of unrelated boilerplate code. This poses an even greater challenge in multi-cloud scenarios, where different vendor-specific secret stores may be used.

## Secrets management API

Dapr's dedicated secrets building block API makes it easier for developers to consume application secrets from a secret store. To use Dapr's secret store building block, you:

1. Set up a component for a specific secret store solution.
1. Retrieve secrets using the Dapr secrets API in the application code.
1. Optionally, reference secrets in Dapr component files.

## Features

The secrets management API building block brings several features to your application.

### Configure secrets without changing application code

You can call the secrets API in your application code to retrieve and use secrets from Dapr supported secret stores. Watch [this video](https://www.youtube.com/watch?v=OtbYCBt9C34&t=1818) for an example of how the secrets management API can be used in your application.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/OtbYCBt9C34?start=1818" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

For example, the diagram below shows an application requesting the secret called "mysecret" from a secret store called "vault" from a configured cloud secret store.

<img src="/images/secrets-overview-cloud-stores.png" width=600>

Applications can also use the secrets API to access secrets from a Kubernetes secret store. By default, Dapr enables a built-in [Kubernetes secret store in Kubernetes mode]({{< ref "kubernetes-secret-store.md" >}}), deployed via:

- The Helm defaults, or
- `dapr init -k`

If you are using another secret store, you can disable (not configure) the Dapr Kubernetes secret store by setting `disable-builtin-k8s-secret-store` to `true` through the Helm settings. The default is `false`.

In the example below, the application retrieves the same secret "mysecret" from a Kubernetes secret store.

<img src="/images/secrets-overview-kubernetes-store.png" width=600>

In Azure, you can configure Dapr to retrieve secrets using managed identities to authenticate with Azure Key Vault. In the example below:

1. An [Azure Kubernetes Service (AKS) cluster](https://docs.microsoft.com/azure/aks) is configured to use managed identities. 
1. Dapr uses [pod identities](https://docs.microsoft.com/azure/aks/operator-best-practices-identity#use-pod-identities) to retrieve secrets from Azure Key Vault on behalf of the application.

<img src="/images/secrets-overview-azure-aks-keyvault.png" width=600>

In the examples above, the application code did not have to change to get the same secret. Dapr uses the secret management components via the secrets management building block API.

[Try out the secrets API]({{< ref "#try-out-secrets-management" >}}) using one of our quickstarts or tutorials.

### Reference secret stores in Dapr components

When configuring Dapr components such as state stores, you're often required to include credentials in components files. Alternatively, you can place the credentials within a Dapr supported secret store and reference the secret within the Dapr component. This is the preferred approach and recommended best practice, especially in production environments.

For more information, read [referencing secret stores in components]({{< ref component-secrets.md >}}).

### Limit access to secrets

To provide more granular control on access to secrets, Dapr provides the ability to define scopes and restricting access permissions. Learn more about [using secret scoping]({{< ref secrets-scopes >}})

## Try out secrets management

### Quickstarts and tutorials

Want to put the Dapr secrets management API to the test? Walk through the following quickstart and tutorials to see Dapr secrets in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Secrets management quickstart]({{< ref secrets-quickstart.md >}}) | Retrieve secrets in the application code from a configured secret store using the secrets management API. |
| [Secret Store tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore) | Demonstrates the use of Dapr Secrets API to access secret stores. |

### Start managing secrets directly in your app

Want to skip the quickstarts? Not a problem. You can try out the secret management building block directly in your application to retrieve and manage secrets. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the secrets management API starting with [the secrets how-to guide]({{< ref howto-secrets.md >}}).

## Next steps

- Learn [how to use secret scoping]({{< ref secrets-scopes.md >}}).
- Read the [secrets API reference doc]({{< ref secrets_api.md >}}).