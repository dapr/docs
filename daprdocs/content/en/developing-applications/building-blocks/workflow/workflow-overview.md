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

#### Storage of state and durability

### Workflows as code

### Declarative workflows support

#### CNCF serverless workflows

#### Hosting serverless workflows

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