---
type: docs
title: "DaprWorkflowClient lifetime management and registration"
linkTitle: "DaprWorkflowClient registration"
weight: 1000
description: Configure workflow hosting, discovery, client lifetime, transport limits, and history caching
---

## Install and register

Use `Dapr.Workflow` 1.19.0 or a later compatible release:

```sh
dotnet add package Dapr.Workflow
```

`AddDaprWorkflow` registers the workflow worker as a hosted service, its dependencies, and a
`DaprWorkflowClient`. It works with ASP.NET Core and the .NET Generic Host. Start the host to process work items;
building a service provider alone does not start the worker.

```csharp
using Dapr.Workflow;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();

var app = builder.Build();
await app.RunAsync();
```

Configure a workflow-compatible state store and the Dapr runtime services described in
[Author workflows]({{% ref howto-author-workflow.md %}}). Use Dapr runtime 1.19 for the full SDK 1.19 surface.

### Automatic discovery and explicit registration

The included source generator discovers accessible, concrete classes deriving from `Workflow<TInput, TOutput>`
and `WorkflowActivity<TInput, TOutput>` in the project being compiled. An options delegate is not required.
Abstract classes and open generic types are not registered.

Explicit registration is supported for custom names, delegate implementations, or types not discovered by the
generator. Explicit registrations take precedence over generated registrations:

```csharp
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<OrderProcessingWorkflow>();
    options.RegisterActivity<SquareNumberActivity>();
    options.RegisterActivity<int, int>("Double", (_, input) => Task.FromResult(input * 2));
});
```

To scan accessible workflow and activity types in referenced assemblies, add **both** the property value and
compiler-visible property to the host project's `.csproj`. Reference scanning is disabled by default to limit
build overhead:

```xml
<PropertyGroup>
  <DaprWorkflowVersioningScanReferences>true</DaprWorkflowVersioningScanReferences>
</PropertyGroup>
<ItemGroup>
  <CompilerVisibleProperty Include="DaprWorkflowVersioningScanReferences" />
</ItemGroup>
```

Discovery does not require opting into [name-based workflow versioning]({{% ref dotnet-workflow-versioning.md %}}).
Avoid colliding simple type names, or register distinct explicit names.

## Client lifetime and dependency injection

The client defaults to a singleton. Reuse it instead of constructing a client for every operation, and let the
container manage disposal of injected instances. `DaprWorkflowClient` implements both `IDisposable` and
`IAsyncDisposable`; the DI-registered gRPC transport is managed by the client factory.

The overload with an options delegate accepts `lifetime` to change the **client** lifetime:

```csharp
builder.Services.AddDaprWorkflow(
    options => { },
    lifetime: ServiceLifetime.Scoped);
```

Use `ServiceLifetime.Transient` for a new client on each resolution. This does not change the singleton runtime
options/factory or turn the hosted worker into a scoped service.

Inject the concrete `DaprWorkflowClient` into an ASP.NET Core endpoint:

```csharp
app.MapPost("/start", async (DaprWorkflowClient client, Order order) =>
{
    var instanceId = await client.ScheduleNewWorkflowAsync(
        nameof(OrderProcessingWorkflow), input: order);
    return Results.Accepted(value: new { instanceId });
});
```

In a Generic Host application, resolve it from the host's services. Use asynchronous disposal for an async scope:

```csharp
await using var scope = host.Services.CreateAsyncScope();
var client = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();
```

The public `DaprWorkflowClientBuilder` in `Dapr.Workflow.Registration` can also construct a management client
without hosting a worker. Dispose clients you construct yourself. `AddDaprWorkflowClient` is **not a public
registration extension** in this release; use `AddDaprWorkflow` when hosting workflows.

## Transport configuration

The hosted worker and DI client resolve their sidecar gRPC address through Dapr configuration, including
`DAPR_GRPC_ENDPOINT` / `DAPR_GRPC_PORT`. Configure `DAPR_API_TOKEN` when the sidecar requires authentication.
Workflow operations use gRPC; changing an HTTP timeout is not a workflow execution deadline.

