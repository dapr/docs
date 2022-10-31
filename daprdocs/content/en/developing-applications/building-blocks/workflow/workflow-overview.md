---
type: docs
title: Workflow overview
linkTitle: Overview
weight: 1000
description: "Overview of the workflow building block"
---

Workflows are quickly becoming a core element to cloud-native applications. A workflow is custom application logic that:

- Defines a business process or data flow that spans multiple microservices
- Drives the execution of these business processes to completion in a reliable way
- Consists of a set of tasks and/or state transitions, which can be either statically defined or dynamic
- May be authored using declarative markup or general purpose programming languages

While you can build workflows from scratch using primitives (such as actors, pub/sub, and state stores), workflows typically come with the following common obstacles:

- Infrastructure to monitor and automatically restore the operation state.
- Compensation logic to handle unrecoverable failures.
- Complicated architectures with maintenance problems and slowed down development.

<!-- 
Include a diagram or image, if possible. 
-->

## Workflow API

A workflow's utility for microservices makes it a great fit for Dapr’s mission to support microservice development. The workflow API provides several advantages with an embedded workflow engine in the Dapr sidecar.  

| With the workflow API | Without the workflow API |
| --------------------- | ------------------------ |
| A built-in workflow engine that easily integrates with existing Dapr building blocks | An external workflow engine in conjunction with the Dapr SDKs. |
| An efficient, more manageable single sidecar for all microservices | Separate sidecars (or services) for workflows. |
| Portable workflows keeps Dapr portable. | Lessened portability. |

