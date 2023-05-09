---
type: docs
title: "How to: Authenticate using Managed Service Identities"
linkTitle: "How to: Authenticate using MSI"
weight: 40000
description: "Learn about authenticating Azure components using Managed Service Identities"
---

Using MSI, authentication happens automatically by virtue of your application running on top of an Azure service that has an assigned identity. 

For example, let's say you enable a managed service identity for an Azure VM, Azure Container App, or an Azure Kubernetes Service cluster. When you do, an Azure AD application is created for you and automatically assigned to the service. Your Dapr services can then leverage that identity to authenticate with Azure AD, transparently and without you having to specify any credential.

To get started with managed identities, you need to assign an identity to a new or existing Azure resource. The instructions depend on the service use. Check the following official documentation for the most appropriate instructions:

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure Container Apps (ACA)](https://learn.microsoft.com/azure/container-apps/dapr-overview?tabs=bicep1%2Cyaml#using-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) (including Azure Web Apps and Azure Functions)
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)


After assigning a managed identity to your Azure resource, you will have credentials such as:

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

From the returned values, take note of **`principalId`**, which is the Service Principal ID that was created. You'll use that to grant access to Azure resources to your Service Principal.

## Next steps

{{< button text="Refer to Azure component specs >>" page="components-reference" >}}
