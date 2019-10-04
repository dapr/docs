# Kafka Binding Spec

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
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
```

`topics` is a comma separated string of topics for an input binding.
`brokers` is a comma separated string of kafka brokers.
`consumerGroup` is a kafka consumer group to listen on.
`publishTopic` is the topic to publish for an output binding.