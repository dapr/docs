---
type: docs
title: "Testing actors in the .NET SDK"
linkTitle: "Testing"
weight: 150000
description: "Deterministically test actor concurrency, timers, reminders, and failures with the in-memory runtime, xUnit v3, and Coyote"
---

Testing is the headline capability of `Dapr.Actors.Next`. The hard parts of actors, including reentrancy, a timer that comes due while a call is in progress, duplicate or out-of-order delivery, and a failure in the middle of a state write, are normally only reachable with a running sidecar and wall-clock timing, which makes them effectively untestable. This SDK makes them deterministic, fast, and reproducible by isolating the three sources of nondeterminism (transport, scheduling, and time) behind abstractions, so the same actor code runs against either the real runtime or an in-memory test runtime.

This page covers what is available at development time, how to write tests with xUnit v3, how to add Coyote for deeper exploration, and how to run integration tests against a real sidecar.

{{% alert title="Package" color="primary" %}}
The in-memory runtime is in `Dapr.Actors.Next.Testing`. It is one of the packages that make up the `Dapr.Actors.Next` meta-package, and it is also published to NuGet on its own, so you install it directly into your test project rather than pulling the full meta-package there. It drives your real actors through the same generated dispatchers used in production, so there are no test-only actor implementations.
{{% /alert %}}

## What is available at development time

