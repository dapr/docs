---
type: docs
title: "How to: Author, register, and call actors with the .NET SDK"
linkTitle: "Author and register actors"
weight: 110000
description: "Define actors, let the source generator wire them up, and call them with Dapr.Actors.Next"
---

This article shows how to define an actor, what attributes drive the source generator, the minimum you must register, and how to call actors, including cross-assembly and cross-app scenarios.

## Prerequisites

Dapr runtime v1.18.0 or later, a port on your application for gRPC inbound connections, and the `Dapr.Actors.Next` package. `Dapr.Actors.Next` is a meta-package that brings the runtime, source generators, and analyzers in one reference.

```xml
<ItemGroup>
  <PackageReference Include="Dapr.Actors.Next" Version="..." />
</ItemGroup>
```

{{% alert title="No actor endpoints to map" color="primary" %}}
Unlike `Dapr.Actors`, you do not map actor handler endpoints for the runtime to call into per invocation. The host opens a persistent gRPC connection to the runtime and receives actor callbacks over that stream, so there is nothing like `MapActorsHandlers()` to wire up. The application still exposes its gRPC server port as usual; the runtime continues to use it for its gRPC precondition checks. What changes is how actor callbacks are delivered, not whether the app runs a gRPC server.
{{% /alert %}}

{{% alert title="Package references" color="primary" %}}
All projects within the Dapr .NET SDK repository are referenced using relative paths. As meta-packages like `Dapr.Workflows` or `Dapr.Actors.Next` are only an artifact of the build pipeline, the individual projects in the source code refernce each of the individual projects within the repository (e.g. `Dapr.Actors.Next.SourceGenerators` or `Dapr.Actors.Next.Abstractions`). These packages are not intended to be published to NuGet and only for local SDK experimentation and development. When using this package in your own projects, whether host or test projects, it is intended that you install `Dapr.Actors.Next` from NuGet.
{{% /alert %}}

## Define an actor

An actor has two parts: a contract interface that derives from `IActor` and is decorated with `[GenerateActorClient]`, and an implementation that derives from `Actor` and is decorated with `[DaprActor]`.

```csharp
using Dapr.Actors.Next;

[GenerateActorClient]
public interface ICartActor : IActor
{
    Task AddItem(CartItem item, CancellationToken ct = default);
    Task<CartSummary> GetSummary(CancellationToken ct = default);
}

[DaprActor]
public sealed class CartActor(ActorActivationContext context, IPricingClient pricing) : Actor, ICartActor
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
        return new(cart.Value.Items.Count, await pricing.Total(cart.Value, ct));
    }
}
```

On the `Actor` base, `Id` and `State` are abstract, so each actor supplies them. The established pattern is to inject an `ActorActivationContext` and override the two from it, as shown above. State is accessed by name through `IActorStateAccessor`: a read returns an `IActorState<T>` wrapper whose value you reach through `.Value`, and mutations to `.Value` are saved once at the end of the turn unless you explicitly call `State.SaveStateAsync()` earlier.

### Both attributes are required, and they work together

The two attributes are not interchangeable, and neither is optional.

`[GenerateActorClient]` on the interface is what selects it for the generator. The generator builds its set of actor contracts only from interfaces that both derive from `IActor` and carry `[GenerateActorClient]`; an interface that derives from `IActor` alone is invisible to it. The attribute takes no arguments; it is purely the marker that says "generate a client for this contract."

`[DaprActor]` on the implementation is discovered separately, but a `[DaprActor]` class only becomes a generated actor if it implements one of those `[GenerateActorClient]` interfaces. This is the part that may come as a surprise:

{{% alert title="A [DaprActor] with no decorated interface produces nothing" color="warning" %}}
If a `[DaprActor]` class does not implement an interface marked with `[GenerateActorClient]`, the generator emits nothing for it: no client proxy, no dispatcher, no activation factory, and no registration. The class compiles and looks like an actor, but it is never hosted and cannot be called, with no error to point at. If an actor you defined is simply not working, the first thing to check is that its interface derives from `IActor` and carries `[GenerateActorClient]`. The two attributes are a pair; `[DaprActor]` alone is not enough.
{{% /alert %}}

### What the source generator produces

You write the decorated interface and the decorated implementation; the source generator produces everything needed to host and call the actor, with no reflection at call time.

| You write | The source generator produces |
| --- | --- |
| `[GenerateActorClient]` on `interface ICartActor : IActor` | A strongly-typed client proxy for calling the actor, and the contract's entry in the interface manifest |
| `[DaprActor]` on an implementation of a decorated interface | A dispatcher that routes incoming invocations to your methods |
| `[DaprActor]` on an implementation of a decorated interface | A typed activation factory that constructs the actor from DI |
| `[DaprActor]` on an implementation of a decorated interface | An entry in the generated registration and the actor registry (its type, methods, and signatures) |

