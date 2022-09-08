---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "Detailed documentation on the Azure Event Hubs pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---


## Component Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs-pubsub
  namespace: default
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:  
  # Authentication with ConnectionString
  - name: connectionString    # use either connectionString or eventHubNamespace.
    value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
  # Authentication with Azure
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
    ## The following four properties are needed only if enableEntityManagement is set to true
  - name: resourceGroupName
    value: "test-rg"
  - name: subscriptionID
    value: "value of Azure subscription ID"
  - name: partitionCount
    value: "1"
  - name: messageRetentionInDays
  # Other
  - name: messageRetentionInDays
    value: "7" # default on standard plan
  - name: storageAccountName
    value: "myeventhubstorage"
  - name: storageAccountKey
    value: "112233445566778899"
  - name: storageContainerName
    value: "myeventhubstoragecontainer"
```


## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| connectionString    | Y*  | Connection-string for the Event Hub or the Event Hub namespace. *Mutally exclusive with `eventHubNamespace` field. *Not to be used when [Azure Authentication]({{< ref "authenticating-azure.md" >}}) is used | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` or `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key}"`
| eventHubNamespace | N* | The Event Hub Namespace name. *Mutally exclusive with `connectionString` field. *To be used when [Azure Authentication]({{< ref "authenticating-azure.md" >}}) is used | `"namespace"` 
| storageAccountName  | Y  | Storage account name to use for the EventProcessorHost   |`"myeventhubstorage"`
| storageAccountKey   | Y*  | Storage account key  to use for the EventProcessorHost. Can be `secretKeyRef` to use a secret reference. *Omit if using [Azure Authentication]({{< ref "authenticating-azure.md" >}}) and AAD authentication to the storage account is preferred.    | `"112233445566778899"`
| storageContainerName | Y | Storage container name for the storage account name.  | `"myeventhubstoragecontainer"`
| enableEntityManagement | N | Boolean value to allow management of EventHub namespace. Default: `false` | `"true", "false"`
| resourceGroupName | N | Name of the resource group the event hub namespace is a part of. Needed when entity management is enabled | `"test-rg"`
| subscriptionID | N | Azure subscription ID value. Needed when entity management is enabled | `"azure subscription id"`
| partitionCount | N | Number of partitions for the new event hub. Only used when entity management is enabled. Default: `"1"` | `"2"`
| messageRetentionInDays | N | Number of days to retain messages for in the newly created event hub. Used only when entity management is enabled. Default: `"1"` | `"90"`

## Component format

To setup Azure Event Hubs pubsub create a component of type `pubsub.azure.eventhubs`. 

> See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

{{% alert title="Topic Name" color="primary" %}}
Dapr requires the notion of topics. However, in a PubSub systems this does not exists (as it uses partitions instead). To work around this, Dapr utilizes the **Event Hub Name as the Topic Name** which will be found in the `topic` field in the event.
{{% /alert %}}

The Azure Event Hubs pubsub component supports two authentication mechanisms: 
* Connection String
* [Azure AAD Authentication]({{< ref authenticating-azure.md >}})

{{% alert title="Entity Management" color="primary" %}}
When using AAD Authentication, Dapr also supports **Entity Management**. This means that when configured correctly, Dapr will manipulate the Event Hub Namespace, creation of Event Hubs and Consumer Groups.
{{% /alert %}}

## Getting Started

To get started, follow these steps to use the Azure Event Hub component

{{% alert title="Warning" color="warning" %}}
It is important to follow the creation of an Azure Event Hub account correctly as Dapr requires certain aspects to be configured.
{{% /alert %}}

### 1. Create an Azure Storage Account

Dapr utilizes the Event Processor Host so an Azure Storage Account is required:

1. Create an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal) resource (required since Dapr uses the `Event Processor Host`)
2. [Copy the Storage Account Keys](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage)

### 2. Create and Configure Azure Event Hubs

1. Create an [Azure Event Hub Namespace](https://docs.microsoft.com/azure/event-hubs/event-hubs-create) resource
2. Create an `Event Hub` in the created namespace from step 1
3. Create a Consumer Group for each app that wants to subscribe
   1. The name of this consumer group equals the app id passed by the Dapr Run CLI flag `--app-id` or Kubernetes flag `dapr.io/app-id` (e.g. `dapr run --app-id example` or `dapr.io/app-id: "example"` requires a consumer group named `example`)
4. Decide which authentication mechanism to use (see example below)
   1. [Azure Authentication]({{< ref authenticating-azure.md >}})
   2. [Connection String]((https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature)) (copy the Connection String for the Event Hub from the Namespace or create a Shared Access Policy on the event hub itself (this will then include `EntityPath={EventHub}`).

{{% alert title="Warning" color="warning" %}}
When setting up an Azure Event Hub with the basic sku you will only have 1 consumer group available (named `$Default`). This means your app will be limited to using `--app-id '$Default'`!
{{% /alert %}}

## Azure IoT Hub Support

Azure IoT Hub provides an [endpoint that is compatible with Event Hubs](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint), so the Azure Event Hubs pubsub component can also be used to subscribe to Azure IoT Hub events.

### IoT Hub System Properties

Beside only sending data, IoT Hub `device-to-cloud events` also contain additional [IoT Hub System Properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages). Dapr supports these and will return the following as part of the response metadata:

| System Property Name | Description & Routing Query Keyword |
|----------------------|:------------------------------------|
| `iothub-connection-auth-generation-id` | The **connectionDeviceGenerationId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-auth-method` | The **connectionAuthMethod** used to authenticate the device that sent the message. |
| `iothub-connection-device-id` | The **deviceId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-module-id` | The **moduleId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-enqueuedtime` | The **enqueuedTime** in RFC3339 format that the device-to-cloud message was received by IoT Hub. |
| `message-id` | The user-settable AMQP **messageId**. |

For example, the headers of a delivered HTTP subscription message would contain:

```nodejs
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
