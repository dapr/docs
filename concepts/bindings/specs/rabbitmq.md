# RabbitMQ Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.rabbitmq
  metadata:
  - name: queueName
    value: queue1
  - name: host
    value: amqp://guest:guest@localhost:5672
  - name: durable
    value: true
  - name: deleteWhenUnused
    value: false
```

`queueName` is the RabbitMQ queue name.
`host` is the RabbitMQ host address.
`durable` tells RabbitMQ to persist message in storage.
`deleteWhenUnused` enables or disables auto-delete.