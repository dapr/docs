---
type: docs
title: "Dapr extension for Azure Kubernetes Service (AKS)"
linkTitle: "Azure Kubernetes Service (AKS) extension"
description: "Provision Dapr on your Azure Kubernetes Service (AKS) cluster with the Dapr extension"
weight: 4000
---

# Prerequisites
- [Azure subscription](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli-windows?tabs=azure-cli) and the ***aks-preview*** extension.
- [Azure Kubernetes Service (AKS) cluster](https://docs.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli)

## Install Dapr using the AKS Dapr extension
You have the option of using the AKS Dapr extension to provision Dapr on your AKS cluster. Additionally, the extension offers support for all native Dapr configuration capabilities through command-line arguments via the Azure CLI and offers the option of opting into automatic minor version upgrades of the Dapr runtime.

{{% alert title="Note" color="warning" %}}
If you install Dapr through the AKS extension, our recommendation is to continue using the extension for future management of Dapr instead of the Dapr CLI. Combining the two tools can cause conflicts and result in undesired behavior.
{{% /alert %}}

### How the extension works
The Dapr extension uses the Azure CLI to provision the Dapr control plane on your AKS cluster. The Dapr control plane consists of:

- **dapr-operator**: Manages component updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector**: Injects Dapr into annotated deployment pods and adds the environment variables DAPR_HTTP_PORT and DAPR_GRPC_PORT to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values.
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
Once your subscription is registered to use Kubernetes extensions, you can create the Dapr extension, which installs Dapr on your AKS cluster. For example:

```bash
az k8s-extension create --cluster-type managedClusters \
--cluster-name myAKSCluster \
--resource-group myResourceGroup \
--name myDaprExtension \
--extension-type Microsoft.Dapr
```

Additionally, you also have the option of allowing Dapr to auto-update its minor version by specifying the `--auto-upgrade-minor-version` parameter and setting the value to true:

```bash
--auto-upgrade-minor-version true
```

Once the k8-extension finishes provisioning, you can confirm that the Dapr control plane is installed on your AKS cluster by running: 

```bash
kubectl get pods -n dapr-system
```

For further information such as configuration options and targeting specific versions of Dapr, please see the official [AKS Dapr Extension Docs](https://docs.microsoft.com/azure/aks/dapr).