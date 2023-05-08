---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 6000
description: Manage and run workflows
---

Now that you've [authored the workflow and its activities in your application]({{< ref howto-author-workflow.md >}}), you can start, terminate, and get information about the workflow using HTTP API calls. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

{{< tabs ".NET SDK" HTTP >}}

<!--NET-->
{{% codetab %}}

Manage your workflow within your code. In the `OrderProcessingWorkflow` example from the [Author a workflow]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) guide, the workflow is registered in the code. You can now start, terminate, and get information about a running workflow:

```csharp
string orderId = "exampleOrderId";
string workflowComponent = "dapr";
string workflowName = "OrderProcessingWorkflow";
OrderPayload input = new OrderPayload("Paperclips", 99.95);
Dictionary<string, string> workflowOptions; // This is an optional parameter
CancellationToken cts = CancellationToken.None;

// Start the workflow. This returns back a "WorkflowReference" which contains the instanceID for the particular workflow instance.
WorkflowReference startResponse = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, input, workflowOptions, cts);

// Get information on the workflow. This response will contain information such as the status of the workflow, when it started, and more!
GetWorkflowResponse getResponse = await daprClient.GetWorkflowAsync(orderId, workflowComponent, workflowName);

// Terminate the workflow
GetWorkflowResponse getResponse = await daprClient.TerminateWorkflowAsync(orderId, workflowComponent, cts);

// Raise an event (an incoming purchase order) that your workflow will wait for. This returns the item waiting to be purchased.
GetWorkflowResponse getResponse = await daprClient.RaiseWorkflowEventAsync(orderId, workflowComponent, workflowName, input, cts);

// Pause
GetWorkflowResponse getResponse = await daprClient.PauseWorkflowAsync(orderId, workflowComponent, cts);

// Resume
GetWorkflowResponse getResponse = await daprClient.ResumeWorkflowAsync(orderId, workflowComponent, cts);

// Purge
GetWorkflowResponse getResponse = await daprClient.PurgeWorkflowAsync(orderId, workflowComponent, cts);
```

{{% /codetab %}}

<!--HTTP-->
{{% codetab %}}

Manage your workflow using HTTP calls. The example below plugs in the properties from the [Author a workflow example]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) with a random instance ID number.

### Start workflow

To start your workflow with an ID `12345678`, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678
```

Note that workflow instance IDs can only contain alphanumeric characters, underscores, and dashes.

### Terminate workflow

To terminate your workflow with an ID `12345678`, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/terminate
```

### Raise an event

Run the following for your workflow to create "wait for external event" tasks that:

1. Subscribe to external events.
1. Await those tasks to block execution until the event is received.

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

> An `eventName` can be any function. 

### Pause or resume a workflow

To plan for down-time, wait for inputs, and more, you can pause and then resume a workflow. To stop a workflow with an ID `12345678` until triggered to resume, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/pause
```

To resume a workflow with an ID `12345678`, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/resume
```

### Purge a workflow 

To remove actor state from your state store and avoid overloading your state stores, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/purge
```

### Get information about a workflow

To fetch workflow information (outputs and inputs) with an ID `12345678`, run:

```bash
GET http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678
```

Learn more about these HTTP calls in the [workflow API reference guide]({{< ref workflow_api.md >}}).


{{% /codetab %}}

{{< /tabs >}}


## Next steps
- [Try out the Workflow quickstart]({{< ref workflow-quickstart.md >}})
- [Try out the .NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
- [Workflow API reference]({{< ref workflow_api.md >}})
