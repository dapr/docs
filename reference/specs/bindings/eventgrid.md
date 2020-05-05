# Azure Event Grid Binding Spec

See [this](https://docs.microsoft.com/en-us/azure/event-grid/) for Azure Event Grid documentation.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventgrid
  metadata:
  # Required Input Binding Metadata
  - name: tenantId
    value: "[AzureTenantId]"
  - name: subscriptionId
    value: "[AzureSubscriptionId]"
  - name: clientId
    value: "[ClientId]"
  - name: clientSecret
    value: "[ClientSecret]"
  - name: subscriberEndpoint
    value: "[SubscriberEndpoint]"    
  - name: handshakePort
    value: [HandshakePort]
  - name: scope
    value: "[Scope]"

  # Optional Input Binding Metadata
  - name: eventSubscriptionName
    value: "[EventSubscriptionName]"

  # Required Output Binding Metadata
  - name: accessKey
    value: "[AccessKey]"
  - name: topicEndpoint
    value: "[TopicEndpoint]
```

## Input Binding Metadata
- `tenantId` is the Azure tenant id in which this Event Grid Event Subscription should be created

- `subscriptionId` is the Azure subscription id in which this Event Grid Event Subscription should be created

- `clientId` is the client id that should be used by the binding to create or update the Event Grid Event Subscription

- `clientSecret`  is the client secret that should be used by the binding to create or update the Event Grid Event Subscription

- `subscriberEndpoint` is the https (required) endpoint in which Event Grid will handshake and send Cloud Events. If you aren't re-writing URLs on ingress, it should be in the form of: `https://[YOUR HOSTNAME]/api/events` If testing on your local machine, you can use something like [ngrok](https://ngrok.com) to create a public endpoint. 

- `handshakePort` is the container port that the input binding will listen on for handshakes and events

- `scope` is the identifier of the resource to which the event subscription needs to be created or updated. The scope can be a subscription, or a resource group, or a top level resource belonging to a resource provider namespace, or an Event Grid topic. For example:
    - '/subscriptions/{subscriptionId}/' for a subscription
    - '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}' for a resource group
    - '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}' for a resource
    - '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}' for an Event Grid topic
    > Values in braces {} should be replaced with actual values.

- `eventSubscriptionName` (Optional) is the name of the event subscription. Event subscription names must be between 3 and 64 characters in length and should use alphanumeric letters only.

## Output Binding Metadata
- `accessKey` is the Access Key to be used for publishing an Event Grid Event to a custom topic

- `topicEndpoint` is the topic endpoint in which this output binding should publish events

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)
