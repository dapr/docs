---
type: docs
title: "Migrating from Dapr.Actors to Dapr.Actors.Next"
linkTitle: "Migrate from Dapr.Actors"
weight: 105000
description: "A concept-by-concept guide for moving an existing Dapr.Actors (and Dapr.Actors.AspNetCore) actor layer to Dapr.Actors.Next"
---

This guide is for developers who already run actors on `Dapr.Actors` (typically hosted with `Dapr.Actors.AspNetCore`) and want to move to `Dapr.Actors.Next`. It walks each concept you use today, shows the equivalent in the new SDK, explains how the concept itself changed, calls out those opportunities to make impactful mistakes, and gives before/after code. This document assumes you know how `Dapr.Actors` works; it does not re-teach the actor model, and it deliberately skips features that have no analog in the old SDK (state machines, subscription streams, the in-memory test runtime, and state migration each have their own page).

`Dapr.Actors.Next` is a new package family with a different API. Adopting it is a rewrite of your actor layer, not an in-place package bump. The good news is that it is wire-compatible with the Dapr runtime and addresses actors by the same type name, so the old and new SDKs can coexist and you can move one actor type at a time rather than all at once.

{{% alert title="Runtime requirement" color="warning" %}}
`Dapr.Actors.Next` requires Dapr runtime **v1.18.0 or later**. It hosts actors over persistent, app-initiated `SubscribeActorEvents` gRPC streams rather than inbound HTTP actor-handler endpoints. Confirm your clusters are on 1.18+ before you begin; there is no supported way to run the new SDK against an older sidecar. While the `Dapr.Actors` and `Dapr.Actors.AspNetCore` packages will work against all supported versions of the Dapr runtime, they will not use any of the gRPC functionality and an app using both the old and new Actors SDKs will need a second port opened for both the HTTP and gRPC callbacks from the runtime.
{{% /alert %}}

## Before you start: the two things most likely to bite

Read these first. Everything else in the migration is mechanical by comparison.

1. **Persisted state must remain readable.** This is the highest-stakes item, because existing actors already have state in your store. The good news is that `Dapr.Actors` already serializes actor **state** with System.Text.Json by default, and so does `Dapr.Actors.Next`, so state is broadly compatible. What can still break you is a difference in `JsonSerializerOptions` (property naming policy, enum-as-string versus number, how nulls and defaults are emitted) or a custom state serializer you configured on the old side. Treat the serializer configuration as part of your at-rest contract, verify it lines up, and where a shape genuinely changes, use the built-in [state migration]({{< ref dotnet-actorsnext-statemigration.md >}}) rather than hoping the bytes match.

2. **Live cross-SDK calls only line up on the JSON path.** During coexistence, a call from a `Dapr.Actors.Next` proxy is serialized with System.Text.Json. That matches the old **non-remoting** proxy (also JSON) but **not** the old **remoting** proxy (DataContract). If you have a mixed fleet mid-migration where one app calls another over the actor protocol, the two ends must agree on the wire format. A clean way to avoid this class of problem is to move an actor type and its callers together, so you are never straddling two serialization formats for the same type.

{{% alert title="Move one actor type at a time" color="primary" %}}
Because both SDKs address actors by the same type name and are wire-compatible with the runtime, you do not need a full-scale cutover. Stand up the new host (or a new mode in an existing app), migrate a single actor type and the code that calls it, verify state reads and behavior, then move the next. Keep `Dapr.Actors` installed for the types you have not moved yet. You might also keep the full namespaces attached to types to help distinguish which is used for which to avoid mid-migration conflicts.
{{% /alert %}}

## Quick mapping

