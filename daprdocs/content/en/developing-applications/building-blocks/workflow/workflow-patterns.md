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

{{< tabs Python JavaScript ".NET" Java Go >}}

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

> **Note** Workflow retry policies will be available in a future version of the Python SDK.

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```javascript
import { DaprWorkflowClient, WorkflowActivityContext, WorkflowContext, WorkflowRuntime, TWorkflow } from "@dapr/dapr";

async function start() {
  // Update the gRPC client and worker to use a local address and port
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

  const hello = async (_: WorkflowActivityContext, name: string) => {
    return `Hello ${name}!`;
  };

  const sequence: TWorkflow = async function* (ctx: WorkflowContext): any {
    const cities: string[] = [];

    const result1 = yield ctx.callActivity(hello, "Tokyo");
    cities.push(result1);
    const result2 = yield ctx.callActivity(hello, "Seattle");
    cities.push(result2);
    const result3 = yield ctx.callActivity(hello, "London");
    cities.push(result3);

    return cities;
  };

  workflowRuntime.registerWorkflow(sequence).registerActivity(hello);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
    console.log("Workflow runtime started successfully");
  } catch (error) {
    console.error("Error starting workflow runtime:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(sequence);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
  }

  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

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

> **Note** In the example above, `"Step1"`, `"Step2"`, `"Step3"`, and `"MyCompensation"` represent workflow activities, which are functions in your code that actually implement the steps of the workflow. For brevity, these activity implementations are left out of this example.

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
public class ChainWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            StringBuilder sb = new StringBuilder();
            String wfInput = ctx.getInput(String.class);
            String result1 = ctx.callActivity("Step1", wfInput, String.class).await();
            String result2 = ctx.callActivity("Step2", result1, String.class).await();
            String result3 = ctx.callActivity("Step3", result2, String.class).await();
            String result = sb.append(result1).append(',').append(result2).append(',').append(result3).toString();
            ctx.complete(result);
        };
    }
}

    class Step1 implements WorkflowActivity {

        @Override
        public Object run(WorkflowActivityContext ctx) {
            Logger logger = LoggerFactory.getLogger(Step1.class);
            logger.info("Starting Activity: " + ctx.getName());
            // Do some work
            return null;
        }
    }

    class Step2 implements WorkflowActivity {

        @Override
        public Object run(WorkflowActivityContext ctx) {
            Logger logger = LoggerFactory.getLogger(Step2.class);
            logger.info("Starting Activity: " + ctx.getName());
            // Do some work
            return null;
        }
    }

    class Step3 implements WorkflowActivity {

        @Override
        public Object run(WorkflowActivityContext ctx) {
            Logger logger = LoggerFactory.getLogger(Step3.class);
            logger.info("Starting Activity: " + ctx.getName());
            // Do some work
            return null;
        }
    }
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
func TaskChainWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	var result1 int
	if err := ctx.CallActivity(Step1, workflow.ActivityInput(input)).Await(&result1); err != nil {
		return nil, err
	}
	var result2 int
	if err := ctx.CallActivity(Step1, workflow.ActivityInput(input)).Await(&result2); err != nil {
		return nil, err
	}
	var result3 int
	if err := ctx.CallActivity(Step1, workflow.ActivityInput(input)).Await(&result3); err != nil {
		return nil, err
	}
	return []int{result1, result2, result3}, nil
}
func Step1(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("Step 1: Received input: %s", input)
	return input + 1, nil
}
func Step2(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("Step 2: Received input: %s", input)
	return input * 2, nil
}
func Step3(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	fmt.Printf("Step 3: Received input: %s", input)
	return int(math.Pow(float64(input), 2)), nil
}
```

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

{{< tabs Python JavaScript ".NET" Java Go >}}

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

{{% codetab %}}
<!--javascript-->

