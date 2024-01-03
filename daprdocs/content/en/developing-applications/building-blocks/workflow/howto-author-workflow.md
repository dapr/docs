---
type: docs
title: "How to: Author a workflow"
linkTitle: "How to: Author workflows"
weight: 5000
description: "Learn how to develop and author workflows"
---

{{% alert title="Note" color="primary" %}}
Dapr Workflow is currently in beta. [See known limitations for {{% dapr-latest-version cli="true" %}}]({{< ref "workflow-overview.md#limitations" >}}).
{{% /alert %}}

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

[Workflow activities]({{< ref "workflow-features-concepts.md#workflow-activites" >}}) are the basic unit of work in a workflow and are the tasks that get orchestrated in the business process.

{{< tabs Python JavaScript ".NET" Java >}}

{{% codetab %}}

<!--python-->

Define the workflow activities you'd like your workflow to perform. Activities are a function definition and can take inputs and outputs. The following example creates a counter (activity) called `hello_act` that notifies users of the current counter value. `hello_act` is a function derived from a class called `WorkflowActivityContext`.

```python
def hello_act(ctx: WorkflowActivityContext, input):
    global counter
    counter += input
    print(f'New counter value is: {counter}!', flush=True)
```

[See the `hello_act` workflow activity in context.](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL40C1-L43C59)


{{% /codetab %}}

{{% codetab %}}

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

[See the workflow activity in context.](todo)


{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}


{{< /tabs >}}

## Write the workflow

Next, register and call the activites in a workflow. 

{{< tabs Python JavaScript ".NET" Java >}}

{{% codetab %}}

<!--python-->

The `hello_world_wf` function is derived from a class called `DaprWorkflowContext` with input and output parameter types. It also includes a `yield` statement that does the heavy lifting of the workflow and calls the workflow activities. 
 
```python
def hello_world_wf(ctx: DaprWorkflowContext, input):
    print(f'{input}')
    yield ctx.call_activity(hello_act, input=1)
    yield ctx.call_activity(hello_act, input=10)
    yield ctx.wait_for_external_event("event1")
    yield ctx.call_activity(hello_act, input=100)
    yield ctx.call_activity(hello_act, input=1000)
```

