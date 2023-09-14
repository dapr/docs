---
type: docs
title: "Set up an Azure Kubernetes Service (AKS) cluster"
linkTitle: "Azure Kubernetes Service (AKS)"
weight: 2000
description: >
  Learn how to set up an Azure Kubernetes Cluster
---

This guide walks you through installing an Azure Kubernetes Service (AKS) cluster. If you need more information, refer to [Quickstart: Deploy an AKS cluster using the Azure CLI](https://docs.microsoft.com/azure/aks/kubernetes-walkthrough)

## Prerequisites

- Install:
   - [Docker](https://docs.docker.com/install/)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)

## Deploy an AKS cluster

1. In the terminal, log into Azure.

   ```bash
   az login
   ```

1. Set your default subscription:

   ```bash
   az account set -s [your_subscription_id]
   ```

1. Create a resource group.

   ```bash
   az group create --name [your_resource_group] --location [region]
   ```

1. Create an AKS cluster. To use a specific version of Kubernetes, use `--kubernetes-version` (1.13.x or newer version required).

   ```bash
   az aks create --resource-group [your_resource_group] --name [your_aks_cluster_name] --node-count 2 --enable-addons http_application_routing --generate-ssh-keys
   ```

1. Get the access credentials for the AKS cluster.

   ```bash
   az aks get-credentials -n [your_aks_cluster_name] -g [your_resource_group]
   ```

## AKS Edge Essentials
To create a single-machine K8s/K3s Linux-only cluster using Azure Kubernetes Service (AKS) Edge Essentials, you can follow the quickstart guide available at [AKS Edge Essentials quickstart guide](https://learn.microsoft.com/azure/aks/hybrid/aks-edge-quickstart). 

{{% alert title="Note" color="primary" %}}
AKS Edge Essentials does not come with a default storage class, which may cause issues when deploying Dapr. To avoid this, make sure to enable the **local-path-provisioner** storage class on the cluster before deploying Dapr. If you need more information, refer to [Local Path Provisioner on AKS EE](https://learn.microsoft.com/azure/aks/hybrid/aks-edge-howto-use-storage-local-path).
{{% /alert %}}

## Related links

- Learn more about [the Dapr extension for AKS]({{< ref azure-kubernetes-service-extension >}})
   - [Install the Dapr extension for AKS](https://learn.microsoft.com/azure/aks/dapr)
   - [Configure the Dapr extension for AKS](https://learn.microsoft.com/azure/aks/dapr-settings)
   - [Deploy and run workflows with the Dapr extension for AKS](https://learn.microsoft.com/azure/aks/dapr-workflow)
