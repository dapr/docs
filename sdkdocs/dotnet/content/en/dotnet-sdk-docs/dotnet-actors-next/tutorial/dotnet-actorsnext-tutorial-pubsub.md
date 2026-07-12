---
type: docs
title: "Part 3: The cart that reacts"
linkTitle: "3. Pub/sub"
weight: 163000
description: "Dynamic pub/sub in one attribute, and an event-driven flow proven without a broker"
---

The third example continues the cart. An inventory service publishes `inventory-restocked` events, and a cart waiting on an out-of-stock item should wake and mark it available. The subscription is declared on the actor method, and the event names which cart gets it.

Code for this part: `/examples/Actor.Next/03-PubSub/`.

## What you build

```csharp
[DaprActor("RestockingCart")]
public sealed class RestockingCartActor(ActorActivationContext context) : Actor, IRestockingCartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    [Subscribe("orders-pubsub", "inventory-restocked", RouteBy = nameof(RestockEvent.CartId))]
    public async Task OnRestock(RestockEvent evt, CancellationToken ct = default)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new RestockingCartState(), ct);

        // Delivery is at-least-once, so this must be safe to run more than once:
        // removing first makes a duplicate delivery a no-op after the first success.
        if (cart.Value.WaitingForStock.Remove(evt.Sku))
        {
            cart.Value.Available.Add(evt.Sku);
        }
    }
}
```

The host wires these subscriptions from `[Subscribe]` when you register the streams host alongside actors:

```csharp
builder.Services.AddDaprActors();
builder.Services.AddDaprActorStreams(); // Available in `Dapr.Actors.Next` NuGet package
```

### Why the dynamism matters

There is one declarative subscription, but it fans out to whichever cart instance the event's `CartId` names, across the whole cluster, with no per-instance wiring. The host owns the subscription; the routing key picks the actor id at delivery time; and placement routes the wake-up to wherever that cart lives, so an event received on one replica can drive a cart on another. The delivery edges come along for free: the acknowledgment is gated on the turn outcome, so a successful turn acks, a transient failure retries, and a poison message deadletters, and the CloudEvents `traceparent` is joined onto the wake-up invoke so the inbound event and the actor turn appear as one trace.

In `Dapr.Actors` there was no answer for this at all. You stood up a separate subscriber service, received the event there, looked up the right actor id by hand, called the proxy yourself, and owned retry and idempotency on your own. Here it is one attribute and the field that names the target.

The one caveat to state plainly: delivery is at-least-once, so the handler must be idempotent, which is why `OnRestock` is written to be safe to apply twice. That is the same contract that governs reminders and retried invokes, surfaced again here.

For the reference detail, see [Subscription streams]({{< ref dotnet-actorsnext-streams.md >}}).

## The tests

