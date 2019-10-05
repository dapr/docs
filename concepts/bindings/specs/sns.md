# AWS SNS Binding Spec

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.aws.sns
  metadata:
  - name: region
    value: us-west-2
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: topicArn
    value: mytopic
```

`region` is the AWS region.
`accessKey` is the AWS access key.
`secretKey` is the AWS secret key.
`topicArn` is the SNS topic name.