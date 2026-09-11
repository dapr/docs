---
type: docs
title: "Dapr Messaging .NET SDK"
linkTitle: "Messaging"
weight: 220000
description: "Overview of the Dapr Messaging building block for .NET"
---

`Dapr.Messaging` provides a dedicated client for interacting with the Dapr messaging APIs from a .NET application. The `DaprPublishSubscribeClient` supports streaming pub/sub subscriptions that give you greater control over backpressure: messages remain in the Dapr runtime until your application is ready to process them, and a local high-performance queue caches them in your application while processing is pending. Your message handler returns a `TopicResponseAction` — `Retry`, `Drop`, or `Success` — to tell the runtime what to do with each message, and messages persist in the runtime until a response action is taken or a per-event timeout occurs.

The client is registered with dependency injection via `AddDaprPubSubClient()` and can be configured from `IConfiguration`, environment variables, or a `DaprPublishSubscribeClientBuilder` for advanced scenarios.

{{% alert title="Future migration" color="primary" %}}
In the v1.15 release, this package only contains the functionality corresponding to the streaming PubSub capability. Future Dapr .NET SDK releases will migrate existing messaging capabilities out from `Dapr.Client` into this `Dapr.Messaging` package. This will be documented in the release notes, documentation, and obsolete attributes in advance.
{{% /alert %}}

## Core concepts

- [How to: Author and manage Dapr streaming subscriptions in the .NET SDK]({{< ref dotnet-messaging-pubsub-howto.md >}}): client registration with dependency injection, `IConfiguration`, and manual instantiation; defining message handlers that return `TopicResponseAction`; configuring subscriptions with `DaprSubscriptionOptions`; and subscription cleanup.
- [DaprPublishSubscribeClient usage]({{< ref dotnet-messaging-pubsub-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, cancellation, and the three dependency injection overloads.

## Next steps

- [How to: Author and manage Dapr streaming subscriptions in the .NET SDK]({{< ref dotnet-messaging-pubsub-howto.md >}})
- [DaprPublishSubscribeClient usage]({{< ref dotnet-messaging-pubsub-usage.md >}})
