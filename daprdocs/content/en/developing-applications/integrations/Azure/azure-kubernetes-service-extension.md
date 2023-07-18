---
type: docs
title: "Dapr extension for Azure Kubernetes Service (AKS)"
linkTitle: "Dapr extension for Azure Kubernetes Service (AKS)"
description: "Provision Dapr on your Azure Kubernetes Service (AKS) cluster with the Dapr extension"
weight: 4000
---

The recommended approach for installing Dapr on AKS is to use the AKS Dapr extension. The extension offers:
- Support for all native Dapr configuration capabilities through command-line arguments via the Azure CLI 
- The option of opting into automatic minor version upgrades of the Dapr runtime

{{% alert title="Note" color="warning" %}}
If you install Dapr through the AKS extension, best practice is to continue using the extension for future management of Dapr _instead of the Dapr CLI_. Combining the two tools can cause conflicts and result in undesired behavior.
{{% /alert %}}

Prerequisites for using the Dapr extension for AKS:
- [An Azure subscription](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [The latest version of the Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [An existing AKS cluster](https://learn.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster)
- [The Azure Kubernetes Service RBAC Admin role](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#azure-kubernetes-service-rbac-admin)

{{< button text="Learn more about the Dapr extension for AKS" link="https://learn.microsoft.com/azure/aks/dapr" >}}
