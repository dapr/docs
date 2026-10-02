---
type: docs
title: "State machine actors in the .NET SDK"
linkTitle: "State machine actors"
weight: 130000
description: "Author long-lived reactive entities as state machines with StateMachineActor, and test them deterministically"
---

Some actors are genuinely state machines: a connection, a device, an auction, a subscription, a lease. Each is a long-lived, addressable entity that reacts to events and moves through explicit states over an indefinite lifetime. `Dapr.Actors.Next` provides a first-class model for these, `StateMachineActor<TState, TData>`, that stays an ordinary strongly-typed Dapr actor on the outside while letting you author the behavior as an explicit state machine on the inside.

## When to use a state machine actor

Reach for this model when an actor has a small number of distinct states and the rules for what it may do depend on which state it is in. Encoding those states and transitions explicitly makes the rules visible, keeps illegal transitions from happening by accident, and (because the machine is a table rather than scattered `if` statements) lets the test runtime check the structure for you.

If an actor is a simple data holder, or its methods do not depend on an explicit lifecycle state, a plain `[DaprActor]` actor is the better choice; the state machine model adds structure you would not be using.

### How it relates to Dapr Workflows

State machine actors and Dapr Workflows solve different problems, and confusing the two is the most common modeling mistake, because a stateful, multi-step thing can look like either at first glance. The distinction is what the unit of work actually is.

A workflow instance is an orchestration: code whose progress is durably tracked by replaying its recorded history. Workflows are strong at orchestrating multiple steps and services, with retries, timeouts, fan-out and fan-in, and potentially compensation when something fails partway. An orchestration can be short- or long-lived; it may loop indefinitely and continue as a new execution to keep its history bounded, so it is not required to run to a single completion.

A state machine actor is an entity: a single addressable thing that lives indefinitely and that many short executions act on. It is strong at holding current state, answering synchronous reads of that state immediately, and reacting to a stream of events over its lifetime.

| Aspect | State machine actor | Dapr Workflow |
| --- | --- | --- |
| Unit of work | A long-lived, addressable entity | An orchestration of steps across services |
| Lifetime | Indefinite; transitions and persists across activations | Long-lived; can loop indefinitely and continue as new executions, so it is not required to terminate |
| Execution | Turn-based, single-threaded turns over persisted state | Code replayed against recorded history, compacted by continuing as new |
| Reading current state | Synchronous, from memory in one turn | Queryable orchestration status |
| Event rate | Handles high-frequency events as cheap turns | Frequent external events grow replay history, mitigated by compaction |
| Orientation | Is the thing others interact with | Orchestrates other work |

The auction is the canonical example of something that looks like a process but is really an entity. It receives a high rate of bids, every bidder needs an instant read of the current high bid, and a last-second bid that extends the deadline races the close timer. A workflow would grow a large replay history under that bid rate, could not answer the synchronous reads cleanly, and would model the timer-versus-bid race awkwardly. A state machine actor handles all of it as ordinary turns.

### How they complement one another

The two compose, and a well-designed system often uses both together, each doing what it is good at.

An entity hands off to a workflow when it enters a state that begins a finite process. When the auction transitions to `Sold`, its entry action starts a fulfillment workflow to charge the winner, notify the losers, and arrange shipping, with compensation if a payment fails. The actor remains the live, addressable entity; the workflow runs the bounded, multi-step orchestration and then ends.

A workflow drives entities as part of its orchestration. A provisioning or order workflow can call actor methods to reserve inventory or update a device, and signal an actor when it completes. The workflow coordinates the steps; the actors are the addressable things those steps act on.

A useful rule of thumb: the reactive, addressable, indefinitely-living thing is a state machine actor, and the finite multi-step process that it launches, or that coordinates it, is a workflow. Named states make the boundary between them clear, because the transition into a state is the natural place to start the workflow that state implies.

## The model

A state-machine actor has a discrete state (`TState`, an enum) and extended state (`TData`, your typed data), both persisted together. You describe the machine in `Configure`, which builds a transition table; that is, a data structure rather than control flow, which the runtime executes.