| Concern                              | `Dapr.Actors` (+ `Dapr.Actors.AspNetCore`) | `Dapr.Actors.Next`                                                        |
|--------------------------------------| --- |---------------------------------------------------------------------------|
| Packages                             | `Dapr.Actors` + `Dapr.Actors.AspNetCore` | `Dapr.Actors.Next` (meta-package)                                         |
| Runtime connectivity                 | Inbound HTTP actor-handler endpoints | Outbound persistent `SubscribeActorEvents` gRPC stream                    |
| Hosting wire-up                      | `AddActors(...)` + `app.MapActorsHandlers()` | `AddDaprActors(...)` only                                                 |
| Registration                         | `options.Actors.RegisterActor<T>()` per type | Source-generated discovery; no per-type call needed                       |
| Contract interface                   | `interface I : IActor` (no attribute) | `[GenerateActorClient] interface I : IActor`                              |
| Implementation                       | `[Actor(TypeName="…")] class : Actor` with `Actor(ActorHost)` ctor | `[DaprActor("…")] class : Actor` with injected `ActorActivationContext`   |
| Identity inside actor                | `this.Id` (from `Host`) | `protected override ActorId Id => context.ActorId`                        |
| State access                         | `this.StateManager` (`IActorStateManager`) | `this.State` (`IActorStateAccessor`)                                      |
| Evict per-actor instance state cache | `this.StateManager.UnloadStateAsync(string stateName, UnloadStateOptions options)` | `IActorStateAccessor.EvictCacheAsync(DaprEvictStateOptions options)`; evicts cache entries without persisting them |
| Explicit save                        | `SaveStateAsync()` (or auto at end of turn) | `State.SaveStateAsync()` when needed; otherwise automatic end-of-turn save |
| Proxy flavors                        | Remoting (`Create<T>`) and non-remoting (`Create` + `InvokeMethodAsync`) | One proxy: `IActorProxyFactory.Create<T>(id, type)`                       |
| Payload serialization                | DataContract (remoting) or System.Text.Json (non-remoting) | Pluggable `IDaprSerializer` path (System.Text.Json default)               |
| Timers                               | `RegisterTimerAsync(name, callbackMethodName, byte[] state, …)` | `IActorTimerScheduler.ScheduleAsync(…, operationName, arguments, …)`  |
| Reminders                            | `RegisterReminderAsync(…)` + implement `IRemindable` | `IActorReminderScheduler.ScheduleAsync(…)` routed to a named actor method |
| Options                              | `ActorRuntimeOptions` / `ActorReentrancyConfig` | `DaprActorsOptions` (options pattern)                                     |
| DI                                   | Scope-per-activation via the AspNetCore DI activator; ctor takes `ActorHost` | Per-activation scope; plain constructor injection                         |
| Testing                              | Integration tests against a sidecar | In-memory deterministic runtime (own page)                                |
| One interface, many actor types      | Not practical | Supported                                                                 |
| One actor type, many interfaces      | Not supported | Supported                                                                 |
| Multi-parameter non-remoting methods | Not possible (single payload arg) | Supported                                                                 |

## Packages and hosting

In the old world you referenced `Dapr.Actors` for the client and runtime types and `Dapr.Actors.AspNetCore` for hosting, then mapped actor endpoints on an HTTP port so the sidecar could call into your app over HTTP. In the new world you reference a single `Dapr.Actors.Next` package and map a gRPC endpoint; at application startup, the host opens a persistent stream with the runtime through which all callbacks are received instead.

```xml
<!-- Before -->
<ItemGroup>
  <PackageReference Include="Dapr.Actors" Version="…" />
  <PackageReference Include="Dapr.Actors.AspNetCore" Version="…" />
</ItemGroup>
```

```xml
<!-- After: one reference brings the runtime, source generators, and analyzers -->
<ItemGroup>
  <PackageReference Include="Dapr.Actors.Next" Version="…" />
</ItemGroup>
```

```csharp
// Before (Program.cs): register, then map the actor HTTP endpoints.
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddActors(options =>
{
    options.Actors.RegisterActor<CartActor>();
    options.ActorIdleTimeout = TimeSpan.FromMinutes(30);
});

var app = builder.Build();
app.MapActorsHandlers();   // maps dapr/config, deactivation, method, remind, timer, healthz
app.Run();
```

```csharp
// After: no endpoint mapping. AddDaprActors starts the host that streams from the runtime.
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprActors(options =>
{
    options.ActorIdleTimeout = TimeSpan.FromMinutes(30);
});

var app = builder.Build();
app.Run();
```

How this changed: callbacks (invoke, reminder, timer, deactivate) used to arrive as inbound HTTP requests to endpoints you mapped with `MapActorsHandlers()`. Now they arrive over a long-lived bidirectional gRPC stream the app opens to the runtime. There is nothing equivalent to `MapActorsHandlers()`.

