---
type: docs
title: "Azure Event Hubs"
linkTitle: "Azure Event Hubs"
description: "Detailed documentation on the Azure Event Hubs pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## Component format
To setup Azure Event Hubs pubsub create a component of type `pubsub.azure.eventhubs`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.
Apart from the configuration metadata fields shown below, Azure Event Hubs also supports [Azure Authentication]({{< ref "authenticating-azure.md" >}}) mechanisms. 

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
  - name: connectionString    # Either connectionString or eventHubNamespace. Should not be used when 
  # Azure Authentication mechanism is used.
    value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
  - name: eventHubNamespace   # Either connectionString or eventHubNamespace. Should be used when 
  # Azure Authentication mechanism is used.
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
  ## Subscriber attributes
  - name: storageAccountName
    value: "myeventhubstorage"
  - name: storageAccountKey
    value: "112233445566778899"
  - name: storageContainerName
    value: "myeventhubstoragecontainer"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

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

### Azure Active Directory (AAD) authentication
The Azure Event Hubs pubsub component supports authentication using all Azure Active Directory mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of AAD authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

#### Example Configuration
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
    ## The following four properties are needed only if enableEntityManagement is set to true
  - name: resourceGroupName
    value: "test-rg"
  - name: subscriptionID
    value: "value of Azure subscription ID"
  - name: partitionCount
    value: "1"
  - name: messageRetentionInDays
  ## Subscriber attributes
  - name: storageAccountName
    value: "myeventhubstorage"
  - name: storageAccountKey
    value: "112233445566778899"
  - name: storageContainerName
    value: "myeventhubstoragecontainer"
```

## Create an Azure Event Hub

Follow the instructions [here](https://docs.microsoft.com/azure/event-hubs/event-hubs-create) on setting up Azure Event Hubs.
Since this implementation uses the Event Processor Host, you will also need an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal). Follow the instructions [here](https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage) to manage the storage account access keys.

See [here](https://docs.microsoft.com/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string. Note this is not the Event Hubs namespace.

### Create consumer groups for each subscriber

For every Dapr app that wants to subscribe to events, create an Event Hubs consumer group with the name of the `dapr id`.
For example, a Dapr app running on Kubernetes with `dapr.io/app-id: "myapp"` will need an Event Hubs consumer group named `myapp`.

Note: Dapr passes the name of the Consumer group to the EventHub and so this is not supplied in the metadata.

## Entity Management

When entity management is enabled in configuration, as long as the application has the right role and permissions to manipulate the Event Hub namespace, creation of Event Hubs and consumer groups can be done on the fly. 

The Evet Hub name is the `topic` field in the incoming request to publish or subscribe to, while the consumer group name is the name of the `dapr app` which subscribes to a given Event Hub. For example, a Dapr app running on Kubernetes with name `dapr.io/app-id: "myapp"` requires an Event Hubs consumer group named `myapp`.

Entity management is only possible when using [Azure Authentication]({{< ref "authenticating-azure.md" >}}) mechanisms and not via `connectionString`.

Note: Dapr passes the name of the Consumer group to the EventHub and this is not supplied in the metadata.

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
