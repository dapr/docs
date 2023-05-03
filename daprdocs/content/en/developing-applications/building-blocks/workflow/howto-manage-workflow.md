---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 6000
description: Manage and run workflows
---

Now that you've [authored the workflow and its activities in your application]({{< ref howto-author-workflow.md >}}), you can start, terminate, and get information about the workflow using HTTP API calls. For more information, read the [workflow API reference]({{< ref workflow_api.md >}}).

{{< tabs ".NET SDK" "Python SDK" HTTP >}}

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

    # Pause Test
    d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    print(f"Get response from {workflowName} after pause call: {getResponse.runtime_status}")

    # Resume Test
    d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    print(f"Get response from {workflowName} after resume call: {getResponse.runtime_status}")

    # Terminate Test
    d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    print(f"Get response from {workflowName} after terminate call: {getResponse.runtime_status}")

    # Purge Test
    d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
    print(f"Get response from {workflowName} after purge call: {getResponse}")
```

{{% /codetab %}}


<!--HTTP-->
{{% codetab %}}

Manage your workflow using HTTP calls. The example below plugs in the properties from the [Author a workflow example]({{< ref "howto-author-workflow.md#write-the-workflow" >}}) with a random instance ID number.

### Start workflow

To start your workflow with an ID `12345678`, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/12345678/start
```

### Terminate workflow

To terminate your workflow with an ID `12345678`, run:

```bash
POST http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678/terminate
```

### Get information about a workflow

To fetch workflow information (outputs and inputs) with an ID `12345678`, run:

```bash
GET http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/12345678
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
