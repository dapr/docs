---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: Detailed information on the Azure Blob Store state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
---

## Component format

To setup Azure Blobstorage state store create a component of type `state.azure.blobstorage`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    value: <REPLACE-WITH-ACCOUNT-KEY>
  - name: containerName
    value: <REPLACE-WITH-CONTAINER-NAME>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accountName        | Y        | The storage account name | `"mystorageaccount"`.
| accountKey         | Y        | Primary or secondary storage key | `"key"`
| containerName      | Y         | The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist  | `"container"`
| ContentType        | N        | The blob’s content type | `"text/plain"`
| ContentMD5         | N        | The blob's MD5 hash | `"vZGKbMRDAnMs4BIwlXaRvQ=="`
| ContentEncoding    | N        | The blob's content encoding | `"UTF-8"`
| ContentLanguage    | N        | The blob's content language | `"en-us"`
| ContentDisposition | N        | The blob's content disposition. Conveys additional information about how to process the response payload | `"attachment"`
| CacheControl       | N        | The blob's cache control | `"no-cache"`

## Setup Azure Blobstorage

[Follow the instructions](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

If you wish to create a container for Dapr to use, you can do so beforehand. However, Blob Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Blob Storage as a state store, you will need the following properties:
- **AccountName**: The storage account name. For example: **mystorageaccount**.
- **AccountKey**: Primary or secondary storage key.
- **ContainerName**: The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist.

## Apply the configuration

### In Kubernetes

To apply Azure Blob Storage state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f azureblob.yaml
```
### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

This state store creates a blob file in the container and puts raw state inside it.

For example, the following operation coming from service called `myservice`

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

creates the blob file in the containter with `key` as filename and `value` as the contents of file.

## Concurrency

Azure Blob Storage state concurrency is achieved by using `ETag`s according to [the Azure Blob Storage documentation](https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage).

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
