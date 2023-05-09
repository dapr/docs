---
type: docs
title: "Authenticating to Azure"
linkTitle: "Overview"
description: "How to authenticate Azure components using Azure AD and/or Managed Identities"
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/"
  - "/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/"
weight: 10000
---

Certain Azure components for Dapr offer support for the *common Azure authentication layer*, which enables applications to access data stored in Azure resources by authenticating with Azure Active Directory (Azure AD). Thanks to this:
- Administrators can leverage all the benefits of fine-tuned permissions with Role-Based Access Control (RBAC).
- Applications running on Azure services such as Azure Container Apps, Azure Kubernetes Service, Azure VMs, or any other Azure platform services can leverage [Managed Service Identities (MSI)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview).


## About authentication with Azure AD

Azure AD is Azure's identity and access management (IAM) solution, which is used to authenticate and authorize users and services.

Azure AD is built on top of open standards such OAuth 2.0, which allows services (applications) to obtain access tokens to make requests to Azure services, including Azure Storage, Azure Key Vault, Cosmos DB, etc. 

> In Azure terminology, an application is also called a "Service Principal".

Some Azure components offer alternative authentication methods, such as systems based on "master keys" or "shared keys". Although both master keys and shared keys are valid and supported by Dapr, you should authenticate your Dapr components using Azure AD. Using Azure AD offers benefits like the following.

### Managed Service Identities

With Managed Service Identities (MSI), your application can authenticate with Azure AD and obtain an access token to make requests to Azure services. When your application is running on a supported Azure service, an identity for your application can be assigned at the infrastructure level.  

Once using MSI, your code doesn't have to deal with credentials, which:
- Removes the challenge of managing credentials safely
- Allows greater separation of concerns between development and operations teams
- Reduces the number of people with access to credentials
- Simplifies operational aspects–especially when multiple environments are used

### Role-based Access Control

When using Role-Based Access Control (RBAC) with supported services, permissions given to an application can be fine-tuned. For example, you can restrict access to a subset of data or make it read-only.

### Auditing

Using Azure AD provides an improved auditing experience for access.

### (Optional) Authenticate using certificates

While Azure AD allows you to use MSI or RBAC, you still have the option to authenticate using certificates.




## Support for other Azure environments

By default, Dapr components are configured to interact with Azure resources in the "public cloud". If your application is deployed to another cloud, such as Azure China, Azure Government, or Azure Germany, you can enable that for supported components by setting the `azureEnvironment` metadata property to one of the supported values:

- Azure public cloud (default): `"AZUREPUBLICCLOUD"`
- Azure China: `"AZURECHINACLOUD"`
- Azure Government: `"AZUREUSGOVERNMENTCLOUD"`
- Azure Germany: `"AZUREGERMANCLOUD"`

## Next steps

{{< button text="Learn about the credentials metadata fields >>" page="aad-metadata.md" >}}


## References

- [Azure AD app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure Managed Service Identity (MSI) overview](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
