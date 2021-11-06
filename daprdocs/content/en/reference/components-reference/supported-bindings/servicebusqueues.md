---
type: docs
title: "Azure Service Bus Queues binding spec"
linkTitle: "Azure Service Bus Queues"
description: "Detailed documentation on the Azure Service Bus Queues binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/servicebusqueues/"
---

## Component format

To setup Azure Service Bus Queues binding create a component of type `bindings.azure.servicebusqueues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.



```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString
    value: "Endpoint=sb://************"
  - name: queueName
    value: queue1
  - name: ttlInSeconds
    value: 60
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| connectionString | Y | Input/Output | The Service Bus connection string | `"Endpoint=sb://************"` |
| queueName | Y | Input/Output | The Service Bus queue name. Queue names are case-insensitive and will always be forced to lowercase. | `"queuename"` |
| ttlInSeconds | N | Output | Parameter to set the default message [time to live](https://docs.microsoft.com/azure/service-bus-messaging/message-expiration). If this parameter is omitted, messages will expire after 14 days. See [also](#specifying-a-ttl-per-message) | `"60"` |

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`

## Specifying a TTL per message

Time to live can be defined on queue level (as illustrated above) or at the message level. The value defined at message level overwrites any value set at queue level.

To set time to live at message level use the `metadata` section in the request body during the binding invocation.

The field name is `ttlInSeconds`.

{{< tabs "Linux">}}

{{% codetab %}}

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myServiceBusQueue \
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

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
