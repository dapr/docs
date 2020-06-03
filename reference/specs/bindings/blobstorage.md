# Azure Blob Storage Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
```

- `storageAccount` is the Blob Storage account name.
- `storageAccessKey` is the Blob Storage access key.
- `container` is the name of the Blob Storage container to write to.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Output Binding Supported Operations

* create

## Additional information

By default the Azure Blob Storage output binding will auto generate a UUID as blob filename and not assign any system or custom metadata to it. It is configurable in the Metadata property of the message (all optional).

Applications publishing to an Azure Blob Storage output binding should send a message with the following contract:
```json
{
    "data": "file content",
    "metadata": {
        "blobName"           : "filename.txt",
        "ContentType"        : "text/plain",
        "ContentMD5"         : "vZGKbMRDAnMs4BIwlXaRvQ==",
        "ContentEncoding"    : "UTF-8",
        "ContentLanguage"    : "en-us",
        "ContentDisposition" : "attachment",
        "CacheControl"       : "no-cache",
        "Custom"             : "hello-world",
    },
    "operation": "create"
}
```
