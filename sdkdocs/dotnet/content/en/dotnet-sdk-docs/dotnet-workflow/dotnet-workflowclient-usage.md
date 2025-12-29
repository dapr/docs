---
type: docs
title: "DaprWorkflowClient lifetime management and registration"
linkTitle: "DaprWorkflowClient registration"
weight: 1000
description: Learn how to configure the `DaprWorkflowClient` lifetime management and dependency injection
---

## Lifetime management

A `DaprWorkflowClient` holds access to networking resources in the form of TCP sockets used to communicate with the Dapr sidecar as well
as other types used in the management and operation of Workflows. `DaprWorkflowClient` implements `IAsyncDisposable` to support eager
cleanup of resources.

## Dependency Injection

The `AddDaprWorkflow()` method will register the Dapr workflow services with ASP.NET Core dependency injection. This method
requires an options delegate that defines each of the workflows and activities you wish to register and use in your application.

{{% alert title="Note" color="primary" %}} 

This method will attempt to register a `DaprClient` instance, but this will only work if it hasn't already been registered with another
lifetime. For example, an earlier call to `AddDaprClient()` with a singleton lifetime will always use a singleton regardless of the
lifetime chose for the workflow client. The `DaprClient` instance will be used to communicate with the Dapr sidecar and if it's not
yet registered, the lifetime provided during the `AddDaprWorkflow()` registration will be used to register the `DaprWorkflowClient`
as well as its own dependencies.

{{% /alert %}} 

### Singleton Registration

By default, the `AddDaprWorkflow` method registers the `DaprWorkflowClient` and associated services using a singleton lifetime. This means
that the services are instantiated only a single time.

The following is an example of how registration of the `DaprWorkflowClient` as it would appear in a typical `Program.cs` file:

```csharp
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<YourWorkflow>();
    options.RegisterActivity<YourActivity>();
});

var app = builder.Build();
await app.RunAsync();
```

### Scoped Registration

While this may generally be acceptable in your use case, you may instead wish to override the lifetime specified. This is done by passing a `ServiceLifetime`
argument in `AddDaprWorkflow`. For example, you may wish to inject another scoped service into your ASP.NET Core processing pipeline
that needs context used by the `DaprClient` that wouldn't be available if the former service were registered as a singleton.

This is demonstrated in the following example:

```csharp
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<YourWorkflow>();
    options.RegisterActivity<YourActivity>();
}, ServiceLifecycle.Scoped);

var app = builder.Build();
await app.RunAsync();
```

### Transient Registration

Finally, Dapr services can also be registered using a transient lifetime meaning that they will be initialized every time they're injected. This
is demonstrated in the following example:

```csharp
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<YourWorkflow>();
    options.RegisterActivity<YourActivity>();
}, ServiceLifecycle.Transient);

var app = builder.Build();
await app.RunAsync();
```

### Create a `DaprWorkflowClient` instance

{{< tabpane text=true >}}

{{% tab "ASP.Net Core App" %}}

In an ASP.Net Core application, you can inject the `DaprWorkflowClient` into methods or controllers via method or constructor injection. This example demonstrates method injection in a minimal API scenario:

```csharp
app.MapPost("/start", async (
    [FromServices] DaprWorkflowClient daprWorkflowClient,
    Order order
    ) => {
        var instanceId = await daprWorkflowClient.ScheduleNewWorkflowAsync(
            nameof(OrderProcessingWorkflow),
            input: order);

        return Results.Accepted(instanceId);
});
```

{{% /tab %}}

{{% tab "Console App" %}}

To create a `DaprWorkflowClient` instance in a console app, retrieve it from the `ServiceProvider`:

```csharp
using var scope = host.Services.CreateAsyncScope();
var daprWorkflowClient = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();
```

{{% /tab %}}

{{< /tabpane >}}

Now, you can use this client to perform workflow management operations such as starting, pausing, resuming, and terminating a workflow instance. See [Workflow management operations with `DaprWorkflowClient`]({{% ref dotnet-workflow-management-methods.md %}}) for more information on these operations.

## Injecting Services into Workflow Activities

Workflow activities support the same dependency injection that developers have come to expect of modern C# applications. Assuming a proper
registration at startup, any such type can be injected into the constructor of the workflow activity and available to utilize during
the execution of the workflow. This makes it simple to add logging via an injected `ILogger` or access to other Dapr 
building blocks by injecting `DaprClient` or `DaprJobsClient`, for example.

```csharp
internal sealed class SquareNumberActivity : WorkflowActivity<int, int>
{
    private readonly ILogger _logger;
    
    public MyActivity(ILogger logger)
    {
        this._logger = logger;
    }
    
    public override Task<int> RunAsync(WorkflowActivityContext context, int input) 
    {
        this._logger.LogInformation("Squaring the value {number}", input);
        var result = input * input;
        this._logger.LogInformation("Got a result of {squareResult}", result);
        
        return Task.FromResult(result);
    }
}
```

### Using ILogger in Workflow

Because workflows must be deterministic, it is not possible to inject arbitrary services into them. For example, 
if you were able to inject a standard `ILogger` into a workflow and it needed to be replayed because of an error,
subsequent replay from the event source log would result in the log recording additional operations that didn't actually
take place a second or third time because their results were sourced from the log. This has the potential to introduce 
a significant amount of confusion. Rather, a replay-safe logger is made available for use within workflows. It will only 
log events the first time the workflow runs and will not log anything whenever the workflow is being replaced.

