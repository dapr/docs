---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "Detailed documentation on the Azure Event Hubs pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## Component format

To set up an Azure Event Hubs pub/sub, create a component of type `pubsub.azure.eventhubs`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

Apart from the configuration metadata fields shown below, Azure Event Hubs also supports [Azure Authentication]({{< ref "authenticating-azure.md" >}}) mechanisms. 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
    # Either connectionString or eventHubNamespace is required
    # Use connectionString when *not* using Microsoft Entra ID
    - name: connectionString
      value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
    # Use eventHubNamespace when using Microsoft Entra ID
    - name: eventHubNamespace
      value: "namespace"
    - name: consumerID # Optional. If not supplied, the runtime will create one.
      value: "channel1"
    - name: enableEntityManagement
      value: "false"
    # The following four properties are needed only if enableEntityManagement is set to true
    - name: resourceGroupName
      value: "test-rg"
    - name: subscriptionID
      value: "value of Azure subscription ID"
    - name: partitionCount
      value: "1"
    - name: messageRetentionInDays
      value: "3"
    # Checkpoint store attributes
    - name: storageAccountName
      value: "myeventhubstorage"
    - name: storageAccountKey
      value: "112233445566778899"
    - name: storageContainerName
      value: "myeventhubstoragecontainer"
    # Alternative to passing storageAccountKey
    - name: storageConnectionString
      value: "DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<account-key>"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `connectionString`    | Y*  | Connection string for the Event Hub or the Event Hub namespace.<br>* Mutally exclusive with `eventHubNamespace` field.<br>* Required when not using [Microsoft Entra ID Authentication]({{< ref "authenticating-azure.md" >}}) | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` or `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key}"`
| `eventHubNamespace` | Y* | The Event Hub Namespace name.<br>* Mutally exclusive with `connectionString` field.<br>* Required when using [Microsoft Entra ID Authentication]({{< ref "authenticating-azure.md" >}}) | `"namespace"` 
| `consumerID`       | N | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. | Can be set to string value (such as `"channel1"` in the example above) or string format value (such as `"{podName}"`, etc.). [See all of template tags you can use in your component metadata.]({{< ref "component-schema.md#templated-metadata-values" >}})
| `storageAccountName`  | Y  | Storage account name to use for the checkpoint store. |`"myeventhubstorage"`
| `storageAccountKey`   | Y*  | Storage account key for the checkpoint store account.<br>* When using Microsoft Entra ID, it's possible to omit this if the service principal has access to the storage account too. | `"112233445566778899"`
| `storageConnectionString`   | Y*  | Connection string for the checkpoint store, alternative to specifying `storageAccountKey` | `"DefaultEndpointsProtocol=https;AccountName=myeventhubstorage;AccountKey=<account-key>"`
| `storageContainerName` | Y | Storage container name for the storage account name.  | `"myeventhubstoragecontainer"`
| `enableEntityManagement` | N | Boolean value to allow management of the EventHub namespace and storage account. Default: `false` | `"true", "false"`
| `resourceGroupName` | N | Name of the resource group the Event Hub namespace is part of. Required when entity management is enabled | `"test-rg"`
| `subscriptionID` | N | Azure subscription ID value. Required when entity management is enabled | `"azure subscription id"`
| `partitionCount` | N | Number of partitions for the new Event Hub namespace. Used only when entity management is enabled. Default: `"1"` | `"2"`
| `messageRetentionInDays` | N | Number of days to retain messages for in the newly created Event Hub namespace. Used only when entity management is enabled. Default: `"1"` | `"90"`

### Microsoft Entra ID authentication

The Azure Event Hubs pub/sub component supports authentication using all Microsoft Entra ID mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of Microsoft Entra ID authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

#### Example Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
    # Azure Authentication Used
    - name: azureTenantId
      value: "***"
    - name: azureClientId
      value: "***"
    - name: azureClientSecret
      value: "***"
    - name: eventHubNamespace 
      value: "namespace"
    - name: enableEntityManagement
      value: "false"
    # The following four properties are needed only if enableEntityManagement is set to true
    - name: resourceGroupName
      value: "test-rg"
    - name: subscriptionID
      value: "value of Azure subscription ID"
    - name: partitionCount
      value: "1"
    - name: messageRetentionInDays
    # Checkpoint store attributes
    # In this case, we're using Microsoft Entra ID to access the storage account too
    - name: storageAccountName
      value: "myeventhubstorage"
    - name: storageContainerName
      value: "myeventhubstoragecontainer"
```

## Sending and receiving multiple messages

Azure Eventhubs supports sending and receiving multiple messages in a single operation using the bulk pub/sub API.

### Configuring bulk publish

To set the metadata for bulk publish operation, set the query parameters on the HTTP request or the gRPC metadata, [as documented in the API reference]({{< ref pubsub_api >}}).

| Metadata | Default |
|----------|---------|
| `metadata.maxBulkPubBytes` | `1000000` |

### Configuring bulk subscribe

When subscribing to a topic, you can configure `bulkSubscribe` options. Refer to [Subscribing messages in bulk]({{< ref "pubsub-bulk#subscribing-messages-in-bulk" >}}) for more details and to learn more about [the bulk subscribe API]({{< ref pubsub-bulk.md >}}).

| Configuration | Default |
|---------------|---------|
| `maxMessagesCount` | `100` |
| `maxAwaitDurationMs` | `10000` |

## Configuring checkpoint frequency

When subscribing to a topic, you can configure the checkpointing frequency in a partition by [setting the metadata in the HTTP or gRPC subscribe request ]({{< ref "pubsub_api.md#http-request-2" >}}). This metadata enables checkpointing after the configured number of events within a partition event sequence. Disable checkpointing by setting the frequency to `0`.  

[Learn more about checkpointing](https://learn.microsoft.com/azure/event-hubs/event-hubs-features#checkpointing).

| Metadata | Default |
| -------- | ------- |
| `metadata.checkPointFrequencyPerPartition` | `1` |

Following example shows a sample subscription file for [Declarative subscription]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) using `checkPointFrequencyPerPartition` metadata. Similarly, you can also pass the metadata in [Programmatic subscriptions]({{< ref "subscription-methods.md#programmatic-subscriptions" >}}) as well.

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order-pub-sub
spec:
  topic: orders
  routes: 
    default: /checkout
  pubsubname: order-pub-sub
  metadata:
    checkPointFrequencyPerPartition: 1
scopes:
- orderprocessing
- checkout
```

