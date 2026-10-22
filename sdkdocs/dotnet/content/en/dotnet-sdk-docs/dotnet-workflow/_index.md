---
type: docs
title: "Dapr Workflow .NET SDK"
linkTitle: "Workflow"
weight: 40000
description: Get up and running with Dapr Workflow and the Dapr .NET SDK
---

The `Dapr.Workflow` package provides typed workflows and activities, a hosted worker, and `DaprWorkflowClient`
for managing durable instances. These guides describe **SDK 1.19.0 or later**; use Dapr runtime 1.19 for the full
feature set. Installing the package does not configure a workflow state store or start the required runtime services.

```sh
dotnet add package Dapr.Workflow
```

| Task | Guide |
| --- | --- |
| Register the worker/client, discover types, and configure transport or history caching | [Client registration]({{% ref dotnet-workflowclient-usage.md %}}) |
| Write deterministic orchestration, activities, retries, timers/events, fan-out, children, and continuation | [Author workflows]({{% ref dotnet-workflow-authoring.md %}}) |
| Schedule, wait, signal, suspend/resume, terminate, purge, list, inspect history, or rerun | [Management operations]({{% ref dotnet-workflow-management-methods.md %}}) |
| Customize JSON or use another serializer | [Serialization]({{% ref dotnet-workflow-serialization.md %}}) |
| Route activities, children, and detached workflows to another app | [Multi-app workflows]({{% ref dotnet-workflow-multi-app.md %}}) |
| Share ancestor history with child workflows | [History propagation]({{% ref dotnet-workflow-history-propagation.md %}}) |
| Evolve deployed workflows using patches or versioned names | [Versioning]({{% ref dotnet-workflow-versioning.md %}}) |
| Offload large payloads or pass explicit binary references (alpha) | [Data references]({{% ref dotnet-workflow-data-references.md %}}) |
| Explore end-to-end examples | [Examples]({{% ref dotnet-workflow-examples.md %}}) |

Workflow code must remain deterministic during replay. Keep I/O and other nondeterministic work in activities,
make external side effects idempotent, and preserve compatible code and payloads for retained workflow histories.
