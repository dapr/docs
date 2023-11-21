---
type: docs
title: "Azure Service Bus Topics"
linkTitle: "Azure Service Bus Topics"
description: "Detailed documentation on the Azure Service Bus Topics pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus-topics/"
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-servicebus/"
---

## Component format

To set up Azure Service Bus Topics pub/sub, create a component of type `pubsub.azure.servicebus.topics`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

> This component uses topics on Azure Service Bus; see the official documentation for the differences between [topics and queues](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-queues-topics-subscriptions).  
> For using queues, see the [Azure Service Bus Queues pubsub component]({{< ref "setup-azure-servicebus-queues" >}}).

### Connection String Authentication

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus.topics
  version: v1
  metadata:
  # Required when not using Microsoft Entra ID Authentication
  - name: connectionString
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  # - name: consumerID # Optional: defaults to the app's own ID
  #   value: "{identifier}" 
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
  #   value: 10000
  # - name: maxConcurrentHandlers # Optional
  #   value: 10
  # - name: defaultMessageTimeToLiveInSec # Optional
  #   value: 10
  # - name: autoDeleteOnIdleInSec # Optional
  #   value: 3600
  # - name: minConnectionRecoveryInSec # Optional
  #   value: 2
  # - name: maxConnectionRecoveryInSec # Optional
  #   value: 300
  # - name: maxRetriableErrorsPerSec # Optional
  #   value: 10
  # - name: publishMaxRetries # Optional
  #   value: 5
  # - name: publishInitialRetryIntervalInMs # Optional
  #   value: 500
```

> __NOTE:__ The above settings are shared across all topics that use this component.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `connectionString`   | Y  | Shared access policy connection string for the Service Bus. Required unless using Microsoft Entra ID authentication. | See example above
| `namespaceName`| N | Parameter to set the address of the Service Bus namespace, as a fully-qualified domain name. Required if using Microsoft Entra ID authentication. | `"namespace.servicebus.windows.net"` |
| `consumerID`         | N        | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. (`appID`) value. |
| `timeoutInSec`       | N  | Timeout for sending messages and for management operations. Default: `60` |`30`
| `handlerTimeoutInSec`| N  |  Timeout for invoking the app's handler. Default: `60` | `30`
| `lockRenewalInSec`      | N  | Defines the frequency at which buffered message locks will be renewed. Default: `20`. | `20`
| `maxActiveMessages`     | N  | Defines the maximum number of messages to be processing or in the buffer at once. This should be at least as big as the maximum concurrent handlers. Default: `1000` | `2000`
| `maxConcurrentHandlers` | N  | Defines the maximum number of concurrent message handlers. Default: `0` (unlimited) | `10`
| `disableEntityManagement` | N  | When set to true, queues and subscriptions do not get created automatically. Default: `"false"` | `"true"`, `"false"`
| `defaultMessageTimeToLiveInSec` | N  | Default message time to live, in seconds. Used during subscription creation only. | `10`
| `autoDeleteOnIdleInSec` | N  | Time in seconds to wait before auto deleting idle subscriptions. Used during subscription creation only. Default: `0` (disabled) | `3600`
| `maxDeliveryCount`      | N  | Defines the number of attempts the server will make to deliver a message. Used during subscription creation only. Default set by server. | `10`
| `lockDurationInSec`     | N  | Defines the length in seconds that a message will be locked for before expiring. Used during subscription creation only. Default set by server. | `30`
| `minConnectionRecoveryInSec` | N | Minimum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. Default: `2` | `5`
| `maxConnectionRecoveryInSec` | N | Maximum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. After each attempt, the component waits a random number of seconds, increasing every time, between the minimum and the maximum. Default: `300` (5 minutes) | `600`
| `maxRetriableErrorsPerSec` | N | Maximum number of retriable errors that are processed per second. If a message fails to be processed with a retriable error, the component adds a delay before it starts processing another message, to avoid immediately re-processing messages that have failed. Default: `10` | `10`
| `publishMaxRetries` | N  | The max number of retries for when Azure Service Bus responds with "too busy" in order to throttle messages. Defaults: `5` | `5`
| `publishInitialRetryIntervalInMs` | N  | Time in milliseconds for the initial exponential backoff when Azure Service Bus throttle messages. Defaults: `500` | `500`

### Microsoft Entra ID authentication

The Azure Service Bus Topics pubsub component supports authentication using all Microsoft Entra ID mechanisms, including Managed Identities. For further information and the relevant component metadata fields to provide depending on the choice of Microsoft Entra ID authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

#### Example Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus.topics
  version: v1
  metadata:
  - name: namespaceName
    # Required when using Azure Authentication.
    # Must be a fully-qualified domain name
    value: "servicebusnamespace.servicebus.windows.net"
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
```

## Message metadata

Azure Service Bus messages extend the Dapr message format with additional contextual metadata. Some metadata fields are set by Azure Service Bus itself (read-only) and others can be set by the client when publishing a message.

### Sending a message with metadata

To set Azure Service Bus metadata when sending a message, set the query parameters on the HTTP request or the gRPC metadata as documented [here](https://docs.dapr.io/reference/api/pubsub_api/#metadata).

- `metadata.MessageId`
- `metadata.CorrelationId`
- `metadata.SessionId`
- `metadata.Label`
- `metadata.ReplyTo`
- `metadata.PartitionKey`
- `metadata.To`
- `metadata.ContentType`
- `metadata.ScheduledEnqueueTimeUtc`
- `metadata.ReplyToSessionId`

> **Note:** The `metadata.MessageId` property does not set the `id` property of the cloud event returned by Dapr and should be treated in isolation.

> **NOTE:** If the `metadata.SessionId` property is not set but the topic requires sessions then an empty session id will be used.

> **NOTE:** The `metadata.ScheduledEnqueueTimeUtc` property supports the [RFC1123](https://www.rfc-editor.org/rfc/rfc1123) and [RFC3339](https://www.rfc-editor.org/rfc/rfc3339) timestamp formats.

### Receiving a message with metadata

When Dapr calls your application, it will attach Azure Service Bus message metadata to the request using either HTTP headers or gRPC metadata.
In addition to the [settable metadata listed above](#sending-a-message-with-metadata), you can also access the following read-only message metadata.

- `metadata.DeliveryCount`
- `metadata.LockedUntilUtc`
- `metadata.LockToken`
- `metadata.EnqueuedTimeUtc`
- `metadata.SequenceNumber`

To find out more details on the purpose of any of these metadata properties, please refer to [the official Azure Service Bus documentation](https://docs.microsoft.com/rest/api/servicebus/message-headers-and-properties#message-headers).

> Note: that all times are populated by the server and are not adjusted for clock skews.

## Subscribe to a session enabled topic

To subscribe to a topic that has [sessions enabled](https://learn.microsoft.com/azure/service-bus-messaging/message-sessions) you can provide the following properties in the subscription metadata.

- `requireSessions (default: false)`
- `sessionIdleTimeoutInSec (default: 60)`
- `maxConcurrentSessions (default: 8)`

## Create an Azure Service Bus broker for topics

Follow the instructions [here](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal) on setting up Azure Service Bus Topics.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
