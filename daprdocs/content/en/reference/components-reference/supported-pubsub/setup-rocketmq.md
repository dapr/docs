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

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rocketmq-pubsub
  namespace: default
spec:
  type: pubsub.rocketmq
  version: v1
  metadata:
    - name: nameServer
      value: "http://localhost:9876"
    - name: accessKey
      value: "admin"
    - name: secretKey
      value: "password"
    - name: consumerGroup
      value: "GID_0001"
    - name: retries
      value: 10
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields
| Field              | Required | Details | Example |
|--------------------|:--------:|--------|---------|
| accessKey          | N        | Access Key (Username) | `"admin"`
| secretKey          | N        | Secret Key (Password) | `"password"`
| nameServer         | N        | Name server address | `"127.0.0.1:9876;127.0.0.2:9877"`
| nameServerDomain   | N        | Name server domain | `"https://my-app.net:8080/nsaddr"`
| nameSpace          | N        | Namespace of the producer/consumer | `"namespace"` |
| groupName          | N        | Producer group name for RocketMQ publishers | `"my_unique_group_name"` |
| consumerGroup      | N        | Consumer group name for RocketMQ subscribers| `"my_unique_group_name"`
| content-type       | N        | Message content-type, e.g., `"application/cloudevents+json; charset=utf-8"`, `"application/octet-stream"` | `"text/plain"`
| retries            | N        | Number of times to retry to connect rocketmq's broker, optional | `0`
| sendTimeOut        | N        | Timeout duration for publishing a message in nanoseconds | `0`

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
