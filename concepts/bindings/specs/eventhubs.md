# Azure EventHubs Binding Spec

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventhubs
  metadata:
  - name: connectionString
    value: Endpoint=sb://*****************
  - name: consumerGroup  # Optional
    value: group1
  - name: messageAge
    value: 5s         # Optional. Golang duration
```

`connectionString` is the EventHubs connection string.
`consumerGroup` is the name of an EventHubs consumerGroup to listen on.
`messageAge` allows to receive messages that are not older than the specified age.
