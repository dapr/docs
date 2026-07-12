---
type: docs
title: "Subscription streams in the .NET SDK"
linkTitle: "Subscription streams"
weight: 140000
description: "Drive actors from pub/sub topics with [Subscribe] using Dapr.Actors.Next"
---

Subscription streams let an actor react to messages from an existing Dapr pub/sub component. You annotate an actor method with `[Subscribe]`, and a delivered topic event wakes the actor and invokes that method, much like a timer or reminder firing.

{{% alert title="Package" color="primary" %}}
Subscription streams ship in the `Dapr.Actors.Next.Streams` namespace, included in the `Dapr.Actors.Next` meta-package. It uses Dapr pub/sub and actor invocation as they exist today, so it works against the current runtime with no runtime changes.
{{% /alert %}}

## How it works

The subscription lives at the host, not in the actor body. The package opens a streaming subscription to the topic, receives filtered events, and forwards each one to the target actor as a normal, placement-routed proxy invocation. That invocation is what wakes the actor, wherever placement has put it, and runs it turn-based with all the usual guarantees.

Because the forward is an ordinary invocation, the instance that receives the topic event does not need to host the target actor. An event delivered to one replica can drive an actor placed on another.

## Usage

Annotate an actor method with `[Subscribe]`, naming the pub/sub component, the topic, and how to extract the routing key, which is the actor id that should receive the event.

```csharp
[DaprActor]
public sealed class CartActor(ActorActivationContext context) : Actor, ICartActor
{
    protected override ActorId Id => context.ActorId;
    protected override IActorStateAccessor State => context.State;

    [Subscribe("orders-pubsub", "inventory-restocked", RouteBy = nameof(RestockEvent.CartId))]
    public async Task OnRestock(RestockEvent e, CancellationToken ct)
    {
        var cart = await State.GetOrCreateAsync("cart", () => new CartState(), ct);
        cart.Value.MarkAvailable(e.Sku);
    }
}
```

The only thing you must supply is the routing key, which determines the actor id that gets the event. Everything else, including opening the subscription, deserializing the event, and forwarding the invocation, is generated, so the surface reads as though the actor subscribes directly. The routing key can be a property of the event, a CloudEvents attribute such as `subject`, or a content path.

Subscriptions are generated from your `[Subscribe]` methods, but the streaming host that opens them is a separate service you opt into. Register it alongside actors at startup:

```csharp
builder.Services.AddDaprActors();
builder.Services.AddDaprActorStreams();   // Necessary to register the appropriate types
```

## Delivery semantics

The subscription's acknowledgment is gated on the outcome of the forward invocation, so a message is not acknowledged before the actor has processed it.

- Actor turn succeeds: ack.
- Transient failure: retry.
- Poison message: drop or dead-letter, per the component's configuration.

Single delivery across replicas is provided by the pub/sub component's own consumer and queue semantics; the package does not reinvent fan-out. Each event is delivered to one application instance, which performs one placement-routed invocation to the one target actor.

{{% alert title="Order and hosting are the component's, not the actor's" color="primary" %}}
Two things follow from the subscription living at the host and delivery coming from the pub/sub component. First, ordering is whatever the component provides, which is generally not a total order across events, and the forward-invoke plus placement adds no ordering of its own, so do not assume a handler sees events in publish order. Where order matters, carry a sequence or timestamp in the event and let the actor reconcile, rather than relying on arrival order. Second, an event is only consumed if an instance of the hosting app is running to receive it; the subscription is not durable in the actor. If no host is up, delivery follows the component's retention and redelivery behavior, not the actor's. Combined with at-least-once delivery, this is why `[Subscribe]` handlers must be idempotent and order-tolerant.
{{% /alert %}}

## Tracing

The CloudEvents `traceparent` is extracted from the event and attached to the forward invocation, so the inbound delivery and the actor wake-up appear as a single trace rather than two disjoint ones. The host hop is abstracted away in a trace view as well as in code.

## Testing subscription streams

There is no fake broker to stand up. You drive the subscription runner directly against the in-memory runtime, which exercises the same forward-invoke and `Ack`/`Retry`/`Drop` path the streaming host uses. Describe the subscription, build a runner over the runtime's invocation client, and feed it `ActorStreamEvent`s:

```csharp
private static readonly ActorStreamSubscription Subscription = new(
    "orders-pubsub", "inventory-restocked", "CartActor",
    nameof(ICartActor.OnRestock), nameof(RestockEvent.CartId));

private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);

// The runner forwards a delivered event to the placement-routed actor. It needs the
// runtime's invocation client, which the in-memory runtime exposes internally.
private static ActorStreamSubscriptionRunner Runner(ActorTestRuntime rt)
{
    var invocationClient = (IActorInvocationClient)rt.GetType()
        .GetProperty("Runtime", BindingFlags.Instance | BindingFlags.NonPublic)!
        .GetValue(rt)!;
    return new ActorStreamSubscriptionRunner(
        new ActorStreamForwarder(invocationClient, new ActorStreamRoutingKeyExtractor()),
        new DefaultActorStreamFailureClassifier());
}

private static ActorStreamEvent Event(RestockEvent evt) => new(
    "event-1", "orders-pubsub", "inventory-restocked",
    Encoding.UTF8.GetBytes(JsonSerializer.Serialize(evt, WebJson)),
    new Dictionary<string, string>());
```

```csharp
[Fact]
public async Task Restock_event_routes_to_the_cart_in_its_route_key()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors(_ => { }));
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    var delivery = Runner(rt).ProcessEventAsync(Subscription,
        Event(new RestockEvent { CartId = "u1", Sku = "sku-1" }));
    await rt.RunToIdle();

    Assert.Equal(ActorStreamDeliveryAction.Ack, await delivery);
    Assert.Contains("sku-1", (await cart.GetSummary()).Available);
}

[Fact]
public async Task Transient_failure_is_retried_not_acked()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors(_ => { }));
    _ = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    rt.Faults.FailNextStateWrite<CartState>();   // first delivery fails mid-turn
    var delivery = Runner(rt).ProcessEventAsync(Subscription,
        Event(new RestockEvent { CartId = "u1", Sku = "sku-1" }));
    await rt.RunToIdle();

    Assert.Equal(ActorStreamDeliveryAction.Retry, await delivery);   // retried, not acked
}
```

The types used here (`ActorStreamSubscription`, `ActorStreamSubscriptionRunner`, `ActorStreamForwarder`, `ActorStreamRoutingKeyExtractor`, `DefaultActorStreamFailureClassifier`, `ActorStreamEvent`, and the `ActorStreamDeliveryAction` result) live in the `Dapr.Actors.Next.Streams` namespace.

End-to-end behavior against a real component is validated with the Testcontainers integration suite; see [Testing]({{< ref dotnet-actorsnext-testing.md >}}).

## Best practices

- Choose a routing key that is stable and present on every event for the topic; an event with no resolvable key cannot be routed.
- Keep `[Subscribe]` handlers idempotent. Delivery is at-least-once, and a retried message may be reprocessed.
- Treat a subscription handler like any other turn: keep it short and let it transition state. For state-machine actors the event flows into the machine exactly like any other event.
- Rely on the component's delivery and ordering guarantees rather than building your own fan-out.

## Next steps

- [Tutorial Part 3: The cart that reacts]({{< ref dotnet-actorsnext-tutorial-pubsub.md >}})
- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
