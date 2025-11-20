---
type: docs
title: "Implementing a .NET pub/sub component"
linkTitle: "Pub/sub"
weight: 1000
description: How to create a pub/sub with the Dapr pluggable components .NET SDK
no_list: true
is_preview: true
---

Creating a pub/sub component requires just a few basic steps.

## Add pub/sub namespaces

Add `using` statements for the pub/sub related namespaces.

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.PubSub;
```

## Implement `IPubSub`

Create a class that implements the `IPubSub` interface.

```csharp
internal sealed class MyPubSub : IPubSub
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public Task PublishAsync(PubSubPublishRequest request, CancellationToken cancellationToken = default)
    {
        // Send the message to the "topic"...
    }

    public Task PullMessagesAsync(PubSubPullMessagesTopic topic, MessageDeliveryHandler<string?, PubSubPullMessagesResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        // Until canceled, check the topic for messages and deliver them to the Dapr runtime...
    }
}
```

Calls to the `PullMessagesAsync()` method are "long-lived", in that the method is not expected to return until canceled (for example, via the `cancellationToken`). The "topic" from which messages should be pulled is passed via the `topic` argument, while the delivery to the Dapr runtime is performed via the `deliveryHandler` callback. Delivery allows the component to receive notification if/when the application (served by the Dapr runtime) acknowledges processing of the  message.

```csharp
    public async Task PullMessagesAsync(PubSubPullMessagesTopic topic, MessageDeliveryHandler<string?, PubSubPullMessagesResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        TimeSpan pollInterval = // Polling interval (e.g. from initalization metadata)...

        // Poll the topic until canceled...
        while (!cancellationToken.IsCancellationRequested)
        {
            var messages = // Poll topic for messages...

            foreach (var message in messages)
            {
                // Deliver the message to the Dapr runtime...
                await deliveryHandler(
                    new PubSubPullMessagesResponse(topicName)
                    {
                        // Set the message content...
                    },
                    // Callback invoked when application acknowledges the message...
                    async errorMessage =>
                    {
                        // An empty message indicates the application successfully processed the message...
                        if (String.IsNullOrEmpty(errorMessage))
                        {
                            // Delete the message from the topic...
                        }
                    })
            }

            // Wait for the next poll (or cancellation)...
            await Task.Delay(pollInterval, cancellationToken);
        }
    }
```

## Register pub/sub component

In the main program file (for example, `Program.cs`), register the pub/sub component with an application service.

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterPubSub<MyPubSub>();
    });

app.Run();
```

## Next steps

- [Learn advanced steps for the Pluggable Component .NET SDK]({{% ref "dotnet-advanced" %}})
- Learn more about using the Pluggable Component .NET SDK for:
  - [Bindings]({{% ref "dotnet-bindings" %}})
  - [State store]({{% ref "dotnet-state-store" %}})