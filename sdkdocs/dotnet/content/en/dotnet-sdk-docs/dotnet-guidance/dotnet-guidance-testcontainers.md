---
type: docs
title: "Integration testing with Dapr.Testcontainers"
linkTitle: "Testcontainers"
weight: 85200
description: Use Dapr.Testcontainers to run Dapr integration tests with real infrastructure
---

## Overview

`Dapr.Testcontainers` is a helper package for writing integration tests against real Dapr runtime components using
containers. It wraps the `Testcontainers` library to spin up Dapr sidecars, control plane services (placement and
scheduler), and the infrastructure needed by specific Dapr building blocks.

{{% alert title="Important" color="warning" %}}
`Dapr.Testcontainers` is an initial release. The API is still evolving and may change in future versions. We aim to
keep changes minimal, but you should expect potential breaking changes while the package matures.
{{% /alert %}}

## Packages

- `Dapr.Testcontainers` (core harnesses and infrastructure)
- `Dapr.Testcontainers.Xunit` (optional xUnit helpers)

## Prerequisites

- A container runtime (Docker Desktop, Podman, or equivalent).
- Network access to pull Dapr and dependency images.

## Core concepts

`Dapr.Testcontainers` models tests around **environments** and **harnesses**:

- **`DaprTestEnvironment`**: Shared infrastructure (network, placement, scheduler, optional Redis). Use this when you
  need multiple apps to share a Dapr control plane or when running multi-app tests.
- **`DaprHarnessBuilder`**: Creates a harness for a specific building block (workflow, jobs, distributed locks, or
  conversation).
- **`DaprTestApplicationBuilder`**: Starts your test app with the harness and wires Dapr endpoints into configuration.

## Basic workflow test example

The example below mirrors the workflow integration tests in the .NET SDK test suite and shows a typical setup:

```csharp
var componentsDir = TestDirectoryManager.CreateTestDirectory("workflow-components");

await using var environment = await DaprTestEnvironment.CreateWithPooledNetworkAsync(needsActorState: true);
await environment.StartAsync();

var harness = new DaprHarnessBuilder(componentsDir)
    .WithEnvironment(environment)
    .BuildWorkflow();

await using var testApp = await DaprHarnessBuilder.ForHarness(harness)
    .ConfigureServices(builder =>
    {
        builder.Services.AddDaprWorkflowBuilder(opt =>
        {
            opt.RegisterWorkflow<TestWorkflow>();
        });
    })
    .BuildAndStartAsync();

using var scope = testApp.CreateScope();
var workflowClient = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();

await workflowClient.ScheduleNewWorkflowAsync(nameof(TestWorkflow), input: 42);
```

## Configuring the Dapr runtime

`DaprRuntimeOptions` lets you control the Dapr image version, App ID, log level, and container logs:

```csharp
var options = new DaprRuntimeOptions("1.17.0")
    .WithAppId("test-app")
    .WithLogLevel(DaprLogLevel.Debug)
    .WithContainerLogs();

var harness = new DaprHarnessBuilder(componentsDir)
    .WithOptions(options)
    .BuildWorkflow();
```

You can also set the runtime version globally using the `DAPR_RUNTIME_VERSION` environment variable.

## xUnit helpers

If you use xUnit, the `Dapr.Testcontainers.Xunit` package includes a helper attribute to skip tests when the runtime
version is too low:

```csharp
[MinimumDaprRuntimeFact("1.17.0")]
public async Task RequiresLatestRuntime()
{
    // ...
}
```

## Next steps

- Review the integration test projects in the Dapr .NET SDK repo (for example,
  `test/Dapr.IntegrationTest.Workflow`).
- Use the harness that matches the building block you are testing (workflow, jobs, distributed locks, conversation).
