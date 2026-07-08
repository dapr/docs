---
type: docs
title: "State migration in the .NET SDK"
linkTitle: "State migration"
weight: 125000
description: "Evolve actor state safely across releases with upcaster chains, additive auto-generation, and a graduation offramp"
---

Actors have no replay, so they have no code-versioning problem: a new deployment simply is the new behavior. The only thing that must survive a deploy is the actor's persisted state, so migration here means one specific thing, keeping state written under an older shape loadable and usable under newer code. It is deserialization compatibility on read, not a workflow-style code-version system.

The feature is opt-in by default. If a state type's shape does not change, there is nothing to migrate and no machinery to configure; the type behaves exactly as it does today. You enroll a type in migration only by authoring an upcaster that touches it, or by letting the generator synthesize a trivial additive upcaster.

## The mental model

Five ideas carry the whole feature.

- Nodes: each versioned shape of a state type is a node, such as `CartState`, `CartStateV2`, `CartStateV3`.
- Hops: an `IActorStateUpcaster<TFrom, TTo>` is a directed edge from one node to the next. Hops are the only migration code you write, and additive hops can be generated for you.
- Families: a family is the connected set of nodes reachable from each other through hops (the `CartState` family is `{CartState, CartStateV2, CartStateV3}`). An actor can persist several independent named entries, each its own family; families never collide.
- Current is the type your code asks for: when you read `GetOrCreateAsync<CartStateV3>("cart", ...)`, the runtime discovers whatever is stored, folds it up to `CartStateV3`, and hands you that.
- Lazy re-persist: folding happens on read, in memory. The migrated value is written back only on the next save, the actor's normal end-of-turn flush. Over time the store heals to the current shape with no bulk migration job.

## Authoring: write the hops, nothing else

You write one upcaster per shape change. Upcasters are resolved from dependency injection, so a hop may take an injected service as a constructor parameter, and they are async (`UpcastAsync` returns a `ValueTask`).

```csharp
// The shapes.
public sealed class CartStateV1 { public List<string>   Skus  { get; init; } = []; }
public sealed class CartStateV2 { public List<CartLine> Lines { get; init; } = []; }
public sealed class CartStateV3 { public List<CartLine> Lines { get; init; } = []; public int TotalQuantity { get; init; } }
public sealed record CartLine(string Sku, int Quantity);

// The hops: the only migration code you write.
public sealed class CartStateV1ToV2 : IActorStateUpcaster<CartStateV1, CartStateV2>
{
    public ValueTask<CartStateV2> UpcastAsync(CartStateV1 s, CancellationToken ct = default) =>
        ValueTask.FromResult(new CartStateV2
        {
            Lines = s.Skus.GroupBy(x => x, StringComparer.Ordinal)
                          .Select(g => new CartLine(g.Key, g.Count())).ToList(),
        });
}

public sealed class CartStateV2ToV3 : IActorStateUpcaster<CartStateV2, CartStateV3>
{
    public ValueTask<CartStateV3> UpcastAsync(CartStateV2 s, CancellationToken ct = default) =>
        ValueTask.FromResult(new CartStateV3 { Lines = s.Lines.ToList(), TotalQuantity = s.Lines.Sum(l => l.Quantity) });
}
```

The actor contains no migration logic. It reads and writes the current shape, and the folding happens underneath:

```csharp
[DaprActor("MigratingCart")]
public sealed class MigratingCartActor(ActorActivationContext context) : Actor, IMigratingCartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    // Whatever version is stored (V1/V2/V3) folds up to CartStateV3 transparently,
    // and re-persists at the current shape on the next save.
    public async Task<CartStateV3> GetState(CancellationToken ct = default) =>
        (await State.GetOrCreateAsync("cart", () => new CartStateV3(), ct)).Value;

    public Task Clear(CancellationToken ct = default) => State.RemoveAsync("cart", ct).AsTask();
}
```

