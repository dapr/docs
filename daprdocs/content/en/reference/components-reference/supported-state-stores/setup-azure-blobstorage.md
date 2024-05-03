---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: Detailed information on the Azure Blob Store state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
---

## Component format

To setup the Azure Blob Storage state store create a component of type `state.azure.blobstorage`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.azure.blobstorage
  # Supports v1 and v2. Users should always use v2 by default. There is no
  # migration path from v1 to v2, see `versioning` below.
  version: v2
  metadata:
  - name: accountName
    value: "[your_account_name]"
  - name: accountKey
    value: "[your_account_key]"
  - name: containerName
    value: "[your_container_name]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Versioning

Dapr has 2 versions of the Azure Blob Storage state store component: `v1` and `v2`. It is recommended to use `v2` for all new applications. `v1` is considered legacy and is preserved for compatibility with existing applications only.

In `v1`, a longstanding implementation issue was identified, where the [key prefix]({{< ref howto-share-state.md >}}) was incorrectly stripped by the component, essentially behaving as if `keyPrefix` was always set to `none`.  
The updated `v2` of the component fixes the incorrect behavior and makes the state store correctly respect the `keyPrefix` property.

While `v1` and `v2` have the same metadata fields, they are otherwise incompatible, with no automatic data migration path for `v1` to `v2`.

If you are using `v1` of this component, you should continue to use `v1` until you create a new state store.

## Spec metadata fields

| Field             | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `accountName` | Y | The storage account name | `"mystorageaccount"`. |
| `accountKey` | Y (unless using Microsoft Entra ID) | Primary or secondary storage key | `"key"` |
| `containerName` | Y | The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist | `"container"` |
| `azureEnvironment` | N | Optional name for the Azure environment if using a different Azure cloud | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"` |
| `endpoint` | N | Optional custom endpoint URL. This is useful when using the [Azurite emulator](https://github.com/Azure/azurite) or when using custom domains for Azure Storage (although this is not officially supported). The endpoint must be the full base URL, including the protocol (`http://` or `https://`), the IP or FQDN, and optional port. | `"http://127.0.0.1:10000"` 
| `ContentType` | N | The blob's content type | `"text/plain"` |
| `ContentMD5` | N | The blob's MD5 hash | `"vZGKbMRDAnMs4BIwlXaRvQ=="` |
| `ContentEncoding` | N | The blob's content encoding | `"UTF-8"` |
| `ContentLanguage` | N | The blob's content language | `"en-us"` |
| `ContentDisposition` | N | The blob's content disposition. Conveys additional information about how to process the response payload | `"attachment"` |
| `CacheControl`| N | The blob's cache control | `"no-cache"` |

## Setup Azure Blob Storage

[Follow the instructions](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

If you wish to create a container for Dapr to use, you can do so beforehand. However, the Blob Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Blob Storage as a state store, you will need the following properties:

- **accountName**: The storage account name. For example: **mystorageaccount**.
- **accountKey**: Primary or secondary storage account key.
- **containerName**: The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist.

### Authenticating with Microsoft Entra ID

This component supports authentication with Microsoft Entra ID as an alternative to use account keys. Whenever possible, it is recommended that you use  Microsoft Entra ID for authentication in production systems, to take advantage of better security, fine-tuned access control, and the ability to use managed identities for apps running on Azure.

> The following scripts are optimized for a bash or zsh shell and require the following apps installed:
>
> - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
> - [jq](https://stedolan.github.io/jq/download/)
>
> You must also be authenticated with Azure in your Azure CLI.

1. To get started with using Microsoft Entra ID for authenticating the Blob Storage state store component, make sure you've created an Microsoft Entra ID application and a Service Principal as explained in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.  
  Once done, set a variable with the ID of the Service Principal that you created:

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. Set the following variables with the name of your Azure Storage Account and the name of the Resource Group where it's located:  
  
  ```sh
  STORAGE_ACCOUNT_NAME="[your_storage_account_name]"
  RG_NAME="[your_resource_group_name]"
  ```

3. Using RBAC, assign a role to our Service Principal so it can access data inside the Storage Account.  
  In this case, you are assigning the "Storage blob Data Contributor" role, which has broad access; other more restrictive roles can be used as well, depending on your application.

  ```sh
  RG_ID=$(az group show --resource-group ${RG_NAME} | jq -r ".id")
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Storage blob Data Contributor" \
    --scope "${RG_ID}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}"
  ```

When authenticating your component using Microsoft Entra ID, the `accountKey` field is not required. Instead, please specify the required credentials in the component's metadata (if any) according to the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: "[your_account_name]"
  - name: containerName
    value: "[your_container_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureClientSecret
    value : "[your_client_secret]"
```

## Apply the configuration

### In Kubernetes

To apply Azure Blob Storage state store to Kubernetes, use the `kubectl` CLI:

```sh
kubectl apply -f azureblob.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--resources-path`.

This state store creates a blob file in the container and puts raw state inside it.

For example, the following operation coming from service called `myservice`:

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

This creates the blob file in the container with `key` as filename and `value` as the contents of file.

## Concurrency

Azure Blob Storage state concurrency is achieved by using `ETag`s according to [the Azure Blob Storage documentation](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage).

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