```javascript
import {
  Task,
  DaprWorkflowClient,
  WorkflowActivityContext,
  WorkflowContext,
  WorkflowRuntime,
  TWorkflow,
} from "@dapr/dapr";

// Wrap the entire code in an immediately-invoked async function
async function start() {
  // Update the gRPC client and worker to use a local address and port
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function getWorkItemsActivity(_: WorkflowActivityContext): Promise<string[]> {
    const count: number = getRandomInt(2, 10);
    console.log(`generating ${count} work items...`);

    const workItems: string[] = Array.from({ length: count }, (_, i) => `work item ${i}`);
    return workItems;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function processWorkItemActivity(context: WorkflowActivityContext, item: string): Promise<number> {
    console.log(`processing work item: ${item}`);

    // Simulate some work that takes a variable amount of time
    const sleepTime = Math.random() * 5000;
    await sleep(sleepTime);

    // Return a result for the given work item, which is also a random number in this case
    // For more information about random numbers in workflow please check
    // https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-code-constraints?tabs=csharp#random-numbers
    return Math.floor(Math.random() * 11);
  }

  const workflow: TWorkflow = async function* (ctx: WorkflowContext): any {
    const tasks: Task<any>[] = [];
    const workItems = yield ctx.callActivity(getWorkItemsActivity);
    for (const workItem of workItems) {
      tasks.push(ctx.callActivity(processWorkItemActivity, workItem));
    }
    const results: number[] = yield ctx.whenAll(tasks);
    const sum: number = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum;
  };

  workflowRuntime.registerWorkflow(workflow);
  workflowRuntime.registerActivity(getWorkItemsActivity);
  workflowRuntime.registerActivity(processWorkItemActivity);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
    console.log("Worker started successfully");
  } catch (error) {
    console.error("Error starting worker:", error);
  }

  // Schedule a new orchestration
  try {
    const id = await workflowClient.scheduleNewWorkflow(workflow);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, 30);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
  }

  // stop worker and client
  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

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
<!--java-->

```java
public class FaninoutWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            // Get a list of N work items to process in parallel.
            Object[] workBatch = ctx.callActivity("GetWorkBatch", Object[].class).await();
            // Schedule the parallel tasks, but don't wait for them to complete yet.
            List<Task<Integer>> tasks = Arrays.stream(workBatch)
                    .map(workItem -> ctx.callActivity("ProcessWorkItem", workItem, int.class))
                    .collect(Collectors.toList());
            // Everything is scheduled. Wait here until all parallel tasks have completed.
            List<Integer> results = ctx.allOf(tasks).await();
            // Aggregate all N outputs and publish the result.
            int sum = results.stream().mapToInt(Integer::intValue).sum();
            ctx.complete(sum);
        };
    }
}
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
func BatchProcessingWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return 0, err
	}
	var workBatch []int
	if err := ctx.CallActivity(GetWorkBatch, workflow.ActivityInput(input)).Await(&workBatch); err != nil {
		return 0, err
	}
	parallelTasks := workflow.NewTaskSlice(len(workBatch))
	for i, workItem := range workBatch {
		parallelTasks[i] = ctx.CallActivity(ProcessWorkItem, workflow.ActivityInput(workItem))
	}
	var outputs int
	for _, task := range parallelTasks {
		var output int
		err := task.Await(&output)
		if err == nil {
			outputs += output
		} else {
			return 0, err
		}
	}
	if err := ctx.CallActivity(ProcessResults, workflow.ActivityInput(outputs)).Await(nil); err != nil {
		return 0, err
	}
	return 0, nil
}
func GetWorkBatch(ctx workflow.ActivityContext) (any, error) {
	var batchSize int
	if err := ctx.GetInput(&batchSize); err != nil {
		return 0, err
	}
	batch := make([]int, batchSize)
	for i := 0; i < batchSize; i++ {
		batch[i] = i
	}
	return batch, nil
}
func ProcessWorkItem(ctx workflow.ActivityContext) (any, error) {
	var workItem int
	if err := ctx.GetInput(&workItem); err != nil {
		return 0, err
	}
	fmt.Printf("Processing work item: %d\n", workItem)
	time.Sleep(time.Second * 5)
	result := workItem * 2
	fmt.Printf("Work item %d processed. Result: %d\n", workItem, result)
	return result, nil
}
func ProcessResults(ctx workflow.ActivityContext) (any, error) {
	var finalResult int
	if err := ctx.GetInput(&finalResult); err != nil {
		return 0, err
	}
	fmt.Printf("Final result: %d\n", finalResult)
	return finalResult, nil
}
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
curl -X POST http://localhost:3500/v1.0-beta1/workflows/dapr/OrderProcessingWorkflow/start?instanceID=12345678 -d '{"Name":"Paperclips","Quantity":1,"TotalCost":9.95}'
```

The previous command will result in the following response JSON:

```json
{"instanceID":"12345678"}
```

The HTTP client can then construct the status query URL using the workflow instance ID and poll it repeatedly until it sees the "COMPLETE", "FAILURE", or "TERMINATED" status in the payload.

```bash
curl http://localhost:3500/v1.0-beta1/workflows/dapr/12345678
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

