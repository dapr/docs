---
type: docs
title: "Part 5: Runtime-defined state machines"
linkTitle: "5. Runtime-defined"
weight: 165000
description: "State machines supplied as data at runtime, verified before they go live, and driven dynamically"
---

The fifth example is the destination the first four were building toward: state machines that are not compiled into your app at all, but supplied as data at runtime, verified before they go live, and driven without a compile-time contract.

The scenario is a device-management platform. You manage many kinds of devices, a smart lock, a thermostat, a valve, and each device type has its own state machine: a lock moves from Locked to Unlocking to Unlocked to Locking and back, driven by commands and sensor events. New device types are onboarded through configuration, not a code deploy, and each physical device is a long-lived, addressable entity, exactly the kind of thing [Part 4]({{< ref dotnet-actorsnext-tutorial-auction.md >}}) argued belongs in a state-machine actor. The difference here is that the machine is data, so one compiled actor runs every device type.

Code for this part: `/examples/Actor.Next/05-Interpreted/`.

## What you build

Three capabilities, each reusing machinery built for an earlier, compile-time purpose.

Runtime-defined behavior. Because a state machine's configuration is a transition table (data, not code), a single compiled `InterpretedStateMachineActor` runs a machine supplied as data. A device type's states, transitions, guards, and effects are a definition document; each physical device is an instance of the interpreter running its type's definition. Guards and effects (actuate the motor, check the battery, publish a telemetry event) resolve by name from a capability registry of vetted, compiled actions rather than arbitrary code, so a new device type composes only from safe building blocks.

```csharp
// A device-type definition, authored as data rather than compiled. The optional
// includeUnlockingCompletion flag lets a test build a deliberately-stranded machine.
public static class DeviceManagementDemo
{
    public static InterpretedMachineDefinition SmartLockDefinition(bool includeUnlockingCompletion = true, string motorEffect = "ActuateMotor") =>
        new()
        {
            DocumentVersion = 1,
            InitialState = "Locked",
            States =
            [
                new InterpretedStateDefinition { Name = "Locked" },
                new InterpretedStateDefinition { Name = "Unlocking" },
                new InterpretedStateDefinition { Name = "Unlocked" },
                new InterpretedStateDefinition { Name = "Locking" },
            ],
            Transitions = Transitions(includeUnlockingCompletion, motorEffect),
        };

    public static InterpretedMachineVerificationResult Verify(IInterpretedMachineVerifier verifier, InterpretedMachineDefinition definition) =>
        verifier.Verify(definition);

    private static IReadOnlyList<InterpretedTransitionDefinition> Transitions(bool includeUnlockingCompletion, string motorEffect)
    {
        var transitions = new List<InterpretedTransitionDefinition>
        {
            new()
            {
                Source = "Locked",
                Event = "Unlock",
                Branches = [new InterpretedBranchDefinition { Guards = ["CheckBattery"], Target = "Unlocking", Effects = [motorEffect] }],
            },
            new()
            {
                Source = "Unlocked",
                Event = "Lock",
                Branches = [new InterpretedBranchDefinition { Otherwise = true, Target = "Locking", Effects = [motorEffect] }],
            },
            new()
            {
                Source = "Locking",
                Event = "MotorStopped",
                Branches = [new InterpretedBranchDefinition { Otherwise = true, Target = "Locked" }],
            },
        };

        if (includeUnlockingCompletion)
        {
            transitions.Add(new InterpretedTransitionDefinition
            {
                Source = "Unlocking",
                Event = "MotorStopped",
                Branches = [new InterpretedBranchDefinition { Otherwise = true, Target = "Unlocked" }],
            });
        }

        return transitions;
    }
}
```

Verification before rollout. Before a device type reaches real hardware, run its definition through the interpreted machine verifier. A machine with an unreachable state or a dead end is a device that can get stuck in a state it can never leave, a field failure you want caught at onboarding, not after firmware ships. The loop is author the definition, verify it deterministically, then deploy it.

