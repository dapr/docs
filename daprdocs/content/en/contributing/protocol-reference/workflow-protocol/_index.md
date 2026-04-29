---
type: docs
title: "Workflow Protocol"
linkTitle: "Workflow"
weight: 10
description: "Low-level description of the Workflow building block internals."
---

This document specifies the Dapr Workflow protocol and runtime contract at a low level. It targets SDK authors building 
Workflow Workers and runtime maintainers evolving the Dapr sidecar’s Workflow Engine.

## Overview
Dapr Workflow implements a sidecar-as-scheduler pattern: the Dapr runtime (sidecar) acts as the Workflow Engine, and 
the application SDK acts as the Workflow Worker. All control and execution traffic flows over gRPC.

There are two protocol surfaces:
1. Management API (standard Dapr gRPC accessible via SDK):
    - Start, terminate, pause, resume, re-run, purge and query workflow instances.
2. Execution API (Task Hub Protocol):
    - Worker facing, used to receive orchestration/activity work items and to report completion (e.g., via 
    `TaskHubSidecarService`).

[//]: # (graph LR)

[//]: # (Client[Workflow Client] -- Management API --> Sidecar[Dapr Sidecar Engine])

[//]: # (Sidecar -- Task Hub Protocol --> Worker[Workflow Worker SDK])

[//]: # (Sidecar -- State Store --> Actors[Dapr Actors Backend])


Key Components
- **Workflow Engine (Dapr Sidecar)**
  
   Manages workflow state transitions, history persistence, scheduling of orchestration and activity tasks, and 
   reliable delivery semantics. By default, it leverages Dapr Actors as the backend for durable, partitioned execution.

- **Workflow Worker (Application SDK)**

  Connects to the sidecar, polls for orchestration and activity work items, executes user-defined logic, and returns 
  results, failures, and heartbeats to the engine. Orchestration logic must be deterministic; activity logic need not 
  be.

- **Orchestration**

  The deterministic coordinator that defines the workflow. The engine drives orchestrations via history replay to 
  rebuild state and schedule outbound tasks (activities, sub-orchestrations, timers, external events).

- **Activity**

  The atomic unit of work. Activities are executed **at-least-once** and report results or failures back to the engine. 
  Idempotency is recommended and task execution identifiers are available on context to assist with this.

- **State Store & Backend**

  Workflow history and state are durably persisted. The engine typically implements a task hub pattern over the chosen 
  persistence and uses Dapr Actors as the default reliability substrate.

## Execution Model
Dapr Workflow is based on the Durable Task Framework (DTFx) execution semantics:

### Replay-based Execution
Orchestrators are replayed from their event history to rebuild deterministic state. All nondeterministic operations 
(time, random values, I/O) must be mediated by the engine (e.g., timers, activity calls, external events).

### Deterministic Orchestrators
Orchestrator code must be side-effect free except via engine-mediated effects. Control flow must be reproducible 
during replay.

### At-least-once Activities, Exactly-once State Commit
Activities may be delivered more than once. The engine ensures workflow state commits are idempotent and applied 
exactly once.

### Sidecar-as-Scheduler
The sidecar owns scheduling and persists all history/events before dispatching work to workers. Workers are stateless 
executors from the engine’s perspective.

## Protocol Surfaces
1) Management API (Standard Dapr gRPC)
  - **Start Workflow**: Create and persist an initial history event; return instance metadata
  - **Terminate / Pause/ Resume**: Drive lifecycle transitions through persisted control events.
  - **Query**: Retrieve instance status, history, output, failure details, and custom metadata.
  - **Re-run**: Start a new workflow instance from a history event.
  - **Purge**: Proactively clear workflow history and state.

> **Note**: See: [Management API specification]({{% ref workflow-protocol-management-api %}}) for exact RPC shapes, 
> error codes and semantics.

2) Execution API (Task Hub Protocol)
  - **Poll for Work**: Workers fetch orchestration and activity work items.
  - **Complete / Fail Work**: Workers report completion results or failures; the engine appends these to history and advances
    orchestration progress.
  - **Heartbeats / Leases**: Optional mechanisms for long-running activities and cooperative rebalancing.
  - **Timers & External Events**: Delivered to orchestrations as history events to keep replay deterministic.

> **Note**: See [Execution API specification]({{% ref workflow-protocol-execution-api %}}) defining `TaskHubSidecarService` 
> contracts, payload schemas and sequencing rules.

# Request & Runtime Lifecycle
1. Start Workflow
  - Client calls `StartWorkflow` via the Management API.
  - Engine persists the initial event (e.g., `ExecutionStarted`) and materializes an instance.
2. Orchestrator Execution (Replay-driven)
  - Engine replays orchestration history to rehydrate state.
  - Orchestrator schedules effects (activities, sub-orchestrations, timers) by issuing commands, which the engine 
  persists as new history events.
3. Activity Dispatch & Execution
  - Engine dispatches activity work items to workers
  - Worker runs the activity (may be retried and delivered at least once).
  - Worker responds with completion (result) or failure; engine appends to history.
4. Timers & External Signals
  - Engine delivers timer fired or external event records as history entries.
  - Orchestrator consumes these deterministically on next replay.
5. Progress & Checkpointing
  - Each step appends to the history log and advances orchestration state.
  - The engine safeguards idempotence and exactly-once commit of orchestration state.
6. Completion
  - Orchestration returns an output (success) or a failure (exception details).
  - Final state and output are persisted; status queries reflect the terminal state.

# Protocol Principles
- **GRIEF (GRpc IntErFace)**: All worker/engine and client/engine communication is gRPC.
- **Replay-based Orchestration**: Determinism enforced through history replay.
- **At-least-once Activity Delivery**: Activities may re-execute; design for idempotency.
- **Engine-mediated Effects**: All nondeterminism/time/IO flows through the engine to remain replay-safe.

# Documentation Map
1. [Management API]({{% ref workflow-protocol-management-api %}})
   Detailed Dapr gRPC control-plane operations and payloads.
2. [Execution API (Task Hub Protocol)]({{% ref workflow-protocol-execution-api %}})
   `TaskHubSidecarService` worker protocol, work item contracts, result/failure reporting, and sequencing.
3. [Orchestration Lifecycle]({{% ref workflow-protocol-orchestration-lifecycle %}})
   Replay semantics, scheduling, external events, timers, and completion.
4. [Activity Lifecycle]({{% ref workflow-protocol-activity-lifecycle %}})
   Dispatch, retries, idempotency, heartbeat semantics, and failure handling.
5. [State & History]({{% ref workflow-protocol-state-and-history %}})
   History schema, state snapshots, and persistence guarantees.
6. [Versioning]({{% ref workflow-protocol-versioning %}})
   How Dapr handles multiple versions of the same workflow definition.