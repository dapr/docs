---
type: docs
title: "How to: Manage workflows"
linkTitle: "How to: Manage workflows"
weight: 6000
description: Manage and run workflows
---

Now that you've [authored the workflow and its activities in your application]({{% ref howto-author-workflow.md %}}), you can start, terminate, and get information about the workflow using the CLI or API calls. For more information, read the [workflow API reference]({{% ref workflow_api.md %}}).

{{< tabpane text=true >}}

<!--CLI-->
{{% tab "CLI" %}}
Workflow reminders are stored in the Scheduler and can be managed using the dapr scheduler CLI.

#### List workflow reminders

```bash
dapr scheduler list --filter workflow
NAME                                           BEGIN     COUNT  LAST TRIGGER
workflow/my-app/instance1/timer-0-ABC123       +50.0h    0
workflow/my-app/instance2/timer-0-XYZ789       +50.0h    0
```

Get reminder details

```bash
dapr scheduler get workflow/my-app/instance1/timer-0-ABC123 -o yaml
```

#### Delete workflow reminders

Delete a single reminder:

```bash
dapr scheduler delete workflow/my-app/instance1/timer-0-ABC123
```

Delete all reminders for a given workflow app"

```bash
dapr scheduler delete-all workflow/my-app
```

Delete all reminders for a specific workflow instance:

```bash
dapr scheduler delete-all workflow/my-app/instance1
```

#### Backup and restore reminders

Export all reminders:

```bash
dapr scheduler export -o workflow-reminders-backup.bin
```

Restore from a backup file:

```bash
dapr scheduler import -f workflow-reminders-backup.bin
```

#### Summary

- Workflow reminders are persisted in the Dapr Scheduler.
- Create workflow reminders via the Workflow API.
- Manage reminders (list, get, delete, backup/restore) with the dapr scheduler CLI.

## Managing Workflows with the Dapr CLI

The Dapr CLI provides commands for managing workflow instances in both self-hosted and Kubernetes environments.

### Prerequisites

- Dapr CLI version 1.16.2 or later
- A running Dapr application that has registered a workflow
- For database operations: network access to your actor state store

### Basic Workflow Operations

#### Start a Workflow

```bash
# Using the `orderprocessing` application, start a new workflow instance with input data
dapr workflow run OrderProcessingWorkflow \
  --app-id orderprocessing \
  --input '{"orderId": "12345", "amount": 100.50}'

# Start with a new workflow with a specific instance ID
dapr workflow run OrderProcessingWorkflow \
  --app-id orderprocessing \
  --instance-id order-12345 \
  --input '{"orderId": "12345"}'

# Schedule a new workflow to start at 10:00:00 AM on December 25, 2024, Coordinated Universal Time (UTC).
dapr workflow run OrderProcessingWorkflow \
  --app-id orderprocessing \
  --start-time "2024-12-25T10:00:00Z"
```

#### List Workflow Instances

```bash
# List all workflows for an app
dapr workflow list --app-id orderprocessing

# Filter by status
dapr workflow list --app-id orderprocessing --filter-status RUNNING

# Filter by workflow name
dapr workflow list --app-id orderprocessing --filter-name OrderProcessingWorkflow

# Filter by age (workflows started in last 24 hours)
dapr workflow list --app-id orderprocessing --filter-max-age 24h

# Get detailed output
dapr workflow list --app-id orderprocessing --output wide
```

#### View Workflow History

```bash
# Get execution history
dapr workflow history order-12345 --app-id orderprocessing

# Get history in JSON format
dapr workflow history order-12345 --app-id orderprocessing --output json
```

#### Control Workflow Execution

```bash
# Suspend a running workflow
dapr workflow suspend order-12345 \
  --app-id orderprocessing \
  --reason "Waiting for manual approval"

# Resume a suspended workflow
dapr workflow resume order-12345 \
  --app-id orderprocessing \
  --reason "Approved by manager"

# Terminate a workflow
dapr workflow terminate order-12345 \
  --app-id orderprocessing \
  --output '{"reason": "Cancelled by customer"}'
```

#### Raise External Events

```bash
# Raise an event for a waiting workflow
dapr workflow raise-event order-12345/PaymentReceived \
  --app-id orderprocessing \
  --input '{"paymentId": "pay-67890", "amount": 100.50}'
```

#### Re-run Workflows

```bash
# Re-run from the beginning
dapr workflow rerun order-12345 --app-id orderprocessing

# Re-run from a specific event
dapr workflow rerun order-12345 \
  --app-id orderprocessing \
  --event-id 5

# Re-run with a new instance ID
dapr workflow rerun order-12345 \
  --app-id orderprocessing \
  --new-instance-id order-12345-retry
```

#### Purge Completed Workflows

Note that purging a workflow from the CLI will also delete all associated Scheduler reminders.

