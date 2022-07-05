---
type: docs
title: "RabbitMQ binding spec"
linkTitle: "RabbitMQ"
description: "Detailed documentation on the RabbitMQ binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/rabbitmq/"
---

## Component format

To setup RabbitMQ binding create a component of type `bindings.rabbitmq`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
  - name: contentType
    value: "text/plain"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| queueName | Y | Input/Output |  The RabbitMQ queue name | `"myqueue"` |
| host | Y | Input/Output | The RabbitMQ host address | `"amqp://[username][:password]@host.domain[:port]"` |
| durable | N | Output | Tells RabbitMQ to persist message in storage. Defaults to `"false"` | `"true"`, `"false"` |
| deleteWhenUnused | N | Input/Output | Enables or disables auto-delete. Defaults to `"false"` | `"true"`, `"false"` |
| ttlInSeconds | N | Output | Set the [default message time to live at RabbitMQ queue level](https://www.rabbitmq.com/ttl.html). If this parameter is omitted, messages won't expire, continuing to exist on the queue until processed. See [also](#specifying-a-ttl-per-message)  | `60` |
| prefetchCount | N | Input | Set the [Channel Prefetch Setting (QoS)](https://www.rabbitmq.com/confirms.html#channel-qos-prefetch). If this parameter is omiited, QoS would set value to 0 as no limit | `0` |
| exclusive | N | Input/Output | Determines whether the topic will be an exclusive topic or not. Defaults to `"false"` | `"true"`, `"false"` |
| maxPriority| N | Input/Output | Parameter to set the [priority queue](https://www.rabbitmq.com/priority.html). If this parameter is omitted, queue will be created as a general queue instead of a priority queue. Value between 1 and 255. See [also](#specifying-a-priority-per-message) | `"1"`, `"10"` |
| contentType | N | Input/Output | The content type of the message. Defaults to "text/plain". | `"text/plain"`, `"application/cloudevent+json"` and so on |
## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`

## Specifying a TTL per message

Time to live can be defined on queue level (as illustrated above) or at the message level. The value defined at message level overwrites any value set at queue level.

To set time to live at message level use the `metadata` section in the request body during the binding invocation.

The field name is `ttlInSeconds`.

Example:

{{< tabs Windows Linux >}}
{{% codetab %}}
```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d "{
        \"data\": {
          \"message\": \"Hi\"
        },
        \"metadata\": {
          \"ttlInSeconds\": "60"
        },
        \"operation\": \"create\"
      }"
```
{{% /codetab %}}

{{% codetab %}}
```bash
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
{{% /codetab %}}
{{< /tabs >}}


## Specifying a priority per message

Priority can be defined at the message level. If `maxPriority` parameter is set, high priority messages will have priority over other low priority messages.

To set priority at message level use the `metadata` section in the request body during the binding invocation.

The field name is `priority`.

Example:

{{< tabs Windows Linux >}}
{{% codetab %}}
```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRabbitMQ \
  -H "Content-Type: application/json" \
  -d "{
        \"data\": {
          \"message\": \"Hi\"
        },
        \"metadata\": {
          "priority": \"5\"
        },
        \"operation\": \"create\"
      }"
```
{{% /codetab %}}

{{% codetab %}}
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
{{% /codetab %}}
{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
