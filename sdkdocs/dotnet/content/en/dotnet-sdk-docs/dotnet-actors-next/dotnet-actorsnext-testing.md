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
The in-memory runtime is in the `Dapr.Actors.Next.Testing` namespace. It is one of the packages that make up the `Dapr.Actors.Next` meta-package, and it is also published to NuGet on its own, so you install it directly into your test project rather than pulling the full meta-package there. It drives your real actors through the same generated dispatchers used in production, so there are no test-only actor implementations.
{{% /alert %}}

## What is available at development time

`ActorTestRuntime` gives you a controlled scheduler that explores the ordering of whole turns across actor ids, and reentrancy within a single call chain, from a seed, with strategies that include a seeded random walk and a priority-based strategy. Independent turns for a single actor id never overlap; the runtime holds the actor lock and delivers at most one non-reentrant callback per id at a time. `StepAsync` starts one runnable turn; `RunToIdle` drives scheduled work until no runnable or in-flight turns remain.

The runtime also provides virtual time through `TimeProvider`, production in-process timer/reminder adapters, and introspection of persisted state and the scheduling transcript. [Remote-call simulation](#testing-reentrancy-across-a-remote-boundary) checks call chains without ambient execution-context propagation. [State-write pauses](#pause-a-state-write-and-race-deactivation) let you hold a turn at a known persistence boundary while testing competing work. [Fault injection](#fault-injection) covers state writes, migration, and invocation; callback-stream faults additionally require a decorated transport and a running stream manager. For state-machine actors, [structural analysis](#structural-analysis-for-state-machines) detects defects in the transition table.

None of this requires a sidecar, a state store, or Docker.

A set of analyzers keeps actors inside the model the controlled scheduler can explore exhaustively. They flag work that escapes the scheduler such as `Task.Run` (`DAPR1411`), blocking calls (`DAPR1412`), wall-clock time used instead of `TimeProvider` (`DAPR1413`), and unseeded nondeterministic sources such as `Guid.NewGuid()` or `Random` (`DAPR1414`). Staying clean against these is what makes the in-memory exploration complete rather than best-effort; see the [diagnostics reference]({{< ref "dotnet-actorsnext-howto.md#analyzers-and-diagnostics" >}}).

## Testing with xUnit v3

The Dapr .NET SDK tests with xUnit v3, and these examples assume it. Add the Dapr .NET Actors SDK and xUnit v3 packages to your test project:

```xml
<ItemGroup>
  <PackageReference Include="Dapr.Actors.Next" Version="..." />
  <PackageReference Include="xunit.v3" Version="..." />
  <PackageReference Include="xunit.runner.visualstudio" Version="..." />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="..." />
</ItemGroup>
```

Create a runtime with your application's actor and dependency registrations, create an actor proxy, drive the scheduler, and assert. The examples assume the illustrated actor contracts and implementations are discoverable by `AddDaprActors`; include any dependencies they require in the service configuration. The `[Fact]` and `Assert` surface is the same as earlier xUnit versions.

### A basic test

```csharp
public class CartActorTests
{
    [Fact]
    public async Task Adding_an_item_updates_the_summary()
    {
        await using var rt = new ActorTestRuntime(services => services.AddDaprActors());
        var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

        var add = cart.AddItem(new CartItem("sku-1", 2));
        await rt.RunToIdle();
        await add;

        var summary = cart.GetSummary();
        await rt.RunToIdle();
        Assert.Equal(1, (await summary).ItemCount);
    }
}
```

Start each call before advancing the scheduler, and await its result afterward. Awaiting a queued call before `RunToIdle` can leave the test waiting indefinitely. Use `StepAsync` instead when a test intentionally pauses a turn: `RunToIdle` cannot finish while that turn remains paused.

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
    services.AddDaprActors();
});

