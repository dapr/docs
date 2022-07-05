---
type: docs
title: "Setup an Azure Kubernetes Service (AKS) cluster"
linkTitle: "Azure Kubernetes Service (AKS)"
weight: 2000
description: >
  How to setup Dapr on an Azure Kubernetes Cluster.
---

# Set up an Azure Kubernetes Service cluster

## Prerequisites

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
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

## Next steps

{{< button text="Install Dapr using the AKS Dapr extension >>" page="azure-kubernetes-service-extension" >}}
