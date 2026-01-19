---
type: docs
title: "JavaScript SDK for Actors"
linkTitle: "Actors"
weight: 3000
description: How to get up and running with Actors using the Dapr JavaScript SDK
---

The Dapr actors package allows you to interact with Dapr virtual actors from a JavaScript application. The examples below demonstrate how to use the JavaScript SDK for interacting with virtual actors.

For a more in-depth overview of Dapr actors, visit the [actors overview page]({{% ref actors-overview %}}).

## Pre-requisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Latest LTS version of Node or greater](https://nodejs.org/en/)
- [JavaScript NPM package installed](https://www.npmjs.com/package/@dapr/dapr)

## Scenario

The below code examples loosely describe the scenario of a Parking Garage Spot Monitoring System, which can be seen in this [video](https://www.youtube.com/watch?v=eJCu6a-x9uo&t=3785) by Mark Russinovich.

A parking garage consists of hundreds of parking spaces, where each parking space includes a sensor that provides updates to a centralized monitoring system. The parking space sensors (our actors) detect if a parking space is occupied or available.

To jump in and run this example yourself, clone the source code, which can be found in the [JavaScript SDK examples directory](https://github.com/dapr/js-sdk/tree/main/examples/http/actor-parking-sensor).

## Actor Interface

The actor interface defines the contract that is shared between the actor implementation and the clients calling the actor. In the example below, we have created an interace for a parking garage sensor. Each sensor has 2 methods: `carEnter` and `carLeave`, which defines the state of the parking space:

```ts
export default interface ParkingSensorInterface {
  carEnter(): Promise<void>;
  carLeave(): Promise<void>;
}
```

## Actor Implementation

An actor implementation defines a class by extending the base type `AbstractActor` and implementing the actor interface (`ParkingSensorInterface` in this case).

The following code describes an actor implementation along with a few helper methods.

```ts
import { AbstractActor } from "@dapr/dapr";
import ParkingSensorInterface from "./ParkingSensorInterface";

export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  async carEnter(): Promise<void> {
    // Implementation that updates state that this parking spaces is occupied.
  }

  async carLeave(): Promise<void> {
    // Implementation that updates state that this parking spaces is available.
  }

  private async getInfo(): Promise<object> {
    // Implementation of requesting an update from the parking space sensor.
  }

  /**
   * @override
   */
  async onActivate(): Promise<void> {
    // Initialization logic called by AbstractActor.
  }
}
```

### Configuring Actor Runtime

To configure actor runtime, use the `DaprClientOptions`. The various parameters and their default values are documented at [How-to: Use virtual actors in Dapr](https://docs.dapr.io/developing-applications/building-blocks/actors/howto-actors/#configuration-parameters).

Note, the timeouts and intervals should be formatted as [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) strings.

```typescript
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  daprHost: daprHost,
  daprPort: daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  actor: {
    actorIdleTimeout: "1h",
    actorScanInterval: "30s",
    drainOngoingCallTimeout: "1m",
    drainRebalancedActors: true,
    reentrancy: {
      enabled: true,
      maxStackDepth: 32,
    },
    remindersStoragePartitions: 0,
  },
};

// Use the options when creating DaprServer and DaprClient.

// Note, DaprServer creates a DaprClient internally, which needs to be configured with clientOptions.
const server = new DaprServer({ serverHost, serverPort, clientOptions });

const client = new DaprClient(clientOptions);
```

## Registering Actors

Initialize and register your actors by using the `DaprServer` package:

```typescript
import { DaprServer } from "@dapr/dapr";
import ParkingSensorImpl from "./ParkingSensorImpl";

const daprHost = "127.0.0.1";
const daprPort = "50000";
const serverHost = "127.0.0.1";
const serverPort = "50001";

const server = new DaprServer({
  serverHost,
  serverPort,
  clientOptions: {
    daprHost,
    daprPort,
  },
});

await server.actor.init(); // Let the server know we need actors
server.actor.registerActor(ParkingSensorImpl); // Register the actor
await server.start(); // Start the server

// To get the registered actors, you can invoke `getRegisteredActors`:
const resRegisteredActors = await server.actor.getRegisteredActors();
console.log(`Registered Actors: ${JSON.stringify(resRegisteredActors)}`);
```

## Invoking Actor Methods

After Actors are registered, create a Proxy object that implements `ParkingSensorInterface` using the `ActorProxyBuilder`. You can invoke the actor methods by directly calling methods on the Proxy object. Internally, it translates to making a network call to the Actor API and fetches the result back.

```typescript
import { ActorId, DaprClient } from "@dapr/dapr";
import ParkingSensorImpl from "./ParkingSensorImpl";
import ParkingSensorInterface from "./ParkingSensorInterface";

const daprHost = "127.0.0.1";
const daprPort = "50000";

const client = new DaprClient({ daprHost, daprPort });

// Create a new actor builder. It can be used to create multiple actors of a type.
const builder = new ActorProxyBuilder<ParkingSensorInterface>(ParkingSensorImpl, client);

// Create a new actor instance.
const actor = builder.build(new ActorId("my-actor"));
// Or alternatively, use a random ID
// const actor = builder.build(ActorId.createRandomId());

// Invoke the method.
await actor.carEnter();
```

## Using states with Actor

```ts
import { AbstractActor } from "@dapr/dapr";
import ActorStateInterface from "./ActorStateInterface";

export default class ActorStateExample extends AbstractActor implements ActorStateInterface {
  async setState(key: string, value: any): Promise<void> {
    await this.getStateManager().setState(key, value);
    await this.getStateManager().saveState();
  }

  async removeState(key: string): Promise<void> {
    await this.getStateManager().removeState(key);
    await this.getStateManager().saveState();
  }

  // getState with a specific type
  async getState<T>(key: string): Promise<T | null> {
    return await this.getStateManager<T>().getState(key);
  }

  // getState without type as `any`
  async getState(key: string): Promise<any> {
    return await this.getStateManager().getState(key);
  }
}
```

## Actor Timers and Reminders

The JS SDK supports actors that can schedule periodic work on themselves by registering either timers or reminders. The main difference between timers and reminders is that the Dapr actor runtime does not retain any information about timers after deactivation, but persists reminders information using the Dapr actor state provider.

This distinction allows users to trade off between light-weight but stateless timers versus more resource-demanding but stateful reminders.

The scheduling interface of timers and reminders is identical. For an more in-depth look at the scheduling configurations see the [actors timers and reminders docs]({{% ref "howto-actors.md#actor-timers-and-reminders" %}}).

### Actor Timers

```typescript
// ...

const actor = builder.build(new ActorId("my-actor"));

// Register a timer
await actor.registerActorTimer(
  "timer-id", // Unique name of the timer.
  "cb-method", // Callback method to execute when timer is fired.
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  50, // State to be sent to timer callback.
);

// Delete the timer
await actor.unregisterActorTimer("timer-id");
```

### Actor Reminders

```typescript
// ...

const actor = builder.build(new ActorId("my-actor"));

// Register a reminder, it has a default callback: `receiveReminder`
await actor.registerActorReminder(
  "reminder-id", // Unique name of the reminder.
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  100, // State to be sent to reminder callback.
);

// Delete the reminder
await actor.unregisterActorReminder("reminder-id");
```

To handle the callback, you need to override the default `receiveReminder` implementation in your actor. For example, from our original actor implementation:

```ts
export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  // ...

  /**
   * @override
   */
  async receiveReminder(state: any): Promise<void> {
    // handle stuff here
  }

  // ...
}
```

For a full guide on actors, visit [How-To: Use virtual actors in Dapr]({{% ref howto-actors.md %}}).
