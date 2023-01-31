---
type: docs
title: Workflow building block overview
linkTitle: Overview
weight: 1000
description: "Overview of the workflow API"
---

{{% alert title="Note" color="primary" %}}
The Workflow building block is currently in alpha state supporting .NET. 
{{% /alert %}}

The Dapr Workflow API strives to make orchestrating logic for messaging, state management, and failure handling across various microservices easier for developers. Prior to adding workflows to Dapr, you'd often need to build ad-hoc workflows behind-the-scenes in order to bridge that gap. 

The durable, resilient Dapr Workflow API:

- Provides a workflow API for running workflows
- Offers a built-in workflow runtime to write Dapr workflows (of type `workflow.dapr`)
- Will integrate with future supported external workflow runtime components

<img src="/images/workflow-overview/workflow-overview.png" width=800 alt="Diagram showing basics of Dapr workflows">


The Workflow building block can assist with scenarios like:
- Order processing involving inventory management, payment systems, shipping, etc.
- HR onboarding workflows coordinating tasks across multiple departments and participatns
- Orchestrating the roll-out of digital menu updates in a national restaurant chain
- Image processing workflows involving API-based classification and storage

## How it works

The Dapr Workflow engine runs in the Dapr sidecar and consists of:
- SDKs for authoring workflows in code, using any language
- APIs for managing workflows (start, query, suspend/resume, terminate)

The workflow engine is internally powered by Dapr's actor runtime. In the following diagram demonstrates the Dapr Workflow architecture in Kubernetes mode:


Essentially, to use the Dapr Workflow building block, you write workflow code in your application using the SDK and connect to the sidecar using gRPC stream. This will register the workflow and any workflow activities, or tasks that workflows can schedule.

Notice that the engine itself is embedded directly into the sidecar and implemented by the `durabletask-go` framework library. This framework allows you to swap out different storage providers, including a storage provider created specifically for Dapr that leverages internal actors behind the scenes. Since Dapr Workflows use actors, you can store workflow state in variety of Dapr-supported state stores, like Redis, CosmosDB, etc.

## Features

### HTTP/gRPC API calls to start or terminate any workflow

Once you create an application with workflow code and run it with Dapr, you can make HTTP/gRPC calls to Dapr to run specific tasks/workflows that reside in the application. Each individual workflow can be started or terminated through a POST request. 

You can also get information on the workflow (even if it has been terminated or it finished naturally) through a GET request. This GET request will send back information, such as:
- The instance ID of the workflow
- The time that the run started
- The current running status, whether that be “Running”, “Terminated”, or “Completed”

## Workflow patterns

Dapr workflows simplify complex, stateful coordination requirements in event-driven applications. The following sections describe several application patterns that can benefit from Dapr workflows:

### Function chaining

In the function chaining pattern, multiple functions are called in succession on a single input, and the output of one function is passed as the input to the next function. With this pattern, you can create a sequence of operations that need to be performed on some data, such as filtering, transforming, and reducing.

TODO: DIAGRAM?

You can use Dapr workflows to implement the function chaining pattern concisely as shown in the following example.

TODO: CODE EXAMPLE

### Fan out/fan in

In the fan out/fan in design pattern, you execute multiple tasks simultaneously across mulitple workers and wait for them to recombine.

The fan out part of the pattern involves distributing the input data to multiple workers, each of which processes a portion of the data in parallel. 

The fan in part of the pattern involves recombining the results from the workers into a single output. 

TODO: DIAGRAM?

This pattern can be implemented in a variety of ways, such as using message queues, channels, or async/await. The Dapr workflows extension handles this pattern with relatively simple code:

TODO: CODE EXAMPLE

### Async HTTP APIs

In an asynchronous HTTP API pattern, you coordinate non-blocking requests and responses with external clients. This increases performance and scalability. One way to implement an asynchronous API is to use an event-driven architecture, where the server listens for incoming requests and triggers an event to handle each request as it comes in. Another way is to use asynchronous programming libraries or frameworks, which allow you to write non-blocking code using callbacks, promises, or async/await.

TODO: DIAGRAM?

Dapr workflows simplifies or even removing the code you need to write to interact with long-running function executions. 

TODO: CODE EXAMPLE

### Monitor

The monitor pattern is a flexible, recurring process in a workflow that coordinates the actions of multiple threads by controlling access to shared resources. Typically:

1. The thread must first acquire the monitor. 
1. Once the thread has acquired the monitor, it can access the shared resource.
1. The thread then releases the monitor. 

This ensures that only one thread can access the shared resource at a time, preventing synchronization issues.

TODO: DIAGRAM?

In a few lines of code, you can create multiple monitors that observe arbitrary endpoints. The following code implements a basic monitor:

TODO: CODE EXAMPLE

## What is the authoring SDK?

The Dapr Workflow _authoring SDK_ is a language-specific SDK that you use to implement workflow logic. The workflow logic lives in your application and is orchestrated by the Dapr workflow engine running in the Dapr sidecar via a gRPC stream.

TODO: Diagram

The Dapr Workflow authoring SDK contains many types and functions that allow you to take full advantage of the features and capabilities offered by the Dapr workflow engine.

NOTE: The Dapr Workflow authoring SDK is only valid for use with the Dapr Workflow engine. It cannot be used with other external workflow services.

### Currently supported SDK languages

Currently, you can use the following SDK languages to author a workflow.

| Language stack | Package |
| - | - |
| .NET | [Dapr.Workflow](https://www.nuget.org/profiles/dapr.io) |

### Declarative workflows support

Dapr workflow doesn't currently provides any experience for declarative workflows. However, you can use the Dapr SDKs to build a new, portable workflow runtime that leverages the Dapr sidecar to load and execute declarative workflows as a layer on top of the "workflow-as-code" foundation. Such an approach could be used to support a variety of declarative workflows, including:

- The [AWS Step Functions workflow syntax](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html)
- The [Azure Logic Apps workflow syntax](https://learn.microsoft.com/azure/logic-apps/logic-apps-workflow-definition-language)
- The [Google Cloud Workflows syntax](https://cloud.google.com/workflows/docs/reference/syntax)
- The [Serverless workflow specification](https://serverlessworkflow.io/) (a CNCF sandbox project)

This topic is currently outside the scope of this article. However, it may be explored more in future iterations of Dapr Workflow.

## Try out the workflow API

### Quickstarts and tutorials

Want to put the Dapr Workflow API to the test? Walk through the following quickstart and tutorials to see Dapr Workflows in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Workflow quickstart](link) | Description of the quickstart. |
| [Workflow tutorial](link) | Description of the tutorial. |

### Start using workflows directly in your app

Want to skip the quickstarts? Not a problem. You can try out the workflow building block directly in your application. After [Dapr is installed]({{< ref install-dapr-cli.md >}}), you can begin using the workflow API, starting with [how to author a workflow]({{< ref howto-author-workflow.md >}}).


## Watch the demo

Watch [this video for an overview on Dapr Workflows](https://youtu.be/s1p9MNl4VGo?t=131):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=131" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps
- Learn more about [authoring workflows for the built-in engine component]()
- Learn more about [supported workflow components]()
