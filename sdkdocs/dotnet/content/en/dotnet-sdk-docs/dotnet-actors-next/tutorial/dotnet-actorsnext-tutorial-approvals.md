---
type: docs
title: "Part 6: Composing interpreted actors with workflows"
linkTitle: "6. Approvals + workflows"
weight: 166000
description: "Runtime-defined approval machines that hand off to a settlement workflow, with retry and compensation, tested without a sidecar"
---

The sixth example puts the interpreted runtime from [Part 5]({{< ref dotnet-actorsnext-tutorial-interpreted.md >}}) next to a Dapr Workflow and shows the two composing. An approval document is a long-lived, addressable entity, so it is an interpreted state-machine actor whose behavior is authored as data. Settling an approved document is a finite, failure-prone process, so it is a workflow. The entity starts the workflow, and the workflow drives the entity back; each does what it is good at.

The scenario is a document-routing platform. Each document type, an expense report or a contract, is a state machine supplied at runtime, and one compiled `InterpretedStateMachineActor` runs every one of them, so a new document type is configuration rather than a code deploy. When a document reaches `Approved`, a vetted effect starts a settlement workflow that notifies parties, charges under a retry policy, and compensates if the charge cannot be made good.

Code for this part: `/examples/Actor.Next/06-Approvals/`.

## Two layers: one compiled runtime, many dynamic behaviors

This example is built from two layers that never mix, and keeping them apart is the whole point.

The compiled layer ships in the assembly and is registered once at startup: the single `InterpretedStateMachineActor` type, the `ICapabilityRegistry` of vetted guards and effects (`WithinApprovalLimit`, `StartSettlement`, and the rest), the `InterpretedMachineVerifier`, the `InterpretedMachineDeployer`, the definition store, and the `SettlementWorkflow`. None of it knows an expense report from a contract; it is generic machinery that never has to be re-registered when a new document type appears.

The dynamic layer is the `InterpretedMachineDefinition` itself (its states, transitions, branches, and the guard and effect names it composes from) authored as data and deployed per document type at onboarding time. The `ExpenseReport()` and `Contract()` builders look like logic, but they are data factories: their output is the dynamic part, and in a real system that same definition could arrive as JSON from a database or an HTTP body with no recompile. Two genuinely different machines — one with a `LegalReview` stage, one without — run on the one compiled actor precisely because the difference lives in data, not in code.

The two layers meet by name, never by reference. Exactly as invoking an actor requires its name, a definition never holds a compiled guard or effect; it holds a string like `"StartSettlement"` that binds to the compiled `IActorEffect` at runtime through the capability registry. Verification is the single checkpoint that guarantees the binding will succeed: `InterpretedMachineVerifier` runs inside `InterpretedMachineDeployer.DeployAsync`, right before a definition is stored, and rejects any definition whose shape is unsound (a dead-end or unreachable state) or that names a guard or effect the registry does not vet. A broken document type is caught at onboarding, not on a live document.

Because behavior is data and the runtime is compiled, adding a new document type is configuration rather than a code deploy. The sections that follow are just this split in motion: a document type authored as data, a compiled effect that is the seam to the workflow, and a compiled workflow that drives the data-defined document back — none of the compiled pieces naming a single document type.

## What you build

### A document type, authored as data

The expense-report machine is an `InterpretedMachineDefinition` document. Its `Approved` state carries an entry effect, `StartSettlement`, that is the seam to the workflow. The optional flag builds a deliberately-stranded machine for a test, and the effect name is a parameter so a test can reference an unregistered effect.

```csharp
public static InterpretedMachineDefinition ExpenseReport(
    bool includeSettlementCompletion = true,
    string settlementEffect = StartSettlementEffect) =>
    new()
    {
        DocumentVersion = 1,
        InitialState = "Draft",
        InitialData = InitialData("ExpenseReport"),
        States =
        [
            new InterpretedStateDefinition { Name = "Draft" },
            new InterpretedStateDefinition { Name = "Submitted" },
            new InterpretedStateDefinition { Name = "InReview" },
            new InterpretedStateDefinition { Name = "Escalated" },
            new InterpretedStateDefinition { Name = "Approved", EntryEffects = [settlementEffect] },
            new InterpretedStateDefinition { Name = "Rejected", Terminal = true },
            new InterpretedStateDefinition { Name = "Archived", Terminal = true },
            new InterpretedStateDefinition { Name = "SettlementFailed", Terminal = true },
        ],
        Transitions = [ /* Submit, BeginReview, and the shared review/approve/settle tail */ ],
    };
```

