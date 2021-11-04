---
type: docs
title: "Secrets management overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of secrets management building block"
---

It's common for applications to store sensitive information such as connection strings, keys and tokens that are used to authenticate with databases, services and external systems in secrets by using a dedicated secret store.

Usually this involves setting up a secret store such as Azure Key Vault, Hashicorp Vault and others and storing the application level secrets there. To access these secret stores, the application needs to import the secret store SDK, and use it to access the secrets. This may require a fair amount of boilerplate code that is not related to the actual business domain of the app, and so becomes an even greater challenge in multi-cloud scenarios where different vendor specific secret stores may be used.

To make it easier for developers everywhere to consume application secrets, Dapr has a dedicated secrets building block API that allows developers to get secrets from a secret store.

Using Dapr's secret store building block typically involves the following:
1. Setting up a component for a specific secret store solution.
1. Retrieving secrets using the Dapr secrets API in the application code.
1. Optionally, referencing secrets in Dapr component files.

## Setting up a secret store

See [Setup secret stores]({{< ref howto-secrets.md >}}) for guidance on how to setup a secret store with Dapr.

## Using secrets in your application

Application code can call the secrets building block API to retrieve secrets from Dapr supported secret stores that can be used in your code.
Watch this [video](https://www.youtube.com/watch?v=OtbYCBt9C34&t=1818) for an example of how the secrets API can be used in your application.

For example, the diagram below shows an application requesting the secret called "mysecret" from a secret store called "vault" from a configured cloud secret store.

<img src="/images/secrets-overview-cloud-stores.png" width=600>

Applications can use the secrets API to access secrets from a Kubernetes secret store. In the example below, the application retrieves the same secret "mysecret" from a Kubernetes secret store.

<img src="/images/secrets-overview-kubernetes-store.png" width=600>

In Azure Dapr can be configured to use Managed Identities to authenticate with Azure Key Vault in order to retrieve secrets. In the example below, an Azure Kubernetes Service (AKS) cluster is configured to use managed identities. Then Dapr uses [pod identities](https://docs.microsoft.com/azure/aks/operator-best-practices-identity#use-pod-identities) to retrieve secrets from Azure Key Vault on behalf of the application.

<img src="/images/secrets-overview-azure-aks-keyvault.png" width=600>

Notice that in all of the examples above the application code did not have to change to get the same secret. Dapr did all the heavy lifting here via the secrets building block API and using the secret components.

See [Access Application Secrets using the Secrets API]({{< ref howto-secrets.md >}}) for a How To guide to use secrets in your application.

For detailed API information read [Secrets API]({{< ref secrets_api.md >}}).

## Referencing secret stores in Dapr components

When configuring Dapr components such as state stores it is often required to include credentials in components files. Instead of doing that, you can place the credentials within a Dapr supported secret store and reference the secret within the Dapr component. This is preferred approach and is a recommended best practice especially in production environments.

For more information read [referencing secret stores in components]({{< ref component-secrets.md >}})

## Limiting access to secrets

To provide more granular control on access to secrets, Dapr provides the ability to define scopes and restricting access permissions. Learn more about [using secret scoping]({{<ref secrets-scopes>}})


