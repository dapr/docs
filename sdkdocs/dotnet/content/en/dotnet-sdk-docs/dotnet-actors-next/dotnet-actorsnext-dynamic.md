---
type: docs
title: "Dynamic actor invocation in the .NET SDK"
linkTitle: "Dynamic invocation"
weight: 145000
description: "Call actors by type, id, and method with no compile-time contract, for gateways, tooling, and cross-language callers"
---

Most application code calls actors through the strongly-typed proxy, which needs the actor's contract interface at compile time. Dynamic invocation is the other path: call an actor by its type name, id, and method with a serialized payload, without a compile-time contract. This is the actor protocol itself rather than a .NET authoring feature, which is what makes it the language-agnostic way to call actors and a distinctly different capability from the rest of the SDK.

## Calling is not hosting

The most important thing to understand first: calling an actor does not require hosting, registering, or referencing it. A caller supplies a type name, an id, a method name, and a payload, and the runtime routes the call to whichever app in the cluster hosts that type. The caller does not implement the actor, does not call `AddDaprActors()` to call, and does not need the actor's assembly.

This is the inverse of the advertisement requirement on the hosting side. An app that hosts actors advertises the types it hosts so the runtime can route inbound calls to it. A caller advertises nothing; it just calls. The strongly-typed proxy and the dynamic client are both callers, and neither hosts anything by virtue of calling.

## The .NET surface

Two pieces, discovery and invocation.

`IActorRegistry` is discovery. The source generator emits it from the actors this app hosts, carrying each type, its methods, and their parameter and return types. This is genuinely new: the Dapr runtime metadata lists only actor type names, while the generated registry carries full signatures, so code in this app can enumerate what it exposes and how to call it.

```csharp
public interface IActorRegistry
{
    IReadOnlyList<ActorTypeDescriptor> Actors { get; }
    bool TryGet(string actorType, out ActorTypeDescriptor descriptor);
}
```

`IDynamicActorClient` is invocation. It calls by string, with the arguments as JSON and the result as JSON.

```csharp
public interface IDynamicActorClient
{
    Task<string?> InvokeAsync(string actorType, string actorId, string method,
                              string argsJson, CancellationToken cancellationToken = default);
}
```

A small gateway that lists what it hosts and forwards a call:

```csharp
public sealed class ActorGateway(IActorRegistry registry, IDynamicActorClient client)
{
    public IReadOnlyList<ActorTypeDescriptor> Catalog() => registry.Actors;   // types + signatures

    public Task<string?> Forward(string type, string id, string method, string argsJson)
        => client.InvokeAsync(type, id, method, argsJson);
}
```

Note the scope of each: `IActorRegistry` reflects the types this app hosts, so it is discovery of what this app exposes. `IDynamicActorClient` can call any type the cluster hosts, whether or not this app hosts it and whether or not it appears in this app's registry. When you call a type hosted by another app, you supply its type and method from a contract you already know, not from local discovery.

## Cross-language calling

Because a call is a type name, an id, a method name, and a serialized payload with a content type, a .NET app can dynamically invoke an actor implemented in another language, and be invoked from one, over the same protocol. This is the strongest reason dynamic invocation exists as its own capability.

The .NET SDK controls only the .NET side of that exchange. It serializes and deserializes the .NET payloads it sends and receives through `IDaprSerializer` and sets and reads the content type. It has no control over how another language serializes its payloads, names its methods, or marshals its errors. Cross-language interop is therefore a payload-schema coordination problem that you own: agree on a wire format (JSON is the natural default for the dynamic path), agree on the content type, and validate what arrives. Treat the other side's conventions as an external contract, not something the SDK settles.

Everything below this point is about what the .NET SDK does on its own side of the call.

## Serialization is the same wire, without a proxy in between

The payload on the wire is identical to the strongly-typed path: serialized bytes plus a content type, with no remoting-versus-non-remoting distinction. The difference is only where serialization happens on the calling side. The strongly-typed proxy serializes your typed arguments for you through `IDaprSerializer`; the dynamic client takes arguments you have already serialized to JSON and sends them as-is. On the receiving side there is no difference at all: the hosting actor's dispatcher deserializes the payload into the method's parameter type through `IDaprSerializer` exactly as it would for a strongly-typed call.

## The result model still applies

