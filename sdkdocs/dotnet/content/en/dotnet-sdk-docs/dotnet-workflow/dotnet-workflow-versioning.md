---
type: docs
title: "Workflow versioning in the .NET SDK"
linkTitle: "Workflow versioning"
weight: 2500
description: Learn how to use patch-based and name-based workflow versioning in the Dapr .NET SDK
---

## Overview

Dapr Workflow versioning lets you evolve workflows without breaking deterministic execution for in-flight instances. The .NET SDK supports two approaches:

- **Patch-based versioning**: introduce conditional branches guarded by `context.IsPatched("patch-name")`.
- **Name-based versioning**: create a new workflow type name and let a versioning strategy select the newest version.

Use patch-based versioning for small, in-place changes. Use name-based versioning for larger refactors where you want a clean new workflow type.

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
public override async Task<bool> RunAsync(WorkflowContext context, OrderPayload input)
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

    return true;
}
```

### Patch rules

- Patch names can appear multiple times in the same workflow and can be nested.
- Keep an existing patch identifier for the same change across deployments. Do not reuse that identifier for a
  different change; introduce a new identifier instead. Names are case-sensitive and must not be blank.
- On replay, a patch recorded in history returns `true`; an unrecorded patch returns `false` while replaying.
  When execution advances beyond recorded history, a new patch can return `true`. Do not assume every existing
  instance stays on the old branch forever.
- Retain the old branch and patch checks while retained histories still need them. Removing or reordering durable
  calls without a compatible versioning transition can stall replay.
- `IsPatched` is available on `WorkflowContext`; no additional setup is required.

{{% alert title="Tip" color="primary" %}}
Keep patch names simple and monotonic (for example, `"v2"`, `"v3"`) so it is clear which deployment introduced each change.
{{% /alert %}}

## Name-based versioning

Name-based versioning lets you create a new workflow version by changing the workflow type name. The recommended pattern is to copy the existing workflow to a new file, rename the class, refactor as needed, and then start patching again if necessary.

For example, if you had `OrderWorkflow`, create `OrderWorkflowV2` and refactor it. Older versions can remain for in-flight instances while new instances use the latest version.

### Default naming behavior

By default, name-based versioning uses **NumericVersionStrategy** with the case-sensitive prefix `V`:

- `MyWorkflow` (treated as version `0`)
- `MyWorkflowV2`
- `MyWorkflowV10`

Higher numeric values are newer (`MyWorkflowV10` is newer than `MyWorkflowV2`). A raw suffix such as `MyWorkflow2`
requires `NumericVersionStrategyOptions.SuffixPrefix = ""`; it is not accepted by the default configuration.
The SDK also includes Date and SemVer strategies and supports custom strategies/selectors.

### Built-in strategies and options

The .NET SDK ships with several built-in name-based strategies. Each strategy supports options that let you tune how the suffix is parsed and what to do when no suffix is present.

- **DateVersionStrategy**: Derives a date-based version from a trailing suffix (for example, `MyWorkflow20220611`).
  Options include:
  - **Date format**: Uses standard C# date formatting rules; defaults to `yyyyMMdd`.
  - **Default version**: Used when no suffix is provided; defaults to `0`.
  - **Prefix**: Optional prefix to match before the date suffix, with optional case-sensitivity.
- **SemVerVersionStrategy**: Parses SemVer versions, including explicit `[WorkflowVersion(Version = "1.2.3")]`
  metadata. Use the attribute for dotted versions, prerelease identifiers, and build metadata that cannot appear
  in a C# class name.
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

If you haven't already added it, you need to add the `Dapr.Workflow` package to your project. No additional packages are required.

### 2. Register workflow versioning

Add versioning to DI during startup:

```csharp
using Dapr.Workflow.Versioning;

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

### 5. Register workflows and activities
With the source generator included in `Dapr.Workflow`, both workflows and activities are discovered and registered automatically at build time. You do not need to opt into named workflow versioning to benefit from this automatic registration.

