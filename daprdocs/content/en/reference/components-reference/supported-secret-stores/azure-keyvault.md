---
type: docs
title: "Azure Key Vault secret store"
linkTitle: "Azure Key Vault"
description: Detailed information on the Azure Key Vault secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

{{% alert title="Note" color="primary" %}}
Azure Managed Identity can be used for Azure Key Vault access on Kubernetes. Instructions [here]({{< ref azure-keyvault-managed-identity.md >}}).
{{% /alert %}}

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
  - name: vaultName
    value: [your_keyvault_name]
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
    value : "[pfx_certificate_contents]"
  - name: spnCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

### Self-Hosted

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| vaultName | Y | The name of the Azure Key Vault. If you only provide a name, it will covert to `[your_keyvault_name].vault.azure.net` in Dapr. If your URL uses another suffix, please provide the entire URI, such as `test.vault.azure.cn`. | `"mykeyvault"`, `"mykeyvault.value.azure.cn"`
| spnTenantId        | Y        | Service Principal Tenant Id | `"spnTenantId"`
| spnClientId        | Y        | Service Principal App Id | `"spnAppId"`
| spnCertificateFile | Y        | PFX certificate file path. <br></br> For Windows the `[pfx_certificate_file_fully_qualified_local_path]` value must use escaped backslashes, i.e. double backslashes. For example `"C:\\folder1\\folder2\\certfile.pfx"`. <br></br> For Linux you can use single slashes. For example `"/folder1/folder2/certfile.pfx"`.  <br></br> See [configure the component](#configure-the-component) for more details | `"C:\\folder1\\folder2\\certfile.pfx"`, `"/folder1/folder2/certfile.pfx"`


### Kubernetes

| Field          | Required | Details | Example |
|----------------|:--------:|---------|---------|
| vaultName      | Y        | The name of the Azure Key Vault | `"mykeyvault"`
| spnTenantId    | Y        | Service Principal Tenant Id | `"spnTenantId"`
| spnClientId    | Y        | Service Principal App Id | `"spnAppId"`
| spnCertificate | Y        | PKCS 12 encoded bytes of the certificate. See [configure the component](#configure-the-component) for details on encoding this in a Kubernetes secret. | `secretKeyRef: ...` <br /> See [configure the component](#configure-the-component) for more information.


## Setup Key Vault and service principal

### Prerequisites

- [Azure Subscription](https://azure.microsoft.com/en-us/free/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

### Steps

1. Login to Azure and set the default subscription

    ```bash
    # Log in Azure
    az login

    # Set your subscription to the default subscription
    az account set -s [your subscription id]
    ```

2. Create an Azure Key Vault in a region

     ```bash
     az keyvault create --location [region] --name [your_keyvault] --resource-group [your resource group]
     ```

3. Create a service principal

    Create a service principal with a new certificate and store the 1-year certificate inside your keyvault's certificate vault. You can skip this step if you want to use an existing service principal for keyvault instead of creating new one

    ```bash
    az ad sp create-for-rbac --name [your_service_principal_name] --create-cert --cert [certificate_name] --keyvault [your_keyvault] --skip-assignment --years 1

    {
       "appId": "a4f90000-0000-0000-0000-00000011d000",
       "displayName": "[your_service_principal_name]",
       "name": "http://[your_service_principal_name]",
       "password": null,
       "tenant": "34f90000-0000-0000-0000-00000011d000"
    }
    ```

    **Save both the appId and tenant from the output which will be used in the next step**

4. Get the Object Id for [your_service_principal_name]

    ```bash
    az ad sp show --id [service_principal_app_id]

    {
        ...
        "objectId": "[your_service_principal_object_id]",
        "objectType": "ServicePrincipal",
        ...
    }
    ```

5. Grant the service principal the GET permission to your Azure Key Vault

    ```bash
    az keyvault set-policy --name [your_keyvault] --object-id [your_service_principal_object_id] --secret-permissions get
    ```

    Now that your service principal has access to your keyvault you are ready to configure the secret store component to use secrets stored in your keyvault to access     other components securely.

6. Download the certificate in PFX format from your Azure Key Vault either using the Azure portal or the Azure CLI:

- **Using the Azure portal:**

  Go to your key vault on the Azure portal and navigate to the *Certificates* tab under *Settings*. Find the certificate that was created during the service principal creation, named [certificate_name] and click on it.

  Click *Download in PFX/PEM format* to download the certificate.

- **Using the Azure CLI:**

   ```bash
   az keyvault secret download --vault-name [your_keyvault] --name [certificate_name] --encoding base64 --file [certificate_name].pfx
   ```

## Configure the component

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
1. Copy downloaded PFX cert from your Azure Keyvault into your components directory or a secure location on your local disk

2. Create a file called `azurekeyvault.yaml` in the components directory

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
        value: [your_keyvault_name]
      - name: spnTenantId
        value: "[your_service_principal_tenant_id]"
      - name: spnClientId
        value: "[your_service_principal_app_id]"
      - name: spnCertificateFile
        value : "[pfx_certificate_file_fully_qualified_local_path]"
    ```

Fill in the metadata fields with your Key Vault details from the above setup process.
{{% /codetab %}}

{{% codetab %}}
In Kubernetes, you store the certificate for the service principal into the Kubernetes Secret Store and then enable Azure Key Vault secret store with this certificate in Kubernetes secretstore.

1. Create a kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_spn_secret_name] --from-file=[your_k8s_spn_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

- `[pfx_certificate_file_fully_qualified_local_path]` is the path of PFX cert file you downloaded above
- `[your_k8s_spn_secret_name]` is secret name in Kubernetes secret store
- `[your_k8s_spn_secret_key]` is secret key in Kubernetes secret store

2. Create a `azurekeyvault.yaml` component file

The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the certificate stored in Kubernetes secret store.

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
    value: [your_keyvault_name]
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
  - name: spnCertificate
    secretKeyRef:
      name: [your_k8s_spn_secret_name]
      key: [your_k8s_spn_secret_key]
auth:
    secretStore: kubernetes
```

3. Apply `azurekeyvault.yaml` component

```bash
kubectl apply -f azurekeyvault.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## References

- [Azure CLI Keyvault CLI](https://docs.microsoft.com/en-us/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [Create an Azure service principal with Azure CLI](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?view=azure-cli-latest)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