This logger can be retrieved from a method present on the `WorkflowContext` available on your workflow instance and
otherwise used precisely as you might otherwise use an `ILogger` instance.

An end-to-end sample demonstrating this can be seen in the 
[.NET SDK repository](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Workflows/OrderProcessingWorkflow.cs)
but a brief extraction of this sample is available below.

```csharp
public class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
{
    public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
    {
        string orderId = context.InstanceId;
        var logger = context.CreateReplaySafeLogger<OrderProcessingWorkflow>(); //Use this method to access the logger instance

        logger.LogInformation("Received order {orderId} for {quantity} {name} at ${totalCost}", orderId, order.Quantity, order.Name, order.TotalCost);
        
        //...
    }
}
```

## Workflow Serialization
With the 1.17 release of the `Dapr.Workflow` SDK, serialization has been improved and support both custom serialization
options via the `JsonSerializerOptions` provided with `System.Text.Json` (used by default still), but also supports
registering custom serialization providers (e.g. MessagePack or BSON).

{{% alert title="Warning" color="warning" %}}
Do note that using this functionality may result in a breaking change for any existing workflows as there is no 
supported migration from one serialization implementation to another.

Further, all SDKs are using a standard JSON convention out of the box. If you change the serialization style or even
swap out serialization providers altogether in your .NET workflows and activities, you'll likely find that mutli-app
workflows will break as the other SDKs do not necessarily support pluggable serialization as well.
{{% /alert %}}

### Standard JSON Configuration
The standard convention adopted in `Dapr.Workflow` is to utilize the built-in `System.Text.Json` serializer with the
`JsonSerializerDefaults.Web` conventions [described here](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-10.0).
This means that out of the box:
- Property names are treated as case-sensitive
- "camelCase" formatting is used for property names
- Quoted numbers (JSON strings for number properties) are allowed

This approach should be compatible with the other Dapr language SDKs out of the box meaning that scenarios involving
multi-app run (e.g. invocation of workflows and activities from other languages) should not be impacted.

### Overriding System.Text.Json defaults
There may be scenarios in which you wish to override the default JSON serialization options used by the SDK. To do so,
you'll need to use a different way to register the Dapr Workflow client than the standard approach:

```csharp
var services = new ServiceCollection();

services
    .AddDaprWorkflowBuilder(opt => 
    {
        opt.RegisterWorkflow<MyWorkflow>();
        opt.RegisterActivity<MyActivity>();
    })
    .WithJsonSerializer(new JsonSerializerOptions { PropertyNamingPolicy = null });
```

This will ensure that all invocations of the `DaprWorkflowClient` within your application will instead use the provided
`JsonSerializerOptions` when serializing and deserializing workflow and activity data.

### Custom Serialization Providers
Custom serialization providers can be written and registered to be used in place of the built-in `System.Text.Json`
serializer. Such providers must implement the `IWorkflowSerializer` interface. The following shows what a sample
implementation of a custom MessagePack serializer provider might resemble:

```csharp
public sealed class MessagePackWorkflowSerializer(MessagePackSerializerOptions options) : IWorkflowSerializer
{
    /// <inheritdoc/>
    public string Serialize(object? value, Type? inputType = null)
    {
        if (value == null)
            return string.Empty;

        // Serialize to binary using MessagePack
        var targetType = inputType ?? value.GetType();
        var bytes = MessagePackSerializer.Serialize(targetType, value, _options);
        
        // Convert binary to Base64 string for transport
        return Convert.ToBase64String(bytes);
    }

    /// <inheritdoc/>
    public T? Deserialize<T>(string? data)
    {
        return (T?)Deserialize(data, typeof(T));
    }

    /// <inheritdoc/>
    public object? Deserialize(string? data, Type returnType)
    {
        if (returnType == null)
            throw new ArgumentNullException(nameof(returnType));

        if (string.IsNullOrEmpty(data))
            return default;

        try
        {
            // Convert Base64 string back to binary
            var bytes = Convert.FromBase64String(data);
            
            // Deserialize from MessagePack binary format
            return MessagePackSerializer.Deserialize(returnType, bytes, _options);
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException(
                "Failed to decode Base64 data. The input may not be valid MessagePack-serialized data.", 
                ex);
        }
        catch (MessagePackSerializationException ex)
        {
            throw new InvalidOperationException(
                $"Failed to deserialize data to type {returnType.FullName}.", 
                ex);
        }
    }
}
```

The provider must then be registered so it's used by the Dapr Workflow client:
```csharp
services.AddDaprWorkflowBuilder(opt => 
    {
        // ...
    })
    .WithSerializer(new MessagePackWorkflowSerializer());
```

It's possible that additional information needs to be injected into the custom serialization provider to affect its 
configuration, so an overload is available that provides an `IServiceProvider`:

```csharp
services.AddDaprWorkflowBuilder(opt => 
    {
        // ...
    })
    .WithSerializer(serviceProvider => 
    {
        var options = (serviceProvider.GetRequiredService<IOptions<MessagePackOptions>>()).Value;
        return new MessagePackWorkflowSerializer(options);        
    });
```

## Next steps

- [Learn more about Dapr workflow management operations]({{% ref dotnet-workflow-management-methods.md %}})
- [Learn how to author workflows and activities]({{% ref howto-author-workflow.md %}})  