Upcasters are discovered and registered for you by the source generator (subject to `EnableAutoStateMigrationRegistration`, see [Author, register, and call actors]({{< ref "dotnet-actorsnext-howto.md#controlling-automatic-registration" >}})); you do not register them by hand.

{{% alert title="Keep upcasters pure and deterministic" color="warning" %}}
An upcaster may take injected dependencies, but its body must be pure and deterministic: no wall-clock time, no randomness, no external side effects. This is not stylistic. Invokes are at-least-once, so a turn that folds-and-flushes can be re-run after a mid-flight failure, and only a deterministic upcaster produces the identical result on a re-run, which is what makes re-migration idempotent. The determinism analyzers (`DAPR1413` for wall-clock time, `DAPR1414` for unseeded randomness) apply to upcaster bodies for exactly this reason. Ensuring that non-deterministic functionality is not injected and used in the upcaster is ultimately the responsibility of the developer; by making injection available, the SDK cannot detect all non-deterministic usage.
{{% /alert %}}

## Additive changes need no upcaster

If a new version only adds members, and those new members are all defaultable, the generator synthesizes the hop for you: it copies the shared members and defaults the new ones. You write the new shape and nothing else.

```csharp
public sealed class MyState   { public string Name { get; init; } = ""; }
public sealed class MyStateV2 { public string Name { get; init; } = ""; public int  Age    { get; init; } }
public sealed class MyStateV3 { public string Name { get; init; } = ""; public int  Age    { get; init; } public bool Active { get; init; } }
// No upcasters authored. The generator slots MyState as the origin, orders the chain, and emits
// MyState -> MyStateV2 and MyStateV2 -> MyStateV3 automatically.
```

Non-additive changes (renames, removals, restructures, or a cross-name shift like `CartStateV3` to `ShoppingCartV4`) cannot be synthesized. You author those hops, and an analyzer offers a scaffold when one is missing.

## Reading and writing state

The state accessor migrates by default; the ordinary read and write methods do the folding and enrollment for you.

| Method | Behavior |
| --- | --- |
| `TryGetAsync<T>(name, ct)` | Reads and folds stored data up to `T`. Legacy or plain bytes are returned as `T`. Returns `null` when nothing is stored. |
| `GetOrCreateAsync<T>(name, factory, ct)` | As above, or creates a new value from `factory` when nothing is stored. |
| `SetAsync<T>(name, value, ct)` | Writes `value` and auto-enrolls it at `T`'s node. There is no schema-version parameter; the discriminator is derived from the graph. |
| `GraduateAsync<T>(name, ct)` | The offramp: folds to `T`, writes it plain, and stops enrolling this entry. Works even when migration is disabled. |
| `RemoveAsync(name, ct)` | Deletes the entry. |

{{% alert title="Actor code never sees the stored version" color="primary" %}}
Reads surface only the migrated value. There is deliberately no `SchemaVersion` on the returned state, because version-conditional branching in actor code is the anti-pattern migration exists to remove; that logic belongs in an upcaster. If you need to confirm that a fold happened, assert it in a test with the state snapshot API (see [Testing]({{< ref dotnet-actorsnext-testing.md >}})) rather than reading a discriminator at run time. Writing branchy `if (version == 2)` code against your state is a sign a hop is missing.
{{% /alert %}}

### Importing external legacy data

To seed a legacy-shaped value that arrived from outside the store (an HTTP body, a bulk import, another system), write it with `SetAsync`, which accepts any node type in a family, not only the latest:

```csharp
await State.SetAsync("cart", legacyV1Value, ct);   // enrolls at V1's node
// the next read folds it forward to the current shape, lazily.
```

## Naming and ordering: the versioning strategy

How a type name maps to a family and an order is a compile-time concern, used by the generator and the analyzer. It is pluggable and configured application-wide, and follows the same version-naming conventions used elsewhere in Dapr for consistency.

```csharp
// Program.cs: pick how version names are parsed and ordered, app-wide.
builder.Services.UseActorStateVersioning<NumericVersionStrategy>();   // "V{N}" suffix, the default
```

