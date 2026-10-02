---
type: docs
title: "Part 2: Evolving the cart's state"
linkTitle: "2. State Migration"
weight: 162000
description: "A breaking state change becomes a build error and a unit-testable migration, with no database"
---

The second example continues the same cart across a breaking state change. `CartStateV1` stored a flat list of SKUs; `CartStateV2` groups them into line items with quantities, and `CartStateV3` adds a cached total. You ship each new shape with one small upcaster, and old carts fold forward on read with no data backfill.

Code for this part: `/examples/Actor.Next/02-Migration/`.

## What you build

```csharp
public sealed class CartStateV1ToV2 : IActorStateUpcaster<CartStateV1, CartStateV2>
{
    public ValueTask<CartStateV2> UpcastAsync(CartStateV1 state, CancellationToken cancellationToken = default)
    {
        var lines = state.Skus
            .GroupBy(sku => sku, StringComparer.Ordinal)
            .Select(group => new CartLine(group.Key, group.Count()))
            .ToList();

        return ValueTask.FromResult(new CartStateV2 { Lines = lines });
    }
}

public sealed class CartStateV2ToV3 : IActorStateUpcaster<CartStateV2, CartStateV3>
{
    public ValueTask<CartStateV3> UpcastAsync(CartStateV2 state, CancellationToken cancellationToken = default) =>
        ValueTask.FromResult(new CartStateV3
        {
            Lines = state.Lines.ToList(), TotalQuantity = state.Lines.Sum(line => line.Quantity),
        });
}
```

That is the entire migration: one small upcaster per shape change, and the chain composes. The source generator discovers and registers the upcasters; on read the runtime discovers whatever version is stored, folds it up to the shape your code asks for, and re-persists at the current shape lazily on the next save. Nothing in the actor branches on a version.

### Why this is a good example

Two things `Dapr.Actors` had no clean answer for show up here. First, serialization is a single pluggable `IDaprSerializer` path (System.Text.Json by default) rather than the remoting-versus-non-remoting DataContract split, so there is one way data is written regardless of how the actor is called. Second, and more important, the breaking change is caught at build time. The `DAPR1410` analyzer reports a state-type change that would break deserialization of already-persisted data, with a code fix that scaffolds the upcaster or suggests making the change additive, and a missing hop in a longer chain is flagged too (`DAPR1415`).

Migration is opt-in by silence: if you never change a state shape, there is no version to bump and no upcaster to write. You author one only when you actually make a breaking change, and the compiler tells you exactly when that is. Additive changes (new defaultable members) need no upcaster at all, since the generator synthesizes the hop.

For the full model, including the graduation offramp and the integrity guarantees, see [State migration]({{< ref dotnet-actorsnext-statemigration.md >}}).

## The test

```csharp
[Fact]
public async Task GetOrCreateAsync_folds_seeded_v1_to_current_cart()
{
    await using var runtime = CreateRuntime();
    var id = ActorId.Create("cart-v1");
    await runtime.SeedStateAsync("MigratingCart", id, "cart", new CartStateV1 { Skus = ["sku-1", "sku-1", "sku-2"] });
    var cart = CreateCart(runtime, id);

    var read = cart.GetState();
    await runtime.RunToIdle();
    var current = await read;

    Assert.Equal(2, current.Lines.Single(line => line.Sku == "sku-1").Quantity);
    Assert.Equal(3, current.TotalQuantity);
    Assert.Equal(3, runtime.StateOf(cart).Get<CartStateV3>("cart")!.TotalQuantity);
}

private static ActorTestRuntime CreateRuntime()
{
    _ = typeof(MigratingCartActor);
    return new ActorTestRuntime(services => services.AddDaprActors(_ => { }));
}

private static IMigratingCartActor CreateCart(ActorTestRuntime runtime, ActorId id) =>
    runtime.CreateActor<IMigratingCartActor>(id, "MigratingCart");
```

### Why the test matters

The migration test is the proof that the thing you are most afraid of, old data not loading after a deploy, actually loads. You seed the old shape directly into the runtime's store, read it under the current build, and assert the migrated result, all without a real state store and without any production data to be nervous about. The test above already folds the full `V1 -> V2 -> V3` chain in a single read; add cases for an additive change or a graduated entry and the rest of the surface is covered too.

In the old SDK, proving a production data migration was correct meant a staging environment with representative data. Here it is a unit test that runs before any production data is touched. The build-time guard itself is verified as well: the `DAPR1410` analyzer is tested with the analyzer testing harness, so the squiggle you rely on is covered.

## See also

- [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})
- [Testing]({{< ref dotnet-actorsnext-testing.md >}})
- Next: [Part 3: The cart that reacts]({{< ref dotnet-actorsnext-tutorial-pubsub.md >}})