var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");
var summary = cart.GetSummary();
await rt.RunToIdle();
Assert.Equal(42m, (await summary).Total);
```

### Timers and reminders with virtual time

The runtime injects `CoreActorTimerScheduler` and `CoreActorReminderScheduler`, the production **in-process** adapters, backed by `rt.Time`. Run the turn that registers a timer or reminder, advance the clock to admit due callbacks, and then drive their mailbox turns:

```csharp
[Fact]
public async Task Abandoned_cart_reminder_fires_after_thirty_minutes()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors());
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    var add = cart.AddItem(new CartItem("sku-1", 1));
    await rt.RunToIdle();
    await add;

    rt.Time.Advance(TimeSpan.FromMinutes(30));    // admits the registered abandon-cart reminder
    await rt.RunToIdle();

    var summary = cart.GetSummary();
    await rt.RunToIdle();
    Assert.True((await summary).IsAbandoned);
}
```

The example assumes `AddItem` registers the reminder. Callbacks are independent turns, not reentrant continuations of the turn that registered them. The adapters suppress execution-context capture, so a timer or reminder does not inherit that turn's call chain.

Test replacement and cancellation by registering the same timer or reminder name again, canceling it, and advancing time. Cancellation prevents future callback admission; a callback already admitted may still complete. `VirtualActorTimeProvider` implements `TimeProvider.CreateTimer`, including change, disposal, and execution-context capture; its direct `ScheduleTimer` and `ScheduleReminder` helpers remain available. Calls to `Time.Advance` must not overlap or recurse.

The provider visits each due time in order, breaking ties by registration order, and invokes timer callbacks synchronously outside its registration lock. Those callbacks can change or cancel timers. If a timer callback throws, advancement stops at that due time. Actor callback admission is separate from executing the queued actor turn, which still requires the controlled scheduler.

Virtual time does not advance a real sidecar's clock or reproduce durable scheduler delivery. Keep those checks in integration tests.

### State-write failure

A state-write fault fails the matching persistence attempt; it does not automatically retry the invocation. Inspect persisted state with `StateOf` rather than issuing a read turn that could flush dirty cached state:

```csharp
[Fact]
public async Task State_write_failure_is_reported_before_persistence()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors());
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");

    rt.Faults.FailNextStateWrite<CartState>(stateName: "cart");
    var add = cart.AddItem(new CartItem("sku-1", 1));
    await rt.RunToIdle();
    await Assert.ThrowsAsync<ActorInjectedTransientException>(() => add);

    Assert.Null(rt.StateOf(cart).Get<CartState>("cart"));
}
```

This checks a previously unpersisted `"cart"` entry. It does not assert rollback of actor fields or cached mutations, or of writes that already succeeded. Test recovery explicitly according to your application's retry and idempotency policy.

### Turn ordering: a reminder runs after the in-flight turn, not during it

Independent turns for a single actor id never overlap. A method call is one turn and a reminder is another; if a reminder becomes due while a method turn is in progress, it waits for that turn to finish and then runs as its own turn. Use a state-write pause to ensure the method is actually in flight before advancing time, rather than relying on how quickly an asynchronous call starts. This example assumes `AddItem` registers the abandon-cart reminder:

```csharp
[Fact]
public async Task Reminder_due_during_a_turn_runs_after_it_and_sees_committed_state()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors());
    var cart = rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");
    using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
    using var pause = rt.Faults.PauseNextStateWrite<CartState>(stateName: "cart");

    var add = cart.AddItem(new CartItem("sku-1", 1));
    await rt.StepAsync(timeout.Token);
    await pause.Reached.WaitAsync(timeout.Token);
    try
    {
        rt.Time.Advance(TimeSpan.FromMinutes(30));
        Assert.False(await rt.StepAsync(timeout.Token));   // this actor is still occupied
        Assert.Null(rt.StateOf(cart).Get<CartState>("cart"));
    }
    finally
    {
        pause.Release();
    }

    await rt.RunToIdle(timeout.Token);
    await add;

    var summary = cart.GetSummary();
    await rt.RunToIdle(timeout.Token);
    var result = await summary;
    Assert.Equal(1, result.ItemCount);
    Assert.True(result.IsAbandoned);
}
```

Only an invocation in the active, matching call chain can be admitted as reentrant, subject to `EnableReentrancy` and `MaxReentrantDepth`. The canonical header is `Dapr-Reentrancy-Id`. The SDK also accepts the legacy `dapr-reentrant-id` and `x-dapr-reentrant-id` aliases case-insensitively, preferring the canonical name.

A legitimate race does exist, but it is a race over the order of two whole turns, not two turns overlapping. In the auction (see [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})), a late bid and the close-timer firing are two separate turns whose arrival order is not fixed, so the scheduler explores which turn runs first. Each still runs to completion on its own; the test asserts the outcome is correct whichever order they run in.

### Testing reentrancy across a remote boundary

Set `ActorTestRuntimeOptions.SimulateRemoteCalls` to remove the caller's ambient `ExecutionContext` from invocations through the test invocation client while preserving propagated headers. This exercises self-calls and A-to-B-to-A callbacks without relying on `AsyncLocal` state surviving a transport boundary:

```csharp
await using var rt = new ActorTestRuntime(
    services => services.AddDaprActors(options =>
    {
        options.EnableReentrancy = true;
        options.MaxReentrantDepth = 4;
    }),
    new ActorTestRuntimeOptions { SimulateRemoteCalls = true });