The `InReview` transition uses a named guard: amounts at or below the auto-approval limit go straight to `Approved`, everything else escalates to a manager. The contract type reuses the same tail but inserts a `LegalReview` stage, so the two document types are genuinely different machines running on the same compiled actor.

```csharp
new()
{
    Source = "InReview",
    Event = "Approve",
    Branches =
    [
        new InterpretedBranchDefinition { Guards = ["WithinApprovalLimit"], Target = "Approved", Effects = ["RecordDecision"] },
        new InterpretedBranchDefinition { Otherwise = true, Target = "Escalated", Effects = ["NotifyManager"] },
    ],
}
```

### The composition seam: actor to workflow

`StartSettlement` is a compiled `IActorEffect` in the capability registry, constructed with an injected `IDaprWorkflowClient`. On entry into `Approved` it schedules the workflow with a deterministic instance id derived from the actor type and document id. A method invocation is an event, and like any actor invocation it is at-least-once, so a re-run of the approving turn re-schedules the same instance rather than starting a second workflow. That deterministic id is the re-run-safety rule from [State machine actors]({{< ref "dotnet-actorsnext-statemachine.md" >}}) applied to a real external side effect.

```csharp
public async ValueTask ExecuteAsync(ActorCapabilityContext context, CancellationToken cancellationToken = default)
{
    var bag = ApprovalCapabilityRegistry.State(context);
    var input = new SettlementInput(
        DocumentId: context.ActorId.Value,
        DocumentType: bag.Get<string>("documentType") ?? context.ActorType,
        Requester: bag.Get<string>("requester") ?? string.Empty,
        Amount: bag.Get<decimal>("amount"),
        Parties: bag.Get<string[]>("parties") ?? [],
        SimulateChargeFailure: bag.Get<bool>("simulateChargeFailure"));

    var instanceId = InstanceIdFor(context.ActorType, context.ActorId.Value);   // "settlement-{type}-{id}"
    await workflowClient.ScheduleNewWorkflowAsync(WorkflowName, instanceId, input);
}
```

### The settlement workflow: retry, compensate, and drive the entity back

The workflow fans out notifications, charges under a retry policy, and if the charge exhausts its retries it compensates and drives the document to `SettlementFailed`; on success it drives it to `Archived`. Driving the document back uses `IDynamicActorClient`, the workflow-to-actor half of the composition, with no compiled document contract.

```csharp
public override async Task<SettlementResult> RunAsync(WorkflowContext context, SettlementInput input)
{
    // 1. Fan out: notify every party in parallel.
    await Task.WhenAll(input.Parties.Select(party =>
        context.CallActivityAsync(nameof(NotifyPartiesActivity), new PartyNotification(input.DocumentId, party))));

    // 2. Retry: charge under a backoff policy.
    try
    {
        await context.CallActivityAsync(
            nameof(ChargeOrProvisionActivity),
            new ChargeRequest(input.DocumentId, input.Amount, input.SimulateChargeFailure),
            ChargeRetry);
    }
    catch (WorkflowTaskFailedException)
    {
        // 3. Compensate, then report the failure back to the document entity.
        await context.CallActivityAsync(nameof(ReleaseReservationActivity), new ReleaseRequest(input.DocumentId, input.Amount));
        await context.CallActivityAsync(nameof(SignalDocumentActivity), new DocumentSignal(input.DocumentId, "SettlementFailed"));
        return new SettlementResult(Settled: false, FinalState: "SettlementFailed");
    }

    // 4. Success: drive the document to its archived outcome.
    await context.CallActivityAsync(nameof(SignalDocumentActivity), new DocumentSignal(input.DocumentId, "SettlementCompleted"));
    return new SettlementResult(Settled: true, FinalState: "Archived");
}
```

`SignalDocumentActivity` calls back into the interpreted actor over the dynamic path, `client.InvokeAsync("ApprovalDocument", documentId, "Raise", ...)`, raising `SettlementCompleted` or `SettlementFailed`. The document's turn runs after the approving turn has already committed, so this is a well-ordered follow-up rather than a re-entrant call.

## The tests

The composition is testable with no sidecar and no workflow engine, from both sides of the seam.

### The actor starts the workflow, re-run safely

