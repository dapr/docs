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

Most Azure components for Dapr support authenticating with Azure AD (Azure Active Directory). Thanks to this:

- Administrators can leverage all the benefits of fine-tuned permissions with Azure Role-Based Access Control (RBAC).
- Applications running on Azure services such as Azure Container Apps, Azure Kubernetes Service, Azure VMs, or any other Azure platform services can leverage [Managed Identities (MI)](https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview) and [Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview). These offer the ability to authenticate your applications without having to manage sensitive credentials.

## About authentication with Azure AD

Azure AD is Azure's identity and access management (IAM) solution, which is used to authenticate and authorize users and services.

Azure AD is built on top of open standards such OAuth 2.0, which allows services (applications) to obtain access tokens to make requests to Azure services, including Azure Storage, Azure Service Bus, Azure Key Vault, Azure Cosmos DB, Azure Database for Postgres, Azure SQL, etc. 

> In Azure terminology, an application is also called a "Service Principal".

Some Azure components offer alternative authentication methods, such as systems based on "shared keys" or "access tokens". Although these are valid and supported by Dapr, you should authenticate your Dapr components using Azure AD whenever possible to take advantage of many benefits, including:

- [Managed Identities and Workload Identity](#managed-identities-and-workload-identity)
- [Role-Based Access Control](#role-based-access-control)
- [Auditing](#auditing)
- [(Optional) Authentication using certificates](#optional-authentication-using-certificates)

### Managed Identities and Workload Identity

With Managed Identities (MI), your application can authenticate with Azure AD and obtain an access token to make requests to Azure services. When your application is running on a supported Azure service (such as Azure VMs, Azure Container Apps, Azure Web Apps, etc), an identity for your application can be assigned at the infrastructure level.

Once using MI, your code doesn't have to deal with credentials, which:

- Removes the challenge of managing credentials safely
- Allows greater separation of concerns between development and operations teams
- Reduces the number of people with access to credentials
- Simplifies operational aspects–especially when multiple environments are used

Applications running on Azure Kubernetes Service can similarly leverage [Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) to automatically provide an identity to individual pods.

### Role-Based Access Control

When using Azure Role-Based Access Control (RBAC) with supported services, permissions given to an application can be fine-tuned. For example, you can restrict access to a subset of data or make the access read-only.

### Auditing

Using Azure AD provides an improved auditing experience for access. Tenant administrators can consult audit logs to track authentication requests.

### (Optional) Authentication using certificates

While Azure AD allows you to use MI, you still have the option to authenticate using certificates.

## Support for other Azure environments

By default, Dapr components are configured to interact with Azure resources in the "public cloud". If your application is deployed to another cloud, such as Azure China or Azure Government ("sovereign clouds"), you can enable that for supported components by setting the `azureEnvironment` metadata property to one of the supported values:

- Azure public cloud (default): `"AzurePublicCloud"`
- Azure China: `"AzureChinaCloud"`
- Azure Government: `"AzureUSGovernmentCloud"`

> Support for sovereign clouds is experimental.

## Credentials metadata fields

To authenticate with Azure AD, you will need to add the following credentials as values in the metadata for your [Dapr component](#example-usage-in-a-dapr-component).

### Metadata options

Depending on how you've passed credentials to your Dapr services, you have multiple metadata options.

- [Using client credentials](#authenticating-using-client-credentials)
- [Using a certificate](#authenticating-using-a-certificate)
- [Using Managed Identities (MI)](#authenticating-with-managed-identities-mi)
- [Using Workload Identity on AKS](#authenticating-with-workload-identity-on-aks)
- [Using Azure CLI credentials (development-only)](#authenticating-using-azure-cli-credentials-development-only)

#### Authenticating using client credentials

| Field               | Required | Details                              | Example                                      |
|---------------------|----------|--------------------------------------|----------------------------------------------|
| `azureTenantId`     | Y        | ID of the Azure AD tenant            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y        | Client ID (application ID)           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y        | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating using a certificate

| Field | Required | Details | Example |
|--------|--------|--------|--------|
| `azureTenantId` | Y | ID of the Azure AD tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | Y | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureCertificate` | One of `azureCertificate` and `azureCertificateFile` | Certificate and private key (in PFX/PKCS#12 format) | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile` | One of `azureCertificate` and `azureCertificateFile` | Path to the PFX/PKCS#12 file containing the certificate and private key | `"/path/to/file.pem"` |
| `azureCertificatePassword` | N | Password for the certificate if encrypted | `"password"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating with Managed Identities (MI)

| Field           | Required | Details                    | Example                                  |
|-----------------|----------|----------------------------|------------------------------------------|
| `azureClientId` | N        | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

Using Managed Identities, the `azureClientId` field is generally recommended. The field is optional when using a system-assigned identity, but may be required when using user-assigned identities.

#### Authenticating with Workload Identity on AKS

When running on Azure Kubernetes Service (AKS), you can authenticate components using Workload Identity. Refer to the Azure AKS documentation on [enabling Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) for your Kubernetes resources.

#### Authenticating using Azure CLI credentials (development-only)

> **Important:** This authentication method is recommended for **development only**.

This authentication method can be useful while developing on a local machine. You will need:

- The [Azure CLI installed](https://learn.microsoft.com/cli/azure/install-azure-cli)
- Have successfully authenticated using the `az login` command

When Dapr is running on a host where there are credentials available for the Azure CLI, components can use those to authenticate automatically if no other authentication method is configuration.

Using this authentication method does not require setting any metadata option.

### Example usage in a Dapr component

In this example, you will set up an Azure Key Vault secret store component that uses Azure AD to authenticate.

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory, filling in with the details from the above setup process:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: "[your_keyvault_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureClientSecret
    value : "[your_client_secret]"
```

If you want to use a **certificate** saved on the local disk, instead, use:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: "[your_keyvault_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```
{{% /codetab %}}

{{% codetab %}}
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file.

To use a **client secret**:

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

    - `[your_client_secret]` is the application's client secret as generated above
    - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
    - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

1. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the client secret stored in the Kubernetes secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
      - name: azureTenantId
        value: "[your_tenant_id]"
      - name: azureClientId
        value: "[your_client_id]"
      - name: azureClientSecret
        secretKeyRef:
          name: "[your_k8s_secret_name]"
          key: "[your_k8s_secret_key]"
    auth:
      secretStore: kubernetes
    ```

1. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

To use a **certificate**:

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path to the PFX file you obtained earlier
    - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
    - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

1. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the certificate stored in the Kubernetes secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
      - name: azureTenantId
        value: "[your_tenant_id]"
      - name: azureClientId
        value: "[your_client_id]"
      - name: azureCertificate
        secretKeyRef:
          name: "[your_k8s_secret_name]"
          key: "[your_k8s_secret_key]"
    auth:
      secretStore: kubernetes
    ```

1. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

{{< button text="Generate a new Azure AD application and Service Principal >>" page="howto-aad.md" >}}

## References

- [Azure AD app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure Managed Service Identity (MSI) overview](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
