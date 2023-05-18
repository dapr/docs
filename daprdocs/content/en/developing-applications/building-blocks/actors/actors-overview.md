---
type: docs
title: "Actors overview"
linkTitle: "Overview"
weight: 10
description: "Overview of the actors API building block"
aliases:
  - "/developing-applications/building-blocks/actors/actors-background"
---

The [actor pattern](https://en.wikipedia.org/wiki/Actor_model) describes actors as the lowest-level "unit of computation". In other words, you write your code in a self-contained unit (called an actor) that receives messages and processes them one at a time, without any kind of concurrency or threading.

While your code processes a message, it can send one or more messages to other actors, or create new actors. An underlying runtime manages how, when and where each actor runs, and also routes messages between actors.

A large number of actors can execute simultaneously, and actors execute independently from each other.

## Actors in Dapr

Dapr includes a runtime that specifically implements the [Virtual Actor pattern](https://www.microsoft.com/research/project/orleans-virtual-actors/). With Dapr's implementation, you write your Dapr actors according to the actor model, and Dapr leverages the scalability and reliability guarantees that the underlying platform provides.

Every actor is defined as an instance of an actor type, identical to the way an object is an instance of a class. For example, there may be an actor type that implements the functionality of a calculator and there could be many actors of that type that are distributed on various nodes across a cluster. Each such actor is uniquely identified by an actor ID.

<img src="/images/actor_background_game_example.png" width=400>

## Actor types and IDs

To communicate with an actor, you need to know its actor _type_ and actor _id_. 

- **Actor type** uniquely identifies the actor implementation across the whole application. 
- **Actor ID** uniquely identifies an instance of that type.

If you don't have an actor `id` and want to communicate with a new instance, you can create a random ID. Since the random ID is a cryptographically strong identifier, the runtime will create a new actor instance when you interact with it.

[Learn more about how each Dapr SDK handles actor types, actor ids, and actor interfaces.]({{< ref sdks >}})

## Dapr actors vs. Dapr Workflow

Dapr actors builds on the state management and service invocation APIs to create stateful, long running objects with identity. [Dapr Workflow]({{< ref workflow-overview.md >}}) and Dapr Actors are related, with workflows building on actors to provide a higher level of abstraction to orchestrate a set of actors, implementing common workflow patterns and managing the lifecycle of actors on your behalf.

Dapr actors are designed to provide a way to encapsulate state and behavior within a distributed system. An actor can be activated on demand by a client application. When an actor is activated, it is assigned a unique identity, which allows it to maintain its state across multiple invocations. This makes actors useful for building stateful, scalable, and fault-tolerant distributed applications.

On the other hand, Dapr Workflow provides a way to define and orchestrate complex workflows that involve multiple services and components within a distributed system. Workflows allow you to define a sequence of steps or tasks that need to be executed in a specific order, and can be used to implement business processes, event-driven workflows, and other similar scenarios.

As mentioned above, Dapr Workflow builds on Dapr Actors managing their activation and lifecycle.

### When to use Dapr actors

As with any other technology decision, you should decide whether to use actors based on the problem you're trying to solve. For example, if you were building a chat application, you might use Dapr actors to implement the chat rooms and the individual chat sessions between users, as each chat session needs to maintain its own state and be scalable and fault-tolerant.

Generally speaking, consider the actor pattern to model your problem or scenario if:

- Your problem space involves a large number (thousands or more) of small, independent, and isolated units of state and logic.
- You want to work with single-threaded objects that do not require significant interaction from external components, including querying state across a set of actors.
- Your actor instances won't block callers with unpredictable delays by issuing I/O operations.

### When to use Dapr Workflow

You would use Dapr Workflow when you need to define and orchestrate complex workflows that involve multiple services and components. For example, using the [chat application example earlier]({{< ref "#when-to-use-dapr-actors" >}}), you might use Dapr Workflows to define the overall workflow of the application, such as how new users are registered, how messages are sent and received, and how the application handles errors and exceptions.

[Learn more about Dapr Workflow and how to use workflows in your application.]({{< ref workflow-overview.md >}})

## Features

### Actor lifetime

Since Dapr actors are virtual, they do not need to be explicitly created or destroyed. The Dapr actor runtime:
1. Automatically activates an actor once it receives an initial request for that actor ID. 
1. Garbage-collects the in-memory object of unused actors. 
1. Maintains knowledge of the actor's existence in case it's reactivated later.

An actor's state outlives the object's lifetime, as state is stored in the configured state provider for Dapr runtime.

[Learn more about actor lifetimes.]({{< ref "actors-features-concepts.md#actor-lifetime" >}})

### Distribution and failover

To provide scalability and reliability, actors instances are  throughout the cluster and Dapr distributes actor instances throughout the cluster and automatically migrates them to healthy nodes.

[Learn more about Dapr actor placement.]({{< ref "actors-features-concepts.md#actor-placement-service" >}})

### Actor communication

You can invoke actor methods by calling them over HTTP, as shown in the general example below.

<img src="/images/actors-calling-method.png" width=900>

1. The service calls the actor API on the sidecar.
1. With the cached partitioning information from the placement service, the sidecar determines which actor service instance will host actor ID **3**. The call is forwarded to the appropriate sidecar.
1. The sidecar instance in pod 2 calls the service instance to invoke the actor and execute the actor method.

[Learn more about calling actor methods.]({{< ref "actors-features-concepts.md#actor-communication" >}})

#### Concurrency

The Dapr actor runtime provides a simple turn-based access model for accessing actor methods. Turn-based access greatly simplifies concurrent systems as there is no need for synchronization mechanisms for data access. 

- [Learn more about actor reentrancy]({{< ref "actor-reentrancy.md" >}})
- [Learn more about the turn-based access model]({{< ref "actors-features-concepts.md#turn-based-access" >}})

### State

Transactional state stores can be used to store actor state. To specify which state store to use for actors, specify value of property `actorStateStore` as `true` in the state store component's metadata section. Actors state is stored with a specific scheme in transactional state stores, allowing for consistent querying. Only a single state store component can be used as the state store for all actors. Read the [state API reference]({{< ref state_api.md >}}) and the [actors API reference]({{< ref actors_api.md >}}) to learn more about state stores for actors.

#### Time to Live (TTL) on state
You should always set the TTL metadata field (`ttlInSeconds`), or the equivalent API call in your chosen SDK when saving actor state to ensure that state eventually removed. Read [actors overview]({{< ref actors-overview.md >}}) for more information.

### Actor timers and reminders

Actors can schedule periodic work on themselves by registering either timers or reminders.

The functionality of timers and reminders is very similar. The main difference is that Dapr actor runtime is not retaining any information about timers after deactivation, while persisting the information about reminders using Dapr actor state provider.

This distinction allows users to trade off between light-weight but stateless timers vs. more resource-demanding but stateful reminders.

- [Learn more about actor timers.]({{< ref "actors-features-concepts.md#timers" >}})
- [Learn more about actor reminders.]({{< ref "actors-features-concepts.md#reminders" >}})
- [Learn more about timer and reminder error handling and failover.]({{< ref "actors-features-concepts.md#timers-and-reminders-error-handling" >}})

## Next steps

{{< button text="Actors features and concepts >>" page="actors-features-concepts.md" >}}

## Related links

- [Actors API reference]({{< ref actors_api.md >}})
- Refer to the [Dapr SDK documentation and examples]({{< ref "developing-applications/sdks/#sdk-languages" >}}).
