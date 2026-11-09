---
type: docs
title: "Dapr Metadata .NET SDK"
linkTitle: "Metadata"
weight: 200000
description: "Overview of the Dapr Metadata building block for .NET"
---

`Dapr.Metadata` provides typed access to Dapr runtime metadata from a .NET application. The package registers a hosted service that fetches sidecar metadata at startup and exposes it through the .NET options pattern as `DaprMetadata`. You can inject it via `IOptions<DaprMetadata>`, `IOptionsSnapshot<DaprMetadata>`, or `IOptionsMonitor<DaprMetadata>`, giving you access to the components, subscriptions, app connection properties, and other metadata the runtime reports about itself.

The client is registered with dependency injection via `AddDaprMetadata()` and can be configured from `IConfiguration` or environment variables.

## Core concepts

- [How to: Retrieve Dapr runtime metadata with the .NET SDK]({{< ref dotnet-metadata-howto.md >}}): install the package, register with dependency injection, inject metadata through the options pattern, read metadata values, and configure the Dapr endpoint.

## Next steps

- [How to: Retrieve Dapr runtime metadata with the .NET SDK]({{< ref dotnet-metadata-howto.md >}})
