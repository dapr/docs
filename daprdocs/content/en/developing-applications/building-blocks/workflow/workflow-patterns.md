---
type: docs
title: Workflow patterns
linkTitle: Workflow patterns
weight: 3000
description: "Write different types of workflow patterns"
---

Dapr Workflows simplify complex, stateful coordination requirements in microservice architectures. The following sections describe several application patterns that can benefit from Dapr Workflows.

## Task chaining

In the task chaining pattern, multiple steps in a workflow are run in succession, and the output of one step may be passed as the input to the next step. Task chaining workflows typically involve creating a sequence of operations that need to be performed on some data, such as filtering, transforming, and reducing.

<img src="/images/workflow-overview/workflows-chaining.png" width=800 alt="Diagram showing how the task chaining workflow pattern works">

In some cases, the steps of the workflow may need to be orchestrated across multiple microservices. For increased reliability and scalability, you're also likely to use queues to trigger the various steps.

While the pattern is simple, there are many complexities hidden in the implementation. For example:

- What happens if one of the microservices are unavailable for an extended period of time?
- Can failed steps be automatically retried?
- If not, how do you facilitate the rollback of previously completed steps, if applicable?
- Implementation details aside, is there a way to visualize the workflow so that other engineers can understand what it does and how it works?

Dapr Workflow solves these complexities by allowing you to implement the task chaining pattern concisely as a simple function in the programming language of your choice, as shown in the following example.

{{< tabs ".NET" Python >}}

{{% codetab %}}
<!--dotnet-->

```csharp
// Expotential backoff retry policy that survives long outages
var retryOptions = new WorkflowTaskOptions
{
    RetryPolicy = new WorkflowRetryPolicy(
        firstRetryInterval: TimeSpan.FromMinutes(1),
        backoffCoefficient: 2.0,
        maxRetryInterval: TimeSpan.FromHours(1),
        maxNumberOfAttempts: 10),
};

try
{
    var result1 = await context.CallActivityAsync<string>("Step1", wfInput, retryOptions);
    var result2 = await context.CallActivityAsync<byte[]>("Step2", result1, retryOptions);
    var result3 = await context.CallActivityAsync<long[]>("Step3", result2, retryOptions);
    return string.Join(", ", result4);
}
catch (TaskFailedException) // Task failures are surfaced as TaskFailedException
{
    // Retries expired - apply custom compensation logic
    await context.CallActivityAsync<long[]>("MyCompensation", options: retryOptions);
    throw;
}
```

{{% alert title="Note" color="primary" %}}
In the example above, `"Step1"`, `"Step2"`, `"Step3"`, and `"MyCompensation"` represent workflow activities, which are functions in your code that actually implement the steps of the workflow. For brevity, these activity implementations are left out of this example.
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}
<!--python-->

```python
import dapr.ext.workflow as wf


def task_chain_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    try:
        result1 = yield ctx.call_activity(step1, input=wf_input)
        result2 = yield ctx.call_activity(step2, input=result1)
        result3 = yield ctx.call_activity(step3, input=result2)
    except Exception as e:
        yield ctx.call_activity(error_handler, input=str(e))
        raise
    return [result1, result2, result3]


def step1(ctx, activity_input):
    print(f'Step 1: Received input: {activity_input}.')
    # Do some work
    return activity_input + 1


def step2(ctx, activity_input):
    print(f'Step 2: Received input: {activity_input}.')
    # Do some work
    return activity_input * 2


def step3(ctx, activity_input):
    print(f'Step 3: Received input: {activity_input}.')
    # Do some work
    return activity_input ^ 2


def error_handler(ctx, error):
    print(f'Executing error handler: {error}.')
    # Do some compensating work
```

{{% alert title="Note" color="primary" %}}
Workflow retry policies will be available in a future version of the Python SDK.
{{% /alert %}}

{{% /codetab %}}

{{< /tabs >}}

As you can see, the workflow is expressed as a simple series of statements in the programming language of your choice. This allows any engineer in the organization to quickly understand the end-to-end flow without necessarily needing to understand the end-to-end system architecture.

