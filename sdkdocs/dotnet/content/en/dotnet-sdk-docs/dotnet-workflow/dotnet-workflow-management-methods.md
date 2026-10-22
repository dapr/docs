---
type: docs
title: "Workflow management operations with DaprWorkflowClient"
linkTitle: "Workflow management operations"
weight: 2000
description: Schedule, inspect, wait for, signal, rerun, and manage workflow instances
---

`DaprWorkflowClient` provides the following operations in SDK 1.19.0. Use a Dapr 1.19 runtime for the complete
surface, particularly listing, history inspection, and rerunning from an event. Register or construct a client as
described in [client registration]({{% ref dotnet-workflowclient-usage.md %}}).

## Schedule a new workflow instance

`ScheduleNewWorkflowAsync` returns an instance ID, not the workflow result. Provide a registered workflow name and
optional input. Omitting `instanceId` generates a GUID. A scheduled start in the future delays execution; a past
or omitted start time starts it immediately.

```csharp
var instanceId = await client.ScheduleNewWorkflowAsync(
    name: "OrderProcessingWorkflow",
    instanceId: null,
    input: new { Product = "Paperclips", Quantity = 1000 },
    startTime: DateTimeOffset.UtcNow.AddMinutes(5),
    cancellation: cancellationToken);
```

The cancellation-capable overload takes `name`, `instanceId`, `input`, `DateTimeOffset? startTime`, and
`cancellation`. The three-argument convenience overload and legacy `DateTime?` overload do not take a token.
Cancellation stops the client request; it does not terminate an instance that was already scheduled.

When [name-based versioning]({{% ref dotnet-workflow-versioning.md %}}) is enabled, prefer the canonical name for
new instances so the target app can choose its latest registered version.

## Retrieve the status of a workflow instance

`GetWorkflowStateAsync` returns a **`WorkflowState`** snapshot:

```csharp
var state = await client.GetWorkflowStateAsync(
    instanceId, getInputsAndOutputs: true, cancellation: cancellationToken);

if (!state.Exists)
{
    throw new InvalidOperationException($"Workflow {instanceId} does not exist.");
}

var status = state.RuntimeStatus;
```

| Member | Meaning |
| --- | --- |
| `Exists`, `WorkflowName` | Whether an instance was found and its workflow name. |
| `RuntimeStatus` | Current `WorkflowRuntimeStatus`, including pending, running, suspended, terminal, or unknown state. |
| `IsWorkflowRunning` | True only for `Running`, not for pending or suspended instances. |
| `IsWorkflowCompleted` | True for **any terminal state**: completed, failed, or terminated. It does not imply success. |
| `CreatedAt`, `LastUpdatedAt` | UTC timestamps exposed as `DateTimeOffset`. |
| `FailureDetails` | Failure type, message, and optional stack trace when available. |
| `ReadInputAs<T>()`, `ReadOutputAs<T>()`, `ReadCustomStatusAs<T>()` | Deserialize captured values using the configured workflow serializer. |

Set `getInputsAndOutputs: false` to avoid fetching input/output data when polling status. Keep custom status small;
the SDK processes custom status returned by the runtime even when this flag is false. Typed readers do not fetch
missing data later. With [data references]({{% ref dotnet-workflow-data-references.md %}}), metadata reads can also
download binary objects.

A missing instance, including gRPC `NotFound`, produces `Exists == false`. Other gRPC failures propagate as
`RpcException`; do not treat transport failures as missing workflows. Access to failure details depends on the
data included in the runtime response.

## Wait for start or completion

`WaitForWorkflowStartAsync` waits until the instance leaves pending state. `WaitForWorkflowCompletionAsync` waits
for completed, failed, or terminated state. Both return `WorkflowState`, can return immediately when the target
state was already reached, and throw `InvalidOperationException` when the runtime reports no instance.

```csharp
using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
timeout.CancelAfter(TimeSpan.FromMinutes(10));

var finalState = await client.WaitForWorkflowCompletionAsync(
    instanceId, getInputsAndOutputs: true, cancellation: timeout.Token);

if (finalState.RuntimeStatus != WorkflowRuntimeStatus.Completed)
{
    throw new InvalidOperationException(
        $"Workflow ended with {finalState.RuntimeStatus}: {finalState.FailureDetails?.ErrorMessage}");
}

var result = finalState.ReadOutputAs<string>();
```

Waits retry gRPC `Unavailable` and `DeadlineExceeded` with backoff until they succeed or the caller cancels.
Always set a cancellation/deadline appropriate to the application: an eternal workflow might never finish.
Canceling a wait does not cancel the workflow.