```csharp
private static readonly ActorStreamSubscription Subscription =
    new("orders-pubsub", "inventory-restocked", "RestockingCart", nameof(IRestockingCartActor.OnRestock), nameof(RestockEvent.CartId));
private static readonly JsonSerializerOptions WebJsonOptions = new(JsonSerializerDefaults.Web);

[Fact]
public async Task Publishing_one_event_wakes_only_the_named_cart()
{
    await using var runtime = CreateRuntime();
    var named = runtime.CreateActor<IRestockingCartActor>(ActorId.Create("cart-1"), "RestockingCart");
    var other = runtime.CreateActor<IRestockingCartActor>(ActorId.Create("cart-2"), "RestockingCart");
    await AddSku(runtime, named, "sku-1");
    await AddSku(runtime, other, "sku-1");

    var delivery = Runner(runtime).ProcessEventAsync(Subscription, Event(new RestockEvent("cart-1", "sku-1")));
    await runtime.RunToIdle();
    var action = await delivery;

    Assert.Equal(ActorStreamDeliveryAction.Ack, action);
    Assert.True(await IsAvailable(runtime, named, "sku-1"));
    Assert.False(await IsAvailable(runtime, other, "sku-1"));
}

[Fact]
public async Task Transient_state_write_fault_retries_delivery_instead_of_acknowledging()
{
    await using var runtime = CreateRuntime();
    var cart = runtime.CreateActor<IRestockingCartActor>(ActorId.Create("cart-retry"), "RestockingCart");
    await AddSku(runtime, cart, "sku-1");

    runtime.Faults.FailNextStateWrite<RestockingCartState>();
    var firstDelivery = Runner(runtime).ProcessEventAsync(Subscription, Event(new RestockEvent("cart-retry", "sku-1")));
    await runtime.RunToIdle();
    var first = await firstDelivery;
    var secondDelivery = Runner(runtime).ProcessEventAsync(Subscription, Event(new RestockEvent("cart-retry", "sku-1")));
    await runtime.RunToIdle();
    var second = await secondDelivery;

    Assert.Equal(ActorStreamDeliveryAction.Retry, first);
    Assert.Equal(ActorStreamDeliveryAction.Ack, second);
    Assert.True(await IsAvailable(runtime, cart, "sku-1"));
}

private static ActorTestRuntime CreateRuntime()
{
    _ = typeof(RestockingCartActor);
    return new ActorTestRuntime(services => services.AddDaprActors(_ => { }));
}

private static ActorStreamSubscriptionRunner Runner(ActorTestRuntime runtime)
{
    var invocationClient = (IActorInvocationClient)runtime.GetType().GetProperty("Runtime", BindingFlags.Instance | BindingFlags.NonPublic)!.GetValue(runtime)!;
    return new ActorStreamSubscriptionRunner(
        new ActorStreamForwarder(invocationClient, new ActorStreamRoutingKeyExtractor()),
        new DefaultActorStreamFailureClassifier());
}

private static ActorStreamEvent Event(RestockEvent evt) =>
    new("event-1", "orders-pubsub", "inventory-restocked", Encoding.UTF8.GetBytes(JsonSerializer.Serialize(evt, WebJsonOptions)), new Dictionary<string, string>());

private static async Task AddSku(ActorTestRuntime runtime, IRestockingCartActor cart, string sku)
{
    var add = cart.AddUnavailableSku(sku);
    await runtime.RunToIdle();
    await add;
}

private static async Task<bool> IsAvailable(ActorTestRuntime runtime, IRestockingCartActor cart, string sku)
{
    var read = cart.IsAvailable(sku);
    await runtime.RunToIdle();
    return await read;
}
```

There is no fake broker to stand up: `Runner` drives the same forward-invoke and `Ack`/`Retry`/`Drop` path the streaming host uses, built over the runtime's internal invocation client. `AddUnavailableSku` and `IsAvailable` are ordinary actor methods; the helpers just call them and drain the turn with `RunToIdle`. The stream types (`ActorStreamSubscription`, `ActorStreamSubscriptionRunner`, `ActorStreamForwarder`, `ActorStreamRoutingKeyExtractor`, `DefaultActorStreamFailureClassifier`, `ActorStreamEvent`, and the `ActorStreamDeliveryAction` result) live in `Dapr.Actors.Next.Streams`.

### Why the tests matter

Pub/sub-driven behavior is exactly the kind of thing that, in the old SDK, you could only exercise with a real broker in an integration test, slow enough that most teams test the handler in isolation and never test that the wiring routes and retries correctly. The glue between an event arriving and the right actor reacting once is the part most likely to be wrong, and it was the part hardest to test.

Here both halves are plain unit tests. The first proves the dynamic routing is precise: one event wakes only the cart it names. The second proves the delivery edge teams almost never test: a failed turn retries the delivery instead of acking it, and the redelivery then acks once the write succeeds. The runtime stands in for the broker, so you feed an event through the subscription runner and inspect the delivery action it returns, with no Redis, no Kafka, and no Docker.

## See also

- [Subscription streams]({{< ref dotnet-actorsnext-streams.md >}})
- [Testing]({{< ref dotnet-actorsnext-testing.md >}})
- Next: [Part 4: The auction]({{< ref dotnet-actorsnext-tutorial-auction.md >}})
