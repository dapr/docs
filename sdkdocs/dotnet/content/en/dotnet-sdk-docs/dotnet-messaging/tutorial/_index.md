---
type: docs
title: "Tutorial: Dapr.Messaging by example"
linkTitle: "Tutorial"
weight: 160000
description: "A seven-part tutorial for publishing and subscribing with the Dapr.Messaging .NET SDK, including unit and integration testing"
---

This tutorial uses the runnable examples in the [.NET SDK repository](https://github.com/dapr/dotnet-sdk/tree/master/examples/Messaging) to demonstrate the main capabilities of `Dapr.Messaging`. Each part includes the implementation pattern and the corresponding unit and integration testing approach.

The examples use .NET 8, .NET 9, or .NET 10 and require Dapr runtime 1.18 or later. The unit tests run without Dapr, Docker, or a message broker. The integration tests use `Dapr.Testcontainers` to run a real Dapr sidecar and Redis pub/sub component, which is the recommended way to verify delivery behavior in an application.

## Tutorial content

- [Part 1: Publish events]({{< ref dotnet-messaging-tutorial-publishing.md >}}): Typed events, CloudEvent metadata, bulk publishing, and raw payloads.
- [Part 2: Declarative streaming subscriptions]({{< ref dotnet-messaging-tutorial-streaming.md >}}): Source-generated handlers with explicit success, retry, and drop acknowledgements.
- [Part 3: Content-based routing and dead-letter topics]({{< ref dotnet-messaging-tutorial-routing.md >}}): CEL matching rules, priorities, metadata, and dead-letter handling.
- [Part 4: Bulk subscriptions]({{< ref dotnet-messaging-tutorial-bulk.md >}}): High-throughput delivery with bounded batch size and wait duration.
- [Part 5: gRPC AppCallback push]({{< ref dotnet-messaging-tutorial-appcallback.md >}}): Sidecar-initiated gRPC delivery for applications that expose a gRPC port.
- [Part 6: HTTP push subscriptions]({{< ref dotnet-messaging-tutorial-http.md >}}): Generated `/dapr/subscribe` discovery and custom HTTP routes.
- [Part 7: Dynamic streaming subscriptions]({{< ref dotnet-messaging-tutorial-dynamic.md >}}): Imperative runtime subscriptions with supervision, cancellation, and reconnect behavior.

## Testing pattern

Keep message-handling decisions in ordinary C# handlers so they can be tested directly. The example unit tests construct a `TopicContext`, invoke `HandleAsync`, and assert the returned `TopicResponseAction` for valid, invalid, and transient inputs.

Add integration tests for the infrastructure boundary. The examples create a `PubSubHarness`, configure the application with the harness's dynamically assigned Dapr endpoints, publish real events, and wait for observable processing results. Use bounded timeouts, `IAsyncLifetime` cleanup, and a test log sink rather than sleeps alone when validating asynchronous delivery.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) 8, 9, or 10
- [Dapr CLI]({{< ref install-dapr-cli.md >}}) and a Dapr environment
- Dapr runtime 1.18 or later for streaming subscriptions
- Docker or another container runtime for integration tests
- The `Dapr.Messaging` package

When using the SDK repository directly, the examples reference the local SDK projects. In an application, install the published `Dapr.Messaging` package instead.