`ActorTestRuntime` gives you a controlled scheduler that explores the ordering of whole turns across actor ids, and reentrancy within a single call chain, deterministically and reproducibly from a seed, with strategies that include a seeded random walk and a priority-based strategy. Turns for a single actor id never overlap; the runtime holds the actor lock and delivers at most one non-reentrant callback per id at a time, so the scheduler explores the order in which whole turns run, never a point inside a turn. It gives you virtual time through `TimeProvider`, so timers and reminders come due only when you advance the clock and run as their own turns in a deterministic order relative to other turns. It gives you fault injection for state writes, state migration, and actor invocation, transient or permanent, covered in [Fault injection](#fault-injection). It gives you introspection, including an actor's current state (and, for state machines, its current `TState` and `Data`) and a transcript of the explored ordering for replay. For state-machine actors, it adds structural analysis to detect unreachable states, dead ends, and entry/exit defects, covered in [Structural analysis for state machines](#structural-analysis-for-state-machines).

None of this requires a sidecar, a state store, or Docker.

A set of analyzers keeps actors inside the model the controlled scheduler can explore exhaustively. They flag work that escapes the scheduler such as `Task.Run` (`DAPR1411`), blocking calls (`DAPR1412`), wall-clock time used instead of `TimeProvider` (`DAPR1413`), and unseeded nondeterministic sources such as `Guid.NewGuid()` or `Random` (`DAPR1414`). Staying clean against these is what makes the in-memory exploration complete rather than best-effort; see the [diagnostics reference]({{< ref "dotnet-actorsnext-howto.md#analyzers-and-diagnostics" >}}).

## Testing with xUnit v3

The Dapr .NET SDK tests with xUnit v3, and these examples assume it. Add the test runtime and xUnit v3 to your test project:

```xml
<ItemGroup>
  <PackageReference Include="Dapr.Actors.Next.Testing" Version="..." />
  <PackageReference Include="xunit.v3" Version="..." />
  <PackageReference Include="xunit.runner.visualstudio" Version="..." />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="..." />
</ItemGroup>
```

Create a runtime, create an actor proxy, drive it, and assert. The `[Fact]` and `Assert` surface is the same as earlier xUnit versions.

### A basic test

```csharp
public class CartActorTests
{
    [Fact]
    public async Task Adding_an_item_updates_the_summary()
    {
        await using var rt = new ActorTestRuntime();
        var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

        await cart.AddItem(new CartItem("sku-1", qty: 2));

        Assert.Equal(1, (await cart.GetSummary()).ItemCount);
    }
}
```

{{% alert title="CreateActor always takes the actor type name" color="primary" %}}
`CreateActor<TActor>(actorId, actorType)` requires the actor type name; there is no overload that infers it from `TActor`. Pass the name the actor is hosted under: its `[DaprActor]` name (or the type-name fallback), or the alias you registered it with (see [registering an actor under a custom name]({{< ref "dotnet-actorsnext-howto.md#registering-an-actor-under-a-custom-name" >}})). Requiring the name also removes any ambiguity when one interface backs several actor types.

```csharp
var queue = rt.CreateActor<IQueueActor>(ActorId.Create("q1"), actorType: "OrdersQueue");
```
{{% /alert %}}

Because an alias is often sourced from configuration, and it is common to keep separate Debug and Release (or other environment) configuration profiles, resolve the alias in the test from the same source the host uses, or from a single shared constant, rather than hard-coding a literal. If the host reads `QUEUE_ACTOR_TYPE_NAME` from configuration, a test that hard-codes `"OrdersQueue"` may match the profile where that value happens to line up and then silently address the default or a different name under another profile. Reading the name the same way the host does keeps the test consistent with whatever profile it runs under.

```csharp
// Resolve the alias the same way the host does, so the test tracks the active profile.
var actorType = configuration.GetValue("QUEUE_ACTOR_TYPE_NAME", "QueueActor");
var queue = rt.CreateActor<IQueueActor>(ActorId.Create("q1"), actorType);
```

### Injecting dependencies

Configure services on the runtime the same way you would in your host. Test doubles are injected into the actor's per-activation scope.

```csharp
await using var rt = new ActorTestRuntime(services =>
{
    services.AddSingleton<IPricingClient>(new FakePricingClient(total: 42m));
});

var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");
Assert.Equal(42m, (await cart.GetSummary()).Total);
```

### Timers and reminders with virtual time

Advance the clock to fire a timer or reminder; nothing fires until you do.

```csharp
[Fact]
public async Task Abandoned_cart_reminder_fires_after_thirty_minutes()
{
    await using var rt = new ActorTestRuntime();
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    await cart.AddItem(new CartItem("sku-1", 1));
    rt.Time.Advance(TimeSpan.FromMinutes(30));    // fires the abandon-cart reminder
    await rt.RunToIdle();

    Assert.True((await cart.GetSummary()).IsAbandoned);
}
```

### Fault injection and recovery

```csharp
[Fact]
public async Task State_write_failure_does_not_corrupt_or_double_apply()
{
    await using var rt = new ActorTestRuntime();
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    rt.Faults.FailNextStateWrite<CartState>();    // first end-of-turn save fails
    var add = cart.AddItem(new CartItem("sku-1", 1));
    await rt.RunToIdle();
    await add;

    Assert.Equal(1, (await cart.GetSummary()).ItemCount);   // exactly once
}
```

### Turn ordering: a reminder runs after the in-flight turn, not during it

Turns for a single actor id never overlap. A method call is one turn and a reminder is another; if a reminder becomes due while a method turn is in progress, it waits for that turn to finish and then runs as its own turn. The scheduler explores the order in which whole turns run, never a point inside a turn. The test below pins that guarantee: a reminder that comes due during a method turn runs only after that turn commits, and observes its committed state.

```csharp
[Fact]
public async Task Reminder_due_during_a_turn_runs_after_it_and_sees_committed_state()
{
    await using var rt = new ActorTestRuntime();
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    // Start a method turn, and make a reminder come due before that turn completes.
    var add = cart.AddItem(new CartItem("sku-1", 1));
    rt.Time.Advance(TimeSpan.FromMinutes(30));   // the reminder is now due, but AddItem owns the turn
    await rt.RunToIdle();
    await add;

    // AddItem ran to completion first; the reminder turn ran next and saw the committed item.
    Assert.Equal(1, (await cart.GetSummary()).ItemCount);
}
```

The only thing that ever re-enters a turn already in progress is a reentrant call, a deliberate continuation of the same call chain identified by the `dapr-reentrant-id` header and bounded by `DaprActorsOptions.MaxReentrantDepth`, not an independent turn racing the first.

A legitimate race does exist, but it is a race over the order of two whole turns, not two turns overlapping. In the auction (see [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})), a late bid and the close-timer firing are two separate turns whose arrival order is not fixed, so the scheduler explores which turn runs first. Each still runs to completion on its own; the test asserts the outcome is correct whichever order they run in.

### Reproducing a failure from a seed

When a scheduled exploration finds a failing ordering, it reports the seed. Pin the seed to replay it exactly.

```csharp
await using var rt = new ActorTestRuntime(options: new ActorTestRuntimeOptions
{
    // Replay the exact ordering by re-seeding the scheduler the failing run reported.
    Scheduler = new PriorityActorScheduler(seed: 1234567),
});
```

### Running many orderings

Run a scenario across many seeds to surface order-dependent bugs. Rebuild the runtime with a fresh `SeededRandomActorScheduler(seed)` each iteration; the two bids below are issued concurrently by their callers, but they run as two serialized turns on the auction, and each seed explores a different order for those turns. When an assertion fails, the seed that produced it is the reproduction.