The strategy parses a type name into a canonical family name plus a version and orders versions; the built-in `NumericVersionStrategy` maps `CartStateV3` to family `CartState` at version `3`, and treats an unnumbered origin like `CartState` as version `0` that sorts first. `SemVerVersionStrategy` and `DateVersionStrategy` are also provided, and you can write your own.

Edges win. An explicit upcaster edge is authoritative for family membership; the strategy is only the convention used to derive families, order, and additive hops when edges are absent. So names that follow the convention need nothing, and if two types should be one family but their names would split them, authoring a hop between them connects them regardless of naming. You almost never need an explicit override; the rare case is supplying a version for a name the strategy cannot parse, or selecting a different strategy for one family.

## Opt-outs and the off-ramp

There are three levels of control, from letting the SDK do everything to leaving the feature entirely.

Full auto is opting out of authoring: for additive-only families, write no upcasters and let the generator synthesize them. You are still using migration.

Full disable is opting out of migration: a switch on `DaprActorsOptions` turns the feature off, so values are stored plain with no envelope enrichment and no auto-generation. Reads stay tolerant, so they can still read anything already written, which makes the switch safe to flip.

Graduation is the per-entry offramp. `GraduateAsync<T>(name, ct)` folds the entry to `T`, writes it plain (no discriminator), and stops enrolling that entry. It is per state name, not all-or-nothing, and it always works, even when migration is globally disabled, because it is the reliable way to leave the feature. Once every instance of an entry has graduated, you can delete its upcasters.

{{% alert title="Graduation is reversible" color="primary" %}}
The plain form is pinned to the CLR type you graduated to, so re-enrolling later is just adding a new version and an upcaster from that type (`CartStateV3` to `CartStateV4`): reads deserialize the plain bytes as the graduated type and resume the chain, with that type as the new origin. A store holding a mix of plain and re-enveloped instances is read correctly with no extra work, so graduating is not a one-way door.
{{% /alert %}}

## Safety: what the SDK guarantees, and what you must not do

The single rule you must follow is append-only: you add new nodes and hops to a chain and never re-edit one that has already shipped. A hop may do anything internally (add, rename, remove, retype, restructure); what must not change is a node or hop that already shipped, because persisted instances may already have been written under it.

The SDK backs that rule with two lines of defense.

At build time, the generator fingerprints every node shape and every upcaster into the project baseline (the committed `DaprActorsNext.Shipped.txt` and `DaprActorsNext.Unshipped.txt` files that the `DAPR1410` shape guard reads). If a superseded node or an already-used upcaster diverges from the committed baseline, you get a warning that you modified something already participating in migration, which risks corrupting persisted state. Updating the committed baseline is your deliberate acknowledgment that you meant to. The check is intentionally conservative, since the generator cannot see the dev/production boundary, so it treats any change to a node as risky.

At run time, each stored value carries a structural fingerprint of its node's shape. If the stored fingerprint no longer matches the current build's shape for that node, the value was written under a different shape of that node, and the runtime throws rather than silently deserializing stale data into a mismatched shape. Failing loud is the correct outcome here: silent partial deserialization is precisely the production incident this feature exists to prevent.

Renames are caught from the other direction. Renaming an older type does not change its shape, so it does not trip the fingerprint guard; instead it breaks graph connectivity, the renamed type is no longer reachable to the target, which the analyzer surfaces as a missing hop or an unconnected type.

{{% alert title="Rollback is safe-fail, not first-class" color="warning" %}}
Rolling an older build back onto newer state it cannot interpret is safe but not supported as a working path: the read fails loud and the turn does not persist, so you get a safe, non-corrupting failure rather than a silent downgrade. If you need to support running an older build against newer data, plan for it explicitly (for example by keeping changes additive) rather than assuming a rollback will transparently read forward-written state.
{{% /alert %}}

## Analyzers

