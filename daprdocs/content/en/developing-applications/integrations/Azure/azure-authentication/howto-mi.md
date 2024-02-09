---
type: docs
title: "How to: Use Managed Identities"
linkTitle: "How to: Use MI"
weight: 40000
aliases:
  - "/developing-applications/integrations/azure/azure-authentication/howto-msi/"
description: "Learn how to use Managed Identities"
---

Using Managed Identities (MI), authentication happens automatically by virtue of your application running on top of an Azure service that has an assigned identity. 

Let's say you enable a managed service identity using an Azure KeyVault secrets component for an Azure service. When you do, an Microsoft Entra ID application is created for you and automatically assigned to the service. Your Dapr services can then leverage that identity to authenticate with Microsoft Entra ID, transparently and without you having to specify any credentials.

Dapr supports both system-assigned and user-assigned identities.

{{% alert title="Note" color="primary" %}}
In your component YAML, you only need the [`azureClientId` property]({{< ref "authenticating-azure.md#authenticating-with-managed-identities-mi" >}}) if using user-assigned identity. Otherwise, you can omit this property for system-managed identity to be used by default.
{{% /alert %}}

## System-assigned

If you set up system-assigned MI using an Azure KeyVault component, the YAML would look like the following:

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: mykeyvault
```

In this example, the system-assigned MI looks up the service identity and communicates with the `mykeyvault` vault. Next, 

## User-assigned

If you set up user-assigned identity using an Azure KeyVault component, the YAML would look like the following:

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: mykeyvault
  - name: azureClientId
    value: someAzureIdentityClientIDHere
```

Once you've set up the component YAML with the `azureClientId` property, 

## Grant access to the service

you need to perform the requisite Microsoft Entra ID role assignments to grant the system-managed or user-managed identity access to the desired service. 

You can do this by assigning an identity to a new or existing Azure resource. The instructions depend on the service use. Check the following official documentation for the most appropriate instructions:

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure Container Apps (ACA)](https://learn.microsoft.com/azure/container-apps/dapr-overview?tabs=bicep1%2Cyaml#using-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) (including Azure Web Apps and Azure Functions)
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

After assigning an identity to your Azure resource, you will have credentials such as:

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

From the returned values, take note of **`principalId`**, which is the Service Principal ID that was created. You'll use that to grant access to Azure resources to your identity.

## Next steps

{{< button text="Refer to Azure component specs >>" page="components-reference" >}}
