---
type: docs
title: "How to: Author a workflow"
linkTitle: "How to: Author workflows"
weight: 5000
description: "Learn how to develop and author workflows"
---

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

{{< tabs Python ".NET" Java >}}

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

Define the workflow activities you'd like your workflow to perform. Activities are wrapped in an wrapper class, which is called `OrchestrationWrapper` in the following exmaple. 

```java
class OrchestratorWrapper<T extends Workflow> implements TaskOrchestrationFactory {
  private final Constructor<T> workflowConstructor;
  private final String name;

  public OrchestratorWrapper(Class<T> clazz) {
    this.name = clazz.getCanonicalName();
    try {
      this.workflowConstructor = clazz.getDeclaredConstructor();
    } catch (NoSuchMethodException e) {
      throw new RuntimeException(
          String.format("No constructor found for workflow class '%s'.", this.name), e
      );
    }
  }
}
```

[See a full Java SDK workflow activity example.](https://github.com/dapr/java-sdk/blob/master/sdk-workflows/src/main/java/io/dapr/workflows/runtime/OrchestratorWrapper.java)

{{% /codetab %}}


{{< /tabs >}}

## Write the workflow

Next, register and call the activites in a workflow. 

{{< tabs Python ".NET" Java >}}

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

The `WorkflowActivity` interface executes the activity logic and returns a value to be serialized and returned to the caller. The following code registers a workflow activity object:

```java
public <T extends Workflow> WorkflowRuntimeBuilder registerWorkflow(Class<T> clazz) {
  this.builder = this.builder.addOrchestration(
      new OrchestratorWrapper<>(clazz)
  );

  return this;
}
```

[See the Java SDK workflow in context.](https://github.com/dapr/java-sdk/blob/master/sdk-workflows/src/main/java/io/dapr/workflows/runtime/WorkflowRuntimeBuilder.java)


{{% /codetab %}}

{{< /tabs >}}

## Write the application

Finally, compose the application using the workflow.

{{< tabs Python ".NET" Java >}}

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
app.MapPost("/orders", async (WorkflowEngineClient client, [FromBody] OrderPayload orderInfo) =>
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
app.MapGet("/orders/{orderId}", async (string orderId, WorkflowEngineClient client) =>
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

[In the following example](https://github.com/dapr/java-sdk/blob/master/sdk-workflows/src/main/java/io/dapr/workflows/client/DaprWorkflowClient.java), for a basic Java application using workflows for Java SDK, your project code would include:

- A Java package called `io.dapr.workflows.client` to receive the Java SDK client capabilities.
- An import of `io.dapr.workflows.Workflow`
- A wrapper extending `Workflow` and implementing tasks/activities
- A declared `WorkflowRuntimeBuilder` builder
- API calls. In the example below, these calls start and terminate the workflow.
 
```java
package io.dapr.workflows.client;

import com.microsoft.durabletask.DurableTaskClient;
import com.microsoft.durabletask.DurableTaskGrpcClientBuilder;
import io.dapr.utils.NetworkUtils;
import io.dapr.workflows.Workflow;
import io.grpc.ManagedChannel;

import javax.annotation.Nullable;
import java.util.concurrent.TimeUnit;

public class DaprWorkflowClient implements AutoCloseable {

  private DurableTaskClient innerClient;
  private ManagedChannel grpcChannel;

  /**
   * Public constructor for DaprWorkflowClient. This layer constructs the GRPC Channel.
   */
  public DaprWorkflowClient() {
    this(NetworkUtils.buildGrpcManagedChannel());
  }

  /**
   * Private Constructor that passes a created DurableTaskClient and the new GRPC channel.
   *
   * @param grpcChannel ManagedChannel for GRPC channel.
   */
  private DaprWorkflowClient(ManagedChannel grpcChannel) {
    this(createDurableTaskClient(grpcChannel), grpcChannel);
  }

  /**
   * Private Constructor for DaprWorkflowClient.
   *
   * @param innerClient DurableTaskGrpcClient with GRPC Channel set up.
   * @param grpcChannel ManagedChannel for instance variable setting.
   *
   */
  private DaprWorkflowClient(DurableTaskClient innerClient, ManagedChannel grpcChannel) {
    this.innerClient = innerClient;
    this.grpcChannel = grpcChannel;
  }

  /**
   * Static method to create the DurableTaskClient.
   *
   * @param grpcChannel ManagedChannel for GRPC.
   * @return a new instance of a DurableTaskClient with a GRPC channel.
   */
  private static DurableTaskClient createDurableTaskClient(ManagedChannel grpcChannel) {
    return new DurableTaskGrpcClientBuilder()
        .grpcChannel(grpcChannel)
        .build();
  }

  /**
   * Schedules a new workflow using DurableTask client.
   *
   * @param <T> any Workflow type
   * @param clazz Class extending Workflow to start an instance of.
   * @return A String with the randomly-generated instance ID for new Workflow instance.
   */
  public <T extends Workflow> String scheduleNewWorkflow(Class<T> clazz) {
    return this.innerClient.scheduleNewOrchestrationInstance(clazz.getCanonicalName());
  }

  /**
   * Schedules a new workflow using DurableTask client.
   *
   * @param <T> any Workflow type
   * @param clazz Class extending Workflow to start an instance of.
   * @param input the input to pass to the scheduled orchestration instance. Must be serializable.
   * @return A String with the randomly-generated instance ID for new Workflow instance.
   */
  public <T extends Workflow> String scheduleNewWorkflow(Class<T> clazz, Object input) {
    return this.innerClient.scheduleNewOrchestrationInstance(clazz.getCanonicalName(), input);
  }

  /**
   * Schedules a new workflow using DurableTask client.
   *
   * @param <T> any Workflow type
   * @param clazz Class extending Workflow to start an instance of.
   * @param input the input to pass to the scheduled orchestration instance. Must be serializable.
   * @param instanceId the unique ID of the orchestration instance to schedule
   * @return A String with the <code>instanceId</code> parameter value.
   */
  public <T extends Workflow> String scheduleNewWorkflow(Class<T> clazz, Object input, String instanceId) {
    return this.innerClient.scheduleNewOrchestrationInstance(clazz.getCanonicalName(), input, instanceId);
  }

  /**
   * Terminates the workflow associated with the provided instance id.
   *
   * @param workflowInstanceId Workflow instance id to terminate.
   * @param output the optional output to set for the terminated orchestration instance.
   */
  public void terminateWorkflow(String workflowInstanceId, @Nullable Object output) {
    this.innerClient.terminate(workflowInstanceId, output);
  }

  /**
   * Closes the inner DurableTask client and shutdown the GRPC channel.
   *
   */
  public void close() throws InterruptedException {
    try {
      if (this.innerClient != null) {
        this.innerClient.close();
        this.innerClient = null;
      }
    } finally {
      if (this.grpcChannel != null && !this.grpcChannel.isShutdown()) {
        this.grpcChannel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
        this.grpcChannel = null;
      }
    }
  }
}
```

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
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java example](todo)
