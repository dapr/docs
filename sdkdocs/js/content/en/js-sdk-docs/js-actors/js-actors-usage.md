---
type: docs
title: "Author and host actors with the JavaScript SDK"
linkTitle: "Author and host actors"
weight: 20000
description: Register actor types, use lifecycle hooks, and configure the JavaScript actor host
---

JavaScript actors derive from `AbstractActor`. The SDK constructs an instance with a `DaprClient` and an `ActorId` when Dapr activates it. See the [how-to guide]({{% ref js-actors-howto.md %}}) for a complete application using `@dapr/dapr` 3.19.0 or later.

## Actor construction and identity

If you define a constructor, accept the two runtime arguments and pass them to the base constructor:

```typescript
import { AbstractActor, ActorId, DaprClient } from "@dapr/dapr";

export class DeviceActor extends AbstractActor {
  constructor(client: DaprClient, id: ActorId) {
    super(client, id);
  }

  async identify(): Promise<{ type: string; id: string }> {
    return {
      type: this.getActorType(),
      id: this.getActorId().getId(),
    };
  }
}
```

You can omit the constructor when no additional initialization is needed. The built-in registration API accepts a class, not a dependency-injection factory, and supplies only those two arguments. It does not provide the .NET SDK's constructor dependency injection or actor-scoped service container.

The registered actor type is the implementation class's `name`, such as `DeviceActor`. There is no separate type-name option on `registerActor`. Keep class names stable across deployments and configure bundlers/minifiers to preserve them. Renaming a class changes the actor type and therefore its identity and state namespace.

## Lifecycle and method hooks

Override these async methods as needed:

| Hook | When it runs |
|------|--------------|
| `onActivate()` | Once per activation, before dispatching the first method or callback |
| `onDeactivate()` | When Dapr requests deactivation, for example after an idle timeout |
| `onActorMethodPre()` | Before each dispatched actor method, timer callback, or reminder callback |
| `onActorMethodPost()` | After a dispatched call completes successfully, before saving tracked state |

For a successful call, the order is activation if needed, pre-method hook, method, post-method hook, and state save. Activation and deactivation hooks also have their tracked changes saved. The SDK clears the state cache before the activation and deactivation hooks.

```typescript
import { AbstractActor } from "@dapr/dapr";

export class LifecycleActor extends AbstractActor {
  async onActivate(): Promise<void> {
    console.log("Activating", this.getActorId().getId());
  }

  async onDeactivate(): Promise<void> {
    console.log("Deactivating", this.getActorId().getId());
  }

  async onActorMethodPre(): Promise<void> {
    console.log("Starting a call");
  }

  async onActorMethodPost(): Promise<void> {
    console.log("Completed a call");
  }
}
```

Do not depend on deactivation for guaranteed cleanup after a process crash. A thrown method skips the post-method hook and automatic state save; see [state failure handling]({{% ref "js-actors-state.md#failures-and-cache-consistency" %}}).

Use `getDaprClient()` inside an actor to access other Dapr building blocks. Await the resulting operations. External side effects, such as publishing messages, are not part of the actor state transaction.

## Register actors and configure the runtime

The actor host must use HTTP. Initialize the callback routes and await all actor registrations **before** starting the server:

```typescript
import { CommunicationProtocolEnum, DaprServer } from "@dapr/dapr";
import { CounterActor } from "./CounterActor";

const server = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: "3001",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  clientOptions: {
    daprHost: "127.0.0.1",
    daprPort: "3500",
    communicationProtocol: CommunicationProtocolEnum.HTTP,
    actor: {
      actorIdleTimeout: "1h",
      actorScanInterval: "30s",
      drainOngoingCallTimeout: "5s",
      drainRebalancedActors: true,
      remindersStoragePartitions: 0,
    },
  },
});

await server.actor.init();
await server.actor.registerActor(CounterActor);
await server.start();
console.log(await server.actor.getRegisteredActors());
```

This fragment uses the `CounterActor` from the how-to guide and runs inside an async function. Set options on **`DaprServer.clientOptions.actor`**, because its embedded client supplies the actor runtime configuration. Setting actor options on an unrelated client does not configure the host.

The host exposes `/healthz`, `/dapr/config`, and the actor invocation, deactivation, timer, and reminder routes. `getRegisteredActors()` returns registered **type names**, not active instance counts. Actor runtime registration is process-wide in this SDK; do not treat multiple `DaprServer` instances in one process as independent actor runtimes.

Timeouts and scan intervals use [Go duration strings](https://pkg.go.dev/time#ParseDuration), such as `"30s"` and `"1h"`, rather than `Temporal.Duration`. Omitted settings are left to the runtime. See [actor runtime configuration]({{% ref actors-runtime-config.md %}}) for defaults and runtime-version-specific behavior. `remindersStoragePartitions` concerns legacy state-store reminder storage, not Scheduler partitioning.

{{% alert title="Reentrancy limitation" color="warning" %}}
The configuration type accepts `reentrancy: { enabled: true, maxStackDepth: 32 }` and advertises it to Dapr. However, the JavaScript actor dispatcher and proxy do not implement reentrancy-context propagation. Do not assume that enabling the option makes actor call cycles, including an actor calling itself, safe. Prefer acyclic actor-to-actor calls and leave reentrancy disabled unless you provide and verify the required integration.
{{% /alert %}}

## Application boundaries and shutdown

Keep the HTTP callback routes reachable by the sidecar. In container deployments, configure the sidecar's application-channel address and container networking so that callbacks reach the application. Loopback addresses refer to the sidecar's own network namespace unless it shares one with the application.

The TypeScript contract does not restrict method dispatch: the dispatcher looks up a callable property on the actor instance by name. Do not rely on omitted interface members or TypeScript `private` modifiers to protect sensitive operations. Keep internal operations outside remotely callable actor methods and use appropriate application and sidecar access controls.

On orderly shutdown, stop accepting new work and await in-flight operations. `await server.stop()` closes the application listener; it does not stop its embedded client. Stop separately owned clients with `await client.stop()` and the embedded client with `await server.client.stop()` when they are no longer needed. Do not assume shutdown invokes every actor's deactivation hook.
