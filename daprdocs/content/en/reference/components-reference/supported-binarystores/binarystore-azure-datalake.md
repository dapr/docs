---
type: docs
title: "Azure Data Lake Storage Gen2"
linkTitle: "Azure Data Lake Storage Gen2"
description: "Configuration for the Azure Data Lake Storage Gen2 Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/azure-datalake/"
---

The Azure Data Lake Storage Gen2 Binary Store stores each file in the configured filesystem. The component is alpha.

## Component format

The following example authenticates with a connection string:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: data-lake-files
spec:
  type: binarystore.azure.datalake
  version: v1
  metadata:
  - name: connectionString
    value: "<AZURE_STORAGE_CONNECTION_STRING>"
  - name: fileSystemName
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
| `connectionString` | Y for connection-string authentication | Azure Storage connection string. | `"DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=<key>;EndpointSuffix=core.windows.net"` |
| `accountName` | Y for account-key and Entra ID authentication | Storage account name. | `"mystorageaccount"` |
| `accountKey` | Y for account-key authentication | Base64-encoded primary or secondary storage account key. | `"<base64-encoded-key>"` |
| `fileSystemName` | Y | Name of the Data Lake Storage Gen2 filesystem to use. | `"binary-files"` |
| `prefix` | N | Prefix prepended to each file name. If configured, it must not start with `/`. | `"uploads"` |
| `partSize` | N | Upload chunk size, specified as a byte count or byte-size string. Defaults to `16Mi`; must be between 1 byte and 4000 MiB. Larger chunks reduce request overhead but use more memory per in-flight upload. The maximum file size remains 5 TB. | `"64Mi"` |
| `retryCount` | N | Maximum number of HTTP retries for transient failures. Defaults to `3`. | `"5"` |
| `endpoint` | N | Custom endpoint URL. | `"https://mystorageaccount.dfs.core.windows.net"` |
| `disableEntityManagement` | N | Defaults to `false`. When `true`, the component does not try to create the filesystem during initialization; pre-create it and grant the identity read/write access. | `"true"` |

Size values can be provided as a string containing the number of bytes (for example, `"16777216"`) or as a size with a unit such as `"16Mi"`.

## Related links

- [Azure Data Lake Storage documentation](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction)
- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
