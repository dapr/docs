---
type: docs
title: "Getting started with the Dapr Workflow Python SDK"
linkTitle: "Workflow"
weight: 30000
description: How to get up and running with workflows using the Dapr Python SDK
---

Let’s create a Dapr workflow and invoke it using the console. With the [provided workflow example](https://github.com/dapr/python-sdk/tree/main/examples/workflow/simple.py), you will:

- Run a [Python console application](https://github.com/dapr/python-sdk/blob/main/examples/workflow/simple.py) that demonstrates workflow orchestration with activities, child workflows, and external events
- Learn how to handle retries, timeouts, and workflow state management
- Use the Python workflow SDK to start, pause, resume, and purge workflow instances

This example uses the default configuration from `dapr init` in [self-hosted mode](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted).

In the Python example project, the `simple.py` file contains the setup of the app, including:
- The workflow definition 
- The workflow activity definitions
- The registration of the workflow and workflow activities 

## Prerequisites
- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Python 3.9+](https://www.python.org/downloads/) installed
- [Dapr Python package]({{% ref "python#installation" %}}) and the [workflow extension]({{% ref "python-workflow/_index.md" %}}) installed
- Verify you're using the latest proto bindings

## Set up the environment

Start by cloning the [Python SDK repo].

```bash
git clone https://github.com/dapr/python-sdk.git
```

From the Python SDK root directory, navigate to the Dapr Workflow example.

```bash
cd examples/workflow
```

Run the following command to install the requirements for running this workflow sample with the Dapr Python SDK.

```bash
pip3 install -r workflow/requirements.txt
```

## Run the application locally

To run the Dapr application, you need to start the Python program and a Dapr sidecar. In the terminal, run:

```bash
dapr run --app-id wf-simple-example --dapr-grpc-port 50001 --resources-path components -- python3 simple.py
```

> **Note:** Since Python3.exe is not defined in Windows, you may need to use `python simple.py` instead of `python3 simple.py`.


**Expected output**

```
- "== APP == Hi Counter!"
- "== APP == New counter value is: 1!"
- "== APP == New counter value is: 11!"
- "== APP == Retry count value is: 0!"
- "== APP == Retry count value is: 1! This print statement verifies retry"
- "== APP == Appending 1 to child_orchestrator_string!"
- "== APP == Appending a to child_orchestrator_string!"
- "== APP == Appending a to child_orchestrator_string!"
- "== APP == Appending 2 to child_orchestrator_string!"
- "== APP == Appending b to child_orchestrator_string!"
- "== APP == Appending b to child_orchestrator_string!"
- "== APP == Appending 3 to child_orchestrator_string!"
- "== APP == Appending c to child_orchestrator_string!"
- "== APP == Appending c to child_orchestrator_string!"
- "== APP == Get response from hello_world_wf after pause call: Suspended"
- "== APP == Get response from hello_world_wf after resume call: Running"
- "== APP == New counter value is: 111!"
- "== APP == New counter value is: 1111!"
- "== APP == Workflow completed! Result: "Completed"
```

## What happened?

When you run the application, several key workflow features are shown:

1. **Workflow and Activity Registration**: The application uses Python decorators to automatically register workflows and activities with the runtime. This decorator-based approach provides a clean, declarative way to define your workflow components:
   ```python
   @wfr.workflow(name='hello_world_wf')
   def hello_world_wf(ctx: DaprWorkflowContext, wf_input):
       # Workflow definition...

   @wfr.activity(name='hello_act')
   def hello_act(ctx: WorkflowActivityContext, wf_input):
       # Activity definition...
   ```

2. **Runtime Setup**: The application initializes the workflow runtime and client:
   ```python
   wfr = WorkflowRuntime()
   wfr.start()
   wf_client = DaprWorkflowClient()
   ```

2. **Activity Execution**: The workflow executes a series of activities that increment a counter:
   ```python
   @wfr.workflow(name='hello_world_wf')
   def hello_world_wf(ctx: DaprWorkflowContext, wf_input):
       yield ctx.call_activity(hello_act, input=1)
       yield ctx.call_activity(hello_act, input=10)
   ```

3. **Retry Logic**: The workflow demonstrates error handling with a retry policy:
   ```python
   retry_policy = RetryPolicy(
       first_retry_interval=timedelta(seconds=1),
       max_number_of_attempts=3,
       backoff_coefficient=2,
       max_retry_interval=timedelta(seconds=10),
       retry_timeout=timedelta(seconds=100),
   )
   yield ctx.call_activity(hello_retryable_act, retry_policy=retry_policy)
   ```

4. **Child Workflow**: A child workflow is executed with its own retry policy:
   ```python
   yield ctx.call_child_workflow(child_retryable_wf, retry_policy=retry_policy)
   ```

5. **External Event Handling**: The workflow waits for an external event with a timeout:
   ```python
   event = ctx.wait_for_external_event(event_name)
   timeout = ctx.create_timer(timedelta(seconds=30))
   winner = yield when_any([event, timeout])
   ```

6. **Workflow Lifecycle Management**: The example demonstrates how to pause and resume the workflow:
   ```python
   wf_client.pause_workflow(instance_id=instance_id)
   metadata = wf_client.get_workflow_state(instance_id=instance_id)
   # ... check status ...
   wf_client.resume_workflow(instance_id=instance_id)
   ```

7. **Event Raising**: After resuming, the workflow raises an event:
   ```python
   wf_client.raise_workflow_event(
       instance_id=instance_id,
       event_name=event_name,
       data=event_data
   )
   ```

8. **Completion and Cleanup**: Finally, the workflow waits for completion and cleans up:
   ```python
   state = wf_client.wait_for_workflow_completion(
       instance_id,
       timeout_in_seconds=30
   )
   wf_client.purge_workflow(instance_id=instance_id)
   ```
## Next steps
- [Learn more about Dapr workflow]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
- [Try implementing more complex workflow patterns](https://github.com/dapr/python-sdk/tree/main/examples/workflow)
