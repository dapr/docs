---
type: docs
title: "Dapr Distributed Lock .NET SDK"
linkTitle: "Distributed Lock"
weight: 240000
description: "Overview of the Dapr Distributed Lock building block for .NET"
---

With the Dapr Distributed Lock package, you can create and remove locks on resources to manage exclusivity across
your distributed applications. The `DaprDistributedLockClient` provides a dedicated client for interacting with Dapr's
distributed lock API, supporting lock acquisition with automatic release on disposal, configurable timeouts, and
cancellation.

{{% alert title="Package guidance" color="primary" %}}
While this capability is implemented in both the `Dapr.Client` and `Dapr.DistributedLock` packages, the approach differs
slightly between them and a future release will see the `Dapr.Client` package be deprecated. It's recommended that new
implementations use the `Dapr.DistributedLock` package.
{{% /alert %}}

## Core concepts

- [How to: Use the Distributed Lock client]({{< ref dotnet-distributedlock-howto.md >}}): install the package, register the client with dependency injection or build it manually, and try the samples.
- [DaprDistributedLockClient usage]({{< ref dotnet-distributedlock-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, cancellation, and the three dependency injection overloads.

## Next steps

- [How to: Use the Distributed Lock client]({{< ref dotnet-distributedlock-howto.md >}})
- [DaprDistributedLockClient usage]({{< ref dotnet-distributedlock-usage.md >}})