The `AddDaprWorkflow()` call is still required to wire up Dapr workflow services, but the options delegate is now optional:
```csharp
builder.Services.AddDaprWorkflow();
```

Explicit registrations remain supported if you prefer them:
```csharp
builder.Services.AddDaprWorkflow(w => 
{
    w.RegisterActivity<SendEmailActivity>();
});
```

Once configured, named workflow versioning is applied automatically at runtime.

## Cross-assembly workflow discovery
By default, the workflow versioning source generator only scans the executing assembly. If you keep workflows in a separate referenced assembly, those implementations are not discovered unless you opt in to reference scanning.

Reference scanning is disabled by default because it can increase build times (the generator must inspect all referenced assemblies for workflow and activity implementations). To enable it, add the following to the executing application's `.csproj` file:

```xml
<PropertyGroup>
  <DaprWorkflowVersioningScanReferences>true</DaprWorkflowVersioningScanReferences>
</PropertyGroup>
<ItemGroup>
  <CompilerVisibleProperty Include="DaprWorkflowVersioningScanReferences" />
</ItemGroup>
```

When enabled, the source generator adds any discovered workflow and activity types from all referenced assemblies and registers them automatically. This applies regardless of whether you used named workflow versioning - it is a general-purpose discovery mechanism.

## Override name and version

If you need to override the canonical name or version detected from the workflow type, apply the `[WorkflowVersion]` 
attribute to the class implementing your workflow and specify values explicitly:

```csharp
using Dapr.Workflow;
using Dapr.Workflow.Versioning;

[WorkflowVersion(
    CanonicalName = "OrderWorkflow",
    Version = "2",
    StrategyType = typeof(NumericVersionStrategy))]
public sealed class RevisedOrderWorkflow : Workflow<string, string>
{
    public override Task<string> RunAsync(WorkflowContext context, string input)
        => context.CallActivityAsync<string>("ProcessOrder", input);
}
```

`StrategyType` overrides the default per type; `OptionsName` selects named strategy options for that override.
Different workflow families can use different strategies. All overrides in one canonical family must agree on
strategy and options, and its versions must be comparable by that strategy. Ambiguous latest versions or
conflicting configuration fail registration rather than silently picking a candidate.

The default selector is `MaxVersionSelector`. Advanced registrations can supply `DefaultStrategy` and
`DefaultSelector` factories in `AddDaprWorkflowVersioning`, or use `UseDefaultWorkflowSelector<TSelector>()`.
Generated contributions from loaded assemblies are combined before version selection. Explicit workflow
registrations take precedence, so an explicit canonical alias can intentionally override automatic routing.

## Best practices

- **Schedule by canonical name**: When scheduling a new workflow instance, use the canonical workflow name (the
unversioned name). The SDK discovers versioned types and maps the canonical name to the latest version automatically.
Use a concrete versioned name only when intentionally pinning a caller to that version; concrete registrations
remain available for replay. Fully qualified concrete names disambiguate colliding simple names.
- **Keep old versions**: Preserve older workflow types indefinitely. You can remove them only after you are certain
no in-flight instances reference them. Removing old versions too early can stall long-running workflows.
- **Version in one direction**: Always move versions forward. Avoid renaming or reusing older version identifiers.

## Current limitations

- There is no automatic migration from one versioning strategy to another.
- Version selection is configured by the destination application, not negotiated across apps. Multi-app callers
  can use the destination's canonical name when it enables name-based routing; otherwise use its registered name.
- Name-based routing does not migrate running histories or incompatible activity contracts. Keep the concrete
  versions and activity names required by retained histories.

## Example project

An end-to-end example is available in the Dapr .NET SDK repository at [examples/Workflow/WorkflowVersioning](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow/WorkflowVersioning).

## Next steps

- [Learn how to author workflows and activities]({{% ref howto-author-workflow.md %}})
- [Workflow management operations]({{% ref dotnet-workflow-management-methods.md %}})
- [Workflow examples on GitHub]({{% ref dotnet-workflow-examples.md %}})
