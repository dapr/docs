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
- [Python 3.10+](https://www.python.org/downloads/) installed
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

## List, inspect and rerun workflow instances

From Dapr 1.19, `DaprWorkflowClient` and the async client in `dapr.ext.workflow.aio` can list the workflow instances of the app, read the history of an instance, and rerun a finished instance from one of its history events. Use them to find instances without storing their IDs yourself, to see where a failed instance stopped, and to retry it from that step with a corrected input instead of from the start.

```python
import dapr.ext.workflow as wf

wf_client = wf.DaprWorkflowClient()

# Page through the instance IDs of this app, 100 IDs per request
for instance_id in wf_client.iter_workflow_instance_ids(page_size=100):
    print(instance_id)

# Read the history of an instance, oldest event first
history = wf_client.get_workflow_history('order-123')
for event in history:
    print(event.event_id, event.event_type.name, event.name)

# Rerun from the scheduling of the charge_order activity, with a new input
event_id = next(e.event_id for e in history if e.is_rerunnable and e.name == 'charge_order')
new_instance_id = wf_client.rerun_workflow_from_event('order-123', event_id, input=25)
```

- `list_workflow_instance_ids(page_size=..., continuation_token=...)` returns one page with `instance_ids` and `continuation_token`. `iter_workflow_instance_ids()` fetches the pages for you. Listing needs an actor state store that can list keys. Otherwise the call raises `NotImplementedError`.
- `rerun_workflow_from_event` starts a new instance and leaves the source instance unchanged. The source instance must be in a terminal state and must not be a child workflow. The event must be the scheduling of an activity, the creation of a timer or the creation of a child workflow, which `is_rerunnable` reports. Omit `input` to keep the recorded input, and pass `new_instance_id` to choose the ID of the new instance.

For a runnable version, see the [workflow management example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/workflow_management.py).

## Large workflow payloads

By default, the workflow gRPC channel receives messages of up to 4 MiB, the gRPC default, so a larger message, for example a large workflow input or output, fails with `RESOURCE_EXHAUSTED`. To raise the limit for sending and receiving, pass `max_grpc_message_length` in bytes to `WorkflowRuntime`, `DaprWorkflowClient` and the async `DaprWorkflowClient`, or set the `DAPR_GRPC_MAX_INBOUND_MESSAGE_SIZE_BYTES` environment variable. The argument takes precedence over the environment variable.

```python
wfr = wf.WorkflowRuntime(max_grpc_message_length=16 * 1024 * 1024)
wf_client = wf.DaprWorkflowClient(max_grpc_message_length=16 * 1024 * 1024)
```

## Worker readiness

`wfr.start()` waits until the worker has opened its work-item stream to the Dapr sidecar, for 30 seconds by default (`worker_ready_timeout` on `WorkflowRuntime`). After that, `wfr.wait_for_worker_ready(timeout=30.0)` returns `True` when the stream is open, and `False` if the stream does not open again within the timeout, for example while the worker reconnects after a sidecar restart. Use it in a readiness check, so that the app reports not ready while its worker cannot receive work. Before Python SDK 1.19, it kept returning `True` after the first connection.

## Next steps
- [Learn more about Dapr workflow]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
- [Try implementing more complex workflow patterns](https://github.com/dapr/python-sdk/tree/main/examples/workflow)
