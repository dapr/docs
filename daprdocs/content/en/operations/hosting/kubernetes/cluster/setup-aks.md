---
type: docs
title: "Setup an Azure Kubernetes Service (AKS) cluster with Dapr"
linkTitle: "Azure Kubernetes Service (AKS) with Dapr"
weight: 2000
description: >
  How to setup Dapr on an Azure Kubernetes Cluster.
---

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Azure Subscription](https://azure.microsoft.com/en-us/free/?WT.mc_id=A261C142F)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest)

## Deploy an Azure Kubernetes Service cluster

This guide walks you through installing an Azure Kubernetes Service cluster. If you need more information, refer to [Quickstart: Deploy an Azure Kubernetes Service (AKS) cluster using the Azure CLI](https://docs.microsoft.com/azure/aks/kubernetes-walkthrough)

1. Login to Azure

```bash
az login
```

2. Set the default subscription

```bash
az account set -s [your_subscription_id]
```

3. Create a resource group

```bash
az group create --name [your_resource_group] --location [region]
```

4. Create an Azure Kubernetes Service cluster

> **Note:** To use a specific version of Kubernetes use `--kubernetes-version` (1.13.x or newer version required)

```bash
az aks create --resource-group [your_resource_group] --name [your_aks_cluster_name] --node-count 2 --enable-addons http_application_routing --generate-ssh-keys
```

5. Get the access credentials for the Azure Kubernetes cluster

```bash
az aks get-credentials -n [your_aks_cluster_name] -g [your_resource_group]
```

## Install Dapr using the AKS Dapr extension
By using the AKS Dapr extension to provision Dapr on your AKS cluster, you eliminate the requirement of downloading Dapr specific tooling and manually installing and managing the runtime on your AKS cluster. Additionally, the extension offers support for all native Dapr configuration capabilities through simple command-line arguments.

{{% alert title="Note" color="warning" %}}
If you install Dapr through the AKS extension, our recommendation is to continue using the extension for future management of Dapr instead of the Dapr CLI. Combining the two tools can cause conflicts and result in undesired behavior.
{{% /alert %}}

### How it works
The AKS Dapr extension uses the Azure CLI to provision the Dapr control plane on your AKS cluster. This will create:

- **dapr-operator**: Manages component updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector**: Injects Dapr into annotated deployment pods and adds the environment variables DAPR_HTTP_PORT and DAPR_GRPC_PORT to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values.
- **dapr-placement**: Used for actors only. Creates mapping tables that map actor instances to pods
- **dapr-sentry**: Manages mTLS between services and acts as a certificate authority. For more information read the security overview.

### Extension Prerequisites 
To create an AKS cluster that can use the Dapr extension, you must enable the `AKS-ExtensionManager` and `AKS-Dapr` feature flags on your subscription.

Register the `AKS-ExtensionManager` and `AKS-Dapr` feature flags by using the az feature register command, as shown in the following example:

```bash
az feature register --namespace "Microsoft.ContainerService" --name "AKS-ExtensionManager"
az feature register --namespace "Microsoft.ContainerService" --name "AKS-Dapr"
```

It takes a few minutes for the status to show Registered. Verify the registration status by using the az feature list command:

```bash
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKS-ExtensionManager')].{Name:name,State:properties.state}"
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKS-Dapr')].{Name:name,State:properties.state}"
```

When ready, refresh the registration of the `Microsoft.KubernetesConfiguration` and `Microsoft.ContainerService` resource providers by using the az provider register command:

```bash
az provider register --namespace Microsoft.KubernetesConfiguration
az provider register --namespace Microsoft.ContainerService
```

#### Set up the Azure CLI extension for cluster extensions
You will also need the `k8s-extension` Azure CLI extension. Install this by running the following commands:

```bash
az extension add --name k8s-extension
```

If the `k8s-extension` extension is already installed, you can update it to the latest version using the following command:

```bash
az extension update --name k8s-extension
```

#### Create the extension and install Dapr on your AKS cluster
Once your subscription is registered to use Kubernetes extensions, you can create the Dapr extension, which installs Dapr on your AKS cluster. For example:

```bash
az k8s-extension create --cluster-type managedClusters \
--cluster-name myAKSCluster \
--resource-group myResourceGroup \
--name myDaprExtension \
--extension-type Microsoft.Dapr
```

You also have the option of allowing Dapr to auto-update its minor version by specifying the `--auto-upgrade-minor-version` parameter and setting the value to true:

```bash
--auto-upgrade-minor-version true
```

Once the k8-extension finishes provisioning, you can confirm that the Dapr control plane is installed on your AKS cluster by running: 

```bash
kubectl get pods -n dapr-system
```

For further information such as configuration options and targeting specific versions of Dapr, please see the official [Azure AKS Dapr Extension Docs](https://docs.microsoft.com/en-us/azure/aks/dapr).

## (optional) Install Helm v3

1. [Install Helm v3 client](https://helm.sh/docs/intro/install/)

> **Note:** The latest Dapr helm chart no longer supports Helm v2. Please migrate from helm v2 to helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).

2. In case you need permissions  the kubernetes dashboard (i.e. configmaps is forbidden: User "system:serviceaccount:kube-system:kubernetes-dashboard" cannot list configmaps in the namespace "default", etc.) execute this command

```bash
kubectl create clusterrolebinding kubernetes-dashboard -n kube-system --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
```