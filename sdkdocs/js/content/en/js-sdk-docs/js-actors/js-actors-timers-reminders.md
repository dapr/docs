---
type: docs
title: "Use actor timers and reminders with the JavaScript SDK"
linkTitle: "Timers and reminders"
weight: 50000
description: Schedule actor callbacks, inspect reminders, and safely remove reminders in bulk
---

Timers schedule work during an actor's activation. Reminders are durable and can reactivate an actor after deactivation or failover. Dapr runs the scheduling; the SDK registers callbacks and dispatches them to your actor. These examples target `@dapr/dapr` 3.19.0 or later.

See [actor timers and reminders]({{% ref actors-timers-reminders.md %}}) for runtime scheduling and retry semantics. Modern Dapr runtimes persist reminders in the Scheduler service, not in the actor's in-memory fields.

## Register callbacks inside an actor

Use the `AbstractActor` helpers from an application method. Import `Temporal` from `@dapr/dapr`:

```typescript
import { AbstractActor, Temporal } from "@dapr/dapr";

export interface ScheduledActorContract {
  start(): Promise<void>;
  cancel(): Promise<void>;
}

export class ScheduledActor extends AbstractActor implements ScheduledActorContract {
  async start(): Promise<void> {
    await this.registerActorTimer(
      "heartbeat",
      "onHeartbeat",
      Temporal.Duration.from({ seconds: 2 }),
      Temporal.Duration.from({ seconds: 30 }),
      Temporal.Duration.from({ minutes: 5 }),
      "heartbeat",
    );

    await this.registerActorReminder(
      "follow-up",
      Temporal.Duration.from({ minutes: 1 }),
      Temporal.Duration.from({ minutes: 5 }),
      Temporal.Duration.from({ hours: 1 }),
      "follow-up",
    );
  }

  async onHeartbeat(data: unknown): Promise<void> {
    console.log("Timer:", data);
  }

  async receiveReminder(data: unknown): Promise<void> {
    console.log("Reminder:", data);
  }

  async cancel(): Promise<void> {
    await this.unregisterActorTimer("heartbeat");
    await this.unregisterActorReminder("follow-up");
  }
}
```

Register `ScheduledActor` on the HTTP host just like the actor in the [how-to guide]({{% ref js-actors-howto.md %}}), then call `start()` through a proxy. Both callbacks participate in the usual pre/post method hooks and successful state-save path.

The helper signatures are:

```text
registerActorTimer(name, callback, dueTime, period?, ttl?, state?)
registerActorReminder(name, dueTime, period?, ttl?, state?)
unregisterActorTimer(name)
unregisterActorReminder(name)
```

The required helper `dueTime` is a `Temporal.Duration`. `period` and `ttl` are optional durations. Omit `period` for a one-shot callback; use `undefined` placeholders when supplying later optional arguments. For example:

```typescript
await this.registerActorReminder(
  "once",
  Temporal.Duration.from({ seconds: 10 }),
  undefined,
  undefined,
  "one-shot",
);
```

Keep the TTL long enough for the first due time and any desired repetitions. The runtime validates scheduling values. Prefer time-based durations such as seconds, minutes, and hours: the HTTP registration implementation converts the `Temporal` string to a Go-style duration and does not correctly encode calendar/day duration strings. These helpers do not accept absolute timestamps, cron expressions, or repetition-count strings.

Timer callbacks use the method name supplied as `callback`. Every reminder calls **`receiveReminder(data)`**. The JavaScript callback does not receive the reminder name, due time, or period as separate arguments. Include a discriminator in the data when sharing one callback between several reminders. The inherited `receiveReminder` only logs a warning; override it to perform work.

The callback data is decoded by the built-in buffer serializer. Prefer simple string payloads or explicitly serialized JSON that you validate in the callback. Do not assume arbitrary objects and arrays round-trip unchanged through every timer/reminder registration path; arrays are also spread into positional arguments by the dispatcher. Make durable callback processing idempotent because retries can cause repeated delivery.

## Manage schedules from a client

Use the [lower-level actor API]({{% ref "js-actors-client.md#access-the-lower-level-actor-api" %}}). The following setup uses a name-only class: it selects the registered actor type without importing its server implementation.

```typescript
import { ActorId, ActorProxyBuilder, DaprClient, Temporal } from "@dapr/dapr";

class ScheduledActor {}

const client = new DaprClient({ daprHost: "127.0.0.1", daprPort: "3500" });
const actors = new ActorProxyBuilder(ScheduledActor, client).actorClient.actor;
const actorId = new ActorId("device-1");
```

Run this and subsequent client fragments inside an async function. This example assumes `ScheduledActor` is registered on the host. `DaprClient.actor` itself only exposes `create()`; calls such as `client.actor.getActorReminder()` are not supported.

To register a reminder over HTTP:

```typescript
await actors.registerActorReminder("ScheduledActor", actorId, "follow-up", {
  dueTime: Temporal.Duration.from({ minutes: 1 }),
  period: Temporal.Duration.from({ minutes: 5 }),
  ttl: Temporal.Duration.from({ hours: 1 }),
  data: "follow-up",
});
```

Timer registration has the same options plus a required `callback`:

```typescript
await actors.registerActorTimer("ScheduledActor", actorId, "heartbeat", {
  callback: "onHeartbeat",
  dueTime: Temporal.Duration.from({ seconds: 2 }),
  period: Temporal.Duration.from({ seconds: 30 }),
  data: "heartbeat",
});
```

Ensure the actor is active before registering a timer externally, and send timer operations to the sidecar that owns that actor. Registering timers inside an actor method avoids selecting the wrong host. Timers disappear on deactivation; re-register them during a later activation if the application requires them.

