---
type: docs
title: "Dapr workflow component overview"
linkTitle: "Dapr workflow component"
weight: 4400
description: "Overview of the Dapr workflow engine component"
---

# Overview

The Dapr workflow engine is a component that allows developers to define workflows using ordinary code in a variety of programming languages. The workflow engine runs inside of the Dapr sidecar and orchestrates workflow code that is deployed as part of your application. This article describes the architecture of the Dapr workflow engine, how it interacts with application code, and how it fits into the overall Dapr architecture.

{{% alert title="Note" color="primary" %}}
For information on how to author workflows that are executed by the Dapr workflow engine, see the [workflow application developer guide]({{<ref "workflow-overview.md" >}}).
{{% /alert %}}

The Dapr Workflow engine is internally implemented using then open source [durabletask-go](https://github.com/microsoft/durabletask-go) library, which is embedded directly into the Dapr sidecar. Dapr implements a custom durable task "backend" using internally managed actors, which manage workflow scale-out, persistence, and leader election. This article will go into more details in subsequent sections.

## Sidecar interactions

TODO: Describe the gRPC protocol used in the SDK/sidecar interactions. Make sure to also emphasize the responsibilities of the app vs. the responsibilities of the sidecar.

When a workflow application starts up, it uses a workflow authoring SDK to send a gRPC request to the Dapr sidecar and get back a stream of workflow work-items, following the [Server streaming RPC pattern](https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc). These work-items can be anything from "start a new X workflow" (where X is the type of a workflow) to "schedule activity Y with input Z to run on behalf of workflow X". The workflow app executes the appropriate workflow code and then sends a gRPC request back to the sidecar with the execution results.

<img src="/images/workflow-overview/workflow-engine-protocol.png" alt="Dapr Workflow Engine Protocol" />

All of these interactions happen over a single gRPC channel. All interactions are initiated by the application, which means the application doesn't need to open any inbound ports. The details of these interactions are internally handled by the language-specific Dapr Workflow authoring SDK.

### Differences between workflow and actor sidecar interactions

If you're familiar with Dapr actors, you may notice a few differences in terms of how sidecar interactions works for workflows compared to actors.

* Actors can interact with the sidecar using either HTTP or gRPC. Workflows, however, only use gRPC. Furthermore, the workflow gRPC protocol is sufficiently complex that an SDK is effectively _required_ when implementing workflows.
* Actor operations are pushed to application code from the sidecar. This requires the application to listen on a particular _app port_. With workflows, however, operations are _pulled_ from the sidecar by the application using a streaming protocol. The application doesn't need to listen on any ports to run workflows.
* Actors explicitly register themselves with the sidecar. Workflows, however, do not register themselves with the sidecar. The embedded engine doesn't keep track of workflow types. This responsibility is instead delegated to the workflow application and its SDK.

## Workflow distributed tracing

The durabletask-go core used by the workflow engine writes distributed traces using Open Telemetry SDKs. These traces are captured automatically by the Dapr sidecar and exported to the configured Open Telemetry provider, such as Zipkin.

Each workflow instance managed by the engine is represented as one or more spans. There is a single parent span representing the full workflow execution and child spans for the various tasks, including spans for activity task execution and durable timers. Workflow activity code also has access to the trace context, allowing distributed trace context to flow to external services that are invoked by the workflow.

## Internal actors

There are two types of actors that are internally registered within the Dapr sidecar in support of the workflow engine:
`dapr.internal.wfengine.workflow` and `dapr.internal.wfengine.activity`.

TODO: Diagram

Just like normal actors, internal actors are distributed across the cluster by the actor placement service. They also maintain their own state and make use of reminders. However, unlike actors that live in application code, these _internal_ actors are embedded into the Dapr sidecar. Application code is completely unaware that these actors exist.

There are two types of actors registered by the Dapr sidecar for workflow: the _workflow_ actor and the _activity_ actor. The next sections will go into more details on each.

### Workflow actors

A new instance of the `dapr.internal.wfengine.workflow` actor is activated for every workflow instance that gets created. The ID of the _workflow_ actor is the ID of the workflow. This internal actor stores the state of the workflow as it progresses and determines the node on which the workflow code executes via the actor placement service.

Each workflow actor saves its state using the following keys in the configured state store:

* `inbox-NNNNNN`: A workflow's inbox is effectively a FIFO queue of _messages_ that drive a workflow's execution. Example messages include workflow creation messages, activity task completion messages, etc. Each message is stored in its own key in the state store with the name `inbox-NNNNNN` where `NNNNNN` is a 6-digit number indicating the ordering of the messages. These state keys are removed once the corresponding messages are consumed by the workflow.
* `history-NNNNNN`: A workflow's history is an ordered list of events that represent a workflow's execution history. Each key in the history holds the data for a single history event. Like an append-only log, workflow history events are only added and never removed (except when a workflow performs a "continue as new" operation, which purges all history and restarts a workflow with a new input).
* `customStatus`: Contains a user-defined workflow status value. There is exactly one `customStatus` key for each workflow actor instance.
* `metadata`: Contains meta information about the workflow as a JSON blob and includes details such as the length of the inbox, the length of the history, and a 64-bit integer representing the workflow generation (for cases where the instance ID gets reused). The length information is used to determine which keys need to be read or written to when loading or saving workflow state updates.

{{% alert title="Warning" color="primary" %}}
In the alpha release of the Dapr workflow engine, workflow actor state will remain in the state store even after a workflow has completed. Creating a large number of workflows could result in unbounded storage usage. In a future release, data retention policies will be introduced that can automatically purge the state store of old workflow state.
{{% /alert %}}

The following diagram illustrates the typical lifecycle of a workflow actor.

<img src="/images/workflow-overview/workflow-actor-flowchart.png" alt="Dapr Workflow Actor Flowchart"/>

To summarize, a workflow actor is activated when it receives a new message. New messages will then trigger the associated workflow code (in your application) to run and return an execution result back to the workflow actor. Once the result is received, the actor will schedule any tasks as necessary, update its state in the state store, and then go idle until it receives another message. During this idle time, the sidecar may decide to unload the workflow actor from memory.

### Activity actors

A new instance of the `dapr.internal.wfengine.activity` actor is activated for every activity task that gets scheduled by a workflow. The ID of the _activity_ actor is the ID of the workflow combined with a sequence number. For example, if a workflow has an ID of `876bf371` and is the third activity to be scheduled by the workflow, it's ID will be `876bf371#2` where `2` is the sequence number (sequence numbers start with 0).

Each activity actor stores a single key into the state store:

* `activityreq-N`: The key contains the activity invocation payload, which includes the serialized activity input data. The `N` value is a 64-bit unsigned integer that represents the _generation_ of the workflow, a concept which is outside the scope of this documentation.

{{% alert title="Warning" color="primary" %}}
In the alpha release of the Dapr workflow engine, activity actor state will remain in the state store even after the activity task has completed. Scheduling a large number of workflow activities could result in unbounded storage usage. In a future release, data retention policies will be introduced that can automatically purge the state store of completed activity state.
{{% /alert %}}

Activity actors are short-lived. They are activated when a workflow actor schedules an activity task and will immediately call into the workflow application to invoke the associated activity code. One the activity code has finished running and has returned its result, the activity actor will send a message to the parent workflow actor with the execution results, triggering the workflow to move forward to its next step.

<img src="/images/workflow-overview/workflow-activity-actor-flowchart.png" alt="Workflow Activity Actor Flowchart"/>

### Reminder usage and execution guarantees

TODO: Describe how reminders are used, and what kinds of reminder pressure may be added to a system.

The Dapr workflow engine ensures workflow fault-tolerance by using actor reminders to recover from transient system failures. Prior to invoking application workflow code, the workflow or activity actor will create a new reminder. If the application code executes without interruption, the reminder is deleted. However, if the node or the sidecar hosting the associated workflow or activity crashes, the reminder will reactivate the corresponding actor and the execution will be retried.

TODO: Diagrams showing the process of invoking workflow and activity actors

{{% alert title="Important" color="warning" %}}
Too many active reminders in a cluster may result in performance issues. If your application is already using actors and reminders heavily, be mindful of the additional load that Dapr workflows may add to your system.
{{% /alert %}}

### State store usage

Dapr workflows use actors internally to drive the execution of workflows. Like any actors, these internal workflow actors store their state in the configured state store. Any state store that supports actors implicitly supports Dapr workflow.

As discussed in the [workflow actors]({{<ref "workflow-engine.md#workflow-actors" >}}) section, workflows save their state incrementally by appending to a history log. The history log for a workflow is distributed across multiple state store keys so that each "checkpoint" only needs to append the newest entries.

The size of each checkpoint is determined by the number of concurrent actions scheduled by the workflow before it goes into an idle state. Sequential workflows that take one action at a time will therefore make smaller batch updates to the state store whereas "fan-out" workflows that run many tasks in parallel will requiring larger batches to be written. The size of the batch is also impacted by the size of inputs and outputs when workflows invoke activities or child-workflows.

TODO: Image illustrating a workflow appending a batch of keys to a state store.

Different state store implementations may implicitly put restrictions on the types of workflows you can author. For example, the Azure Cosmos DB state store limits item sizes to 2 MB of UTF-8 encoded JSON ([source](https://learn.microsoft.com/azure/cosmos-db/concepts-limits#per-item-limits)). The input or output payload of an activity or child-workflow is stored as a single record in the state store, so a item limit of 2 MB means that workflow and activity inputs and outputs can't exceed 2 MB of JSON-serialized data. Similarly, if a state store imposes restrictions on the size of a batch transaction, that may limit the number of parallel actions that can be scheduled by a workflow.

## Workflow scalability

Because Dapr workflows are internally implemented using actors, Dapr workflows have the same scalability characteristics as actors. The placement service doesn't distinguish workflow actors and actors you define in your application and will load balance workflows using the same algorithms that it uses for actors.

The expected scalability of a workflow is determined by the following factors:

* The number of machines used to host your workflow application
* The CPU and memory resources available on the machines running workflows
* The scalability of the state store configured for actors
* The scalability of the actor placement service and the reminder subsystem

The implementation details of the workflow code in the target application also plays a role in the scalability of individual workflow instances. Each workflow instance executes on a single node at a time, but a workflow can schedule activities and child-workflows which run on other nodes. Workflows can also schedule these activities and child-workflows to run in parallel, allowing a single workflow to potentially distribute compute tasks across all available nodes in the cluster.

TODO: Diagram showing an example distribution of workflows, child-workflows, and activity tasks.

{{% alert title="Important" color="warning" %}}
At the time of writing, there are no global limits imposed on workflow and activity concurrency. A runaway workflow could therefore potentially consume all resources in a cluster if it attempts to schedule too many tasks in parallel. Developers should use care when authoring Dapr workflows that schedule large batches of work in parallel.

It's also worth noting that the Dapr workflow engine requires that all instances of each workflow app register the exact same set of workflows and activities. In other words, it's not possible to scale certain workflows or activities independently. All workflows and activities within an app must be scaled together.
{{% /alert %}}

Workflows don't control the specifics of how load is distributed across the cluster. For example, if a workflow schedules 10 activity tasks to run in parallel, all 10 tasks may run on as many as 10 different compute nodes or as few as a single compute node. The actual scale behavior is determined by the actor placement service, which manages the distribution of the actors that represent each of the workflow's tasks.

## Workflow latency

In order to provide guarantees around durability and resiliency, Dapr workflows frequently write to the state store and rely on reminders to drive execution. Dapr workflows therefore may not be appropriate for latency-sensitive workloads. Expected sources of high latency include:

* Latency from the state store when persisting workflow state.
* Latency from the state store when rehydrating workflows with large histories.
* Latency caused by too many active reminders in the cluster.
* Latency caused by high CPU usage in the cluster.

See the [Reminder usage and execution guarantees]({{<ref "workflow-engine.md#reminder-usage-and-execution-guarantees" >}}) for more details on how the design of workflow actors may impact execution latency.

## Next steps

Learn more about the other workflow components:
- [Temporal.io]
