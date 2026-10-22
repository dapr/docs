---
type: docs
title: "Dapr actors .NET SDK"
linkTitle: "Actors"
weight: 60000
description: "Overview of the Dapr virtual actors building block for .NET"
---

The `Dapr.Actors` package enables you to interact with Dapr virtual actors from a .NET application. Actors are virtual, addressed by type and id, with support for state management, reminders, timers, and both strongly-typed and weakly-typed proxy clients. The actor pattern is suited to scenarios where you need single-threaded, instance-based concurrency for stateful objects.

{{% alert title="Status of Dapr.Actors" color="warning" %}}
Active development on `Dapr.Actors` has stopped; this package now receives security fixes only, and all new actor development happens in [`Dapr.Actors.Next`]({{% ref dotnet-actors-next %}}). There is no deprecation date for `Dapr.Actors` but it's considered to be in a maintenance-only mode.

`Dapr.Actors.Next` is expected to be released as a stable package alongside the v1.19 Dapr runtime and SDK release.
{{% /alert %}}

## Core concepts

- [How to: Run and use virtual actors in the .NET SDK]({{< ref dotnet-actors-howto.md >}}): a complete tutorial building a three-project solution — actor interfaces, an actor service with state, reminders, and timers, and a proxy client.
- [Author & run actors]({{< ref dotnet-actors-usage.md >}}): authoring actors with `ActorHost`, dependency injection, disposal, logging, and custom type names; hosting actors in ASP.NET Core with `AddActors`, JSON options, endpoint routing via `MapActorsHandlers`, and middleware pitfalls.
- [Actor serialization]({{< ref dotnet-actors-serialization.md >}}): the two serialization models — the weakly-typed client (System.Text.Json, JSON output) and the strongly-typed client (Data Contract Serializer, XML output) — and the rules for configuring types in each.
- [The IActorProxyFactory interface]({{< ref dotnet-actors-client.md >}}): creating actor clients with the strongly-typed (`CreateActorProxy<>`) and weakly-typed (`Create`) proxy styles, and reading exception details from method invocations.

## Next steps

- [How to: Run and use virtual actors in the .NET SDK]({{< ref dotnet-actors-howto.md >}})
- [Author & run actors]({{< ref dotnet-actors-usage.md >}})
- [Actor serialization]({{< ref dotnet-actors-serialization.md >}})
