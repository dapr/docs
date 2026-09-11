---
type: docs
title: "Dapr State Management .NET SDK"
linkTitle: "State Management"
weight: 180000
description: "Overview of the Dapr State Management building block for .NET"
---

`Dapr.StateManagement` provides a dedicated client for interacting with the Dapr State Management API from a .NET application. With `DaprStateManagementClient` you can save, retrieve, delete, and query key/value state entries in configured state store components. The package supports single-key and bulk operations, optimistic concurrency control via ETags, state transactions, and state queries. It also includes a source generator that provides strongly-typed, store-scoped access through dependency injection using `[StateStore]` and `[State]` attributes.

The client is registered with dependency injection via `AddDaprStateManagement()` and can be configured from `IConfiguration`, environment variables, or a `DaprStateManagementClientBuilder` for advanced scenarios.

## Core concepts

- [How to: Manage state with the Dapr State Management .NET SDK]({{< ref dotnet-statemanagement-howto.md >}}): end-to-end walkthrough covering save, retrieve, delete, and query operations, ETags, bulk operations, state transactions, the source generator for typed state store access, and testing.
- [DaprStateManagementClient usage]({{< ref dotnet-statemanagementclient-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, dependency injection overloads, JSON serialization defaults, API response shapes, `StateOptions` for consistency and concurrency, error handling, and migration from `DaprClient`.

## Next steps

- [How to: Manage state with the Dapr State Management .NET SDK]({{< ref dotnet-statemanagement-howto.md >}})
- [DaprStateManagementClient usage]({{< ref dotnet-statemanagementclient-usage.md >}})