```csharp
public enum AuctionState { Open, Sold, Expired }

public sealed record AuctionData
{
    public decimal HighBid { get; init; }
    public string? HighBidder { get; init; }
}

[DaprActor("Auction")]
public sealed class AuctionActor(ActorActivationContext context, IActorTimerScheduler timers)
    : StateMachineActor<AuctionState, AuctionData>(context, timers, "Auction", new AuctionData()), IAuctionActor
{
    protected override void Configure(IStateMachine<AuctionState, AuctionData> sm)
    {
        sm.InitialState(AuctionState.Open);

        sm.In(AuctionState.Open)
          .OnEntry(ScheduleSoftClose)                                    // fires only on a live transition into Open
          .On<Bid>()
              .When((d, e) => e.Amount > d.HighBid).Do(AcceptBid)        // internal: stays Open
              .Otherwise().Reply(BidResult.TooLow)                       // guard fallthrough, no transition
          .On<StateMachineTimerFired>()
              .When(ctx => ctx.Event.Name == "soft-close").GoTo(AuctionState.Sold)   // timer fired: OnExit(Open) then OnEntry(Sold)
          .OnExit(CancelSoftClose);

        sm.In(AuctionState.Sold)
          .OnEntry(StartFulfillment)                                     // begins fulfillment (see below)
          .Ignore<Bid>();                                                // late bids dropped, not errored

        sm.OnUnhandled(ctx => throw new InvalidActorEventException(ctx.State, ctx.Event));
    }

    // A command method reifies its payload as an event; the return comes from the matched handler's Reply.
    public Task<BidResult> PlaceBid(Bid bid, CancellationToken ct = default) => Raise<BidResult>(bid, ct);

    private void ScheduleSoftClose(IEffectContext<AuctionState, AuctionData, object> ctx) =>
        ctx.Timers.Schedule("soft-close", TimeSpan.FromSeconds(30));

    private void CancelSoftClose(IEffectContext<AuctionState, AuctionData, object> ctx) =>
        ctx.Timers.Cancel("soft-close");

    private void AcceptBid(IEffectContext<AuctionState, AuctionData, Bid> ctx)
    {
        ctx.Update(d => d with { HighBid = ctx.Event.Amount, HighBidder = ctx.Event.Bidder });
        ctx.Timers.Reschedule("soft-close", TimeSpan.FromSeconds(30));   // resets the soft-close on each bid
        ctx.Reply(BidResult.Accepted);
    }

    private void StartFulfillment(IEffectContext<AuctionState, AuctionData, object> ctx)
    {
        // Where a real deployment starts the fulfillment workflow (charge, notify, ship).
    }
}
```

### Method invocations are events

A command method on the actor interface reifies its payload as an event into the machine; the method's return value is whatever the matched handler replies. Query methods that only read `CurrentState` or `Data` bypass the machine. This is what lets a state-machine actor remain a normal Dapr actor: proxies, the registry, dynamic invocation, and subscription streams all work unchanged.

### Driving timed transitions

A state-machine actor has two ways to fire a transition on a timer, and both are durable across deactivation.

**In-machine timers (used above).** Schedule from inside an effect with `ctx.Timers.Schedule`, `Reschedule`, or `Cancel` (each takes a name and a due time). When the timer comes due it re-enters the machine as a `StateMachineTimerFired` event carrying that name, which you handle like any other event:

```csharp
sm.In(AuctionState.Open)
  .On<Bid>().When((d, e) => e.Amount > d.HighBid)
      .Do(ctx => ctx.Timers.Reschedule("soft-close", TimeSpan.FromSeconds(30)))
  .On<StateMachineTimerFired>()
      .When(ctx => ctx.Event.Name == "soft-close").GoTo(AuctionState.Sold);
```

For a plain state timeout, `.After(timeout)` arms one declaratively; it arrives as `StateTimeout<TState>`, and you re-arm it from an effect with `ctx.Timers.Reschedule(StateMachineConstants.StateTimeoutTimerName, timeout)`:

```csharp
sm.In(AuctionState.Open)
  .After(TimeSpan.FromSeconds(30))
  .On<StateTimeout<AuctionState>>().GoTo(AuctionState.Sold);
```

**Injected schedulers.** Inject `IActorTimerScheduler` (or, for a durable retry-until-ack reminder, `IActorReminderScheduler`) and schedule a callback that targets one of the actor's own methods, which raises a domain event:

