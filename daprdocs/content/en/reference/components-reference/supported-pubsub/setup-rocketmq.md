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
spec:
  type: pubsub.rocketmq
  version: v1
  metadata:
    - name: instanceName
      value: dapr-rocketmq-test
    - name: consumerGroup
      value: dapr-rocketmq-test-g-c
    - name: producerGroup 
      value: dapr-rocketmq-test-g-p
    - name: nameSpace
      value: dapr-test
    - name: nameServer
      value: "127.0.0.1:9876,127.0.0.2:9876"
    - name: retries
      value: 3
    - name: consumerModel
      value: "clustering"
    - name: consumeOrderly
      value: false
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields
| Field                                 | Required | Details                                                      | default                                                 | Example                                      |
| ------------------------------------- | :------: | ------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------- |
| instanceName                          |    N     | Instance name                                                | time.Now().String()                                     | dapr-rocketmq-test                           |
| consumerGroup                         |    N     | Consumer group name. Recommend. If `producerGroup` is `null`，`groupName` is used. |                                                         | `dapr-rocketmq-test-g-c `                     |
| producerGroup (consumerID)            |    N     | Producer group name. Recommended. If `producerGroup` is `null`，`consumerID` is used. If `consumerID` also is null, `groupName` is used. |                                                         | dapr-`rocketmq-test-g-p`                      |
| groupName                             |    N     | Consumer/Producer group name. **Depreciated**.               |                                                         | `dapr-rocketmq-test-g`                         |
| nameSpace                             |    N     | RocketMQ namespace                                           |                                                         | `dapr-rocketmq`                                |
| nameServerDomain                      |    N     | RocketMQ name server domain                                  |                                                         | `https://my-app.net:8080/nsaddr`               |
| nameServer                            |    N     | RocketMQ name server, separated by "," or ";"           |                                                         | 127.0.0.1:9876;127.0.0.2:9877,127.0.0.3:9877 |
| accessKey                             |    N     | Access Key (Username)                                        |                                                         | `"admin"`                                    |
| secretKey                             |    N     | Secret Key (Password)                                        |                                                         | `"password"`                                 |
| securityToken                         |    N     | Security Token                                               |                                                         |                                              |
| retries                               |    N     | Number of retries to send a message to broker                            | 3                                                       | 3                                            |
| producerQueueSelector (queueSelector) |    N     | Producer Queue selector. There are five implementations of queue selector: `hash`, `random`, `manual`, `roundRobin`, `dapr`. | `dapr`                                                    | `hash`                                         |
| consumerModel                         |    N     | Message model that defines how messages are delivered to each consumer client. RocketMQ supports two message models: `clustering` and `broadcasting`. | `clustering`                                              | `broadcasting`                                 |
| fromWhere (consumeFromWhere)          |    N     | Consuming point on consumer booting. There are three consuming points: CONSUME_FROM_LAST_OFFSET, CONSUME_FROM_FIRST_OFFSET, CONSUME_FROM_TIMESTAMP | ConsumeFromLastOffset                                   | CONSUME_FROM_LAST_OFFSET                     |
| consumeOrderly                        |    N     | Whether it is an ordered message using FIFO order. This field defaults to false. | false                                                   | false                                        |
| consumeMessageBatchMaxSize            |    N     | Batch consumption size out of range [1, 1024]                | 512                                                     | 10                                           |
| maxReconsumeTimes                     |    N     | Max re-consume times. -1 means 16 times. If messages are re-consumed more than {@link maxReconsumeTimes} before Success, it's be directed to a deletion queue waiting. | orderly message is MaxInt32, concurrently message is 16 | 16                                           |
| autoCommit                            |    N     | auto commit                                                  | true                                                    | false                                        |
| pullInterval                          |    N     | Message pull Interval                                        | 100                                                     | 100                                          |
| pullBatchSize                         |    N     | The number of messages pulled from the broker at a time. if pullBatchSize is null，ConsumerBatchSize is used. pullBatchSize out of range [1, 1024] | 32                                                      | 10                                           |
| content-type                          |    N     | Message content-type, e.g., `"application/cloudevents+json; charset=utf-8"`, `"application/octet-stream"`. This field defaults to "text/plain" |                                                         | `"text/plain"`                               |
| logLevel                              |    N     | Log level                                                    | warn                                                    | Info                                         |
| sendTimeOut                           |    N     | send msg timeout to connect rocketmq's broker, nanoseconds. It is deprecated. | 3 seconds                                               | 10000000000                                  |
| sendTimeOutSec                        |    N     | Timeout duration for publishing a message in seconds. if sendTimeOutSec is null，sendTimeOut is used. | 3 seconds                                               | 3                                            |
| mspProperties                         |    N     | The RocketMQ message properties in this collection are passed to the APP in Data Separate multiple properties with "," |                                                         | key,mkey                                     |

For backwards-compatibility reasons, the following values in the metadata are supported, although their use is discouraged.

| Field (supported but deprecated) | Required | Details                                                  | Example                  |
| -------------------------------- | :------: | -------------------------------------------------------- | ------------------------ |
| groupName                        |    N     | Producer group name for RocketMQ publishers              | `"my_unique_group_name"` |
| sendTimeOut                      |    N     | Timeout duration for publishing a message in nanoseconds | `0`                      |
| consumerBatchSize                |    N     | The number of messages pulled from the broker at a time  | 32                       |

## Setup RocketMQ
See https://rocketmq.apache.org/docs/quick-start/ to setup a local RocketMQ instance.

## Per-call metadata fields

### Partition Key

When invoking the RocketMQ pub/sub, it's possible to provide an optional partition key by using the `metadata` query param in the request url.

You need to specify `rocketmq-tag` , `"rocketmq-key"` , `rocketmq-shardingkey` , `rocketmq-queue` in `metadata`

Example:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-tag=?&metadata.rocketmq-key=?&metadata.rocketmq-shardingkey=key&metadata.rocketmq-queue=1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## QueueSelector

The RocketMQ component contains a total of five queue selectors. The RocketMQ client provides the following queue selectors:
- `HashQueueSelector`
- `RandomQueueSelector`
- `RoundRobinQueueSelector`
- `ManualQueueSelector`

To learn more about these RocketMQ client queue selectors, read the [RocketMQ documentation](https://rocketmq.apache.org/docs).

The Dapr RocketMQ component implements the following queue selector:
- `DaprQueueSelector`

 This article focuses on the design of `DaprQueueSelector`.

### DaprQueueSelector

`DaprQueueSelector` integrates three queue selectors: 
- `HashQueueSelector`
- `RoundRobinQueueSelector`
- `ManualQueueSelector`

`DaprQueueSelector` gets the queue id from the request parameter. You can set the queue id by running the following:

```
http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-queue=1
```

The `ManualQueueSelector` is implemented using the method above.

Next, the `DaprQueueSelector` tries to:
- Get a `ShardingKey`
- Hash the `ShardingKey` to determine the queue id.

You can set the `ShardingKey` by doing the following:

```
http://localhost:3500/v1.0/publish/myRocketMQ/myTopic?metadata.rocketmq-shardingkey=key
```

If the `ShardingKey` does not exist, the `RoundRobin` algorithm is used to determine the queue id.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
