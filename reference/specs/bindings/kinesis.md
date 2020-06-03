# AWS Kinesis Binding Spec

See [this](https://aws.amazon.com/kinesis/data-streams/getting-started/) for instructions on how to set up an AWS Kinesis data streams

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.kinesis
  metadata:
  - name: region
    value: AWS_REGION #replace
  - name: accessKey
    value: AWS_ACCESS_KEY # replace
  - name: secretKey
    value: AWS_SECRET_KEY #replace
  - name: streamName
    value: KINESIS_STREAM_NAME # Kinesis stream name
  - name: consumerName 
    value: KINESIS_CONSUMER_NAME # Kinesis consumer name 
  - name: mode
    value: shared # shared - Shared throughput or extended - Extended/Enhanced fanout
```

- `region` is the AWS region.
- `accessKey` is the AWS access key.
- `secretKey` is the AWS secret key.
- `mode` Accepted values: shared, extended. shared - Shared throughput, extended - Extended/Enhanced fanout methods. More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html)
- `streamName` is the AWS Kinesis Stream Name.
- `consumerName` is the AWS Kinesis Consumer Name.


> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Output Binding Supported Operations

* create