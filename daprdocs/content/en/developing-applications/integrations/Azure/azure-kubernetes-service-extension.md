---
type: docs
title: "Dapr extension for Azure Kubernetes Service (AKS)"
linkTitle: "Dapr extension for Azure Kubernetes Service (AKS)"
description: "Provision Dapr on your Azure Kubernetes Service (AKS) cluster with the Dapr extension"
weight: 4000
---

{{% alert title="Note" color="warning" %}}
{{% /alert %}}

The current recommended approach for installing Dapr on AKS is to [install Dapr using helm]({{% ref kubernetes-deploy.md %}}) and performing any authorization for Azure services using [workload identity federation]({{< ref howto-wif.md >}}).  This ensures that:
- Dapr is easy to update and remains compatible with the Dapr ecosystem
- Components can authorize transparently without requiring additional credentials

If you need to or are already using the AKS Dapr extension, it offers:
- Support for all native Dapr configuration capabilities through command-line arguments via the Azure CLI 
- The option of opting into automatic minor version upgrades of the Dapr runtime

Prerequisites for using the Dapr extension for AKS:
- [An Azure subscription](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [The latest version of the Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [An existing AKS cluster](https://learn.microsoft.com/azure/aks/tutorial-kubernetes-deploy-cluster)
- [The Azure Kubernetes Service RBAC Admin role](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#azure-kubernetes-service-rbac-admin)

{{< button text="Learn more about the Dapr extension for AKS" link="https://learn.microsoft.com/azure/aks/dapr" >}}
