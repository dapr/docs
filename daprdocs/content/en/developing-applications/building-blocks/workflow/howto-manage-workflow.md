---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 6000
description: Manage and run workflows
---

Now that you've [authored the workflow and its activities in your application]({{< ref howto-author-workflow.md >}}), you can start, terminate, and get information about the workflow using HTTP API calls. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

{{< tabs ".NET" Python HTTP >}}

<!--NET-->
{{% codetab %}}

Manage your workflow within your code. In the `OrderProcessingWorkflow` example from the [Author a workflow]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) guide, the workflow is registered in the code. You can now start, terminate, and get information about a running workflow:

```csharp
string orderId = "exampleOrderId";
string workflowComponent = "dapr";
string workflowName = "OrderProcessingWorkflow";
OrderPayload input = new OrderPayload("Paperclips", 99.95);
Dictionary<string, string> workflowOptions; // This is an optional parameter

// Start the workflow. This returns back a "StartWorkflowResponse" which contains the instance ID for the particular workflow instance.
StartWorkflowResponse startResponse = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, input, workflowOptions);

// Get information on the workflow. This response contains information such as the status of the workflow, when it started, and more!
GetWorkflowResponse getResponse = await daprClient.GetWorkflowAsync(orderId, workflowComponent, workflowName);

// Terminate the workflow
await daprClient.TerminateWorkflowAsync(orderId, workflowComponent);

// Raise an event (an incoming purchase order) that your workflow will wait for. This returns the item waiting to be purchased.
await daprClient.RaiseWorkflowEventAsync(orderId, workflowComponent, workflowName, input);

// Pause
await daprClient.PauseWorkflowAsync(orderId, workflowComponent);

// Resume
await daprClient.ResumeWorkflowAsync(orderId, workflowComponent);

// Purge
await daprClient.PurgeWorkflowAsync(orderId, workflowComponent);
```

{{% /codetab %}}

<!--Python-->
{{% codetab %}}

Manage your workflow within your code. In the `OrderProcessingWorkflow` example from the [Author a workflow]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) guide, the workflow is registered in the code using the following APIs:
- **start_workflow**: Start an instance of a workflow
- **get_workflow**: Get information on a single workflow
- **terminate_workflow**: Terminate or stop a particular instance of a workflow
- **raise_event**: Raise an event on a workflow
- **pause_workflow**: Pauses or suspends a workflow instance that can later be resumed
- **resume_workflow**: Resumes a paused workflow instance
- **purge_workflow**: Removes all metadata related to a specific workflow instance

```python
dapr = DaprGrpcClient(f'localhost:{self.server_port}')

# Sane parameters
workflow_name = 'testWorkflow'
instance_id = str(uuid.uuid4())
workflow_component = "dapr"
input = "paperclips"

# Start the workflow
start_response = dapr.start_workflow(instance_id, workflow_name, workflow_component,
                                     input.encode('utf-8'), None)
self.assertEqual(instance_id, start_response.instance_id)



# Get info on the workflow to check that it is running
get_response = dapr.get_workflow(instance_id, workflow_component)
self.assertEqual("RUNNING", get_response.runtime_status)

# Pause the workflow
dapr.pause_workflow(instance_id, workflow_component)

# Get info on the workflow to check that it is paused
get_response = dapr.get_workflow(instance_id, workflow_component)
self.assertEqual("SUSPENDED", get_response.runtime_status)

# Resume the workflow
dapr.resume_workflow(instance_id, workflow_component)

# Get info on the workflow to check that it is resumed
get_response = dapr.get_workflow(instance_id, workflow_component)
self.assertEqual("RUNNING", get_response.runtime_status)

# Raise an event on the workflow. 
TODO: Figure out how to check/verify this

# Terminate the workflow
dapr.terminate_workflow(instance_id, workflow_component)

# Get info on the workflow to check that it is terminated
get_response = dapr.get_workflow(instance_id, workflow_component)
self.assertEqual("TERMINATED", get_response.runtime_status)

# Purge the workflow
dapr.purge_workflow(instance_id, workflow_component)

# Get information on the workflow to ensure that it has been purged
TODO
```

{{% /codetab %}}


<!--HTTP-->
{{% codetab %}}

Manage your workflow using HTTP calls. The example below plugs in the properties from the [Author a workflow example]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) with a random instance ID number.

### Start workflow

To start your workflow with an ID `12345678`, run:

```http
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678
```

Note that workflow instance IDs can only contain alphanumeric characters, underscores, and dashes.

### Terminate workflow

To terminate your workflow with an ID `12345678`, run:

```http
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/terminate
```

### Raise an event

For workflow components that support subscribing to external events, such as the Dapr Workflow engine, you can use the following "raise event" API to deliver a named event to a specific workflow instance.

```http
POST http://localhost:3500/v1.0-alpha1/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

> An `eventName` can be any function. 

### Pause or resume a workflow

To plan for down-time, wait for inputs, and more, you can pause and then resume a workflow. To pause a workflow with an ID `12345678` until triggered to resume, run:

```http
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/pause
```

To resume a workflow with an ID `12345678`, run:

```http
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/resume
```

### Purge a workflow 

The purge API can be used to permanently delete workflow metadata from the underlying state store, including any stored inputs, outputs, and workflow history records. This is often useful for implementing data retention policies and for freeing resources.

Only workflow instances in the COMPLETED, FAILED, or TERMINATED state can be purged. If the workflow is in any other state, calling purge returns an error.

```http
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/purge
```

### Get information about a workflow

To fetch workflow information (outputs and inputs) with an ID `12345678`, run:

```http
GET http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678
```

Learn more about these HTTP calls in the [workflow API reference guide]({{< ref workflow_api.md >}}).


{{% /codetab %}}

{{< /tabs >}}


## Next steps
- [Try out the Workflow quickstart]({{< ref workflow-quickstart.md >}})
- Try out the full SDK examples:
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Python example](todo)
- [Workflow API reference]({{< ref workflow_api.md >}})
