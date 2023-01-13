---
type: docs
title: "Built-in workflow component overview"
linkTitle: "Built-in workflow component"
weight: 4400
description: "Overview of the built-in workflow engine (durabletask-go) component"
---

# Overview

The Dapr Workflow engine is a built-in workflow component that allows developers to define workflows using ordinary code in a variety of programming languages. The workflow engine runs inside of the Dapr sidecar and orchestrates workflow code that is deployed as part of application code. This article describes the architecture of the built-in engine, how it interacts with application code, and how it fits into the overall Dapr architecture.

{{% alert title="Note" color="primary" %}}
For information on how to author workflows that are executed by the built-in Dapr workflow engine, see the [workflow application developer guide]({{<ref "workflow-overview.md" >}}).
{{% /alert %}}

To facilitate the orchestration of workflow code, the application opens a gRPC connection to a workflow-specific endpoint on the Dapr sidecar. When workflows are scheduled, the sidecar streams back workflow commands to the app with instructions for what code to execute.

TODO: Diagram showing sidecar calling into application workflow code

The Dapr Workflow engine is internally implemented using then open source [durabletask-go](https://github.com/microsoft/durabletask-go) library, which is embedded directly into the Dapr sidecar. Dapr implements a custom durable task "backend" using internally managed actors, which manage workflow scale-out, persistence, and leader election. This article will go into more details.

## Sidecar interactions

TODO: Describe the gRPC protocol used in the SDK/sidecar interactions. Make sure to also emphasize the responsibilities of the app vs. the responsibilities of the sidecar.

## Workflow distributed tracing

TODO: Discuss how distributed tracing works. Include screenshots.

## Internal actors

TODO: Describe what internal actors are, and which ones are in use.

### Reminder usage and execution guarantees

TODO: Describe how reminders are used, and what kinds of reminder pressure may be added to a system.

### State store usage

TODO: Describe how the workflow engine uses state storage. Include a callout about how there is no "garbage collection" currently.

## Performance and scale considerations

TODO: Describe the mechanisms involved when workflows run and how that might impact performance. Also talk about how load gets distributed across nodes. These topics might require separate sub-sections.

## Next steps

Learn more about the other workflow components:
- [Temporal.io]
- [Azure Logic Apps]