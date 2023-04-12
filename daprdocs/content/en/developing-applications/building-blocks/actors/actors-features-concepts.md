---
type: docs
title: "Actor runtime features"
linkTitle: "Runtime features"
weight: 20
description: "Learn more about the features and concepts of Actors in Dapr"
aliases:
  - "/developing-applications/building-blocks/actors/actors-background"
---

Now that you've learned about the [actor building block]({{< ref "actors-overview.md" >}}) at a high level, let's deep dive into the features and concepts included with actors in Dapr. 

## Actor lifetime

Dapr actors are virtual, meaning that their lifetime is not tied to their in-memory representation. As a result, they do not need to be explicitly created or destroyed. The Dapr actor runtime automatically activates an actor the first time it receives a request for that actor ID. If an actor is not used for a period of time, the Dapr actor runtime garbage-collects the in-memory object. It will also maintain knowledge of the actor's existence should it need to be reactivated later.

Invocation of actor methods and reminders reset the idle time, e.g. reminder firing will keep the actor active. Actor reminders fire whether an actor is active or inactive, if fired for inactive actor, it will activate the actor first. Actor timers do not reset the idle time, so timer firing will not keep the actor active. Timers only fire while the actor is active.

The idle timeout and scan interval Dapr runtime uses to see if an actor can be garbage-collected is configurable. This information can be passed when Dapr runtime calls into the actor service to get supported actor types.

This virtual actor lifetime abstraction carries some caveats as a result of the virtual actor model, and in fact the Dapr Actors implementation deviates at times from this model.

An actor is automatically activated (causing an actor object to be constructed) the first time a message is sent to its actor ID. After some period of time, the actor object is garbage collected. In the future, using the actor ID again, causes a new actor object to be constructed. An actor's state outlives the object's lifetime as state is stored in configured state provider for Dapr runtime.

## Distribution and failover

To provide scalability and reliability, actors instances are distributed throughout the cluster and Dapr automatically migrates them from failed nodes to healthy ones as required.

Actors are distributed across the instances of the actor service, and those instance are distributed across the nodes in a cluster. Each service instance contains a set of actors for a given actor type.

### Actor placement service

The Dapr actor runtime manages distribution scheme and key range settings for you via the actor `Placement` service. When a new instance of a service is created:

1. The sidecar makes a call to the actor service to retrieve registered actor types and configuration settings.
1. The corresponding Dapr runtime registers the actor types it can create.
1. The `Placement` service calculates the partitioning across all the instances for a given actor type.

This partition data table for each actor type is updated and stored in each Dapr instance running in the environment and can change dynamically as new instances of actor services are created and destroyed.

<img src="/images/actors_background_placement_service_registration.png" width=600>

When a client calls an actor with a particular id (for example, actor id 123), the Dapr instance for the client hashes the actor type and id, and uses the information to call onto the corresponding Dapr instance that can serve the requests for that particular actor id. As a result, the same partition (or service instance) is always called for any given actor id. This is shown in the diagram below.

<img src="/images/actors_background_id_hashing_calling.png" width=600>

This simplifies some choices, but also carries some consideration:

- By default, actors are randomly placed into pods resulting in uniform distribution.
- Because actors are randomly placed, it should be expected that actor operations always require network communication, including serialization and deserialization of method call data, incurring latency and overhead.

{{% alert title="Note" color="primary" %}}
 Note: The Dapr actor Placement service is only used for actor placement and therefore is not needed if your services are not using Dapr actors. The Placement service can run in all [hosting environments]({{< ref hosting >}}), including self-hosted and Kubernetes.
{{% /alert %}}

## Actor communication

You can interact with Dapr to invoke the actor method by calling HTTP/gRPC endpoint.

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/<method/state/timers/reminders>
```

You can provide any data for the actor method in the request body, and the response for the request would be in the response body which is the data from actor call.

Another, and perhaps more convenient, way of interacting with actors is via SDKs. Dapr currently supports actors SDKs in [.NET]({{< ref "dotnet-actors" >}}), [Java]({{< ref "java#actors" >}}), and [Python]({{< ref "python-actor" >}}).

Refer to [Dapr Actor Features]({{< ref howto-actors.md >}}) for more details.

### Concurrency

The Dapr actor runtime provides a simple turn-based access model for accessing actor methods. This means that no more than one thread can be active inside an actor object's code at any time. Turn-based access greatly simplifies concurrent systems as there is no need for synchronization mechanisms for data access. It also means systems must be designed with special considerations for the single-threaded access nature of each actor instance.

A single actor instance cannot process more than one request at a time. An actor instance can cause a throughput bottleneck if it is expected to handle concurrent requests.

Actors can deadlock on each other if there is a circular request between two actors while an external request is made to one of the actors simultaneously. The Dapr actor runtime automatically times out on actor calls and throw an exception to the caller to interrupt possible deadlock situations.

<img src="/images/actors_background_communication.png" width=600>

#### Reentrancy

To allow actors to "re-enter" and invoke methods on themselves, see [Actor Reentrancy]({{<ref actor-reentrancy.md>}}).

### Turn-based access

A turn consists of the complete execution of an actor method in response to a request from other actors or clients, or the complete execution of a timer/reminder callback. Even though these methods and callbacks are asynchronous, the Dapr actor runtime does not interleave them. A turn must be fully finished before a new turn is allowed. In other words, an actor method or timer/reminder callback that is currently executing must be fully finished before a new call to a method or callback is allowed. A method or callback is considered to have finished if the execution has returned from the method or callback and the task returned by the method or callback has finished. It is worth emphasizing that turn-based concurrency is respected even across different methods, timers, and callbacks.

The Dapr actor runtime enforces turn-based concurrency by acquiring a per-actor lock at the beginning of a turn and releasing the lock at the end of the turn. Thus, turn-based concurrency is enforced on a per-actor basis and not across actors. Actor methods and timer/reminder callbacks can execute simultaneously on behalf of different actors.

The following example illustrates the above concepts. Consider an actor type that implements two asynchronous methods (say, Method1 and Method2), a timer, and a reminder. The diagram below shows an example of a timeline for the execution of these methods and callbacks on behalf of two actors (ActorId1 and ActorId2) that belong to this actor type.

<img src="/images/actors_background_concurrency.png" width=600>

## Next steps

{{< button text="Timers and reminders >>" page="actors-timers-reminders.md" >}}

## Related links

- [Actors API reference]({{< ref actors_api.md >}})
- [Actors overview]({{< ref actors-overview.md >}})
- [How to: Use virtual actors in Dapr]({{< ref howto-actors.md >}})