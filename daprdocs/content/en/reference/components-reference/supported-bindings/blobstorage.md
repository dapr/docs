---
type: docs
title: "Azure Blob Storage binding spec"
linkTitle: "Azure Blob Storage"
description: "Detailed documentation on the Azure Blob Storage binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/blobstorage/"
---

## Component format

To setup Azure Blob Storage binding create a component of type `bindings.azure.blobstorage`. See [this guide]({{% ref "howto-bindings.md#1-create-a-binding" %}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: myStorageAccountName
  - name: accountKey
    value: ***********
  - name: containerName
    value: container1
# - name: decodeBase64
#   value: <bool>
# - name: getBlobRetryCount
#   value: <integer>
# - name: publicAccessLevel
#   value: <publicAccessLevel>
# - name: disableEntityManagement
#   value: <bool>
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| `accountName` | Y | Input/Output | The name of the Azure Storage account | `"myexmapleaccount"` |
| `accountKey` | Y* | Input/Output | The access key of the Azure Storage account. Only required when not using Microsoft Entra ID authentication. | `"access-key"` |
| `containerName` | Y | Output | The name of the Blob Storage container to write to | `myexamplecontainer` |
| `endpoint` | N | Input/Output | Optional custom endpoint URL. This is useful when using the [Azurite emulator](https://github.com/Azure/azurite) or when using custom domains for Azure Storage (although this is not officially supported). The endpoint must be the full base URL, including the protocol (`http://` or `https://`), the IP or FQDN, and optional port. | `"http://127.0.0.1:10000"` |
| `decodeBase64` | N | Output | Configuration to decode base64 file content before saving to Blob Storage. (In case of saving a file with binary content). Defaults to `false` | `true`, `false` |
| `getBlobRetryCount` | N | Output | Specifies the maximum number of HTTP GET requests that will be made while reading from a RetryReader Defaults to `10` | `1`, `2` |
| `publicAccessLevel` | N | Output | Specifies whether data in the container may be accessed publicly and the level of access (only used if the container is created by Dapr). Defaults to `none` | `blob`, `container`, `none` |
| `disableEntityManagement` | N | Output | Configuration to disable entity management. When set to `true`, the binding skips the attempt to create the specified storage container. This is useful when operating with minimal Azure AD permissions. Defaults to `false` | `true`, `false` |

### Microsoft Entra ID authentication

The Azure Blob Storage binding component supports authentication using all Microsoft Entra ID mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of Microsoft Entra ID authentication mechanism, see the [docs for authenticating to Azure]({{% ref authenticating-azure.md %}}).

## Binding support

This component supports **output binding** with the following operations:

- `create` : [Create blob](#create-blob)
- `get` : [Get blob](#get-blob)
- `delete` : [Delete blob](#delete-blob)
- `list`: [List blobs](#list-blobs)
- `bulkGet`: [Bulk get blobs](#bulk-get-blobs)
- `bulkCreate`: [Bulk create blobs](#bulk-create-blobs)
- `bulkDelete`: [Bulk delete blobs](#bulk-delete-blobs)

The Blob storage component's **input binding** triggers and pushes events using [Azure Event Grid]({{% ref eventgrid.md %}}). 
 
Refer to the [Reacting to Blob storage events](https://learn.microsoft.com/azure/storage/blobs/storage-blob-event-overview) guide for more set up and more information.

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

{{< tabpane text=true >}}
  {{% tab "Windows" %}}
  On Windows, utilize cmd prompt (PowerShell has different escaping mechanism)
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

##### Save text to a specific blob

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"blobName\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "blobName": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}


##### Save a file to a blob

To upload a file, encode it as Base64 and let the Binding know to deserialize it:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: myStorageAccountName
  - name: accountKey
    value: ***********
  - name: containerName
    value: container1
  - name: decodeBase64
    value: true
```

Then you can upload it as you would normally:

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"blobName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "blobName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

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
- `filePath` - (optional) if set, the blob content is streamed directly to this local file path instead of being returned in the response body. This is recommended for large blobs to avoid loading the entire content into memory. When used, the response body will be empty and the path of the written file is returned as a `Metadata.filePath` HTTP header.

#### Example

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

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

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

##### Delete blob snapshots only

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"deleteSnapshots\": \"only\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "deleteSnapshots": "only" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

##### Delete blob including snapshots

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"deleteSnapshots\": \"include\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "deleteSnapshots": "include" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

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

### Bulk get blobs

To perform a bulk get operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body. Blobs can be retrieved either to local files (streaming mode) or returned inline in the response (inline mode).

#### Streaming mode (to files)

Use explicit items with `filePath` to stream each blob directly to a file, or use `prefix` with `destinationDir` to download all matching blobs:

```json
{
  "operation": "bulkGet",
  "data": {
    "items": [
      { "blobName": "file1.txt", "filePath": "/tmp/downloads/file1.txt" },
      { "blobName": "file2.txt", "filePath": "/tmp/downloads/file2.txt" }
    ],
    "concurrency": 10
  }
}
```

Or using a prefix to download all matching blobs to a directory:

```json
{
  "operation": "bulkGet",
  "data": {
    "prefix": "logs/2024/",
    "destinationDir": "/tmp/downloads/logs",
    "concurrency": 10
  }
}
```

#### Inline mode (in response)

Omit `filePath` from items to receive blob contents inline (base64-encoded) in the response:

```json
{
  "operation": "bulkGet",
  "data": {
    "items": [
      { "blobName": "config1.json" },
      { "blobName": "config2.json" }
    ]
  }
}
```

The data parameters are:

- `items` - (optional) an array of objects specifying which blobs to retrieve. Each item has:
  - `blobName` - the name of the blob to retrieve
  - `filePath` - (optional) local file path to stream the blob to. If omitted, blob content is returned inline in the response
- `prefix` - (optional) retrieves all blobs matching this prefix. Requires `destinationDir`
- `destinationDir` - (required when using `prefix`) the local directory to download prefix-matched blobs into
- `concurrency` - (optional) maximum number of parallel downloads. Defaults to `10`

At least one of `items` or `prefix` must be provided. Both can be combined in a single request.

{{% alert title="Note" color="primary" %}}
For large files, use streaming mode (with `filePath`) to avoid loading entire blob contents into memory. File paths are validated to prevent path traversal attacks.
{{% /alert %}}

#### Examples

##### Bulk get blobs to files

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"bulkGet\", \"data\": { \"items\": [{ \"blobName\": \"file1.txt\", \"filePath\": \"C:\\\\tmp\\\\file1.txt\" }, { \"blobName\": \"file2.txt\", \"filePath\": \"C:\\\\tmp\\\\file2.txt\" }] } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "bulkGet", "data": { "items": [{ "blobName": "file1.txt", "filePath": "/tmp/file1.txt" }, { "blobName": "file2.txt", "filePath": "/tmp/file2.txt" }] } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

##### Bulk get blobs by prefix

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"bulkGet\", \"data\": { \"prefix\": \"backups/\", \"destinationDir\": \"C:\\\\tmp\\\\backups\", \"concurrency\": 5 } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "bulkGet", "data": { "prefix": "backups/", "destinationDir": "/tmp/backups", "concurrency": 5 } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

#### Response

The response body contains a JSON array of results:

```json
[
  {
    "blobName": "file1.txt",
    "filePath": "/tmp/file1.txt"
  },
  {
    "blobName": "file2.txt",
    "filePath": "/tmp/file2.txt"
  }
]
```

When using inline mode (no `filePath`), each item includes a `data` field with the base64-encoded blob content:

```json
[
  {
    "blobName": "config1.json",
    "data": "eyJrZXkiOiAidmFsdWUifQ=="
  }
]
```

If an individual blob fails, its entry will contain an `error` field instead of `filePath`/`data`:

```json
[
  {
    "blobName": "missing.txt",
    "error": "BlobNotFound"
  }
]
```

### Bulk create blobs

To perform a bulk create operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body. Blobs can be uploaded from local files or from inline data.

#### From files

```json
{
  "operation": "bulkCreate",
  "data": {
    "items": [
      { "blobName": "file1.txt", "sourcePath": "/tmp/uploads/file1.txt" },
      { "blobName": "file2.jpg", "sourcePath": "/tmp/uploads/file2.jpg", "contentType": "image/jpeg" }
    ],
    "concurrency": 10
  }
}
```

#### From inline data

```json
{
  "operation": "bulkCreate",
  "data": {
    "items": [
      { "blobName": "greeting.txt", "data": "Hello World" },
      { "blobName": "config.json", "data": "{\"key\": \"value\"}", "contentType": "application/json" }
    ]
  }
}
```

The data parameters are:

- `items` - (required) an array of objects specifying blobs to create. Each item has:
  - `blobName` - (required) the name of the blob to create
  - `sourcePath` - (optional) local file path to stream as the blob's content. For large files, this streams directly without loading into memory
  - `data` - (optional) inline string data for the blob content. One of `sourcePath` or `data` must be provided
  - `contentType` - (optional) the MIME type for this specific blob (e.g. `"image/jpeg"`, `"application/json"`)
- `concurrency` - (optional) maximum number of parallel uploads. Defaults to `10`

{{% alert title="Note" color="primary" %}}
When `decodeBase64` is enabled in the component configuration, both inline `data` and file-based `sourcePath` content are base64-decoded before upload. This means `sourcePath` should point to a base64-encoded file when `decodeBase64` is `true`. When `decodeBase64` is `false` (the default), content is uploaded as-is.
{{% /alert %}}

#### Examples

##### Bulk create blobs from files

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"bulkCreate\", \"data\": { \"items\": [{ \"blobName\": \"report.pdf\", \"sourcePath\": \"C:\\\\tmp\\\\report.pdf\", \"contentType\": \"application/pdf\" }, { \"blobName\": \"data.csv\", \"sourcePath\": \"C:\\\\tmp\\\\data.csv\", \"contentType\": \"text/csv\" }] } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "bulkCreate", "data": { "items": [{ "blobName": "report.pdf", "sourcePath": "/tmp/report.pdf", "contentType": "application/pdf" }, { "blobName": "data.csv", "sourcePath": "/tmp/data.csv", "contentType": "text/csv" }] } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

##### Bulk create blobs from inline data

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"bulkCreate\", \"data\": { \"items\": [{ \"blobName\": \"hello.txt\", \"data\": \"Hello World\" }, { \"blobName\": \"goodbye.txt\", \"data\": \"Goodbye World\" }] } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "bulkCreate", "data": { "items": [{ "blobName": "hello.txt", "data": "Hello World" }, { "blobName": "goodbye.txt", "data": "Goodbye World" }] } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

#### Response

The response body contains a JSON array of results:

```json
[
  {
    "blobName": "report.pdf",
    "blobURL": "https://<account>.blob.core.windows.net/<container>/report.pdf"
  },
  {
    "blobName": "data.csv",
    "blobURL": "https://<account>.blob.core.windows.net/<container>/data.csv"
  }
]
```

If an individual blob fails, its entry will contain an `error` field:

```json
[
  {
    "blobName": "report.pdf",
    "error": "open /tmp/report.pdf: no such file or directory"
  }
]
```

### Bulk delete blobs

To perform a bulk delete operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "bulkDelete",
  "data": {
    "blobNames": ["file1.txt", "file2.txt", "file3.txt"],
    "concurrency": 10
  }
}
```

Or delete all blobs matching a prefix:

```json
{
  "operation": "bulkDelete",
  "data": {
    "prefix": "logs/2023/",
    "deleteSnapshots": "include"
  }
}
```

The data parameters are:

- `blobNames` - (optional) an array of blob names to delete
- `prefix` - (optional) deletes all blobs matching this prefix
- `deleteSnapshots` - (optional) how to handle snapshots when deleting. One of:
  - `include` - delete the base blob and all of its snapshots
  - `only` - delete only the blob's snapshots, not the blob itself
- `concurrency` - (optional) maximum number of parallel delete operations. Defaults to `10`

At least one of `blobNames` or `prefix` must be provided. Both can be combined.

{{% alert title="Note" color="primary" %}}
Bulk delete uses the Azure Blob Batch API for efficient deletion (up to 256 blobs per batch request). If the batch API is unavailable, it falls back to concurrent individual deletes.
{{% /alert %}}

#### Examples

##### Bulk delete by blob names

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"bulkDelete\", \"data\": { \"blobNames\": [\"file1.txt\", \"file2.txt\", \"file3.txt\"] } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "bulkDelete", "data": { "blobNames": ["file1.txt", "file2.txt", "file3.txt"] } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

##### Bulk delete by prefix

{{< tabpane text=true >}}

  {{% tab "Windows" %}}
  ```bash
  curl -d "{ \"operation\": \"bulkDelete\", \"data\": { \"prefix\": \"temp/\", \"deleteSnapshots\": \"include\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

  {{% tab "Linux" %}}
  ```bash
  curl -d '{ "operation": "bulkDelete", "data": { "prefix": "temp/", "deleteSnapshots": "include" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /tab %}}

{{< /tabpane >}}

#### Response

The response body contains a JSON array of results:

```json
[
  { "blobName": "file1.txt" },
  { "blobName": "file2.txt" },
  { "blobName": "file3.txt" }
]
```

If an individual blob fails to delete, its entry will contain an `error` field:

```json
[
  { "blobName": "file1.txt" },
  { "blobName": "file2.txt", "error": "BlobNotFound" }
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

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Bindings building block]({{% ref bindings %}})
- [How-To: Trigger application with input binding]({{% ref howto-triggers.md %}})
- [How-To: Use bindings to interface with external resources]({{% ref howto-bindings.md %}})
- [Bindings API reference]({{% ref bindings_api.md %}})