Behind the scenes, the Dapr Workflow runtime:

- Takes care of executing the workflow and ensuring that it runs to completion.
- Saves progress automatically.
- Automatically resumes the workflow from the last completed step if the workflow process itself fails for any reason.
- Enables error handling to be expressed naturally in your target programming language, allowing you to implement compensation logic easily.
- Provides built-in retry configuration primitives to simplify the process of configuring complex retry policies for individual steps in the workflow.

## Fan-out/fan-in

In the fan-out/fan-in design pattern, you execute multiple tasks simultaneously across potentially multiple workers, wait for them to finish, and perform some aggregation on the result.

<img src="/images/workflow-overview/workflows-fanin-fanout.png" width=800 alt="Diagram showing how the fan-out/fan-in workflow pattern works">

In addition to the challenges mentioned in [the previous pattern]({{< ref "workflow-patterns.md#task-chaining" >}}), there are several important questions to consider when implementing the fan-out/fan-in pattern manually:

- How do you control the degree of parallelism?
- How do you know when to trigger subsequent aggregation steps?
- What if the number of parallel steps is dynamic?

Dapr Workflows provides a way to express the fan-out/fan-in pattern as a simple function, as shown in the following example:

{{< tabs ".NET" Python >}}

{{% codetab %}}
<!--dotnet-->

```csharp
// Get a list of N work items to process in parallel.
object[] workBatch = await context.CallActivityAsync<object[]>("GetWorkBatch", null);

// Schedule the parallel tasks, but don't wait for them to complete yet.
var parallelTasks = new List<Task<int>>(workBatch.Length);
for (int i = 0; i < workBatch.Length; i++)
{
    Task<int> task = context.CallActivityAsync<int>("ProcessWorkItem", workBatch[i]);
    parallelTasks.Add(task);
}

// Everything is scheduled. Wait here until all parallel tasks have completed.
await Task.WhenAll(parallelTasks);

// Aggregate all N outputs and publish the result.
int sum = parallelTasks.Sum(t => t.Result);
await context.CallActivityAsync("PostResults", sum);
```

{{% /codetab %}}

{{% codetab %}}
<!--python-->

```python
import time
from typing import List
import dapr.ext.workflow as wf


def batch_processing_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    # get a batch of N work items to process in parallel
    work_batch = yield ctx.call_activity(get_work_batch, input=wf_input)

    # schedule N parallel tasks to process the work items and wait for all to complete
    parallel_tasks = [ctx.call_activity(process_work_item, input=work_item) for work_item in work_batch]
    outputs = yield wf.when_all(parallel_tasks)

    # aggregate the results and send them to another activity
    total = sum(outputs)
    yield ctx.call_activity(process_results, input=total)


def get_work_batch(ctx, batch_size: int) -> List[int]:
    return [i + 1 for i in range(batch_size)]


def process_work_item(ctx, work_item: int) -> int:
    print(f'Processing work item: {work_item}.')
    time.sleep(5)
    result = work_item * 2
    print(f'Work item {work_item} processed. Result: {result}.')
    return result


def process_results(ctx, final_result: int):
    print(f'Final result: {final_result}.')
```

{{% /codetab %}}

{{< /tabs >}}

The key takeaways from this example are:

- The fan-out/fan-in pattern can be expressed as a simple function using ordinary programming constructs
- The number of parallel tasks can be static or dynamic
- The workflow itself is capable of aggregating the results of parallel executions

While not shown in the example, it's possible to go further and limit the degree of concurrency using simple, language-specific constructs. Furthermore, the execution of the workflow is durable. If a workflow starts 100 parallel task executions and only 40 complete before the process crashes, the workflow restarts itself automatically and only schedules the remaining 60 tasks.

## Async HTTP APIs

