---
type: docs
title: "Dapr Jobs .NET SDK"
linkTitle: "Jobs"
weight: 120000
description: "Overview of the Dapr Jobs building block for .NET"
---

`Dapr.Jobs` provides a dedicated client for interacting with the Dapr Job APIs from a .NET application. With `DaprJobsClient` you can schedule future operations to run according to a predefined schedule with an optional payload. Three scheduling modes are supported: one-time jobs that fire at a specific point in time, interval-based jobs that recur on a fixed `TimeSpan`, and Cron-based jobs that use a Cron expression for calendar-aware scheduling. The SDK also provides minimal-API endpoint mapping so your application receives trigger invocations when a job fires.

The client is registered with dependency injection via `AddDaprJobsClient()` and can be configured from `IConfiguration`, environment variables, or a `DaprJobsClientBuilder` for advanced scenarios.

## Core concepts

- [How to: Author and manage Dapr Jobs in the .NET SDK]({{< ref dotnet-jobs-howto.md >}}): client registration with dependency injection, `IConfiguration`, and manual instantiation; mapping job trigger endpoints in minimal APIs; scheduling one-time, interval-based, and Cron-based jobs; retrieving and deleting jobs.
- [DaprJobsClient usage]({{< ref dotnet-jobsclient-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, cancellation, the three dependency injection overloads, payload serialization with JSON helper extensions, and error handling.

## Next steps

- [How to: Author and manage Dapr Jobs in the .NET SDK]({{< ref dotnet-jobs-howto.md >}})
- [DaprJobsClient usage]({{< ref dotnet-jobsclient-usage.md >}})
