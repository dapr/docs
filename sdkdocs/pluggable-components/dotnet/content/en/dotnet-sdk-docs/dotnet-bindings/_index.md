---
type: docs
title: "Implementing a .NET input/output binding component"
linkTitle: "Bindings"
weight: 1000
description: How to create an input/output binding with the Dapr pluggable components .NET SDK
no_list: true
is_preview: true
---

Creating a binding component requires just a few basic steps.

## Add bindings namespaces

Add `using` statements for the bindings related namespaces.

```csharp
using Dapr.PluggableComponents.Components;
using Dapr.PluggableComponents.Components.Bindings;
```

## Input bindings: Implement `IInputBinding`

Create a class that implements the `IInputBinding` interface.

```csharp
internal sealed class MyBinding : IInputBinding
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public async Task ReadAsync(MessageDeliveryHandler<InputBindingReadRequest, InputBindingReadResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        // Until canceled, check the underlying store for messages and deliver them to the Dapr runtime...
    }
}
```

Calls to the `ReadAsync()` method are "long-lived", in that the method is not expected to return until canceled (for example, via the `cancellationToken`). As messages are read from the underlying store of the component, they are delivered to the Dapr runtime via the `deliveryHandler` callback. Delivery allows the component to receive notification if/when the application (served by the Dapr runtime) acknowledges processing of the message.

```csharp
    public async Task ReadAsync(MessageDeliveryHandler<InputBindingReadRequest, InputBindingReadResponse> deliveryHandler, CancellationToken cancellationToken = default)
    {
        TimeSpan pollInterval = // Polling interval (e.g. from initalization metadata)...

        // Poll the underlying store until canceled...
        while (!cancellationToken.IsCancellationRequested)
        {
            var messages = // Poll underlying store for messages...

            foreach (var message in messages)
            {
                // Deliver the message to the Dapr runtime...
                await deliveryHandler(
                    new InputBindingReadResponse
                    {
                        // Set the message content...
                    },
                    // Callback invoked when application acknowledges the message...
                    async request =>
                    {
                        // Process response data or error message...
                    })
            }

            // Wait for the next poll (or cancellation)...
            await Task.Delay(pollInterval, cancellationToken);
        }
    }
```

## Output bindings: Implement `IOutputBinding`

Create a class that implements the `IOutputBinding` interface.

```csharp
internal sealed class MyBinding : IOutputBinding
{
    public Task InitAsync(MetadataRequest request, CancellationToken cancellationToken = default)
    {
        // Called to initialize the component with its configured metadata...
    }

    public Task<OutputBindingInvokeResponse> InvokeAsync(OutputBindingInvokeRequest request, CancellationToken cancellationToken = default)
    {
        // Called to invoke a specific operation...
    }

    public Task<string[]> ListOperationsAsync(CancellationToken cancellationToken = default)
    {
        // Called to list the operations that can be invoked.
    }
}
```

## Input and output binding components

A component can be _both_ an input _and_ output binding, simply by implementing both interfaces.

```csharp
internal sealed class MyBinding : IInputBinding, IOutputBinding
{
    // IInputBinding Implementation...

    // IOutputBinding Implementation...
}
```

## Register binding component

In the main program file (for example, `Program.cs`), register the binding component in an application service.

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        serviceBuilder.RegisterBinding<MyBinding>();
    });

app.Run();
```

{{% alert title="Note" color="primary" %}}
A component that implements both `IInputBinding` and `IOutputBinding` will be registered as both an input and output binding.
{{% /alert %}}

## Next steps

- [Learn advanced steps for the Pluggable Component .NET SDK]({{% ref "dotnet-advanced" %}})
- Learn more about using the Pluggable Component .NET SDK for:
  - [Pub/sub]({{% ref "dotnet-pub-sub" %}})
  - [State store]({{% ref "dotnet-state-store" %}})