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

- Resilient, multi-step business logic requires infrastructure to monitor and automatically restore the operation state.
- Business logic modifying or orchestrating state across multiple microservices requires  developers to design and build compensation logic to handle unrecoverable failures.
- Reasoning about business logic scattered across actors, pub/subs, and event handlers can be difficult and result in complicated architectures, creating maintenance problems and slowing down development.

A workflow's utility for microservices also makes it a great fit for Dapr’s mission to support microservice development. The workflow API provides several advantages with an embedded workflow engine in the Dapr sidecar.

| With the workflow API | Without the workflow API |
| --------------------- | ------------------------ |
| A built-in workflow engine that easily integrates with existing Dapr building blocks | An external workflow engine in conjunction with the Dapr SDKs. |
| An efficient, more manageable single sidecar for all microservices | Separate sidecars (or services) for workflows. |
| Portable workflows keeps Dapr portable. | Lessened portability. |

With a lightweight, embedded workflow engine, you can create orchestration on top of existing Dapr building blocks in a portable and adoptable way. 

## Workflow API

The workflow building block consists of:

- A pluggable component model for integrating various workflow engines
- A set of APIs for managing workflows (start, schedule, pause, resume, cancel)

Similar to the built-in support for actors, the workflow API implements a [built-in workflow runtime](#embedded-workflow-engine). 

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

Unlike actors, the workflow runtime component can be swapped out with an alternate implementation. If developers want to work with other workflow engines, such as externally hosted workflow services like Azure Logic Apps, AWS Step Functions, or Temporal.io, they can do so with alternate community-contributed workflow components.

We propose adding a lightweight, portable, embedded workflow engine (DTFx-go) in the Dapr sidecar that leverages existing Dapr components, including actors and state storage, in its underlying implementation. By being lightweight and portable developers will be able to execute workflows that run inside DFTx-go locally as well as in production with minimal overhead; this enhances the developer experience by integrating workflows with the existing Dapr development model that users enjoy.

The new engine will be written in Go and inspired by the existing Durable Task Framework (DTFx) engine. We’ll call this new version of the framework DTFx-go to distinguish it from the .NET implementation (which is not part of this proposal) and it will exist as an open-source project with a permissive, e.g., Apache 2.0, license so that it remains compatible as a dependency for CNCF projects. Note that it’s important to ensure this engine remains lightweight so as not to noticeably increase the size of the Dapr sidecar.

Importantly, DTFx-go will not be exposed to the application layer. Rather, the Dapr sidecar will expose DTFx-go functionality over a gRPC stream. The Dapr sidecar will not execute any app-specific workflow logic or load any declarative workflow documents. Instead, app containers will be responsible for hosting the actual workflow logic. The Dapr sidecar can send and receive workflow commands over gRPC to and from connected app’s workflow logic, execute commands on behalf of the workflow (service invocation, invoking bindings, etc.). Other concerns such as activation, scale-out, and state persistence will be handled by internally managed actors. More details on all of this will be discussed in subsequent sections.

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