# AWS DynamoDB Binding Spec

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.aws.dynamodb
  metadata:
  - name: region
    value: us-west-2
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: table
    value: items
```

`region` is the AWS region.
`accessKey` is the AWS access key.
`secretKey` is the AWS secret key.
`table` is the DynamoDB table name.
