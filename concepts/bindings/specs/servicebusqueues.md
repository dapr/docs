# Azure Service Bus Queues Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.servicebusqueues
  metadata:
  - name: connectionString
    value: sb://************
  - name: queueName
    value: queue1
```

`connectionString` is the Service Bus connection string.
`queueName` is the Service Bus queue name.
