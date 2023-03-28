---
type: docs
title: "Azure Key Vault secret store"
linkTitle: "Azure Key Vault"
description: Detailed information on the Azure Key Vault secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

## Component format

To setup Azure Key Vault secret store, create a component of type `secretstores.azure.keyvault`. 
- See [the secret store components guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secret store configuration. 
- See [the guide on referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.
- See [the Configure the component section](#configure-the-component) below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName # Required
    value: [your_keyvault_name]
  - name: azureEnvironment # Optional, defaults to AZUREPUBLICCLOUD
    value: "AZUREPUBLICCLOUD"
  # See authentication section below for all options
  - name: azureTenantId
    value: "[your_service_principal_tenant_id]"
  - name: azureClientId
    value: "[your_service_principal_app_id]"
  - name: azureCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```

## Authenticating with Azure AD

The Azure Key Vault secret store component supports authentication with Azure AD only. Before you enable this component:
1. Read the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.
1. Create an Azure AD application (also called Service Principal). 
1. Alternatively, create a managed identity for your application platform.

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `vaultName` | Y | The name of the Azure Key Vault | `"mykeyvault"` |
| `azureEnvironment` | N | Optional name for the Azure environment if using a different Azure cloud | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |
| Auth metadata | | See [Authenticating to Azure]({{< ref authenticating-azure.md >}}) for more information

Additionally, you must provide the authentication fields as explained in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

## Example

### Prerequisites

- Azure Subscription
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- You are using bash or zsh shell
- You've created an Azure AD application (Service Principal) per the instructions in [Authenticating to Azure]({{< ref authenticating-azure.md >}}). You will need the following values:

   | Value | Description |
   | ----- | ----------- |
   | `SERVICE_PRINCIPAL_ID` | The ID of the Service Principal that you created for a given application |

### Create an Azure Key Vault and authorize a Service Principal

1. Set a variable with the Service Principal that you created:

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

1. Set a variable with the location in which to create all resources:

  ```sh
  LOCATION="[your_location]"
  ```

  (You can get the full list of options with: `az account list-locations --output tsv`)

1. Create a Resource Group, giving it any name you'd like:

  ```sh
  RG_NAME="[resource_group_name]"
  RG_ID=$(az group create \
    --name "${RG_NAME}" \
    --location "${LOCATION}" \
    | jq -r .id)
  ```

1. Create an Azure Key Vault that uses Azure RBAC for authorization:

  ```sh
  KEYVAULT_NAME="[key_vault_name]"
  az keyvault create \
    --name "${KEYVAULT_NAME}" \
    --enable-rbac-authorization true \
    --resource-group "${RG_NAME}" \
    --location "${LOCATION}"
  ```

1. Using RBAC, assign a role to the Azure AD application so it can access the Key Vault.  
  In this case, assign the "Key Vault Secrets User" role, which has the "Get secrets" permission over Azure Key Vault.

  ```sh
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Key Vault Secrets User" \
    --scope "${RG_ID}/providers/Microsoft.KeyVault/vaults/${KEYVAULT_NAME}"
  ```

Other less restrictive roles, like "Key Vault Secrets Officer" and "Key Vault Administrator", can be used, depending on your application. [See Microsoft Docs for more information about Azure built-in roles for Key Vault](https://docs.microsoft.com/azure/key-vault/general/rbac-guide?tabs=azure-cli#azure-built-in-roles-for-key-vault-data-plane-operations).

### Configure the component

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

#### Using a client secret

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory. Use the following template, filling in [the Azure AD application you created]({{< ref authenticating-azure.md >}}):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
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

#### Using a certificate 

If you want to use a **certificate** saved on the local disk instead, use the following template. Fill in the details of [the Azure AD application you created]({{< ref authenticating-azure.md >}}):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
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
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file. Before you start, you need the details of [the Azure AD application you created]({{< ref authenticating-azure.md >}}).

#### Using a client secret

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

#### Using a certificate

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path of PFX file you obtained earlier
    - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
    - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

1. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the certificate stored in the Kubernetes secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
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

#### Using Azure managed identity

1. Ensure your AKS cluster has managed identity enabled and follow the [guide for using managed identities](https://docs.microsoft.com/azure/aks/use-managed-identity).
1. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to a particular KeyVault name. The managed identity you will use in a later step must be given read access to this particular KeyVault instance.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
    ```

1. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```
1. Create and assign a managed identity at the pod-level via either:
   - [Azure AD workload identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) (preferred method)
   - [Azure AD pod identity](https://docs.microsoft.com/azure/aks/use-azure-ad-pod-identity#create-a-pod-identity)  


   **Important**: While both Azure AD pod identity and workload identity are in preview, currently Azure AD Workload Identity is planned for general availability (stable state).

1. After creating a workload identity, give it `read` permissions:
   - [On your desired KeyVault instance](https://docs.microsoft.com/azure/key-vault/general/assign-access-policy?tabs=azure-cli#assign-the-access-policy)
   - In your application deployment. Inject the pod identity both:
     - Via a label annotation
     - By specifying the Kubernetes service account associated with the desired workload identity 

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: mydaprdemoapp
     labels:
       aadpodidbinding: $POD_IDENTITY_NAME
   ```

#### Using Azure managed identity directly vs. via Azure AD workload identity

When using **managed identity directly**, you can have multiple identities associated with an app, requiring `azureClientId` to specify which identity should be used. 

However, when using **managed identity via Azure AD workload identity**, `azureClientId` is not necessary and has no effect. The Azure identity to be used is inferred from the service account tied to an Azure identity via the Azure federated identity.

{{% /codetab %}}

{{< /tabs >}}

## References

- [Authenticating to Azure]({{< ref authenticating-azure.md >}})
- [Azure CLI: keyvault commands](https://docs.microsoft.com/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