[See the `hello_world_wf` workflow in context.](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py#LL32C1-L38C51)


{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

Next, register the workflow with the `WorkflowRuntime` class and start the workflow runtime.
 
```javascript
export default class WorkflowRuntime {

  //..
  // Register workflow
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
    const activityWrapper = (ctx: ActivityContext, intput: TInput): TOutput => {
      const wfActivityContext = new WorkflowActivityContext(ctx);
      return fn(wfActivityContext, intput);
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

[See the `hello_world_wf` workflow in context.](todo)


{{% /codetab %}}

{{% codetab %}}

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


{{% /codetab %}}

{{% codetab %}}

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


{{% /codetab %}}

{{< /tabs >}}

## Write the application

Finally, compose the application using the workflow.

{{< tabs Python JavaScript ".NET" Java >}}

{{% codetab %}}

<!--python-->

[In the following example](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py), for a basic Python hello world application using the Python SDK, your project code would include:

- A Python package called `DaprClient` to receive the Python SDK capabilities.
- A builder with extensions called:
  - `WorkflowRuntime`: Allows you to register workflows and workflow activities
  - `DaprWorkflowContext`: Allows you to [create workflows]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`: Allows you to [create workflow activities]({{< ref "#write-the-workflow-activities" >}})
- API calls. In the example below, these calls start, pause, resume, purge, and terminate the workflow.
 
```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient

# ...

def main():
    with DaprClient() as d:
        host = settings.DAPR_RUNTIME_HOST
        port = settings.DAPR_GRPC_PORT
        workflowRuntime = WorkflowRuntime(host, port)
        workflowRuntime = WorkflowRuntime()
        workflowRuntime.register_workflow(hello_world_wf)
        workflowRuntime.register_activity(hello_act)
        workflowRuntime.start()

        # Start workflow
        print("==========Start Counter Increase as per Input:==========")
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # ...

        # Pause workflow
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after pause call: {getResponse.runtime_status}")

        # Resume workflow
        d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after resume call: {getResponse.runtime_status}")
        
        sleep(1)
        # Raise workflow
        d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)

        sleep(5)
        # Purge workflow
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")

        # Kick off another workflow for termination purposes 
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # Terminate workflow
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after terminate call: {getResponse.runtime_status}")

        # Purge workflow
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")

        workflowRuntime.shutdown()

if __name__ == '__main__':
    main()
```


{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

[In the following example](todo), for a basic JavaScript hello world application using the Go SDK, your project code would include:

- A JavaScript package called `todo` to receive the Go SDK capabilities.
- A builder with extensions called:
  - `WorkflowRuntime`: Allows you to register workflows and workflow activities
  - `DaprWorkflowContext`: Allows you to [create workflows]({{< ref "#write-the-workflow" >}})
  - `WorkflowActivityContext`: Allows you to [create workflow activities]({{< ref "#write-the-workflow-activities" >}})
- API calls. In the example below, these calls start, pause, resume, purge, and terminate the workflow.
 
```javascript
import { TaskHubGrpcClient } from "kaibocai-durabletask-js";
import * as grpc from "@grpc/grpc-js";
import { WorkflowState } from "./WorkflowState";
import { generateInterceptors } from "../internal/ApiTokenClientInterceptor";
import { TWorkflow } from "../types/Workflow.type";
import { getFunctionName } from "../internal";

export default class WorkflowClient {
  private readonly _innerClient: TaskHubGrpcClient;

  /**
   * Initializes a new instance of the DaprWorkflowClient.
   * @param {string | undefined} hostAddress - The address of the Dapr runtime hosting the workflow services.
   * @param {grpc.ChannelOptions | undefined} options - Additional options for configuring the gRPC channel.
   */
  constructor(hostAddress?: string, options?: grpc.ChannelOptions) {
    this._innerClient = this._buildInnerClient(hostAddress, options);
  }

  _buildInnerClient(hostAddress = "127.0.0.1:50001", options: grpc.ChannelOptions = {}): TaskHubGrpcClient {
    const innerOptions = {
      ...options,
      interceptors: [generateInterceptors(), ...(options?.interceptors ?? [])],
    };
    return new TaskHubGrpcClient(hostAddress, innerOptions);
  }

  /**
   * Schedules a new workflow using the DurableTask client.
   *
   * @param {TWorkflow | string} workflow - The Workflow or the name of the workflow to be scheduled.
   * @return {Promise<string>} A Promise resolving to the unique ID of the scheduled workflow instance.
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
   * Terminates the workflow associated with the provided instance id.
   *
   * @param {string} workflowInstanceId - Workflow instance id to terminate.
   * @param {any} output - The optional output to set for the terminated workflow instance.
   */
  public async terminateWorkflow(workflowInstanceId: string, output: any) {
    await this._innerClient.terminateOrchestration(workflowInstanceId, output);
  }

  /**
   * Fetches workflow instance metadata from the configured durable store.
   *
   * @param {string} workflowInstanceId - The unique identifier of the workflow instance to fetch.
   * @param {boolean} getInputsAndOutputs - Indicates whether to fetch the workflow instance's
   *                                       inputs, outputs, and custom status (true) or omit them (false).
   * @returns {Promise<WorkflowState | undefined>} A Promise that resolves to a metadata record describing
   *                                              the workflow instance and its execution status, or undefined
   *                                              if the instance is not found.
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
   * Waits for a workflow to start running and returns a {@link WorkflowState} object
   * containing metadata about the started instance, and optionally, its input, output,
   * and custom status payloads.
   *
   * A "started" workflow instance refers to any instance not in the Pending state.
   *
   * If a workflow instance is already running when this method is called, it returns immediately.
   *
   * @param {string} workflowInstanceId - The unique identifier of the workflow instance to wait for.
   * @param {boolean} fetchPayloads - Indicates whether to fetch the workflow instance's
   *                                  inputs, outputs (true) or omit them (false).
   * @param {number} timeout - The amount of time, in seconds, to wait for the workflow instance to start.
   * @returns {Promise<WorkflowState | undefined>} A Promise that resolves to the workflow instance metadata
   *                                               or undefined if no such instance is found.
   */
  public async waitForWorkflowStart(
    workflowInstanceId: string,
    fetchPayloads?: boolean,
    timeout?: number,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.waitForOrchestrationStart(workflowInstanceId, fetchPayloads, timeout);
    if (state !== undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Waits for a workflow to complete running and returns a {@link WorkflowState} object
   * containing metadata about the completed instance, and optionally, its input, output,
   * and custom status payloads.
   *
   * A "completed" workflow instance refers to any instance in one of the terminal states.
   * For example, the Completed, Failed, or Terminated states.
   *
   * If a workflow instance is already running when this method is called, it returns immediately.
   *
   * @param {string} workflowInstanceId - The unique identifier of the workflow instance to wait for.
   * @param {boolean} fetchPayloads - Indicates whether to fetch the workflow instance's
   *                                  inputs, outputs (true) or omit them (false).
   * @param {number} timeout - The amount of time, in seconds, to wait for the workflow instance to start.
   * @returns {Promise<WorkflowState | undefined>} A Promise that resolves to the workflow instance metadata
   *                                               or undefined if no such instance is found.
   */
  public async waitForWorkflowCompletion(
    workflowInstanceId: string,
    fetchPayloads = true,
    timeout: number,
  ): Promise<WorkflowState | undefined> {
    const state = await this._innerClient.waitForOrchestrationCompletion(workflowInstanceId, fetchPayloads, timeout);
    if (state != undefined) {
      return new WorkflowState(state);
    }
  }

  /**
   * Sends an event notification message to an awaiting workflow instance.
   *
   * This method triggers the specified event in a running workflow instance,
   * allowing the workflow to respond to the event if it has defined event handlers.
   *
   * @param {string} workflowInstanceId - The unique identifier of the workflow instance that will handle the event.
   * @param {string} eventName - The name of the event. Event names are case-insensitive.
   * @param {any} [eventPayload] - An optional serializable data payload to include with the event.
   */
  public async raiseEvent(workflowInstanceId: string, eventName: string, eventPayload?: any) {
    this._innerClient.raiseOrchestrationEvent(workflowInstanceId, eventName, eventPayload);
  }

  /**
   * Purges the workflow instance state from the workflow state store.
   *
   * This method removes the persisted state associated with a workflow instance from the state store.
   *
   * @param {string} workflowInstanceId - The unique identifier of the workflow instance to purge.
   * @return {Promise<boolean>} A Promise that resolves to true if the workflow state was found and purged successfully, otherwise false.
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

{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

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
  - [Python example](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript example](todo)
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