```csharp
// inside an effect, using the injected scheduler instead of ctx.Timers:
await timers.RescheduleAsync("Auction", Id, "soft-close", TimeSpan.FromSeconds(30), nameof(Close), arguments: Array.Empty<byte>());

public Task Close(CancellationToken ct = default) => Raise<object?>(new CloseAuction(), ct);
// handled by: sm.In(AuctionState.Open).On<CloseAuction>().GoTo(AuctionState.Sold);
```

Reach for the injected scheduler when you want the timer to raise a specific domain event of your own (rather than the framework's `StateMachineTimerFired`/`StateTimeout`), when you need a durable reminder, or when you share a scheduling path with non-state-machine code. The [auction tutorial]({{< ref dotnet-actorsnext-tutorial-auction.md >}}) uses this second style. Either way, the actor injects an `IActorTimerScheduler` and passes it to the base constructor, because `ctx.Timers` is backed by it.

## DSL reference

| Verb | Meaning |
| --- | --- |
| `InitialState(s)` | The state a freshly created instance starts in. |
| `In(state)` | Begin configuring a state. |
| `OnEntry(a)` / `OnExit(a)` | Actions run on a live transition into or out of the state. |
| `On<TEvent>()` | Handle an event in this state. |
| `.When(pred)` / `.Otherwise()` | Guard chain; first match wins; `Otherwise` is the fallthrough. |
| `.GoTo(state)` | External transition: `OnExit(current)`, then effect, then `OnEntry(target)`. |
| `.Do(effect)` | Run an effect; with no `GoTo` it is an internal transition (stay, no entry/exit). |
| `.Reply(value)` | Supply the invoking method's return value. |
| `.Raise<TEvent>(e)` | Queue an internal event, processed within the same turn. |
| `.Ignore<TEvent>()` | Drop the event with no error and no transition. |
| `.Defer<TEvent>()` | Durable deferral (see below). |
| `.After(timeout)` | Declarative state timeout, delivered as `StateTimeout<TState>` (a named `ctx.Timers` timer instead fires as `StateMachineTimerFired`). |
| `SubstateOf(parent)` | Hierarchy: events unhandled by the child bubble to the parent. |
| `OnUnhandled(h)` | Global fallback for an event no state handles. |

`OnEntry`, `OnExit`, `Do`, and `OnUnhandled` each accept an inline lambda or a method-group delegate over `IEffectContext<…>`. They also accept a `string` effect name, but that form resolves through an `ICapabilityRegistry` and applies to interpreted (data-defined) machines; a compiled `StateMachineActor` throws if it reaches a named effect or guard with no registry.

## Semantics you must know

These three rules are the difference between a correct state-machine actor and a subtly broken one.

Run-to-completion: an event, plus any internally raised events, is processed to a stable state before the next event is accepted. This maps directly onto Dapr's turn-based guarantee.

Silent rehydration: when an idle actor is reactivated, `CurrentState` and `Data` are restored without running `OnEntry` or `OnExit`. Entry and exit actions fire only on live transitions. Anything that must run on every activation belongs in `OnActivateAsync`, not in `OnEntry`; otherwise side effects such as re-arming timers or re-emitting events would fire every time the actor wakes.

Durable deferral: because an incoming event is a method call that must return, `Defer` cannot hold a turn open waiting for a future message, which would deadlock. `Defer<TEvent>()` instead persists the event into the actor's state, returns an accepted or deferred acknowledgment, and re-raises it on the next transition that no longer defers it.

{{% alert title="Effects run inside an at-least-once turn" color="primary" %}}
A method invocation is an event, and like any actor invoke it is at-least-once: a call the runtime could not confirm is retried, which re-runs the turn (see [delivery guarantees]({{< ref "dotnet-actorsnext-howto.md#delivery-guarantees-you-must-design-for" >}})). The transition itself is safe under a re-run, because replaying the same event from the committed state lands in the same place. What is not automatically safe is an effect or entry action that performs an external side effect, such as publishing an event or starting a workflow; a redelivered event can run it twice. Keep effects that mutate `Data` free of external side effects where you can, and make any external effect idempotent, for example by keying a started workflow on a deterministic instance id derived from the actor and the transition rather than a fresh one each time. This is the state-machine form of the same re-run-safety rule that applies to every actor method.
{{% /alert %}}

## Hierarchical states

Declare a parent state to share handlers across several states. An event unhandled by the child bubbles to the parent.

```csharp
sm.In(AuctionState.Open).SubstateOf(AuctionState.Live);
sm.In(AuctionState.Paused).SubstateOf(AuctionState.Live);
sm.In(AuctionState.Live).On<Cancel>().GoTo(AuctionState.Expired);   // applies to Open and Paused
```

## Versioning a state machine

`CurrentState` and `Data` persist together. `Data` evolves through the same upcaster chains described in [Serialization and state migration]({{< ref dotnet-actorsnext-serialization.md >}}). If a deploy removes or renames an enum value that a persisted instance currently occupies, map the stranded state to a legal one in an upcaster on activation; the state-version hook does double duty for the machine's logical position.

## Testing state machine actors

Because the machine is a table, the test runtime can both exercise its behavior deterministically and validate its structure without running it.

### Behavioral testing

Drive events and advance virtual time to test transitions and the order in which turns run, with no sidecar. The soft-close race, where a last-second bid extends the deadline, becomes a plain, repeatable test. The bid and the close-timer firing are two separate turns whose arrival order is not fixed; the runtime never overlaps them, it runs one then the other, and the test asserts the outcome is correct whichever order they run in.

```csharp
[Fact]
public async Task Last_second_bid_extends_close_and_is_not_lost()
{
    await using var rt = new ActorTestRuntime();
    var auction = rt.CreateActor<IAuctionActor>(ActorId.Create("a1"), "AuctionActor");

    await auction.PlaceBid(new Bid(100m, "alice"));
    rt.Time.Advance(TimeSpan.FromSeconds(29));               // just before soft-close
    var late = auction.PlaceBid(new Bid(110m, "bob"));       // a bid turn and a close-timer turn are now both pending
    rt.Time.Advance(TimeSpan.FromSeconds(2));
    await rt.RunToIdle();                                    // scheduler explores the order of the two turns

    Assert.Equal(BidResult.Accepted, await late);
    Assert.Equal(AuctionState.Open, rt.StateOf(auction).CurrentState<AuctionState>());   // not prematurely Sold
}
```

### Structural validation

The transition table can be analyzed directly, so you can catch defects in the machine's shape before it ever runs. `ActorStateMachine.Analyze<TActor>()` inspects the table and reports states no transition can reach, states with no way out, guard branches that can never be selected, and entry/exit ordering problems across hierarchy. `AssertNoStructuralDefects()` turns any finding into a test failure, so a refactor that strands a state breaks the build rather than surfacing in production.

```csharp
[Fact]
public void Auction_machine_is_structurally_sound()
    => ActorStateMachine.Analyze<AuctionActor>().AssertNoStructuralDefects();
```

`Analyze` also returns the full report if you would rather inspect or assert on specific findings than fail on any. Structural analysis is part of the in-memory test runtime; see [Testing]({{< ref "dotnet-actorsnext-testing.md#structural-analysis-for-state-machines" >}}) for how it sits alongside the behavioral, concurrency, and fault-injection tools.

## Best practices

- Use a state machine actor when state-dependent rules are the point; use a plain actor otherwise.
- Put reactivation logic in `OnActivateAsync`, never in `OnEntry`.
- Keep effects small and deterministic; use `IEffectContext.Update` to evolve `Data` and `ctx.Timers` for time.
- Use `Ignore` for events that are legitimately irrelevant in a state, and `OnUnhandled` to make true protocol violations loud.
- Start a workflow from a state's entry action when that state begins a finite, multi-step process; keep the entity itself in the actor.
- Run `ActorStateMachine.Analyze<T>().AssertNoStructuralDefects()` as a unit test so structural regressions fail the build.

## Next steps

- [Tutorial Part 4: The auction]({{< ref dotnet-actorsnext-tutorial-auction.md >}})
- [Tutorial Part 6: Composing interpreted actors with workflows]({{< ref dotnet-actorsnext-tutorial-approvals.md >}}) — the worked example of starting a workflow from a state's entry action
- [Subscription streams]({{< ref dotnet-actorsnext-streams.md >}})
- [Testing actors]({{< ref dotnet-actorsnext-testing.md >}})
