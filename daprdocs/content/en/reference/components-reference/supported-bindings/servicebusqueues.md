---
type: docs
title: "Azure Service Bus Queues binding spec"
linkTitle: "Azure Service Bus Queues"
description: "Detailed documentation on the Azure Service Bus Queues binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/servicebusqueues/"
---

## Component format

To setup Azure Service Bus Queues binding create a component of type `bindings.azure.servicebusqueues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

### Connection String Authentication

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString # Required when not using Azure Authentication.
    value: "Endpoint=sb://************"
  - name: queueName
    value: queue1
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
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|-----------------|----------|---------|
| `connectionString` | Y | Input/Output | The Service Bus connection string. Required unless using Azure AD authentication. | `"Endpoint=sb://************"` |
| `queueName` | Y | Input/Output | The Service Bus queue name. Queue names are case-insensitive and will always be forced to lowercase. | `"queuename"` |
| `timeoutInSec` | N | Input/Output | Timeout for all invocations to the Azure Service Bus endpoint, in seconds. *Note that this option impacts network calls and it's unrelated to the TTL applies to messages*. Default: `60` | `60` |
| `namespaceName`| N | Input/Output | Parameter to set the address of the Service Bus namespace, as a fully-qualified domain name. Required if using Azure AD authentication. | `"namespace.servicebus.windows.net"` |
| `disableEntityManagement` | N | Input/Output | When set to true, queues and subscriptions do not get created automatically. Default: `"false"` | `"true"`, `"false"`
| `lockDurationInSec`     | N | Input/Output | Defines the length in seconds that a message will be locked for before expiring. Used during subscription creation only. Default set by server. | `30`
| `autoDeleteOnIdleInSec` | N  | Input/Output | Time in seconds to wait before auto deleting idle subscriptions. Used during subscription creation only. Default: `0` (disabled) | `3600`
| `defaultMessageTimeToLiveInSec` | N | Input/Output | Default message time to live, in seconds. Used during subscription creation only. | `10`
| `maxDeliveryCount`      | N | Input/Output | Defines the number of attempts the server will make to deliver a message. Used during subscription creation only. Default set by server. | `10`
| `minConnectionRecoveryInSec` | N | Input/Output | Minimum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. Default: `2` | `5`
| `maxConnectionRecoveryInSec` | N | Input/Output | Maximum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. After each attempt, the component waits a random number of seconds, increasing every time, between the minimum and the maximum. Default: `300` (5 minutes) | `600`
| `maxActiveMessages`     | N  | Defines the maximum number of messages to be processing or in the buffer at once. This should be at least as big as the maximum concurrent handlers. Default: `1` | `1`
| `handlerTimeoutInSec`| N | Input |  Timeout for invoking the app's handler. Default: `0` (no timeout) | `30`
| `minConnectionRecoveryInSec` | N | Input | Minimum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. Default: `2` | `5` |
| `maxConnectionRecoveryInSec` | N | Input | Maximum interval (in seconds) to wait before attempting to reconnect to Azure Service Bus in case of a connection failure. After each attempt, the binding waits a random number of seconds, increasing every time, between the minimum and the maximum. Default: `300` (5 minutes) | `600` |
| `lockRenewalInSec`      | N | Input | Defines the frequency at which buffered message locks will be renewed. Default: `20`. | `20`
| `maxActiveMessages`     | N | Input | Defines the maximum number of messages to be processing or in the buffer at once. This should be at least as big as the maximum concurrent handlers. Default: `1` | `2000`
| `maxConcurrentHandlers` | N | Input | Defines the maximum number of concurrent message handlers; set to `0` for unlimited. Default: `1` | `10`
| `maxRetriableErrorsPerSec` | N | Input | Maximum number of retriable errors that are processed per second. If a message fails to be processed with a retriable error, the component adds a delay before it starts processing another message, to avoid immediately re-processing messages that have failed. Default: `10` | `10`
| `publishMaxRetries` | N  | Output | The max number of retries for when Azure Service Bus responds with "too busy" in order to throttle messages. Defaults: `5` | `5`
| `publishInitialRetryIntervalInMs` | N  | Output | Time in milliseconds for the initial exponential backoff when Azure Service Bus throttle messages. Defaults: `500` | `500`

### Azure Active Directory (AAD) authentication

The Azure Service Bus Queues binding component supports authentication using all Azure Active Directory mechanisms, including Managed Identities. For further information and the relevant component metadata fields to provide depending on the choice of AAD authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

#### Example Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
  - name: namespaceName
    # Required when using Azure Authentication.
    # Must be a fully-qualified domain name
    value: "servicebusnamespace.servicebus.windows.net"
  - name: queueName
    value: queue1
  - name: ttlInSeconds
    value: 60
```

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`: publishes a message to the specified queue

## Specifying a TTL per message

Time to live can be defined on a per-queue level (as illustrated above) or at the message level. The value defined at message level overwrites any value set at the queue level.

To set time to live at message level use the `metadata` section in the request body during the binding invocation: the field name is `ttlInSeconds`.

{{< tabs "Linux">}}

{{% codetab %}}

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myServiceBusQueue \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "ttlInSeconds": "60"
        },
        "operation": "create"
      }'
```
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
