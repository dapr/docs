---
type: docs
title: "Azure Events Hub"
linkTitle: "Azure Events Hub"
description: "Detailed documentation on the Azure Event Hubs pubsub component"
---

## Setup Azure Event Hubs

Follow the instructions [here](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-create) on setting up Azure Event Hubs.
Since this implementation uses the Event Processor Host, you will also need an [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal).

## Create a Dapr component

The next step is to create a Dapr component for Azure Event Hubs.

Create the following YAML file named `eventhubs.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.azure.eventhubs
  version: v1
  metadata:
  - name: connectionString
    value: <REPLACE-WITH-CONNECTION-STRING> # Required. "Endpoint=sb://****"
  - name: storageAccountName
    value: <REPLACE-WITH-STORAGE-ACCOUNT-NAME> # Required.
  - name: storageAccountKey
    value: <REPLACE-WITH-STORAGE-ACCOUNT-KEY> # Required.
  - name: storageContainerName
    value: <REPLACE-WITH-CONTAINER-NAME > # Required.
```

See [here](https://docs.microsoft.com/en-us/azure/event-hubs/authorize-access-shared-access-signature) on how to get the Event Hubs connection string. Note this is not the Event Hubs namespace.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Create consumer groups for each subscriber

For every Dapr app that wants to subscribe to events, create an Event Hubs consumer group with the name of the `dapr id`.
For example, a Dapr app running on Kubernetes with `dapr.io/app-id: "myapp"` will need an Event Hubs consumer group named `myapp`.

## Apply the configuration

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.

## Related links
- [Pub/Sub building block]({{< ref pubsub >}})