---
type: docs
title: "RocketMQ"
linkTitle: "RocketMQ"
description: "Detailed documentation on the RocketMQ pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-rocketmq/"
---

## Component format
To setup RocketMQ pubsub, create a component of type `pubsub.rocketmq`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

### HTTP
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
      value: "http://localhost:9876"
    - name: accessKey
      value: "****************"
    - name: secretKey
      value: "****************"
    - name: consumerGroup
      value: "GID_******"
    - name: instanceId
      value: "MQ_INST_******"
```

### TCP
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
      value: "http://localhost:9876"
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

## Setup RocketMQ
See https://rocketmq.apache.org/docs/quick-start/ to setup a local RocketMQ instance.

## Per-call metadata fields

### Partition Key

When invoking the RocketMQ pub/sub, it's possible to provide an optional partition key by using the `metadata` query param in the request url.

You need to specify `rocketmq-tag`,`"rocketmq-key"` in `metadata`

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
