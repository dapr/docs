---
type: docs
title: "Built-in workflow component overview"
linkTitle: "Built-in workflow component"
weight: 4400
description: "Overview of the built-in workflow engine (durabletask-go) component"
---

# Overview

The Dapr Workflow engine is a built-in workflow component that allows developers to define workflows using ordinary code in a variety of programming languages. The workflow engine runs inside of the Dapr sidecar and orchestrates workflow code that is deployed as part of your application. This article describes the architecture of the built-in engine, how it interacts with application code, and how it fits into the overall Dapr architecture.

{{% alert title="Note" color="primary" %}}
For information on how to author workflows that are executed by the built-in Dapr workflow engine, see the [workflow application developer guide]({{<ref "workflow-overview.md" >}}).
{{% /alert %}}

The Dapr Workflow engine is internally implemented using then open source [durabletask-go](https://github.com/microsoft/durabletask-go) library, which is embedded directly into the Dapr sidecar. Dapr implements a custom durable task "backend" using internally managed actors, which manage workflow scale-out, persistence, and leader election. This article will go into more details in subsequent sections.

## Sidecar interactions

TODO: Describe the gRPC protocol used in the SDK/sidecar interactions. Make sure to also emphasize the responsibilities of the app vs. the responsibilities of the sidecar.

When a workflow application starts up, it uses a workflow authoring SDK to send a gRPC request to the Dapr sidecar and get back a stream of workflow work-items, following the [Server streaming RPC pattern](https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc). These work-items can be anything from "start a new X workflow" (where X is the type of a workflow) to "schedule activity Y with input Z to run on behalf of workflow X". The workflow app executes the appropriate workflow code and then sends a gRPC request back to the sidecar with the execution results.

<img src="/images/workflow-overview/workflow-engine-protocol.png" alt="Dapr Workflow Engine Protocol" width=400/>

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
In the alpha release of the workflow engine, workflow actor state will remain in the state store even after a workflow has completed. Creating a large number of workflows could result in unbounded storage usage. In a future release, data retention policies will be introduced that can automatically purge the state store of old workflow state.
{{% /alert %}}

The following diagram illustrates the typical lifecycle of a workflow actor.

<img src="/images/workflow-overview/workflow-actor-flowchart.png" alt="Dapr Workflow Actor Flowchart" width=400/>

To summarize, a workflow actor is activated when it receives a new message. New messages will then trigger the associated workflow code (in your application) to run and return an execution result back to the workflow actor. Once the result is received, the actor will schedule any tasks as necessary, update its state in the state store, and then go idle until it receives another message. During this idle time, the sidecar may decide to unload the workflow actor from memory.

### Activity actors

A new instance of the `dapr.internal.wfengine.activity` actor is activated for every activity task that gets scheduled by a workflow. The ID of the _activity_ actor is the ID of the workflow combined with a sequence number. For example, if a workflow has an ID of `876bf371` and is the third activity to be scheduled by the workflow, it's ID will be `876bf371#2` where `2` is the sequence number (sequence numbers start with 0).

Each activity actor stores a single key into the state store:

* `activityreq-N`: The key contains the activity invocation payload, which includes the serialized activity input data. The `N` value is a 64-bit unsigned integer that represents the _generation_ of the workflow, a concept which is outside the scope of this documentation.

{{% alert title="Warning" color="primary" %}}
In the alpha release of the workflow engine, activity actor state will remain in the state store even after the activity task has completed. Scheduling a large number of workflow activities could result in unbounded storage usage. In a future release, data retention policies will be introduced that can automatically purge the state store of completed activity state.
{{% /alert %}}

Activity actors are short-lived. They are activated when a workflow actor schedules an activity task and will immediately call into the workflow application to invoke the associated activity code. One the activity code has finished running and has returned its result, the activity actor will send a message to the parent workflow actor with the execution results, triggering the workflow to move forward to its next step.

<img src="/images/workflow-overview/workflow-activity-actor-flowchart.png" alt="Workflow Activity Actor Flowchart" width=400/>

### Reminder usage and execution guarantees

TODO: Describe how reminders are used, and what kinds of reminder pressure may be added to a system.

### State store usage

TODO: Describe how the workflow engine uses state storage. Include a callout about how there is no "garbage collection" currently.

## Performance and scale considerations

TODO: Describe the mechanisms involved when workflows run and how that might impact performance. Also talk about how load gets distributed across nodes. These topics might require separate sub-sections.

## Next steps

Learn more about the other workflow components:
- [Temporal.io]
