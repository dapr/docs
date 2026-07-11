---
type: docs
title: "Dapr Actors (Next) in the .NET SDK"
linkTitle: "Actors (Next)"
weight: 100000
description: "Overview of the modernized Dapr Actors implementation for .NET (Dapr.Actors.Next)"
---

`Dapr.Actors.Next` is a reimplementation of the Dapr Actors building block for .NET. The original `Dapr.Actors` package has been in service for a long time and predates much of what the modern Dapr .NET SDK now relies on, so this package updates the actor experience to match: it talks to the runtime over the bidirectional gRPC streaming introduced in Dapr 1.18, removes reflection from the actor path, and brings actors in line with the dependency injection, options, serialization, and source generator patterns used elsewhere in the SDK.

The actor model itself is unchanged. Actors are still virtual, addressed by type and id, with reentrancy, timers, reminders, and proxying. `Dapr.Actors.Next` is a separate package family and is not API-compatible with `Dapr.Actors`, but it is fully wire-compatible with the Dapr runtime, so adopting it requires no runtime changes except that this will only work with the Dapr runtime v1.18 or later.

{{% alert title="Runtime requirement and connectivity" color="primary" %}}
`Dapr.Actors.Next` requires Dapr runtime v1.18.0 or later. It hosts actors over persistent, app-initiated `SubscribeActorEvents` gRPC streams, so actor callbacks arrive over that stream rather than as inbound HTTP requests to mapped actor-handler endpoints, which is what `Dapr.Actors` required. The application still exposes its gRPC server port, which the runtime uses for its precondition checks; what changes is how actor callbacks are delivered, not whether the app runs a gRPC server.
{{% /alert %}}

{{% alert title="Status of Dapr.Actors" color="warning" %}}
Active development on `Dapr.Actors` has stopped; that package now receives security fixes only, and all new actor development happens in `Dapr.Actors.Next`. There is no deprecation date for `Dapr.Actors` yet but it's considered to be in a maintenance-only mode. Do not expect future development on this package going forward except for bug fixes.
{{% /alert %}}

{{% alert title="Moving from Dapr.Actors is incremental, not a big bang" color="primary" %}}
`Dapr.Actors.Next` is a new package family with a different API, so adopting it is a rewrite of your actor layer rather than an in-place upgrade. It is wire-compatible with the runtime and addresses actors by the same type name, so you can migrate one actor type at a time rather than in a single big-bang cutover. We recommend performing that migration across separate projects or services rather than hosting both SDKs in the same one: `Dapr.Actors` and `Dapr.Actors.Next` have meaningfully different behaviors — around hosting, dispatch, and serialization — and mixing them in a single project invites confusion about which SDK owns a given actor. We also have no testing that conclusively demonstrates the two packages running side-by-side in the same project, so while it is technically possible, we don't recommend it. Cross-SDK calling works where the payload serialization matches: the new SDK uses System.Text.Json by default, which lines up with the old non-remoting (JSON) proxy but not with the old DataContract remoting path. The highest-stakes thing to verify before moving a type is that its existing persisted state remains readable under the new serializer. See the [migration guide]({{< ref "dotnet-actorsnext-migration.md" >}}) for more information.
{{% /alert %}}

## What changed

This rewrite was born out of the two core ideas:

1) The first is how the SDK interfaces with the runtime. Actor callbacks (invoke, reminder, timer, and deactivate) now arrive over a long-lived bidirectional gRPC stream rather than per-call requests into a hosted actor endpoint, which lowers per-call overhead and removes the need to map inbound actor handlers. This is the same streaming pattern Dapr already uses for pub/sub subscriptions and workflow dispatch.
2) The second is the amount of work the SDK now does locally, on your side of that connection (both at build and runtime), to make actor code easier and safer to write. Source generators replace the reflection-based proxy and dispatch machinery, which both removes a runtime cost and enables Native AOT. Serialization moves to the same pluggable `IDaprSerializer` used by State management and Workflows. State migration, a state machine programming model, pub/sub-driven actors, and a deterministic in-memory test runtime are all provided in the box. The result is meant to make it straightforward to build high-performance actor applications using the rest of the modern Dapr .NET SDK rather than a separate set of actor-specific conventions.

## Source generators and compile-time checks

Source generators do most of the wiring that you used to write or that the old SDK did with reflection. From your actor interface and implementation, the generator produces the client proxy, the server-side dispatcher, the activation factory, the registration, and an actor registry describing every actor and its method signatures. None of this is hand-written, and none of it runs through reflection at call time, which is what keeps the path AOT-friendly.

Alongside the generators, the package ships analyzers and code fixes that catch actor-specific mistakes while you type: methods that aren't serializable or don't return a task type, blocking calls or thread escapes inside a turn, time read from the clock instead of an injected `TimeProvider`, a state change that would break deserialization of existing data, or a gap in a state migration chain. Where a fix is mechanical, the analyzer offers one. The full set is listed in the [diagnostics reference]({{< ref "dotnet-actorsnext-howto.md#analyzers-and-diagnostics" >}}).

