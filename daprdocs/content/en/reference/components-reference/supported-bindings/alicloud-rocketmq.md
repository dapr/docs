---
type: docs
title: "Alibaba Cloud RocketMQ binding spec"
linkTitle: "Alibaba Cloud RocketMQ"
description: "Detailed documentation on the Alibaba Cloud RocketMQ binding component"
aliases:
- "/operations/components/setup-bindings/supported-bindings/rocketmq/"
---

## Setup Dapr component
To setup an Alibaba Cloud Object Storage binding create a component of type `bindings.rocketmq`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

HTTP
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.rocketmq
  version: v1
  metadata:
    - name: accessProto
      value: "http"
    - name: endpoint
      value: "http://********.cn-qingdao-public.aliyuncs.com"
    - name: accessKey
      value: "****************"
    - name: secretKey
      value: "****************"
    - name: consumerGroup
      value: "GID_******"
    - name: instanceId
      value: "MQ_INST_******"
    - name: topics
      value: "topic1||topic2"
```

TCP
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.rocketmq
  version: v1
  metadata:
    - name: accessProto
      value: "tcp"
    - name: nameServer
      value: "http://*************.aliyuncs.com:80"
    - name: accessKey
      value: "****************"
    - name: secretKey
      value: "****************"
    - name: consumerGroup
      value: "GID_******"
    - name: instanceId
      value: "MQ_INST_******"
    - name: topics
      value: "topic1||topic2"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}
## Spec metadata fields
| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|--------|---------|
| nameServer                | N        | Input/Output |RocketMQ's name server, optional| `"http://*************.aliyuncs.com:80"`
| endpoint                | N        | Input/Output |RocketMQ's endpoint, optional, just for HTTP proto | `"http://********.cn-qingdao-public.aliyuncs.com"`
| accessProto                | Y        | Input/Output |sdk proto (HTTP or TCP),default TCP| `"tcp"`
| accessKey                | N        | Input/Output |RocketMQ Credentials| `"****************"`
| secretKey                | N        | Input/Output |RocketMQ Credentials | `"****************"`
| consumerGroup                | N        | Input |consumer group for RocketMQ's subscribers, suggested to provide | `"GID_******"`
| consumerBatchSize                | N        | Input |consumer group for RocketMQ's subscribers, suggested to provide, just for http proto | `1024`
| consumerThreadNums                | N        | Input |consumer group for RocketMQ's subscribers, suggested to provide, just for cgo proto | `20`
| instanceId                | N       | Input/Output |RocketMQ's namespace, optional | `"MQ_INST_******"`
| nameServerDomain                | N        | Input/Output |RocketMQ's name server domain, optional| `"http://*************.aliyuncs.com"`
| retries                | N        | Input/Output |retry times to connect RocketMQ's broker, optional | `0`
| topics                | Y        | Input/Output | topics to subscribe, use delimiter double vertical bar to separate if more than one topics are configured | `"topic1"`

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:
- `create`

## Create an AliCloud RocketMQ
- Follow the instructions [here(en)](https://www.alibabacloud.com/help/doc-detail/200153.htm) on setting up AliCloud RocketMQ
- Follow the instructions [here(zh-cn)](https://help.aliyun.com/document_detail/200153.html) on setting up AliCloud RocketMQ

## Specifying a partition key

When invoking the rocketmq binding, its possible to provide an optional partition key by using the `metadata` section in the request body.
You can specifie`rocketmq-topic`,`rocketmq-tag`,`"rocketmq-key"` in `metadata`

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myRocketMQ \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "rocketmq-topic": "topic1",
          "rocketmq-tag": "tag",
          "rocketmq-key": "key1",
        },
        "operation": "create"
      }'
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
