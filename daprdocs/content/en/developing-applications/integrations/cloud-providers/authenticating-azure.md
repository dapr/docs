---
type: docs
title: "Authenticating to Azure"
linkTitle: "Authenticating to Azure"
description: "How to authenticate Azure components using Azure AD and/or Managed Identities"
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/"
  - "/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/"
---

## Common Azure authentication layer

Certain Azure components for Dapr offer support for the *common Azure authentication layer*, which enables applications to access data stored in Azure resources by authenticating with Azure AD. Thanks to this, administrators can leverage all the benefits of fine-tuned permissions with RBAC (Role-Based Access Control), and applications running on certain Azure services such as Azure VMs, Azure Kubernetes Service, or many Azure platform services can leverage [Managed Service Identities (MSI)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview).

Some Azure components offer alternative authentication methods, such as systems based on "master keys" or "shared keys". Whenever possible, it is recommended that you authenticate your Dapr components using Azure AD for increased security and ease of management, as well as for the ability to leverage MSI if your app is running on supported Azure services.

> Currently, only a subset of Azure components for Dapr offer support for this authentication method. Over time, support will be expanded to all other Azure components for Dapr. You can track the progress of the work, component-by-component, on [this issue](https://github.com/dapr/components-contrib/issues/1103).

### About authentication with Azure AD

Azure AD is Azure's identity and access management (IAM) solution, which is used to authenticate and authorize users and services.

Azure AD is built on top of open standards such OAuth 2.0, which allows services (applications) to obtain access tokens to make requests to Azure services, including Azure Storage, Azure Key Vault, Cosmos DB, etc. In the Azure terminology, an application is also called a "Service Principal".

Many of the services listed above also support authentication using other systems, such as "master keys" or "shared keys". Although those are always valid methods to authenticate your application (and Dapr continues to support them, as explained in each component's reference page), using Azure AD when possible offers various benefits, including:

- The ability to leverage Managed Service Identities, which allow your application to authenticate with Azure AD, and obtain an access token to make requests to Azure services, without the need to use any credential. When your application is running on a supported Azure service (including, but not limited to, Azure VMs, Azure Kubernetes Service, Azure Web Apps, etc), an identity for your application can be assigned at the infrastructure level.  
  This way, your code does not have to deal with credentials of any kind, removing the challenge of safely managing credentials, allowing greater separation of concerns between development and operations teams and reducing the number of people with access to credentials, and lastly simplifying operational aspects–especially when multiple environments are used.
- Using RBAC (Role-Based Access Control) with supported services (such as Azure Storage and Cosmos DB), permissions given to an application can be fine-tuned, for example allowing restricting access to a subset of data or making it read-only.
- Better auditing for access.
- Ability to authenticate using certificates (optional).

## Credentials metadata fields

To authenticate with Azure AD, you will need to add the following credentials as values in the metadata for your Dapr component (read the next section for how to create them). There are multiple options depending on the way you have chosen to pass the credentials to your Dapr service.

**Authenticating using client credentials:**

| Field               | Required | Details                              | Example                                      |
|---------------------|----------|--------------------------------------|----------------------------------------------|
| `azureTenantId`     | Y        | ID of the Azure AD tenant            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y        | Client ID (application ID)           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y        | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

**Authenticating using a PFX certificate:**

| Field | Required | Details | Example |
|--------|--------|--------|--------|
| `azureTenantId` | Y | ID of the Azure AD tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | Y | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureCertificate` | One of `azureCertificate` and `azureCertificateFile` | Certificate and private key (in PFX/PKCS#12 format) | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile` | One of `azureCertificate` and `azureCertificateFile` | Path to the PFX/PKCS#12 file containing the certificate and private key | `"/path/to/file.pem"` |
| `azureCertificatePassword` | N | Password for the certificate if encrypted | `"password"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

**Authenticating with Managed Service Identities (MSI):**

| Field           | Required | Details                    | Example                                  |
|-----------------|----------|----------------------------|------------------------------------------|
| `azureClientId` | N        | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

Using MSI you're not required to specify any value, although you may optionally pass `azureClientId` if needed.

### Aliases

For backwards-compatibility reasons, the following values in the metadata are supported as aliases, although their use is discouraged.

| Metadata key               | Aliases (supported but deprecated) |
|----------------------------|------------------------------------|
| `azureTenantId`            | `spnTenantId`, `tenantId`          |
| `azureClientId`            | `spnClientId`, `clientId`          |
| `azureClientSecret`        | `spnClientSecret`, `clientSecret`  |
| `azureCertificate`         | `spnCertificate`                   |
| `azureCertificateFile`     | `spnCertificateFile`               |
| `azureCertificatePassword` | `spnCertificatePassword`           |

## Generating a new Azure AD application and Service Principal

To start, create a new Azure AD application, which will also be used as Service Principal.

Prerequisites:

- [Azure Subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- OpenSSL (included by default on all Linux and macOS systems, as well as on WSL)
- The scripts below are optimized for a bash or zsh shell

> If you haven't already, start by logging in to Azure using the Azure CLI:
>
> ```sh
> # Log in Azure
> az login
> # Set your default subscription
> az account set -s [your subscription id]
> ```

### Creating an Azure AD application

First, create the Azure AD application with:

```sh
# Friendly name for the application / Service Principal
APP_NAME="dapr-application"

# Create the app
APP_ID=$(az ad app create \
  --display-name "${APP_NAME}" \
  --available-to-other-tenants false \
  --oauth2-allow-implicit-flow false \
  | jq -r .appId)
```

{{< tabs "Client secret" "Certificate">}}

{{% codetab %}}

To create a **client secret**, then run this command. This will generate a random password based on the base64 charset and 40-characters long. Additionally, it will make the password valid for 2 years, before it will need to be rotated:

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --years 2 \
  --password $(openssl rand -base64 30)
```

The ouput of the command above will be similar to this:

```json
{
  "appId": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "name": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "password": "Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E",
  "tenant": "cd4b2887-304c-47e1-b4d5-65447fdd542b"
}
```

Take note of the values above, which you'll need to use in your Dapr components' metadata, to allow Dapr to authenticate with Azure:

- `appId` is the value for `azureClientId`
- `password` is the value for `azureClientSecret` (this was randomly-generated)
- `tenant` is the value for `azureTenantId`

{{% /codetab %}}

{{% codetab %}}
If you'd rather use a **PFX (PKCS#12) certificate**, run this command which will create a self-signed certificate:

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --create-cert
```

> Note: self-signed certificates are recommended for development only. For production, you should use certificates signed by a CA and imported with the `--cert` flag.

The output of the command above should look like:

```json
{
  "appId": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "fileWithCertAndPrivateKey": "/Users/alessandro/tmpgtdgibk4.pem",
  "name": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "password": null,
  "tenant": "cd4b2887-304c-47e1-b4d5-65447fdd542b"
}
```

Take note of the values above, which you'll need to use in your Dapr components' metadata:

- `appId` is the value for `azureClientId`
- `tenant` is the value for `azureTenantId`
- The self-signed PFX certificate and private key are written in the file at the path specified in `fileWithCertAndPrivateKey`.  
  Use the contents of that file as `azureCertificate` (or write it to a file on the server and use `azureCertificateFile`)

> While the generated file has the `.pem` extension, it contains a certificate and private key encoded as PFX (PKCS#12).

{{% /codetab %}}

{{< /tabs >}}

### Creating a Service Principal

Once you have created an Azure AD application, create a Service Principal for that application, which will allow us to grant it access to Azure resources. Run:

```sh
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "${APP_ID}" \
  | jq -r .objectId)
echo "Service Principal ID: ${SERVICE_PRINCIPAL_ID}"
```

The output will be similar to:

```text
Service Principal ID: 1d0ccf05-5427-4b5e-8eb4-005ac5f9f163
```

Note that the value above is the ID of the **Service Principal** which is different from the ID of application in Azure AD (client ID)! The former is defined within an Azure tenant and is used to grant access to Azure resources to an application. The client ID instead is used by your application to authenticate. To sum things up:

- You'll use the client ID in Dapr manifests to configure authentication with Azure services
- You'll use the Service Principal ID to grant permissions to an application to access Azure resources

Keep in mind that the Service Principal that was just created does not have access to any Azure resource by default. Access will need to be granted to each resource as needed, as documented in the docs for the components.

> Note: this step is different from the [official documentation](https://docs.microsoft.com/cli/azure/create-an-azure-service-principal-azure-cli) as the short-hand commands included there create a Service Principal that has broad read-write access to all Azure resources in your subscription.  
> Not only doing that would grant our Service Principal more access than you are likely going to desire, but this also applies only to the Azure management plane (Azure Resource Manager, or ARM), which is irrelevant for Dapr anyways (all Azure components are designed to interact with the data plane of various services, and not ARM).

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

2. Create an `azurekeyvault.yaml` component file.

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

3. Apply the `azurekeyvault.yaml` component:

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

2. Create an `azurekeyvault.yaml` component file.

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

3. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

{{% /codetab %}}

{{< /tabs >}}

## Using Managed Service Identities

Using MSI, authentication happens automatically by virtue of your application running on top of an Azure service that has an assigned identity. For example, when you create an Azure VM or an Azure Kubernetes Service cluster and choose to enable a managed identity for that, an Azure AD application is created for you and automatically assigned to the service. Your Dapr services can then leverage that identity to authenticate with Azure AD, transparently and without you having to specify any credential.

To get started with managed identities, first you need to assign an identity to a new or existing Azure resource. The instructions depend on the service use. Below are links to the official documentation:

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) (including Azure Web Apps and Azure Functions)
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

Other Azure application services may offer support for MSI; please check the documentation for those services to understand how to configure them.

After assigning a managed identity to your Azure resource, you will have credentials such as:

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

From the list above, take note of **`principalId`** which is the ID of the Service Principal that was created. You'll need that to grant access to Azure resources to your Service Principal.

## Support for other Azure environments

By default, Dapr components are configured to interact with Azure resources in the "public cloud". If your application is deployed to another cloud, such as Azure China, Azure Government, or Azure Germany, you can enable that for supported components by setting the `azureEnvironment` metadata property to one of the supported values:

- Azure public cloud (default): `"AZUREPUBLICCLOUD"`
- Azure China: `"AZURECHINACLOUD"`
- Azure Government: `"AZUREUSGOVERNMENTCLOUD"`
- Azure Germany: `"AZUREGERMANCLOUD"`

## References

- [Azure AD app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure Managed Service Identity (MSI) overview](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