{{< tabs Python JavaScript ".NET" Java Go >}}

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

{{% codetab %}}
<!--javascript-->

```javascript
const statusMonitorWorkflow: TWorkflow = async function* (ctx: WorkflowContext): any {
    let duration;
    const status = yield ctx.callActivity(checkStatusActivity);
    if (status === "healthy") {
      // Check less frequently when in a healthy state
      // set duration to 1 hour
      duration = 60 * 60;
    } else {
      yield ctx.callActivity(alertActivity, "job unhealthy");
      // Check more frequently when in an unhealthy state
      // set duration to 5 minutes
      duration = 5 * 60;
    }

    // Put the workflow to sleep until the determined time
    ctx.createTimer(duration);

    // Restart from the beginning with the updated state
    ctx.continueAsNew();
  };
```

{{% /codetab %}}

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
<!--java-->

```java
public class MonitorWorkflow extends Workflow {

  @Override
  public WorkflowStub create() {
    return ctx -> {

      Duration nextSleepInterval;

      var status = ctx.callActivity(DemoWorkflowStatusActivity.class.getName(), DemoStatusActivityOutput.class).await();
      var isHealthy = status.getIsHealthy();

      if (isHealthy) {
        // Check less frequently when in a healthy state
        nextSleepInterval = Duration.ofMinutes(60);
      } else {

        ctx.callActivity(DemoWorkflowAlertActivity.class.getName()).await();

        // Check more frequently when in an unhealthy state
        nextSleepInterval = Duration.ofMinutes(5);
      }

      // Put the workflow to sleep until the determined time
      try {
        ctx.createTimer(nextSleepInterval);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }

      // Restart from the beginning with the updated state
      ctx.continueAsNew();
    }
  }
}
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
type JobStatus struct {
	JobID     string `json:"job_id"`
	IsHealthy bool   `json:"is_healthy"`
}
func StatusMonitorWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var sleepInterval time.Duration
	var job JobStatus
	if err := ctx.GetInput(&job); err != nil {
		return "", err
	}
	var status string
	if err := ctx.CallActivity(CheckStatus, workflow.ActivityInput(job)).Await(&status); err != nil {
		return "", err
	}
	if status == "healthy" {
		job.IsHealthy = true
		sleepInterval = time.Second * 60
	} else {
		if job.IsHealthy {
			job.IsHealthy = false
			err := ctx.CallActivity(SendAlert, workflow.ActivityInput(fmt.Sprintf("Job '%s' is unhealthy!", job.JobID))).Await(nil)
			if err != nil {
				return "", err
			}
		}
		sleepInterval = time.Second * 5
	}
	if err := ctx.CreateTimer(sleepInterval).Await(nil); err != nil {
		return "", err
	}
	ctx.ContinueAsNew(job, false)
	return "", nil
}
func CheckStatus(ctx workflow.ActivityContext) (any, error) {
	statuses := []string{"healthy", "unhealthy"}
	return statuses[rand.Intn(1)], nil
}
func SendAlert(ctx workflow.ActivityContext) (any, error) {
	var message string
	if err := ctx.GetInput(&message); err != nil {
		return "", err
	}
	fmt.Printf("*** Alert: %s", message)
	return "", nil
}
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

{{< tabs Python JavaScript ".NET" Java Go >}}

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

{{% codetab %}}
<!--javascript-->

```javascript
import {
  Task,
  DaprWorkflowClient,
  WorkflowActivityContext,
  WorkflowContext,
  WorkflowRuntime,
  TWorkflow,
} from "@dapr/dapr";
import * as readlineSync from "readline-sync";

