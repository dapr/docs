---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 6000
description: Manage and run workflows
---

Now that you've [authored the workflow and its activities in your application]({{% ref howto-author-workflow.md %}}), you can start, terminate, and get information about the workflow using HTTP API calls. For more information, read the [workflow API reference]({{% ref workflow_api.md %}}).

{{< tabpane text=true >}}

<!--Python-->
{{% tab "Python" %}}

Manage your workflow within your code. In the workflow example from the [Author a workflow]({{% ref "howto-author-workflow.md#write-the-application" %}}) guide, the workflow is registered in the code using the following APIs:
- **schedule_new_workflow**: Start an instance of a workflow
- **get_workflow_state**: Get information on the status of the workflow
- **pause_workflow**: Pauses or suspends a workflow instance that can later be resumed
- **resume_workflow**: Resumes a paused workflow instance
- **raise_workflow_event**: Raise an event on a workflow
- **purge_workflow**: Removes all metadata related to a specific workflow instance
- **wait_for_workflow_completion**: Complete a particular instance of a workflow

```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient

# Sane parameters
instanceId = "exampleInstanceID"
workflowComponent = "dapr"
workflowName = "hello_world_wf"
eventName = "event1"
eventData = "eventData"

# Start the workflow
wf_client.schedule_new_workflow(
        workflow=hello_world_wf, input=input_data, instance_id=instance_id
    )

# Get info on the workflow
wf_client.get_workflow_state(instance_id=instance_id)

# Pause the workflow
wf_client.pause_workflow(instance_id=instance_id)
    metadata = wf_client.get_workflow_state(instance_id=instance_id)

# Resume the workflow
wf_client.resume_workflow(instance_id=instance_id)

# Raise an event on the workflow. 
wf_client.raise_workflow_event(instance_id=instance_id, event_name=event_name, data=event_data)

# Purge the workflow
wf_client.purge_workflow(instance_id=instance_id)

# Wait for workflow completion
wf_client.wait_for_workflow_completion(instance_id, timeout_in_seconds=30)
```

{{% /tab %}}

<!--JavaScript-->
{{% tab "JavaScript" %}}

Manage your workflow within your code. In the workflow example from the [Author a workflow]({{% ref "howto-author-workflow.md#write-the-application" %}}) guide, the workflow is registered in the code using the following APIs:
- **client.workflow.start**: Start an instance of a workflow
- **client.workflow.get**: Get information on the status of the workflow
- **client.workflow.pause**: Pauses or suspends a workflow instance that can later be resumed
- **client.workflow.resume**: Resumes a paused workflow instance
- **client.workflow.purge**: Removes all metadata related to a specific workflow instance
- **client.workflow.terminate**: Terminate or stop a particular instance of a workflow

```javascript
import { DaprClient } from "@dapr/dapr";

async function printWorkflowStatus(client: DaprClient, instanceId: string) {
  const workflow = await client.workflow.get(instanceId);
  console.log(
    `Workflow ${workflow.workflowName}, created at ${workflow.createdAt.toUTCString()}, has status ${
      workflow.runtimeStatus
    }`,
  );
  console.log(`Additional properties: ${JSON.stringify(workflow.properties)}`);
  console.log("--------------------------------------------------\n\n");
}

async function start() {
  const client = new DaprClient();

  // Start a new workflow instance
  const instanceId = await client.workflow.start("OrderProcessingWorkflow", {
    Name: "Paperclips",
    TotalCost: 99.95,
    Quantity: 4,
  });
  console.log(`Started workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Pause a workflow instance
  await client.workflow.pause(instanceId);
  console.log(`Paused workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Resume a workflow instance
  await client.workflow.resume(instanceId);
  console.log(`Resumed workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Terminate a workflow instance
  await client.workflow.terminate(instanceId);
  console.log(`Terminated workflow instance ${instanceId}`);
  await printWorkflowStatus(client, instanceId);

  // Wait for the workflow to complete, 30 seconds!
  await new Promise((resolve) => setTimeout(resolve, 30000));
  await printWorkflowStatus(client, instanceId);

  // Purge a workflow instance
  await client.workflow.purge(instanceId);
  console.log(`Purged workflow instance ${instanceId}`);
  // This will throw an error because the workflow instance no longer exists.
  await printWorkflowStatus(client, instanceId);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /tab %}}

