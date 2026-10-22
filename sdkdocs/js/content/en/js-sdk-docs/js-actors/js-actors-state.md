---
type: docs
title: "Manage actor state with the JavaScript SDK"
linkTitle: "Manage actor state"
weight: 40000
description: Use the actor state manager, understand automatic persistence, and handle cache consistency
---

Actors access named state through `this.getStateManager<T>()`. State is scoped to an actor's **type and ID**, and is persisted through the configured actor state store. Ordinary fields on the actor instance are not durable. These examples target `@dapr/dapr` **3.19.0-rc.4 or later**.

## Read and update state

Call `setState` to mark a value as changed, even when you have modified an object returned from the cache:

```typescript
import { AbstractActor } from "@dapr/dapr";

interface DeviceState {
  reading: number;
}

export class DeviceStateActor extends AbstractActor {
  async update(reading: number): Promise<DeviceState> {
    const manager = this.getStateManager<DeviceState>();
    const next = { reading };
    await manager.setState("device", next);
    return next;
  }

  async read(): Promise<DeviceState | null> {
    const [found, state] = await this.getStateManager<DeviceState>().tryGetState("device");
    return found ? state : null;
  }

  async remove(): Promise<void> {
    const manager = this.getStateManager<DeviceState>();
    const [found] = await manager.tryGetState("device");
    if (found) {
      await manager.removeState("device");
    }
  }
}
```

The generic parameter describes the values managed through that reference; it is not a runtime schema or serializer. Use separate typed references for differently shaped state values and validate data at application boundaries. The removal example loads the value into the cache first to avoid the uncached object-existence limitation described below.

## Choose a state operation

| Method | Behavior |
|--------|----------|
| `setState(name, value)` | Track an upsert |
| `getState(name)` | Read cached or persisted state; throws when the state is not found |
| `tryGetState(name)` | Return `[found, value]`; check the flag before using the value |
| `getOrAddState(name, initialValue)` | Return existing state or track the supplied initial value |
| `addOrUpdateState(name, initialValue, updateValueFactory)` | Add an initial value or compute a replacement from `(name, currentValue)` |
| `containsState(name)` | Check the cache or state provider for existence, subject to the limitations below |
| `removeState(name)` | Track a deletion; throws if no state is found |
| `tryRemoveState(name)` | Track a deletion and report whether state was found |
| `saveState()` | Submit tracked changes to the actor state provider |
| `clearCache()` | Discard cached values and pending changes without deleting persisted state |

Although `getState()` is typed as `Promise<T | null>`, absence throws rather than returning `null`. With `tryGetState()`, check the `found` flag rather than treating the value as a presence indicator. The provider can return `undefined` for an absent value even though the declared tuple uses `T | null`.

{{% alert title="State-manager limitations in this release" color="warning" %}}
The state provider uses truthiness and a value's `length` to infer existence. Persisted falsy values, empty strings/arrays, and object values do not behave consistently across existence checks. Prefer object-shaped state with `getOrAddState` or `tryGetState` for reads, and verify absence/deletion behavior for your data shape.

`addState` and `tryAddState` are present, but the uncached existence check in `tryAddState` is inverted; do not rely on them as create-only operations. `getStateNames()` only examines selected entries in the local change tracker, including pending deletions; it does not enumerate persisted keys. Use known state keys rather than treating it as a state-store query.
{{% /alert %}}

## Automatic and explicit persistence

After a dispatched actor method succeeds, the SDK runs `onActorMethodPost()` and then saves tracked changes. The same path is used for timer and reminder callbacks. Activation and deactivation hooks also save their tracked changes on successful completion.

`saveState()` batches tracked additions, updates, and removals into an actor state transaction. Configure a store with the required actor and transaction support. This transaction does not include external side effects.

Save explicitly when an intermediate persistence point is required:

```typescript
const manager = this.getStateManager<{ status: string }>();
await manager.setState("operation", { status: "accepted" });
await manager.saveState();
```

This fragment belongs inside an actor method. A later exception does not undo an explicit save.

The state manager caches values across calls on an active actor. Calling `clearCache()` forces subsequent reads to consult persisted state, but also discards unsaved changes. It is not a deletion API.

## Failures and cache consistency

A thrown method or pre/post hook prevents the normal end-of-call save. The current dispatcher does not automatically roll back or clear cached changes after a failed call, so a later successful call can save changes left by the failed one. The state manager also marks changes as unmodified before awaiting the provider's transaction; do not assume calling `saveState()` again will replay a failed write.

Treat state-save errors as operation failures and reconcile with persisted state before continuing. Where appropriate, use `clearCache()` to discard uncommitted local changes and reload, accounting for the fact that a timed-out transaction might already have committed. Avoid promising application-level rollback or exactly-once effects.

## Lower-level state operations

The [lower-level actor client]({{% ref "js-actors-client.md#access-the-lower-level-actor-api" %}}) supports `stateGet(type, id, key)` and `stateTransaction(type, id, operations)`. They address the actor state store, not an arbitrary named state component.

For example, with the HTTP `actors` client from that guide:

```typescript
await actors.stateTransaction("CounterActor", new ActorId("counter-1"), [
  { operation: "upsert", request: { key: "maintenance-note", value: "reviewed" } },
  { operation: "delete", request: { key: "obsolete-note" } },
]);
```

Keep writes inside actor methods whenever possible. Direct transactions do not update an active instance's state-manager cache or provide an actor method's serialized turn. They can race with actor calls or be overwritten by later cached writes. The gRPC transaction implementation stringifies values rather than applying the HTTP JSON encoding; do not assume structured state has transport parity.
