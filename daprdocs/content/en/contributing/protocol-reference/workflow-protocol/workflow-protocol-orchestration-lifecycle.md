---
type: docs
title: "Workflow Protocol - Orchestration Lifecycle"
linkTitle: "Orchestration Lifecycle"
weight: 300
description: "Low-level description of the Workflow building block internals."
---

# Orchestration Lifecycle

This document describes the lifecycle of an orchestration at the protocol level, specifically how the Dapr engine and 
the SDK interact to execute workflow logic reliably.

## Replay-based Execution

Dapr Workflows use **event sourcing** and **replay** to maintain state. Instead of saving the entire state of the 
worker process (stack, variables, etc.), Dapr saves a history of events that have occurred.

### The Replay Loop

1.  **Work Item Arrival**: The Dapr engine sends an `OrchestratorWorkItem` to the SDK via the `GetWorkItems` stream. 
This work item contains the full history of the workflow instance plus any new events (e.g., an activity completion 
or an external event).
2.  **Reconstruction**: The SDK starts executing the orchestration function from the very beginning.
3.  **Deterministic Execution**: As the function executes, it encounters "tasks" (e.g., calling an activity, sleeping).
    *   For each task, the SDK checks the provided **History** to see if that task has already completed.
    *   If the task is in the history, the SDK returns the recorded result immediately without actually re-executing 
        the task logic.
    *   If the task is NOT in the history, the SDK records that this task needs to be scheduled and **suspends**
        execution of the orchestration function (typically by throwing a special exception or returning a pending 
        promise).
4.  **Reporting**: Once the orchestration function is suspended or completes, the SDK sends a 
    `CompleteOrchestratorTask` request to Dapr. This request contains a list of **Actions** (e.g., `ScheduleTask`, 
    `CreateTimer`) that the engine should perform.
5.  **State Commitment**: The Dapr engine receives the actions, updates the workflow history in the state store, and 
    schedules any requested tasks (e.g., by sending work to an activity worker).

## Step-by-Step Example

Imagine a workflow: `Activity A -> Activity B`.

### 1. Workflow Start
*   **Engine**: Enqueues `ExecutionStarted` event.
*   **SDK**: Receives `OrchestratorWorkItem` with `[ExecutionStarted]`.
*   **SDK**: Runs function. Function calls `Activity A`.
*   **SDK**: Checks history. `Activity A` is not there.
*   **SDK**: Suspends. Sends `CompleteOrchestratorTask` with `[ScheduleTask(Activity A)]`.
*   **Engine**: Records `TaskScheduled(Activity A)` in history.

### 2. Activity A Completes
*   **Engine**: Records `TaskCompleted(Activity A, result="foo")` in history.
*   **SDK**: Receives `OrchestratorWorkItem` with `[ExecutionStarted, TaskScheduled(A), TaskCompleted(A)]`.
*   **SDK**: Runs function from the start.
*   **SDK**: Function calls `Activity A`. SDK finds `TaskCompleted(A)` in history. Returns `"foo"`.
*   **SDK**: Function calls `Activity B`.
*   **SDK**: Checks history. `Activity B` is not there.
*   **SDK**: Suspends. Sends `CompleteOrchestratorTask` with `[ScheduleTask(Activity B)]`.
*   **Engine**: Records `TaskScheduled(Activity B)`.

### 3. Workflow Completion
*   **Activity B** completes.
*   **SDK**: Receives history with both A and B completed.
*   **SDK**: Runs function. Both A and B return results from history.
*   **SDK**: Function finishes and returns a final result.
*   **SDK**: Sends `CompleteOrchestratorTask` with `[CompleteOrchestration(result="final")]`.
*   **Engine**: Records `OrchestrationCompleted` and marks the instance as `COMPLETED`.

## Critical Requirements for SDK Authors

### 1. Determinism
The orchestration function MUST be deterministic. It cannot use:
*   Random numbers.
*   Current date/time (must use a durable timer or a provided `CurrentUtcDateTime`).
*   Direct IO (must be done in activities).
*   Global state that can change between replays.

### 2. Patching (In-flight updates)

When a workflow is already running, you might need to update its logic. However, since workflows are replay-based, 
changing the logic directly would break determinism for in-flight instances.

Dapr provides a **Patching** mechanism (e.g., `ctx.IsPatched("patch-id")`) to safely introduce changes:

*   **Logic Branching**: The SDK provides an API to check if a specific "patch" is active for the current instance.
*   **Patch Recording**: When a patch check is encountered during execution, the result (true/false) is recorded in 
    the workflow history.
*   **Consistency**: Once a patch is recorded as active (or inactive) for an instance, it remains so for the lifetime 
    of that instance, even if the worker code changes or the instance is moved to another worker.
*   **Safety**: The Dapr engine validates that the sequence of patches encountered during replay exactly matches the 
    sequence in history. If there's a mismatch, the workflow enters a **Stalled** state to prevent data corruption.

### 3. Named Versions (In-flight updates)
Dapr also provides a **Named Versioning** mechanism wherein the SDK maintains a registry of available named workflow
versions. When it receives a request to initialize a new workflow by name, it'll consult the registry to determine
if the name is a match for a different workflow version than the workflow name specified and is responsible for
redirecting the request to the intended "latest" version.

* **Logic Branching**: The SDK provides an API to register different versions for a given workflow name.
* **Replay Consistency**: The request to run a workflow may contain a property specifying a specific workflow name to
execute. This ensures that in-flight workflows will always run using the same workflow version whereas new workflows
will use the latest available version.

### 3. Stalled State

A workflow instance enters the `STALLED` state when the engine detects an unrecoverable condition that requires manual 
intervention or a code fix to proceed. Common reasons include:

*   **Patch Mismatch**: The current code's patching logic contradicts the instance's history.
*   **Execution Errors**: A fatal error occurred that cannot be handled by retries.

When stalled, the instance stops execution but remains in the system. Once the underlying issue is resolved (e.g., 
the correct code version is deployed), the instance can be resumed or will automatically resume on the next event.

### 4. History Management
The SDK must efficiently search the history. Typically, this is done by maintaining a counter of tasks encountered 
during execution and matching them against the sequence of events in the history.

### 5. Graceful Suspension
The SDK needs a mechanism to stop execution of the orchestration function when a task is scheduled but not yet
completed, without losing the ability to restart it later.