You do not implement proxies, dispatchers, or factories, and you do not write registration code per actor.

### One interface can back several actor types

The actor type name, not the interface, is the identity of a registered actor. More than one `[DaprActor]` class may implement the same `[GenerateActorClient]` interface, and each becomes its own distinct actor type with its own name, its own state, its own placement, and its own registration. The shared interface is only the callable shape they have in common.

```csharp
[GenerateActorClient]
public interface IQueueActor : IActor { Task Enqueue(WorkItem item, CancellationToken ct = default); }

[DaprActor]                                   // actor type "OrdersQueue"
public sealed class OrdersQueueActor : Actor, IQueueActor { /* ... */ }

[DaprActor]                                   // actor type "EmailsQueue", same contract, different actor
public sealed class EmailsQueueActor : Actor, IQueueActor { /* ... */ }
```

This is why creating a proxy takes the actor type name as well as the interface (see [Call an actor](#call-an-actor)): the interface names the contract, and the type name selects which registered actor you mean. When several actor types implement one interface, the type name is what chooses among them; a lookup by interface returns all the actor types that implement it, and you pick the one you intend by its type name.

Because the type name is the identity, the implementations that share an interface must each resolve to a distinct name. An analyzer (`DAPR1420`) flags the collision when two actors implementing the same contract would register under the same actor type name, and points you to fix it by giving them distinct `[DaprActor]` names or explicit registration aliases.

### One actor can implement several contracts

The relationship also runs the other way: a single `[DaprActor]` implementation may implement more than one `[GenerateActorClient]` interface, and all of them are served by that one actor type. This is useful when a single entity has distinct facets you would rather express as separate contracts — a read side and a write side, or a public contract and an administrative one — without splitting the entity into separate actors.

```csharp
[GenerateActorClient]
public interface IDocumentReader : IActor
{
    Task<DocumentSummary> Read(CancellationToken ct = default);
}

[GenerateActorClient]
public interface IDocumentWriter : IActor
{
    Task Write(DocumentPatch patch, CancellationToken ct = default);
}

[DaprActor("Document")]
public sealed class DocumentActor(ActorActivationContext context) : Actor, IDocumentReader, IDocumentWriter
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public Task<DocumentSummary> Read(CancellationToken ct = default) => /* ... */;
    public Task Write(DocumentPatch patch, CancellationToken ct = default) => /* ... */;
}
```

The generator produces one strongly-typed proxy per interface (`IDocumentReader` and `IDocumentWriter` each get their own), but the actor is hosted as a single actor type with one registration and one dispatcher that covers the union of every implemented contract's methods. Because there is one actor type, there is one identity, one activation, and one set of state; the interfaces are just different callable shapes over the same actor.

Call it by creating whichever proxy you need, each addressed with the same actor type name:

```csharp
var reader = proxies.Create<IDocumentReader>(ActorId.Create(docId), "Document");
var summary = await reader.Read();

var writer = proxies.Create<IDocumentWriter>(ActorId.Create(docId), "Document");
await writer.Write(patch);
```

Both proxies route to the same activation, so a write through `IDocumentWriter` is visible to a subsequent read through `IDocumentReader` on the same id.

{{% alert title="Method names must be unique across the contracts" color="warning" %}}
The runtime routes an incoming call to an actor by its method name, so the methods across the interfaces a single actor implements must have distinct names. Two contracts on the same actor that both declare a method with the same name collide on the wire, and only one is dispatched. Keep the method names distinct, or, when the two contracts genuinely share an operation, declare it on a common base interface both derive from so it is one method rather than two.
{{% /alert %}}

{{% alert title="Method signatures" color="primary" %}}
Actor interface methods must return `Task`, `Task<T>`, `ValueTask`, `ValueTask<T>`, or `IAsyncEnumerable<T>`, and their parameters and return types must be serializable by the configured serializer. An analyzer (`DAPR1417`) flags methods that don't comply.
{{% /alert %}}

## Register at startup, the minimum

The only required call is `AddDaprActors`. The options delegate is optional.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprActors();          // discovers and wires every [DaprActor] in this assembly

var app = builder.Build();
app.Run();
```

That single call starts the actor host (the persistent `SubscribeActorEvents` streams to the runtime) as a hosted service, registers every discovered actor's proxy, dispatcher, and factory, registers any state upcasters (see [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})), and populates the actor registry.

{{% alert title="Actors are no longer registered by hand" color="primary" %}}
There is no `RegisterActor<T>()` call and no `app.MapActorsHandlers()`. Actors are discovered by the source generator at build time, and the host connects to the runtime over the stream rather than exposing an endpoint. Calling `AddDaprActors()` is enough.
{{% /alert %}}

### Configuring options

```csharp
builder.Services.AddDaprActors(options =>
{
    options.ActorIdleTimeout = TimeSpan.FromMinutes(30);
    // ...
});
```

{{% alert title="There is no lifetime parameter" color="primary" %}}
`AddDaprActors` does not accept a `ServiceLifetime`. An actor's lifetime is its activation, which the runtime owns: it is keyed by id, spans many turns, and ends on deactivation. That is not a DI lifetime, so it is not configurable. The actor instance is constructed per activation in a dedicated DI scope, cached across turns, and disposed together with its scope on deactivation. Your actor's dependencies keep whatever lifetimes you registered them with.
{{% /alert %}}

### Controlling automatic registration

By default, `AddDaprActors()` discovers every `[DaprActor]` in scope and registers it for hosting: it wires the dispatcher and activation factory and advertises the type to the runtime so the runtime delivers callbacks for it. It also discovers and registers every state upcaster. Two options let you turn those automatic behaviors off independently:

```csharp
builder.Services.AddDaprActors(options =>
{
    options.EnableAutoActorRegistration = true;           // default; auto-host discovered [DaprActor] types
    options.EnableAutoStateMigrationRegistration = true;  // default; auto-register discovered upcasters
});
```

The distinction that matters is hosting versus calling. Calling an actor uses a source-generated proxy, obtained from `IActorProxyFactory` (or the static `ActorProxy.Create<T>()` facade), and does not depend on registration; it and `IDynamicActorClient` work as long as the contract is referenced. Registration is what makes this app host a type: advertise it, receive its callbacks, and construct instances. Turning `EnableAutoActorRegistration` off gives you an app that can still call actors but hosts none automatically, which is the gateway half of a dual-mode app.

A single app that runs as a gateway in one mode and hosts actors in another installs `Dapr.Actors.Next` once (both modes need the proxy hardware) and chooses per mode:

```csharp
// Gateway mode: forward calls to actors hosted elsewhere; host nothing here.
builder.Services.AddDaprActors(options =>
{
    options.EnableAutoActorRegistration = false;
    options.EnableAutoStateMigrationRegistration = false;   // hosting nothing, so no state migrations run
});

// Hosted mode: host the discovered actors and receive their callbacks from the runtime.
builder.Services.AddDaprActors();   // defaults: both on
```

In gateway mode no streams are opened to the runtime for hosting, because no type is advertised; the app holds only the calling infrastructure.

### Registering an actor under a custom name

The actor type name is the address the runtime routes on. To choose it explicitly, for example from configuration, register the actor by name in the options:

```csharp
[DaprActor]                                      // attribute required; the name argument is optional
public sealed class QueueActor : Actor, IQueueActor { /* ... */ }

// ...

var queueActorTypeName = builder.Configuration.GetValue("QUEUE_ACTOR_TYPE_NAME", "QueueActor");

builder.Services.AddDaprActors(options =>
{
    options.Actors.RegisterActor<QueueActor>(queueActorTypeName);   // this is what the type is hosted under
});
```

The hosted name resolves by precedence: an explicit alias from `RegisterActor<T>(name)` if you give one, otherwise the name on the `[DaprActor]` attribute if you set one, otherwise the actor implementation's type name. An explicit alias always wins over the other two, and it wins whether or not `EnableAutoActorRegistration` is enabled. With auto-registration off, only the types you register explicitly are hosted; `RegisterActor<T>()` with no name registers the type under its resolved default, which is the attribute name or, failing that, the type-name fallback.

{{% alert title="Keep the [DaprActor] attribute; its name is optional" color="warning" %}}
Aliasing changes the name a type is hosted under; it does not replace the `[DaprActor]` attribute. The attribute is what the source generator uses to produce the proxy, dispatcher, and activation factory, so the type must still carry `[DaprActor]` even when you supply the name elsewhere. The name argument on the attribute is optional, though: if you omit it or leave it blank, the generator falls back to the actor implementation's type name. So when you intend to alias from configuration you can leave the attribute bare, as `[DaprActor]`, and let the alias supply the name. What you must not do is remove the attribute, which would stop the generator from producing anything for that type.
{{% /alert %}}

{{% alert title="A custom name is still a durable address" color="warning" %}}
Choosing the actor type name from configuration is supported, but the name is part of the durable address: state and placement are keyed by it. Changing the name that a set of existing instances was created under makes those instances unreachable under the new name. Treat a configuration-driven name as fixed for the lifetime of the data behind it, and change it only with the same care you would give a data migration.
{{% /alert %}}

### Cross-assembly discovery

By default the generator scans only the executing assembly. If your actors or their state upcasters live in a referenced project, opt in to reference scanning by adding the following to the host application's `.csproj`:

```xml
<ItemGroup>
  <CompilerVisibleProperty Include="DaprActorsScanReferences" />
</ItemGroup>
```

When enabled, the generator discovers and registers `[DaprActor]` types and `IActorStateUpcaster<,>` implementations from referenced assemblies as well, not just from the executing assembly. It is off by default because scanning references increases build time. Note that upcaster discovery is also subject to `EnableAutoStateMigrationRegistration`: if you have turned automatic migration registration off, the scan will not auto-register upcasters, whether they are local or in a referenced project.

## Inject dependencies

Registering the actor infrastructure requires only `AddDaprActors()`, optionally with the options overload. Nothing else is needed to host and run actors:

```csharp
builder.Services.AddDaprActors();
```

Constructor injection into an actor is supported, and any injected service resolves from the actor's per-activation scope and is disposed with it. Injection does require that you register the service yourself: `AddDaprActors()` wires up the actor infrastructure only, and does not register any Dapr building-block clients on your behalf.

For example, to use the state management client inside an actor for application state stores (which are separate from the actor's own `State`), add the `Dapr.StateManagement` package, register `DaprStateManagementClient`, and inject it:

```csharp
builder.Services.AddDaprActors();
builder.Services.AddDaprStateManagementClient();   // from the Dapr.StateManagement package
```

```csharp
[DaprActor]
public sealed class CartActor(ActorActivationContext context, IPricingClient pricing, DaprStateManagementClient stateStores)
    : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;
    // pricing and stateStores resolve per activation, provided you registered them, and are disposed on deactivation
}
```

{{% alert title="Avoid mutable shared state in fields" color="warning" %}}
Because an actor instance is cached across turns, anything captured in a field lives for the whole activation. Holding mutable shared state in a field, especially a captured singleton, breaks turn isolation. Keep per-actor state in `State`, and keep injected services stateless. An analyzer (`DAPR1419`) flags non-readonly fields whose type is not turn-safe.
{{% /alert %}}

## Lifecycle hooks

Override the per-actor lifecycle hooks for setup and teardown. These run on the actor's own turns and are separate from the cross-cutting filter pipeline.

```csharp
[DaprActor]
public sealed class CartActor(ActorActivationContext context) : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    protected override ValueTask OnActivateAsync(CancellationToken ct = default) => /* runs when the instance is activated */;
    protected override ValueTask OnDeactivateAsync(CancellationToken ct = default) => /* runs before deactivation */;
    protected override ValueTask OnPreActorMethodAsync(ActorMethodContext context, CancellationToken ct = default) => /* before each method */;
    protected override ValueTask OnPostActorMethodAsync(ActorMethodContext context, Exception? exception, CancellationToken ct = default) => /* after each method */;
}
```

For cross-cutting concerns that span many actor types, you can implement an `IActorTurnFilter`, but it is rarely the right tool; see the next section.

## Cross-cutting turn filters

An `IActorTurnFilter` wraps every actor turn, across every actor type, as a middleware pipeline around invocation. It applies to a narrow category of work, and most applications never need one.

Reserve a turn filter for concerns that are infrastructural rather than behavioral, and that must apply uniformly across many actor types: enforcing that a tenant or auth header is present before any turn runs, or enriching every turn's trace and metrics. These are things you would otherwise copy into every actor, and that genuinely belong outside any single actor.

Avoid a turn filter for anything else, for several reasons:

- It runs on every turn of every actor type, so it sits on the hot path globally; logic placed there is paid for everywhere, whether or not it is relevant.
- It moves behavior away from the actor. You can no longer read a single actor and understand what a turn does, because part of the behavior lives in a filter the actor never mentions.
- Ordering across multiple filters becomes a subtle, global concern that is easy to get wrong and hard to see.
- Business logic in a filter is harder to discover and harder to test than the same logic in the actor, which you can drive directly with the test runtime.
- The turn pipeline also performs framework work such as context restore and the end-of-turn state save. Heavy or failure-prone logic in a filter shares a lifecycle with that work and can put the integrity of the turn at risk.

For concerns specific to one actor, use that actor's lifecycle hooks (`OnPreActorMethodAsync`, `OnPostActorMethodAsync`, `OnActivateAsync`, `OnDeactivateAsync`) instead; they are discoverable on the actor and testable in isolation. For behavior shared by several actors, prefer composing it into the actors through injected services rather than intercepting their turns.

An analyzer (`DAPR1416`, informational) flags when an `IActorTurnFilter` appears to contain business logic, to keep filters thin and infrastructural.

## Timers and reminders

Register timers and reminders from inside the actor by injecting the scheduler you need. Timers use `IActorTimerScheduler`; durable reminders use `IActorReminderScheduler`.

```csharp
using Dapr.Actors.Next;
using Dapr.Actors.Next.Core.Timers;