var call = rt.InvokeAsync("CartActor", ActorId.Create("u1"), "Checkout");
using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
await rt.RunToIdle(timeout.Token);
await call;
```

Here `Checkout` is your actor operation that awaits nested actor calls. Alternatively, select only the next matching invocation through that client:

```csharp
rt.Faults.SimulateNextRemoteInvocation(actorType: "Inventory", methodName: "Reserve");
```

Unmatched invocations do not consume this one-shot control. Simulation still uses in-memory serialization and dispatch; it does not test network routing, placement, authentication, or the real wire protocol.

Set reentrancy options explicitly when comparing in-memory and sidecar behavior. The SDK enforces an explicit `EnableReentrancy = false` and the maximum depth; per-type settings override application settings. When unset, the in-process runtime retains its historical local-reentrancy behavior, while Dapr separately enforces the advertised configuration.

Await nested calls. Reentrant admission does not make actor fields or cached state safe for arbitrary parallel branches or fire-and-forget work. A scheduler seed reproduces its ordering decisions, not every thread-pool interleaving introduced by remote-call simulation; use explicit pauses to pin boundaries and Coyote where deeper exploration is needed.

### Reproducing a failure from a seed

When a scheduled exploration finds a failing ordering, it reports the seed. Pin the seed to replay it exactly.

```csharp
await using var rt = new ActorTestRuntime(services => services.AddDaprActors(), options: new ActorTestRuntimeOptions
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

`rt.Faults` queues controls for the next matching operation. Every `FailNext...` control is **one-shot**, including when `transient: false` is passed. `transient: true` (the default) selects `ActorInjectedTransientException`; `false` selects `ActorInjectedPermanentException`. It changes the exception classification, not how many operations fail. Queue another fault for each additional failure you want to exercise. Nonmatching operations do not consume a fault.

| Control | Boundary and filters |
| --- | --- |
| `FailNextStateWrite<TState>()` | Before persisting a value of that type, including an explicit save or end-of-turn save. Optional `stateName:` limits it to one entry. |
| `FailNextMigration<TState>()` | Before a migrating read targeting that type. Optional `stateName:`. |
| `FailNextUpcastHop<TFrom, TTo>()` | Before a specific migration hop. Optional `stateName:`. |
| `FailNextInvocation()` | Before dispatch at the test invocation boundary. Optional `actorType:` and `methodName:`. |
| `PauseNextStateWrite<TState>()` | Pauses before persistence and returns an `ActorFaultPause`. Optional `stateName:`. |
| `SimulateNextRemoteInvocation()` | Removes ambient execution context from the next matching invocation through the test invocation client, preserving headers. Optional `actorType:` and `methodName:`. |
| `FailNextStreamRead()` | After receiving an inbound frame but before delivering it to the runtime. Optional frame `kind:`; requires a decorated callback transport. |
| `FailNextStreamWrite()` | Before forwarding an outbound frame. Optional frame `kind:`; requires a decorated callback transport. |

Fault injection does not install an automatic invocation retry policy. Assert the failed attempt, then explicitly exercise recovery or redelivery. A state-write failure and a response lost **after** a successful commit are different scenarios: neither provides a general rollback or exactly-once guarantee. See [delivery guarantees]({{< ref "dotnet-actorsnext-howto.md#delivery-guarantees-you-must-design-for" >}}) and [state migration]({{< ref dotnet-actorsnext-statemigration.md >}}).

### Pause a state write and race deactivation

`PauseNextStateWrite<TState>` stops the next matching write immediately before persistence. Start the call, use `StepAsync` to let it reach the boundary, and await `ActorFaultPause.Reached` before introducing competing work:

```csharp
await using var rt = new ActorTestRuntime(services => services.AddDaprActors());
var id = ActorId.Create("u1");
var cart = rt.CreateActor<ICartActor>(id, "CartActor");
using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
using var pause = rt.Faults.PauseNextStateWrite<CartState>(stateName: "cart");

var add = cart.AddItem(new CartItem("sku-1", 1));
await rt.StepAsync(timeout.Token);
await pause.Reached.WaitAsync(timeout.Token);

var deactivate = rt.DeactivateAsync("CartActor", id);
try
{
    Assert.False(deactivate.IsCompleted);
    Assert.False(await rt.StepAsync(timeout.Token));
}
finally
{
    pause.Release();
}

await rt.RunToIdle(timeout.Token);
await Task.WhenAll(add, deactivate);
Assert.Single(rt.StateOf(cart).Get<CartState>("cart")!.Items);
```

External deactivation is queued behind active work, so drive the scheduler before awaiting it. A deactivation requested by the active call chain is deferred until the turn and its admitted children finish. The activation is not disposed while that work is still using it.

`Release()` allows the write to continue; calling it before the boundary is reached is safe. Disposing the pause also releases it. A paused write honors its own cancellation token. Canceling `RunToIdle` cancels the scheduler wait, not an already-running turn; always release the pause during cleanup. You can also advance virtual time while paused to test callback ordering, or run a call to another actor to verify independent progress.

### Inject callback-stream failures

These controls target the actor-hosting `SubscribeActorEvents` stream, not a pub/sub subscription stream. `ActorTestRuntime` does not open that transport. Run a `SubscribeActorEventsStreamManager` over a fake transport for a protocol-level unit test, or use a real actor host for an integration test, and decorate its transport with `FaultInjectingActorEventsTransport`.

Register the decorator **after** actor services in the test host:

```csharp
using Dapr.Actors.Next.Core.State;
using Dapr.Actors.Next.Core.Transport;
using Dapr.Actors.Next.Testing;
using Microsoft.Extensions.DependencyInjection;

services.AddSingleton<ActorFaults>();
services.AddSingleton<IActorStateFaultInjector>(
    sp => sp.GetRequiredService<ActorFaults>());
services.AddSingleton<ISubscribeActorEventsTransport>(sp =>
    new FaultInjectingActorEventsTransport(
        createTransport(sp),
        sp.GetRequiredService<ActorFaults>()));
```

`createTransport` is your existing factory for the underlying fake transport or `DaprActorEventsTransport`; preserve its endpoint and API-token configuration. Do not resolve `ISubscribeActorEventsTransport` inside that factory, which would recursively resolve the decorator. The `IActorStateFaultInjector` registration is needed only if this host also uses state-write or migration faults.

Resolve the same `ActorFaults` instance from the test host and arm a fault before sending the request under test:

```csharp
var faults = host.Services.GetRequiredService<ActorFaults>();
faults.FailNextStreamRead(kind: SubscribeActorEventsFrameKind.Invoke);
```

In a separate scenario, fail the response instead:

```csharp
faults.FailNextStreamWrite(kind: SubscribeActorEventsFrameKind.Invoke);
```

A read fault consumes the selected inbound frame without dispatching it. A write fault prevents the selected response from being forwarded; for a successful invoke response, actor state has already committed. Omitting `kind` selects the next frame in that direction, which may be the initial registration frame rather than an invoke. Both controls leave nonmatching frames untouched and throw the selected injected exception once.

Assert reconnection, re-advertisement of the actor type, and subsequent progress. Allow for the stream manager's five-second reconnect delay; a fake-transport test can drive its injected `TimeProvider`, while `rt.Time` does not control a real host automatically. The decorator does not redeliver a request for you. Explicitly resend it in a fake-transport test or exercise your configured retry path with a real sidecar, and assert that an idempotent operation does not duplicate state changes or external effects after response loss.

The stream reader continues admitting callbacks while earlier calls are suspended, so nested callbacks are not blocked behind a fixed worker limit. Outstanding calls still consume memory proportional to admitted load. Disconnects cancel accepted work; actor code must honor cancellation, and code that ignores it may outlive the failed stream.

The SDK's [testing guide](https://github.com/dapr/dotnet-sdk/blob/ae6002f82c5bd7e9c4af5589d04cf2f535b786c6/src/Dapr.Actors.Next.Testing/README.md) describes regression coverage in `RuntimeConcurrencyTests`, `TimerConcurrencyTests`, `StreamConcurrencyTests`, `ActorStreamFaultTests`, `VirtualTimerConcurrencyTests`, and `RealSidecarConcurrencyTests`.

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

The testing apparatus in `Dapr.Actors.Next` includes an opt-in Coyote bridge that routes the runtime's scheduling decisions through Coyote's systematic engine. It is compiled in through the `DAPR_ACTORS_NEXT_COYOTE` build constant rather than toggled per test, so a dedicated test configuration turns it on for the whole assembly:

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
