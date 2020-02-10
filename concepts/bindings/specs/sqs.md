# AWS SQS Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.aws.sqs
  metadata:
  - name: region
    value: us-west-2
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: queueName
    value: items
```

`region` is the AWS region.
`accessKey` is the AWS access key.
`secretKey` is the AWS secret key.
`queueName` is the SQS queue name.
