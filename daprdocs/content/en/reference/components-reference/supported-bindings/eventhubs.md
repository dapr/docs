---
type: docs
title: "Azure Event Hubs binding spec"
linkTitle: "Azure Event Hubs"
description: "Detailed documentation on the Azure Event Hubs binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/eventhubs/"
---

## Component format

To setup an Azure Event Hubs binding, create a component of type `bindings.azure.eventhubs`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.microsoft.com/azure/event-hubs/event-hubs-dotnet-framework-getstarted-send) for instructions on how to set up an Event Hub.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.eventhubs
  version: v1
  metadata:
    # Hub name ("topic")
    - name: eventHub
      value: "mytopic"
    - name: consumerGroup
      value: "myapp"
    # Either connectionString or eventHubNamespace is required
    # Use connectionString when *not* using Azure AD
    - name: connectionString
      value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
    # Use eventHubNamespace when using Azure AD
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

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|------------|-----|---------|
| `eventHub` | Y* | Input/Output | The name of the Event Hubs hub ("topic"). Required if using Azure AD authentication or if the connection string doesn't contain an `EntityPath` value | `mytopic` |
| `connectionString`    | Y*  | Input/Output | Connection string for the Event Hub or the Event Hub namespace.<br>* Mutally exclusive with `eventHubNamespace` field.<br>* Required when not using [Azure AD Authentication]({{< ref "authenticating-azure.md" >}}) | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"` or `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key}"`
| `eventHubNamespace` | Y* | Input/Output | The Event Hub Namespace name.<br>* Mutally exclusive with `connectionString` field.<br>* Required when using [Azure AD Authentication]({{< ref "authenticating-azure.md" >}}) | `"namespace"`
| `enableEntityManagement` | N | Input/Output | Boolean value to allow management of the EventHub namespace and storage account. Default: `false` | `"true", "false"`
| `resourceGroupName` | N | Input/Output | Name of the resource group the Event Hub namespace is part of. Required when entity management is enabled | `"test-rg"`
| `subscriptionID` | N | Input/Output | Azure subscription ID value. Required when entity management is enabled | `"azure subscription id"`
| `partitionCount` | N | Input/Output | Number of partitions for the new Event Hub namespace. Used only when entity management is enabled. Default: `"1"` | `"2"`
| `messageRetentionInDays` | N | Input/Output | Number of days to retain messages for in the newly created Event Hub namespace. Used only when entity management is enabled. Default: `"1"` | `"90"`
| `consumerGroup` | Y | Input | The name of the [Event Hubs Consumer Group](https://docs.microsoft.com/azure/event-hubs/event-hubs-features#consumer-groups) to listen on | `"group1"` |
| `storageAccountName`  | Y  | Input | Storage account name to use for the checkpoint store. |`"myeventhubstorage"`
| `storageAccountKey`   | Y*  | Input | Storage account key for the checkpoint store account.<br>* When using Azure AD, it's possible to omit this if the service principal has access to the storage account too. | `"112233445566778899"`
| `storageConnectionString`   | Y*  | Input | Connection string for the checkpoint store, alternative to specifying `storageAccountKey` | `"DefaultEndpointsProtocol=https;AccountName=myeventhubstorage;AccountKey=<account-key>"`
| `storageContainerName` | Y | Input | Storage container name for the storage account name.  | `"myeventhubstoragecontainer"`

### Azure Active Directory (AAD) authentication

The Azure Event Hubs pub/sub component supports authentication using all Azure Active Directory mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of AAD authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

## Binding support

This component supports **output binding** with the following operations:

- `create`: publishes a new message to Azure Event Hubs

## Input Binding to Azure IoT Hub Events

Azure IoT Hub provides an [endpoint that is compatible with Event Hubs](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint), so Dapr apps can create input bindings to read Azure IoT Hub events using the Event Hubs bindings component.

The device-to-cloud events created by Azure IoT Hub devices will contain additional [IoT Hub System Properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-messages-construct#system-properties-of-d2c-iot-hub-messages), and the Azure Event Hubs binding for Dapr will return the following as part of the response metadata:

| System Property Name | Description & Routing Query Keyword |
|----------------------|:------------------------------------|
| `iothub-connection-auth-generation-id` | The **connectionDeviceGenerationId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-auth-method` | The **connectionAuthMethod** used to authenticate the device that sent the message. |
| `iothub-connection-device-id` | The **deviceId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-connection-module-id` | The **moduleId** of the device that sent the message. See [IoT Hub device identity properties](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-identity-registry#device-identity-properties). |
| `iothub-enqueuedtime` | The **enqueuedTime** in RFC3339 format that the device-to-cloud message was received by IoT Hub. |
| `message-id` | The user-settable AMQP **messageId**. |

For example, the headers of a HTTP `Read()` response would contain:

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
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
