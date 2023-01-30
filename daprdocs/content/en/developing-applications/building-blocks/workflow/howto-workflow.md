---
type: docs
title: "How to: Use a workflow"
linkTitle: "How to: Use workflows"
weight: 2000
description: Integrate, manage, and expose workflows
---

Now that you've read about [the Workflow building block]({{< ref workflow-overview >}}), let's dive into how you can:

- Write the workflow into your application code
- Run the workflow using HTTP API calls

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the .NET SDK Workflow example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow) for a quick walk-through on how to use the service invocation API.

{{% /alert %}}

When you run `dapr init`, Dapr creates a default workflow runtime written in Go that implements workflow instances as actors to promote placement and scalability. 

## Register the workflow

To start using the workflow building block, you simply write the workflow details directly into your application code. [In the following example](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowWebApp/Program.cs), for a basic ASP.NET order processing application using the .NET SDK, your project code would include:

- A NuGet package called `Dapr.Workflow` to receive the .NET SDK capabilities
- A builder with an extension method called `AddDaprWorkflow`
  - This will allow you to register workflows and workflow activities (tasks that workflows can schedule)
- HTTP API calls
  - One for submitting a new order
  - One for checking the status of an existing order

```csharp
using Dapr.Workflow;
//...

// Dapr workflows are registered as part of the service configuration
builder.Services.AddDaprWorkflow(options =>
{
    // Note that it's also possible to register a lambda function as the workflow
    // or activity implementation instead of a class.
    options.RegisterWorkflow<OrderProcessingWorkflow>();

    // These are the activities that get invoked by the workflow(s).
    options.RegisterActivity<NotifyActivity>();
    options.RegisterActivity<ReserveInventoryActivity>();
    options.RegisterActivity<ProcessPaymentActivity>();
});

WebApplication app = builder.Build();

// POST starts new order workflow instance
app.MapPost("/orders", async (WorkflowEngineClient client, [FromBody] OrderPayload orderInfo) =>
{
    if (orderInfo?.Name == null)
    {
        return Results.BadRequest(new
        {
            message = "Order data was missing from the request",
            example = new OrderPayload("Paperclips", 99.95),
        });
    }

//...
});

// GET fetches state for order workflow to report status
app.MapGet("/orders/{orderId}", async (string orderId, WorkflowEngineClient client) =>
{
    WorkflowState state = await client.GetWorkflowStateAsync(orderId, true);
    if (!state.Exists)
    {
        return Results.NotFound($"No order with ID = '{orderId}' was found.");
    }

    var httpResponsePayload = new
    {
        details = state.ReadInputAs<OrderPayload>(),
        status = state.RuntimeStatus.ToString(),
        result = state.ReadOutputAs<OrderResult>(),
    };

//...
}).WithName("GetOrderInfoEndpoint");

app.Run();
```

## Register the workflow activities

Next, you'll define the workflow activities you'd like your workflow to perform. Activities are a class definition and can take inputs and outputs. Activities also participate in dependency injection, like a class constructor to access the logger for ASP.NET or binding to a Dapr client.

Continuing the ASP.NET order processing example, the `OrderProcessingWorkflow` class is derived from a base class called `Workflow` with input and output parameter types. 

It also includes a `RunAsync` method that will do the heavy lifting of the workflow and call the workflow activities. The activities called in the example are:
- `NotifyActivity`: Receive notification of a new order
- `ReserveInventoryActivity`: Check for sufficient inventory to meet the new order
- `ProcessPaymentActivity`: Process payment for the order. Includes `NotifyActivity` to send notification of successful order

```csharp
 class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
    {
        public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
        {
            //...

            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Received order {orderId} for {order.Name} at {order.TotalCost:c}"));

            //...

            InventoryResult result = await context.CallActivityAsync<InventoryResult>(
                nameof(ReserveInventoryActivity),
                new InventoryRequest(RequestId: orderId, order.Name, order.Quantity));
            //...
            await context.CallActivityAsync(
                nameof(ProcessPaymentActivity),
                new PaymentRequest(RequestId: orderId, order.TotalCost, "USD"));

            await context.CallActivityAsync(
                nameof(NotifyActivity),
                new Notification($"Order {orderId} processed successfully!"));

            // End the workflow with a success result
            return new OrderResult(Processed: true);
        }
    }
```


{{% alert title="Important" color="primary" %}}
Because of how replay-based workflows execute, you'll write most logic that does things like IO and interacting with systems **inside activities**. Meanwhile, **workflow method** is just for orchestrating those activities.

{{% /alert %}}

## Run the workflow

Now that you've set up the workflow and its activities in your application, it's time to run alongside the Dapr sidecar. For a .NET application:

```bash
dapr run --app-id <your application app ID> dotnet run
```

Next, run your workflow using the following HTTP API methods. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

### Start

To start your workflow, run:

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/start
```

### Terminate

To terminate your workflow, run:

```bash
POST http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}/terminate
```

### Get metadata

To fetch workflow outputs and inputs, run:

```bash
GET http://localhost:3500/v1.0/workflows/{workflowType}/{instanceId}
```

## Next steps

- Learn more about [authoring workflows for the built-in engine component]()
- Learn more about [supported workflow components]()

