---
type: docs
title: "How to: Author a workflow"
linkTitle: "Authoring workflows"
weight: 200
description: "Learn how to develop and author workflows"
---

TODO: intro

## What is the authoring SDK?

TODO

## Currently supported SDK languages

TODO

Currently, you can use the following SDK languages to author a workflow:

- [.NET SDK](todo)

## Features

The workflow API brings several core features executed by the Dapr sidecar:

### Combine Dapr APIs

With Dapr workflows, you can combine Dapr APIs in scheduled tasks. Workflows are compatible with pub/sub, state store, and bindings APIs and can send and respond to external signals, including pub/sub events and input/output bindings. 

### Scheduled delays and restarts

Dapr workflows allow you to schedule reminder-like durable delays for any time range, including minutes, days, or even years. You can also restart workflows by truncating their history logs and potentially resetting the input, which can be used to create eternal workflows that never end.

### Sub-workflows 

- Define subworkflow
- Executing multiple sub workflows in sequence or in parallel.

### Author workflows as code

Dapr workflow logic is implemented using general purpose programming languages, allowing you to:

- Use your preferred programming language (no need to learn a new DSL or YAML schema)
- Have access to the language’s standard libraries
- Build your own libraries and abstractions
- Use debuggers and examine local variables
- Write unit tests for your workflows, just like any other part of your application logic

### Declarative workflows support

Dapr provides an experience for declarative workflows as a layer on top of the "workflow-as-code" foundation, supporting a variety of declarative workflows, including:

- The AWS Step Functions workflow syntax
- The Azure Logic Apps workflow syntax
- The Google Cloud workflow syntax
- The CNCF Serverless workflow specification

#### Hosting serverless workflows

You can use the Dapr SDKs to build a new, portable serverless workflow runtime that leverages the Dapr sidecar. Usually, you can implement the runtime as a reusable container image that supports loading workflow definition files from Dapr state stores. 

The Dapr sidecar doesn’t load any workflow definitions. Rather, the sidecar simply drives the execution of the workflows, leaving all other details to the application layer.


*NEED MORE CLARIFICATION ON THESE FEATURES*
- Saving custom state values to Dapr state stores
- “Activity” callbacks that execute non-orchestration logic locally inside the workflow pod.

## Workflow patterns

Dapr workflows simplify complex, stateful coordination requirements in serverless applications. The following sections describe four application patterns that can benefit from Dapr workflows:

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


## Next steps