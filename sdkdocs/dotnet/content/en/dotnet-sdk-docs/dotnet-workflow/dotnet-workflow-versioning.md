---
type: docs
title: "Workflow versioning in the .NET SDK"
linkTitle: "Workflow versioning"
weight: 2500
description: Learn how to use patch-based and name-based workflow versioning in the Dapr .NET SDK
---

## Overview

Dapr Workflow versioning lets you evolve workflows without breaking deterministic execution for in-flight instances.
The .NET SDK supports two approaches:

- **Patch-based versioning**: introduce conditional branches guarded by `context.IsPatched("patch-name")`.
- **Name-based versioning**: create a new workflow type name and let a versioning strategy select the newest version.

Use patch-based versioning for small, in-place changes. Use name-based versioning for larger refactors where you want
a clean new workflow type.

{{% alert title="Note" color="primary" %}}
Workflow versioning requires Dapr .NET SDK v1.17.0 or later and Dapr runtime v1.17.0 or later.
{{% /alert %}}

## When to use each approach

**Patch-based versioning** is a good fit when:
- You need small, incremental changes in an existing workflow.
- You want existing instances to keep deterministic behavior after deployment.
- You want to avoid introducing a new workflow type yet.

**Name-based versioning** is a good fit when:
- You want a clean, new workflow type without accumulated patches.
- You are ready to remove old patch blocks and refactor more freely.
- You want version selection to be automatic based on naming conventions.

## Patch-based versioning

Patch-based versioning relies on a deterministic switch inside the workflow. Use `WorkflowContext.IsPatched` to guard
new behavior:

```csharp
public override async Task RunAsync(WorkflowContext context, OrderPayload input)
{
    await context.CallActivityAsync(nameof(ReserveInventoryActivity), input);

    if (context.IsPatched("v2"))
    {
        await context.CallActivityAsync(nameof(ChargePaymentActivityV2), input);
    }
    else
    {
        await context.CallActivityAsync(nameof(ChargePaymentActivity), input);
    }
}
```

### Patch rules

- Patch names can appear multiple times in the same workflow and can be nested.
- Patch names **must be unique across deployments**. For example, if you deployed a workflow with a patch name `"v1"`,
- you must not reuse `"v1"` in later edits. Use a new identifier such as `"v2"` to avoid non-deterministic behavior.
- `IsPatched` is available on `WorkflowContext`; no additional setup is required.

{{% alert title="Tip" color="primary" %}}
Keep patch names simple and monotonic (for example, `"v2"`, `"v3"`) so it is clear which deployment introduced each
change.
{{% /alert %}}

## Name-based versioning

Name-based versioning lets you create a new workflow version by changing the workflow type name. The recommended
pattern is to copy the existing workflow to a new file, rename the class, refactor as needed, and then start patching
again if necessary.

For example, if you had `OrderWorkflow`, create `OrderWorkflowV2` and refactor it. Older versions can remain for
in-flight instances while new instances use the latest version.

### Default naming behavior

By default, name-based versioning uses the built-in **NumericVersionStrategy** with a numeric suffix. The following
are all valid examples:

- `MyWorkflow` (treated as version `0`)
- `MyWorkflow2`
- `MyWorkflowV2`

The default strategy assumes higher numeric values are newer (for example, `MyWorkflowV10` is newer than
`MyWorkflowV2`). The .NET SDK also includes other built-in strategies (Date, SemVer, and Numeric) plus support for
custom strategies.

### Built-in strategies and options

The .NET SDK ships with several built-in name-based strategies. Each strategy supports options that let you tune how
the suffix is parsed and what to do when no suffix is present.

- **DateVersionStrategy**: Derives a date-based version from a trailing suffix (for example, `MyWorkflow20220611`).
  Options include:
  - **Date format**: Uses standard C# date formatting rules; defaults to `yyyyMMdd`.
  - **Default version**: Used when no suffix is provided; defaults to `0`.
  - **Prefix**: Optional prefix to match before the date suffix, with optional case-sensitivity.
