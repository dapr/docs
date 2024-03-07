---
type: docs
title: "How to: Use managed identities"
linkTitle: "How to: Use managed identities"
weight: 40000
aliases:
  - "/developing-applications/integrations/azure/azure-authentication/howto-msi/"
description: "Learn how to use managed identities"
---

Using managed identities, authentication happens automatically by virtue of your application running on top of an Azure service that has either a system-managed or a user-assigned identity. 

To get started, you need to enable a managed identity as a service option/functionality in various Azure services, independent of Dapr. Enabling this creates an identity (or application) under the hood for Microsoft Entra ID (previously Azure Active Directory ID) purposes.

Your Dapr services can then leverage that identity to authenticate with Microsoft Entra ID, transparently and without you having to specify any credentials.

In this guide, you learn how to:
- Grant your identity to the Azure service you're using via official Azure documentation
- Set up either a system-managed or user-assigned identity in your component


That's about all there is to it.

{{% alert title="Note" color="primary" %}}
In your component YAML, you only need the [`azureClientId` property]({{< ref "authenticating-azure.md#authenticating-with-managed-identities-mi" >}}) if using user-assigned identity. Otherwise, you can omit this property for system-managed identity to be used by default.
{{% /alert %}}

## Grant access to the service

Set the requisite Microsoft Entra ID role assignments or custom permissions to your system-managed or user-assigned identity for a particular Azure resource (as identified by the resource scope).

You can set up a managed identity to a new or existing Azure resource. The instructions depend on the service use. Check the following official documentation for the most appropriate instructions:

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure Container Apps (ACA)](https://learn.microsoft.com/azure/container-apps/dapr-components?tabs=yaml#using-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) (including Azure Web Apps and Azure Functions)
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

After assigning a system-managed identity to your Azure resource, you'll have credentials like the following:

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

From the returned values, take note of the **`principalId`** value, which is [the Service Principal ID created for your identity]({{< ref "howto-aad.md#create-a-service-principal" >}}). Use that to grant access permissions for your Azure resources component to access the identity.

{{% alert title="Managed identities in Azure Container Apps" color="primary" %}}
Every container app has a completely different system-managed identity, making it very unmanageable to handle the required role assignments across multiple apps. 

Instead, it's _strongly recommended_ to use a user-assigned identity and attach this to all the apps that should load the component. Then, you should scope the component to those same apps.
{{% /alert %}}

## Set up identities in your component

By default, Dapr Azure components look up the system-managed identity of the environment they run in and authenticate as that. Generally, for a given component, there are no required properties to use system-managed identity other than the service name, storage account name, and any other properites required by the Azure service (listed in the documentation). 

For user-assigned idenitities, in addition to the basic properties required by the service you're using, you need to specify the `azureClientId` (user-assigned identity ID) in the component. Make sure the user-assigned identity is attached to the Azure service Dapr is running on, or else you won't be able to use that identity.

{{% alert title="Note" color="primary" %}}
If the sidecar loads a component which does not specify `azureClientId`, it only tries the system-assigned identity. If the component specifies the `azureClientId` property, it only tries the particular user-assigned identity with that ID.
{{% /alert %}}

The following examples demonstrate setting up either a system-managed or user-assigned identity in an Azure KeyVault secrets component.

{{< tabs "System-managed" "User-assigned" "Kubernetes" >}}

 <!-- system managed -->
{{% codetab %}}

If you set up system-managed identity using an Azure KeyVault component, the YAML would look like the following:

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

In this example, the system-managed identity looks up the service identity and communicates with the `mykeyvault` vault. Next, grant your system-managed identiy access to the desired service.

{{% /codetab %}}

 <!-- user assigned -->
{{% codetab %}}

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

Once you've set up the component YAML with the `azureClientId` property, you can grant your user-assigned identity access to your service.

{{% /codetab %}}

 <!-- k8s -->
{{% codetab %}}

For component configuration in Kubernetes or AKS, refer to the [Workload Identity guidance.](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet)

{{% /codetab %}}

{{< /tabs >}}

## Troubleshooting

If you receive an error or your managed identity doesn't work as expected, check if the following items are true:

- The system-managed identity or user-assigned identity don't have the required permissions on the target resource.
- The user-assigned identity isn't attached to the Azure service (container app or pod) from which you're loading the component. This can especially happen if:
  - You have an unscoped component (a component loaded by all container apps in an environment, or all deployments in your AKS cluster). 
  - You attached the user-assigned identity to only one container app or one deployment in AKS (using [Azure Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet)). 
  
  In this scenario, since the identity isn't attached to every other container app or deployment in AKS, the component referencing the user-assigned identity via `azureClientId` fails.

> **Best practice:** When using user-assigned identities, make sure to scope your components to specific apps!

## Next steps

{{< button text="Refer to Azure component specs >>" page="components-reference" >}}
