---
type: docs
title: "How to: Run and use virtual actors with the JavaScript SDK"
linkTitle: "Run and use actors"
weight: 10000
description: Create an actor contract, host a stateful actor, and call it from a Node.js client
---

This guide creates a counter actor whose state survives deactivation. The host and client share a TypeScript contract and use `@dapr/dapr` 3.19.0 or later.

## Prerequisites

- A supported [Node.js LTS release](https://nodejs.org/en/).
- The [Dapr CLI]({{% ref install-dapr-cli.md %}}) and an [initialized local Dapr environment]({{% ref install-dapr-selfhost.md %}}), including Redis and the Placement service. Scheduler-backed reminders also require the Scheduler service.

## Step 1: Prepare the project

In an empty directory, initialize a Node.js project and install the SDK and TypeScript tooling:

```shell
npm init -y
npm install @dapr/dapr@3.19.0
npm install --save-dev typescript tsx @types/node
```

The command pins the 3.19.0 release used by this guide. You can instead select a later published package version explicitly.

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Step 2: Define the contract

Create `CounterActorContract.ts`:

```typescript
export interface CounterState {
  value: number;
}

export interface CounterActorContract {
  add(amount: number): Promise<CounterState>;
  get(): Promise<CounterState>;
}
```

An interface supplies compile-time checking; it is not a runtime registration or access-control boundary. JavaScript applications can omit TypeScript interfaces.

## Step 3: Implement the actor

Create `CounterActor.ts`:

```typescript
import { AbstractActor } from "@dapr/dapr";
import type { CounterActorContract, CounterState } from "./CounterActorContract";

export class CounterActor extends AbstractActor implements CounterActorContract {
  async add(amount: number): Promise<CounterState> {
    if (!Number.isFinite(amount)) {
      throw new TypeError("amount must be a finite number");
    }

    const manager = this.getStateManager<CounterState>();
    const current = await manager.getOrAddState("counter", { value: 0 });
    const next = { value: (current?.value ?? 0) + amount };
    await manager.setState("counter", next);
    return next;
  }

  async get(): Promise<CounterState> {
    const state = await this.getStateManager<CounterState>().getOrAddState(
      "counter",
      { value: 0 },
    );
    return state ?? { value: 0 };
  }
}
```

The runtime saves tracked state changes after a successful method and post-method hook. You do not need to call `saveState()` in every method. See [manage actor state]({{% ref js-actors-state.md %}}) for explicit saves and failure handling.

## Step 4: Configure the state store

Create a `components` directory and save the following as `components\statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: localhost:6379
    - name: redisPassword
      value: ""
    - name: actorStateStore
      value: "true"
```

This uses Redis from the local Dapr initialization. In production, configure an [actor-compatible state store]({{% ref supported-state-stores.md %}}) with the required transactional support. Only one component per application can be marked as the actor state store.

## Step 5: Register and start the host

Create `server.ts`:

```typescript
import { CommunicationProtocolEnum, DaprServer } from "@dapr/dapr";
import { CounterActor } from "./CounterActor";

async function main(): Promise<void> {
  const server = new DaprServer({
    serverHost: "127.0.0.1",
    serverPort: "3001",
    communicationProtocol: CommunicationProtocolEnum.HTTP,
    clientOptions: {
      daprHost: "127.0.0.1",
      daprPort: "3500",
      communicationProtocol: CommunicationProtocolEnum.HTTP,
    },
  });

  await server.actor.init();
  await server.actor.registerActor(CounterActor);
  await server.start();
  console.log("Registered actor types:", await server.actor.getRegisteredActors());
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

Start the application and its sidecar:

```shell
dapr run --app-id counter-service --app-port 3001 --app-protocol http --dapr-http-port 3500 --resources-path components -- npx tsx server.ts
```

The application listens on port `3001`. The sidecar's HTTP API listens on port `3500`. Wait for the host to report that `CounterActor` is registered.

## Step 6: Call the actor

Create `client.ts`:

```typescript
import { ActorId, ActorProxyBuilder, DaprClient } from "@dapr/dapr";
import { CounterActor } from "./CounterActor";
import type { CounterActorContract } from "./CounterActorContract";

async function main(): Promise<void> {
  const client = new DaprClient({ daprHost: "127.0.0.1", daprPort: "3500" });

  try {
    const builder = new ActorProxyBuilder<CounterActorContract>(CounterActor, client);
    const counter = builder.build(new ActorId("counter-1"));
    console.log(await counter.add(2));
    console.log(await counter.get());
  } finally {
    await client.stop();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

In a second terminal, run:

```shell
npx tsx client.ts
```

For a new actor, both calls print `{ value: 2 }`. Run the client again to increment the same actor to `4`. The client uses the host's sidecar for this local example; a separate application can use its own sidecar.

The actor's identity is the pair `CounterActor` and `counter-1`. Creating a proxy does not activate the actor; invoking a method does.

## Related links

- [Author and host actors]({{% ref js-actors-usage.md %}})
- [Call actors]({{% ref js-actors-client.md %}})
- [Use timers and reminders]({{% ref js-actors-timers-reminders.md %}})
