---
type: docs
title: "Azure Service Bus"
linkTitle: "Azure Service Bus"
description: "Detailed documentation on the Azure Service Bus pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus/"
---

## Component format
To setup Azure Service Bus pubsub create a component of type `pubsub.azure.servicebus`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
  namespace: default
spec:
  type: pubsub.azure.servicebus
  version: v1
  metadata:
  - name: connectionString # Required
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  # - name: timeoutInSec # Optional
  #   value: 60
  # - name: handlerTimeoutInSec # Optional
  #   value: 60
  # - name: disableEntityManagement # Optional
  #   value: "false"
  # - name: maxDeliveryCount # Optional
  #   value: 3
  # - name: lockDurationInSec # Optional
  #   value: 60
  # - name: lockRenewalInSec # Optional
  #   value: 20
  # - name: maxActiveMessages # Optional
  #   value: 2000
  # - name: maxActiveMessagesRecoveryInSec # Optional
  #   value: 2
  # - name: maxConcurrentHandlers # Optional
  #   value: 10
  # - name: prefetchCount # Optional
  #   value: 5
  # - name: defaultMessageTimeToLiveInSec # Optional
  #   value: 10
  # - name: autoDeleteOnIdleInSec # Optional
  #   value: 10
  # - name: maxReconnectionAttempts # Optional
  #   value: 30
  # - name: connectionRecoveryInSec # Optional
  #   value: 2
  # - name: publishMaxRetries # Optional
  #   value: 5
  # - name: publishInitialRetryInternalInMs # Optional
  #   value: 500
```

> __NOTE:__ The above settings are shared across all topics that use this component.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| connectionString   | Y  | Shared access policy connection-string for the Service Bus  | "`Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}`"
| timeoutInSec       | N  | Timeout for sending messages and management operations. Default: `60` |`30`
| handlerTimeoutInSec| N  |  Timeout for invoking app handler. # Optional. Default: `60` | `30`
| disableEntityManagement | N  | When set to true, topics and subscriptions do not get created automatically. Default: `"false"` | `"true"`, `"false"`
| maxDeliveryCount      | N  |Defines the number of attempts the server will make to deliver a message. Default set by server| `10`
| lockDurationInSec     | N  |Defines the length in seconds that a message will be locked for before expiring. Default set by server | `30`
| lockRenewalInSec      | N  |Defines the frequency at which buffered message locks will be renewed. Default: `20`. | `20`
| maxActiveMessages     | N  |Defines the maximum number of messages to be buffered or processing at once. Default: `10000` | `2000`
| maxActiveMessagesRecoveryInSec | N  |Defines the number of seconds to wait once the maximum active message limit is reached. Default: `2` | `10`
| maxConcurrentHandlers | N  |Defines the maximum number of concurrent message handlers  | `10`
| prefetchCount         | N  |Defines the number of prefetched messages (use for high throughput / low latency scenarios)| `5`
| defaultMessageTimeToLiveInSec | N  |Default message time to live. | `10`
| autoDeleteOnIdleInSec | N  |Time in seconds to wait before auto deleting messages. | `10`
| maxReconnectionAttempts | N  |Defines the maximum number of reconnect attempts. Default: `30` | `30`
| connectionRecoveryInSec | N  |Time in seconds to wait between connection recovery attempts. Defaults: `2` | `2`
| publishMaxRetries | N  | The max number of retries for when Azure Service Bus responds with "too busy" in order to throttle messages. Defaults: `5` | `5`
| publishInitialRetryInternalInMs | N  | Time in milliseconds for the initial exponential backoff when Azure Service Bus throttle messages. Defaults: `500` | `500`

## Create an Azure Service Bus

Follow the instructions [here](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal) on setting up Azure Service Bus Topics.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
