---
type: docs
title: "How to: Author a workflow"
linkTitle: "How to: Author workflows"
weight: 5000
description: "Learn how to develop and author workflows"
---

This article provides a high-level overview of how to author workflows that are executed by the Dapr Workflow engine.

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the workflow quickstart]({{% ref workflow-quickstart.md %}}) for a quick walk-through on how to use workflows.

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

[Workflow activities]({{% ref "workflow-features-concepts.md#workflow-activites" %}}) are the basic unit of work in a workflow and are the tasks that get orchestrated in the business process.

{{< tabpane text=true >}}

{{% tab "Python" %}}

<!--python-->

Define the workflow activities you'd like your workflow to perform. Activities are a function definition and can take inputs and outputs. The following example creates a counter (activity) called `hello_act` that notifies users of the current counter value. `hello_act` is a function derived from a class called `WorkflowActivityContext`.

```python
@wfr.activity(name='hello_act')
def hello_act(ctx: WorkflowActivityContext, wf_input):
    global counter
    counter += wf_input
    print(f'New counter value is: {counter}!', flush=True)
```

[See the task chaining workflow activity in context.](https://github.com/dapr/python-sdk/blob/main/examples/workflow/simple.py)


{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

Define the workflow activities you'd like your workflow to perform. Activities are wrapped in the `WorkflowActivityContext` class, which implements the workflow activities. 

```javascript
export default class WorkflowActivityContext {
  private readonly _innerContext: ActivityContext;
  constructor(innerContext: ActivityContext) {
    if (!innerContext) {
      throw new Error("ActivityContext cannot be undefined");
    }
    this._innerContext = innerContext;
  }

  public getWorkflowInstanceId(): string {
    return this._innerContext.orchestrationId;
  }

  public getWorkflowActivityId(): number {
    return this._innerContext.taskId;
  }
}
```

[See the workflow activity in context.](https://github.com/dapr/js-sdk/blob/main/src/workflow/runtime/WorkflowActivityContext.ts)


{{% /tab %}}

{{% tab ".NET" %}}

<!--csharp-->

Define the workflow activities you'd like your workflow to perform. Activities are a class definition and can take inputs and outputs. Activities also participate in dependency injection, like binding to a Dapr client. 

The activities called in the example below are:
- `NotifyActivity`: Receive notification of a new order.
- `ReserveInventoryActivity`: Check for sufficient inventory to meet the new order.
- `ProcessPaymentActivity`: Process payment for the order. Includes `NotifyActivity` to send notification of successful order.

### NotifyActivity

```csharp
public class NotifyActivity : WorkflowActivity<Notification, object>
{
    //...

    public NotifyActivity(ILoggerFactory loggerFactory)
    {
        this.logger = loggerFactory.CreateLogger<NotifyActivity>();
    }

    //...
}
```

[See the full `NotifyActivity.cs` workflow activity example.](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/NotifyActivity.cs)

### ReserveInventoryActivity

```csharp
public class ReserveInventoryActivity : WorkflowActivity<InventoryRequest, InventoryResult>
{
    //...

    public ReserveInventoryActivity(ILoggerFactory loggerFactory, DaprClient client)
    {
        this.logger = loggerFactory.CreateLogger<ReserveInventoryActivity>();
        this.client = client;
    }

    //...

}
```
[See the full `ReserveInventoryActivity.cs` workflow activity example.](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ReserveInventoryActivity.cs)

### ProcessPaymentActivity

```csharp
public class ProcessPaymentActivity : WorkflowActivity<PaymentRequest, object>
{
    //...
    public ProcessPaymentActivity(ILoggerFactory loggerFactory)
    {
        this.logger = loggerFactory.CreateLogger<ProcessPaymentActivity>();
    }

    //...

}
```

[See the full `ProcessPaymentActivity.cs` workflow activity example.](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Activities/ProcessPaymentActivity.cs)

{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

Define the workflow activities you'd like your workflow to perform. Activities are wrapped in the public `DemoWorkflowActivity` class, which implements the workflow activities. 

```java
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class DemoWorkflowActivity implements WorkflowActivity {

  @Override
  public DemoActivityOutput run(WorkflowActivityContext ctx) {
    Logger logger = LoggerFactory.getLogger(DemoWorkflowActivity.class);
    logger.info("Starting Activity: " + ctx.getName());

    var message = ctx.getInput(DemoActivityInput.class).getMessage();
    var newMessage = message + " World!, from Activity";
    logger.info("Message Received from input: " + message);
    logger.info("Sending message to output: " + newMessage);

    logger.info("Sleeping for 5 seconds to simulate long running operation...");

    try {
      TimeUnit.SECONDS.sleep(5);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }


    logger.info("Activity finished");

    var output = new DemoActivityOutput(message, newMessage);
    logger.info("Activity returned: " + output);

    return output;
  }
}
```

[See the Java SDK workflow activity example in context.](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowActivity.java)

{{% /tab %}}

{{% tab "Go" %}}

<!--go-->

### Define workflow activities

Define each workflow activity you'd like your workflow to perform. The Activity input can be unmarshalled from the context with `ctx.GetInput`. Activities should be defined as taking a `ctx workflow.ActivityContext` parameter and returning an interface and error.
 
```go
func BusinessActivity(ctx workflow.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}
	
	// Do something here
	return "result", nil
}
```

### Define the workflow

Define your workflow function with the parameter `ctx *workflow.WorkflowContext` and return any and error. Invoke your defined activities from within your workflow.

```go
func BusinessWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var output string
	if err := ctx.CallActivity(BusinessActivity, workflow.ActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}
	if err := ctx.WaitForExternalEvent("businessEvent", time.Second*60).Await(&output); err != nil {
		return nil, err
	}
	
	if err := ctx.CreateTimer(time.Second).Await(nil); err != nil {
		return nil, nil
	}
	return output, nil
}
```

### Register workflows and activities

Before your application can execute workflows, you must register both the workflow orchestrator and its activities with a workflow registry. This ensures Dapr knows which functions to call when executing your workflow.

```go
func main() {
	// Create a workflow registry
	r := workflow.NewRegistry()

	// Register the workflow orchestrator
	if err := r.AddWorkflow(BusinessWorkflow); err != nil {
		log.Fatal(err)
	}
	fmt.Println("BusinessWorkflow registered")

	// Register the workflow activities
	if err := r.AddActivity(BusinessActivity); err != nil {
		log.Fatal(err)
	}
	fmt.Println("BusinessActivity registered")

	// Create workflow client and start worker
	wclient, err := client.NewWorkflowClient()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Worker initialized")

	ctx, cancel := context.WithCancel(context.Background())
	if err = wclient.StartWorker(ctx, r); err != nil {
		log.Fatal(err)
	}
	fmt.Println("runner started")

	// Your application logic continues here...
	// Example: Start a workflow
	instanceID, err := wclient.ScheduleWorkflow(ctx, "BusinessWorkflow", workflow.WithInput(1))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}
	fmt.Printf("workflow started with id: %v\n", instanceID)

	// Stop workflow worker when done
	cancel()
	fmt.Println("workflow worker successfully shutdown")
}
```

**Key points about registration:**
- Use `workflow.NewRegistry()` to create a workflow registry
- Use `r.AddWorkflow()` to register workflow functions
- Use `r.AddActivity()` to register activity functions  
- Use `client.NewWorkflowClient()` to create a workflow client
- Call `wclient.StartWorker()` to begin processing workflows
- Use `wclient.ScheduleWorkflow` to schedule a named instance of a workflow

[See the Go SDK workflow activity example in context.](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /tab %}}

{{< /tabpane >}}

## Write the workflow

Next, register and call the activites in a workflow. 

{{< tabpane text=true >}}

{{% tab "Python" %}}

<!--python-->

The `hello_world_wf` function is a function derived from a class called `DaprWorkflowContext` with input and output parameter types. It also includes a `yield` statement that does the heavy lifting of the workflow and calls the workflow activities. 
 
```python
@wfr.workflow(name='hello_world_wf')
def hello_world_wf(ctx: DaprWorkflowContext, wf_input):
    print(f'{wf_input}')
    yield ctx.call_activity(hello_act, input=1)
    yield ctx.call_activity(hello_act, input=10)
    yield ctx.call_activity(hello_retryable_act, retry_policy=retry_policy)
    yield ctx.call_child_workflow(child_retryable_wf, retry_policy=retry_policy)

    # Change in event handling: Use when_any to handle both event and timeout
    event = ctx.wait_for_external_event(event_name)
    timeout = ctx.create_timer(timedelta(seconds=30))
    winner = yield when_any([event, timeout])

    if winner == timeout:
        print('Workflow timed out waiting for event')
        return 'Timeout'

    yield ctx.call_activity(hello_act, input=100)
    yield ctx.call_activity(hello_act, input=1000)
    return 'Completed'
```

[See the `hello_world_wf` workflow in context.](https://github.com/dapr/python-sdk/blob/main/examples/workflow/simple.py)


{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

Next, register the workflow with the `WorkflowRuntime` class and start the workflow runtime.
 
```javascript
export default class WorkflowRuntime {

  //..
  // Register workflow implementation for handling orchestrations
  public registerWorkflow(workflow: TWorkflow): WorkflowRuntime {
    const name = getFunctionName(workflow);
    const workflowWrapper = (ctx: OrchestrationContext, input: any): any => {
      const workflowContext = new WorkflowContext(ctx);
      return workflow(workflowContext, input);
    };
    this.worker.addNamedOrchestrator(name, workflowWrapper);
    return this;
  }

  // Register workflow activities
  public registerActivity(fn: TWorkflowActivity<TInput, TOutput>): WorkflowRuntime {
    const name = getFunctionName(fn);
    const activityWrapper = (ctx: ActivityContext, input: TInput): TOutput => {
      const wfActivityContext = new WorkflowActivityContext(ctx);
      return fn(wfActivityContext, input);
    };
    this.worker.addNamedActivity(name, activityWrapper);
    return this;
  }

  // Start the workflow runtime processing items and block.
  public async start() {
    await this.worker.start();
  }

}
```

[See the `WorkflowRuntime` in context.](https://github.com/dapr/js-sdk/blob/main/src/workflow/runtime/WorkflowRuntime.ts)


{{% /tab %}}

{{% tab ".NET" %}}

<!--csharp-->

The `OrderProcessingWorkflow` class is derived from a base class called `Workflow` with input and output parameter types. It also includes a `RunAsync` method that does the heavy lifting of the workflow and calls the workflow activities. 

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

[See the full workflow example in `OrderProcessingWorkflow.cs`.](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Workflows/OrderProcessingWorkflow.cs)


{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

Next, register the workflow with the `WorkflowRuntimeBuilder` and start the workflow runtime.

```java
public class DemoWorkflowWorker {

  public static void main(String[] args) throws Exception {

    // Register the Workflow with the builder.
    WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder().registerWorkflow(DemoWorkflow.class);
    builder.registerActivity(DemoWorkflowActivity.class);

    // Build and then start the workflow runtime pulling and executing tasks
    try (WorkflowRuntime runtime = builder.build()) {
      System.out.println("Start workflow runtime");
      runtime.start();
    }

    System.exit(0);
  }
}
```

[See the Java SDK workflow in context.](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowWorker.java)


{{% /tab %}}

{{% tab "Go" %}}

<!--go-->

Define your workflow function with the parameter `ctx *workflow.WorkflowContext` and return any and error. Invoke your defined activities from within your workflow.

```go
func BusinessWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var output string
	if err := ctx.CallActivity(BusinessActivity, workflow.ActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}
	if err := ctx.WaitForExternalEvent("businessEvent", time.Second*60).Await(&output); err != nil {
		return nil, err
	}
	
	if err := ctx.CreateTimer(time.Second).Await(nil); err != nil {
		return nil, nil
	}
	return output, nil
}
```

[See the Go SDK workflow in context.](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /tab %}}

{{< /tabpane >}}

## Write the application

Finally, compose the application using the workflow.

{{< tabpane text=true >}}

{{% tab "Python" %}}

<!--python-->

[In the following example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/simple.py), for a basic Python hello world application using the Python SDK, your project code would include:

- A Python package called `DaprClient` to receive the Python SDK capabilities.
- A builder with extensions called:
  - `WorkflowRuntime`: Allows you to register the workflow runtime. 
  - `DaprWorkflowContext`: Allows you to [create workflows]({{% ref "#write-the-workflow" %}})
  - `WorkflowActivityContext`: Allows you to [create workflow activities]({{% ref "#write-the-workflow-activities" %}})
- API calls. In the example below, these calls start, pause, resume, purge, and completing the workflow.
 
```python
from datetime import timedelta
from time import sleep
from dapr.ext.workflow import (
    WorkflowRuntime,
    DaprWorkflowContext,
    WorkflowActivityContext,
    RetryPolicy,
    DaprWorkflowClient,
    when_any,
)
from dapr.conf import Settings
from dapr.clients.exceptions import DaprInternalError

settings = Settings()

counter = 0
retry_count = 0
child_orchestrator_count = 0
child_orchestrator_string = ''
child_act_retry_count = 0
instance_id = 'exampleInstanceID'
child_instance_id = 'childInstanceID'
workflow_name = 'hello_world_wf'
child_workflow_name = 'child_wf'
input_data = 'Hi Counter!'
event_name = 'event1'
event_data = 'eventData'
non_existent_id_error = 'no such instance exists'

retry_policy = RetryPolicy(
    first_retry_interval=timedelta(seconds=1),
    max_number_of_attempts=3,
    backoff_coefficient=2,
    max_retry_interval=timedelta(seconds=10),
    retry_timeout=timedelta(seconds=100),
)

wfr = WorkflowRuntime()


@wfr.workflow(name='hello_world_wf')
def hello_world_wf(ctx: DaprWorkflowContext, wf_input):
    print(f'{wf_input}')
    yield ctx.call_activity(hello_act, input=1)
    yield ctx.call_activity(hello_act, input=10)
    yield ctx.call_activity(hello_retryable_act, retry_policy=retry_policy)
    yield ctx.call_child_workflow(child_retryable_wf, retry_policy=retry_policy)

    # Change in event handling: Use when_any to handle both event and timeout
    event = ctx.wait_for_external_event(event_name)
    timeout = ctx.create_timer(timedelta(seconds=30))
    winner = yield when_any([event, timeout])

    if winner == timeout:
        print('Workflow timed out waiting for event')
        return 'Timeout'

    yield ctx.call_activity(hello_act, input=100)
    yield ctx.call_activity(hello_act, input=1000)
    return 'Completed'


@wfr.activity(name='hello_act')
def hello_act(ctx: WorkflowActivityContext, wf_input):
    global counter
    counter += wf_input
    print(f'New counter value is: {counter}!', flush=True)


@wfr.activity(name='hello_retryable_act')
def hello_retryable_act(ctx: WorkflowActivityContext):
    global retry_count
    if (retry_count % 2) == 0:
        print(f'Retry count value is: {retry_count}!', flush=True)
        retry_count += 1
        raise ValueError('Retryable Error')
    print(f'Retry count value is: {retry_count}! This print statement verifies retry', flush=True)
    retry_count += 1


@wfr.workflow(name='child_retryable_wf')
def child_retryable_wf(ctx: DaprWorkflowContext):
    global child_orchestrator_string, child_orchestrator_count
    if not ctx.is_replaying:
        child_orchestrator_count += 1
        print(f'Appending {child_orchestrator_count} to child_orchestrator_string!', flush=True)
        child_orchestrator_string += str(child_orchestrator_count)
    yield ctx.call_activity(
        act_for_child_wf, input=child_orchestrator_count, retry_policy=retry_policy
    )
    if child_orchestrator_count < 3:
        raise ValueError('Retryable Error')


@wfr.activity(name='act_for_child_wf')
def act_for_child_wf(ctx: WorkflowActivityContext, inp):
    global child_orchestrator_string, child_act_retry_count
    inp_char = chr(96 + inp)
    print(f'Appending {inp_char} to child_orchestrator_string!', flush=True)
    child_orchestrator_string += inp_char
    if child_act_retry_count % 2 == 0:
        child_act_retry_count += 1
        raise ValueError('Retryable Error')
    child_act_retry_count += 1


def main():
    wfr.start()
    wf_client = DaprWorkflowClient()

    print('==========Start Counter Increase as per Input:==========')
    wf_client.schedule_new_workflow(
        workflow=hello_world_wf, input=input_data, instance_id=instance_id
    )

    wf_client.wait_for_workflow_start(instance_id)

    # Sleep to let the workflow run initial activities
    sleep(12)

    assert counter == 11
    assert retry_count == 2
    assert child_orchestrator_string == '1aa2bb3cc'

    # Pause Test
    wf_client.pause_workflow(instance_id=instance_id)
    metadata = wf_client.get_workflow_state(instance_id=instance_id)
    print(f'Get response from {workflow_name} after pause call: {metadata.runtime_status.name}')

    # Resume Test
    wf_client.resume_workflow(instance_id=instance_id)
    metadata = wf_client.get_workflow_state(instance_id=instance_id)
    print(f'Get response from {workflow_name} after resume call: {metadata.runtime_status.name}')

    sleep(2)  # Give the workflow time to reach the event wait state
    wf_client.raise_workflow_event(instance_id=instance_id, event_name=event_name, data=event_data)

    print('========= Waiting for Workflow completion', flush=True)
    try:
        state = wf_client.wait_for_workflow_completion(instance_id, timeout_in_seconds=30)
        if state.runtime_status.name == 'COMPLETED':
            print('Workflow completed! Result: {}'.format(state.serialized_output.strip('"')))
        else:
            print(f'Workflow failed! Status: {state.runtime_status.name}')
    except TimeoutError:
        print('*** Workflow timed out!')

    wf_client.purge_workflow(instance_id=instance_id)
    try:
        wf_client.get_workflow_state(instance_id=instance_id)
    except DaprInternalError as err:
        if non_existent_id_error in err._message:
            print('Instance Successfully Purged')

    wfr.shutdown()


if __name__ == '__main__':
    main()
```

{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

[The following example](https://github.com/dapr/js-sdk/blob/main/src/workflow/client/DaprWorkflowClient.ts) is a basic JavaScript application using the JavaScript SDK. As in this example, your project code would include:

- A builder with extensions called:
  - `WorkflowRuntime`: Allows you to register workflows and workflow activities
  - `DaprWorkflowContext`: Allows you to [create workflows]({{% ref "#write-the-workflow" %}})
  - `WorkflowActivityContext`: Allows you to [create workflow activities]({{% ref "#write-the-workflow-activities" %}})
- API calls. In the example below, these calls start, terminate, get status, pause, resume, raise event, and purge the workflow.
 
```javascript
import { TaskHubGrpcClient } from "@microsoft/durabletask-js";
import { WorkflowState } from "./WorkflowState";
import { generateApiTokenClientInterceptors, generateEndpoint, getDaprApiToken } from "../internal/index";
import { TWorkflow } from "../../types/workflow/Workflow.type";
import { getFunctionName } from "../internal";
import { WorkflowClientOptions } from "../../types/workflow/WorkflowClientOption";

/** DaprWorkflowClient class defines client operations for managing workflow instances. */

export default class DaprWorkflowClient {
  private readonly _innerClient: TaskHubGrpcClient;

  /** Initialize a new instance of the DaprWorkflowClient.
   */
  constructor(options: Partial<WorkflowClientOptions> = {}) {
    const grpcEndpoint = generateEndpoint(options);
    options.daprApiToken = getDaprApiToken(options);
    this._innerClient = this.buildInnerClient(grpcEndpoint.endpoint, options);
  }

  private buildInnerClient(hostAddress: string, options: Partial<WorkflowClientOptions>): TaskHubGrpcClient {
    let innerOptions = options?.grpcOptions;
    if (options.daprApiToken !== undefined && options.daprApiToken !== "") {
      innerOptions = {
        ...innerOptions,
        interceptors: [generateApiTokenClientInterceptors(options), ...(innerOptions?.interceptors ?? [])],
      };
    }
    return new TaskHubGrpcClient(hostAddress, innerOptions);
  }

  /**
   * Schedule a new workflow using the DurableTask client.
   */
  public async scheduleNewWorkflow(
    workflow: TWorkflow | string,
    input?: any,
    instanceId?: string,
    startAt?: Date,
  ): Promise<string> {
    if (typeof workflow === "string") {
      return await this._innerClient.scheduleNewOrchestration(workflow, input, instanceId, startAt);
    }
    return await this._innerClient.scheduleNewOrchestration(getFunctionName(workflow), input, instanceId, startAt);
  }

  /**
   * Terminate the workflow associated with the provided instance id.
   *
   * @param {string} workflowInstanceId - Workflow instance id to terminate.
   * @param {any} output - The optional output to set for the terminated workflow instance.
   */
  public async terminateWorkflow(workflowInstanceId: string, output: any) {
    await this._innerClient.terminateOrchestration(workflowInstanceId, output);
  }

  /**
   * Fetch workflow instance metadata from the configured durable store.
   */
  public async getWorkflowState(
    workflowInstanceId: string,
    getInputsAndOutputs: boolean,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.getOrchestrationState(workflowInstanceId, getInputsAndOutputs);
    if (state !== undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Waits for a workflow to start running
   */
  public async waitForWorkflowStart(
    workflowInstanceId: string,
    fetchPayloads = true,
    timeoutInSeconds = 60,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.waitForOrchestrationStart(
      workflowInstanceId,
      fetchPayloads,
      timeoutInSeconds,
    );
    if (state !== undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Waits for a workflow to complete running
   */
  public async waitForWorkflowCompletion(
    workflowInstanceId: string,
    fetchPayloads = true,
    timeoutInSeconds = 60,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.waitForOrchestrationCompletion(
      workflowInstanceId,
      fetchPayloads,
      timeoutInSeconds,
    );
    if (state != undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Sends an event notification message to an awaiting workflow instance
   */
  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }

  /**
   * Purges the workflow instance state from the workflow state store.
   */
  public async purgeWorkflow(workflowInstanceId: string): Promise<boolean> {
    const purgeResult = await this._innerClient.purgeOrchestration(workflowInstanceId);
    if (purgeResult !== undefined) {
      return purgeResult.deletedInstanceCount > 0;
    }
    return false;
  }

  /**
   * Closes the inner DurableTask client and shutdown the GRPC channel.
   */
  public async stop() {
    await this._innerClient.stop();
  }
}
```

{{% /tab %}}

{{% tab ".NET" %}}

<!--csharp-->

[In the following `Program.cs` example](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Program.cs), for a basic ASP.NET order processing application using the .NET SDK, your project code would include:

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
app.MapPost("/orders", async (DaprWorkflowClient client, [FromBody] OrderPayload orderInfo) =>
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
app.MapGet("/orders/{orderId}", async (string orderId, DaprWorkflowClient client) =>
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

{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

[As in the following example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java), a hello-world application using the Java SDK and Dapr Workflow would include:

- A Java package called `io.dapr.workflows.client` to receive the Java SDK client capabilities.
- An import of `io.dapr.workflows.Workflow`
- The `DemoWorkflow` class which extends `Workflow`
- Creating the workflow with input and output.
- API calls. In the example below, these calls start and call the workflow activities.
 
```java
package io.dapr.examples.workflows;

import com.microsoft.durabletask.CompositeTaskFailedException;
import com.microsoft.durabletask.Task;
import com.microsoft.durabletask.TaskCanceledException;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * Implementation of the DemoWorkflow for the server side.
 */
public class DemoWorkflow extends Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());
      // ...
      ctx.getLogger().info("Calling Activity...");
      var input = new DemoActivityInput("Hello Activity!");
      var output = ctx.callActivity(DemoWorkflowActivity.class.getName(), input, DemoActivityOutput.class).await();
      // ...
    };
  }
}
```

[See the full Java SDK workflow example in context.](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflow.java)

{{% /tab %}}

{{% tab "Go" %}}

<!--go-->

[As in the following example](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md), a hello-world application using the Go SDK and Dapr Workflow would include:

- A Go package called `client` to receive the Go SDK client capabilities.
- The `BusinessWorkflow` method
- Creating the workflow with input and output.
- API calls. In the example below, these calls start and call the workflow activities.


```go
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/dapr/durabletask-go/workflow"
	"github.com/dapr/go-sdk/client"
)

var stage = 0
var failActivityTries = 0

func main() {
	r := workflow.NewRegistry()

	if err := r.AddWorkflow(BusinessWorkflow); err != nil {
		log.Fatal(err)
	}
	fmt.Println("BusinessWorkflow registered")

	if err := r.AddActivity(BusinessActivity); err != nil {
		log.Fatal(err)
	}
	fmt.Println("BusinessActivity registered")

	if err := r.AddActivity(FailActivity); err != nil {
		log.Fatal(err)
	}
	fmt.Println("FailActivity registered")

	wclient, err := client.NewWorkflowClient()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Worker initialized")

	ctx, cancel := context.WithCancel(context.Background())
	if err = wclient.StartWorker(ctx, r); err != nil {
		log.Fatal(err)
	}
	fmt.Println("runner started")

	// Start workflow test
	// Set the start time to the current time to not wait for the workflow to
	// "start". This is useful for increasing the throughput of creating
	// workflows.
	// workflow.WithStartTime(time.Now())
	instanceID, err := wclient.ScheduleWorkflow(ctx, "BusinessWorkflow", workflow.WithInstanceID("a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9"), workflow.WithInput(1))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}
	fmt.Printf("workflow started with id: %v\n", instanceID)

	// Pause workflow test
	err = wclient.SuspendWorkflow(ctx, instanceID, "")
	if err != nil {
		log.Fatalf("failed to pause workflow: %v", err)
	}

	respFetch, err := wclient.FetchWorkflowMetadata(ctx, instanceID, workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("failed to fetch workflow: %v", err)
	}

	if respFetch.RuntimeStatus != workflow.StatusSuspended {
		log.Fatalf("workflow not paused: %s: %v", respFetch.RuntimeStatus, respFetch)
	}

	fmt.Printf("workflow paused\n")

	// Resume workflow test
	err = wclient.ResumeWorkflow(ctx, instanceID, "")
	if err != nil {
		log.Fatalf("failed to resume workflow: %v", err)
	}

	respFetch, err = wclient.FetchWorkflowMetadata(ctx, instanceID, workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	if respFetch.RuntimeStatus != workflow.StatusRunning {
		log.Fatalf("workflow not running")
	}

	fmt.Println("workflow resumed")

	fmt.Printf("stage: %d\n", stage)

	// Raise Event
	err = wclient.RaiseEvent(ctx, instanceID, "businessEvent", workflow.WithEventPayload("testData"))
	if err != nil {
		fmt.Printf("failed to raise event: %v", err)
	}

	fmt.Println("workflow event raised")

	time.Sleep(time.Second) // allow workflow to advance

	fmt.Printf("stage: %d\n", stage)

	waitCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	_, err = wclient.WaitForWorkflowCompletion(waitCtx, instanceID)
	cancel()
	if err != nil {
		log.Fatalf("failed to wait for workflow: %v", err)
	}

	fmt.Printf("fail activity executions: %d\n", failActivityTries)

	respFetch, err = wclient.FetchWorkflowMetadata(ctx, instanceID, workflow.WithFetchPayloads(true))
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}

	fmt.Printf("workflow status: %v\n", respFetch.String())

	// Purge workflow test
	err = wclient.PurgeWorkflowState(ctx, instanceID)
	if err != nil {
		log.Fatalf("failed to purge workflow: %v", err)
	}

	respFetch, err = wclient.FetchWorkflowMetadata(ctx, instanceID, workflow.WithFetchPayloads(true))
	if err == nil || respFetch != nil {
		log.Fatalf("failed to purge workflow: %v", err)
	}

	fmt.Println("workflow purged")

	fmt.Printf("stage: %d\n", stage)

	// Terminate workflow test
	id, err := wclient.ScheduleWorkflow(ctx, "BusinessWorkflow", workflow.WithInstanceID("a7a4168d-3a1c-41da-8a4f-e7f6d9c718d9"), workflow.WithInput(1))
	if err != nil {
		log.Fatalf("failed to start workflow: %v", err)
	}
	fmt.Printf("workflow started with id: %v\n", instanceID)

	metadata, err := wclient.WaitForWorkflowStart(ctx, id)
	if err != nil {
		log.Fatalf("failed to get workflow: %v", err)
	}
	fmt.Printf("workflow status: %s\n", metadata.String())

	err = wclient.TerminateWorkflow(ctx, id)
	if err != nil {
		log.Fatalf("failed to terminate workflow: %v", err)
	}
	fmt.Println("workflow terminated")

	err = wclient.PurgeWorkflowState(ctx, id)
	if err != nil {
		log.Fatalf("failed to purge workflow: %v", err)
	}
	fmt.Println("workflow purged")

	cancel()

	fmt.Println("workflow worker successfully shutdown")
}

func BusinessWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return nil, err
	}
	var output string
	if err := ctx.CallActivity(BusinessActivity, task.WithActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}

	err := ctx.WaitForSingleEvent("businessEvent", time.Second*60).Await(&output)
	if err != nil {
		return nil, err
	}

	if err := ctx.CallActivity(BusinessActivity, task.WithActivityInput(input)).Await(&output); err != nil {
		return nil, err
	}

	if err := ctx.CallActivity(FailActivity, workflow.WithActivityRetryPolicy(&workflow.RetryPolicy{
		MaxAttempts:          3,
		InitialRetryInterval: 100 * time.Millisecond,
		BackoffCoefficient:   2,
		MaxRetryInterval:     1 * time.Second,
	})).Await(nil); err == nil {
		return nil, fmt.Errorf("unexpected no error executing fail activity")
	}

	return output, nil
}

func BusinessActivity(ctx task.ActivityContext) (any, error) {
	var input int
	if err := ctx.GetInput(&input); err != nil {
		return "", err
	}

	stage += input

	return fmt.Sprintf("Stage: %d", stage), nil
}

func FailActivity(ctx workflow.ActivityContext) (any, error) {
	failActivityTries += 1
	return nil, errors.New("dummy activity error")
}
```

[See the full Go SDK workflow example in context.](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)

{{% /tab %}}

{{< /tabpane >}}


{{% alert title="Important" color="warning" %}}
Because of how replay-based workflows execute, you'll write logic that does things like I/O and interacting with systems **inside activities**. Meanwhile, the **workflow method** is just for orchestrating those activities.

{{% /alert %}}

## Next steps

Now that you've authored a workflow, learn how to manage it.

{{< button text="Manage workflows >>" page="howto-manage-workflow.md" >}}

## Related links
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
- Try out the full SDK examples:
  - [Python example](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript example](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go example](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