```csharp
[Fact]
public async Task Concurrent_bids_never_lose_the_high_bid()
{
    for (var seed = 0; seed < 1000; seed++)
    {
        await using var rt = new ActorTestRuntime(
            services => services.AddDaprActors(_ => { }),
            new ActorTestRuntimeOptions { Scheduler = new SeededRandomActorScheduler(seed) });
        var auction = rt.CreateActor<IAuctionActor>(ActorId.Create("a1"), "Auction");

        var a = auction.PlaceBid(new Bid(100m, "alice"));
        var b = auction.PlaceBid(new Bid(110m, "bob"));
        await rt.RunToIdle();
        await Task.WhenAll(a, b);

        Assert.Equal(110m, rt.StateOf(auction).Data<AuctionData>()!.HighBid);   // the seed pins the failing order
    }
}
```

## Fault injection

`rt.Faults` injects failures so you can test recovery paths deterministically rather than hoping to observe them. A fault is scheduled against the next matching operation, or the next few, transient or permanent, and is explored alongside scheduling, so a fault that lands during a particular ordering is reproducible from the run's seed.

State writes:

- `Faults.FailNextStateWrite<TState>()` fails the next end-of-turn save of that state type. It is transient by default (it clears after one attempt); pass `transient: false` to keep failing, and `stateName:` to scope the fault to a single named entry.

State migration:

- `Faults.FailNextMigration<TState>()` fails the next migrating read that folds to `TState`, and `Faults.FailNextUpcastHop<TFrom, TTo>()` fails a specific hop in the chain, so the fold's failure paths are unit-testable (see [State migration]({{< ref dotnet-actorsnext-statemigration.md >}})). Both take `transient:` and `stateName:`.

Actor invocation:

- `Faults.FailNextInvocation()` fails the next actor invocation, so you can test how a caller handles a downstream failure. Scope it with `actorType:` and `methodName:`, and use `transient:` to control whether it clears after one attempt.

For example, a transient store failure that clears on retry, asserted to apply exactly once:

```csharp
await using var rt = new ActorTestRuntime();
var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

rt.Faults.FailNextStateWrite<CartState>();    // transient by default: the first save fails, the retry succeeds
var add = cart.AddItem(new CartItem("sku-1", 1));
await rt.RunToIdle();
await add;

Assert.Equal(1, (await cart.GetSummary()).ItemCount);
```

## Structural analysis for state machines

State machine actors built on `StateMachineActor<TState, TData>` carry their transitions as a table, so the test runtime can check the machine's structure without executing it. `ActorStateMachine.Analyze<TActor>()` inspects the table and reports defects: states no transition can reach, states with no way out, guard branches that can never be selected, and entry/exit ordering problems across hierarchy. `AssertNoStructuralDefects()` turns any finding into a test failure.

```csharp
[Fact]
public void Order_machine_is_structurally_sound()
    => ActorStateMachine.Analyze<OrderActor>().AssertNoStructuralDefects();
```

Run it as a unit test so a refactor that strands a state fails the build instead of surfacing in production. See [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}}) for authoring detail.

## Deep testing with Coyote

