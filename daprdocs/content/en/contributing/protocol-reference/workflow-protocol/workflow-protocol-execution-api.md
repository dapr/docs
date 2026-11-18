---
type: docs
title: "Workflow Protocol - Execution API"
linkTitle: "Execution API"
weight: 200
description: "Low-level description of the Workflow building block internals."
---

# Workflow Execution API (Task Hub Protocol)

The Workflow Execution API is a low-level gRPC protocol used by Dapr Workflow SDKs to act as "Workers". The SDK
connects to the Dapr sidecar via this protocol to poll for work and report completion.

The service is named `TaskHubSidecarService`.

### Service Definition (gRPC)

```protobuf
service TaskHubSidecarService {
  rpc GetWorkItems(GetWorkItemsRequest) returns (stream WorkItem);
  rpc CompleteOrchestratorTask(OrchestratorResponse) returns (CompleteBatchResponse);
  rpc CompleteActivityTask(ActivityResponse) returns (CompleteBatchResponse);
  // ... other management methods
}
```

## Worker Lifecycle

1.  **Connection**: The SDK opens a long-running bidirectional stream to `GetWorkItems`.
2.  **Polling**: The SDK receives `WorkItem` messages from the stream.
3.  **Execution**:
    *   If the work item is an **Orchestration**, the SDK retrieves and replays the history events to determine the next actions.
    *   If the work item is an **Activity**, the SDK executes the activity logic.
4.  **Completion**:
    *   For Orchestrations, the SDK calls `CompleteOrchestratorTask` with a list of actions to take.
    *   For Activities, the SDK calls `CompleteActivityTask` with the result or failure information.

## gRPC Service: `TaskHubSidecarService`

### GetWorkItems

Opens a stream to receive work items for orchestrations and activities.

**Request (`GetWorkItemsRequest`):**
Typically empty or contains worker metadata.

**Response (stream `WorkItem`):**
A `WorkItem` can be one of:
*   `orchestrator_item`: Contains history and new events for an orchestration.
*   `activity_item`: Contains details for a single activity task.

### CompleteOrchestratorTask

Reports the results of an orchestration execution.

**Request (`OrchestratorResponse`):**
*   `instance_id`: The ID of the workflow instance.
*   `actions`: A list of `OrchestratorAction` messages.
*   `custom_status`: Optional string for user-defined status.

**WorkflowAction Types:**
*   `ScheduleTaskAction`: Schedule an activity.
*   `CreateTimerAction`: Schedule a durable timer.
*   `CreateChildWorkflowAction`: Start a child workflow.
*   `CreateDetachedWorkflowAction`: Start a detached workflow.
*   `CompleteWorkflowAction`: Complete or fail the current workflow.
*   `TerminateWorkflowAction`: Terminate another workflow instance.
*   `SendEventAction`: Send an external event to another workflow.
*   `WorkflowVersionNotAvailableAction`: Report that the requested workflow version is unavailable.

#### TerminateWorkflowAction

The existing `TerminateWorkflowAction` message contains the target `instanceId` and a `recurse` flag. It does not add a termination-reason field. The Dapr public workflow termination API accepts the optional reason and maps it through the existing Durable Task termination payload.

### CompleteActivityTask

Reports the result of an activity execution.

**Request (`ActivityResponse`):**
*   `instance_id`: The ID of the workflow instance.
*   `task_id`: The unique ID of the activity task.
*   `completion_token`: The opaque token received in the `ActivityWorkItem`.
*   `result`: The serialized output of the activity (if successful).
*   `failure_details`: Details about the error (if failed).

## Data Models

### HistoryEvent

Workflows in Dapr are event-sourced. The state of an orchestration is rebuilt by replaying a sequence of
`HistoryEvent` messages.

Common event types:
*   `ExecutionStarted`: Initial event containing workflow name and input.
*   `TaskScheduled`: An activity was scheduled.
*   `TaskCompleted`: An activity finished successfully.
*   `TaskFailed`: An activity failed.
*   `TimerCreated`: A timer was scheduled.
*   `TimerFired`: A timer expired.
*   `ExecutionTerminated`: The workflow was terminated.

#### ExecutionTerminatedEvent

| Field | Type | Description |
| :--- | :--- | :--- |
| `input` | `google.protobuf.StringValue` | The existing termination payload. Dapr maps a supplied termination reason to this field through `TerminateRequest.output`. |
| `recurse` | `bool` | Whether termination must be propagated to child workflows. |


When recursive termination is applied, the existing `input` field is copied into each child workflow's `ExecutionTerminatedEvent`. No additional reason field is required.

#### Timer origin

`TimerCreated` events record an `origin` that identifies why the timer was scheduled. This is internal engine bookkeeping (also surfaced by the `dapr workflow history` command); it does not change how developers author workflows or how timers behave. The possible origins are:

*   `createTimer`: An explicit durable timer created by the workflow (for example, `ctx.create_timer(...)`).
*   `externalEvent`: A timer backing a "wait for external event" call that has a timeout. Carries the event name.
*   `activityRetry`: A timer backing the delay between activity retry attempts. Carries the failing task's execution ID.
*   `childWorkflowRetry`: A timer backing the delay between child-workflow retry attempts. Carries the child instance ID.

### FailureDetails

Used to report errors from activities or orchestrations.
*   `error_type`: A string identifying the type of error.
*   `error_message`: A human-readable error message.
*   `stack_trace`: Optional stack trace.
*   `is_non_retriable`: Boolean flag.

## Protocol Nuances

*   **Streaming**: `GetWorkItems` is a server-to-client stream. Dapr pushes work to the SDK as it becomes available.
*   **Sticky Sessions**: Dapr attempts to send work items for the same instance to the same worker if possible, but
the SDK must not rely on this for correctness.
*   **Determinism**: The SDK **must** ensure that the orchestration logic is deterministic. During replay, the SDK
uses the history provided in the `OrchestratorWorkItem` to avoid re-executing actions that have already been recorded.
