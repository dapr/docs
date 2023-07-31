---
type: docs
title: "Dapr extension for Azure Kubernetes Service (AKS)"
linkTitle: "Dapr extension for Azure Kubernetes Service (AKS)"
description: "Provision Dapr on your Azure Kubernetes Service (AKS) cluster with the Dapr extension"
weight: 4000
---

# Prerequisites
- Azure subscription
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli-windows?tabs=azure-cli) and the ***aks-preview*** extension.
- [Azure Kubernetes Service (AKS) cluster](https://docs.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli)

## Install Dapr using the AKS Dapr extension
The recommended approach for installing Dapr on AKS is to use the AKS Dapr extension. The extension offers support for all native Dapr configuration capabilities through command-line arguments via the Azure CLI and offers the option of opting into automatic minor version upgrades of the Dapr runtime.

{{% alert title="Note" color="warning" %}}
If you install Dapr through the AKS extension, our recommendation is to continue using the extension for future management of Dapr instead of the Dapr CLI. Combining the two tools can cause conflicts and result in undesired behavior.
{{% /alert %}}

### How the extension works
The Dapr extension works by provisioning the Dapr control plane on your AKS cluster through the Azure CLI. The dapr control plane consists of:

- **dapr-operator**: Manages component updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector**: Injects Dapr into annotated deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT`. This enables user-defined applications to communicate with Dapr without the need to hard-code Dapr port values. 
- **dapr-placement**: Used for actors only. Creates mapping tables that map actor instances to pods
- **dapr-sentry**: Manages mTLS between services and acts as a certificate authority. For more information read the security overview.

### Extension Prerequisites 
In order to use the AKS Dapr extension, you must first enable the `AKS-ExtensionManager` and `AKS-Dapr` feature flags on your Azure subscription.

The below command will register the `AKS-ExtensionManager` and `AKS-Dapr` feature flags on your Azure subscription:

```bash
az feature register --namespace "Microsoft.ContainerService" --name "AKS-ExtensionManager"
az feature register --namespace "Microsoft.ContainerService" --name "AKS-Dapr"
```

After a few minutes, check the status to show `Registered`. Confirm the registration status by using the az feature list command:

```bash
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKS-ExtensionManager')].{Name:name,State:properties.state}"
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKS-Dapr')].{Name:name,State:properties.state}"
```

Next, refresh the registration of the `Microsoft.KubernetesConfiguration` and `Microsoft.ContainerService` resource providers by using the az provider register command:

```bash
az provider register --namespace Microsoft.KubernetesConfiguration
az provider register --namespace Microsoft.ContainerService
```

#### Enable the Azure CLI extension for cluster extensions
You will also need the `k8s-extension` Azure CLI extension. Install this by running the following commands:

```bash
az extension add --name k8s-extension
```

If the `k8s-extension` extension is already present, you can update it to the latest version using the below command:

```bash
az extension update --name k8s-extension
```

#### Create the extension and install Dapr on your AKS cluster
After your subscription is registered to use Kubernetes extensions, install Dapr on your cluster by creating the Dapr extension. For example:

```bash
az k8s-extension create --cluster-type managedClusters \
--cluster-name myAKSCluster \
--resource-group myResourceGroup \
--name myDaprExtension \
--extension-type Microsoft.Dapr
```

Additionally, Dapr can automatically update its minor version. To enable this, set the `--auto-upgrade-minor-version` parameter to true:

```bash
--auto-upgrade-minor-version true
```

Once the k8-extension finishes provisioning, you can confirm that the Dapr control plane is installed on your AKS cluster by running: 

```bash
kubectl get pods -n dapr-system
```

In the example output below, note how the Dapr control plane is installed with high availability mode, enabled by default.

```
~  kubectl get pods -n dapr-system
NAME                                    READY   STATUS    RESTARTS   AGE
dapr-dashboard-5f49d48796-rnt5t         1/1     Running   0          1h
dapr-operator-98579b8b4-fpz7k           1/1     Running   0          1h
dapr-operator-98579b8b4-nn5vm           1/1     Running   0          1h
dapr-operator-98579b8b4-pplqr           1/1     Running   0          1h
dapr-placement-server-0                 1/1     Running   0          1h
dapr-placement-server-1                 1/1     Running   0          1h
dapr-placement-server-2                 1/1     Running   0          1h
dapr-sentry-775bccdddb-htcl7            1/1     Running   0          1h
dapr-sentry-775bccdddb-vtfxj            1/1     Running   0          1h
dapr-sentry-775bccdddb-w4l8x            1/1     Running   0          1h
dapr-sidecar-injector-9555889bc-klb9g   1/1     Running   0          1h
dapr-sidecar-injector-9555889bc-rpjwl   1/1     Running   0          1h
dapr-sidecar-injector-9555889bc-rqjgt   1/1     Running   0          1h
```

For more information about configuration options and targeting specific Dapr versions, see the official [AKS Dapr Extension Docs](https://docs.microsoft.com/azure/aks/dapr).
