# Setup Azure Event Hubs

Follow the instructions [here](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-create) on setting up Azure Event Hubs.
Since this implementation uses the Event Processor Host, you will also need an [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal).

## Create a Dapr component

The next step is to create a Dapr component for Azure Event Hubs.

Create the following YAML file named `eventhubs.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.azure.eventhubs
  metadata:
  - name: connectionString
    value: <REPLACE-WITH-CONNECTION-STRING> # Required. "Endpoint=sb://****"
  - name: storageAccountName
    value: <REPLACE-WITH-STORAGE-ACCOUNT-NAME> # Required.
  - name: storageAccountKey
    value: <REPLACE-WITH-STORAGE-ACCOUNT-KEY> # Required.
  - name: storageContainerName
    value: <REPLACE-WITH-CONTAINER-NAME > # Required.
```

See [here](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string. Note this is not the Event Hubs namespace.

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

## Create consumer groups for each subscriber

For every Dapr app that wants to subscribe to events, create an Event Hubs consumer group with the name of the `dapr id`.
For example, a Dapr app running on Kubernetes with `dapr.io/id: "myapp"` will need an Event Hubs consumer group named `myapp`.

## Apply the configuration

### In Kubernetes

To apply the Azure Event Hubs pub/sub to Kubernetes, use the `kubectl` CLI:

```bash
kubectl apply -f eventhubs.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