## Raise an event to a running workflow instance

```csharp
await client.RaiseEventAsync(instanceId, "Approval", true, cancellation: cancellationToken);
```

The workflow receives the value through `WaitForExternalEventAsync<T>("Approval")`. Events can be buffered before
the workflow starts waiting. Submission does not acknowledge application processing; do not rely on this call to
confirm that a missing or already-completed target consumed an event.

## Suspend a running workflow instance

```csharp
await client.SuspendWorkflowAsync(instanceId, reason: "Manual review", cancellation: cancellationToken);
```

Suspension pauses workflow progression until resumed; it is not cancellation of an activity's external side effects.

## Resume a suspended workflow instance

```csharp
await client.ResumeWorkflowAsync(instanceId, reason: "Review complete", cancellation: cancellationToken);
```

## Terminate a workflow instance

```csharp
await client.TerminateWorkflowAsync(
    instanceId, output: new { Reason = "Canceled by operator" }, cancellation: cancellationToken);
```

`output` is an optional serializable **object**, not just a string. The request recursively terminates child
workflows, but does not stop in-flight activity executions or independent detached workflows. Request completion
does not mean every affected workflow has already transitioned; query or wait for the resulting state.

## Purge a workflow instance

The public method is **`PurgeInstanceAsync`**, not `PurgeWorkflowAsync`:

```csharp
bool purged = await client.PurgeInstanceAsync(instanceId, cancellation: cancellationToken);
```

Only terminal instances can be purged. The SDK requests recursive deletion of child instances and their histories;
the Boolean result reports whether the runtime deleted any instances. Runtime errors still propagate.
Purging is irreversible and does not delete binary payload objects. Follow the
[payload retention and cleanup guidance]({{% ref dotnet-workflow-data-references.md %}}#retain-and-clean-up-payloads).

## List instance IDs with pagination

`ListInstanceIdsAsync` returns a `WorkflowInstancePage` containing `InstanceIds` and an optional
`ContinuationToken`. Pass the token back unchanged to obtain the next page:

```csharp
string? continuationToken = null;
do
{
    var page = await client.ListInstanceIdsAsync(
        continuationToken, pageSize: 100, cancellation: cancellationToken);
    foreach (var id in page.InstanceIds)
    {
        Console.WriteLine(id);
    }
    continuationToken = page.ContinuationToken;
}
while (!string.IsNullOrEmpty(continuationToken));
```

`pageSize`, when supplied, must be greater than zero. This API lists IDs, not full states; it does not expose
status/date/name filters. Fetch individual states as needed and bound request concurrency for large listings.

## Inspect execution history

```csharp
var events = await client.GetInstanceHistoryAsync(instanceId, cancellation: cancellationToken);
foreach (var historyEvent in events)
{
    Console.WriteLine($"{historyEvent.EventId}: {historyEvent.EventType} at {historyEvent.Timestamp:O}");
}
```

The returned `IReadOnlyList<WorkflowHistoryEvent>` contains event ID, event type, and timestamp. It does **not**
expose raw serialized inputs, outputs, or the full protobuf history. Event types distinguish activity scheduling,
completion/failure, child workflows, timers, events, suspension/resumption, continuation, and detached creation.

## Rerun from a history event

`RerunWorkflowFromEventAsync` creates a **new** workflow instance from a source history and event ID. It does not
reset the source instance. Select a runtime-supported rerun point from history; an event ID is not a list index,
and not every event is a valid rerun boundary.

```csharp
using Dapr.Workflow.Client;

var rerunId = await client.RerunWorkflowFromEventAsync(
    sourceInstanceId: instanceId,
    eventId: eventId,
    options: new RerunWorkflowFromEventOptions
    {
        NewInstanceId = null,
        OverwriteInput = true,
        Input = replacementActivityInput
    },
    cancellation: cancellationToken);
```

The `eventId` argument is `uint`. Omit options to retain recorded input and let the runtime allocate an ID.
`NewInstanceId` optionally chooses the new ID. Set `OverwriteInput = true` when supplying `Input`; otherwise a
non-null input is rejected. The override is applied at the next activity event at the rerun point, not as a
general replacement for all earlier history.

Keep the workflow/activity implementations and any referenced payload objects needed by the copied history.
Rerunning is not compensation: earlier external side effects remain, and executing work again still requires
idempotent activities.

## Next steps

- [Author workflows and activities in .NET]({{% ref dotnet-workflow-authoring.md %}})
- [Workflow versioning]({{% ref dotnet-workflow-versioning.md %}})
- [Try the Dapr Workflow quickstart]({{% ref workflow-quickstart.md %}})