The HTTP registration path sends `data` as JSON. gRPC reminder registration uses `data.toString()`, while gRPC timer registration expects data accepted by `Buffer.from`; neither JSON-serializes arbitrary objects. Do not rely on falsy gRPC payloads being transmitted.

Registration and retrieval are not symmetric across protocols. A runtime can store the bytes sent by gRPC registration as a base64-encoded JSON string, and the SDK's reminder queries preserve that string without automatically decoding it. For example, a gRPC registration with `data: "hello"` can be retrieved as `"aGVsbG8="`. Calling `JSON.stringify` before gRPC registration does not by itself restore a JSON round trip. Prefer HTTP registration for JSON payloads, even when querying over gRPC. If you must register over gRPC, define and verify an explicit encoding contract with your runtime and consumers; do not guess whether arbitrary returned strings are base64.

## Retrieve a reminder

`getActorReminder` is available over HTTP and gRPC:

```typescript
const reminder = await actors.getActorReminder("ScheduledActor", actorId, "follow-up");
console.log({
  data: reminder.data,
  dueTime: reminder.dueTime?.toString(),
  period: reminder.period?.toString(),
  remainingTtl: reminder.ttl?.toString(),
});
```

The returned configuration has optional `dueTime`, `period`, `ttl`, and `data` fields. Timing fields are normalized to **`Temporal.Duration`**, not raw runtime strings.

- ISO 8601 and Go-style durations, including subsecond units, are normalized. A period beginning with `@every ` is also accepted.
- Absolute due-time and expiration timestamps become durations relative to retrieval time. `ttl` is the remaining lifetime, not necessarily the originally registered TTL.
- Missing or empty timing fields remain `undefined`. Some Scheduler-backed runtimes omit `ttl` even for expiring reminders. Do not interpret an absent field as proof that no expiration was configured.
- A cron expression or repetition-count period such as `R3/PT1M` cannot be represented by `Temporal.Duration`; retrieval rejects rather than returning a lossy schedule.

HTTP retrieval preserves the runtime's JSON `data`. gRPC retrieval unwraps a protobuf `BytesValue` and parses its bytes as JSON; unsupported envelopes or invalid JSON reject the operation. A missing reminder rejects rather than returning an empty configuration.

## List reminders

For a single actor:

```typescript
import type { NamedActorReminderType } from "@dapr/dapr";

const reminders: NamedActorReminderType[] =
  await actors.listActorReminders("ScheduledActor", actorId);

for (const reminder of reminders) {
  console.log(reminder.actorType, reminder.actorId, reminder.name, reminder.data);
}
```

Keep the type import at module scope. `NamedActorReminderType` contains `name`, `actorType`, and the raw string **`actorId`**, together with the normalized fields returned by `getActorReminder`. It does not expose HTTP's `actorID` spelling or a nested protobuf reminder.

| Operation | Runtime requirement |
|-----------|---------------------|
| HTTP listing with an exact actor ID | Dapr 1.19+ |
| gRPC listing with an exact actor ID | Dapr 1.17+ |
| gRPC listing without an actor ID, across the actor type | Dapr 1.17+ |

The actor ID is an exact filter, not a prefix. HTTP requires it and rejects an omitted ID before sending a request. With a gRPC-configured lower-level client, omit it to list every instance of that type:

```typescript
const allReminders = await grpcActors.listActorReminders("ScheduledActor");
```

Here `grpcActors` is configured as shown in the next section. Ordering is not guaranteed; an empty successful result is `[]`. Malformed entries, unrepresentable timing values, unsupported runtime APIs, and transport errors reject the list operation rather than returning a partial or empty success.

## Unregister reminders and timers

Individual removals work over HTTP and gRPC:

```typescript
await actors.unregisterActorReminder("ScheduledActor", actorId, "follow-up");
await actors.unregisterActorTimer("ScheduledActor", actorId, "heartbeat");
```

Bulk reminder deletion requires gRPC and Dapr 1.17 or later. For example, configure a separate administrative client:

```typescript
import { CommunicationProtocolEnum } from "@dapr/dapr";

const grpcClient = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});
const grpcActors = new ActorProxyBuilder(ScheduledActor, grpcClient).actorClient.actor;

await grpcActors.unregisterActorRemindersByType("ScheduledActor", actorId);
```

Keep the import at module scope. Passing an actor ID deletes reminders only for that exact instance and leaves other instances and actor types unaffected.

{{% alert title="Type-wide deletion is destructive" color="warning" %}}
Omitting the second argument to `unregisterActorRemindersByType("ScheduledActor")` deletes **all reminders for all instances of that actor type** in the sidecar's application scope. Deleted reminders cannot be recovered by this operation. Do not turn a missing user-supplied actor ID into `undefined` unless type-wide deletion is explicitly intended.
{{% /alert %}}

The HTTP implementation throws `HTTPNotSupportedError` for bulk deletion without sending a request. There is no automatic per-reminder HTTP fallback. Both instance-scoped and type-wide gRPC deletion return `Promise<void>`; RPC errors propagate.

This release does not expose timer get/list operations or reminder `overwrite` and `failurePolicy` registration options, even when the runtime supports them. Use the [Actors API reference]({{% ref actors_api.md %}}) for those runtime capabilities rather than adding unsupported properties to SDK calls.

Do not assume registering an existing reminder name replaces its configuration. Runtimes with create-only reminder registration reject duplicates unless `overwrite` is requested, which these SDK helpers cannot express. The `start()` example therefore is not an idempotent scheduling operation. Use the runtime API when replacement is required, or explicitly unregister before recreating the reminder, accounting for the gap and reset schedule.

After administrative work completes, stop clients your application owns with `await client.stop()` and `await grpcClient.stop()`.
