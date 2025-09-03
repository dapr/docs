---
type: docs
title: "Apache RocketMQ binding spec"
linkTitle: "RocketMQ"
description: "Detailed documentation on the Apache RocketMQ binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/rocketmq/"
---


## Component format

To set up an Apache RocketMQ binding, create a component of type `bindings.rocketmq`.  
See [this guide]({{% ref "howto-bindings.md#1-create-a-binding" %}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.rocketmq
  version: v1
  metadata:
    - name: accessProto
      value: "tcp"
    - name: nameServer
      value: "localhost:9876"
    - name: endpoint
      value: "http://localhost:8080"
    - name: topics
      value: "topic1,topic2"
    - name: consumerGroup
      value: "my-consumer-group"
    # Optional
    - name: consumerBatchSize
      value: "10"
    - name: consumerThreadNums
      value: "4"
    - name: retries
      value: "3"
    - name: instanceId
      value: "my-instance"
````

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings.
It is recommended to use a secret store for the secrets as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field                | Required | Binding support | Details                                                               | Example                        |
| -------------------- | :------: | --------------- | --------------------------------------------------------------------- | ------------------------------ |
| `topics`             |     Y    | Input/Output    | Comma-separated list of topics for publishing or subscribing.         | `"topic1,topic2"`              |
| `nameServer`         |     N    | Input/Output    | Address of the RocketMQ name server.                                  | `"localhost:9876"`             |
| `endpoint`           |     N    | Input/Output    | RocketMQ endpoint (for `http` protocol).                              | `"http://localhost:8080"`      |
| `accessProto`        |     N    | Input/Output    | SDK protocol for connecting to RocketMQ.                              | `"tcp"`, `"tcp-cgo"`, `"http"` |
| `consumerGroup`      |     N    | Input/Output    | Consumer group name for RocketMQ subscribers.                         | `"my-consumer-group"`          |
| `consumerBatchSize`  |     N    | Input           | Batch size for consuming messages.                                    | `"10"`                         |
| `consumerThreadNums` |     N    | Input           | Number of consumer threads (for `tcp-cgo` protocol).                  | `"4"`                          |
| `instanceId`         |     N    | Input/Output    | RocketMQ namespace instance ID.                                       | `"my-instance"`                |
| `nameServerDomain`   |     N    | Input/Output    | Domain name for the RocketMQ name server.                             | `"rocketmq.example.com"`       |
| `retries`            |     N    | Input/Output    | Number of retry attempts to connect to the RocketMQ broker.           | `"3"`                          |
| `accessKey`          |     N   | Input/Output    | Access key for authentication. Required if access control is enabled. | `"access-key"`                 |
| `secretKey`          |     N   | Input/Output    | Secret key for authentication. Required if access control is enabled. | `"secret-key"`                 |

> **Note**: `accessKey` and `secretKey` can be stored in a Dapr secret store instead of the YAML file for improved security.

### Authentication Using Access Keys

To use access key authentication, include the following metadata fields in the configuration:

```yaml
- name: accessKey
  secretKeyRef:
    name: rocketmq-secrets
    key: accessKey
- name: secretKey
  secretKeyRef:
    name: rocketmq-secrets
    key: secretKey
```

This allows secure retrieval of credentials from a secret store.

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

* `create`: publishes a new message
* `read`: consumes messages from RocketMQ topics

## Set topic per-request

You can override the topic in component metadata on a per-request basis:

```json
{
  "operation": "create",
  "metadata": {
    "topics": "dynamicTopic"
  },
  "data": "This is a test message for RocketMQ!"
}
```

## Retry behavior

Use the `retries` metadata field to specify how many times Dapr should attempt to connect to RocketMQ before failing:

```yaml
- name: retries
  value: "5"
```

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Bindings building block]({{% ref bindings %}})
- [How-To: Trigger application with input binding]({{% ref howto-triggers.md %}})
- [How-To: Use bindings to interface with external resources]({{% ref howto-bindings.md %}})
- [Bindings API reference]({{% ref bindings_api.md %}})
