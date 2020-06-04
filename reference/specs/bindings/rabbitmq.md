# RabbitMQ Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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
- `ttlInSeconds` is an optional parameter to set the [default message time to live at RabbitMQ queue level](https://www.rabbitmq.com/ttl.html). If this parameter is omitted, messages won't expire, continuing to exist on the queue until processed.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Specifying a time to live on message level

Time to live can be defined on queue level (as illustrated above) or at the message level. The value defined at message level overwrites any value set at queue level.

To set time to live at message level use the `metadata` section in the request body during the binding invocation.

The field name is `ttlInSeconds`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "ttlInSeconds": "60"
        },
        "operation": "create"
      }'
```

## Output Binding Supported Operations

* create