Asynchronous HTTP APIs are typically implemented using the [Asynchronous Request-Reply pattern](https://learn.microsoft.com/azure/architecture/patterns/async-request-reply). Implementing this pattern traditionally involves the following:

1. A client sends a request to an HTTP API endpoint (the _start API_)
1. The _start API_ writes a message to a backend queue, which triggers the start of a long-running operation
1. Immediately after scheduling the backend operation, the _start API_ returns an HTTP 202 response to the client with an identifier that can be used to poll for status
1. The _status API_ queries a database that contains the status of the long-running operation
1. The client repeatedly polls the _status API_ either until some timeout expires or it receives a "completion" response

The end-to-end flow is illustrated in the following diagram.

<img src="/images/workflow-overview/workflow-async-request-response.png" width=800 alt="Diagram showing how the async request response pattern works"/>

The challenge with implementing the asynchronous request-reply pattern is that it involves the use of multiple APIs and state stores. It also involves implementing the protocol correctly so that the client knows how to automatically poll for status and know when the operation is complete.

The Dapr workflow HTTP API supports the asynchronous request-reply pattern out-of-the box, without requiring you to write any code or do any state management.

The following `curl` commands illustrate how the workflow APIs support this pattern.

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 -d '{"Name":"Paperclips","Quantity":1,"TotalCost":9.95}'
```

The previous command will result in the following response JSON:

```json
{"instanceID":"12345678"}
```

The HTTP client can then construct the status query URL using the workflow instance ID and poll it repeatedly until it sees the "COMPLETE", "FAILURE", or "TERMINATED" status in the payload.

```bash
curl http://localhost:3500/v1.0-alpha1/workflows/dapr/12345678
```

The following is an example of what an in-progress workflow status might look like.

```json
{
  "instanceID": "12345678",
  "workflowName": "OrderProcessingWorkflow",
  "createdAt": "2023-05-03T23:22:11.143069826Z",
  "lastUpdatedAt": "2023-05-03T23:22:22.460025267Z",
  "runtimeStatus": "RUNNING",
  "properties": {
    "dapr.workflow.custom_status": "",
    "dapr.workflow.input": "{\"Name\":\"Paperclips\",\"Quantity\":1,\"TotalCost\":9.95}"
  }
}
```

As you can see from the previous example, the workflow's runtime status is `RUNNING`, which lets the client know that it should continue polling.

If the workflow has completed, the status might look as follows.

```json
{
  "instanceID": "12345678",
  "workflowName": "OrderProcessingWorkflow",
  "createdAt": "2023-05-03T23:30:11.381146313Z",
  "lastUpdatedAt": "2023-05-03T23:30:52.923870615Z",
  "runtimeStatus": "COMPLETED",
  "properties": {
    "dapr.workflow.custom_status": "",
    "dapr.workflow.input": "{\"Name\":\"Paperclips\",\"Quantity\":1,\"TotalCost\":9.95}",
    "dapr.workflow.output": "{\"Processed\":true}"
  }
}
```

As you can see from the previous example, the runtime status of the workflow is now `COMPLETED`, which means the client can stop polling for updates.

## Monitor

The monitor pattern is recurring process that typically:

1. Checks the status of a system
1. Takes some action based on that status - e.g. send a notification
1. Sleeps for some period of time
1. Repeat

The following diagram provides a rough illustration of this pattern.

<img src="/images/workflow-overview/workflow-monitor-pattern.png" width=600 alt="Diagram showing how the monitor pattern works"/>

Depending on the business needs, there may be a single monitor or there may be multiple monitors, one for each business entity (for example, a stock). Furthermore, the amount of time to sleep may need to change, depending on the circumstances. These requirements make using cron-based scheduling systems impractical.

Dapr Workflow supports this pattern natively by allowing you to implement _eternal workflows_. Rather than writing infinite while-loops ([which is an anti-pattern]({{< ref "workflow-features-concepts.md#infinite-loops-and-eternal-workflows" >}})), Dapr Workflow exposes a _continue-as-new_ API that workflow authors can use to restart a workflow function from the beginning with a new input.

{{< tabs ".NET" Python >}}

{{% codetab %}}
<!--dotnet-->

```csharp
public override async Task<object> RunAsync(WorkflowContext context, MyEntityState myEntityState)
{
    TimeSpan nextSleepInterval;

    var status = await context.CallActivityAsync<string>("GetStatus");
    if (status == "healthy")
    {
        myEntityState.IsHealthy = true;

        // Check less frequently when in a healthy state
        nextSleepInterval = TimeSpan.FromMinutes(60);
    }
    else
    {
        if (myEntityState.IsHealthy)
        {
            myEntityState.IsHealthy = false;
            await context.CallActivityAsync("SendAlert", myEntityState);
        }

        // Check more frequently when in an unhealthy state
        nextSleepInterval = TimeSpan.FromMinutes(5);
    }

    // Put the workflow to sleep until the determined time
    await context.CreateTimer(nextSleepInterval);

    // Restart from the beginning with the updated state
    context.ContinueAsNew(myEntityState);
    return null;
}
```

> This example assumes you have a predefined `MyEntityState` class with a boolean `IsHealthy` property.

{{% /codetab %}}

{{% codetab %}}
<!--python-->

```python
from dataclasses import dataclass
from datetime import timedelta
import random
import dapr.ext.workflow as wf


@dataclass
class JobStatus:
    job_id: str
    is_healthy: bool


def status_monitor_workflow(ctx: wf.DaprWorkflowContext, job: JobStatus):
    # poll a status endpoint associated with this job
    status = yield ctx.call_activity(check_status, input=job)
    if not ctx.is_replaying:
        print(f"Job '{job.job_id}' is {status}.")

    if status == "healthy":
        job.is_healthy = True
        next_sleep_interval = 60  # check less frequently when healthy
    else:
        if job.is_healthy:
            job.is_healthy = False
            ctx.call_activity(send_alert, input=f"Job '{job.job_id}' is unhealthy!")
        next_sleep_interval = 5  # check more frequently when unhealthy

    yield ctx.create_timer(fire_at=ctx.current_utc_datetime + timedelta(seconds=next_sleep_interval))

    # restart from the beginning with a new JobStatus input
    ctx.continue_as_new(job)


def check_status(ctx, _) -> str:
    return random.choice(["healthy", "unhealthy"])


def send_alert(ctx, message: str):
    print(f'*** Alert: {message}')
```

{{% /codetab %}}

{{< /tabs >}}

A workflow implementing the monitor pattern can loop forever or it can terminate itself gracefully by not calling _continue-as-new_.

{{% alert title="Note" color="primary" %}}
This pattern can also be expressed using actors and reminders. The difference is that this workflow is expressed as a single function with inputs and state stored in local variables. Workflows can also execute a sequence of actions with stronger reliability guarantees, if necessary.
{{% /alert %}}

## External system interaction

In some cases, a workflow may need to pause and wait for an external system to perform some action. For example, a workflow may need to pause and wait for a payment to be received. In this case, a payment system might publish an event to a pub/sub topic on receipt of a payment, and a listener on that topic can raise an event to the workflow using the [raise event workflow API]({{< ref "howto-manage-workflow.md#raise-an-event" >}}).

Another very common scenario is when a workflow needs to pause and wait for a human, for example when approving a purchase order. Dapr Workflow supports this event pattern via the [external events]({{< ref "workflow-features-concepts.md#external-events" >}}) feature.

Here's an example workflow for a purchase order involving a human:

1. A workflow is triggered when a purchase order is received.
1. A rule in the workflow determines that a human needs to perform some action. For example, the purchase order cost exceeds a certain auto-approval threshold.
1. The workflow sends a notification requesting a human action. For example, it sends an email with an approval link to a designated approver.
1. The workflow pauses and waits for the human to either approve or reject the order by clicking on a link.
1. If the approval isn't received within the specified time, the workflow resumes and performs some compensation logic, such as canceling the order.

The following diagram illustrates this flow.

<img src="/images/workflow-overview/workflow-human-interaction-pattern.png" width=600 alt="Diagram showing how the external system interaction pattern works with a human involved"/>

The following example code shows how this pattern can be implemented using Dapr Workflow.

{{< tabs ".NET" Python >}}

{{% codetab %}}
<!--dotnet-->

```csharp
public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
{
    // ...(other steps)...

    // Require orders over a certain threshold to be approved
    if (order.TotalCost > OrderApprovalThreshold)
    {
        try
        {
            // Request human approval for this order
            await context.CallActivityAsync(nameof(RequestApprovalActivity), order);

            // Pause and wait for a human to approve the order
            ApprovalResult approvalResult = await context.WaitForExternalEventAsync<ApprovalResult>(
                eventName: "ManagerApproval",
                timeout: TimeSpan.FromDays(3));
            if (approvalResult == ApprovalResult.Rejected)
            {
                // The order was rejected, end the workflow here
                return new OrderResult(Processed: false);
            }
        }
        catch (TaskCanceledException)
        {
            // An approval timeout results in automatic order cancellation
            return new OrderResult(Processed: false);
        }
    }

    // ...(other steps)...

    // End the workflow with a success result
    return new OrderResult(Processed: true);
}
```

{{% alert title="Note" color="primary" %}}
In the example above, `RequestApprovalActivity` is the name of a workflow activity to invoke and `ApprovalResult` is an enumeration defined by the workflow app. For brevity, these definitions were left out of the example code.
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}
<!--python-->

```python
from dataclasses import dataclass
from datetime import timedelta
import dapr.ext.workflow as wf


@dataclass
class Order:
    cost: float
    product: str
    quantity: int

    def __str__(self):
        return f'{self.product} ({self.quantity})'


@dataclass
class Approval:
    approver: str

    @staticmethod
    def from_dict(dict):
        return Approval(**dict)


def purchase_order_workflow(ctx: wf.DaprWorkflowContext, order: Order):
    # Orders under $1000 are auto-approved
    if order.cost < 1000:
        return "Auto-approved"

    # Orders of $1000 or more require manager approval
    yield ctx.call_activity(send_approval_request, input=order)

    # Approvals must be received within 24 hours or they will be canceled.
    approval_event = ctx.wait_for_external_event("approval_received")
    timeout_event = ctx.create_timer(timedelta(hours=24))
    winner = yield wf.when_any([approval_event, timeout_event])
    if winner == timeout_event:
        return "Cancelled"

    # The order was approved
    yield ctx.call_activity(place_order, input=order)
    approval_details = Approval.from_dict(approval_event.get_result())
    return f"Approved by '{approval_details.approver}'"


def send_approval_request(_, order: Order) -> None:
    print(f'*** Sending approval request for order: {order}')


def place_order(_, order: Order) -> None:
    print(f'*** Placing order: {order}')
```

{{% /codetab %}}

{{< /tabs >}}

The code that delivers the event to resume the workflow execution is external to the workflow. Workflow events can be delivered to a waiting workflow instance using the [raise event]({{< ref "howto-manage-workflow.md#raise-an-event" >}}) workflow management API, as shown in the following example:

{{< tabs ".NET" Python >}}

{{% codetab %}}
<!--dotnet-->

```csharp
// Raise the workflow event to the waiting workflow
await daprClient.RaiseWorkflowEventAsync(
    instanceId: orderId,
    workflowComponent: "dapr",
    eventName: "ManagerApproval",
    eventData: ApprovalResult.Approved);
```

{{% /codetab %}}

{{% codetab %}}
<!--python-->

```python
from dapr.clients import DaprClient
from dataclasses import asdict

with DaprClient() as d:
    d.raise_workflow_event(
        instance_id=instance_id,
        workflow_component="dapr",
        event_name="approval_received",
        event_data=asdict(Approval("Jane Doe")))
```

{{% /codetab %}}

{{< /tabs >}}

External events don't have to be directly triggered by humans. They can also be triggered by other systems. For example, a workflow may need to pause and wait for a payment to be received. In this case, a payment system might publish an event to a pub/sub topic on receipt of a payment, and a listener on that topic can raise an event to the workflow using the raise event workflow API.

## Next steps

{{< button text="Workflow architecture >>" page="workflow-architecture.md" >}}

## Related links

- [Try out Dapr Workflows using the quickstart]({{< ref workflow-quickstart.md >}})
- [Workflow overview]({{< ref workflow-overview.md >}})
- [Workflow API reference]({{< ref workflow_api.md >}})
- [Try out the .NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
