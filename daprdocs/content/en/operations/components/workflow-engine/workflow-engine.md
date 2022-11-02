---
type: docs
title: "Built-in workflow component overview"
linkTitle: "Built-in workflow component"
weight: 4400
description: "Overview of the built-in workflow engine (DTFx-go) component"
---

The workflow building block consists of:

- A pluggable component model for integrating various workflow engines
- A set of APIs for managing workflows (start, schedule, pause, resume, cancel)

Workflows supported by your platforms can be exposed as APIs with support for both HTTP and the Dapr SDKs, including:

- mTLS, distributed tracing, etc. 
- Various abstractions, such as async HTTP polling

Behind the scenes, the `DaprWorkflowClient` SDK object handles all the interactions with the Dapr sidecar, including:

- Responding to invocation requests from the Dapr sidecar.
- Sending the necessary commands to the Dapr sidecar as the workflow progresses.
- Checkpointing the progress so that the workflow can be resumed after any infrastructure failures.

## DTFx-go workflow engine

The workflow engine is written in Go and inspired by the existing Durable Task Framework (DTFx) engine. DTFx-go exists as an open-source project with a permissive (like Apache 2.0) license, maintaing compatibility as a dependency for CNCF projects. 

DTFx-go is not exposed to the application layer. Rather, the Dapr sidecar:

- Exposes DTFx-go functionality over a gRPC stream 
- Sends and receives workflow commands over gRPC to and from a connected app’s workflow logic
- Executes commands on behalf of the workflow (service invocation, invoking bindings, etc.) 

Meanwhile, app containers:

- Execute and/or host any app-specific workflow logic, or 
- Load any declarative workflow documents. 

Other concerns such as activation, scale-out, and state persistence are handled by internally managed actors. 

### Executing, scheduling, and resilience

Dapr workflow instances are implemented as actors. Actors drive workflow execution by communicating with the workflow SDK over a gRPC stream. Using actors solves the problem of placement and scalability.

<img src="/images/workflow-overview/workflow-execution.png" width=1000 alt="Diagram showing scalable execution of workflows using actors">

The execution of individual workflows is triggered using actor reminders, which are both persistent and durable. If a container or node crashes during a workflow execution, the actor reminder ensures reactivates and resumes where it left off, using state storage to provide durability.

To prevent a workflow from unintentional blocking, each workflow is composed of two separate actor components. In the diagram below, the Dapr sidecar has:

1. One actor component acting as the scheduler/coordinator (WF scheduler actor)
1. Another actor component performing the actual work (WF worker actor)

<img src="/images/workflow-overview/workflow-execution-2.png" width=1000 alt="Diagram showing zoomed in view of actor components working for workwflow">

### Storage of state and durability

For workflow execution to complete reliably in the face of transient errors, it must be durable - meaning the ability to store data at checkpoints as it progresses. To achieve this, workflow executions rely on Dapr's state storage to provide stable storage. This allows the workflow to be safely resumed from a known-state in the event that:
- The workflow is explicitly paused, or 
- A step is prematurely terminated (system failure, lack of resources, etc.).

### Automatic failure handling

Every time the workflow logic encounters its first yield statement, control returns to the SDK for committing state changes and scheduling work. If the process hosting the workflow goes down for any reason, it will resume from the last yield once the process comes back up. 

DTFx-go, running in the Dapr sidecar, enables this by:

- Re-executing the workflow function from the beginning
- Providing the context object with historical data about:
   - Which tasks have already completed
   - What their return values were

This allows any previously executed `context.invoker.invoke` calls to return immediately with a return value, instead of invoking the service method a second time. 

This results in durable and stateful workflows – even the state of local variables is effectively preserved because they can be recreated via replays. 

## Next steps

Learn more about the other workflow components:
- [Temporal.io]
- [Azure Logic Apps]