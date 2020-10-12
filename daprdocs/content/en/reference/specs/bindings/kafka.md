# Kafka Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.kafka
  metadata:
  - name: topics # Optional. in use for input bindings
    value: topic1,topic2
  - name: brokers
    value: localhost:9092,localhost:9093
  - name: consumerGroup
    value: group1
  - name: publishTopic # Optional. in use for output bindings
    value: topic3
  - name: authRequired # Required. default: "true"
    value: "false"
   - name: saslUsername # Optional.
    value: "user"
   - name: saslPassword # Optional.
    value: "password"
```

- `topics` is a comma separated string of topics for an input binding.
- `brokers` is a comma separated string of kafka brokers.
- `consumerGroup` is a kafka consumer group to listen on.
- `publishTopic` is the topic to publish for an output binding.
- `authRequired` determines whether to use SASL authentication or not.
- `saslUsername` is the SASL username for authentication. Only used if `authRequired` is set to - `"true"`.
- `saslPassword` is the SASL password for authentication. Only used if `authRequired` is set to - `"true"`.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Specifying a partition key

When invoking the Kafka binding, its possible to provide an optional partition key by using the `metadata` section in the request body.

The field name is `partitionKey`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myKafka \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "partitionKey": "key1"
        },
        "operation": "create"
      }'
```

## Output Binding Supported Operations

* create
