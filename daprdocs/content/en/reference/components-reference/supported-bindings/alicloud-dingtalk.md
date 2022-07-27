---
type: docs
title: "Alibaba Cloud DingTalk binding spec"
linkTitle: "Alibaba Cloud DingTalk"
description: "Detailed documentation on the Alibaba Cloud DingTalk binding component"
---

## Setup Dapr component
To setup an Alibaba Cloud DingTalk binding create a component of type `bindings.dingtalk.webhook`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.dingtalk.webhook
  version: v1
  metadata:
  - name: id
    value: "test_webhook_id"
  - name: url
    value: "https://oapi.dingtalk.com/robot/send?access_token=******"
  - name: secret
    value: "****************"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}
## Spec metadata fields
| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|--------|---------|
| id                | Y        | Input/Output |unique id| `"test_webhook_id"`
| url                | Y        | Input/Output |DingTalk's Webhook url | `"https://oapi.dingtalk.com/robot/send?access_token=******"`
| secret                | N        | Input/Output |the secret of DingTalk's Webhook | `"****************"`

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:
- `create`
- `get`

## Specifying a partition key

Example: Follow the instructions [here](https://developers.dingtalk.com/document/app/custom-robot-access) on setting the data of payload

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myDingTalk \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "msgtype": "text",
          "text": {
            "content": "Hi"
          }
        },
        "operation": "create"
      }'
```

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myDingTalk \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "msgtype": "text",
          "text": {
            "content": "Hi"
          }
        },
        "operation": "get"
      }'
```
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
