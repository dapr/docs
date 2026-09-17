---
type: docs
title: "Unit Testing Dapr Actors"
linkTitle: "Unit testing"
weight: 45000
description: Learn how to unit test Dapr actors in .NET
---

Dapr actors encapsulate business logic, state transitions, and inter-actor communication. Unit testing catches bugs early before deploying to a Dapr-enabled cluster.

This guide covers practical patterns for testing actors without a running Dapr sidecar, using standard .NET test frameworks.

## Prerequisites

- .NET 6+ project with [Dapr.Actors](https://www.nuget.org/packages/Dapr.Actors) package
- A test framework: [xUnit](https://xunit.net/), [NUnit](https://nunit.org/), or [MSTest](https://learn.microsoft.com/dotnet/core/testing/)
- (Optional) A mocking library: [Moq](https://github.com/devlooped/moq), [NSubstitute](https://nsubstitute.github.io/), or [FakeItEasy](https://fakeiteasy.github.io/)

## Testable API surface

An actor class inherits from `Actor` (namespace `Dapr.Actors.Runtime`). Key members available for testing:

| Member | Role |
|---|---|
| `StateManager` | Typed key-value state store (`IActorStateManager`) |
| `Id` | The actor unique identifier (`ActorId`) |
| `Host` | The `ActorHost` with registered type info |
| `RegisterTimerAsync()` | Register a periodic callback |
| `RegisterReminderAsync()` | Register a persistent reminder |

## Unit testing with ActorHost

The simplest unit test creates an actor with a lightweight `ActorHost`:

```csharp
using Dapr.Actors.Runtime;
using Xunit;

public class BankActorTests
{
    private readonly ActorHost _host = new(ActorTypeName: "BankActor");

    [Fact]
    public async Task NewActor_HasZeroBalance()
    {
        var actor = new BankActor(_host);
        Assert.Equal(0m, await actor.GetBalanceAsync());
    }

    [Fact]
    public async Task Deposit_IncreasesBalance()
    {
        var actor = new BankActor(_host);
        await actor.DepositAsync(100m);
        Assert.Equal(100m, await actor.GetBalanceAsync());
    }

    [Fact]
    public async Task Withdraw_DecreasesBalance()
    {
        var actor = new BankActor(_host);
        await actor.DepositAsync(100m);
        await actor.WithdrawAsync(30m);
        Assert.Equal(70m, await actor.GetBalanceAsync());
    }

    [Fact]
    public async Task Withdraw_ThrowsWhenInsufficientFunds()
    {
        var actor = new BankActor(_host);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => actor.WithdrawAsync(10m));
    }
}
```

> **Tip:** Each test creates a fresh actor instance, so state does not leak between tests.

## Mocking StateManager

When your actor's constructor accepts `IActorStateManager` via dependency injection, use a mock framework:

```csharp
using Moq;

[Fact]
public async Task Deposit_SavesState()
{
    var mockState = new Mock<IActorStateManager>();
    var host = new ActorHost(ActorTypeName: "Test");
    var actor = new BankActor(host, mockState.Object);

    await actor.DepositAsync(100m);

    mockState.Verify(
        s => s.SetStateAsync("balance", 100m, It.IsAny<CancellationToken>()),
        Times.Once);
}
```

If your actor uses the base class `StateManager` property directly, test state persistence via `TrySaveStateAsync()` or verify behavior through public methods.

## Mocking cross-actor calls

Actors call other actors through `IActorProxyFactory`. Inject the factory via constructor for testability:

```csharp
public class OrderActor : Actor, IOrderActor
{
    private readonly IActorProxyFactory _proxyFactory;

    public OrderActor(ActorHost host, IActorProxyFactory proxyFactory)
        : base(host)
    {
        _proxyFactory = proxyFactory;
    }

    public async Task<OrderResult> PlaceOrderAsync(Order order)
    {
        var bankProxy = _proxyFactory.CreateActorProxy<IBankActor>(
            new ActorId(order.CustomerId), "BankActor");
        await bankProxy.WithdrawAsync(order.Amount);
        // ... additional logic
    }
}
```

Now mock the proxy factory in tests:

```csharp
[Fact]
public async Task PlaceOrder_WithdrawsFromBank()
{
    var mockBank = new Mock<IBankActor>();
    var mockFactory = new Mock<IActorProxyFactory>();
    mockFactory
        .Setup(f => f.CreateActorProxy<IBankActor>(
            It.IsAny<ActorId>(), "BankActor"))
        .Returns(mockBank.Object);

    var host = new ActorHost(ActorTypeName: "Test");
    var actor = new OrderActor(host, mockFactory.Object);

    await actor.PlaceOrderAsync(new Order { Amount = 50m });

    mockBank.Verify(b => b.WithdrawAsync(50m, default), Times.Once);
}
```

## Testing timers and reminders

Test that your actor registers timers and reminders correctly on activation:

```csharp
[Fact]
public async Task OnActivate_RegistersReminder()
{
    var host = new ActorHost(ActorTypeName: "Test");
    var actor = new MyActor(host);

    await actor.OnActivateAsync();

    // Assert reminder registration behavior
    // (verify via mock IActorReminderManager if injected)
}
```

> **Note:** Timer callbacks execute asynchronously. Test the *registration* in unit tests; test *execution* in integration tests with a Dapr sidecar.

## Integration testing with Dapr

For full integration with the actor runtime, use the Dapr sidecar:

```csharp
[Collection("Dapr")]
public class ActorIntegrationTests
{
    private readonly DaprContainer _dapr;

    public ActorIntegrationTests()
    {
        _dapr = new DaprBuilder()
            .WithAppPort(5001)
            .Build();
        _dapr.StartAsync().GetAwaiter().GetResult();
    }

    [Fact]
    public async Task Actor_RetainsStateAcrossCalls()
    {
        var proxy = ActorProxy.Create<IBankActor>(
            new ActorId("test-123"), "BankActor");

        await proxy.DepositAsync(50m);
        decimal balance = await proxy.GetBalanceAsync();

        Assert.Equal(50m, balance);
    }
}
```

## Best practices

| Principle | Why |
|---|---|
| Inject dependencies | Makes mocks trivial: `IActorStateManager`, `IActorProxyFactory`, etc. |
| Avoid timer execution in unit tests | Timers run callbacks asynchronously; test registration only |
| Use lightweight `ActorHost` | Fast creation; no Dapr sidecar needed for unit tests |
| Test state isolation | Each test creates a fresh actor instance |
| Separate unit and integration tests | Unit tests stay fast; integration tests use Dapr |

## See also

- [Dapr Actors overview]({{% ref dotnet-actors-usage.md %}})
- [Dapr Actors how-to guide]({{% ref dotnet-actors-howto.md %}})
- [Actor samples on GitHub](https://github.com/dapr/dotnet-sdk/tree/main/examples/Actor)
