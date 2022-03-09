---
type: docs
title: "Azure Key Vault secret store"
linkTitle: "Azure Key Vault"
description: Detailed information on the Azure Key Vault secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

## Component format

To setup Azure Key Vault secret store create a component of type `secretstores.azure.keyvault`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

See also [configure the component](#configure-the-component) guide in this page.

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
  - name: vaultName # Required
    value: [your_keyvault_name]
  - name: azureEnvironment # Optional, defaults to AZUREPUBLICCLOUD
    value: "AZUREPUBLICCLOUD"
  # See authentication section below for all options
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
    value : "[pfx_certificate_contents]"
  - name: spnCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```

## Authenticating with Azure AD

The Azure Key Vault secret store component supports authentication with Azure AD only. Before you enable this component, make sure you've read the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document and created an Azure AD application (also called Service Principal). Alternatively, make sure you have created a managed identity for your application platform.

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `vaultName` | Y | The name of the Azure Key Vault | `"mykeyvault"` |
| `azureEnvironment` | N | Optional name for the Azure environment if using a different Azure cloud | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |

Additionally, you must provide the authentication fields as explained in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

## Create the Azure Key Vault and authorize the Service Principal

### Prerequisites

- [Azure Subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- The scripts below are optimized for a bash or zsh shell

Make sure you have followed the steps in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document to create  an Azure AD application (also called Service Principal). You will need the following values:

- `SERVICE_PRINCIPAL_ID`: the ID of the Service Principal that you created for a given application

### Steps

1. Set a variable with the Service Principal that you created:

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. Set a variable with the location where to create all resources:

  ```sh
  LOCATION="[your_location]"
  ```

  (You can get the full list of options with: `az account list-locations --output tsv`)

3. Create a Resource Group, giving it any name you'd like:

  ```sh
  RG_NAME="[resource_group_name]"
  RG_ID=$(az group create \
    --name "${RG_NAME}" \
    --location "${LOCATION}" \
    | jq -r .id)
  ```

4. Create an Azure Key Vault (that uses Azure RBAC for authorization):

  ```sh
  KEYVAULT_NAME="[key_vault_name]"
  az keyvault create \
    --name "${KEYVAULT_NAME}" \
    --enable-rbac-authorization true \
    --resource-group "${RG_NAME}" \
    --location "${LOCATION}"
  ```

5. Using RBAC, assign a role to the Azure AD application so it can access the Key Vault.  
  In this case, assign the "Key Vault Crypto Officer" role, which has broad access; other more restrictive roles can be used as well, depending on your application.

  ```sh
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Key Vault Crypto Officer" \
    --scope "${RG_ID}/providers/Microsoft.KeyVault/vaults/${KEYVAULT_NAME}"
  ```

## Configure the component

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory, filling in with the Azure AD application that you created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document:

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

If you want to use a **certificate** saved on the local disk, instead, use this template, filling in with details of the Azure AD application that you created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document:

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
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file. You will need the details of the Azure AD application that was created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

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

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path of PFX file you obtained earlier
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

To use **Azure managed identity**:

1. Ensure your AKS cluster has managed identity enabled and follow the [guide for using managed identities](https://docs.microsoft.com/azure/aks/use-managed-identity).
2. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to a particular KeyVault name. The managed identity you will use in a later step must be given read access to this particular KeyVault instance.

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
    ```

3. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```
4. Create and use a managed identity / pod identity by following [this guide](https://docs.microsoft.com/azure/aks/use-azure-ad-pod-identity#create-a-pod-identity). After creating an AKS pod identity, [give this identity read permissions on your desired KeyVault instance](https://docs.microsoft.com/azure/key-vault/general/assign-access-policy?tabs=azure-cli#assign-the-access-policy), and finally in your application deployment inject the pod identity via a label annotation:

  ```yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: mydaprdemoapp
    labels:
      aadpodidbinding: $POD_IDENTITY_NAME
  ```

{{% /codetab %}}

{{< /tabs >}}

## References

- [Authenticating to Azure]({{< ref authenticating-azure.md >}})
- [Azure CLI: keyvault commands](https://docs.microsoft.com/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
