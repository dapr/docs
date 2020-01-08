
# Set up an Azure Kubernetes Service cluster

## Prerequisites

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Deploy an Azure Kubernetes Service cluster

This guide walks you through installing an Azure Kubernetes Service cluster. If you need more information, refer to [Quickstart: Deploy an Azure Kubernetes Service (AKS) cluster using the Azure CLI](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough)

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
Use 1.13.x or newer version of Kubernetes with `--kubernetes-version`

> **Note:** [1.16.x Kubernetes doesn't work with helm < 2.15.0](https://github.com/helm/helm/issues/6374#issuecomment-537185486)

```bash
az aks create --resource-group [your_resource_group] --name [your_aks_cluster_name] --node-count 2 --kubernetes-version 1.14.6 --enable-addons http_application_routing --enable-rbac --generate-ssh-keys
```

5. Get the access credentials for the Azure Kubernetes cluster

```bash
az aks get-credentials -n [your_aks_cluster_name] -g [your_resource_group]
```

## (optional) Install Helm

### Helm 3 installation (prefered)

1. [Install Helm 3 client](https://helm.sh/docs/intro/install/)

### Helm 2 installation

1. [Install Helm 2 client](https://v2.helm.sh/docs/using_helm/#installing-helm)

2. Create the Tiller service account
```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/helm-charts/master/docs/prerequisities/helm-rbac-config.yaml
```

3. Run the following to install Tiller into the cluster
```bash
helm init --service-account tiller --history-max 200
```

4. Ensure that Tiller is deployed and running
```bash
kubectl get pods -n kube-system
```
