# AWS SQS Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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

- `region` is the AWS region.
- `accessKey` is the AWS access key.
- `secretKey` is the AWS secret key.
- `queueName` is the SQS queue name.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Output Binding Supported Operations

* create
