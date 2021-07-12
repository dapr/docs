---
type: docs
title: "Azure Blob Storage binding spec"
linkTitle: "Azure Blob Storage"
description: "Detailed documentation on the Azure Blob Storage binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/blobstorage/"
---

## Component format

To setup Azure Blob Storage binding create a component of type `bindings.azure.blobstorage`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
  - name: decodeBase64
    value: <bool>
  - name: getBlobRetryCount
    value: <integer>
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| storageAccount | Y | Output | The Blob Storage account name | `myexmapleaccount` |
| storageAccessKey | Y | Output | The Blob Storage access key | `access-key` |
| container | Y | Output | The name of the Blob Storage container to write to | `myexamplecontainer` |
| decodeBase64 | N | Output | Configuration to decode base64 file content before saving to Blob Storage. (In case of saving a file with binary content). `true` is the only allowed positive value. Other positive variations like `"True", "1"` are not acceptable. Defaults to `false` | `true`, `false` |
| getBlobRetryCount | N | Output | Specifies the maximum number of HTTP GET requests that will be made while reading from a RetryReader Defaults to `10` | `1`, `2`


## Binding support

This component supports **output binding** with the following operations:

- `create` : [Create blob](#create-blob)
- `get` : [Get blob](#get-blob)
- `delete` : [Delete blob](#delete-blob)
- `list`: [List blobs](#list-blobs)

### Create blob

To perform a create blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

> Note: by default, a random UUID is generated. See below for Metadata support to set the name

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### Examples


##### Save text to a random generated UUID blob

{{< tabs Windows Linux >}}
  {{% codetab %}}
  On Windows, utilize cmd prompt (PowerShell has different escaping mechanism)
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### Save text to a specific blob

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"blobName\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "blobName": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}


##### Save a file to a blob

To upload a file, encode it as Base64 and let the Binding know to deserialize it:

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
  - name: decodeBase64
    value: true
```

Then you can upload it as you would normally:

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"blobName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "blobName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body will contain the following JSON:

```json
{
   "blobURL": "https://<your account name>. blob.core.windows.net/<your container name>/<filename>"
}

```

### Get blob

To perform a get blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "get",
  "metadata": {
    "blobName": "myblob",
    "includeMetadata": "true"
  }
}
```

The metadata parameters are:

- `blobName` - the name of the blob
- `includeMetadata`- (optional) defines if the user defined metadata should be returned or not, defaults to: false

#### Example

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body contains the value stored in the blob object. If enabled, the user defined metadata will be returned as HTTP headers in the form:

`Metadata.key1: value1`
`Metadata.key2: value2`

### Delete blob

To perform a delete blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "blobName": "myblob"
  }
}
```

The metadata parameters are:

- `blobName` - the name of the blob
- `deleteSnapshots` - (optional) required if the blob has associated snapshots. Specify one of the following two options:
  - include: Delete the base blob and all of its snapshots
  - only: Delete only the blob's snapshots and not the blob itself

#### Examples

##### Delete blob

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### Delete blob snapshots only

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"deleteSnapshots\": \"only\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "deleteSnapshots": "only" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### Delete blob including snapshots

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"deleteSnapshots\": \"include\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "deleteSnapshots": "include" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

An HTTP 204 (No Content) and empty body will be retuned if successful.

### List blobs

To perform a list blobs operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "list",
  "data": {
    "maxResults": 10,
    "prefix": "file",
    "marker": "2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC01NS03NzgtMjEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--",
    "include": {
      "snapshots": false,
      "metadata": true,
      "uncommittedBlobs": false,
      "copy": false,
      "deleted": false
    }
  }
}
```

The data parameters are:

- `maxResults` - (optional) specifies the maximum number of blobs to return, including all BlobPrefix elements. If the request does not specify maxresults the server will return up to 5,000 items.
- `prefix` - (optional) filters the results to return only blobs whose names begin with the specified prefix.
- `marker` - (optional) a string value that identifies the portion of the list to be returned with the next list operation. The operation returns a marker value within the response body if the list returned was not complete. The marker value may then be used in a subsequent call to request the next set of list items.
- `include` - (optional) Specifies one or more datasets to include in the response:
  - snapshots: Specifies that snapshots should be included in the enumeration. Snapshots are listed from oldest to newest in the response. Defaults to: false
  - metadata: Specifies that blob metadata be returned in the response. Defaults to: false
  - uncommittedBlobs: Specifies that blobs for which blocks have been uploaded, but which have not been committed using Put Block List, be included in the response. Defaults to: false
  - copy: Version 2012-02-12 and newer. Specifies that metadata related to any current or previous Copy Blob operation should be included in the response. Defaults to: false
  - deleted: Version 2017-07-29 and newer. Specifies that soft deleted blobs should be included in the response. Defaults to: false

#### Response

The response body contains the list of found blocks as also the following HTTP headers:

`Metadata.marker: 2!108!MDAwMDM1IWZpbGUtMDgtMDctMjAyMS0wOS0zOC0zNC04NjctMTEudHh0ITAwMDAyOCE5OTk5LTEyLTMxVDIzOjU5OjU5Ljk5OTk5OTlaIQ--`
`Metadata.number: 10`

- `marker` - the next marker which can be used in a subsequent call to request the next set of list items. See the marker description on the data property of the binding input.
- `number` - the number of found blobs

The list of blobs will be returned as JSON array in the following form:

```json
[
  {
    "XMLName": {
      "Space": "",
      "Local": "Blob"
    },
    "Name": "file-08-07-2021-09-38-13-776-1.txt",
    "Deleted": false,
    "Snapshot": "",
    "Properties": {
      "XMLName": {
        "Space": "",
        "Local": "Properties"
      },
      "CreationTime": "2021-07-08T07:38:16Z",
      "LastModified": "2021-07-08T07:38:16Z",
      "Etag": "0x8D941E3593C6573",
      "ContentLength": 1,
      "ContentType": "application/octet-stream",
      "ContentEncoding": "",
      "ContentLanguage": "",
      "ContentMD5": "xMpCOKC5I4INzFCab3WEmw==",
      "ContentDisposition": "",
      "CacheControl": "",
      "BlobSequenceNumber": null,
      "BlobType": "BlockBlob",
      "LeaseStatus": "unlocked",
      "LeaseState": "available",
      "LeaseDuration": "",
      "CopyID": null,
      "CopyStatus": "",
      "CopySource": null,
      "CopyProgress": null,
      "CopyCompletionTime": null,
      "CopyStatusDescription": null,
      "ServerEncrypted": true,
      "IncrementalCopy": null,
      "DestinationSnapshot": null,
      "DeletedTime": null,
      "RemainingRetentionDays": null,
      "AccessTier": "Hot",
      "AccessTierInferred": true,
      "ArchiveStatus": "",
      "CustomerProvidedKeySha256": null,
      "AccessTierChangeTime": null
    },
    "Metadata": null
  }
]
```

## Metadata information

By default the Azure Blob Storage output binding auto generates a UUID as the blob filename and is not assigned any system or custom metadata to it. It is configurable in the metadata property of the message (all optional).

Applications publishing to an Azure Blob Storage output binding should send a message with the following format:

```json
{
    "data": "file content",
    "metadata": {
        "blobName"           : "filename.txt",
        "contentType"        : "text/plain",
        "contentMD5"         : "vZGKbMRDAnMs4BIwlXaRvQ==",
        "contentEncoding"    : "UTF-8",
        "contentLanguage"    : "en-us",
        "contentDisposition" : "attachment",
        "cacheControl"       : "no-cache",
        "custom"             : "hello-world"
    },
    "operation": "create"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
