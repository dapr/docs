# Azure Storage Queues Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.storagequeues
  metadata:
  - name: storageAccount
    value: "account1"
  - name: storageAccessKey
    value: "***********"
  - name: queue
    value: "myqueue"
```

`storageAccount` is the Azure Storage account name.
`storageAccessKey` is the Azure Storage access key.
`queue` is the name of the Azure Storage queue.