With a [lightweight, embedded workflow engine](#embedded-workflow-engine), you can create orchestration on top of existing Dapr building blocks in a portable and adoptable way. The workflow building block consists of:

- A pluggable component model for integrating various workflow engines
- A set of APIs for managing workflows (start, schedule, pause, resume, cancel)

Workflows supported by your platforms can be exposed as APIs with support for both HTTP and the Dapr SDKs, including:

- mTLS, distributed tracing, etc. 
- Various abstractions, such as async HTTP polling

### Sidecar interactions and the Dapr SDK

Behind the scenes, the `DaprWorkflowClient` SDK object handles all the interactions with the Dapr sidecar, including:

- Responding to invocation requests from the Dapr sidecar.
- Sending the necessary commands to the Dapr sidecar as the workflow progresses.
- Checkpointing the progress so that the workflow can be resumed after any infrastructure failures.


<!-- 
Include a diagram or image, if possible. 
-->

## Features

The workflow API brings several core features executed by the Dapr sidecar:

- Invoking service methods using the Dapr service invocation building block.
- Invoking “activity” callbacks that execute non-orchestration logic locally inside the workflow pod.
- Sending or responding to external signals, including pub/sub events and bindings (input or output).
- Scheduling reminder-like durable delays, which could be for minutes, days, or even years.
- Creating sub-workflows and reading their results, if any.
- Executing the above actions in sequence or in parallel.
- Saving custom state values to Dapr state stores
- Restarting workflows by truncating their history logs and potentially resetting the input, which can be used to create eternal workflows that never end.

These capabilities are enabled by the sidecar-embedded DTFx-go engine and its Dapr-specific configuration.

### DTFx-go workflow engine

The workflow engine is written in Go and inspired by the existing Durable Task Framework (DTFx) engine. DTFx-go exists as an open-source project with a permissive (like Apache 2.0) license, maintaing compatibility as a dependency for CNCF projects. 

DTFx-go is not exposed to the application layer. Rather, the Dapr sidecar:

- Exposes DTFx-go functionality over a gRPC stream 
- Sends and receives workflow commands over gRPC to and from a connected app’s workflow logic
- Executes commands on behalf of the workflow (service invocation, invoking bindings, etc.) 

Meanwhile, app containers:

- Execute and/or host any app-specific workflow logic, or 
- Load any declarative workflow documents. 

Other concerns such as activation, scale-out, and state persistence are handled by internally managed actors. 

#### Executing, scheduling, and resilience

Dapr workflow instances are implemented as actors. Actors drive workflow execution by communicating with the workflow SDK over a gRPC stream. Using actors solves the problem of placement and scalability.

<img src="/images/workflow-overview/workflow-execution.png" width=1000 alt="Diagram showing scalable execution of workflows using actors">

The execution of individual workflows is triggered using actor reminders, which are both persistent and durable. If a container or node crashes during a workflow execution, the actor reminder ensures reactivates and resumes where it left off, using state storage to provide durability.

To prevent a workflow from unintentional blocking, each workflow is composed of two separate actor components. In the diagram below, the Dapr sidecar has:

1. One actor component acting as the scheduler/coordinator (WF scheduler actor)
1. Another actor component performing the actual work (WF worker actor)

<img src="/images/workflow-overview/workflow-execution-2.png" width=1000 alt="Diagram showing zoomed in view of actor components working for workwflow">

#### Storage of state and durability

For workflow execution to complete reliably in the face of transient errors, it must be durable - meaning the ability to store data at checkpoints as it progresses. To achieve this, workflow executions rely on Dapr's state storage to provide stable storage. This allows the workflow to be safely resumed from a known-state in the event that:
- The workflow is explicitly paused, or 
- A step is prematurely terminated (system failure, lack of resources, etc.).

#### Automatic failure handling

Every time the workflow logic encounters its first yield statement, control returns to the SDK for committing state changes and scheduling work. If the process hosting the workflow goes down for any reason, it will resume from the last yield once the process comes back up. 

DTFx-go, running in the Dapr sidecar, enables this by:

- Re-executing the workflow function from the beginning
- Providing the context object with historical data about:
   - Which tasks have already completed
   - What their return values were

This allows any previously executed `context.invoker.invoke` calls to return immediately with a return value, instead of invoking the service method a second time. 

This results in durable and stateful workflows – even the state of local variables is effectively preserved because they can be recreated via replays. 

### Workflow as code

"Workflow as code" refers to the developer-friendly implementation of a workflow’s logic using general purpose programming languages, allowing you to:

- Use your preferred programming language (no need to learn a new DSL or YAML schema)
- Have access to the language’s standard libraries
- Build your own libraries and abstractions
- Use debuggers and examine local variables
- Write unit tests for your workflows, just like any other part of your application logic

The Dapr SDK internally communicates with the DTFx-go gRPC endpoint in the Dapr sidecar to receive new workflow events and send new workflow commands, with these protocol details hidden. 

Due to the complexities of the workflow protocol, no HTTP API for this runtime feature is available at this time.

### Declarative workflows support

Dapr provides an experience for declarative workflows as a layer on top of the "workflow as code" foundation, supporting a variety of declarative workflows, including:
- The AWS Step Functions workflow syntax
- The Azure Logic Apps workflow syntax
- The Google Cloud workflow syntax
- The CNCF Serverless workflow specification

#### CNCF serverless workflows

Serverless Workflow (SLWF) consists of open-source, cloud native and industry standard DSL and dev tools for authoring and validating workflows in either JSON or YAML. SLWF is an ideal fit for Dapr's lightweight, portable runtime as it sits under the CNCF umbrella.

#### Hosting serverless workflows

You can use the Dapr SDKs to build a new, portable SLWF runtime that leverages the Dapr sidecar. Usually, you can implement the runtime as a reusable container image that supports loading workflow definition files from Dapr state stores. 

The Dapr sidecar doesn’t load any workflow definitions. Rather, the sidecar simply drives the execution of the workflows, leaving all other details to the application layer.


## Try out the workflow API

<!-- 
If applicable, include a section with links to the related quickstart, how-to guides, or tutorials. --> 

### Quickstarts and tutorials

Want to put the Dapr <topic> API to the test? Walk through the following quickstart and tutorials to see <topic> in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Workflow quickstart](link) | Description of the quickstart. |
| [Workflow tutorial](link) | Description of the tutorial. |

### Start using workflows directly in your app

Want to skip the quickstarts? Not a problem. You can try out the workflow building block directly in your application. After [Dapr is installed](link), you can begin using the workflow API, starting with [the workflow how-to guide](link).

## Next steps

- [Learn how to set up a workflow]({{< ref howto-workflow.md >}})
- [Check out some workflow code examples]({{< ref workflow-scenarios.md >}})