---
type: docs
title: "Call actors with the JavaScript SDK"
linkTitle: "Call actors"
weight: 30000
description: Use actor identities, typed proxies, dynamic invocations, and the lower-level actor client
---

Use a long-lived `DaprClient` and reuse an `ActorProxyBuilder` to call actors. These examples target `@dapr/dapr` 3.19.0 or later and use the counter contract and implementation from the [how-to guide]({{% ref js-actors-howto.md %}}).

## Build a proxy for a known identity

```typescript
import {
  ActorId,
  ActorProxyBuilder,
  CommunicationProtocolEnum,
  DaprClient,
} from "@dapr/dapr";
import { CounterActor } from "./CounterActor";
import type { CounterActorContract } from "./CounterActorContract";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

const builder = new ActorProxyBuilder<CounterActorContract>(CounterActor, client);
const counter = builder.build(new ActorId("counter-1"));
console.log(await counter.add(5));
console.log(await counter.get());
```

Run the statements inside an async function. Await every remote call and handle failures at your application's error boundary.

`ActorId` requires a non-empty string. Use a stable ID, such as an order or device ID, to return to the same actor. `ActorId.createRandomId()` generates a new identity. `getId()` and `toString()` return the raw ID; `getURLSafeId()` returns its URI-encoded form. Pass `ActorId` objects to the SDK rather than pre-encoding their contents. Runtime APIs can impose additional identifier restrictions.

The builder uses the class's runtime `name` as the actor type. It does not instantiate that class locally. A separate client does not have to import the host implementation: it can use a client-side contract class with the same runtime name and method shape. Alternatively, use a dynamic invocation with the exact registered type name.

The generic interface checks calls at compile time only. The SDK creates a JavaScript `Proxy` that forwards property calls to the sidecar; it does not validate the remote contract or hydrate a local actor instance. Do not await the proxy itself or treat it as a local data object; await its method calls.

## Create a proxy with a random identity

For cases where you do not need a predetermined ID:

```typescript
const counter = client.actor.create<CounterActorContract>(CounterActor);
console.log(await counter.add(1));
```

Each `create()` call selects a new random actor ID. Use `builder.build(actorId)` when callers must reconnect to the same actor.

## Choose HTTP or gRPC

The caller can use either sidecar API, regardless of the actor host's HTTP application protocol. For gRPC, create the client using the sidecar's gRPC port:

```typescript
const grpcClient = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});
const grpcBuilder = new ActorProxyBuilder<CounterActorContract>(CounterActor, grpcClient);
const counter = grpcBuilder.build(new ActorId("counter-1"));
console.log(await counter.get());
```

Use string port values. Configure `daprApiToken` or `DAPR_API_TOKEN` when the sidecar requires API-token authentication. Proxy builders inherit the client's resolved options.

## Access the lower-level actor API

`DaprClient.actor` exposes **`create()`**, not the individual invocation, state, and reminder methods. Those methods are available through the builder's actor client:

```typescript
const actors = builder.actorClient.actor;

const result = await actors.invoke(
  "CounterActor",
  new ActorId("counter-1"),
  "add",
  [3],
);
console.log(result);
```

This is the same lower-level API used by the proxy. It exposes:

| Methods | Purpose |
|---------|---------|
| `invoke(type, id, method, body?)` | Invoke a named method |
| `stateGet(type, id, key)`, `stateTransaction(type, id, operations)` | Read actor state and execute state transactions |
| `registerActorTimer(type, id, name, timer)`, `unregisterActorTimer(type, id, name)` | Manage timers |
| `registerActorReminder(type, id, name, reminder)`, `unregisterActorReminder(type, id, name)` | Manage individual reminders |
| `getActorReminder(type, id, name)` | Retrieve normalized reminder configuration |
| `listActorReminders(type, id?)` | List reminders, subject to protocol and runtime support |
| `unregisterActorRemindersByType(type, id?)` | Delete matching reminders in bulk over gRPC |

See [manage actor state]({{% ref js-actors-state.md %}}) and [use timers and reminders]({{% ref js-actors-timers-reminders.md %}}) for details.

The lower-level interface also declares `getActors()`, but it is not a portable discovery API: gRPC returns active actor counts from sidecar metadata, while the HTTP implementation does not target a valid discovery endpoint in this release. Use `server.actor.getRegisteredActors()` for local registration information and `client.metadata.get()` for sidecar metadata instead.

## Arguments and serialization

Proxies send supplied method arguments as a JSON array; a call without arguments sends `null`. The host spreads a top-level array into positional arguments, so JavaScript actor methods can accept multiple arguments:

```typescript
// A proxy call:
await counter.add(3);

// The equivalent lower-level invocation body:
await actors.invoke("CounterActor", new ActorId("counter-1"), "add", [3]);
```

For a method accepting one array argument, send an outer argument array: `[[1, 2, 3]]`. A non-array object body is passed as one argument. For cross-SDK calls, agree on the actor type, method name, JSON shape, and argument convention explicitly; the JavaScript positional-array convention is not a universal actor contract.

Use argument arrays for scalar values as well: pass `[false]`, `[0]`, or `[""]`, rather than the scalar itself. The lower-level invocation paths can omit falsy scalar bodies.

Use JSON-compatible data-transfer objects. TypeScript types do not restore class prototypes or `Date` instances after deserialization. Avoid `BigInt`, circular references, functions, and relying on `undefined` surviving a JSON round trip.

The actor host uses its built-in `BufferSerializer` and HTTP response handling. gRPC invocations encode arguments with `JSON.stringify` and parse response bytes as JSON when possible, otherwise returning text. HTTP responses depend on the response content type. In particular, primitive and `void` responses need not have identical JavaScript types over both transports. Prefer object-shaped responses, such as `{ value: 3 }`, when callers need a predictable contract.

Setting `DaprClientOptions.serializer` does **not** replace the actor host serializer or supply a custom actor serialization pipeline. Actor paths do not wire this option through as the general-purpose application payload APIs do.

## Errors and client lifetime

Transport failures, missing actor types or methods, and actor exceptions reject the awaited call. Do not assume a rejected call means no side effect occurred; design commands and retries to be idempotent where needed.

HTTP runtime failures are `Error` instances whose messages include a JSON envelope with `status`, `error`, and `error_msg`; network failures can have other shapes. gRPC failures preserve Connect RPC error codes. Do not parse every error message as JSON or compare gRPC codes to HTTP status numbers.

After outstanding calls finish, call `await client.stop()` for clients your application owns. Do not stop a shared client after each actor method.
