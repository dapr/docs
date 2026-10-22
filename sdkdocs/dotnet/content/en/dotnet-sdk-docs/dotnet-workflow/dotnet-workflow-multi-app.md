---
type: docs
title: "Multi-application workflows in the .NET SDK"
linkTitle: "Multi-app workflows"
weight: 1600
description: Call activities, children, and detached workflows hosted in another Dapr application
---

## Overview

Dapr workflows can call activities or child workflows that are hosted in a different Dapr application. In .NET,
multi-application workflows are supported starting with:

- **Dapr runtime v1.16.0+**
- **Dapr .NET SDK v1.17.0+**

Conceptual guidance and constraints are covered in
[Multi Application Workflows]({{% ref "workflow-multi-app.md" %}}).

## Requirements

Multi-application workflow calls require:

- The target app ID must exist and must register the activity or workflow you invoke.
- All participating app IDs must be in the same namespace.
- All participating app IDs must use the same workflow (actor) state store.

{{% alert title="Data-reference compatibility" color="warning" %}}
With the [workflow data-reference implementation (alpha)]({{% ref dotnet-workflow-data-references.md %}}),
cross-app activity, child workflow, and detached workflow inputs are **inline by default**, even when the sending
host uses `PayloadWritePreference.PreferReference`. The sender resolves a top-level `PayloadReference<T>` before
submitting the call, so the destination should accept ordinary `T` and need not enable payload support for that input.
The sender needs registered payload support and storage access to inline a reference; resolution errors prevent
submission rather than falling back to sending the reference.

Set `AllowPayloadReferences: true` on the call's `WorkflowTaskOptions` or `ChildWorkflowTaskOptions` only for a
compatible, payload-aware destination. This permits the host's write preference; it does not force offloading
or override `PreferInline`. Each reader must resolve the reference's store name and key to the same binary object
through its own sidecar, with compatible serialization and contracts. Separate in-memory stores do not share objects.

The [JavaScript SDK]({{% ref js-workflow-data-references.md %}}) also supports the version-1 envelope from
`@dapr/dapr` 3.19.0-rc.4 with compatible serialization and storage access, but does not implement payload-stage
reversal. Do not assume other language SDKs support data references. The inline default covers only top-level call
inputs, not nested references, results, or propagated history. See
[Cross-app input handling]({{% ref dotnet-workflow-data-references.md %}}#cross-app-input-handling) for examples and limits.
{{% /alert %}}

## Call an activity in another application

Set `TargetAppId` on `WorkflowTaskOptions` when calling an activity to execute it in another app:

```csharp
public sealed class BusinessWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string input)
    {
        var options = new WorkflowTaskOptions { TargetAppId = "App2" };
        var output = await context.CallActivityAsync<string>(nameof(ActivityA), input, options);
        return output;
    }
}
```

The parent workflow continues to orchestrate locally and receives the activity result.

## Call a child workflow in another application

Set `TargetAppId` on `ChildWorkflowTaskOptions` when calling a child workflow to execute it in another app:

```csharp
public sealed class BusinessWorkflow : Workflow<string, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string input)
    {
        var options = new ChildWorkflowTaskOptions { TargetAppId = "App2" };
        var output = await context.CallChildWorkflowAsync<string>(nameof(Workflow2), input, options);
        return output;
    }
}
```

{{% alert title="Note" color="primary" %}}
When calling a workflow in another application, you are responsible for using the workflow name expected by that app.
If the target application is a .NET app that uses named workflow versioning, you can call it by its canonical (unversioned)
workflow name and the target app will route it to the latest version. Named workflow versioning requires Dapr runtime
v1.17.0 or later (multi-app workflows only require v1.16.0+).
{{% /alert %}}

## Schedule a detached workflow in another application

SDK/runtime 1.19 also support independent, replay-safe detached workflow scheduling from the workflow context:

```csharp
var detachedId = await context.ScheduleNewDetachedWorkflowAsync(
    workflowName: "DocumentWorkflow",
    instanceId: null,
    input: document,
    startTime: null,
    options: new WorkflowTaskOptions(TargetAppId: "document-service"));
```

Unlike `CallChildWorkflowAsync`, this returns the scheduled ID without waiting for output. The detached instance
has independent failure and termination semantics: terminating the source workflow does not terminate it.
The options overload allows `TargetAppId` and `AllowPayloadReferences`, but rejects `RetryPolicy` and any
`PropagationScope` other than `None`.

## Events and client targeting

`WorkflowContext.SendEvent` does not accept `TargetAppId`; it signals an instance in the current application.
For external event submission, `DaprWorkflowClient.RaiseEventAsync` targets the application associated with the
client's sidecar, not an arbitrary app ID argument. Do not call a management client directly from deterministic
workflow code to bypass that restriction; put external I/O in an activity.

## Next steps

- [Multi Application Workflows]({{% ref "workflow-multi-app.md" %}})
- [Workflow management operations]({{% ref dotnet-workflow-management-methods.md %}})
