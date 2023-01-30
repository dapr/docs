---
type: docs
title: "How to: Author a workflow"
linkTitle: "Authoring workflows"
weight: 200
description: "Learn how to develop and author workflows"
---

This article provides a high-level overview of how to author workflows that are executed by the Dapr Workflow engine. In particular, this article lists the SDKs available, supported authoring patterns, and introduces the various concepts you'll need to understand when building Dapr workflows.

## What is the authoring SDK?

The Dapr Workflow _authoring SDK_ is a language-specific SDK that you use to implement workflow logic using general purpose programming languages. The workflow logic lives in your application and is orchestrated by the Dapr workflow engine running in the Dapr sidecar via a gRPC stream.

TODO: Diagram

The Dapr Workflow authoring SDK contains many types and functions that allow you to take full advantage of the features and capabilities offered by the Dapr workflow engine.

NOTE: The Dapr Workflow authoring SDK is only valid for use with the Dapr Workflow engine. It cannot be used with other external workflow services.

## Currently supported SDK languages

Currently, you can use the following SDK languages to author a workflow.

| Language stack | Package |
| - | - |
| .NET | [Dapr.Workflow](https://www.nuget.org/packages/Dapr.Workflow) |

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

## Features and concepts

The Dapr Workflow SDK exposes several core features and concepts which are common across all supported languages. This section will provide a brief introduction to each of those features.

### Workflows

Dapr workflows are functions you write that define a series of steps or tasks to be executed in a particular order. The Dapr workflow engine takes care of coordinating and managing the execution of the steps, including managing failures and retries. If the app hosting your workflows is scaled out across multiple machines, the workflow engine may also load balance the execution of workflows and their tasks across multiple machines.

There are several different kinds of tasks that a workflow can schedule, including [activities]() for executing custom logic, [durable timers]() for putting the workflow to sleep for arbitrary lengths of time, [child workflows]() for breaking larger workflows into smaller pieces, and [external event waiters]() for blocking workflows until they receive external event signals. These tasks are described in more details in their corresponding sections.

#### Workflow identity

Each workflow you define has a name, and individual executions of a workflow have a unique _instance ID_. Workflow instance IDs can be generated by your app code, which is useful when workflows correspond to business entities like documents or jobs, or can be auto-generated UUIDs. A workflow's instance ID is useful for debugging and also for managing workflows using the [Workflow management APIs]().

Only one workflow instance with a given ID can exist at any given time. However, if a workflow instance completes or fails, its ID can be reused by a new workflow instance. Note, however, that the new workflow instance will effectively replace the old one in the configured state store.

#### Workflow replay

Dapr workflows maintain their execution state by using a technique known as [event sourcing](https://learn.microsoft.com/azure/architecture/patterns/event-sourcing). Instead of directly storing the current state of a workflow as a snapshot, the workflow engine manages an append-only log of history events that describe the various steps that a workflow has taken. When using the workflow authoring SDK, the storing of these history events happens automatically whenever the workflow "awaits" for the result of a scheduled task.

{{% alert title="Note" color="primary" %}}
For more information on how workflow state is managed, see the [workflow engine operational guide]({{<ref "operations/components/workflow-engine">}}).
{{% /alert %}}

When a workflow "awaits" a scheduled task, it may unload itself from memory until the task completes. Once the task completes, the workflow engine will schedule the workflow function to run again. This second execution of the workflow function is known as a _replay_. When a workflow function is replayed, it runs again from the beginning. However, when it encounters a task that it already scheduled, instead of scheduling that task again, the workflow engine will return the result of the scheduled task to the workflow and continue execution until the next "await" point. This "replay" behavior continues until the workflow function completes or fails with an error.

Using this replay technique, a workflow is able to resume execution from any "await" point as if it had never been unloaded from memory. Even the values of local variables from previous runs can be restored without the workflow engine knowing anything about what data they stored. This ability to restore state is also what makes Dapr workflows _durable_ and fault tolerant.

#### Workflow determinism and code constraints

The workflow replay behavior described previously requires that workflow function code be _deterministic_. A deterministic workflow function is one that takes the exact same actions when provided the exact same inputs.

You must follow the following rules to ensure that your workflow code is deterministic.

1. **Workflow functions must not call non-deterministic APIs.** For example, APIs that generate random numbers, random UUIDs, or the current date are non-deterministic. To work around this limitation, use these APIs in activity functions or (preferred) use built-in equivalent APIs offered by the authoring SDK. For example, each authoring SDK provides an API for retrieving the current time in a deterministic manner.

1. **Workflow functions must not interact _directly_ with external state.** External data includes any data that isn't stored in the workflow state. For example, workflows must not interact with global variables, environment variables, the file system, or make network calls. Instead, workflows should interact with external state _indirectly_ using workflow inputs, activity tasks, and through external event handling.

1. **Workflow functions must execute only on the workflow dispatch thread.** The implementation of each language SDK requires that all workflow function operations operate on the same thread (goroutine, etc.) that the function was scheduled on. Workflow functions must never schedule background threads or use APIs that schedule a callback function to run on another thread. Failure to follow this rule could result in undefined behavior. Any background processing should instead be delegated to activity tasks, which can be scheduled to run serially or concurrently.

While it's critically important to follow these determinism code constraints, you'll quickly become familiar with them and learn how to work with them effectively when writing workflow code.

#### Infinite loops and eternal workflows

As discussed in the [workflow replay]({{<ref "#workflow-replay">}}) section, workflows maintain a write-only event-sourced history log of all its operations. To avoid runaway resource usage, workflows should limit the number of operations they schedule. For example, a workflow should never use infinite loops in its implementation, nor should it schedule millions of tasks.

There are two techniques that can be used to write workflows that need to potentially schedule extreme numbers of tasks:

1. **Use the _continue-as-new_ API**: Each workflow authoring SDK exposes a _continue-as-new_ API that workflows can invoke to restart themselves with a new input and history. The _continue-as-new_ API is especially ideal for implementing "eternal workflows" or workflows that have no logical end state, like monitoring agents, which would otherwise be implemented using a `while (true)`-like construct. Using _continue-as-new_ is a great way to keep the workflow history size small.

1. **Use child workflows**: Each workflow authoring SDK also exposes an API for creating child workflows. A child workflow is just like any other workflow except that it's scheduled by a parent workflow. Child workflows have their own history and also have the benefit of allowing you to distribute workflow function execution across multiple machines. If a workflow needs to schedule thousands of tasks or more, it's recommended that those tasks be distributed across child workflows so that no single workflow's history size grows too large.

#### Updating workflow code

Because workflows are long-running and durable, updating workflow code must be done with extreme care. As discussed in the [Workflow determinism]({{<ref "#workflow-determinism-and-code-constraints">}}) section, workflow code must be deterministic so that the workflow engine can rebuild its state to exactly match its previous checkpoint. Updates to workflow code must preserve this determinism if there are any non-completed workflow instances in the system. Otherwise, updates to workflow code can result in runtime failures the next time those workflows execute.

We'll mention a couple examples of code updates that can break workflow determinism:

* **Changing workflow function signatures**: Changing the name, input, or output of a workflow or activity function is considered a breaking change and must be avoided.
* **Changing the number or order of workflow tasks**: Changing the number or order of workflow tasks will cause a workflow instance's history to no longer match the code and may result in runtime errors or other unexpected behavior.

To work around these constraints, instead of updating existing workflow code, leave the existing workflow code as-is and create new workflow definitions that include the updates. Upstream code that creates workflows should also be updated to only create instances of the new workflows. Leaving the old code around ensures that existing workflow instances can continue to run without interruption. If and when it's known that all instances of the old workflow logic have completed, then the old workflow code can be safely deleted.

### Workflow activities

Workflow activities are the basic unit of work in a workflow and are the tasks that get orchestrated in the business process. For example, you might create a workflow to process an order. The tasks may involve checking the inventory, charging the customer, and creating a shipment. Each task would be a separate activity. These activities may be executed serially, in parallel, or some combination of both.

Unlike workflows, activities aren't restricted in the type of work you can do in them. Activities are frequently used to make network calls or run CPU intensive operations. An activity can also return data back to the workflow.

The Dapr workflow engine guarantees that each called activity will be executed **at least once** as part of a workflow's execution. Because activities only guarantee at-least-once execution, it's recommended that activity logic be implemented as idempotent whenever possible.

### Child workflows

In addition to activities, workflows can schedule other workflows as _child workflows_. A child workflow has its own instance ID, history, and status that is independent of the parent workflow that started it.

Child workflows have many benefits:

* You can split large workflows into a series of smaller child workflows, making your code more maintainable.
* You can distribute workflow logic across multiple compute nodes concurrently, which is useful if your workflow logic otherwise needs to coordinate a lot of tasks.
* You can reduce memory usage and CPU overhead by keeping the history of parent workflow smaller.

The return value of a child workflow is its output. If a child workflow fails with an exception, then that exception will be surfaced to the parent workflow, just like it is when an activity task fails with an exception. Child workflows also support automatic retry policies.

{{% alert title="Note" color="primary" %}}
Because child workflows are independent of their parents, terminating a parent workflow does not affect any child workflows. You must terminate each child workflow independently using its instance ID.
{{% /alert %}}

### Durable timers

Dapr workflows allow you to schedule reminder-like durable delays for any time range, including minutes, days, or even years. These _durable timers_ can be scheduled by workflows to implement simple delays or to set up ad-hoc timeouts on other async tasks. More specifically, a durable timer can be set to trigger on a particular date or after a specified duration. There are no limits to the maximum duration of durable timers, which are internally backed by internal actor reminders. For example, a workflow that tracks a 30-day free subscription to a service could be implemented using a durable timer that fires 30-days after the workflow is created. Workflows can be safely unloaded from memory while waiting for a durable timer to fire.

{{% alert title="Note" color="primary" %}}
Some APIs in the workflow authoring SDK may internally schedule durable timers to implement internal timeout behavior.
{{% /alert %}}

### External events

Sometimes workflows will need to wait for events that are raised by external systems. For example, an approval workflow may require a human to explicitly approve an order request within an order processing workflow if the total cost exceeds some threshold. Another example is a trivia game orchestration workflow that pauses while waiting for all participants to submit their answers to trivia questions. These mid-execution inputs are referred to as _external events_.

External events have a _name_ and a _payload_ and are delivered to a single workflow instance. Workflows can create "_wait for external event_" tasks that subscribe to external events and _await_ those tasks to block execution until the event is received. The workflow can then read the payload of these events and make decisions about which next steps to take. External events can be processed serially or in parallel. External events can be raised by other workflows or by workflow management code.

{{% alert title="Note" color="primary" %}}
The ability to raise external events to workflows is not included in the alpha version of Dapr's workflow management API.
{{% /alert %}}

Workflows can also wait for multiple external event signals of the same name, in which case they are dispatched to the corresponding workflow tasks in a first-in, first-out (FIFO) manner. If a workflow receives an external event signal but has not yet created a "wait for external event" task, the event will be saved into the workflow's history and consumed immediately after the workflow requests the event.

### Scheduled delays and restarts

Dapr workflows allow you to schedule reminder-like durable delays for any time range, including minutes, days, or even years. You can also restart workflows by truncating their history logs and potentially resetting the input, which can be used to create eternal workflows that never end.

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



## Next steps

- [Learn more about the Workflow API]({{< ref workflow-overview.md >}})
- [Workflow component spec]({{< ref temporal-io.md >}})
- [Workflow API reference]({{< ref workflow_api.md >}})