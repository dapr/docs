---
type: docs
title: "Azure Blob Storage binding spec"
linkTitle: "Azure Blob Storage"
description: "Detailed documentation on the Azure Blob Storage binding component"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
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
- `decodeBase64` optional configuration to decode base64 file content before saving to Blob Storage. (In case of saving a file with binary content). "true" is the only allowed positive value. Other positive variations like "True" are not acceptable.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

### Create Blob

To perform a create blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "create",
  "data": {
    "field1": "value1"
  }
}
```

#### Example:

```bash

curl -d '{ "operation": "create", "data": { "field1": "value1" }}' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

#### Response

The response body will contain the following JSON:

```json
{
   "blobURL": "https://<your account name>. blob.core.windows.net/<your container name>/<filename>"
}

```

### Get Blob

To perform a get blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "get",
  "metadata": {
    "blobName": "myblob"
  }
}
```

#### Example:

```bash
curl -d '{ "operation": "get", "metadata": { "blobName": "myblob" }}' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name> 
```

#### Response

The response body will contain the value stored in the blob object.

## Metadata information

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

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
