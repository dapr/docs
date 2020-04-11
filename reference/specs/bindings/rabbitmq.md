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
    value: amqp://[username][:password]@host.domain[:port]
  - name: durable
    value: true
  - name: deleteWhenUnused
    value: false
  - name: ttlInSeconds
    value: 60
```

- `queueName` is the RabbitMQ queue name.
- `host` is the RabbitMQ host address.
- `durable` tells RabbitMQ to persist message in storage.
- `deleteWhenUnused` enables or disables auto-delete.
- `ttlInSeconds` is a optional paramater to set the [default message time to live at RabbitMQ queue level](https://www.rabbitmq.com/ttl.html). If this option is omitted, messages won't expire, existing until processed.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)