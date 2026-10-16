---
type: docs
title: "Serialization in the .NET SDK"
linkTitle: "Serialization"
weight: 120000
description: "Pluggable serialization, modern C# type support, and the per-actor state cache"
---

`Dapr.Actors.Next` uses the same pluggable serializer as Dapr State management and Workflows, works with modern C# types out of the box, and retains the per-actor state cache. This page covers those. Evolving state shapes across releases is a separate, deeper topic with its own page: see [State migration]({{< ref dotnet-actorsnext-statemigration.md >}}).

## Pluggable serialization

Actor payloads and state are serialized through `IDaprSerializer`, resolved from dependency injection. The default implementation is `JsonDaprSerializer` (System.Text.Json), and you can replace it without changing any actor code.

```csharp
// Default: System.Text.Json, no configuration required.
builder.Services.AddDaprActors();
```

To plug in a custom serializer, register your own `IDaprSerializer` before `AddDaprActors()`. The actor infrastructure registers the default with `TryAdd`, so an implementation you register first is the one that is used:

```csharp
builder.Services.AddSingleton<IDaprSerializer, MyProtobufSerializer>();
builder.Services.AddDaprActors();
```

To keep the actor path trim- and AOT-safe, register an `IDaprSerializer` backed by a source-generated `JsonSerializerContext` rather than relying on the reflection-based default. Configuring `JsonSerializerOptions` with `Configure<JsonSerializerOptions>(...)` does not reach the actor serializer, because the default `JsonDaprSerializer` is constructed with its own options; register the serializer yourself instead:

```csharp
[JsonSerializable(typeof(CartState))]
[JsonSerializable(typeof(CartItem))]
internal sealed partial class MyActorJsonContext : JsonSerializerContext;

builder.Services.AddSingleton<IDaprSerializer>(new JsonDaprSerializer(
    new JsonSerializerOptions(JsonSerializerDefaults.Web) { TypeInfoResolver = MyActorJsonContext.Default }));
builder.Services.AddDaprActors();
```

For a fully ahead-of-time-compiled host, also register a matching `IActorWireSerializer`, which serializes at the invocation wire boundary, so no reflection-based path remains.

{{% alert title="Why System.Text.Json by default" color="primary" %}}
The generated proxies and dispatchers serialize using only the strongly-typed generic paths with concrete compile-time types, which keeps the whole actor path trim- and AOT-safe. This is the same serializer abstraction used by Dapr State and Workflows, so an application serializes consistently across building blocks.
{{% /alert %}}

### Modern C# types work as written

With the default System.Text.Json serializer, the C# shapes you most likely reach for as payload and state types work with no serialization-specific attributes: records, and classes with a primary constructor, are both fine as-is.

This is a real change from `Dapr.Actors`, whose strongly-typed client uses the Data Contract Serializer. That serializer requires every type to have a public parameterless constructor or be explicitly decorated with `[DataContract]` and `[DataMember]`, and init-only setters need the contract attributes too. A record or a primary-constructor class has no parameterless constructor, so under `Dapr.Actors` you had to add a redundant one or annotate the type. Here you do not:

```csharp
// Works as-is as an actor method payload or state type under the default serializer:
public record CartItem(string Sku, int Quantity);

public sealed class CartState(string ownerId)
{
    public string OwnerId { get; } = ownerId;
    public List<CartItem> Items { get; } = [];
}
```

You still reach for a serializer-specific attribute when you want a specific serializer feature, for example `[JsonPolymorphic]` and `[JsonDerivedType]` for a polymorphic hierarchy, or `[JsonConverter]` for a custom conversion. The point is that you add those to opt into a feature, not to satisfy a constructor requirement the language no longer wants you to meet.

{{% alert title="This guarantee is the default serializer's, not the abstraction's" color="warning" %}}
The compatibility above is a property of System.Text.Json, which is the default `IDaprSerializer`. If you replace the serializer with your own `IDaprSerializer` implementation, these guarantees no longer apply and depend entirely on what your implementation supports: a custom serializer may impose its own constructor, attribute, or type-shape requirements. What holds for everyone is the abstraction; what holds for records and primary constructors specifically is the behavior of the System.Text.Json default. If you swap the serializer, validate your payload and state types against the rules of the serializer you chose.
{{% /alert %}}

## The per-actor state cache

State reads are served from an in-memory, write-behind cache scoped to the activation. Mutations are not written through on every change; instead pending state is saved once at the end of each turn, which minimizes calls to the state store.

```csharp
public async Task AddItem(CartItem item, CancellationToken ct = default)
{
    var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);  // cache hit after first load
    cart.Value.Items.Add(item);                        // mutate through .Value within the turn
    // no Save() needed; the turn saves once when it completes
}
```

You rarely call save explicitly, and multiple mutations in a single method (or across a reentrant call chain within the same turn) collapse into a single write.

{{% alert title="The end-of-turn save interacts with retries" color="primary" %}}
The save is what makes a turn's state changes durable, and the response the SDK sends afterward is the runtime's signal that the turn completed. Those two steps are not a single atomic operation, and invokes are at-least-once, so a turn can be retried after its state was already committed (see [delivery guarantees]({{< ref "dotnet-actorsnext-howto.md#delivery-guarantees-you-must-design-for" >}})). State-only changes are safe under a re-run because they land on the same state; external side effects in the same method are not, and must be made idempotent. Keeping mutations in `State` rather than in side effects is what keeps a turn re-run-safe.
{{% /alert %}}

{{% alert title="The serializer is part of your at-rest contract" color="warning" %}}
State is stored using whatever serializer and settings are configured, so those settings are part of the durability contract, not just a runtime detail. Changing the serializer, or a setting that changes the output shape (enum-as-string versus number, a property naming policy, how nullability or defaults are emitted), can make existing state unreadable even though the CLR type did not change. Treat serializer configuration for state types as a versioned decision: change it deliberately, and if a change would alter the persisted shape, handle it the same way you would a state-shape change, with an upcaster (noting that upcasters do not migrate between serialization configurations) or a compatibility setting. Actor state also lives in a state store with its own value-size limits, so keep per-actor state reasonably sized; the whole state saves as one value per turn.
{{% /alert %}}

## Evolving state shapes: see State migration

When a state type's shape changes between releases, older persisted data must still load under the new code. That is a first-class, opt-in feature with its own page rather than a subsection here, because it carries real depth: upcaster chains, additive auto-generation, a graduation off-ramp, and build-time and run-time integrity guarantees. The short version is that you write one small upcaster per shape change (or none, for additive changes), and the runtime folds stored data up to the shape your code asks for on read, re-persisting lazily. For the full model and best practices, see [State migration]({{< ref dotnet-actorsnext-statemigration.md >}}).

## Best practices

- Register a `JsonSerializerContext` for your actor payloads to stay on the AOT-safe path.
- Keep serializer configuration for state types stable, and treat a change that alters the persisted shape as a versioning decision (see [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})).
- Keep per-actor state reasonably sized, since the whole state saves as one value per turn.
- Keep mutations in `State` rather than in external side effects, so a re-run turn stays safe under at-least-once delivery.

## Next steps

- [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})
- [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}})
- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