<!--NET-->
{{% tab ".NET" %}}

Manage your workflow within your code. In the `OrderProcessingWorkflow` example from the [Author a workflow]({{% ref "howto-author-workflow.md#write-the-application" %}}) guide, the workflow is registered in the code. You can now start, terminate, and get information about a running workflow:

```csharp
string orderId = "exampleOrderId";
OrderPayload input = new OrderPayload("Paperclips", 99.95);
Dictionary<string, string> workflowOptions; // This is an optional parameter

// Start the workflow using the orderId as our workflow ID. This returns a string containing the instance ID for the particular workflow instance, whether we provide it ourselves or not.
await daprWorkflowClient.ScheduleNewWorkflowAsync(nameof(OrderProcessingWorkflow), orderId, input, workflowOptions);

// Get information on the workflow. This response contains information such as the status of the workflow, when it started, and more!
WorkflowState currentState = await daprWorkflowClient.GetWorkflowStateAsync(orderId, orderId);

// Terminate the workflow
await daprWorkflowClient.TerminateWorkflowAsync(orderId);

// Raise an event (an incoming purchase order) that your workflow will wait for
await daprWorkflowClient.RaiseEventAsync(orderId, "incoming-purchase-order", input);

// Pause
await daprWorkflowClient.SuspendWorkflowAsync(orderId);

// Resume
await daprWorkflowClient.ResumeWorkflowAsync(orderId);

// Purge the workflow, removing all inbox and history information from associated instance
await daprWorkflowClient.PurgeInstanceAsync(orderId);
```

{{% /tab %}}

<!--Java-->
{{% tab "Java" %}}

Manage your workflow within your code. [In the workflow example from the Java SDK](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/), the workflow is registered in the code using the following APIs:

- **scheduleNewWorkflow**: Starts a new workflow instance
- **getInstanceState**: Get information on the status of the workflow
- **waitForInstanceStart**: Pauses or suspends a workflow instance that can later be resumed
- **raiseEvent**: Raises events/tasks for the running workflow instance
- **waitForInstanceCompletion**: Waits for the workflow to complete its tasks
- **purgeInstance**: Removes all metadata related to a specific workflow instance
- **terminateWorkflow**: Terminates the workflow
- **purgeInstance**: Removes all metadata related to a specific workflow

```java
package io.dapr.examples.workflows;

import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;

// ...
public class DemoWorkflowClient {

  // ...
  public static void main(String[] args) throws InterruptedException {
    DaprWorkflowClient client = new DaprWorkflowClient();

    try (client) {
      // Start a workflow
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      
      // Get status information on the workflow
      WorkflowInstanceStatus workflowMetadata = client.getInstanceState(instanceId, true);

      // Wait or pause for the workflow instance start
      try {
        WorkflowInstanceStatus waitForInstanceStartResult =
            client.waitForInstanceStart(instanceId, Duration.ofSeconds(60), true);
      }

      // Raise an event for the workflow; you can raise several events in parallel
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");

      // Wait for workflow to complete running through tasks
      try {
        WorkflowInstanceStatus waitForInstanceCompletionResult =
            client.waitForInstanceCompletion(instanceId, Duration.ofSeconds(60), true);
      } 

      // Purge the workflow instance, removing all metadata associated with it
      boolean purgeResult = client.purgeInstance(instanceId);

      // Terminate the workflow instance
      client.terminateWorkflow(instanceToTerminateId, null);

    System.exit(0);
  }
}
```

{{% /tab %}}

<!--Go-->
{{% tab "Go" %}}

