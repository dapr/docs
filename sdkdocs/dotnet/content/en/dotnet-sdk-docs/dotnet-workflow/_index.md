---
type: docs
title: "Dapr Workflow .NET SDK"
linkTitle: "Workflow"
weight: 40000
description: "Overview of the Dapr Workflow building block for .NET"
---

`Dapr.Workflow` brings durable, long-running orchestration to .NET applications. Workflows are expressed as C# classes that orchestrate sequences of activities — each activity is a discrete unit of work that can call other Dapr building blocks, and the workflow runtime handles persistence, replay, and recovery automatically. If a process restarts mid-workflow, the runtime replays the event log to reconstruct state and resume execution.

Workflows and activities are registered with dependency injection via `AddDaprWorkflow()`. Starting with the v1.18 SDK, a build-time source generator discovers and registers all workflow and activity types automatically, so you no longer need to call `RegisterWorkflow<T>` or `RegisterActivity<T>` by hand, though doing so is still fully supported. The `DaprWorkflowClient` is then injected to schedule, manage, and inspect running workflow instances.

## Core concepts

- [DaprWorkflowClient registration and lifetime]({{< ref dotnet-workflowclient-usage.md >}}): dependency injection with singleton, scoped, or transient lifetimes, injecting services into activities, and using the replay-safe logger.
- [Workflow versioning]({{< ref dotnet-workflow-versioning.md >}}): patch-based and name-based versioning strategies, cross-assembly workflow discovery, and override attributes.
- [Workflow serialization]({{< ref dotnet-workflow-serialization.md >}}): overriding the default System.Text.Json settings and registering custom serializers (e.g. MessagePack).
- [Multi-application workflows]({{< ref dotnet-workflow-multi-app.md >}}): calling activities and child workflows hosted in a different Dapr application.
- [Workflow management operations]({{< ref dotnet-workflow-management-methods.md >}}): schedule, retrieve status, raise events, suspend, resume, terminate, and purge workflow instances with `DaprWorkflowClient`.
- [Workflow history propagation]({{< ref dotnet-workflow-history-propagation.md >}}): opt-in per-call propagation of workflow history to child workflows and activities, querying propagated history, and security considerations.
- [Workflow examples]({{< ref dotnet-workflow-examples.md >}}): links to runnable tutorials in the Dapr Quickstarts repository and example projects in the .NET SDK repository.

## Next steps

- [DaprWorkflowClient registration and lifetime]({{< ref dotnet-workflowclient-usage.md >}})
- [Workflow management operations]({{< ref dotnet-workflow-management-methods.md >}})
- [Workflow examples]({{< ref dotnet-workflow-examples.md >}})