{{% alert title="Your app still runs a gRPC server" color="primary" %}}
Removing the actor HTTP handlers does not mean your app stops listening. The application still exposes its gRPC server port, which the runtime uses for its precondition checks (e.g. in case you're using other Dapr functionality that requires a gRPC endpoint on your app). What changed is only how actor callbacks are delivered. See [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}}) for the host setup in full.
{{% /alert %}}

## Registration and discovery

`Dapr.Actors` required you to enumerate every actor type by hand inside the options delegate. `Dapr.Actors.Next` discovers them at build time with a source generator, so the per-type call disappears for the common case.

```csharp
// Before: register each actor explicitly.
builder.Services.AddActors(options =>
{
    options.Actors.RegisterActor<CartActor>();
    options.Actors.RegisterActor<OrderActor>();
});
```

```csharp
// After: discovery is automatic; AddDaprActors wires up every [DaprActor] in scope.
builder.Services.AddDaprActors();
```

You can still register a type under an explicit name (for example, sourced from configuration) with `options.Actors.RegisterActor<T>(name)`, and you can turn automatic hosting off with `EnableAutoActorRegistration = false` in the registration options to build a gateway that calls actors without hosting any. Those are covered under [Controlling automatic registration]({{< ref "dotnet-actorsnext-howto.md#controlling-automatic-registration" >}}).

{{% alert title="If actors live in a referenced project, opt in to reference scanning" color="warning" %}}
By default, the generator scans only the executing assembly. If your `[DaprActor]` types (or state upcasters) live in a class library the host references, add `<CompilerVisibleProperty Include="DaprActorsScanReferences" />` to the host `.csproj` so they are discovered. This better facilitates those that want to colocate actor types in a shared project and then reference them specifically in their apps. Especially if your app doesn't intend to host all possible discoverable actor types, you should set `EnableAutoActorRegistration` to false and manually register them yourself. See [Cross-assembly discovery]({{< ref "dotnet-actorsnext-howto.md#cross-assembly-discovery" >}}).
{{% /alert %}}

## Defining an actor

The two-part shape (a contract interface plus an implementation) is unchanged, but both parts now carry an attribute, and the implementation gets its identity and state from an injected context object instead of an `ActorHost` passed to the base constructor.

```csharp
// Before
public interface ICartActor : IActor          // derives from Dapr.Actors.IActor, no attribute
{
    Task AddItem(CartItem item);
    Task<CartSummary> GetSummary();
}

[Actor(TypeName = "CartActor")]
public class CartActor : Actor, ICartActor
{
    public CartActor(ActorHost host) : base(host) { }   // required base ctor

    public async Task AddItem(CartItem item)
    {
        var cart = await StateManager.GetOrAddStateAsync("cart", new CartState());
        cart.Items.Add(item);
        await StateManager.SetStateAsync("cart", cart);  // and/or rely on end-of-turn save
    }

    public async Task<CartSummary> GetSummary()
    {
        var cart = await StateManager.GetOrAddStateAsync("cart", new CartState());
        return new CartSummary(cart.Items.Count);
    }
}
```

```csharp
// After
using Dapr.Actors.Next;

[GenerateActorClient]                          // required marker on the contract
public interface ICartActor : IActor
{
    Task AddItem(CartItem item, CancellationToken ct = default);
    Task<CartSummary> GetSummary(CancellationToken ct = default);
}

[DaprActor]                        // required marker on the implementation, optional name argument, supports more than one IActor interface
public sealed class CartActor(ActorActivationContext context) : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public async Task AddItem(CartItem item, CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.Items.Add(item);            // mutate through .Value; saved at end of turn
    }

    public async Task<CartSummary> GetSummary(CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        return new CartSummary(cart.Value.Items.Count);
    }
}
```

What changed and why:

- `[Actor(TypeName = "…")]` becomes `[DaprActor("…")]`. The name argument is optional in both; if you omit it, the type name is used. The actor type name is still the durable address the runtime routes on, so keep it identical to what your existing instances were created under.
- The interface now needs `[GenerateActorClient]`. Without it, the generator does not see the contract, and an implementation that references no decorated interface generates nothing at all (no proxy, no dispatcher, no registration) with no error to point at. This is the single most common "my actor silently does nothing" cause.
- `Actor(ActorHost host)` is gone. Inject an `ActorActivationContext` and override `Id` and `State` from it. There is no `Host`, no `ProxyFactory` property on the base, and no `Logger` property; inject `IActorProxyFactory` and `ILogger<T>` if you need them.

{{% alert title="Both attributes are required, and they are a pair" color="warning" %}}
`[GenerateActorClient]` on the interface and `[DaprActor]` on the class are not interchangeable and neither is optional. The generator builds actors only from `[DaprActor]` classes that implement a `[GenerateActorClient]` interface. If an actor "compiles but is never called," the first thing to check is that its interface derives from `IActor` and carries `[GenerateActorClient]` (the `DAPR1421` analyzer flags a `[DaprActor]` with no decorated contract).
{{% /alert %}}

### Lifecycle hooks

The hooks map almost one-to-one, with two differences: they return `ValueTask` and take a `CancellationToken`, and the separate `OnActorMethodFailedAsync` is folded into `OnPostActorMethodAsync`, which now receives a nullable `Exception`.

```csharp
// Before
protected override Task OnActivateAsync() { … }
protected override Task OnDeactivateAsync() { … }
protected override Task OnPreActorMethodAsync(ActorMethodContext context) { … }
protected override Task OnPostActorMethodAsync(ActorMethodContext context) { … }
protected override Task OnActorMethodFailedAsync(ActorMethodContext context, Exception e) { … }
```

```csharp
// After
protected override ValueTask OnActivateAsync(CancellationToken ct = default) { … }
protected override ValueTask OnDeactivateAsync(CancellationToken ct = default) { … }
protected override ValueTask OnPreActorMethodAsync(ActorMethodContext context, CancellationToken ct = default) { … }
protected override ValueTask OnPostActorMethodAsync(ActorMethodContext context, Exception? exception, CancellationToken ct = default) { … }
// no separate OnActorMethodFailedAsync — inspect the exception parameter above
```

## State management

State is the part that most deserves your attention, both because it is where your durable data lives and because the shape of the API changed. `IActorStateManager` becomes `IActorStateAccessor`, exposed as `State` rather than `StateManager`. A read now returns an `IActorState<T>` wrapper whose value you reach and mutate through `.Value`; pending changes are saved automatically at the end of each turn, and `State.SaveStateAsync()` is available when you need to persist them earlier.

```csharp
// Before
var cart = await StateManager.GetOrAddStateAsync("cart", new CartState());
cart.Items.Add(item);
await StateManager.SetStateAsync("cart", cart);   // explicit set; save happens at end of turn
```

```csharp
// After
var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
cart.Value.Items.Add(item);                        // mutate .Value; no set needed
```

Method mapping:

| `IActorStateManager` (old) | `IActorStateAccessor` (new) | Notes |
| --- | --- | --- |
| `GetStateAsync<T>(name)` (throws if missing) | `TryGetAsync<T>(name)` then check, or `GetOrCreateAsync<T>(name, factory)` | New read is null-returning or create-on-miss; there is no throw-on-missing read |
| `TryGetStateAsync<T>(name)` → `ConditionalValue<T>` | `TryGetAsync<T>(name)` → `IActorState<T>?` (null if absent) | `.Value` on the wrapper holds the value |
| `GetOrAddStateAsync<T>(name, value)` | `GetOrCreateAsync<T>(name, () => value)` | Factory is a delegate, evaluated only on miss |
| `SetStateAsync<T>(name, value)` | `SetAsync<T>(name, value)`, or mutate `.Value` | Prefer mutating `.Value` inside a turn |
| `AddStateAsync` / `TryAddStateAsync` | `GetOrCreateAsync` / `SetAsync` | No dedicated add-only method |
| `AddOrUpdateStateAsync<T>(…)` | Mutate `.Value` (or `SetAsync`) | The add/update dance is unnecessary with the wrapper |
| `RemoveStateAsync` / `TryRemoveStateAsync` | `RemoveAsync(name)` | — |
| `ContainsStateAsync(name)` | `TryGetAsync<T>(name) is not null` | — |
| `SaveStateAsync()` | `SaveStateAsync()` | Optional; use only when you need a mid-turn write. End-of-turn save is still automatic |
| `ClearCacheAsync()` | `EvictCacheAsync()` | Drops cached entries without persisting them so the next read hits the store |

How this changed: the old cache was also saved at the end of a turn, so auto-save is not new. What is new is the ergonomics (mutate `.Value` instead of get-mutate-set). You usually do not call save explicitly; call `State.SaveStateAsync()` only when later work in the same method depends on the state already being durable. A successful explicit save marks the cache clean, so the end-of-turn save does not write the same data again unless the actor changes it afterward. Multiple mutations before a save still collapse into a single write.

Do not use `EvictCacheAsync` as a save operation. It removes entries from the current activation's cache and causes later reads to re-read durable state. By default it refuses to evict dirty entries; with `EvictOnDirtyState = true`, dirty entries are discarded rather than persisted.

{{% alert title="State serialization is System.Text.Json on both sides — but verify the options" color="warning" %}}
`Dapr.Actors` serialized actor state with System.Text.Json by default (Web defaults), and `Dapr.Actors.Next` serializes through `IDaprSerializer`, whose default is also System.Text.Json. So existing state is generally readable. The risk is a mismatch in `JsonSerializerOptions` (naming policy, enum handling, null/default emission) or a custom `IActorStateSerializer` you registered on the old side. If you changed a state type's **shape**, do not try to make the bytes line up by hand — use the built-in [state migration]({{< ref dotnet-actorsnext-statemigration.md >}}), which reads legacy plain values and folds them forward on read. See also [Serialization]({{< ref dotnet-actorsnext-serialization.md >}}).
{{% /alert %}}

{{% alert title="Records and primary-constructor types just work as payloads now" color="primary" %}}
Under `Dapr.Actors`, the remoting proxy used the Data Contract Serializer for **method payloads**, which required a public parameterless constructor or `[DataContract]`/`[DataMember]` annotations — so records and primary-constructor classes needed a redundant constructor or attributes to travel as arguments. `Dapr.Actors.Next` uses System.Text.Json for every call, so those types work as written with no serialization attributes. (Actor state was already JSON in the old SDK, so this specifically removes the friction the remoting proxy imposed on argument and return types.)
{{% /alert %}}

## Calling actors: one proxy, no remoting split

`Dapr.Actors` gave you two ways to call an actor: a strongly-typed **remoting** proxy (`ActorProxy.Create<T>`), which used DataContract and only worked .NET-to-.NET, and a **non-remoting** proxy (`ActorProxy.Create` returning `ActorProxy`, then `InvokeMethodAsync<TRequest, TResponse>(method, data)`), which used JSON and could cross app boundaries. `Dapr.Actors.Next` collapses this into a single proxy obtained from `IActorProxyFactory`, serialized through `IDaprSerializer` for every call.

```csharp
// Before — remoting (DataContract, .NET-to-.NET only)
var cart = ActorProxy.Create<ICartActor>(ActorId.Create(userId), "CartActor");
await cart.AddItem(item);

// Before — non-remoting (JSON, cross-app; single payload argument)
var cart = ActorProxy.Create(ActorId.Create(userId), "CartActor");
await cart.InvokeMethodAsync<CartItem>("AddItem", item);
var summary = await cart.InvokeMethodAsync<CartSummary>("GetSummary");
```

```csharp
// After — one proxy, injected factory, strongly typed, works cross-app too
public sealed class CheckoutService(IActorProxyFactory proxies)
{
    public async Task Add(string userId, CartItem item)
    {
        var cart = proxies.Create<ICartActor>(ActorId.Create(userId), "CartActor");
        await cart.AddItem(item);
    }
}
```

How this changed:

- The strongly-typed proxy here resembles the old remoting client in calling syntax only. It does **not** use DataContract. Every call, typed or dynamic, serializes with System.Text.Json.
- Prefer the injected `IActorProxyFactory` over the static `ActorProxy.Create<T>(…)` facade. The static facade still exists (and keeps the familiar shape for people coming from `Dapr.Actors.Client.ActorProxy.Create`), but it relies on process-wide mutable state; see [Avoid the static ActorProxy facade]({{< ref "dotnet-actorsnext-howto.md#call-an-actor" >}}).
- Both the generic interface and the actor type name are required on `Create<T>(id, type)`, because one interface can back several actor types (see below). The interface names the contract; the type name selects which registered actor you mean.

{{% alert title="For calls without a compile-time contract, there is a dynamic client" color="primary" %}}
The old non-remoting `InvokeMethodAsync("MethodName", …)` by string maps to `IDynamicActorClient.InvokeAsync(type, id, method, argsJson)`, paired with `IActorRegistry` for discovery. If you used the non-remoting proxy specifically because you did not have the contract at compile time (a gateway, tooling, a cross-language caller), that is now a first-class, documented path rather than an overload of the proxy. See [Dynamic invocation]({{< ref dotnet-actorsnext-dynamic.md >}}).
{{% /alert %}}

## Timers

Timers move from a method on the actor base (`RegisterTimerAsync`) to an injected `IActorTimerScheduler`. The old API took the name of a callback method as a string plus a `byte[]` state blob; the new API takes the target operation name and either a typed argument serialized by the configured actor wire serializer or a caller-provided `byte[]`, and routes the callback to that operation.

```csharp
// Before — callback is a method name string; state is a byte[]; validated by reflection
protected override async Task OnActivateAsync()
{
    await RegisterTimerAsync(
        timerName: "refresh-prices",
        callback: nameof(RefreshPrices),
        callbackParams: Encoding.UTF8.GetBytes(sku),
        dueTime: TimeSpan.FromMinutes(1),
        period: TimeSpan.FromMinutes(5));
}

public Task RefreshPrices(byte[] data) { … }   // 0 or 1 param, must return Task
```

```csharp
// After — inject the scheduler; route to a named operation with a typed argument
[DaprActor("Cart")]
public sealed class CartActor(ActorActivationContext context, IActorTimerScheduler timers)
    : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public async Task AddItem(CartItem item, CancellationToken ct = default)
    {
        await timers.RescheduleAsync(
            actorType: "Cart",
            actorId: Id,
            name: "refresh-prices",
            dueTime: TimeSpan.FromMinutes(1),
            operationName: nameof(RefreshPrices),
            arguments: item.Sku,
            period: TimeSpan.FromMinutes(5),
            cancellationToken: ct);
    }

    public Task RefreshPrices(string sku, CancellationToken ct = default) => Task.CompletedTask;
}
```

Notes: `dueTime` still controls the first firing. Omitting `period` (or setting it to `TimeSpan.Zero` / `Timeout.InfiniteTimeSpan`) makes it one-shot; a positive `period` makes it periodic. `ttl` is optional and, when supplied, must be at least `dueTime`. Cancel with `timers.CancelAsync(actorType, id, name, ct)`. The durability caveat is unchanged: a timer is in-memory and tied to the activation, so it does not survive deactivation or restart.

## Reminders

Reminders are the callback shape that changed the most. In `Dapr.Actors` you implemented `IRemindable.ReceiveReminderAsync` — a single method that received *every* reminder and had to branch on `reminderName` to decide what to do, with the payload as a `byte[]`. In `Dapr.Actors.Next` a reminder is scheduled through `IActorReminderScheduler` and routes directly to a named actor method; there is no `IRemindable` and no central dispatch switch.

```csharp
// Before — implement IRemindable and branch on the name
[Actor(TypeName = "Cart")]
public class CartActor : Actor, ICartActor, IRemindable
{
    public CartActor(ActorHost host) : base(host) { }

    public async Task StartAbandonWatch()
    {
        await RegisterReminderAsync(
            reminderName: "abandon-cart",
            state: Array.Empty<byte>(),
            dueTime: TimeSpan.FromMinutes(30),
            period: TimeSpan.Zero);
    }

    public async Task ReceiveReminderAsync(string reminderName, byte[] state, TimeSpan dueTime, TimeSpan period)
    {
        switch (reminderName)          // one method fans out to many reminders
        {
            case "abandon-cart":
                var cart = await StateManager.GetOrAddStateAsync("cart", new CartState());
                cart.Abandoned = true;
                await StateManager.SetStateAsync("cart", cart);
                break;
        }
    }
}
```

```csharp
// After — schedule through the injected scheduler; the reminder name IS the operation
[DaprActor("Cart")]
public sealed class CartActor(ActorActivationContext context, IActorReminderScheduler reminders)
    : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public async Task StartAbandonWatch(CancellationToken ct = default)
    {
        await reminders.ScheduleAsync(
            actorType: "Cart",
            actorId: Id,
            name: nameof(AbandonCart),   // the reminder name routes to this method
            dueTime: TimeSpan.FromMinutes(30),
            period: TimeSpan.Zero,
            arguments: Array.Empty<byte>(),
            ttl: TimeSpan.FromDays(1),
            overwrite: true,
            cancellationToken: ct);
    }

    public async Task AbandonCart(CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.Abandoned = true;   // no IRemindable, no switch, no explicit save
    }
}
```

How this changed and what to watch for:

- There is no `IRemindable`. Delete the interface and the central `ReceiveReminderAsync` switch; each reminder targets its own method.
- The reminder `name` is both the durable reminder identity **and** the operation routed on callback. Choose a stable name and do not rename it casually. If you rename the method, already-registered reminders keep calling the old operation name until they are re-registered or cancelled.
- Reminder payloads use the same overload pattern as timers: pass a typed value to serialize through the actor wire serializer, or pass `byte[]` when you have already serialized the payload yourself.
- `overwrite` controls whether re-registering an existing name replaces the prior registration; Dapr defaults to overwrite, and `overwrite: false` lets a duplicate registration fail instead.
- Durability is unchanged: reminders survive deactivation and restart and are delivered by the Dapr scheduler.

## Options and reentrancy

`ActorRuntimeOptions` becomes `DaprActorsOptions`, configured through the standard options pattern in the `AddDaprActors` delegate. Most knobs carry over by name; reentrancy is the notable reshape.

```csharp
// Before
builder.Services.AddActors(options =>
{
    options.ActorIdleTimeout = TimeSpan.FromMinutes(30);
    options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(5);
    options.DrainRebalancedActors = true;
    options.ReentrancyConfig = new ActorReentrancyConfig
    {
        Enabled = true,
        MaxStackDepth = 32,
    };
});
```

```csharp
// After
builder.Services.AddDaprActors(options =>
{
    options.ActorIdleTimeout = TimeSpan.FromMinutes(30);
    options.DrainRebalancedActorsTimeout = TimeSpan.FromSeconds(5);
    options.DrainRebalancedActors = true;
    options.EnableReentrancy = true;      // was ReentrancyConfig.Enabled
    options.MaxReentrantDepth = 32;       // was ReentrancyConfig.MaxStackDepth
});
```

Two things to know about reentrancy beyond the renamed properties. First, `Dapr.Actors.Next` propagates the call-chain metadata for you — actor authors no longer touch reentrancy headers (`ActorReentrancyContextAccessor` has no equivalent you call). Second, enabling reentrancy is deliberate: with it off, a call that loops back into an actor already in the chain blocks on the lock the first turn still holds. See [Reentrancy is automatic, but must be enabled]({{< ref "dotnet-actorsnext-howto.md#call-an-actor-from-inside-an-actor" >}}).

Options that no longer exist as such: `UseJsonSerialization` and `JsonSerializerOptions` on the runtime options are gone, because serialization is now the injected `IDaprSerializer` — configure it there instead ([Serialization]({{< ref dotnet-actorsnext-serialization.md >}})). `DaprApiToken` and `HttpEndpoint` are not actor-options concerns in the new model, which talks to the runtime over the gRPC stream.

## Delivery semantics are the same contract — now stated plainly

`Dapr.Actors` actor calls were already at-least-once, and reminders already re-fired until acknowledged; many teams simply did not design for it. `Dapr.Actors.Next` does not change the contract, but it makes it explicit and testable: an invoke can be redelivered, and a reminder re-fires until the handling turn commits, so every actor method, reminder, and subscription handler must be safe to run more than once. Turn-local state changes are safe automatically; external side effects (publishing, calling another actor, charging a card) are your responsibility to make idempotent. Unlike the old world, you can now prove your handlers are re-run-safe in a unit test by injecting the redelivery. See [Delivery guarantees you must design for]({{< ref "dotnet-actorsnext-howto.md#delivery-guarantees-you-must-design-for" >}}).

## Testing

This is less a migration step than an opportunity. On `Dapr.Actors`, exercising an actor meant an integration test against a running sidecar, which made reentrancy, timer-versus-call races, redelivery, and mid-save failures effectively untestable. `Dapr.Actors.Next` ships an in-memory, deterministic `ActorTestRuntime` that drives your real actors through the same generated dispatchers used in production, with virtual time and fault injection, no sidecar required. When you move an actor type, this is the moment to add the unit tests you could not write before. See [Testing]({{< ref dotnet-actorsnext-testing.md >}}).

## Limits that are lifted

Three constraints you may have designed around in `Dapr.Actors` are gone. You do not have to use these, but knowing they exist can simplify a migration and remove old workarounds.

**Multiple parameters on a JSON-invoked method.** The old non-remoting path took a single payload argument (`InvokeMethodAsync<TRequest, TResponse>(method, data)`), so multi-argument operations had to be packed into a wrapper type to be callable that way. In `Dapr.Actors.Next` there is no non-remoting/remoting distinction, and a strongly-typed method may take multiple parameters directly.

```csharp
// Previously often forced into a single wrapper payload; now a natural signature.
Task<Quote> PriceItem(string sku, int quantity, string currency, CancellationToken ct = default);
```

**One interface backing several actor types.** The actor type name, not the interface, is the identity of a registered actor, so more than one `[DaprActor]` class may implement the same `[GenerateActorClient]` interface, each its own actor type with its own state and placement. This makes a shared contract across specialized actors practical.

```csharp
[GenerateActorClient]
public interface IQueueActor : IActor { Task Enqueue(WorkItem item, CancellationToken ct = default); }

[DaprActor]                                   // actor type "OrdersQueueActor"
public sealed class OrdersQueueActor : Actor, IQueueActor { /* … */ }

[DaprActor]                                   // actor type "EmailsQueueActor", same contract
public sealed class EmailsQueueActor : Actor, IQueueActor { /* … */ }
```

**One actor type implementing several interfaces.** The relationship also runs the other way: a single implementation may implement several `[GenerateActorClient]` interfaces — a read side and a write side, or a public contract and an admin one — all served by one actor type with one identity and one set of state. The only rule is that method names must be unique across the contracts, since the runtime routes by method name.

```csharp
[DaprActor("Document")]
public sealed class DocumentActor(ActorActivationContext context)
    : Actor, IDocumentReader, IDocumentWriter
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;
    // Read() and Write() on the two contracts share one activation and one state.
}
```

See [One interface can back several actor types]({{< ref "dotnet-actorsnext-howto.md#one-interface-can-back-several-actor-types" >}}) and [One actor can implement several contracts]({{< ref "dotnet-actorsnext-howto.md#one-actor-can-implement-several-contracts" >}}).

## A suggested migration sequence

1. **Confirm the runtime is on 1.18+** everywhere the actor will run.
2. **Pick one actor type** to move first — ideally one with modest state and few callers.
3. **Create the contract with `[GenerateActorClient]`.** If callers live in other apps, put the interface in a shared assembly both reference.
4. **Rewrite the implementation**: `[DaprActor]`, inject `ActorActivationContext`, override `Id`/`State`, translate `StateManager` calls to `State`, convert timers to `IActorTimerScheduler`, convert reminders to `IActorReminderScheduler` + named methods, drop `IRemindable`, and keep `SaveStateAsync` only where you need a mid-turn durable write.
5. **Verify state readability** with a test that seeds an old-shaped value and reads it under the new code; introduce an upcaster if the shape changed.
6. **Move the callers** of that type to `IActorProxyFactory` so the call and the actor share one serialization format, avoiding a remoting/JSON straddle.
7. **Add unit tests** with `ActorTestRuntime` for the paths you could not test before.
8. **Repeat** for the next type. Keep `Dapr.Actors` referenced for types not yet moved.

## Red-flag checklist

- **Missing attributes.** A `[DaprActor]` with no `[GenerateActorClient]` interface generates nothing, silently. (`DAPR1421`)
- **Changed actor type name.** The type name is part of the durable address; changing it strands existing instances. Keep it identical.
- **Serializer option drift.** State is JSON on both sides, but a different naming policy, enum handling, or a custom old-side serializer can make existing state unreadable. Verify, and use state migration for real shape changes.
- **Remoting/JSON straddle during coexistence.** A Next proxy (JSON) does not line up with an old remoting caller (DataContract). Move an actor type and its callers together.
- **Reminder method renames.** The reminder name is the routed operation; renaming a method leaves registered reminders pointing at the old name.
- **Assuming exactly-once.** Handlers must be safe to run more than once; make external side effects idempotent.
- **Static `ActorProxy` facade.** It works, but its process-wide mutable state is a footgun; inject `IActorProxyFactory` instead.
- **Actors in a referenced project.** Discovery scans only the executing assembly unless you set `DaprActorsScanReferences`.

## Next steps

- [Overview: Dapr Actors (Next)]({{< ref _index.md >}})
- [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}})
- [Serialization]({{< ref dotnet-actorsnext-serialization.md >}})
- [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
- [Tutorial: Dapr.Actors.Next by example]({{< ref "tutorial/_index.md" >}})
</content>
</invoke>
