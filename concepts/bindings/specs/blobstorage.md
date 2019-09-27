# Azure Blob Storage Binding Spec

```
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.blobstorage
  metadata:
  - name: storageAccount
    value: https://******.documents.azure.com:443/
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
```

`storageAccount` is the Blob Storage account name.
`storageAccessKey` is the Blob Storage access key.
`container` is the name of the Blob Storage container to write to.
