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

<!-- 
Include a diagram or image, if possible. 
-->

## Features

The workflow API brings several features to your application.

### Embedded workflow engine

<!-- todo -->

Similar to the built-in support for actors, Dapr has implemented a built-in runtime for workflows. Unlike actors, the workflow runtime component can be swapped out with an alternate implementation. If you want to work with other workflow engines (such as externally hosted workflow services like Azure Logic Apps, AWS Step Functions, or Temporal.io), you can use alternate community-contributed workflow components.

In an effort to enhance the developer experience, the Dapr sidecar contains a lightweight, portable, embedded workflow engine (DTFx-go) that leverages and integrates with existing Dapr components, including actors and state storage, in its underlying implementation. The engine's portability enables you to execute workflows that run:
- Inside DFTx-go locally
- In production with minimal overhead.

#### DTFx-go workflow engine

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

### Workflow as code

"Workflow as code" refers to the implementation of a workflow’s logic using general purpose programming languages. "Workflow as code" is used in a growing number of modern workflow frameworks, such as Azure Durable Functions, Temporal.io, and Prefect (Orion). The advantage of this approach is its developer-friendliness. Developers can use a programming language that they already know (no need to learn a new DSL or YAML schema), they have access to the language’s standard libraries, can build their own libraries and abstractions, can use debuggers and examine local variables, and can even write unit tests for their workflows just like they would any other part of their application logic.

The Dapr SDK will internally communicate with the DTFx-go gRPC endpoint in the Dapr sidecar to receive new workflow events and send new workflow commands, but these protocol details will be hidden from the developer. Due to the complexities of the workflow protocol, we are not proposing any HTTP API for the runtime aspect of this feature.

### Declarative workflows support

We expect workflows as code to be very popular for developers because working with code is both very natural for developers and is much more expressive and flexible compared to declarative workflow modeling languages. In spite of this, there will still be users who will prefer or require workflows to be declarative. To support this, we propose building an experience for declarative workflows as a layer on top of the "workflow as code" foundation. A variety of declarative workflows could be supported in this way. For example, this model could be used to support the AWS Step Functions workflow syntax, the Azure Logic Apps workflow syntax, or even the Google Cloud Workflow syntax. However, for the purpose of this proposal, we’ll focus on what it would look like to support the CNCF Serverless Workflow specification. Note, however, that the proposed model could be used to support any number of declarative multiple workflow schemas.

#### CNCF serverless workflows

Serverless Workflow (SLWF) consists of an open-source standards-based DSL and dev tools for authoring and validating workflows in either JSON or YAML. SLWF was specifically selected for this proposal because it represents a cloud native and industry standard way to author workflows. There are a set of already existing open-source tools for generating and validating these workflows that can be adopted by the community. It’s also an ideal fit for Dapr since it’s under the CNCF umbrella (currently as a sandbox project). This proposal would support the SLWF project by providing it with a lightweight, portable runtime – i.e., the Dapr sidecar.

#### Hosting serverless workflows

In this proposal, we use the Dapr SDKs to build a new, portable SLWF runtime that leverages the Dapr sidecar. Most likely it is implemented as a reusable container image and supports loading workflow definition files from Dapr state stores (the exact details need to be worked out). Note that the Dapr sidecar doesn’t load any workflow definitions. Rather, the sidecar simply drives the execution of the workflows, leaving all other details to the application layer.


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