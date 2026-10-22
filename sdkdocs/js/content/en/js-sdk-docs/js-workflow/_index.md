---
type: docs
title: "Dapr Workflow JavaScript SDK"
linkTitle: "Workflow"
weight: 20000
description: Author, run, and manage durable workflows with the Dapr JavaScript SDK
---

Use the Dapr JavaScript SDK to coordinate activities, durable timers, external events, and other workflows.
`WorkflowRuntime` registers and executes your application code; `DaprWorkflowClient` schedules instances and
manages their lifecycle. Both use the Dapr sidecar's gRPC endpoint, independently of the protocol you select
for a `DaprClient`.

These guides target **`@dapr/dapr` 3.19.0-rc.4 or later**. The examples use Dapr runtime **1.19 or later** so
that all documented capabilities are available, including detached workflows, management operations, and
the alpha binary-store building block. Use Node.js 18 or later.

```sh
npm install @dapr/dapr@3.19.0-rc.4
```

## Choose a guide

| Guide | What you learn |
| --- | --- |
| [Author and run workflows]({{% ref js-workflow-authoring.md %}}) | Register a worker, chain and parallelize activities, use timers and events, retry failures, and continue as new. |
| [Manage workflow instances]({{% ref js-workflow-management.md %}}) | Schedule, inspect, wait, suspend, resume, terminate, purge, list, retrieve history, and rerun from an event. |
| [Multi-app workflows and history]({{% ref js-workflow-multi-app.md %}}) | Call remote activities and child workflows, schedule detached workflows, and inspect propagated ancestor history. |
| [Workflow versioning]({{% ref js-workflow-versioning.md %}}) | Use replay-safe patch decisions to evolve running workflows. |
| [Workflow serialization]({{% ref js-workflow-serialization.md %}}) | Share a serializer between clients and workers and preserve compatibility with persisted history. |
| [Workflow data references (alpha)]({{% ref js-workflow-data-references.md %}}) | Offload large payloads to a binary store, forward explicit references, and stream data only where needed. |

## Runtime configuration

`WorkflowRuntime` and `DaprWorkflowClient` accept an options object:

| Option | Behavior |
| --- | --- |
| `daprHost`, `daprPort` | Sidecar host and **gRPC** port. Defaults come from SDK settings, normally `127.0.0.1:50001`. Without explicit host or port options, `DAPR_GRPC_ENDPOINT` is honored. |
| `daprApiToken` | Dapr API token; otherwise uses `DAPR_API_TOKEN`. |
| `logger` | SDK logging options. Use `ctx.logger` inside workflow code to suppress replayed messages. |
| `serializer` | Payload serializer. Defaults to JSON; if omitted with `payloads` configured, uses the resolver's serializer. |
| `payloads` | Optional `BinaryStoreWorkflowPayloadResolver`. Register on every client and worker that reads or writes references. |
| `grpcOptions` | Supports `grpc.max_receive_message_length` and `grpc.max_send_message_length`, each defaulting to 128 MiB, and Connect-compatible `interceptors`. Other legacy grpc-js channel settings, such as keepalive, credentials, or compression, are not applied. |
| `maxConcurrentActivities` | Worker-only positive integer limiting simultaneous activity executions. Additional activities queue locally; workflow work items are not limited. Omit to leave concurrency to the Dapr runtime's `workflow.maxConcurrentActivityInvocations`. |

Await `runtime.start()` before scheduling work. It resolves when the worker connects and is ready, and rejects
if the initial connection fails. `runtime.isReady` reports current connection readiness; the worker reconnects
after a lost connection. Call `runtime.stop()` and `client.stop()` during application shutdown.

The SDK propagates W3C trace context when scheduling workflows and creates `WorkflowActivity <name>` spans
under the `Dapr.Workflow` tracer when an activity has a parent trace context. Configure an OpenTelemetry
provider and exporter in your application to collect these spans.

## Upgrade considerations

This SDK uses its own workflow engine rather than the shared DurableTask client library. Re-test existing
workflows when upgrading, including replay, status comparisons, serializers, and transport options.
Compare statuses with `WorkflowRuntimeStatus` members instead of hard-coded strings or numeric values.
The engine does **not** support the [stateful workflow client]({{% ref workflow-stateful-client.md %}});
[propagated ancestor history]({{% ref js-workflow-multi-app.md %}}#inspect-propagated-history) and
`getWorkflowHistory` are separate capabilities.

## Next steps

- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
- [JavaScript SDK workflow examples](https://github.com/dapr/js-sdk/tree/main/examples/workflow/authoring)
- [JavaScript SDK workflow implementation](https://github.com/dapr/js-sdk/tree/main/src/workflow)
