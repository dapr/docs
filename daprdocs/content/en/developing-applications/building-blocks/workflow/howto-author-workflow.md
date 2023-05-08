---
type: docs
title: "How to: Author a workflow"
linkTitle: "How to: Author workflows"
weight: 5000
description: "Learn how to develop and author workflows"
---

This article provides a high-level overview of how to author workflows that are executed by the Dapr Workflow engine.

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the workflow quickstart]({{< ref workflow-quickstart.md >}}) for a quick walk-through on how to use workflows.

{{% /alert %}}


## Author workflows as code

Dapr Workflow logic is implemented using general purpose programming languages, allowing you to:

- Use your preferred programming language (no need to learn a new DSL or YAML schema).
- Have access to the language’s standard libraries.
- Build your own libraries and abstractions.
- Use debuggers and examine local variables.
- Write unit tests for your workflows, just like any other part of your application logic.

The Dapr sidecar doesn’t load any workflow definitions. Rather, the sidecar simply drives the execution of the workflows, leaving all the workflow activities to be part of the application.

## Write the workflow activities

Define the workflow activities you'd like your workflow to perform. Activities are a class definition and can take inputs and outputs. Activities also participate in dependency injection, like binding to a Dapr client.

{{< tabs ".NET" Python >}}

{{% codetab %}}

Continuing the ASP.NET order processing example, the `OrderProcessingWorkflow` class is derived from a base class called `Workflow` with input and output parameter types. 

It also includes a `RunAsync` method that does the heavy lifting of the workflow and calls the workflow activities. The activities called in the example are:
- `NotifyActivity`: Receive notification of a new order.
- `ReserveInventoryActivity`: Check for sufficient inventory to meet the new order.
- `ProcessPaymentActivity`: Process payment for the order. Includes `NotifyActivity` to send notification of successful order.

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

{{% /codetab %}}

{{% codetab %}}

<!--python-->

[In the following example](todo), for a basic Python order processing application using the Python SDK, your project code would include:

- A Python package called `DaprClient` to receive the Python SDK capabilities
- A builder with an extension method called `todo`
  - This will allow you to register workflows and workflow activities (tasks that workflows can schedule)
- HTTP API calls to start, pause, resume, terminate, and purge the workflow.
 
```python
todo
```


{{% /codetab %}}

{{< /tabs >}}

## Write the workflow

Compose the workflow activities into a workflow. 

{{< tabs ".NET" Python >}}

{{% codetab %}}

<!--csharp-->

[In the following example](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs), for a basic ASP.NET order processing application using the .NET SDK, your project code would include:

- A NuGet package called `Dapr.Workflow` to receive the .NET SDK capabilities
- A builder with an extension method called `AddDaprWorkflow`
  - This will allow you to register workflows and workflow activities (tasks that workflows can schedule)
- HTTP API calls
  - One for submitting a new order
  - One for checking the status of an existing order

```csharp
using Dapr.Workflow;
//...

// Dapr Workflows are registered as part of the service configuration
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

{{% /codetab %}}

{{% codetab %}}

<!--python-->

[In the following example](todo), for a basic Python order processing application using the Python SDK, your project code would include:

- A Python package called `DaprClient` to receive the Python SDK capabilities
- A builder with an extension method called `todo`
  - This will allow you to register workflows and workflow activities (tasks that workflows can schedule)
- HTTP API calls to start, pause, resume, terminate, and purge the workflow.
 
```python
from dapr.clients import DaprClient

from dapr.clients.grpc._helpers import to_bytes
# ...

# Dapr Workflows are registered as part of the service configuration
with DaprClient() as d:
    instanceId = "RRLINSTANCEID35"
    workflowComponent = "dapr"
    workflowName = "PlaceOrder"
    workflowOptions = dict()
    workflowOptions["task_queue"] =  "testQueue"
    inventoryItem = ("Computers", 5, 10)
    item2 = "paperclips"

    encoded_data = b''.join(bytes(str(element), 'UTF-8') for element in item2)
    encoded_data2 = json.dumps(item2).encode("UTF-8")

    # ...

    # Start the workflow
    start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                     workflow_name=workflowName, input=encoded_data2, workflow_options=workflowOptions)
    print(f"Attempting to start {workflowName}")
    print(f"start_resp {start_resp.instance_id}")
    # Get workflow status
    getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    print(f"Get response from {workflowName} after start call: {getResponse.runtime_status}")
```


{{% /codetab %}}


{{< /tabs >}}


{{% alert title="Important" color="warning" %}}
Because of how replay-based workflows execute, you'll write logic that does things like I/O and interacting with systems **inside activities**. Meanwhile, the **workflow method** is just for orchestrating those activities.

{{% /alert %}}

## Next steps

Now that you've authored a workflow, learn how to manage it.

{{< button text="Manage workflows >>" page="howto-manage-workflow.md" >}}

## Related links
- [Workflow overview]({{< ref workflow-overview.md >}})
- [Workflow API reference]({{< ref workflow_api.md >}})
- Try out the full SDK examples:
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Python example](todo)