// Wrap the entire code in an immediately-invoked async function
async function start() {
  class Order {
    cost: number;
    product: string;
    quantity: number;
    constructor(cost: number, product: string, quantity: number) {
      this.cost = cost;
      this.product = product;
      this.quantity = quantity;
    }
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Update the gRPC client and worker to use a local address and port
  const daprHost = "localhost";
  const daprPort = "50001";
  const workflowClient = new DaprWorkflowClient({
    daprHost,
    daprPort,
  });
  const workflowRuntime = new WorkflowRuntime({
    daprHost,
    daprPort,
  });

  // Activity function that sends an approval request to the manager
  const sendApprovalRequest = async (_: WorkflowActivityContext, order: Order) => {
    // Simulate some work that takes an amount of time
    await sleep(3000);
    console.log(`Sending approval request for order: ${order.product}`);
  };

  // Activity function that places an order
  const placeOrder = async (_: WorkflowActivityContext, order: Order) => {
    console.log(`Placing order: ${order.product}`);
  };

  // Orchestrator function that represents a purchase order workflow
  const purchaseOrderWorkflow: TWorkflow = async function* (ctx: WorkflowContext, order: Order): any {
    // Orders under $1000 are auto-approved
    if (order.cost < 1000) {
      return "Auto-approved";
    }

    // Orders of $1000 or more require manager approval
    yield ctx.callActivity(sendApprovalRequest, order);

    // Approvals must be received within 24 hours or they will be cancled.
    const tasks: Task<any>[] = [];
    const approvalEvent = ctx.waitForExternalEvent("approval_received");
    const timeoutEvent = ctx.createTimer(24 * 60 * 60);
    tasks.push(approvalEvent);
    tasks.push(timeoutEvent);
    const winner = ctx.whenAny(tasks);

    if (winner == timeoutEvent) {
      return "Cancelled";
    }

    yield ctx.callActivity(placeOrder, order);
    const approvalDetails = approvalEvent.getResult();
    return `Approved by ${approvalDetails.approver}`;
  };

  workflowRuntime
    .registerWorkflow(purchaseOrderWorkflow)
    .registerActivity(sendApprovalRequest)
    .registerActivity(placeOrder);

  // Wrap the worker startup in a try-catch block to handle any errors during startup
  try {
    await workflowRuntime.start();
    console.log("Worker started successfully");
  } catch (error) {
    console.error("Error starting worker:", error);
  }

  // Schedule a new orchestration
  try {
    const cost = readlineSync.questionInt("Cost of your order:");
    const approver = readlineSync.question("Approver of your order:");
    const timeout = readlineSync.questionInt("Timeout for your order in seconds:");
    const order = new Order(cost, "MyProduct", 1);
    const id = await workflowClient.scheduleNewWorkflow(purchaseOrderWorkflow, order);
    console.log(`Orchestration scheduled with ID: ${id}`);

    // prompt for approval asynchronously
    promptForApproval(approver, workflowClient, id);

    // Wait for orchestration completion
    const state = await workflowClient.waitForWorkflowCompletion(id, undefined, timeout + 2);

    console.log(`Orchestration completed! Result: ${state?.serializedOutput}`);
  } catch (error) {
    console.error("Error scheduling or waiting for orchestration:", error);
  }

  // stop worker and client
  await workflowRuntime.stop();
  await workflowClient.stop();

  // stop the dapr side car
  process.exit(0);
}

async function promptForApproval(approver: string, workflowClient: DaprWorkflowClient, id: string) {
  if (readlineSync.keyInYN("Press [Y] to approve the order... Y/yes, N/no")) {
    const approvalEvent = { approver: approver };
    await workflowClient.raiseEvent(id, "approval_received", approvalEvent);
  } else {
    return "Order rejected";
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

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

> **Note** In the example above, `RequestApprovalActivity` is the name of a workflow activity to invoke and `ApprovalResult` is an enumeration defined by the workflow app. For brevity, these definitions were left out of the example code.

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
public class ExternalSystemInteractionWorkflow extends Workflow {
    @Override
    public WorkflowStub create() {
        return ctx -> {
            // ...other steps...
            Integer orderCost = ctx.getInput(int.class);
            // Require orders over a certain threshold to be approved
            if (orderCost > ORDER_APPROVAL_THRESHOLD) {
                try {
                    // Request human approval for this order
                    ctx.callActivity("RequestApprovalActivity", orderCost, Void.class).await();
                    // Pause and wait for a human to approve the order
                    boolean approved = ctx.waitForExternalEvent("ManagerApproval", Duration.ofDays(3), boolean.class).await();
                    if (!approved) {
                        // The order was rejected, end the workflow here
                        ctx.complete("Process reject");
                    }
                } catch (TaskCanceledException e) {
                    // An approval timeout results in automatic order cancellation
                    ctx.complete("Process cancel");
                }
            }
            // ...other steps...

            // End the workflow with a success result
            ctx.complete("Process approved");
        };
    }
}
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
type Order struct {
	Cost     float64 `json:"cost"`
	Product  string  `json:"product"`
	Quantity int     `json:"quantity"`
}
type Approval struct {
	Approver string `json:"approver"`
}
func PurchaseOrderWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	// Orders under $1000 are auto-approved
	if order.Cost < 1000 {
		return "Auto-approved", nil
	}
	// Orders of $1000 or more require manager approval
	if err := ctx.CallActivity(SendApprovalRequest, workflow.ActivityInput(order)).Await(nil); err != nil {
		return "", err
	}
	// Approvals must be received within 24 hours or they will be cancelled
	var approval Approval
	if err := ctx.WaitForExternalEvent("approval_received", time.Hour*24).Await(&approval); err != nil {
		// Assuming that a timeout has taken place - in any case; an error.
		return "error/cancelled", err
	}
	// The order was approved
	if err := ctx.CallActivity(PlaceOrder, workflow.ActivityInput(order)).Await(nil); err != nil {
		return "", err
	}
	return fmt.Sprintf("Approved by %s", approval.Approver), nil
}
func SendApprovalRequest(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	fmt.Printf("*** Sending approval request for order: %v\n", order)
	return "", nil
}
func PlaceOrder(ctx workflow.ActivityContext) (any, error) {
	var order Order
	if err := ctx.GetInput(&order); err != nil {
		return "", err
	}
	fmt.Printf("*** Placing order: %v", order)
	return "", nil
}
```

{{% /codetab %}}

{{< /tabs >}}

The code that delivers the event to resume the workflow execution is external to the workflow. Workflow events can be delivered to a waiting workflow instance using the [raise event]({{< ref "howto-manage-workflow.md#raise-an-event" >}}) workflow management API, as shown in the following example:

{{< tabs Python JavaScript ".NET" Java Go >}}

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

{{% codetab %}}
<!--javascript-->

```javascript
import { DaprClient } from "@dapr/dapr";

  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }
```

{{% /codetab %}}

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
<!--java-->

```java
System.out.println("**SendExternalMessage: RestartEvent**");
client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");
```

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
func raiseEvent() {
  daprClient, err := client.NewClient()
  if err != nil {
    log.Fatalf("failed to initialize the client")
  }
  err = daprClient.RaiseEventWorkflowBeta1(context.Background(), &client.RaiseEventWorkflowRequest{
    InstanceID: "instance_id",
    WorkflowComponent: "dapr",
    EventName: "approval_received",
    EventData: Approval{
      Approver: "Jane Doe",
    },
  })
  if err != nil {
    log.Fatalf("failed to raise event on workflow")
  }
  log.Println("raised an event on specified workflow")
}
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
- Try out the following examples: 
   - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
   - [JavaScript](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
   - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
   - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
   - [Go](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