Dynamic invocation. A single control plane drives every device regardless of type. Because device types are onboarded at runtime and their command sets are not known at compile time, the control plane uses `IActorRegistry` to discover what a device accepts and `IDynamicActorClient` to send a command, with no per-type compiled contract. This calling half is a general capability; see [Dynamic invocation]({{< ref dotnet-actorsnext-dynamic.md >}}).

### Why this was impossible before

Every earlier decision compounds here. The manifest built for state versioning becomes the description of what a device accepts; the declarative state machine built for the auction becomes the format a device type is authored in; the test runtime built for deterministic testing becomes the gate that keeps a broken device type off real hardware; and one stream per type is what lets a device type onboarded at runtime be hosted at all.

It's important to be candid about the boundary: interpreted actors carry a dynamic state bag, so the typed migration story from [Part 2]({{< ref dotnet-actorsnext-tutorial-migration.md >}}) deliberately does not apply. Versioning a device type means versioning its definition document as data, not writing an `IActorStateUpcaster`.

## The test

The gate is testable: a bad definition is rejected before it can be activated, and a good one passes.

```csharp
[Fact]
public void Verification_rejects_device_type_that_can_strand_a_lock()
{
    var verifier = new InterpretedMachineVerifier(new DeviceCapabilityRegistry());
    var stranded = DeviceManagementDemo.SmartLockDefinition(includeUnlockingCompletion: false);

    var result = DeviceManagementDemo.Verify(verifier, stranded);

    Assert.False(result.IsValid);
    Assert.Contains(result.Defects, defect => defect.Contains("State 'Unlocking' is a dead end", StringComparison.Ordinal));
}

[Fact]
public async Task Definition_with_unregistered_effect_is_rejected_before_rollout()
{
    var registry = new DeviceCapabilityRegistry();
    var verifier = new InterpretedMachineVerifier(registry);
    var store = new InMemoryInterpretedMachineStore();
    var deployer = new InterpretedMachineDeployer(verifier, store);
    var definition = DeviceManagementDemo.SmartLockDefinition(motorEffect: "UnknownMotor");

    Assert.False(registry.TryGetEffect("UnknownMotor", out _));
    var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => deployer.DeployAsync("SmartLock", FrontDoor, definition).AsTask());
    Assert.Contains("Effect 'UnknownMotor'", ex.Message, StringComparison.Ordinal);
    Assert.Null(await store.GetAsync("SmartLock", FrontDoor));
}
```

`FrontDoor` is `ActorId.Create("front-door")`, and `DeviceCapabilityRegistry` is the example's `ICapabilityRegistry` that registers the vetted `CheckBattery` guard and `ActuateMotor` effect by name; an effect that isn't registered (like `UnknownMotor`) fails verification, so the deploy is rejected before anything is stored.

### Why the test is the gate

Verification is not a nice-to-have; it is what makes running a definition you did not compile safe, and you can test the gate itself. The same kind of structural checking that validates a compiled state machine in [Part 4]({{< ref dotnet-actorsnext-tutorial-auction.md >}}), here run through the interpreted machine verifier, validates a device-type definition expressed as data, so you can refuse to roll out a device type that can strand a device before any hardware runs it. The capability registry test proves the other half of the safety story: a definition can reference only actions you have vetted and registered, so a typo or an unsupported effect fails at validation, not on a device in the field.

It should be noted that behavioral testing of a fully dynamic machine is shallower than for a typed one, since there is no compile-time contract to assert against. Structural verification plus the vetted capability registry carry the safety weight here, rather than rich behavioral assertions.

## See also

- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Dynamic invocation]({{< ref dotnet-actorsnext-dynamic.md >}})
- [Testing]({{< ref dotnet-actorsnext-testing.md >}})
- Next: [Part 6: Composing interpreted actors with workflows]({{< ref dotnet-actorsnext-tutorial-approvals.md >}})
- Back to the [tutorial overview]({{< ref "_index.md" >}})
