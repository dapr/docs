# Azure EventHubs Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventhubs
  metadata:
  - name: connectionString # connectionString of EventHub, not namespace
    value: Endpoint=sb://*****************
  - name: consumerGroup    # Optional
    value: group1
  - name: messageAge
    value: 5s              # Optional. Golang duration
```

- `connectionString` is the [EventHubs connection string](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature). Note that this is the EventHub itself and not the EventHubs namespace. Make sure to use the child EventHub shared access policy connection string.
- `consumerGroup` is the name of an [EventHubs consumerGroup](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features#consumer-groups) to listen on.
- `messageAge` allows to receive messages that are not older than the specified age.
