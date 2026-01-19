---
type: docs
title: "How to: Author and manage Dapr Workflow in the Java SDK"
linkTitle: "How to: Author and manage workflows"
weight: 20000
description: How to get up and running with workflows using the Dapr Java SDK
---

Let's create a Dapr workflow and invoke it using the console. With the [provided workflow example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows), you will:

- Execute the workflow instance using the [Java workflow worker](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowWorker.java)
- Utilize the Java workflow client and API calls to [start and terminate workflow instances](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/workflows/DemoWorkflowClient.java)

This example uses the default configuration from `dapr init` in [self-hosted mode](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted).

## Prerequisites

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- Verify you're using the latest proto bindings

## Set up the environment

Clone the Java SDK repo and navigate into it.

```bash
git clone https://github.com/dapr/java-sdk.git
cd java-sdk
```

Run the following command to install the requirements for running this workflow sample with the Dapr Java SDK.

```bash
mvn clean install
```

From the Java SDK root directory, navigate to the Dapr Workflow example.

```bash
cd examples
```

## Run the `DemoWorkflowWorker`

The `DemoWorkflowWorker` class registers an implementation of `DemoWorkflow` in Dapr's workflow runtime engine. In the `DemoWorkflowWorker.java` file, you can find the `DemoWorkflowWorker` class and the `main` method:

```java
public class DemoWorkflowWorker {

  public static void main(String[] args) throws Exception {
    // Register the Workflow with the runtime.
    WorkflowRuntime.getInstance().registerWorkflow(DemoWorkflow.class);
    System.out.println("Start workflow runtime");
    WorkflowRuntime.getInstance().startAndBlock();
    System.exit(0);
  }
}
```

In the code above:
- `WorkflowRuntime.getInstance().registerWorkflow()` registers `DemoWorkflow` as a workflow in the Dapr Workflow runtime.
- `WorkflowRuntime.getInstance().start()` builds and starts the engine within the Dapr Workflow runtime.

In the terminal, execute the following command to kick off the `DemoWorkflowWorker`:

```sh
dapr run --app-id demoworkflowworker --resources-path ./components/workflows --dapr-grpc-port 50001 -- java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.workflows.DemoWorkflowWorker
```

**Expected output**

```
You're up and running! Both Dapr and your app logs will appear here.

...

== APP == Start workflow runtime
== APP == Sep 13, 2023 9:02:03 AM com.microsoft.durabletask.DurableTaskGrpcWorker startAndBlock
== APP == INFO: Durable Task worker is connecting to sidecar at 127.0.0.1:50001.
```

## Run the `DemoWorkflowClient`

The `DemoWorkflowClient` starts instances of workflows that have been registered with Dapr.

```java
public class DemoWorkflowClient {

  // ...
  public static void main(String[] args) throws InterruptedException {
    DaprWorkflowClient client = new DaprWorkflowClient();

    try (client) {
      String separatorStr = "*******";
      System.out.println(separatorStr);
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      System.out.printf("Started new workflow instance with random ID: %s%n", instanceId);

      System.out.println(separatorStr);
      System.out.println("**GetInstanceMetadata:Running Workflow**");
      WorkflowState workflowMetadata = client.getWorkflowState(instanceId, true);
      System.out.printf("Result: %s%n", workflowMetadata);

      System.out.println(separatorStr);
      System.out.println("**WaitForWorkflowStart**");
      try {
        WorkflowState waitForWorkflowStartResult =
            client.waitForWorkflowStart(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForWorkflowStartResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForWorkflowStart has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**SendExternalMessage**");
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");

      System.out.println(separatorStr);
      System.out.println("** Registering parallel Events to be captured by allOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");
      System.out.printf("Events raised for workflow with instanceId: %s\n", instanceId);

      System.out.println(separatorStr);
      System.out.println("** Registering Event to be captured by anyOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "e2", "event 2 Payload");
      System.out.printf("Event raised for workflow with instanceId: %s\n", instanceId);


      System.out.println(separatorStr);
      System.out.println("**waitForWorkflowCompletion**");
      try {
        WorkflowState waitForWorkflowCompletionResult =
            client.waitForWorkflowCompletion(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForWorkflowCompletionResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForWorkflowCompletion has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**purgeWorkflow**");
      boolean purgeResult = client.purgeWorkflow(instanceId);
      System.out.printf("purgeResult: %s%n", purgeResult);

      System.out.println(separatorStr);
      System.out.println("**raiseEvent**");

      String eventInstanceId = client.scheduleNewWorkflow(DemoWorkflow.class);
      System.out.printf("Started new workflow instance with random ID: %s%n", eventInstanceId);
      client.raiseEvent(eventInstanceId, "TestException", null);
      System.out.printf("Event raised for workflow with instanceId: %s\n", eventInstanceId);

      System.out.println(separatorStr);
      String instanceToTerminateId = "terminateMe";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, instanceToTerminateId);
      System.out.printf("Started new workflow instance with specified ID: %s%n", instanceToTerminateId);

      TimeUnit.SECONDS.sleep(5);
      System.out.println("Terminate this workflow instance manually before the timeout is reached");
      client.terminateWorkflow(instanceToTerminateId, null);
      System.out.println(separatorStr);

      String restartingInstanceId = "restarting";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, restartingInstanceId);
      System.out.printf("Started new  workflow instance with ID: %s%n", restartingInstanceId);
      System.out.println("Sleeping 30 seconds to restart the workflow");
      TimeUnit.SECONDS.sleep(30);

      System.out.println("**SendExternalMessage: RestartEvent**");
      client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");

      System.out.println("Sleeping 30 seconds to terminate the eternal workflow");
      TimeUnit.SECONDS.sleep(30);
      client.terminateWorkflow(restartingInstanceId, null);
    }

    System.out.println("Exiting DemoWorkflowClient.");
    System.exit(0);
  }
}
```

