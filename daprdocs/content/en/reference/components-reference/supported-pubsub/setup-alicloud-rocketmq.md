---
type: docs
title: "Alibaba Cloud RocketMQ"
linkTitle: "Alibaba Cloud RocketMQ"
description: "Detailed documentation on the Alibaba Cloud RocketMQ pubsub component"
aliases:
- "/operations/components/setup-pubsub/supported-pubsub/setup-alicloud-rocketmq/"
---

## Component format
To setup Alibaba Cloud RocketMQ pubsub create a component of type `pubsub.rocketmq`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

HTTP
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.rocketmq
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
```

TCP
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.rocketmq
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
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields
| Field              | Required | Details | Example |
|--------------------|:--------:|--------|---------|
| nameServer                | N        | RocketMQ's name server, optional| `"http://*************.aliyuncs.com:80"`
| endpoint                | Y        | RocketMQ's endpoint, optional, just for HTTP proto | `"http://********.cn-qingdao-public.aliyuncs.com"`
| accessProto                | Y        |sdk proto (HTTP or TCP),default TCP| `"tcp"`
| accessKey                | N        | RocketMQ Credentials| `"****************"`
| secretKey                | N        | RocketMQ Credentials | `"****************"`
| consumerGroup                | N        | consumer group for RocketMQ's subscribers, suggested to provide | `"GID_******"`
| consumerBatchSize                | N        | consumer group for RocketMQ's subscribers, suggested to provide, just for HTTP proto | `1024`
| consumerThreadNums                | N        |consumer group for RocketMQ's subscribers, suggested to provide, just for cgo proto | `20`
| instanceId                | N       | RocketMQ's namespace, optional | `"MQ_INST_******"`
| nameServerDomain                | N        |RocketMQ's name server domain, optional| `"mqrest.cn.aliyuncs.com"`
| retries                | N        | retry times to connect rocketmq's broker, optional | `0`
| content-type                | N        | msg's content-type eg:"application/cloudevents+json; charset=utf-8", application/octet-stream | `"text/plain"`

## Create an AliCloud RocketMQ
- Follow the instructions [here(en)](https://www.alibabacloud.com/help/doc-detail/200153.htm) on setting up AliCloud RocketMQ
- Follow the instructions [here(zh-cn)](https://help.aliyun.com/document_detail/200153.html) on setting up AliCloud RocketMQ


## Per-call metadata fields

### Partition Key

When invoking the rocketmq pub/sub, its possible to provide an optional partition key by using the `metadata` query param in the request url.

You need specifie `rocketmq-tag`,`"rocketmq-key"` in `metadata`

Example:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-tag=?&metadata.rocketmq-key=? \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
