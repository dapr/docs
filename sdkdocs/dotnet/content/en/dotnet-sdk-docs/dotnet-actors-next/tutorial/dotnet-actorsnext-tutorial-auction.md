---
type: docs
title: "Part 4: The auction"
linkTitle: "4. The auction"
weight: 164000
description: "A state machine, and the previously untestable timer-versus-message race written as a deterministic unit test"
---

The fourth example is the live auction: open and accepting bids, with a soft-close timer that each accepted bid resets; when it fires the auction transitions to sold and marks fulfillment as started. It looks like a workflow and is not, which is exactly what we're seeking to illustrate. This is the example where the test is unambiguously the headline.

Code for this part: `/examples/Actor.Next/04-Auction/`.

## What you build

```csharp
[GenerateActorClient]
public interface IAuctionActor : IActor
{
    Task<BidResult> PlaceBid(Bid bid, CancellationToken cancellationToken = default);
    Task Close(CancellationToken cancellationToken = default);
    Task Expire(CancellationToken cancellationToken = default);
    Task<AuctionState> GetState(CancellationToken cancellationToken = default);
    Task<AuctionData> GetData(CancellationToken cancellationToken = default);
}

public enum AuctionState { Open, Sold, Expired }

public sealed record AuctionData(decimal HighBid, string? HighBidder, bool FulfillmentStarted)
{
    public static AuctionData Empty { get; } = new(0, null, false);
}

public sealed record Bid(decimal Amount, string Bidder);
public sealed record CloseAuction;
public sealed record ExpireAuction;
public enum BidResult { Accepted, TooLow, Closed }

[DaprActor("Auction")]
public sealed class AuctionActor(ActorActivationContext context, IActorTimerScheduler timers) : StateMachineActor<AuctionState, AuctionData>, IAuctionActor(context, timers, "Auction", AuctionData.Empty)
{
    private static readonly TimeSpan SoftClose = TimeSpan.FromSeconds(30);

    protected override void Configure(IStateMachine<AuctionState, AuctionData> sm)
    {
        sm.InitialState(AuctionState.Open);

        sm.In(AuctionState.Open)
            .On<Bid>()
                .When((data, bid) => bid.Amount > data.HighBid)
                    .Do(async ctx =>
                    {
                        ctx.Update(data => data with { HighBid = ctx.Event.Amount, HighBidder = ctx.Event.Bidder });
                        await timers.RescheduleAsync("Auction", Id, "soft-close", SoftClose, nameof(Close), string.Empty);
                        ctx.Reply(BidResult.Accepted);
                    })
                .Otherwise()
                    .Reply(BidResult.TooLow);

        sm.In(AuctionState.Open)
            .On<CloseAuction>().GoTo(AuctionState.Sold);

        sm.In(AuctionState.Open)
            .On<ExpireAuction>().GoTo(AuctionState.Expired);

        sm.In(AuctionState.Sold)
            .OnEntry(ctx => ctx.Update(data => data with { FulfillmentStarted = true }))
            .Ignore<Bid>()
            .Ignore<CloseAuction>()
            .Ignore<ExpireAuction>();

        sm.In(AuctionState.Expired)
            .Ignore<Bid>()
            .Ignore<CloseAuction>()
            .Ignore<ExpireAuction>();
    }

    public Task<BidResult> PlaceBid(Bid bid, CancellationToken cancellationToken = default)
    {
        if (CurrentState != AuctionState.Open)
        {
            return Task.FromResult(BidResult.Closed);
        }

        return Raise<BidResult>(bid, cancellationToken);
    }

    public Task Close(CancellationToken cancellationToken = default) =>
        Raise<object?>(new CloseAuction(), cancellationToken);

    public Task Expire(CancellationToken cancellationToken = default) =>
        Raise<object?>(new ExpireAuction(), cancellationToken);

    public Task<AuctionState> GetState(CancellationToken cancellationToken = default) =>
        Task.FromResult(CurrentState);

    public Task<AuctionData> GetData(CancellationToken cancellationToken = default) =>
        Task.FromResult(Data);
}
```

### Why a state machine, and where it ends

