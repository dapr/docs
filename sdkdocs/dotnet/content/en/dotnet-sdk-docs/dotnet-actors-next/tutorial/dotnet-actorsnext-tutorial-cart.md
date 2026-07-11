---
type: docs
title: "Part 1: The cart, the modern baseline"
linkTitle: "1. The cart"
weight: 161000
description: "The actor you already know, with the ceremony removed, and the timer test that no longer needs a sidecar"
---

The first example is the smallest real actor: a cart that adds items, returns a summary, and abandons itself after twenty minutes idle via a timer. It does nothing exotic, and that is the point. It is the side-by-side against `Dapr.Actors` that makes the modernization legible.

Code for this part: `/examples/Actor.Next/01-Cart/`.

## What you build

```csharp
[GenerateActorClient]
public interface ICartActor : IActor
{
    Task AddItem(CartItem item, CancellationToken ct = default);
    Task<CartSummary> GetSummary(CancellationToken ct = default);
    Task AbandonCart(CancellationToken ct = default);
}

public sealed record CartItem(string Sku, int Quantity);
public sealed record CartSummary(int ItemCount, decimal Total, bool Abandoned);

public interface IPricingClient
{
    ValueTask<decimal> GetPriceAsync(string sku, CancellationToken cancellationToken = default);
}

public sealed class CartState
{
    public Dictionary<string, int> Items { get; set; } = [];
    public Dictionary<string, decimal> Prices { get; set; } = [];
    public bool Abandoned { get; set; }
}

[DaprActor("Cart")]
public sealed class CartActor(
    ActorActivationContext context,
    IPricingClient pricing,
    IActorTimerScheduler timers) : Actor, ICartActor
{
    private static readonly TimeSpan AbandonAfter = TimeSpan.FromMinutes(20);

    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    public async Task AddItem(CartItem item, CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.Items[item.Sku] = cart.Value.Items.GetValueOrDefault(item.Sku) + item.Quantity;   // mutate through .Value
        cart.Value.Prices[item.Sku] = await pricing.GetPriceAsync(item.Sku, ct);                     // injected per activation
        cart.Value.Abandoned = false;

        // Re-arm the idle timer on every add; its callback is the AbandonCart method.
        await timers.RescheduleAsync("Cart", Id, "abandon-cart", AbandonAfter, nameof(AbandonCart), string.Empty, cancellationToken: ct);
    }

    public async Task<CartSummary> GetSummary(CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        var itemCount = cart.Value.Items.Values.Sum();
        var total = cart.Value.Items.Sum(entry => entry.Value * cart.Value.Prices.GetValueOrDefault(entry.Key));
        return new CartSummary(itemCount, total, cart.Value.Abandoned);
    }

    public async Task AbandonCart(CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.Abandoned = true;           // saved once at end of turn
    }
}
```

Startup is one line, with no endpoint mapping and no per-actor registration:

```csharp
builder.Services.AddDaprActors();
```

### Why this is the baseline

This carries the whole spine at once. The contract derives from `IActor` and carries `[GenerateActorClient]`, which is what marks it for the generator; `[DaprActor]` on the implementation then produces the proxy and dispatcher with no reflection; the dependency is constructor-injected into a per-activation scope; state is read through the per-actor cache and saved once at end of turn; and actor callbacks arrive over a persistent stream to the runtime rather than through mapped actor-handler endpoints. Nullable annotations are doing real work in the signatures. None of this is new behavior for the actor model; it is the same actor you would write against `Dapr.Actors` with the registration boilerplate, the endpoint mapping, and the reflection-based proxy removed, which is also what makes Native AOT targeting possible.

For the reference detail behind each of these, see [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}}).

## The test

```csharp
[Fact]
public async Task Advancing_virtual_time_fires_the_abandon_timer()
{
    await using var runtime = CreateRuntime();
    var cart = runtime.CreateActor<ICartActor>(ActorId.Create("idle-cart"), "Cart");

    var add = cart.AddItem(new CartItem("sku-1", 1));
    await runtime.RunToIdle();
    await add;

    runtime.Time.Advance(TimeSpan.FromMinutes(20));   // fires the abandon timer; no real wait
    await runtime.RunToIdle();

    var summaryTask = cart.GetSummary();
    await runtime.RunToIdle();
    Assert.True((await summaryTask).Abandoned);
}

private static ActorTestRuntime CreateRuntime()
{
    _ = typeof(CartActor);
    return new ActorTestRuntime(services =>
    {
        services.AddSingleton<IPricingClient, FakePricingClient>();
        services.AddDaprActors(_ => { });
    });
}

private sealed class FakePricingClient : IPricingClient
{
    public ValueTask<decimal> GetPriceAsync(string sku, CancellationToken cancellationToken = default) =>
        ValueTask.FromResult(sku == "sku-1" ? 12.50m : 1.00m);
}
```

### Why the test is the headline

The `Dapr.Actors` version of this test is an integration test: it stands up a sidecar and a state store, registers the actor over HTTP, and then either sleeps twenty minutes or, far more commonly, gives up and never tests the timer at all. The timer path is exactly the kind of thing teams leave untested because the wall clock makes it impractical.

The new version is a sub-second unit test with no infrastructure. The fake `IPricingClient` is injected through the same dependency injection you use in production, and the clock is yours to advance, so the timer fires on demand. A path most teams never test is now trivial to test, and the test has nothing to stand up or tear down so it runs much faster and with lower resource consumption.

For the full testing surface, see [Testing]({{< ref dotnet-actorsnext-testing.md >}}).

## See also

- [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}})
- [Testing]({{< ref dotnet-actorsnext-testing.md >}})
- Next: [Part 2: Evolving the cart's state]({{< ref dotnet-actorsnext-tutorial-migration.md >}})
