# Setup Azure CosmosDB 

## Creating an Azure CosmosDB account

[Follow the instructions](https://docs.microsoft.com/en-us/azure/cosmos-db/how-to-manage-database-account) from the Azure documentation on how to create an Azure CosmosDB account.  The database and collection must be created in CosmosDB before Dapr consumes it.  

**Note : The partition key for the collection must be "/partitionKey".  This is case-sensitive.**

In order to setup CosmosDB as a state store, you will need the following properties:

* **URL**: the CosmosDB url. for example: https://******.documents.azure.com:443/
* **Master Key**: The key to authenticate to the CosmosDB account
* **Database**: The name of the database
* **Collection**: The name of the collection

## Create a Dapr component

The next step is to create a Dapr component for CosmosDB.

Create the following YAML file named `cosmos.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.cosmosdb
  metadata:
  - name: url
    value: <REPLACE-WITH-URL>
  - name: masterKey
    value: <REPLACE-WITH-MASTER-KEY>
  - name: database
    value: <REPLACE-WITH-DATABASE>
  - name: collection
    value: <REPLACE-WITH-COLLECTION>
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

The following example uses the Kubernetes secret store to retrieve the secrets:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.cosmosdb
  metadata:
  - name: url
    value: <REPLACE-WITH-URL>
  - name: masterKey
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  - name: database
    value: <REPLACE-WITH-DATABASE>
  - name: collection
    value: <REPLACE-WITH-COLLECTION>
```

Here is an example of what it might look like:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.azure.cosmosdb
  metadata:
  - name: url
    value: https://accountname.documents.azure.com:443
  - name: masterKey
    value: thekey==
  - name: database
    value: db1
  - name: collection
    value: c1
```

If you wish to use this as the actor secret store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Apply the configuration

### In Kubernetes

To apply the CosmosDB state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f cosmos.yaml
```

### Running locally

To run locally, create a YAML file described above and provide the path to the `dapr run` command with the flag `--components-path`.  See [this](https://github.com/dapr/cli#use-non-default-components-path) or run `dapr run --help` for more information on the path.

## Partition keys

For non-actor state operations, the Azure CosmosDB state store will use the `key` property provided in the requests to the Dapr API to determine the partition key.  This can be overridden by specifying a metadata field in the request with a key of `partitionKey` and a value of the desired partition.

For actor state operations, the partition key will be generated using the appId, the actor type, and the actor id, so that data for the same actor will always end up under the same partition.  The reason for this is because actor state operations must use transactions, and in CosmosDB transactions must be on the same partition.

The following non-actor operation will use the partition key `nihilus` as the partition key value sent to CosmosDB:

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```