The built-in scheduler explores the structured nondeterminism of the actor model: message order, reentrancy, and timer-versus-message races. That covers the large majority of actor bugs with no extra tooling. For the remainder, such as handlers that perform complex in-process async or whole-program data-race detection, you can run the same tests under [Microsoft Coyote](https://microsoft.github.io/coyote/), which takes systematic control of `Task`, `await`, and locks across the entire call graph.

### Install Coyote

Add the Coyote packages to your test project and install the CLI tool:

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.Coyote" Version="..." />
  <PackageReference Include="Microsoft.Coyote.Test" Version="..." />
</ItemGroup>
```

```bash
dotnet tool install --global Microsoft.Coyote.CLI
```

### Enable the Coyote bridge

`Dapr.Actors.Next.Testing` includes an opt-in Coyote bridge that routes the runtime's scheduling decisions through Coyote's systematic engine. It is compiled in through the `DAPR_ACTORS_NEXT_COYOTE` build constant rather than toggled per test, so a dedicated test configuration turns it on for the whole assembly:

```xml
<PropertyGroup Condition="'$(Configuration)' == 'Coyote'">
  <DefineConstants>$(DefineConstants);DAPR_ACTORS_NEXT_COYOTE</DefineConstants>
</PropertyGroup>
```

When the constant is set, `CoyoteBridge.IsEnabled` is `true` and the runtime's scheduling flows through Coyote; otherwise the built-in scheduler is used. A test can assert which mode it is running under with `CoyoteBridge.IsEnabled`.

### Run the suite under systematic exploration

For the deepest mode, where Coyote also controls in-handler async and locks, rewrite the compiled test assembly and run it under the Coyote tester. Tests run on the JIT, so this never conflicts with your AOT production build.

```bash
# Rewrite the test assembly so Coyote controls all concurrency
coyote rewrite ./bin/Debug/net10.0/MyActors.Tests.dll

# Systematically explore a test entry point for N iterations
coyote test ./bin/Debug/net10.0/MyActors.Tests.dll \
  --method CartActorTests.Concurrent_bids_never_lose_the_high_bid \
  --iterations 10000
```

You can also drive Coyote in-process from a test with `Microsoft.Coyote.SystematicTesting.TestingEngine` if you prefer to keep everything inside `dotnet test`.

{{% alert title="When to reach for Coyote" color="primary" %}}
Start with the built-in runtime; it requires no rewriting and covers the actor model's nondeterminism out of the box. Add Coyote when an actor's handlers legitimately do complex in-process asynchrony you want explored, or when you want data-race detection across code the SDK does not own.
{{% /alert %}}

## Integration testing with Testcontainers

The in-memory runtime proves your actor logic. Integration tests prove the real protocol: the `SubscribeActorEvents` streams, serialization against a real sidecar, reminders through the real scheduler, and placement. Use the `Dapr.Testcontainers` package to stand these up.

{{% alert title="What unit tests prove, and what they do not" color="primary" %}}
The in-memory runtime is a faithful model of the SDK's own scheduler, time, and delivery behavior, so it proves your logic, your ordering assumptions, your fault handling, and your migrations. It is not the real runtime. It does not prove that your serialized payloads deserialize against a live `daprd`, that placement and reminders behave as configured, that a real stream reconnect re-advertises correctly, or that wall-clock timing holds under load. Keep the bulk of your coverage in the fast in-memory tests, and use a small number of integration tests to prove the parts only a real sidecar can. A green unit suite is necessary but not sufficient for the protocol edges.
{{% /alert %}}

An actor integration fixture is multi-container by necessity. Actors require the placement service, reminders require the scheduler service, and you need a state store in addition to the sidecar and the app under test.

```csharp
public sealed class DaprActorFixture : IAsyncLifetime
{
    // Inspect the Dapr.Testcontainers API in your solution to compose:
    //   redis (state store) + placement + scheduler + daprd + the actor-hosting app,
    // on a shared network, with readiness gating.
    public async ValueTask InitializeAsync() { /* start containers */ }
    public async ValueTask DisposeAsync()    { /* stop containers */ }
}

public class CartActorIntegrationTests(DaprActorFixture fixture) : IClassFixture<DaprActorFixture>
{
    [Fact]
    public async Task Reminder_fires_through_the_real_scheduler()
    {
        var cart = ActorProxy.Create<ICartActor>(ActorId.Create("u1"), "CartActor");
        await cart.AddItem(new CartItem("sku-1", 1));
        // ... wait for the real scheduler to deliver the reminder, then assert
    }
}
```

Reserve integration tests for what only a real sidecar can prove, such as stream round-trip, real serialization, reminder and placement behavior, and end-to-end subscription delivery. Keep the bulk of your coverage in the fast in-memory tests.

## Coverage

Because the hard paths are reachable in-memory, high coverage is practical. Keep the bulk of coverage in fast unit tests against `ActorTestRuntime`, with integration tests on top for the protocol. Exclude generated files and the source-generator and analyzer assemblies from the coverage denominator; generators are covered by snapshot and run tests, and analyzers by analyzer tests.

## Best practices

- Default to the in-memory runtime, and add Coyote only for the remaining deep cases.
- Drive timers and reminders with `rt.Time.Advance(...)`; never use real delays in tests.
- When a scheduled exploration fails, capture the reported seed and add a pinned-seed regression test.
- Test failure paths explicitly with `rt.Faults`, not just the happy path.
- For state-machine actors, assert `Analyze<T>().AssertNoStructuralDefects()` as a test so structural regressions fail the build.
- Keep integration tests few and focused on real-protocol behavior, and keep unit tests many and fast.

## Next steps

- [Tutorial: Dapr.Actors.Next by example]({{< ref "tutorial/_index.md" >}})
- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Subscription streams]({{< ref dotnet-actorsnext-streams.md >}})
- [Serialization and state migration]({{< ref dotnet-actorsnext-serialization.md >}})
