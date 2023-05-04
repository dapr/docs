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
| Field                                 | Required | Details                                                      | default                                                     | Example                                                      |
| ------------------------------------- | :------: | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| instanceName                          |    N     | Instance name                                                | `time.Now().String()`                                       | `dapr-rocketmq-test`                                         |
| consumerGroup                         |    N     | Consumer group name. Recommend. If `producerGroup` is `null`，`groupName` is used. |                                                             | `dapr-rocketmq-test-g-c `                                    |
| producerGroup (consumerID)            |    N     | Producer group name. Recommended. If `producerGroup` is `null`，`consumerID` is used. If `consumerID` also is null, `groupName` is used. |                                                             | `dapr-rocketmq-test-g-p`                                     |
| groupName                             |    N     | Consumer/Producer group name. **Depreciated**.               |                                                             | `dapr-rocketmq-test-g`                                       |
| nameSpace                             |    N     | RocketMQ namespace                                           |                                                             | `dapr-rocketmq`                                              |
| nameServerDomain                      |    N     | RocketMQ name server domain                                  |                                                             | `https://my-app.net:8080/nsaddr`                             |
| nameServer                            |    N     | RocketMQ name server, separated by "," or ";"                |                                                             | `127.0.0.1:9876;127.0.0.2:9877,127.0.0.3:9877`               |
| accessKey                             |    N     | Access Key (Username)                                        |                                                             | `"admin"`                                                    |
| secretKey                             |    N     | Secret Key (Password)                                        |                                                             | `"password"`                                                 |
| securityToken                         |    N     | Security Token                                               |                                                             |                                                              |
| retries                               |    N     | Number of retries to send a message to broker                | `3`                                                         | `3`                                                          |
| producerQueueSelector (queueSelector) |    N     | Producer Queue selector. There are five implementations of queue selector: `hash`, `random`, `manual`, `roundRobin`, `dapr`. | `dapr`                                                      | `hash`                                                       |
| consumerModel                         |    N     | Message model that defines how messages are delivered to each consumer client. RocketMQ supports two message models: `clustering` and `broadcasting`. | `clustering`                                                | `broadcasting` , `clustering`                                |
| fromWhere (consumeFromWhere)          |    N     | Consuming point on consumer booting. There are three consuming points: `CONSUME_FROM_LAST_OFFSET`, `CONSUME_FROM_FIRST_OFFSET`, `CONSUME_FROM_TIMESTAMP` | `CONSUME_FROM_LAST_OFFSET`                                  | `CONSUME_FROM_LAST_OFFSET`                                   |
| consumeTimestamp |    N     | Backtracks consumption time with second precision. Time format is `yyyymmddhhmmss`. For example, `20131223171201` implies the time of 17:12:01 and date of December 23, 2013 | ` time.Now().Add(time.Minute * (-30)).Format("20060102150405")` | `20131223171201`                   |
| consumeOrderly                        |    N     | Determines if it's an ordered message using FIFO order.      | `false`                                                     | `false`                                                      |
| consumeMessageBatchMaxSize            |    N     | Batch consumption size out of range `[1, 1024]`              | `512`                                                       | `10`                                                         |
| consumeConcurrentlyMaxSpan            |    N     | Concurrently max span offset. This has no effect on sequential consumption. Range: `[1, 65535]` | `1000`                                                    | `1000`                                             |
| maxReconsumeTimes                     |    N     | Max re-consume times. `-1` means 16 times. If messages are re-consumed more than {@link maxReconsumeTimes} before success, they'll be directed to a deletion queue. | Orderly message is `MaxInt32`; Concurrently message is `16` | `16`                                                         |
| autoCommit                            |    N     | Enable auto commit                                           | `true`                                                      | `false`                                                      |
| consumeTimeout                            |    N     | Maximum amount of time a message may block the consuming thread. Time unit: Minute | `15`                                      | `15`                                                   |
| consumerPullTimeout                           |    N     | The socket timeout in milliseconds         |                                                       |                                                       |
| pullInterval                          |    N     | Message pull interval                                        | `100`                                                       | `100`                                                        |
| pullBatchSize                         |    N     | The number of messages pulled from the broker at a time. If `pullBatchSize` is `null`, use `ConsumerBatchSize`. `pullBatchSize` out of range `[1, 1024]` | `32`                                                        | `10`                                                         |
| pullThresholdForQueue |    N     | Flow control threshold on queue level. Each message queue will cache a maximum of 1000 messages by default. Consider the `PullBatchSize` - the instantaneous value may exceed the limit. Range: `[1, 65535]` | `1024`                                     | `1000`                                                       |
| pullThresholdForTopic    |    N     | Flow control threshold on topic level. The value of `pullThresholdForQueue` will be overwritten and calculated based on `pullThresholdForTopic` if it isn't unlimited. For example, if the value of `pullThresholdForTopic` is 1000 and 10 message queues are assigned to this consumer, then `pullThresholdForQueue` will be set to 100. Range: `[1, 6553500]` | `-1(Unlimited)`                                           | `10`                                                         |
| pullThresholdSizeForQueue                        |    N     | Limit the cached message size on queue level. Consider the `pullBatchSize` - the instantaneous value may exceed the limit. The size of a message is only measured by message body, so it's not accurate. Range: `[1, 1024]` | `100`                                                     | `100`                                                        |
| pullThresholdSizeForTopic                        |    N     | Limit the cached message size on topic level.The value of `pullThresholdSizeForQueue` will be overwritten and calculated based on `pullThresholdSizeForTopic` if it isn't unlimited.For example, if the value of pullThresholdSizeForTopic is 1000 MiB and 10 message queues are assigned to this consumer, then pullThresholdSizeForQueue will be set to 100 MiB.Range: `[1, 102400]` | `-1`                                                     | `100`                                                        |
| content-type                          |    N     | Message content type.                                        | `"text/plain"`                                              | `"application/cloudevents+json; charset=utf-8"`, `"application/octet-stream"` |
| logLevel                              |    N     | Log level                                                    | `warn`                                                      | `info`                                                       |
| sendTimeOut                           |    N     | Send message timeout to connect RocketMQ's broker, measured in nanoseconds. **Deprecated**. | 3 seconds                                                   | `10000000000`                                                |
| sendTimeOutSec                        |    N     | Timeout duration for publishing a message in seconds. If `sendTimeOutSec` is `null`, `sendTimeOut` is used. | 3 seconds                                                   | `3`                                                          |
| mspProperties                         |    N     | The RocketMQ message properties in this collection are passed to the APP in Data Separate multiple properties with "," |                                                             | `key,mkey`                                                   |

For backwards-compatibility reasons, the following values in the metadata are supported, although their use is discouraged.

| Field (supported but deprecated) | Required | Details                                                  | Example                  |
| -------------------------------- | :------: | -------------------------------------------------------- | ------------------------ |
| groupName                        |    N     | Producer group name for RocketMQ publishers              | `"my_unique_group_name"` |
| sendTimeOut                      |    N     | Timeout duration for publishing a message in nanoseconds | `0`                      |
| consumerBatchSize                |    N     | The number of messages pulled from the broker at a time  | `32`                       |

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
