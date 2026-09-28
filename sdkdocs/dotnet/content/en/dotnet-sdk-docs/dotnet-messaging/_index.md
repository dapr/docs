---
type: docs
title: "Dapr Messaging in the .NET SDK"
linkTitle: "Messaging"
weight: 220000
description: "Overview of the unified Dapr Messaging SDK for .NET (Dapr.Messaging)"
---

`Dapr.Messaging` is the unified Dapr Publish/Subscribe messaging SDK for .NET. It brings all Dapr pub/sub functional modes—event publishing, streaming pull subscriptions, programmatic gRPC push subscriptions, and HTTP subscriptions—together into a single, modern package family.

Rather than fragmenting pub/sub across `Dapr.Client` and `Dapr.AspNetCore`, `Dapr.Messaging` provides a clean, cohesive programming model built on top of modern .NET fundamentals: Roslyn source generators for reflection-free dispatch, compile-time Roslyn analyzers, and the standard `Microsoft.Extensions.Options` pattern.

{{% alert title="Unified package architecture" color="primary" %}}
`Dapr.Messaging` is a meta-package that brings the runtime client (`Dapr.Messaging.Runtime`), core abstractions (`Dapr.Messaging.Abstractions`), source generators (`Dapr.Messaging.Generators`), and Roslyn analyzers (`Dapr.Messaging.Analyzers`) in a single package reference:

```xml
<ItemGroup>
  <PackageReference Include="Dapr.Messaging" Version="..." />
</ItemGroup>
```
{{% /alert %}}

## What changed

The Dapr .NET SDK originally distributed messaging capabilities across multiple packages: `Dapr.Client` provided basic publish and dynamic streaming pull methods, while `Dapr.AspNetCore` handled controller-based and minimal API push subscriptions via HTTP endpoints.

`Dapr.Messaging` unifies and modernizes this architecture:

1. **Unified publishing and subscribing**: Publish events with `IDaprPublishSubscribeClient` (including single events, raw byte streams, and bulk publishing) and author subscribers using a single `ITopicHandler<TMessage>` interface.
2. **Three unified delivery modes**: Subscriptions support `DeliveryMode.Streaming` (streaming subscriptions via gRPC), `DeliveryMode.Programmatic` (programmatic subscriptions via gRPC push), and `DeliveryMode.Http` (declarative subscriptions via `/dapr/subscribe`), all configured through the same `[DaprTopic]` attribute.
3. **Source generators eliminate reflection**: The `Dapr.Messaging.Generators` source generator inspects `[DaprTopic]` handlers at compile time and emits typed dispatchers, subscriber registries, and dependency injection wiring. No runtime reflection or runtime code generation is performed on the invocation path.
4. **AOT and trimming considerations**: Handler discovery and dispatch registration are generated at compile time, but the current generated subscriber dispatchers use runtime `System.Text.Json` metadata. Native AOT and trimming scenarios require explicit validation with the target SDK version.
5. **Roslyn analyzers and diagnostics**: The SDK includes compile-time analyzers (`DAPR1610`–`DAPR1617`) that catch misconfigurations directly in your IDE as you write code:
   - **`DAPR1610` (Error)**: Conflicting delivery modes on the same topic.
   - **`DAPR1611` (Error)**: `[DaprTopic]` class not implementing `ITopicHandler<TMessage>`.
   - **`DAPR1612` (Warning)**: Unregistered message type in Native AOT compilation.
   - **`DAPR1613` (Warning)**: Missing `app.MapDaprMessaging()` for programmatic subscriptions (with CodeFix).
   - **`DAPR1614` (Warning)**: Direct invocation of internal `DaprMessagingRegistration`.
   - **`DAPR1615` (Warning)**: Endpoint mapping present without matching topic subscribers.
   - **`DAPR1616` (Warning)**: `[DaprTopic]` feature enabled without companion properties.
   - **`DAPR1617` (Warning)**: Ignored `[DaprTopic]` properties for the selected delivery mode or feature.
6. **Standard options and simplified DI**: Uses `IOptions<DaprMessagingOptions>` and a single `services.AddDaprMessaging()` method that registers options, the publishing client, source-generated subscriber dispatchers, and required hosting services in a single atomic operation.

## Comparison with legacy pub/sub approaches

| Capability | Legacy (`Dapr.Client` / `Dapr.AspNetCore`) | Modern (`Dapr.Messaging`) |
| --- | --- | --- |
| Package structure | Split across `Dapr.Client` and `Dapr.AspNetCore` | Single unified meta-package `Dapr.Messaging` |
| Publishing client | `DaprClient.PublishEventAsync` | Dedicated `IDaprPublishSubscribeClient` / `DaprPublishSubscribeClient` |
| Bulk publishing | `DaprClient.BulkPublishEventAsync` | `IDaprPublishSubscribeClient.BulkPublishEventAsync` with typed `BulkPublishEntry<T>` |
| Subscriptions model | Controller attributes (`[Topic]`) or minimal API endpoints | Unified `ITopicHandler<TMessage>` handlers decorated with `[DaprTopic]` |
| Delivery modes | Separate implementations for streaming gRPC vs HTTP | Configurable via `DeliveryMode` (`Streaming`, `Programmatic`, `Http`) |
| Streaming pull subscriptions | Imperative client calls only | Both declarative `[DaprTopic(Delivery = DeliveryMode.Streaming)]` and imperative `SubscribeAsync` |
| Dispatch mechanism | Runtime reflection / MVC action invokers | Source-generated typed dispatchers (`AddDaprMessaging`) |
| Native AOT & Trimming | Not supported | Requires explicit validation |
| Compile-time analyzers | None | Built-in Roslyn analyzers and code fixes (`DAPR16xx`) |
| Configuration | Custom builder methods | Standard `Microsoft.Extensions.Options` pattern (`DaprMessagingOptions`) |
| CloudEvents support | Manual deserialization or controller bindings | Strongly-typed `CloudEvent`, `CloudEvent<TData>`, and `TopicContext.CloudEvent` |

## Core concepts

- **[Tutorial: Dapr.Messaging by example]({{< ref "tutorial/_index.md" >}})**: Seven runnable examples covering publishing, streaming, routing, bulk subscriptions, gRPC push, HTTP push, dynamic streaming, and their unit and integration testing patterns.
- **[Publish events how-to]({{< ref dotnet-messaging-publish-howto.md >}})**: Step-by-step guide to publishing JSON events, CloudEvents, raw payloads, and bulk message batches using `IDaprPublishSubscribeClient`.
- **[Subscribe to topics how-to]({{< ref dotnet-messaging-subscribe-howto.md >}})**: Step-by-step guide to authoring `ITopicHandler<TMessage>` subscribers, choosing delivery modes with `[DaprTopic]`, compile-time source generation, dynamic streaming subscriptions, and compiler diagnostics.
- **[Configuration and usage guide]({{< ref dotnet-messaging-pubsub-usage.md >}})**: Lifetime management, DI options configuration, advanced features (bulk pub/sub, dead-letter topics, CEL routing), and AOT/trimming considerations.

## Next steps

- [Tutorial: Dapr.Messaging by example]({{< ref "tutorial/_index.md" >}})
- [How-To: Publish events with IDaprPublishSubscribeClient]({{< ref dotnet-messaging-publish-howto.md >}})
- [How-To: Author subscriptions and handle topic messages]({{< ref dotnet-messaging-subscribe-howto.md >}})
- [Dapr Messaging configuration and usage reference]({{< ref dotnet-messaging-pubsub-usage.md >}})
- [Dapr Pub/Sub building block overview]({{% ref pubsub-overview %}})