A dynamically invoked method that raises an application error returns that error the same way a strongly-typed call does, as an error payload the runtime passes back to the caller verbatim. The difference is reconstruction. The strongly-typed proxy rebuilds and rethrows the error as its CLR exception type, because it knows the contract. The dynamic client has no contract to rebuild against, so it surfaces the raw error payload and its content type and leaves interpretation to you. Plan to inspect the returned error rather than to catch a typed exception.

## The delivery contract still applies

Dynamic invocation does not change delivery semantics, because those are a property of the invoke path, not of how you called it. A dynamically invoked method is at-least-once: a call the runtime pulled but could not confirm is retried, so the actor method must be safe to run more than once. This is the same contract that governs the strongly-typed path, reminders, and subscription deliveries. If you expose dynamic invocation through a gateway, the actors behind it still need idempotent handlers.

## When to use it

- A gateway or API layer that forwards calls to actors it does not reference at compile time.
- Admin or operational tooling that invokes actors generically by type and method.
- A cross-language caller, where a compile-time .NET contract does not exist by definition.
- An agent that discovers callable actors from the registry and invokes them, one consumer of this surface among the others.

For actors whose behavior is defined at runtime rather than compiled, dynamic invocation is how you call them, but hosting them is a separate feature; see the agentic material in the [overview]({{< ref _index.md >}}) and the interpreted state machine model. This page is about calling, not about runtime-defined hosting.

## Testing

A dynamic call is drivable in the in-memory test runtime the same way a strongly-typed call is, so you can test a gateway or a generic router without a sidecar.

```csharp
// IDynamicActorClient and IActorRegistry are resolved from the runtime's service
// provider, which the in-memory runtime holds in a private field.
private static IServiceProvider Provider(ActorTestRuntime rt) =>
    (IServiceProvider)rt.GetType()
        .GetField("provider", BindingFlags.Instance | BindingFlags.NonPublic)!
        .GetValue(rt)!;

[Fact]
public async Task Gateway_forwards_a_dynamic_call_to_the_actor()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors(_ => { }));
    rt.CreateActor<ICartActor>(ActorId.Create("u1"), "CartActor");   // host the target in the runtime
    var client = Provider(rt).GetRequiredService<IDynamicActorClient>();

    var json = await client.InvokeAsync("CartActor", "u1", "GetSummary", "{}");

    Assert.NotNull(json);
}

[Fact]
public async Task Registry_exposes_hosted_types_and_their_signatures()
{
    await using var rt = new ActorTestRuntime(services => services.AddDaprActors(_ => { }));
    var registry = Provider(rt).GetRequiredService<IActorRegistry>();

    Assert.True(registry.TryGet("CartActor", out var cart));
    Assert.Contains(cart.Methods, m => m.Name == nameof(ICartActor.GetSummary));
}
```

The first test proves the forward path end to end without infrastructure; the second proves discovery returns the signatures a gateway or agent would route on. See [Testing]({{< ref dotnet-actorsnext-testing.md >}}) for the full runtime.

## Boundaries to keep in mind

- There is no compile-time signature checking. A wrong method name or a malformed `argsJson` fails at runtime, not at build time, which is the cost of not having a contract.
- Contract drift is not caught for you. Because the caller holds no compile-time reference to the target, a change to the target actor's method signature will not break the caller's build; it will surface as a runtime failure or, worse, a silently mismatched payload. Coordinate contract changes out of band, and use the `ContractVersion` on the registry descriptor (where the target is one you host) to detect drift deliberately rather than relying on the compiler to.
- The delivery contract still applies. A dynamically invoked method is at-least-once like any invoke, so the target handler must be re-run-safe; calling dynamically does not opt out of that (see [delivery guarantees]({{< ref "dotnet-actorsnext-howto.md#delivery-guarantees-you-must-design-for" >}})).
- The payload is only as safe as your validation. A gateway or agent that accepts a type, method, and JSON from outside must validate and authorize before invoking; dynamic invocation is a general capability with no built-in allow-list.
- Application errors come back as raw payloads, not reconstructed CLR exceptions (see the result model above).
- Discovery is local. `IActorRegistry` lists the types this app hosts; calling a type hosted elsewhere is by a contract you already know, not by discovery.

## Next steps

- [Author, register, and call actors]({{< ref dotnet-actorsnext-howto.md >}}) for the strongly-typed path and the calling-versus-hosting distinction.
- [Serialization and state migration]({{< ref dotnet-actorsnext-serialization.md >}}) for the serializer the receiving side uses.
- [Testing]({{< ref dotnet-actorsnext-testing.md >}})
