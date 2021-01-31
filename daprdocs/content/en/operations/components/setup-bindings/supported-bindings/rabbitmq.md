---
type: docs
title: "RabbitMQ binding spec"
linkTitle: "RabbitMQ"
description: "Detailed documentation on the RabbitMQ binding component"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.rabbitmq
  version: v1
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
  - name: prefetchCount
    value: 0
  - name: exclusive
    value: false
  - name: maxPriority
    value: 5
```

- `queueName` is the RabbitMQ queue name.
- `host` is the RabbitMQ host address.
- `durable` tells RabbitMQ to persist message in storage.
- `deleteWhenUnused` enables or disables auto-delete.
- `ttlInSeconds` is an optional parameter to set the [default message time to live at RabbitMQ queue level](https://www.rabbitmq.com/ttl.html). If this parameter is omitted, messages won't expire, continuing to exist on the queue until processed.
- `prefetchCount` is an optional parameter to set the [Channel Prefetch Setting (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch). If this parameter is omiited, QoS would set value to 0 as no limit.
- `exclusive` determines whether the topic will be an exclusive topic or not
- `maxPriority` is an optional parameter to set the [priority queue](https://www.rabbitmq.com/priority.html). If this parameter is omitted, queue will be created as a general queue instead of a priority queue.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

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

## Specifying a priority on message level

Priority can be defined at the message level. If `maxPriority` parameter is set, high priority messages will have priority over other low priority messages. 

To set priority at message level use the `metadata` section in the request body during the binding invocation.

The field name is `priority`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "priority": "5"
        },
        "operation": "create"
      }'
```

## Output Binding Supported Operations

* create

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
