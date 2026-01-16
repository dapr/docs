---
type: docs
title: "Dapr Python SDK integration with Dapr Workflow extension"
linkTitle: "Dapr Workflow"
weight: 400000
description: How to get up and running with the Dapr Workflow extension
no_list: true
---

The Dapr Python SDK provides a built-in Dapr Workflow extension, `dapr.ext.workflow`, for creating Dapr services.

## Installation

You can download and install the Dapr Workflow extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}
```bash
pip install dapr-ext-workflow
```
{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Make sure to uninstall any stable versions of the Python SDK extension before installing the `dapr-dev` package.
{{% /alert %}}

```bash
pip install dapr-ext-workflow-dev
```
{{% /tab %}}

{{< /tabpane >}}

## Example

```python
from time import sleep

import dapr.ext.workflow as wf


wfr = wf.WorkflowRuntime()


@wfr.workflow(name='random_workflow')
def task_chain_workflow(ctx: wf.DaprWorkflowContext, wf_input: int):
    try:
        result1 = yield ctx.call_activity(step1, input=wf_input)
        result2 = yield ctx.call_activity(step2, input=result1)
    except Exception as e:
        yield ctx.call_activity(error_handler, input=str(e))
        raise
    return [result1, result2]


@wfr.activity(name='step1')
def step1(ctx, activity_input):
    print(f'Step 1: Received input: {activity_input}.')
    # Do some work
    return activity_input + 1


@wfr.activity
def step2(ctx, activity_input):
    print(f'Step 2: Received input: {activity_input}.')
    # Do some work
    return activity_input * 2

@wfr.activity
def error_handler(ctx, error):
    print(f'Executing error handler: {error}.')
    # Do some compensating work


if __name__ == '__main__':
    wfr.start()
    sleep(10)  # wait for workflow runtime to start

    wf_client = wf.DaprWorkflowClient()
    instance_id = wf_client.schedule_new_workflow(workflow=task_chain_workflow, input=42)
    print(f'Workflow started. Instance ID: {instance_id}')
    state = wf_client.wait_for_workflow_completion(instance_id)
    print(f'Workflow completed! Status: {state.runtime_status}')

    wfr.shutdown()
```

- Learn more about authoring and managing workflows: 
  - [How-To: Author a workflow]({{% ref howto-author-workflow.md %}}).
  - [How-To: Manage a workflow]({{% ref howto-manage-workflow.md %}}).
  - 
- Visit [Python SDK examples](https://github.com/dapr/python-sdk/tree/main/examples/workflow) for code samples and instructions to try out Dapr Workflow:
  - [Simple workflow example]({{% ref python-workflow.md %}})
  - [Task chaining example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/task_chaining.py)
  - [Fan-out/Fan-in example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/fan_out_fan_in.py)
  - [Child workflow example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/child_workflow.py)
  - [Human approval example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/human_approval.py)
  - [Monitor example](https://github.com/dapr/python-sdk/blob/main/examples/workflow/monitor.py)


## Next steps

{{< button text="Getting started with the Dapr Workflow Python SDK" page="python-workflow.md" >}}
