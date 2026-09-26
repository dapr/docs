---
type: docs
title: "Workflow versioning"
linkTitle: "Workflow versioning"
weight: 2500
description: "Version workflows safely as code evolves"
---

## Versioning

There are many scenarios where it is necessary to introduce changes to workflow code while workflows are actively
running. In cases where these changes are non-deterministic, a versioning strategy is required so that existing
workflows can continue executing with the original code, while new workflows use the updated version.

Workflows can be versioned using two complementary approaches and it's intended that both are used in
conjunction with one another. These are:
- [Patching](#patching)
- [Named workflow versioning](#named-workflow-versioning)

{{% alert title="Note" color="primary" %}}

In either versioning strategy, workflows can reach the `stalled` state. This typically occurs during rollouts, when both old and new versions of the workflow code are running at the same time.

A versioned workflow will become stalled when it is started on a new replica, but a subsequent replay is attempted
on an old replica.

Workflows can remain stalled for the entire duration of the rollout, until there are only new replicas available. Once a stalled workflow is scheduled on a new replica, it will continue executing.

If a workflow never continues it means the conditions for getting stalled are still present and will need to be
addressed. See the specific reasons for getting stalled in the each of the versioning approaches below.
{{% /alert %}}

### What Does Versioning Solve?
To best understand how versioning works and how to use it effectively, it helps to first understand what it's
solving and why versioning is necesssary at all. Workflows are required to be deterministic meaning that every time they are run, they produce precisely the same output as the last time.

This is a key concept because Dapr Workflows are implemented to use an event sourcing approach to persist the
workflow state. As activities and child workflows are executed within the workflow, Dapr is maintaining a history that
logs the inputs and outputs at each of those boundary executions. As each completes, we persist the updated event
history then re-invoke the workflow from the top (this is called a "replay"). This time, when it hits one of these
activities or child workflows, it substitutes in the already-realized output and skips re-executing it and repeats.

Because of this, it's critical that no code be arbitrarily introduced into a workflow while it's in-flight because when the engine replays the workflow, your changes risk the workflow no longer matching with its history and failing.

### Patching

Patches are the first of our two versioning approaches that allow you to introduce changes to your workflow while
keeping it deterministic between replays. It works by allowing you to insert branched logic associated with named
identifiers via `if` statements. The workflow history keeps track of where these named identifiers have been
observed while replaying the workflow ensuring that a consistent logical path is followed between replays.

This enables you to apply targeted changes to your workflow code in only those specific places where a tweak is
necessary.

To add a patch, select a stable, unique name that identifies the patch. This can be something
descriptive like `use-sms` that characterizes what the patch changes or something that's inherently different like
the current timestamp or date. The specific value you use doesn't matter so long as you don't use an identifier that you've already deployed into production. You'll insert the patch by adding an `if` statement that evaluates if the workflow has applied this patch or not - if so, the patch's code is used and if not, the original code path is taken.

The uniqueness requirement for the patch identifier only extends to this workflow; patches between workflows are
not evaluated, so a duplicate identifier can be used across multiple workflows without conflict.

The following example demonstrates this by checking if the `use-sms` patch has been applied to this workflow
instance. If so, ths `SendSMS` activity is executed; otherwise, it falls back to the original path and uses the
`SendEmail` activity.

{{< tabpane text=true >}}

{{% tab ".NET" %}}

```csharp
public sealed class MyWorkflow : Workflow<string, object?>
{
    public overrride async Task<object?> RunAsync(WorkflowContext context, string input)
    {
        // ...
        if (context.IsPatched("use-sms"))
        {
            // Patched code
            await context.CallActivityAsync(nameof(SendSMS), input);
        }
        else {
            // Original code
            await context.CallActivityAsync(nameof(SendEmail), input);
        }
        return null;
    }
}
```

{{% /tab %}}

{{% tab "Go" %}}

```go
import "github.com/dapr/durabletask-go/workflow"

func Workflow(ctx *workflow.WorkflowContext) error {
  // ...
  if ctx.IsPatched("use-sms") {
    if err := ctx.CallActivity("SendSMS", ctx.GetInput()).Await(); err != nil {
      return err
    }
  } else {
    if err := ctx.CallActivity("SendEmail", ctx.GetInput()).Await(); err != nil {
      return err
    }
  }
  // ...
}

```

{{% /tab %}}

{{% tab "Python" %}}

```python
from dapr.ext.workflow import DaprWorkflowContext, WorkflowRuntime

wfr = WorkflowRuntime()

@wfr.workflow
def my_workflow(ctx: DaprWorkflowContext, wf_input: str):
  # ...
  if ctx.is_patched("use-sms"):
    yield ctx.call_activity(send_sms)
  else:
    yield ctx.call_activity(send_email)
  # ...
```

{{% /tab %}}

{{< /tabpane >}}

Using this approach, new workflow instances will take the patched code path but existing workflows that are
in-flight when the patch is introduced will continue to use the original code path. Patch checks are recorded in the
workflow instance history the first time they are evaluated, meaning that it's safe to use the same identifier in
different places throughout your workflow.

Again, it's imperative that once your patched workflow is running in production, you do not repurpose that
identifier again though. Once deployed, it should be assumed that the engine will handle the workflow
deterministically, but adding a new patch with a previously used identifier would break that contract: if your new
code was inserted earlier than an in-flight workflow instance had evaluated to that point, when it replayed, it
would take your patch branch, but your changes may no longer match the existing workflow history and cause the
workflow to stall indefinitely (at least until you removed the new or updated it to use a different unique identifier).

The list of patches applied to a workflow are stored in the workflow's history, so it's important to be mindful that
the more patches you use, the larger your workflow state history. This will increasingly have a negative impact
on workflow performance because it needs to be retrieved every replay and as the state grows, this incurs
added retrieval and parsing overhead.

#### Validating stalls

In addition to the re-use of an identifier as described above, there are several other reasons for workflows to
stall when using patches:
- Removing (or renaming) a patch identifier
- Changing the order of patches

You can use the [workflow commands in the Dapr CLI]({{% ref dapr-workflow %}}) to check for stalled workflows. For example, the following is what the `dapr workflow list` command would look like if a workflow is stalled:
```bash
> dapr workflow list
NAME           ID          STATUS     AGE
workflow       <ID>        STALLED    9m39s
```

The following is what the `dapr workflow history` command would look like when a workflow is stalled:
```bash
> dapr workflow history <ID> -k -o wide
PLAY  TYPE                 NAME      TIMESTAMP    ELAPSED    STATUS   DETAILS        ROUTER     EXECUTION ID  ATTRS
0     ExecutionStarted     workflow  <TIMESTAMP>  Age:15.8h  RUNNING  workflowStart  workflows  <EXEC_ID>     input=2026-01-22T14:44:02.728101
1     OrchestratorStarted            <TIMESTAMP>  25.3ms     RUNNING  replay                                  versionName=workflow_v1
1     ExecutionStalled               <TIMESTAMP>  8.9m       STALLED                                          reason=VERSION_NAME_MISMATCH;description=Version not available: workflow_v1
```

#### Patching best practices
The following represents some additional suggestions that should be considered to eliminate the possibility of a
stalled or failed workflow as a result of using patches:
- The original code must remain available and unchanged when applying a patch so it's present for in-flight
  workflows to evaluate in the same way.
- Patches should be applied in an additive way meaning that once they're added and your application deployed,
  you should never move nor remove them from your workflow. They must exist to retain in-flight workflow determinism.
- As covered above, you must not re-use a patch identifier that you've used in previous deployments as this will
  break the determinism guarantee. However, you're welcome to use that same identifier within the same deployment in
  multiple places and without concern across different workflows.
- If you can avoid using an `else` branch when applying your patch, it will make it easier to apply future patches.
  While this generally can't be avoided if you're replacing existing code, it's certainly manageable if you're
  simply adding new logic to your workflow.
- If you must nest patches, you must do so within existing patches. For example your new patch cannot wrap an
  existing patch else in the `else` branch. Doing so would other mean that the originally code cannot be accessed by
  in-flight workflows, breaking the determinism guarantee.

### Named Workflow Versioning

Named workflow versioning represents our second approach to facilitating a means of versioning your workflows in a
deterministically safe way. In this approach, you introduce a new workflow version by duplicating an existing
workflow and assigning it a new "versioned" name. Because you can then refactor your workflow logic from scratch to
remove any patches and otherwise introduce any other changes you want, this approach offers a clean break from
previous workflows versions.

While the particulars of how this is achieved will vary depending on the language SDK you're using, generally, the
idea is that you'll duplicate your latest workflow, assign it a unique name that reflects the newer version and
register this with your SDK. A registry will be built of each workflow so that at runtime, Dapr will call in with a
workflow name to execute and the SDK will either route to the old workflow (if in-flight) or to the newer version.

Do note that across all SDKs, the runtime does not migrate workflows between versions sequentially. Rather, when the
SDKs receive a request to run a new workflow, it chooses to run the latest version, not simply the "next" one, so
there's is no need to handle any compensation logic between versions.

The language SDKs may expose a way to register versions when using the same workflow name, but this varies by SDK,
so refer to the documentation for a specific SDK for more information. For example, some may use a mechanism
by which you would explicitly supply an `is_latest` flag to indicate which version is the latest.

When the SDK receives a request to run a workflow in a version that is not registered, the workflow will stall. This
can happen naturally during application rollouts, but can also happen if a version is removed while some workflow
instances are still using it. The recommendation is that older named workflow versions should not be deleted at all
unless you've independently confirmed that there are no outstanding (in-flight or dormant) workflow instances that
are
running against that version.

{{< tabpane text=true >}}

{{% tab ".NET" %}}

.NET uses a source generator to automatically identify and register your workflow versions, so no manual
registration of workflows is necessary (the activities do need to be registered). By default, .NET uses a built-in and configurably numerical versioning strategy where the
version is provided as a suffix on the name. See the [.NET SDK documentation]({{% ref dotnet-workflow-versioning %}}) on how to change versioning strategies
or configuration and how to set up versioning in your application.

Since .NET applications do not allow multiple types to exist with the same name, that's not an option in this SDK.

To create a new named workflow version, duplicate an existing workflow and modify the name of the class to use the
same prefix, but change the version identifier in the suffix to reflect a later version. Rebuild your application
and the SDK will automatically handle the rest.

{{% /tab %}}

{{% tab "Go" %}}

Given the following workflow definitions:

```go
import "github.com/dapr/durabletask-go/workflow"

func WorkflowV1(ctx *workflow.WorkflowContext) error {
  // ...
  return nil
}

func WorkflowV2(ctx *workflow.WorkflowContext) error {
  // ...
  return nil
}
```

This is how you would register the two workflows:

```go
import "github.com/dapr/durabletask-go/workflow"

registry := workflow.NewRegistry()
// This is the previous workflow version, so `isLatest` is false
registry.AddVersionedWorkflow("Workflow", false, WorkflowV1)
// This is the latest workflow version, so `isLatest` is true
registry.AddVersionedWorkflow("Workflow", true, WorkflowV2)

```

This is the same example, but setting the version name explicitly:

```go
import "github.com/dapr/durabletask-go/workflow"

registry := workflow.NewRegistry()
// This is the previous workflow version, so `isLatest` is false
registry.AddVersionedWorkflow("Workflow", "WorkflowV1", false, WorkflowV1)
// This is the latest workflow version, so `isLatest` is true
registry.AddVersionedWorkflow("Workflow", "WorkflowV2", true, WorkflowV2)
```

**Note**: The boolean argument to `AddVersionedOrchestrator` and `AddVersionedOrchestratorN` indicates whether the workflow is the latest version.

{{% /tab %}}

{{% tab "Python" %}}

This would be your workflow using different versions:

```python
from dapr.ext.workflow import DaprWorkflowContext, WorkflowRuntime

wfr = WorkflowRuntime()

@wfr.versioned_workflow(name="workflow")
def workflow_v1(ctx: DaprWorkflowContext, wf_input: str):
  # ...

@wfr.versioned_workflow(name="workflow", is_latest=True)
def workflow_v2(ctx: DaprWorkflowContext, wf_input: str):
  # ...

```

This is the same example, but setting the version name explicitly:

```python
from dapr.ext.workflow import DaprWorkflowContext, WorkflowRuntime

wfr = WorkflowRuntime()

@wfr.versioned_workflow(name="workflow", version_name="workflow_v1")
def workflow_v1(ctx: DaprWorkflowContext, wf_input: str):
  # ...

@wfr.versioned_workflow(name="workflow", version_name="workflow_v2", is_latest=True)
def workflow_v2(ctx: DaprWorkflowContext, wf_input: str):
  # ...
```

{{% /tab %}}

{{< /tabpane >}}

### Versioning Process Guidance

Because named workflows are fully compatible with patches, the approach is that changes to your workflow are initially
made by applying patches to your existing workflow logic. Eventually you'll hit one of the following problems after
applying several patches:
- You're concerned about the overhead to your workflow state history because of the number of applied patches;
- The golden path through your workflow logic is hard to follow;
- You need to make another workflow tweak, but can't figure out how to apply a patch that doesn't break the
  determinism guarantee.

At this point, the recommendation is that you introduce a named version of your workflow. Copy your existing
workflow, change its name to reflect whatever versioning strategy you're using in your SDK and refactor to remove all
your patches and retain only your intended "latest" logic. Apply your new changes (no need for a patch here – it's a
new workflow) and deploy it.

Here, apply patches again as needed to address future changes and when necessary, introduce another named workflow
version and continue. Repeat this process indefinitely.

It is recommended that you retain old workflow versions until you're completely confident that nothing is in-flight
(including deferred with a long-running timer) that uses any of your old workflow versions.

Workflow versioning doesn't address changing the types of inputs and outputs of the workflows themselves. As general
guidance, it is recommended to either return serialized values like strings (making the consumer of the output
responsible for being able to deserialize different outputs over time) or adopt complex types that incorporate
optional properties to include new expected output values.