## How it differs from `Dapr.Actors`

| Concern | `Dapr.Actors` (original)                                                           | `Dapr.Actors.Next` |
| --- |------------------------------------------------------------------------------------| --- |
| Runtime connectivity | Inbound actor-handler endpoints the runtime calls into per invocation              | Actor callbacks over an outbound persistent `SubscribeActorEvents` stream; no actor endpoints to map (the app's gRPC server port remains) |
| Proxies and dispatch | Reflection (`DispatchProxy`, runtime IL)                                           | Source-generated; no reflection on the hot path |
| Native AOT and trimming | Not supported                                                                      | Supported; runtime packages are trim/AOT clean |
| Nullable reference types | Partial                                                                            | Enabled across the public surface |
| Registration | Manual `RegisterActor<T>()` per type                                               | Source-generated discovery; actors are not registered by hand |
| Hosting setup | `app.MapActorsHandlers()` endpoint mapping                                         | `AddDaprActors()` only; the host dials the runtime |
| Dependency injection | Bespoke                                                                 | Per-activation DI scope; constructor injection of registered services |
| Proxy flavors | Remoting proxy (.NET-to-.NET) and non-remoting proxy (cross-app)                   | One proxy; no remoting/non-remoting distinction |
| Serialization | DataContract via the remoting proxy, or System.Text.Json via the non-remoting proxy | Pluggable `IDaprSerializer` (default System.Text.Json) for every call; no DataContract built in |
| Configuration | Bespoke                                                                            | Options pattern (`IOptions<DaprActorsOptions>`) |
| Testing | Integration tests against a sidecar                                                | In-memory deterministic runtime plus optional Coyote deep testing |
| State versioning | Manual                                                                             | State-envelope schema versioning with upcaster chains |
| State machines | Not provided                                                                       | First-class `StateMachineActor<TState, TData>` model |
| Pub/sub integration | Not provided                                                                       | Built-in `[Subscribe]` subscription streams |
| Per-actor state cache | Yes                                                                                | Yes (retained) |

{{% alert title="Serialization is a clean break from Dapr.Actors" color="warning" %}}
In `Dapr.Actors` the serialization format was tied to the proxy you chose. The remoting proxy used DataContract and worked only between .NET actors, while the non-remoting proxy used System.Text.Json and supported cross-app calls. `Dapr.Actors.Next` removes that split. There is a single serialization path, `IDaprSerializer` (System.Text.Json by default), used for every call regardless of how you invoke the actor, and DataContract is not supported out of the box. If you need DataContract, supply it through a custom `IDaprSerializer` implementation. The strongly-typed proxy resembles the former remoting client in calling syntax only; that resemblance does not imply DataContract, and the way you invoke an actor has nothing to do with how its payloads are serialized.
{{% /alert %}}

### Nullability and modernization

The public surface is annotated for nullable reference types, so the compiler distinguishes an actor method that may return no value from one that always returns a result, and flags the difference at build time rather than at call time. Combined with source-generated proxies and serialization, this removes a category of error the reflection-based SDK could only surface at runtime.

The modernization is functional rather than cosmetic. Removing reflection is what makes Native AOT possible and lowers startup and memory cost. The options pattern replaces bespoke configuration. A real per-activation DI scope means an actor's dependencies are resolved and disposed on the same lifecycle as the actor. A single pluggable serializer means actors, state management, and workflows serialize the same way.

## Core concepts

Each concept has its own page:

- [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}}): attributes, what the source generator produces, the minimum you must register, and cross-assembly and cross-app scenarios.
- [Serialization]({{< ref dotnet-actorsnext-serialization.md >}}): the pluggable serializer, and the per-actor cache.
- [State migration]({{< ref dotnet-actorsnext-statemigration.md >}}): The state envelope and versioning state with upcasters.
- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}}): the `StateMachineActor` model, when to choose it over a workflow, and how to test it.
- [Subscription streams]({{< ref dotnet-actorsnext-streams.md >}}): driving actors from pub/sub topics with `[Subscribe]`.
- [Dynamic invocation]({{< ref dotnet-actorsnext-dynamic.md >}}): calling actors by type, id, and method with no compile-time contract, for gateways, tooling, and cross-language callers.
- [Testing]({{< ref dotnet-actorsnext-testing.md >}}): the in-memory test runtime, xUnit usage, and optional Coyote integration for deep concurrency testing.

## Learn by example

If you would rather see the improvements one at a time with runnable code, the [tutorial]({{< ref "tutorial/_index.md" >}}) walks through six worked examples, each paired with its test, with the code in the solution under `/examples/Actor.Next/`. It is the fastest way to understand what changed and why.

## Next steps

- [Tutorial: Dapr.Actors.Next by example]({{< ref "tutorial/_index.md" >}})
- [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