In a second terminal window, start the workflow by running the following command:

```sh
java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.workflows.DemoWorkflowClient
```

**Expected output**

```
*******
Started new workflow instance with random ID: 0b4cc0d5-413a-4c1c-816a-a71fa24740d4
*******
**GetInstanceMetadata:Running Workflow**
Result: [Name: 'io.dapr.examples.workflows.DemoWorkflow', ID: '0b4cc0d5-413a-4c1c-816a-a71fa24740d4', RuntimeStatus: RUNNING, CreatedAt: 2023-09-13T13:02:30.547Z, LastUpdatedAt: 2023-09-13T13:02:30.699Z, Input: '"input data"', Output: '']
*******
**WaitForWorkflowStart**
Result: [Name: 'io.dapr.examples.workflows.DemoWorkflow', ID: '0b4cc0d5-413a-4c1c-816a-a71fa24740d4', RuntimeStatus: RUNNING, CreatedAt: 2023-09-13T13:02:30.547Z, LastUpdatedAt: 2023-09-13T13:02:30.699Z, Input: '"input data"', Output: '']
*******
**SendExternalMessage**
*******
** Registering parallel Events to be captured by allOf(t1,t2,t3) **
Events raised for workflow with instanceId: 0b4cc0d5-413a-4c1c-816a-a71fa24740d4
*******
** Registering Event to be captured by anyOf(t1,t2,t3) **
Event raised for workflow with instanceId: 0b4cc0d5-413a-4c1c-816a-a71fa24740d4
*******
**WaitForWorkflowCompletion**
Result: [Name: 'io.dapr.examples.workflows.DemoWorkflow', ID: '0b4cc0d5-413a-4c1c-816a-a71fa24740d4', RuntimeStatus: FAILED, CreatedAt: 2023-09-13T13:02:30.547Z, LastUpdatedAt: 2023-09-13T13:02:55.054Z, Input: '"input data"', Output: '']
*******
**purgeWorkflow**
purgeResult: true
*******
**raiseEvent**
Started new workflow instance with random ID: 7707d141-ebd0-4e54-816e-703cb7a52747
Event raised for workflow with instanceId: 7707d141-ebd0-4e54-816e-703cb7a52747
*******
Started new workflow instance with specified ID: terminateMe
Terminate this workflow instance manually before the timeout is reached
*******
Started new  workflow instance with ID: restarting
Sleeping 30 seconds to restart the workflow
**SendExternalMessage: RestartEvent**
Sleeping 30 seconds to terminate the eternal workflow
Exiting DemoWorkflowClient.
```

## What happened?

1. When you ran `dapr run`, the workflow worker registered the workflow (`DemoWorkflow`) and its actvities to the Dapr Workflow engine. 
1. When you ran `java`, the workflow client started the workflow instance with the following activities. You can follow along with the output in the terminal where you ran `dapr run`.
   1. The workflow is started, raises three parallel tasks, and waits for them to complete.
   1. The workflow client calls the activity and sends the "Hello Activity" message to the console.
   1. The workflow times out and is purged.
   1. The workflow client starts a new workflow instance with a random ID, uses another workflow instance called `terminateMe` to terminate it, and restarts it with the workflow called `restarting`.
   1. The worfklow client is then exited.

## Next steps
- [Learn more about Dapr workflow]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})

## Advanced features

### Task Execution Keys

Task execution keys are unique identifiers generated by the durabletask-java library. They are stored in the `WorkflowActivityContext` and can be used to track and manage the execution of workflow activities. They are particularly useful for:

1. **Idempotency**: Ensuring activities are not executed multiple times for the same task
2. **State Management**: Tracking the state of activity execution
3. **Error Handling**: Managing retries and failures in a controlled manner

Here's an example of how to use task execution keys in your workflow activities:

```java
public class TaskExecutionKeyActivity implements WorkflowActivity {
  @Override
  public Object run(WorkflowActivityContext ctx) {
    // Get the task execution key for this activity
    String taskExecutionKey = ctx.getTaskExecutionKey();
    
    // Use the key to implement idempotency or state management
    // For example, check if this task has already been executed
    if (isTaskAlreadyExecuted(taskExecutionKey)) {
      return getPreviousResult(taskExecutionKey);
    }
    
    // Execute the activity logic
    Object result = executeActivityLogic();
    
    // Store the result with the task execution key
    storeResult(taskExecutionKey, result);
    
    return result;
  }
}
```