Migration correctness is enforced primarily at build time, and the diagnostics live in the actors `DAPR14xx` range alongside the shape-baseline (`DAPR1410`), broken-chain (`DAPR1415`), and determinism (`DAPR1413`, `DAPR1414`) analyzers. See the [diagnostics reference]({{< ref "dotnet-actorsnext-howto.md#analyzers-and-diagnostics" >}}) for the assigned IDs.

Build-time guidance covers the situations you will actually hit: a missing hop to a target you use in state (with a code fix that scaffolds the upcaster, pre-filling shared and additive members), a type that looks like it belongs to a family but is not fully connected, a gap in the middle of a chain, a non-additive step that cannot be auto-generated, an ambiguous fold path where several origins or a diamond make the path non-unique, and the corruption guard described above. Because the analyzer and the generator share the same version-parsing and fingerprinting helpers, build-time guidance and generated output never disagree, and IDE hints show which family a type participates in so the (now implicit) migration behavior stays discoverable.

## Testing

Migration is deterministically testable in-memory with `ActorTestRuntime`, with no sidecar and no state store.

```csharp
[Fact]
public async Task V1_cart_folds_to_current_on_read()
{
    await using var rt = new ActorTestRuntime();
    await rt.SeedStateAsync("MigratingCart", ActorId.Create("u1"), "cart",
        new CartStateV1 { Skus = ["sku-1", "sku-1", "sku-2"] });

    var cart = rt.CreateActor<IMigratingCartActor>(ActorId.Create("u1"), "MigratingCart");
    var state = await cart.GetState();

    Assert.Equal(3, state.TotalQuantity);   // folded V1 -> V2 -> V3
}
```

`SeedStateAsync` plants either enveloped or plain forms directly in the in-memory store, so you can seed a "V1" instance and assert the actor reads it back at the current shape. The fault injector adds hooks during a migrating read and between hops (`FailNextMigration<T>()`, `FailNextUpcastHop<TFrom, TTo>()`) so the failure paths through the fold are unit-testable, and the state snapshot API handles both enveloped and graduated forms so a test can assert the store healed to the current node after a migrating read and flush. A useful test matrix is fold-by-default, an auto-generated additive chain, the corruption guard, multi-family isolation within one actor, exactly-one re-persist at the target, a `SetAsync` import that then folds, graduation followed by re-import, a fault during migration, and the full-disable opt-out. See [Testing]({{< ref dotnet-actorsnext-testing.md >}}) for the runtime surface.

## Interpreted actors

Interpreted (runtime-defined) actors carry a dynamic state bag rather than typed CLR shapes, so typed upcasters do not apply to them. Their state travels the plain path and is versioned, if at all, as the version of the machine-definition document. The migration system never assumes all state is typed, so this composes without special handling; see the tutorial's [runtime-defined state machines]({{< ref dotnet-actorsnext-tutorial-interpreted.md >}}) part.

## Best practices

- Prefer additive changes (new defaultable members), which need no upcaster at all.
- When a change is not additive, add one hop per shape change and let the chain compose; keep each hop small.
- Keep upcasters pure and deterministic, and let them take injected dependencies rather than reaching for ambient state.
- Never re-edit a node or hop that has shipped; add a new node and a new hop instead, and commit the updated baseline deliberately when the analyzer flags a change.
- Keep version-conditional logic out of actor code; a branch on version is a missing hop.
- Retire an old version only after its instances have been read forward (and so re-persisted) or drained; keep older shapes and their hops as long as instances written under them may still exist.
- Use graduation to take an entry off the feature cleanly, and remember it is reversible if you need to re-enroll later.
- Remember that upcasting exclusively happens lazily - state is only migrated when it is retrieved by an actor; migration never runs against the entirely of state written by the actor in its state store.

## Next steps

- [Serialization]({{< ref dotnet-actorsnext-serialization.md >}})
- [Tutorial Part 2: Evolving the cart's state]({{< ref dotnet-actorsnext-tutorial-migration.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
