---
type: docs
title: Workflow overview
linkTitle: Overview
weight: 1000
description: "Overview of the workflow building block"
---

Dapr workflows are custom application logic that define a business process or data flow spanning multiple microservices. With workflows, you can automate and coordinate tasks within your application.

These application critical workflows require developers to handle common challenges:

- Multi-step business logic needs to be resilient to restarts, shutdowns, and crashes, requiring infrastructure to monitor and automatically restore the state of these operations.
- Workflows modifying or orchestrating state across multiple microservices require consistency guarantees and usually cannot rely on distributed transactions. This means developers need to design and build compensation logic to handle unrecoverable failures.
- Business logic can sometimes be scattered across different processes, queues, and event handlers which can result in very complicated architectures, creating maintenance problems and slowing down development.  

Dapr addresses these challenges by providing a workflow feature. The workflow feature is comprised of two main parts - the Workflow API and the workflow components. 

<img src="/images/concepts-building-blocks.png" width=250>

## Workflow API

*To Do:*
- *Add diagram of how workflow API works?*
- *Add explaination of how the API works*

---


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
- [Supported workflows]({{< ref supported-workflows.md >}})