- **SemVerVersionStrategy**: Derives a SemVer version from a trailing suffix (for example, `MyWorkflow1.2.3`).
  Options include:
  - **Prefix**: Optional prefix to match before the SemVer suffix, with optional case-sensitivity.
  - **Prerelease/build support**: Can parse prerelease annotations and build metadata.
  - **Default version**: Optional default when no suffix is provided, if configured to allow missing suffixes.
- **NumericVersionStrategy**: Derives a numeric version from a trailing suffix (for example, `MyWorkflow42` or
  `MyWorkflowV42`).
  Options include:
  - **Prefix**: Optional prefix to match before the numeric suffix, with optional case-sensitivity.
  - **Zero-padding width**: Optional width to allow fixed-width numbers with leading zeroes.
  - **Default version**: Used when no suffix is provided.

## Configure name-based versioning

### 1. Install the versioning package

Add the `Dapr.Workflow.Versioning` package to your project.

### 2. Register workflow versioning

Add versioning to DI during startup:

```csharp
builder.Services.AddDaprWorkflowVersioning();
```

### 3. Choose a strategy (optional)

You can select a strategy by registering it in DI after calling `AddDaprWorkflowVersioning`:

```csharp
builder.Services.UseDefaultWorkflowStrategy<NumericVersionStrategy>("workflow-versioning-options");
```

The optional string key is used to locate strategy options.

### 4. Configure strategy options (optional)

Register strategy options using the same key:

```csharp
builder.Services.ConfigureStrategyOptions<NumericVersionStrategyOptions>("workflow-versioning-options", o =>
{
    o.SuffixPrefix = "V";
});
```

{{% alert title="Note" color="primary" %}}
The option key strings must match exactly or the options will not be applied.
{{% /alert %}}

### 5. Register activities

Activities are registered as usual. Workflows do not need to be registered when using name-based versioning because a 
source generator discovers them at build time.

```csharp
builder.Services.AddDaprWorkflow(w =>
{
    w.RegisterActivity<SendEmailActivity>();
});
```

Once configured, named workflow versioning is applied automatically at runtime.

## Cross-assembly workflow discovery

By default, the workflow versioning source generator only scans the executing assembly. If you keep workflows in a
separate referenced assembly, those implementations are not discovered unless you opt in to reference scanning.

Reference scanning is disabled by default because it can increase build times (the generator must inspect all
referenced assemblies for `Workflow<,>` implementations). To enable it, add the following to the executing
application's `.csproj` file:

```xml
<ItemGroup>
  <CompilerVisibleProperty Include="DaprWorkflowVersioningScanReferences" />
</ItemGroup>
```

When enabled, the source generator adds any discovered workflow implementations from referenced assemblies to the
internal registry used for version tracking.

## Override name and version

If you need to override the canonical name or version detected from the workflow type, apply the `[WorkflowVersion]` 
attribute to the class implementing your workflow and specify values explicitly.

## Best practices

- **Schedule by canonical name**: When scheduling a new workflow instance, use the canonical workflow name (the
unversioned name). The SDK discovers versioned types and maps the canonical name to the latest version automatically.
Avoid scheduling with a specific versioned name.
- **Keep old versions**: Preserve older workflow types indefinitely. You can remove them only after you are certain
no in-flight instances reference them. Removing old versions too early can stall long-running workflows.
- **Version in one direction**: Always move versions forward. Avoid renaming or reusing older version identifiers.

## Current limitations

- A single project cannot mix multiple versioning strategies for different workflows.
- There is no automatic migration from one versioning strategy to another.
- Workflow versioning doesn't work across application boundaries. If you use multi-app workflows, you must use
the type name expected in the target app based on any versioning strategy applied there. Other applications calling into
this .NET application can simply use the canonical name if set up to use name-based workflow versioning. 

## Example project

An end-to-end example is available in the Dapr .NET SDK repository at [examples/Workflow/WorkflowVersioning](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowVersioning).

## Next steps

- [Learn how to author workflows and activities]({{% ref howto-author-workflow.md %}})
- [Workflow management operations]({{% ref dotnet-workflow-management-methods.md %}})
- [Workflow examples on GitHub]({{% ref dotnet-workflow-examples.md %}})
