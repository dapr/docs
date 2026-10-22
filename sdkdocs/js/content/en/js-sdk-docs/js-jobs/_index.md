---
type: docs
title: "Dapr Jobs JavaScript SDK"
linkTitle: "Jobs"
weight: 120000
description: Schedule, retrieve, delete, and handle Dapr Jobs using the JavaScript SDK
---

Use the Dapr JavaScript SDK to schedule future operations in Node.js applications. Jobs can run once, at a fixed interval, or on a calendar-based schedule, with an optional payload and failure policy.

This documentation targets **`@dapr/dapr` 3.19.0 or later** and **Dapr runtime 1.16 or later**, with a running [Scheduler service]({{% ref "concepts/dapr-services/scheduler.md" %}}).

The SDK exposes Jobs through the existing client and server:

| API | Purpose |
| --- | --- |
| `DaprClient.jobs.schedule(name, options)` | Create a job or explicitly overwrite an existing job. |
| `DaprClient.jobs.get(name)` | Retrieve a job's schedule, payload, and other settings. |
| `DaprClient.jobs.delete(name)` | Delete a job by name. |
| `DaprServer.jobs.listen(name, callback)` | Register an asynchronous handler for a named job. |
| `CronExpressionBuilder` | Build a six-field cron expression with optional time zone. |

Both HTTP and gRPC support job management and JSON callbacks. Opaque binary payloads require gRPC for scheduling, retrieval, and callbacks. The SDK automatically selects the stable or Alpha1 Jobs API for the connected runtime.

These are the JavaScript SDK's Jobs APIs in this package version. It does not expose job listing, bulk deletion, deletion by prefix, or per-operation cancellation options. Do not assume that all management methods in another language SDK are available in JavaScript.

To get started, follow the [Jobs how-to guide]({{% ref js-jobs-howto.md %}}). Read the [client and callback usage guidance]({{% ref js-jobs-client-usage.md %}}) for options, serialization, compatibility, and errors, or the [cron builder guide]({{% ref js-jobs-cron.md %}}) for calendar-based scheduling.

See the [Jobs overview]({{% ref jobs-overview.md %}}) and [Jobs API reference]({{% ref jobs_api.md %}}) for the underlying building block.