Manage your workflow within your code. [In the workflow example from the Go SDK](https://github.com/dapr/go-sdk/tree/main/examples/workflow), the workflow is registered in the code using the following APIs:

- **StartWorkflow**: Starts a new workflow instance
- **GetWorkflow**: Get information on the status of the workflow
- **PauseWorkflow**: Pauses or suspends a workflow instance that can later be resumed
- **RaiseEventWorkflow**: Raises events/tasks for the running workflow instance
- **ResumeWorkflow**: Waits for the workflow to complete its tasks
- **PurgeWorkflow**: Removes all metadata related to a specific workflow instance
- **TerminateWorkflow**: Terminates the workflow

```go
// Start workflow
type StartWorkflowRequest struct {
	InstanceID        string // Optional instance identifier
	WorkflowComponent string
	WorkflowName      string
	Options           map[string]string // Optional metadata
	Input             any               // Optional input
	SendRawInput      bool              // Set to True in order to disable serialization on the input
}

type StartWorkflowResponse struct {
	InstanceID string
}

// Get the workflow status
type GetWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

type GetWorkflowResponse struct {
	InstanceID    string
	WorkflowName  string
	CreatedAt     time.Time
	LastUpdatedAt time.Time
	RuntimeStatus string
	Properties    map[string]string
}

// Purge workflow
type PurgeWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Terminate workflow
type TerminateWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Pause workflow
type PauseWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Resume workflow
type ResumeWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
}

// Raise an event for the running workflow
type RaiseEventWorkflowRequest struct {
	InstanceID        string
	WorkflowComponent string
	EventName         string
	EventData         any
	SendRawData       bool // Set to True in order to disable serialization on the data
}
```

{{% /tab %}}

<!--HTTP-->
{{% tab "HTTP" %}}

Manage your workflow using HTTP calls. The example below plugs in the properties from the [Author a workflow example]({{% ref "howto-author-workflow.md#write-the-workflow" %}}) with a random instance ID number.

### Start workflow

To start your workflow with an ID `12345678`, run:

```shell
curl -X POST "http://localhost:3500/v1.0/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678"
```

Note that workflow instance IDs can only contain alphanumeric characters, underscores, and dashes.

### Terminate workflow

To terminate your workflow with an ID `12345678`, run:

```shell
curl -X POST "http://localhost:3500/v1.0/workflows/dapr/12345678/terminate"
```

### Raise an event

For workflow components that support subscribing to external events, such as the Dapr Workflow engine, you can use the following "raise event" API to deliver a named event to a specific workflow instance.

```shell
curl -X POST "http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>"
```

> An `eventName` can be any function. 

### Pause or resume a workflow

To plan for down-time, wait for inputs, and more, you can pause and then resume a workflow. To pause a workflow with an ID `12345678` until triggered to resume, run:

```shell
curl -X POST "http://localhost:3500/v1.0/workflows/dapr/12345678/pause"
```

To resume a workflow with an ID `12345678`, run:

```shell
curl -X POST "http://localhost:3500/v1.0/workflows/dapr/12345678/resume"
```

### Purge a workflow 

The purge API can be used to permanently delete workflow metadata from the underlying state store, including any stored inputs, outputs, and workflow history records. This is often useful for implementing data retention policies and for freeing resources.

Only workflow instances in the COMPLETED, FAILED, or TERMINATED state can be purged. If the workflow is in any other state, calling purge returns an error.

```shell
curl -X POST "http://localhost:3500/v1.0/workflows/dapr/12345678/purge"
```

### Get information about a workflow

To fetch workflow information (outputs and inputs) with an ID `12345678`, run:

```shell
curl -X GET "http://localhost:3500/v1.0/workflows/dapr/12345678"
```

Learn more about these HTTP calls in the [workflow API reference guide]({{% ref workflow_api.md %}}).


{{% /tab %}}

{{< /tabpane >}}

## Next steps

Now that you've learned how to manage workflows, learn how to execute workflows across multiple applications

{{< button text="Multi Application Workflows>>" page="workflow-multi-app.md" >}}

## Related links
- [Try out the Workflow quickstart]({{% ref workflow-quickstart.md %}})
- Try out the full SDK examples:
  - [Python example](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)
  - [JavaScript example](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go example](https://github.com/dapr/go-sdk/tree/main/examples/workflow)

- [Workflow API reference]({{% ref workflow_api.md %}})
