# Setup Azure Blob Storage 

## Creating Azure Storage account

[Follow the instructions](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account. 

If you wish to create a container for Dapr to use, you can do so beforehand. However, Blob Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Blob Storage as a state store, you will need the following properties:

* **AccountName**: The storage account name. For example: **mystorageaccount**. 
* **AccountKey**: Primary or secondary storage key.
* **ContainerName**: The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist.

## Create a Dapr component

The next step is to create a Dapr component for Azure Blob Storage.

Create the following YAML file named `azureblob.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.blobstorage
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    value: <REPLACE-WITH-ACCOUNT-KEY>
  - name: containerName
    value: <REPLACE-WITH-CONTAINER-NAME>
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md).

The following example uses the Kubernetes secret store to retrieve the secrets:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.blobstorage
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  - name: containerName
    value: <REPLACE-WITH-CONTAINER-NAME>
```

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

will create the blob file in the containter with key as filename and value as the contents of file.

## Concurrency

Azure Blob Storage state concurrency is achieved by using `ETag`s according to [the official documenation](https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage).