{{% alert title="Important" color="warning" %}}
It is required that a workflow client is running in the application to perform purge operations.
The workflow client connection is required in order to preserve the workflow state machine integrity and prevent corruption.
Errors like the following suggest that the workflow client is not running:
```
failed to purge orchestration state: rpc error: code = FailedPrecondition desc = failed to purge orchestration state: failed to lookup actor: api error: code = FailedPrecondition desc = did not find address for actor
```
{{% /alert %}}

```bash
# Purge a specific instance
dapr workflow purge order-12345 --app-id orderprocessing

# Purge all completed workflows older than 30 days
dapr workflow purge --app-id orderprocessing --all-older-than 720h

# Purge all terminal workflows (use with caution!)
dapr workflow purge --app-id orderprocessing --all
```

### Kubernetes Operations

All commands support the `-k` flag for Kubernetes deployments:

```bash
# List workflows in Kubernetes
dapr workflow list \
  --kubernetes \
  --namespace production \
  --app-id orderprocessing

# Suspend a workflow in Kubernetes
dapr workflow suspend order-12345 \
  --kubernetes \
  --namespace production \
  --app-id orderprocessing \
  --reason "Maintenance window"
```

### Advanced: Direct Database Access

For advanced operations like listing and purging workflows, you can connect directly to the actor state store database. This is useful for:

- Querying workflows across multiple app instances
- Bulk operations on workflow metadata
- Custom filtering beyond what the API provides

#### Self-Hosted Mode

In self-hosted mode, the CLI can automatically discover your state store configuration:

```bash
# The CLI reads your component configuration automatically
dapr workflow list --app-id orderprocessing --connection-string=redis://127.0.0.1:6379
```

To override with a specific connection string:

```bash
# PostgreSQL
dapr workflow list \
  --app-id orderprocessing \
  --connection-string "host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable" \
  --table-name actor-store

# MySQL
dapr workflow list \
  --app-id orderprocessing \
  --connection-string "dapr:dapr@tcp(localhost:3306)/dapr?parseTime=true" \
  --table-name actor-store

# SQL Server
dapr workflow list \
  --app-id orderprocessing \
  --connection-string "sqlserver://dapr:Pass@word1@localhost:1433?database=dapr" \
  --table-name abc

# Redis
dapr workflow list \
  --app-id orderprocessing \
  --connection-string=redis://user:mypassword@127.0.0.1:6379 \
```

#### Kubernetes Mode with Port Forwarding

In Kubernetes, you need to establish connectivity to your database:

**Step 1: Port forward to your database service**

```bash
# PostgreSQL
kubectl port-forward service/postgres 5432:5432 -n production

# MySQL
kubectl port-forward service/mysql 3306:3306 -n production

# SQL Server
kubectl port-forward service/mssql 1433:1433 -n production

# Redis
kubectl port-forward service/redis 6379:6379 -n production
```

**Step 2: Use the CLI with the connection string**

```bash
# PostgreSQL example
dapr workflow list \
  --kubernetes \
  --namespace production \
  --app-id orderprocessing \
  --connection-string "host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable" \
  --table-name workflows

# Purge old workflows
dapr workflow purge \
  --kubernetes \
  --namespace production \
  --app-id orderprocessing \
  --connection-string "host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable" \
  --table-name workflows \
  --all-older-than 2160h  # 90 days
```

**Step 3: Stop port forwarding when done**

```bash
# Press Ctrl+C to stop the port forward
```

#### Connection String Formats by Database

**PostgreSQL / CockroachDB**
```
host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable connect_timeout=10
```

**MySQL**
```
username:password@tcp(host:port)/database?parseTime=true&loc=UTC
```

**SQL Server**
```
sqlserver://username:password@host:port?database=dbname&encrypt=false
```

**MongoDB**
```
mongodb://username:password@localhost:27017/database
```

**Redis**
```
redis://127.0.0.1:6379
```

### Workflow Management Best Practices

1. **Regular Cleanup**: Schedule periodic purge operations for completed workflows
   ```bash
   # Weekly cron job to purge workflows older than 90 days
   dapr workflow purge --app-id orderprocessing --all-older-than 2160h
   ```

2. **Monitor Running Workflows**: Use filtered lists to track long-running instances
   ```bash
   dapr workflow list --app-id orderprocessing --filter-status RUNNING --filter-max-age 24h
   ```

3. **Use Instance IDs**: Assign meaningful instance IDs for easier tracking
   ```bash
   dapr workflow run OrderWorkflow --app-id orderprocessing --instance-id "order-$(date +%s)"
   ```

4. **Export for Analysis**: Export workflow data for analysis
   ```bash
   dapr workflow list --app-id orderprocessing --output json > workflows.json
   ```

{{% /tab %}}

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
