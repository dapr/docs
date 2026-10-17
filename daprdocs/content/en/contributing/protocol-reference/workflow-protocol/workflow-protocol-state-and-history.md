---
type: docs
title: "Workflow Protocol - State & History"
linkTitle: "State & History"
weight: 500
description: "Low-level description of the Workflow building block internals."
---

# State and History Management

Dapr Workflows are event-sourced, meaning the state of a workflow is derived from a sequence of events. This document 
describes how Dapr stores and manages this history and state.

## Backend Storage: Dapr Actors

By default, the Dapr Workflow engine uses **Dapr Actors** as its storage backend. Each workflow instance is mapped to 
a unique actor instance. This provides:
*   **Concurrency Control**: Actors ensure that only one operation is happening on a workflow instance at a time.
*   **Reliability**: Actor state is persisted in the configured Dapr State Store.
*   **Timers**: Dapr Actors provide durable reminders which are used to implement workflow timers.

## Workflow State Schema

The state of a workflow instance (actor) consists of several components:

### 1. Metadata
Stores high-level information about the instance:
*   `instance_id`: The unique ID of the workflow.
*   `name`: The name of the workflow.
*   `status`: The current runtime status (Running, Completed, Stalled etc.).
*   `version`: The name of the workflow version and any active patches.
*   `created_at`: Creation timestamp.
*   `last_updated_at`: Last activity timestamp.
*   `input`: Original input data.
*   `output`: Final output data (if completed).

### 2. History
A sequence of `HistoryEvent` objects that record everything that has happened in the workflow.
To optimize for large histories, Dapr often stores history events in chunks or as separate keys in the state store:
*   **Key Format**: `wf-history-<instance_id>-<index>`
*   **Event Content**: Serialized protobuf message containing event type, timestamp, and type-specific data (e.g., 
    `TaskScheduled`, `TaskCompleted`). Some event types carry additional type-specific fields — for example,
    `TimerCreated` events record an `origin` that identifies why the timer was scheduled (see
    [Execution API]({{% ref "workflow-protocol-execution-api.md" %}})).

### 3. Inbox (Pending Events)
A collection of events that have occurred but have not yet been processed by the orchestrator (replayed). This includes:
*   External events raised to the workflow.
*   Completed activity results.
*   Fired timers.

When the orchestrator next runs, it "drains" the inbox, moves those events into the history, and then replays the logic.

With the `WorkflowsFastPath` preview feature enabled, activity completions that the activity actor delivers with retry-forever semantics may skip the inbox: the sidecar holds them in memory and persists them straight into the history inside the next turn's commit, acknowledging the activity actor only after that commit. External events, fired timers and child workflow completions always go through the inbox. See [Workflow fast path]({{% ref "workflow-fast-path.md" %}}).

### 4. Parent notification and creation input
Two further keys exist for child workflows only, and neither is permanent:
*   `parent-notify`: A transient marker written in the same transaction as a child workflow's terminal state, recording that the parent has not yet been notified. It is cleared once the parent acknowledges the completion; while present, purge and instance ID reuse are refused.
*   `creation-input`: Written only when history signing is enabled. It holds the input the parent created the child with, kept outside the history so it survives `ContinueAsNew` and can be checked against the creating parent when the completion is attested.

### 5. Activity execution claim
Under the `WorkflowsFastPath` preview feature, an activity actor whose execution is still running when actor placement moves it to another host writes an `execution-claim` record under its own state prefix, with a heartbeat that the previous owner refreshes until the result is published. The new owner reads it to decide whether to defer, acknowledge an already published result, or execute as a fresh owner. It is written only around placement changes and deleted after a short retention.

## Replay and State Reconstruction

When a worker (SDK) receives a work item, Dapr provides the history events. The SDK reconstructs the internal state 
of the orchestration (e.g., local variables, current execution point) by replaying these events in order.

### Determinism and History
The history is the "source of truth". If the orchestration code changes in a non-deterministic way (e.g., adding a new 
activity call in the middle of existing code), the replay will fail because the code's requests won't match the 
recorded history.

## Purging State

When a workflow is purged, Dapr deletes the metadata and all associated history event keys from the state store. This 
is typically done to clean up after finished workflows.
