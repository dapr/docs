---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: "Configuration for the Azure Blob Storage Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/azure-blobstorage/"
---

The Azure Blob Storage Binary Store stores each file as a blob in the configured container. The component is alpha.

## Component format

The following example authenticates with a connection string:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azure-files
spec:
  type: binarystore.azure.blobstorage
  version: v1
  metadata:
  - name: connectionString
    value: "<AZURE_STORAGE_CONNECTION_STRING>"
  - name: containerName
    value: "binary-files"
```

{{% alert title="Warning" color="warning" %}}
The example shows a connection string as a plain value. Use a [Dapr secret store]({{% ref "operations/components/component-secrets.md" %}}) to keep credentials out of component manifests.
{{% /alert %}}

## Authentication

The component supports three authentication methods:

- **Connection string**: provide `connectionString`.
- **Account key**: provide `accountName` and `accountKey`.
- **Microsoft Entra ID**: provide `accountName` and configure credentials for the sidecar's environment. Supported credential types include workload identity, managed identity, client secret, and certificate. See [Authenticating to Azure]({{% ref "integrations/Azure/azure-authentication/authenticating-azure.md" %}}).

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `connectionString` | Y for connection-string authentication | Azure Blob Storage connection string. | `"DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=<key>;EndpointSuffix=core.windows.net"` |
| `accountName` | Y for account-key and Entra ID authentication | Storage account name. | `"mystorageaccount"` |
| `accountKey` | Y for account-key authentication | Base64-encoded primary or secondary storage account key. | `"<base64-encoded-key>"` |
| `containerName` | Y | Name of the Blob Storage container to use. | `"binary-files"` |
| `publicAccessLevel` | N | Access level for data in the container: `none`, `blob`, or `container`. Defaults to `none`. | `"none"` |
| `prefix` | N | Prefix prepended to each file name. If configured, it must not start with `/`. | `"uploads"` |
| `endpoint` | N | Custom endpoint URL, for example an Azurite emulator or a custom storage domain. | `"http://127.0.0.1:10000"` |
| `retryCount` | N | Maximum number of HTTP retries for transient failures. Defaults to `3`. | `"5"` |
| `disableEntityManagement` | N | Defaults to `false`. When `true`, the component does not try to create the container during initialization; pre-create it and grant the identity read/write access. | `"true"` |

Keep `publicAccessLevel` set to its default unless public access is specifically required.

## Related links

- [Azure Blob Storage documentation](https://learn.microsoft.com/azure/storage/blobs/)
- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
