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
    value: <REPLACE-WITH-CONNECTION-STRING> # Required.
  - name: storageAccountName
    value: <REPLACE-WITH-STORAGE-ACCOUNT-NAME> # Required.
  - name: storageAccountKey
    value: <REPLACE-WITH-STORAGE-ACCOUNT-KEY> # Required.
  - name: storageContainerName
    value: <REPLACE-WITH-CONTAINER-NAME > # Required.
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

## Apply the configuration

### In Kubernetes

To apply the Azure Event Hubs pub/sub to Kubernetes, use the `kubectl` CLI:

```bash
kubectl apply -f eventhubs.yaml
```

### Running locally

The Dapr CLI will automatically create a directory named `components` in your current working directory with a Redis component.
To use Azure Event Hubs, replace the contents of `pubsub.yaml` (or `messagebus.yaml` for Dapr < 0.6.0) file with the contents of `eventhubs.yaml` above (Don't change the filename).
