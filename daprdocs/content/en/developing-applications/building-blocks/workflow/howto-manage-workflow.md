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
CancellationToken cts = CancellationToken.None;

// Start the workflow. This returns back a "WorkflowReference" which contains the instanceID for the particular workflow instance.
WorkflowReference startResponse = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, input, workflowOptions, cts);

// Get information on the workflow. This response will contain information such as the status of the workflow, when it started, and more!
GetWorkflowResponse getResponse = await daprClient.GetWorkflowAsync(orderId, workflowComponent, workflowName);

// Terminate the workflow
await daprClient.TerminateWorkflowAsync(instanceId, workflowComponent);
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

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678
```

Note that workflow instance IDs can only contain alphanumeric characters, underscores, and dashes.

### Terminate workflow

To terminate your workflow with an ID `12345678`, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/terminate
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
- Try out the full SDK examples:
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Python example](todo)
- [Workflow API reference]({{< ref workflow_api.md >}})