### Change gRPC message size limits

Use the builder returned by `AddDaprWorkflow`:

```csharp
builder.Services.AddDaprWorkflow()
    .WithGrpcMessageSizeLimits(
        maxReceiveMessageSize: 16 * 1024 * 1024,
        maxSendMessageSize: 16 * 1024 * 1024);
```

The DI transport defaults to no SDK send/receive size limit. Explicit limits must be positive byte counts.
Sidecar, scheduler, and state-store limits still apply independently. Consider
[data references]({{% ref dotnet-workflow-data-references.md %}}) rather than increasing limits for large payloads.
`WorkflowRuntimeOptions.UseGrpcChannelOptions` also supports setting the send/receive limits; the registration
does not copy every property of that `GrpcChannelOptions` object.

## Worker history caching

The worker enables stateful history by default: the sidecar can send new events rather than the complete history
on every turn. A cache miss is recovered through the history RPC; the cache is not durable application state.

```csharp
builder.Services.AddDaprWorkflow(options =>
{
    options.HistoryCacheTtl = TimeSpan.FromMinutes(30);
    options.HistoryCacheMaxInstances = 10_000;
    options.HistoryCacheMaxBytes = 256L * 1024 * 1024;
});
```

| Option | Default and behavior |
| --- | --- |
| `DisableStatefulHistory` | `false`; set `true` to always receive full history and ignore cache settings. |
| `HistoryCacheTtl` | `null` uses a one-hour sliding TTL. Explicit values must be positive. |
| `HistoryCacheMaxInstances` | `0` uses the built-in limit of 100,000 instances per work-item stream. |
| `HistoryCacheMaxBytes` | `0` means no byte budget; instance count and TTL still apply. |

Capacity values cannot be negative. Entries are evicted using least-recently-used ordering when a capacity limit
is exceeded. This cache does not eliminate workflow replay or automatically cache resolved binary payloads.

`MaxConcurrentWorkflows` and `MaxConcurrentActivities` on `WorkflowRuntimeOptions` are obsolete and have no
effect. Configure dispatch concurrency in the Dapr runtime instead. For concurrency within one workflow, see
[bounded parallel processing]({{% ref dotnet-workflow-authoring.md %}}#fan-out-and-bounded-parallel-processing).

## Inject services into activities

Activities are activated through dependency injection in a scope for each activity invocation. Register their
dependencies normally:

```csharp
using Dapr.Workflow;
using Microsoft.Extensions.Logging;

public sealed class SquareNumberActivity(ILogger<SquareNumberActivity> logger) : WorkflowActivity<int, int>
{
    public override Task<int> RunAsync(WorkflowActivityContext context, int input)
    {
        logger.LogInformation("Squaring {Number}; task key {TaskKey}", input, context.TaskExecutionKey);
        return Task.FromResult(input * input);
    }
}
```

### Activity task execution identifiers

`WorkflowActivityContext` exposes `Identifier`, `InstanceId`, and **`TaskExecutionKey`**, not `TaskExecutionId`.
The worker uses the runtime's task execution ID when available, falling back to the numeric task ID otherwise.
SDK activity retries preserve the task execution ID. Combine the key with the workflow instance/app identity when
designing an idempotency key, and persist deduplication atomically with the side effect. The identifier alone does
not make an activity exactly-once.

### Replay-safe logging

Use `context.CreateReplaySafeLogger<T>()` inside workflows. It suppresses log writes during replay. Although
the current factory can activate workflow constructors through DI, the included `DAPR1305` analyzer warns against
workflow constructor injection. Keep injected I/O dependencies in activities; they do not make nondeterministic
operations safe during workflow replay.

## Next steps

- [Author workflows and activities in .NET]({{% ref dotnet-workflow-authoring.md %}})
- [Workflow management operations]({{% ref dotnet-workflow-management-methods.md %}})
- [Configure workflow serialization]({{% ref dotnet-workflow-serialization.md %}})
