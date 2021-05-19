---
type: docs
title: "Azure Events Hub"
linkTitle: "Azure Events Hub"
description: "Detailed documentation on the Azure Event Hubs pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-azure-eventhubs/"
---

## Component format
To setup Azure Event Hubs pubsub create a component of type `pubsub.azure.eventhubs`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

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
  - name: connectionString
    value: "Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"
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
| connectionString    | Y  | Connection-string for the Event Hubs  | `"Endpoint=sb://{EventHubNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={EventHub}"`
| storageAccountName  | Y  | Storage account name to use for the EventProcessorHost   |`"myeventhubstorage"`
| storageAccountKey   | Y  | Storage account key  to use for the EventProcessorHost. Can be `secretKeyRef` to use a secret reference   | `"112233445566778899"`
| storageContainerName | Y | Storage container name for the storage account name.  | `"myeventhubstoragecontainer"`


## Create an Azure Event Hub

Follow the instructions [here](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-create) on setting up Azure Event Hubs.
Since this implementation uses the Event Processor Host, you will also need an [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal). Follow the instructions [here](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage) to manage the storage account access keys.

See [here](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string. Note this is not the Event Hubs namespace.

### Create consumer groups for each subscriber

For every Dapr app that wants to subscribe to events, create an Event Hubs consumer group with the name of the `dapr id`.
For example, a Dapr app running on Kubernetes with `dapr.io/app-id: "myapp"` will need an Event Hubs consumer group named `myapp`.

Note: Dapr passes the name of the Consumer group to the EventHub and so this is not supplied in the metadata.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