{{% alert title="Note" color="primary" %}}
When subscribing to a topic using `BulkSubscribe`, you configure the checkpointing to occur after the specified number of _batches,_ instead of events, where _batch_ means the collection of events received in a single request.
{{% /alert %}}

## Create an Azure Event Hub

Follow the instructions on the [documentation](https://docs.microsoft.com/azure/event-hubs/event-hubs-create) to set up Azure Event Hubs.

Because this component uses Azure Storage as checkpoint store, you will also need an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal). Follow the instructions on the [documentation](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage) to manage the storage account access keys.

See the [documentation](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string (note this is not for the Event Hubs namespace).

### Create consumer groups for each subscriber

For every Dapr app that wants to subscribe to events, create an Event Hubs consumer group with the name of the Dapr app ID. For example, a Dapr app running on Kubernetes with `dapr.io/app-id: "myapp"` will need an Event Hubs consumer group named `myapp`.

Note: Dapr passes the name of the consumer group to the Event Hub, so this is not supplied in the metadata.

## Entity Management

When entity management is enabled in the metadata, as long as the application has the right role and permissions to manipulate the Event Hub namespace, Dapr can automatically create the Event Hub and consumer group for you.

The Evet Hub name is the `topic` field in the incoming request to publish or subscribe to, while the consumer group name is the name of the Dapr app which subscribes to a given Event Hub. For example, a Dapr app running on Kubernetes with name `dapr.io/app-id: "myapp"` requires an Event Hubs consumer group named `myapp`.

Entity management is only possible when using [Microsoft Entra ID Authentication]({{< ref "authenticating-azure.md" >}}) and not using a connection string.

> Dapr passes the name of the consumer group to the Event Hub, so this is not supplied in the metadata.

## Receiving custom properties

By default, Dapr does not forward [custom properties](https://learn.microsoft.com/azure/event-hubs/add-custom-data-event). However, by setting the subscription metadata `requireAllProperties` to `"true"`, you can receive custom properties as HTTP headers.

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order-pub-sub
spec:
  topic: orders
  routes: 
    default: /checkout
  pubsubname: order-pub-sub
  metadata:
    requireAllProperties: "true"
```

The same can be achieved using the Dapr SDK:

{{< tabs ".NET" >}}

{{% codetab %}}

```csharp
[Topic("order-pub-sub", "orders")]
[TopicMetadata("requireAllProperties", "true")]
[HttpPost("checkout")]
public ActionResult Checkout(Order order, [FromHeader] int priority)
{
    return Ok();
}
```

{{% /codetab %}}

{{< /tabs >}}

## Subscribing to Azure IoT Hub Events

Azure IoT Hub provides an [endpoint that is compatible with Event Hubs](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint), so the Azure Event Hubs pubsub component can also be used to subscribe to Azure IoT Hub events.

The device-to-cloud events created by Azure IoT Hub devices will contain additional [IoT Hub System Properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages), and the Azure Event Hubs pubsub component for Dapr will return the following as part of the response metadata:

| System Property Name | Description & Routing Query Keyword |
|----------------------|:------------------------------------|
| `iothub-connection-auth-generation-id` | The **connectionDeviceGenerationId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-auth-method` | The **connectionAuthMethod** used to authenticate the device that sent the message. |
| `iothub-connection-device-id` | The **deviceId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-module-id` | The **moduleId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-enqueuedtime` | The **enqueuedTime** in RFC3339 format that the device-to-cloud message was received by IoT Hub. |
| `message-id` | The user-settable AMQP **messageId**. |

For example, the headers of a delivered HTTP subscription message would contain:

```js
{
  'user-agent': 'fasthttp',
  'host': '127.0.0.1:3000',
  'content-type': 'application/json',
  'content-length': '120',
  'iothub-connection-device-id': 'my-test-device',
  'iothub-connection-auth-generation-id': '637618061680407492',
  'iothub-connection-auth-method': '{"scope":"module","type":"sas","issuer":"iothub","acceptingIpFilterRule":null}',
  'iothub-connection-module-id': 'my-test-module-a',
  'iothub-enqueuedtime': '2021-07-13T22:08:09Z',
  'message-id': 'my-custom-message-id',
  'x-opt-sequence-number': '35',
  'x-opt-enqueued-time': '2021-07-13T22:08:09Z',
  'x-opt-offset': '21560',
  'traceparent': '00-4655608164bc48b985b42d39865f3834-ed6cf3697c86e7bd-01'
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
- [Authentication to Azure]({{< ref "authenticating-azure.md" >}})
