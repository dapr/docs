---
type: docs
title: "Multi-application workflows in the .NET SDK"
linkTitle: "Multi-app workflows"
weight: 1600
description: Call activities and child workflows hosted in another Dapr application using the .NET SDK
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

## Next steps

- [Multi Application Workflows]({{% ref "workflow-multi-app.md" %}})
- [Workflow management operations]({{% ref dotnet-workflow-management-methods.md %}})
