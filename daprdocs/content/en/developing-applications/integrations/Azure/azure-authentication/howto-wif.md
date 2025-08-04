---
type: docs
title: "How to: Configure dapr to use workload identity federation on Azure"
linkTitle: "How to: Configure dapr to use workload identity federation on Azure"
weight: 20000
description: "Learn how to configure dapr to use workload identity federation on Azure."
---

This guide will help you configure your Kubernetes cluster to run dapr with Azure workload identity federation.

## What is it?

[Workload identity federation](https://learn.microsoft.com/entra/workload-id/workload-identities-overview) 
is a way for your applications to authenticate to Azure without having to store or manage credentials as part of 
your releases.

By using workload identity federation, any dapr components that target Azure will be able to authenticate transparently
with no extra configuration! 🎉

### How does it differ?

Workload identity federation is one of a few ways Azure offers for your applications to gain access to Azure 
resources.  Other options include:

 - [Pod Managed Identities]({{< ref howto-mi.md >}}) - [Deprecated](https://learn.microsoft.com/azure/aks/use-azure-ad-pod-identity) method for authenticating applications at a pod level.
 - [System and user assigned managed identities](https://learn.microsoft.com/azure/aks/use-managed-identity) - Less granular than workload identity federation.
 - [Client ID and secret]({{ < ref howto-aad.md >}}) - Less recommended as it requires you to maintian and associate credentials at application level.

You can learn more about workload identity federation [over in the Azure documentation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation).

## Guide 

We'll show you how to configure an Azure Key Vault resource against your dapr cluster. You can adapt this guide for different 
dapr Azure components by substituting component definitions as necessary.

For this guide, we'll use [the official dapr AKS secrets sample app](https://github.com/dapr/samples/dapr-aks-workload-identity-federation).

### Prerequisites

 - AKS cluster with workload identity enabled
 - Azure Entra ID tenant

### 1 - Enable workload identity federation

Follow [the Azure documentation for enabling workload identity federation on your AKS cluster](https://learn.microsoft.com/azure/aks/workload-identity-deploy-cluster#deploy-your-application4).

The guide will walk you through configuring your Azure Entra ID tenant to trust an identity that originates from your AKS cluster issuer.
It will also guide you in setting up a [Kubernetes service account](https://kubernetes.io/docs/concepts/security/service-accounts/) which 
will be associated with an Azure managed identity you create.

Once completed, return to this guide to continue with step 2.

### 2 - Add a secret to Azure Key Vault

Head into the Azure Key Vault you created and add a secret called `dapr` with the value of `Hello dapr!`.

### 3 - Configure the Azure Key Vault dapr component

By this point, you should have a Kubernetes service account with a name similar to `workload-identity-sa0a1b2c`.

Apply the following to your Kubernetes cluster, remembering to update `your-key-vault` with the name of your key vault:

```yaml
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: demo-secret-store # Be sure not to change this, as our app will be looking for it.
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: your-key-vault # Replace
```

You'll notice that we have not provided any details specific to authentication in the component definition.  This is intentional, as dapr will be able to leverage the Kubernetes service account to transparently authenticate to Azure.

### 4 - Deploy the test application

Next, create a deployment for our sample AKS secrets app container along with a dapr sidecar.

Remember to update `dapr-wif-k8s-service-account` with your service account name and `dapraksworkloadidentityfederation` with an image your cluster can resolve:


```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aks-dapr-wif-secrets
  labels:
    app: aks-dapr-wif-secrets
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aks-dapr-wif-secrets
  template:
    metadata:
      labels:
        app: aks-dapr-wif-secrets
        azure.workload.identity/use: "true" # Important
      annotations:
        dapr.io/enabled: "true" # Don't forget to enable dapr! ♥️
        dapr.io/app-id: "aks-dapr-wif-secrets"
    spec:
      serviceAccountName: dapr-wif-k8s-service-account # Remember to replace
      containers:
        - name: workload-id-demo
          image: dapraksworkloadidentityfederation # Remember to replace
          imagePullPolicy: Always
```
Once the application is up and running, it should output the following:

```
Fetched Secret: Hello dapr!
```
