---
type: docs
title: "How to: Use workload identity federation"
linkTitle: "How to: Use workload identity federation"
weight: 20000
description: "Learn how to configure Dapr to use workload identity federation on Azure."
---

This guide will help you configure your Kubernetes cluster to run Dapr with Azure workload identity federation.

## What is it?

[Workload identity federation](https://learn.microsoft.com/entra/workload-id/workload-identities-overview) 
is a way for your applications to authenticate to Azure without having to store or manage credentials as part of 
your releases.

By using workload identity federation, any Dapr components running on Kubernetes and AKS that target Azure can authenticate transparently
with no extra configuration.

## Guide 

We'll show how to configure an Azure Key Vault resource against your AKS cluster. You can adapt this guide for different 
Dapr Azure components by substituting component definitions as necessary.

For this How To, we'll use this [Dapr AKS secrets sample app](https://github.com/dapr/samples/dapr-aks-workload-identity-federation).

### Prerequisites

 - AKS cluster with workload identity enabled
 - Microsoft Entra ID tenant

### 1 - Enable workload identity federation

Follow [the Azure documentation for enabling workload identity federation on your AKS cluster](https://learn.microsoft.com/azure/aks/workload-identity-deploy-cluster#deploy-your-application4).

The HowTo walks through configuring your Azure Entra ID tenant to trust an identity that originates from your AKS cluster issuer.
It also guides you in setting up a [Kubernetes service account](https://kubernetes.io/docs/concepts/security/service-accounts/) which 
is associated with an Azure managed identity you create.

Once completed, return here to continue with step 2.

### 2 - Add a secret to Azure Key Vault

In the Azure Key Vault you created and add a secret called `dapr` with the value of `Hello Dapr!`.

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

You'll notice that we have not provided any details specific to authentication in the component definition.  This is intentional, as Dapr is able to leverage the Kubernetes service account to transparently authenticate to Azure.

### 4 - Deploy the test application

Go to the  [workload identity federation sample application](https://github.com/dapr/samples/dapr-aks-workload-identity-federation) and prepare a build of the image.

Make sure the image is pushed up to a registry that your AKS cluster has visibility and permission to pull from.

Next, create a deployment for our sample AKS secrets app container along with a Dapr sidecar.

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
        dapr.io/enabled: "true" # Enable Dapr
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