[DaprActor("Cart")]
public sealed class CartActor(
    ActorActivationContext context,
    IActorTimerScheduler timers,
    IActorReminderScheduler reminders) : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public async Task AddItem(CartItem item, CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.Items.Add(item);

        // One-shot activation-local timer. If the activation goes away before
        // this fires, the callback is lost.
        await timers.RescheduleAsync(
            actorType: "Cart",
            actorId: Id,
            name: "refresh-prices-once",
            dueTime: TimeSpan.FromMinutes(1),
            operationName: nameof(RefreshPrices),
            arguments: item.Sku,
            cancellationToken: ct);

        // Periodic activation-local timer, limited by TTL.
        await timers.RescheduleAsync(
            actorType: "Cart",
            actorId: Id,
            name: "refresh-prices-periodic",
            dueTime: TimeSpan.FromMinutes(1),
            operationName: nameof(RefreshPrices),
            arguments: item.Sku,
            period: TimeSpan.FromMinutes(5),
            ttl: TimeSpan.FromMinutes(30),
            cancellationToken: ct);

        await reminders.ScheduleAsync(
            actorType: "Cart",
            actorId: Id,
            name: nameof(AbandonCart),
            dueTime: TimeSpan.FromMinutes(30),
            period: TimeSpan.Zero,
            arguments: Array.Empty<byte>(),
            ttl: TimeSpan.FromDays(1),
            overwrite: true,
            cancellationToken: ct);
    }

    public Task RefreshPrices(string sku, CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }

    public async Task AbandonCart(CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.Abandoned = true;
    }
}
```

The durability difference is the thing to design around. A timer is in-memory and tied to the activation: it does not survive deactivation or a process restart, so treat it as a best-effort convenience within a live activation, not a durable schedule. A reminder is durable and delivered by the Dapr scheduler, so it fires even if the actor was idle and had to be reactivated. Use a reminder whenever the wake-up must happen regardless of activation state, and a timer only for work that is fine to lose when the actor deactivates.

A timer registration has both a timer `name` and an `operationName`; the runtime routes the callback to `operationName`. A reminder registration has no separate callback field. The reminder `name` is both the durable reminder identity and the actor operation routed on callback, so choose a stable operation name and do not rename it casually. If the actor method is renamed, any already-registered durable reminders using the old name will continue to call the old operation name until they are updated or canceled. It's recommended to keep the original callback method and have it replace the reminder to directly register the new method.

{{% alert title="Callback names are validated at build time" color="primary" %}}
Because a callback is a string, a typo or a stale name after a rename would otherwise only surface when the timer or reminder fires. Analyzers catch this while you type. A callback must resolve to a method the runtime can dispatch, which means a method on an interface that both derives from `IActor` and carries `[GenerateActorClient]` (a method that exists only on the class, or on an actor interface without `[GenerateActorClient]`, is never dispatched). When the target actor type is defined in this application (or a referenced project), `DAPR1429` flags a callback that matches no dispatchable method (with a code fix that suggests the closest match), and `DAPR1431` flags one that names a method which exists but is not exposed through a `[GenerateActorClient]` contract. When the actor type string cannot be found in this application, `DAPR1430` warns that it may be hosted by another Dapr app and cannot be verified here. All three apply to the timer `operationName` and the reminder `name`.
{{% /alert %}}

Timer and reminder payloads can be scheduled as typed values or as raw `byte[]`. Passing a typed value uses the configured actor wire serializer, so the callback method can declare the matching typed argument. Use the `byte[]` overload when you have already serialized the payload yourself or when the callback takes no payload and you want to pass `Array.Empty<byte>()`.

For timers, `dueTime` controls the first firing. If you omit `period`, or set it to `Timeout.InfiniteTimeSpan` or `TimeSpan.Zero`, the SDK treats the timer as one-shot and cancels it after the callback turn commits. Set a positive `period` to create a periodic timer. `ttl` is optional and limits how long the timer can live; when supplied, it must be greater than or equal to `dueTime`. Cancel a timer with the same actor type, actor id, and timer name:

```csharp
await timers.CancelAsync("Cart", Id, "refresh-prices-periodic", ct);
```

For reminders, `dueTime` controls the first firing and `period` controls repeat firing; use `TimeSpan.Zero` for a one-shot reminder. `ttl` is optional and limits how long the reminder can live. `overwrite` controls whether registering an existing reminder name replaces the previous registration; Dapr defaults this to overwrite, and setting `overwrite: false` lets duplicate registration fail instead. Cancel a durable reminder with the same actor type, actor id, and name:

```csharp
await reminders.CancelAsync("Cart", Id, nameof(AbandonCart), ct);
```

Timer and reminder callbacks arrive over the same actor event stream as normal invokes. The SDK acks the callback only after the actor turn commits and pending state has been saved. For one-shot timers, a successful ack includes `cancel: true` so the runtime does not fire the timer again. Periodic timers and reminders continue according to their registration until canceled, expired by TTL, or replaced. If the handler throws or the stream drops before the ack reaches the runtime, the runtime can redeliver the callback. Keep handlers idempotent, especially when they perform external side effects.

See [Testing]({{< ref dotnet-actorsnext-testing.md >}}) for advancing virtual time to fire timers and reminders in tests. In the in-memory test runtime, `IActorTimerScheduler` and `IActorReminderScheduler` are backed by the virtual time provider, so actor code that schedules either through DI can be tested without a sidecar.

## Saving actor state

Actor state uses an activation-scoped write-behind cache. In the common case, mutate state through `.Value` or `SetAsync`, return from the actor method, and let the runtime save pending changes at the end of the turn:

```csharp
public async Task AddItem(CartItem item, CancellationToken ct = default)
{
    var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
    cart.Value.Items.Add(item);
}
```

Call `State.SaveStateAsync(ct)` only when you need the current changes to reach the underlying state store before the method continues, for example before making an external call that must observe durable actor state:

```csharp
public async Task AddItemAndNotify(CartItem item, CancellationToken ct = default)
{
    var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
    cart.Value.Items.Add(item);

    await State.SaveStateAsync(ct);
    await notifications.CartUpdated(Id.Value, ct);
}
```

After `SaveStateAsync` succeeds, the saved cache entries are marked clean. The end-of-turn save does not write them again unless the actor changes them after the explicit save. Multiple changes before a save still collapse into one write.

`EvictCacheAsync` is different: it evicts cached entries from the current actor activation so the next read goes back to durable state. It does not persist dirty values. By default it rejects dirty cache entries; if you pass `new DaprEvictStateOptions { EvictOnDirtyState = true }`, those dirty in-memory values are discarded.

## Delivery guarantees you must design for

Actor callbacks are at-least-once, and this shapes how you write actor methods. It is worth understanding before you build anything non-trivial, because it is the assumption most likely to be wrong if you carry a mental model of a method that runs exactly once.

An invoke can be redelivered. If the runtime delivered a call but did not receive the response (for example the stream dropped mid-turn), it treats the call as failed and retries it. Because pending actor state is saved at the end of the turn and the response is sent after that save, a retry can re-execute a turn against state the previous attempt already committed. Your actor methods must therefore be safe to run more than once. A method that only reads and mutates actor `State` is naturally safe, because a re-run lands on the same state. A method that also performs an external side effect (publishing an event, calling another actor, charging a card) is exposed, and that side effect must be made idempotent, for example by keying it on a stable request identity or by making the downstream operation naturally idempotent.

A reminder re-fires until it is acked. A durable reminder that comes due is redelivered every second, indefinitely, until the turn that handles it commits. Two conclusions follow from this:
1) Reminder handlers must be idempotent, because you will see the same reminder more than once under any failure or delay. 
2) A reminder handler that reliably throws produces a one-second retry loop for that actor, so treat a consistently failing reminder as something to surface and fix, not to swallow.

{{% alert title="The practical rule" color="primary" %}}
Design every actor method, reminder, and subscription handler to be safe to run more than once. Turn-local state changes are safe automatically; external side effects are not, and are your responsibility to make idempotent. The [test runtime]({{< ref "dotnet-actorsnext-testing.md#fault-injection" >}}) can inject the stream drops and redeliveries that trigger these paths, so you can prove your handlers are re-run-safe in a unit test rather than discovering it in production.
{{% /alert %}}

## Call an actor

Calling an actor has two independent questions: what you know at compile time (which decides between the strongly-typed proxy and the dynamic client), and where you are calling from (a client, or another actor). The actor type name is the addressing key the runtime uses for placement in every case, and serialization is the same `IDaprSerializer` path regardless.

Use the strongly-typed proxy when you have the actor's contract interface available at compile time, which is the common case in application code. It gives you compile-time signature checking and editor completion. Use the dynamic client when the actor type or method exists in another app or not known until run time, for example in a gateway or a tool that calls actors it doesn't reference.

{{% alert title="No remoting/non-remoting proxies, and no DataContract" color="warning" %}}
If you are coming from `Dapr.Actors`, note that the strongly-typed proxy here is not the old remoting client. There is no remoting versus non-remoting distinction, and the form of invocation you choose does not change serialization. Every call, strongly-typed or dynamic, serializes through `IDaprSerializer` (System.Text.Json by default). DataContract is not supported unless you provide a custom `IDaprSerializer`. Pick the proxy or the dynamic client based only on whether you have the contract at compile time; the two are interchangeable from the runtime's point of view.
{{% /alert %}}

### Get a proxy from IActorProxyFactory

The DI-friendly way to obtain a proxy is to inject `IActorProxyFactory` and call `Create<TActor>(id, actorType)`:

```csharp
public sealed class CheckoutService(IActorProxyFactory proxies)
{
    public async Task Add(string userId, CartItem item)
    {
        var cart = proxies.Create<ICartActor>(ActorId.Create(userId), "CartActor");
        await cart.AddItem(item);
    }
}
```

The generic argument is the contract interface; the string is the actor type name you are addressing. Both are needed because a single interface can back more than one actor type (see [One interface can back several actor types](#one-interface-can-back-several-actor-types)), so the interface alone does not identify which registered actor you mean. Pass the type name of the specific actor you intend to call.

There is also a static `ActorProxy.Create<TActor>(...)`, backed by `ActorProxy.Configure(...)` and `ActorProxy.Reset()`, but prefer the injected `IActorProxyFactory` in essentially all application and test code.

{{% alert title="Avoid the static ActorProxy facade" color="warning" %}}
The static `ActorProxy.Create`, `Configure`, and `Reset` are a convenience over process-wide mutable state: `Create<T>()` uses whichever factory was last passed to `Configure(...)`, and `Reset()` clears it. That global state is a footgun. It can leak between tests, bind proxies to the wrong service provider, silently paper over a missing DI registration, and behave unpredictably in a process that runs more than one host or test runtime. Because it is shared and mutable, its behavior depends on call order across your whole process, which is exactly what you do not want from something on the call path.

Inject `IActorProxyFactory` instead. It is scoped to the container that created it, so there is no ambient state to leak or misconfigure, and a missing registration fails loudly rather than resolving to a stale global. The static facade exists for two narrow reasons: an easy entry point when you are genuinely outside DI (a tiny sample, or a spot with no container), and preserving the familiar shape for users coming from `Dapr.Actors.Client.ActorProxy.Create`. The test runtime's `ActorTestRuntime.CreateActor<T>()` is a legitimate controlled use, because it configures the generated factory itself before using it. Outside of cases like those, reach for the injected factory.
{{% /alert %}}

### Call an actor from inside an actor

An actor calls another actor the same way, by injecting `IActorProxyFactory` into its constructor. An actor reads its own identity from the `protected ActorId Id` supplied by activation, which is useful for deriving a target id or passing a correlation:

```csharp
[DaprActor]
public sealed class CartActor(ActorActivationContext context, IActorProxyFactory proxies, IPricingClient pricing)
    : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public async Task Checkout(CancellationToken ct = default)
    {
        var orders = proxies.Create<IOrderActor>(ActorId.Create($"order-{Id}"), "OrderActor");
        await orders.Place(Id, ct);   // Id is this cart's own actor id
    }
}
```

Three things are true of a call made from inside a turn, and two are easy to miss:

- Awaiting the call does not release your turn. The runtime holds this actor's lock for the whole turn, including while you await a call to another actor. The other actor runs its own turn; yours stays open until your method returns.
- The call is at-least-once, like any invoke. If your turn is redelivered (see [delivery guarantees](#delivery-guarantees-you-must-design-for)), the outbound call runs again, so the target must be idempotent or the call must be safe to repeat.
- Reentrancy is handled for you when it is enabled. Actor authors do not manually supply reentrancy headers. When reentrancy is enabled for the actor runtime, `Dapr.Actors.Next` automatically propagates the call-chain metadata across actor calls made during an actor turn, so a chain that re-enters an actor already in the chain (A calls B, B calls back into A) is recognized as reentrant rather than blocking on the lock the first turn still holds.

{{% alert title="Reentrancy is automatic, but must be enabled" color="primary" %}}
The SDK propagates the call-chain metadata for you, but it does not enable reentrancy on its own: the runtime has to allow reentrant delivery in the first place. Turn it on in options with `DaprActorsOptions.EnableReentrancy`, and bound the depth with `DaprActorsOptions.MaxReentrantDepth` so a chain that would exceed the configured depth is stopped rather than recursing without limit. With reentrancy disabled, a call that loops back into an actor already in the chain is not treated as reentrant and will block on the lock the first turn still holds, so enable it deliberately when your call graphs are re-entrant, and leave it off when they are acyclic.

In the in-memory test runtime this works without any sidecar configuration, because the SDK runtime owns the scheduling decision itself; you can exercise reentrant call chains in a unit test directly.
{{% /alert %}}

### Call an actor in another Dapr app

From the caller's side, calling an actor hosted by a different app looks identical to calling one in your own app. You create the same proxy with the same type name and await it; placement routes the call to whichever app hosts that type, and there is no special cross-app client, no endpoint, and no app id to manage in the common case.

```csharp
// Same call, whether "CartActor" is hosted here or in another app:
var cart = proxies.Create<ICartActor>(ActorId.Create(userId), "CartActor");
await cart.AddItem(item);   // placement routes it to wherever "CartActor" lives
```

What makes this work across app boundaries is only how you share the contract:

- Put the actor contract interface, with its `[GenerateActorClient]` attribute, in a shared assembly that both apps reference. Because the attribute travels with the interface, the calling app's own build generates the client proxy from it, even though that app has no implementation.
- The hosting app references the implementation and calls `AddDaprActors()`.
- The calling app references only the contract; it does not host the actor and does not need `EnableAutoActorRegistration`.

Because serialization is the same `IDaprSerializer` path on both sides and not tied to the proxy, the strongly-typed proxy works for cross-app calls too, which the old remoting proxy did not.

{{% alert title="Keep the type name stable" color="warning" %}}
The actor type name is part of the durable address; state and placement are both keyed by it. Choose it deliberately and do not change it, or existing instances become unreachable. To evolve behavior or state, version the state rather than the type name. See [State migration]({{< ref dotnet-actorsnext-statemigration.md >}}).
{{% /alert %}}

### Dynamic invocation

The less common case is calling without a compile-time contract at all. When the actor type or method is not known until run time, such as in a gateway, in admin tooling, in a cross-language caller, or in an agent, call through `IDynamicActorClient` and discover what is callable at runtime through `IActorRegistry`, instead of the strongly-typed proxy. This is a distinct, language-agnostic capability with its own page: see [Dynamic invocation]({{< ref dotnet-actorsnext-dynamic.md >}}).

## Analyzers and diagnostics

The package ships analyzers that catch actor-specific mistakes at build time, several with code fixes. They use the `DAPR14xx` range.

| ID | Flags | Category | Severity |
| --- | --- | --- | --- |
| `DAPR1410` | A state shape change that breaks deserialization of shipped state | Compatibility | Warning |
| `DAPR1411` | Work that escapes the actor scheduler, such as `Task.Run` | Concurrency | Warning |
| `DAPR1412` | A blocking call inside an actor turn | Concurrency | Warning |
| `DAPR1413` | Reading wall-clock time instead of an injected `TimeProvider` | Determinism | Warning |
| `DAPR1414` | An unseeded nondeterministic source, such as `Guid.NewGuid()` or `Random` | Determinism | Warning |
| `DAPR1415` | A state migration target that is unreachable because no upcaster migrates to it | Compatibility | Warning |
| `DAPR1416` | Business logic inside an `IActorTurnFilter` | Design | Info |
| `DAPR1417` | An actor interface method with an unsupported return type | Usage | Warning |
| `DAPR1418` | An in-place change to a shipped actor interface wire contract | Compatibility | Warning |
| `DAPR1419` | Mutable shared state held in an actor instance field | Concurrency | Warning |
| `DAPR1420` | Multiple actors that share a contract register the same actor type name | Usage | Warning |
| `DAPR1421` | A `[DaprActor]` implementation that does not expose a `[GenerateActorClient]` contract | Usage | Warning |
| `DAPR1423` | A state type that looks like part of a migration family but is not connected to it | Compatibility | Warning |
| `DAPR1424` | A gap between ordered fragments in an actor state migration chain | Compatibility | Warning |
| `DAPR1425` | A non-additive state migration step that requires a hand-authored upcaster | Compatibility | Warning |
| `DAPR1426` | An actor state migration family with more than one fold path to a target | Compatibility | Warning |
| `DAPR1427` | One persisted actor state name used with multiple migration families | Usage | Warning |
| `DAPR1428` | Actor code that targets an older state type while a later reachable version exists | Usage | Info |
| `DAPR1429` | A scheduled reminder/timer callback that matches no dispatchable actor method | Usage | Error |
| `DAPR1430` | A scheduled reminder/timer that targets an actor type not found in this application | Usage | Warning |
| `DAPR1431` | A scheduled reminder/timer callback method that is not exposed through a generated actor client | Usage | Error |

## Best practices

- Add only `AddDaprActors()` and let the generator do the rest; register building-block clients such as `DaprStateManagementClient` separately if you use them.
- Keep actor state in `State`, keep fields immutable, and keep injected services stateless.
- Use the strongly-typed proxy when you have the contract at compile time via `IActorProxyFactory`, and reserve `IDynamicActorClient` for gateways and tools that genuinely need late binding.
- Pick the actor type name once and never change it.
- Put `[DaprActor]` on the implementation and derive the contract from `IActor`; do not hand-write proxies or registration.

## Next steps

- [Tutorial Part 1: The cart, the modern baseline]({{< ref dotnet-actorsnext-tutorial-cart.md >}})
- [Serialization]({{< ref dotnet-actorsnext-serialization.md >}})
- [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})
- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
