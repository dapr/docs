
# Set up an Azure Kubernetes Service Cluster

## Prerequisites

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Deploy an Azure Kubernetes Service Cluster

This guide will walk you through installing Azure Kubernetes Service cluster. If you need more information, please refer to [Quickstart: Deploy an Azure Kubernetes Service (AKS) cluster using the Azure CLI](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough)

1. Login to Azure
```bash
az login
```

2. Set the default subscription
```bash
az account set -s [your_subscription_id]
```

3. Create Resource Group

```bash
az group create --name [your_resource_group] --location [region]
```

4. Create Azure Kubernetes Service cluster
Use 1.13.x or newer version of Kubernetes with `--kubernetes-version`

```bash
az aks create --resource-group [your_resource_group] --name [your_aks_cluster_name] --node-count 2 --kubernetes-version 1.14.6 --enable-addons http_application_routing --enable-rbac --generate-ssh-keys
```

5. Get access credentials for a managed Kubernetes cluster

```bash
az aks get-credentials -n [your_aks_cluster_name] -g [your_resource_group]
```

## (optional) Install Helm and deploy Tiller

1. [Install Helm client](https://helm.sh/docs/using_helm/#installing-the-helm-client)

2. Create the tiller service account
```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/helm-charts/master/docs/prerequisities/helm-rbac-config.yaml
```

3. Run the following to install tiller into the cluster
```bash
helm init --service-account tiller --history-max 200
```

4. Ensure that Tiller is deployed and running
```bash
kubectl get pods -n kube-system
```