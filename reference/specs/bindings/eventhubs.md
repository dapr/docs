# Azure Event Hubs Binding Spec

See [this](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-dotnet-framework-getstarted-send) for instructions on how to set up an Event Hub.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.eventhubs
  metadata:
  - name: connectionString      # Azure EventHubs connection string
    value: "Endpoint=sb://****"
  - name: consumerGroup         # EventHubs consumer group
    value: "group1"
  - name: storageAccountName    # Azure Storage Account Name
    value: "accountName"   
  - name: storageAccountKey     # Azure Storage Account Key
    value: "accountKey"                
  - name: storageContainerName  # Azure Storage Container Name
    value: "containerName"    
  - name: partitionID           # (Optional) PartitionID to send and receive events
    value: 0
```

- `connectionString` is the [EventHubs connection string](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature). Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string.
- `consumerGroup` is the name of an [EventHubs Consumer Group](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features#consumer-groups) to listen on.
- `storageAccountName` Is the name of the account of the Azure Storage account to persist checkpoints data on.
- `storageAccountKey`  Is the account key for the Azure Storage account to persist checkpoints data on.
- `storageContainerName` Is the name of the container in the Azure Storage account to persist checkpoints data on.
- `partitionID` (Optional) ID of the partition to send and receive events.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Output Binding Supported Operations

* create