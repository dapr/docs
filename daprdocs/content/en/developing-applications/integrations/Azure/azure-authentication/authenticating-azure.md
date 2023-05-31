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

## Credentials metadata fields

To authenticate with Azure AD, you will need to add the following credentials as values in the metadata for your [Dapr component]({{< ref "#example-usage-in-a-dapr-component" >}}). 

### Metadata options

Depending on how you've passed credentials to your Dapr services, you have multiple metadata options. 

#### Authenticating using client credentials

| Field               | Required | Details                              | Example                                      |
|---------------------|----------|--------------------------------------|----------------------------------------------|
| `azureTenantId`     | Y        | ID of the Azure AD tenant            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y        | Client ID (application ID)           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y        | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating using a PFX certificate

| Field | Required | Details | Example |
|--------|--------|--------|--------|
| `azureTenantId` | Y | ID of the Azure AD tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | Y | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureCertificate` | One of `azureCertificate` and `azureCertificateFile` | Certificate and private key (in PFX/PKCS#12 format) | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile` | One of `azureCertificate` and `azureCertificateFile` | Path to the PFX/PKCS#12 file containing the certificate and private key | `"/path/to/file.pem"` |
| `azureCertificatePassword` | N | Password for the certificate if encrypted | `"password"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating with Managed Service Identities (MSI)

| Field           | Required | Details                    | Example                                  |
|-----------------|----------|----------------------------|------------------------------------------|
| `azureClientId` | N        | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

Using MSI, you're not required to specify any value, although you may pass `azureClientId` if needed.

### Aliases

For backwards-compatibility reasons, the following values in the metadata are supported as aliases. Their use is discouraged.

| Metadata key               | Aliases (supported but deprecated) |
|----------------------------|------------------------------------|
| `azureTenantId`            | `spnTenantId`, `tenantId`          |
| `azureClientId`            | `spnClientId`, `clientId`          |
| `azureClientSecret`        | `spnClientSecret`, `clientSecret`  |
| `azureCertificate`         | `spnCertificate`                   |
| `azureCertificateFile`     | `spnCertificateFile`               |
| `azureCertificatePassword` | `spnCertificatePassword`           |


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