Driving a document to `Approved` through the interpreted machine (with a fake workflow client) proves the entry effect schedules the workflow, and running the entry effect twice proves it does not start a second one, because the instance id is deterministic.

```csharp
[Fact]
public async Task Approving_schedules_settlement_with_a_deterministic_id_and_does_not_double_schedule()
{
    var scheduled = new List<string>();
    var workflowClient = new Mock<IDaprWorkflowClient>();
    workflowClient
        .Setup(client => client.ScheduleNewWorkflowAsync(It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<object?>()))
        .Returns((string _, string? instanceId, object? _) => { scheduled.Add(instanceId!); return Task.FromResult(instanceId!); });

    var effect = new StartSettlementEffect(workflowClient.Object, NullLogger.Instance);
    var context = ApprovedContext("exp-9", amount: 250m, parties: ["finance", "alice"]);

    await effect.ExecuteAsync(context);
    await effect.ExecuteAsync(context);   // simulate an at-least-once re-run of the approving turn

    var expected = StartSettlementEffect.InstanceIdFor("ApprovalDocument", "exp-9");
    Assert.All(scheduled, id => Assert.Equal(expected, id));
    Assert.Single(scheduled.Distinct());   // Dapr dedups by instance id, so a single workflow runs
}
```

### The workflow retries and compensates

The workflow runs directly against a mocked `WorkflowContext`, the same technique the [testing]({{< ref "dotnet-actorsnext-testing.md" >}}) tools use for actors. One test makes the charge succeed and asserts the document is archived; the other makes the charge exhaust its retries (a `WorkflowTaskFailedException`) and asserts compensation runs and the document is driven to `SettlementFailed`.

```csharp
[Fact]
public async Task Charge_that_exhausts_its_retries_compensates_and_fails_the_document()
{
    var input = new SettlementInput("exp-2", "ExpenseReport", "carol", 8500m, ["finance", "carol", "vendor"], SimulateChargeFailure: true);
    var context = MockContext();
    context.Setup(ctx => ctx.CallActivityAsync(nameof(ChargeOrProvisionActivity), It.IsAny<ChargeRequest>(), It.IsAny<WorkflowTaskOptions>()))
        .Returns(Task.FromException(new WorkflowTaskFailedException("charge failed", new WorkflowTaskFailureDetails("Declined", "Charge was declined"))));

    var result = await new SettlementWorkflow().RunAsync(context.Object, input);

    Assert.False(result.Settled);
    Assert.Equal("SettlementFailed", result.FinalState);
    context.Verify(ctx => ctx.CallActivityAsync(nameof(ReleaseReservationActivity), It.IsAny<ReleaseRequest>(), It.IsAny<WorkflowTaskOptions>()), Times.Once());
    context.Verify(ctx => ctx.CallActivityAsync(nameof(SignalDocumentActivity), It.Is<DocumentSignal>(s => s.EventName == "SettlementFailed"), It.IsAny<WorkflowTaskOptions>()), Times.Once());
}
```

A verification test rounds it out: a stranded definition (an `Approved` state with no way out) and a definition referencing an unregistered effect are both rejected before rollout, exactly as in Part 5, so a broken document type cannot be onboarded.

### Why this composition is the point

A state machine actor and a workflow are easy to confuse, and this example demonstrates a more concrete boundary. The document is reactive, addressable, and long-lived: it answers where a document is right now and reacts to submit, review, and decision events over an indefinite life, which is what a state-machine actor is good at. Settlement is a bounded sequence with retries, a compensating undo, and a definite end, which is what a workflow is good at and what would bloat an actor turn. Named states make the seam obvious, because the transition into `Approved` is the natural place to start the workflow that state implies, and the workflow's terminal outcome is the natural event to raise back.

## Authoring and testing arc

Each tutorial grew a little more ambitious than the last, but the testing is the throughline: Minimal testing was necessary in part 1, then the testing proved a state migration without a database. Then we validated an event flow without a PubSub broker, made a race condition repeatable, and finally saw the state machine verifier implemented as a deployment gate. The takeaway: The old SDK could run actors; the new one lets you prove they are correct, including behavior that does not exist until runtime.

## See also

- [State machine actors]({{< ref dotnet-actorsnext-statemachine.md >}})
- [Runtime-defined state machines]({{< ref dotnet-actorsnext-tutorial-interpreted.md >}})
- [Dynamic invocation]({{< ref dotnet-actorsnext-dynamic.md >}})
- Back to the [tutorial overview]({{< ref "_index.md" >}})
