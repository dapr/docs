# Setup Azure Table Storage 

## Creating Azure Storage account

[Follow the instructions](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account. 

If you wish to create a table for Dapr to use, you can do so beforehand. However, Table Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Table Storage as a state store, you will need the following properties:

* **AccountName**: The storage account name. For example: **mystorageaccount**. 
* **AccountKey**: Primary or secondary storage key.
* **TableName**: The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist.

## Create a Dapr component

The next step is to create a Dapr component for Azure Table Storage.

Create the following YAML file named `azuretable.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.tablestorage
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    value: <REPLACE-WITH-ACCOUNT-KEY>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
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
  type: state.azure.tablestorage
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
```

## Apply the configuration

### In Kubernetes

To apply Azure Table Storage state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f azuretable.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

## Partitioning

The Azure Table Storage state store will use the `key` property provided in the requests to the Dapr API to determine the `row key`. Service Name is used for `partition key`. This provides best performance, as each service type will store state in it's own table partition. 

This state store creates a column called `Value` in the table storage and puts raw state inside it.

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

will create the following record in a table:

| PartitionKey | RowKey  | Value |
| ------------ | ------- | ----- |
| myservice    | nihilus | darth |

## Concurrency

Azure Table Storage state concurrency is achieved by using `ETag`s according to [the official documenation]( https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-table-storage).

