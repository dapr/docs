---
type: docs
title: "JavaScript SDK for Actors"
linkTitle: "Actors"
weight: 3000
description: Author, host, and call virtual actors with the Dapr JavaScript SDK
---

The Dapr JavaScript SDK lets Node.js applications host virtual actors, call actors through proxies or by method name, manage actor state, and schedule timers and durable reminders.

These guides target **`@dapr/dapr` 3.19.0-rc.4 or later**. Use a supported Node.js LTS release and a Dapr runtime that supports the APIs you use. The [how-to guide]({{% ref js-actors-howto.md %}}) uses HTTP actor hosting and a local Dapr environment.

## Choose a guide

| Guide | Learn how to |
|-------|--------------|
| <span id="pre-requisites"></span><span id="scenario"></span>[Run and use virtual actors]({{% ref js-actors-howto.md %}}) | Create a contract, implement an actor, configure a state store, and run a host and client |
| <span id="actor-interface"></span><span id="actor-implementation"></span><span id="configuring-actor-runtime"></span>[Author and host actors]({{% ref js-actors-usage.md %}}) | Register types, use lifecycle hooks, and configure the actor runtime |
| <span id="invoking-actor-methods"></span>[Call actors]({{% ref js-actors-client.md %}}) | Choose actor identities, build proxies, invoke methods dynamically, and understand serialization |
| <span id="using-states-with-actor"></span>[Manage actor state]({{% ref js-actors-state.md %}}) | Read, update, remove, cache, and explicitly save actor state |
| <span id="actor-timers-and-reminders"></span><span id="actor-timers"></span><span id="actor-reminders"></span>[Use timers and reminders]({{% ref js-actors-timers-reminders.md %}}) | Schedule callbacks, retrieve and list reminders, and perform scoped or type-wide cleanup |

## Protocol and runtime support

The application protocol and the protocol used to call the sidecar are separate choices.

| Capability | HTTP | gRPC |
|------------|------|------|
| Host JavaScript actors with `DaprServer` | Supported | Not implemented |
| Invoke actor methods through a proxy or the lower-level actor client | Supported | Supported |
| Read and transact actor state; register and unregister timers and individual reminders | Supported | Supported |
| Retrieve an individual reminder with `getActorReminder` | Supported | Supported |
| List reminders for one actor with `listActorReminders` | Dapr 1.19+, including 1.19.0-rc.4 | Dapr 1.17+ |
| List reminders for every instance of an actor type | Not supported | Dapr 1.17+ |
| Delete reminders in bulk with `unregisterActorRemindersByType` | Not supported | Dapr 1.17+ |

A gRPC client can call actors hosted by an HTTP application. It does not require a gRPC actor host. JavaScript actor hosting does not implement the runtime's [app-initiated actor streams]({{% ref actors-app-initiated-streams.md %}}).

The SDK does not expose every feature of the runtime's [Actors API]({{% ref actors_api.md %}}). For example, this SDK version has no high-level timer retrieval/listing methods or reminder `overwrite` and `failurePolicy` options. See the individual guides for serialization and reentrancy limitations.

## Registering actors

Call `await server.actor.init()` and `await server.actor.registerActor(YourActor)` before `await server.start()`. Registration advertises an actor **type**; it does not create every actor instance. Dapr activates instances on demand.

See [author and host actors]({{% ref js-actors-usage.md %}}) for registration and configuration, or follow the [complete example]({{% ref js-actors-howto.md %}}).

## Related links

- [Actors overview]({{% ref actors-overview.md %}})
- [Actor features and concepts]({{% ref actors-features-concepts.md %}})
- [JavaScript SDK actor examples](https://github.com/dapr/js-sdk/tree/main/examples/http/actor)
- [Parking sensor example](https://github.com/dapr/js-sdk/tree/main/examples/http/actor-parking-sensor)