An auction is a long-lived, addressable entity with explicit states, not a finite process, so it belongs in a state-machine actor rather than a workflow. A high rate of bids would grow a workflow's replay history without bound, every bidder needs an instant synchronous read of the current high bid, and the soft-close behavior is a race. The transition to `Sold` is where it hands off: its entry action marks fulfillment started, which is the point where a real deployment kicks off a fulfillment workflow for the finite, multi-step process (charge the winner, notify losers, arrange shipping), so the entity stays in the actor and the bounded orchestration goes to a workflow. That boundary is the thing to take away; the two compose rather than compete.

For the authoring detail and the full when-to-use comparison, see [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}}).

## The tests

```csharp
[Fact]
public async Task Last_second_bid_wins_race_with_close_timer()
{
    await using var runtime = CreateRuntime(new PriorityActorScheduler(7));
    var auction = runtime.CreateActor<IAuctionActor>(ActorId.Create("auction-1"), "Auction");
    await PlaceBid(runtime, auction, new Bid(100, "alice"));

    runtime.Time.Advance(TimeSpan.FromSeconds(29));
    var lateBid = auction.PlaceBid(new Bid(110, "bob"));
    await runtime.RunToIdle();
    Assert.Equal(BidResult.Accepted, await lateBid);

    runtime.Time.Advance(TimeSpan.FromSeconds(2));
    await runtime.RunToIdle();

    Assert.Equal(AuctionState.Open, await ReadState(runtime, auction));
    Assert.Equal("bob", (await ReadData(runtime, auction)).HighBidder);
}

[Fact]
public void State_machine_has_no_structural_defects()
{
    ActorStateMachine.Analyze<AuctionActor>().AssertNoStructuralDefects();
    Assert.Contains(ActorStateMachine.Analyze<BadAuctionActor>().StructuralDefects, defect => defect.Contains("unreachable", StringComparison.Ordinal));

    // For deeper exploration, run the same test body under the optional Coyote bridge when enabled.
    Assert.False(CoyoteBridge.IsEnabled);
}

private static ActorTestRuntime CreateRuntime(ControlledActorScheduler? scheduler = null)
{
    _ = typeof(AuctionActor);
    return new ActorTestRuntime(services => services.AddDaprActors(_ => { }), new ActorTestRuntimeOptions { Scheduler = scheduler });
}

private static async Task<BidResult> PlaceBid(ActorTestRuntime runtime, IAuctionActor auction, Bid bid)
{
    var placed = auction.PlaceBid(bid);
    await runtime.RunToIdle();
    return await placed;
}

private static async Task<AuctionState> ReadState(ActorTestRuntime runtime, IAuctionActor auction)
{
    var read = auction.GetState();
    await runtime.RunToIdle();
    return await read;
}

private static async Task<AuctionData> ReadData(ActorTestRuntime runtime, IAuctionActor auction)
{
    var read = auction.GetData();
    await runtime.RunToIdle();
    return await read;
}
```

`BadAuctionActor` is a deliberately-broken variant in the example project (it leaves a state unreachable); the second assertion proves the analyzer catches it. The soft-close is scheduled inside the accepted-bid effect, so each accepted bid reschedules the `soft-close` timer, whose callback invokes `Close` and raises `CloseAuction` to move the auction to `Sold`.

### Why the tests matter

The first test is a genuine race condition, the kind that ships, survives code review, and reproduces once a week in production. In the old SDK this is not merely a hard test to write; it is a test you cannot write reliably at all, because you cannot make a timer and a message race on demand against a real sidecar. Here the bid and the close-timer firing are two separate turns whose order is not fixed, and the scheduler explores that order rather than depending on timing, so the test passes or fails deterministically every run. The two turns never overlap; whichever runs first runs to completion before the other starts. If you want to go further, the same test runs under the [Coyote bridge](https://microsoft.github.io/coyote/) for exhaustive exploration.

The second test analyzes the machine's structure directly: `AuctionActor` must have no defects, while the deliberately-broken `BadAuctionActor` surfaces an unreachable state. Because the machine is a transition table, the runtime can turn "did my refactor strand a state" from a production surprise into a build failure. This example alone justifies the rewrite.

For the test runtime and the structural analysis, see [Testing]({{< ref "dotnet-actorsnext-testing.md#structural-analysis-for-state-machines" >}}).

## See also

- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Testing]({{< ref dotnet-actorsnext-testing.md >}})
- Next: [Part 5: Runtime-defined state machines]({{< ref dotnet-actorsnext-tutorial-interpreted.md >}})
