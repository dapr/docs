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
- Workflows allows users to combine Dapr APIs together in scheduled tasks
- Workflows compatible with pubsub, state store, bindings 
- Can send/respond to external signals, including pub/sub events and bindings (input or output

### Scheduled Delays and restarts
- Scheduling reminder-like durable delays, which could be for minutes, days, or even years.
- Restarting workflows by truncating their history logs and potentially resetting the input, which can be used to create eternal workflows that never end.

### Sub-workflows 
- Define subworkflow
- Executing multiple sub workflows in sequence or in parallel.

### Author workflows as code
Dapr workflow logic is implamented using general purpose programming languages, allowing you to:

- Use your preferred programming language (no need to learn a new DSL or YAML schema)
- Have access to the language’s standard libraries
- Build your own libraries and abstractions
- Use debuggers and examine local variables
- Write unit tests for your workflows, just like any other part of your application logic

### Declarative workflows support
Dapr provides an experience for declarative workflows as a layer on top of the "workflow as code" foundation, supporting a variety of declarative workflows, including:
- The AWS Step Functions workflow syntax
- The Azure Logic Apps workflow syntax
- The Google Cloud workflow syntax
- The CNCF Serverless workflow specification

#### Hosting serverless workflows
You can use the Dapr SDKs to build a new, portable SLWF runtime that leverages the Dapr sidecar. Usually, you can implement the runtime as a reusable container image that supports loading workflow definition files from Dapr state stores. 

The Dapr sidecar doesn’t load any workflow definitions. Rather, the sidecar simply drives the execution of the workflows, leaving all other details to the application layer.


*NEED MORE CLARIFICATION ON THESE FEATURES*
- Saving custom state values to Dapr state stores
- “Activity” callbacks that execute non-orchestration logic locally inside the workflow pod.

## Workflow patterns

The primary use case for Dapr workflows is simplifying complex, stateful coordination requirements in serverless applications. The following sections describe typical application patterns that can benefit from Dapr workflows:

### Function chaining

In the function chaining pattern, a sequence of functions executes in a specific order. In this pattern, the output of one function is applied to the input of another function. The use of queues between each function ensures that the system stays durable and scalable, even though there is a flow of control from one function to the next.

TODO: DIAGRAM?

You can use Dapr workflows to implement the function chaining pattern concisely as shown in the following example.

In this example, the values F1, F2, F3, and F4 are the names of other functions in the same function app. You can implement control flow by using normal imperative coding constructs. Code executes from the top down. The code can involve existing language control flow semantics, like conditionals and loops. You can include error handling logic in try/catch/finally blocks.

TODO: CODE EXAMPLE

You can use the context parameter to invoke other functions by name, pass parameters, and return function output. Each time the code calls await, the Dapr workflows framework checkpoints the progress of the current function instance. If the process or virtual machine recycles midway through the execution, the function instance resumes from the preceding await call. 

### Fan out/fan in

In the fan out/fan in pattern, you execute multiple functions in parallel and then wait for all functions to finish. Often, some aggregation work is done on the results that are returned from the functions.

TODO: DIAGRAM?

With normal functions, you can fan out by having the function send multiple messages to a queue. Fanning back in is much more challenging. To fan in, in a normal function, you write code to track when the queue-triggered functions end, and then store function outputs.

The Dapr workflows extension handles this pattern with relatively simple code:

TODO: CODE EXAMPLE

The fan-out work is distributed to multiple instances of the F2 function. The work is tracked by using a dynamic list of tasks. Task.WhenAll is called to wait for all the called functions to finish. Then, the F2 function outputs are aggregated from the dynamic task list and passed to the F3 function.

The automatic checkpointing that happens at the await call on Task.WhenAll ensures that a potential midway crash or reboot doesn't require restarting an already completed task.

Note

In rare circumstances, it's possible that a crash could happen in the window after an activity function completes but before its completion is saved into the orchestration history. If this happens, the activity function would re-run from the beginning after the process recovers.

### Async HTTP APIs

The async HTTP API pattern addresses the problem of coordinating the state of long-running operations with external clients. A common way to implement this pattern is by having an HTTP endpoint trigger the long-running action. Then, redirect the client to a status endpoint that the client polls to learn when the operation is finished.

TODO: DIAGRAM?

Dapr workflows provides built-in support for this pattern, simplifying or even removing the code you need to write to interact with long-running function executions. For example, the Dapr workflows quickstart samples (C#, JavaScript, Python, PowerShell, and Java) show a simple REST command that you can use to start new orchestrator function instances. After an instance starts, the extension exposes webhook HTTP APIs that query the orchestrator function status.

The following example shows REST commands that start an orchestrator and query its status. For clarity, some protocol details are omitted from the example.

TODO: CODE EXAMPLE

Because the Dapr workflows runtime manages state for you, you don't need to implement your own status-tracking mechanism.

The Dapr workflows extension exposes built-in HTTP APIs that manage long-running orchestrations. You can alternatively implement this pattern yourself by using your own function triggers (such as HTTP, a queue, or Azure Event Hubs) and the orchestration client binding. For example, you might use a queue message to trigger termination. Or, you might use an HTTP trigger that's protected by an Azure Active Directory authentication policy instead of the built-in HTTP APIs that use a generated key for authentication.

For more information, see the HTTP features article, which explains how you can expose asynchronous, long-running processes over HTTP using the Dapr workflows extension.

### Monitor

The monitor pattern refers to a flexible, recurring process in a workflow. An example is polling until specific conditions are met. You can use a regular timer trigger to address a basic scenario, such as a periodic cleanup job, but its interval is static and managing instance lifetimes becomes complex. You can use Dapr workflows to create flexible recurrence intervals, manage task lifetimes, and create multiple monitor processes from a single orchestration.

An example of the monitor pattern is to reverse the earlier async HTTP API scenario. Instead of exposing an endpoint for an external client to monitor a long-running operation, the long-running monitor consumes an external endpoint, and then waits for a state change.

TODO: DIAGRAM?

In a few lines of code, you can use Dapr workflows to create multiple monitors that observe arbitrary endpoints. The monitors can end execution when a condition is met, or another function can use the durable orchestration client to terminate the monitors. You can change a monitor's wait interval based on a specific condition (for example, exponential backoff.)

The following code implements a basic monitor:

TODO: CODE EXAMPLE

When a request is received, a new orchestration instance is created for that job ID. The instance polls a status until either a condition is met or until a timeout expires. A durable timer controls the polling interval. Then, more work can be performed, or the orchestration can end.

## Next steps