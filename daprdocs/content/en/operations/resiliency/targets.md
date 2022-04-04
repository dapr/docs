---
type: docs
title: "Targets"
linkTitle: "Targets"
weight: 4500
description: "Apply resiliency policies for apps, components and actors"
---

Resiliency is currently a preview feature. Before you can utilize resiliency policies, you must first enable the resiliency preview feature.

### Targets
Targets are what named policies are applied to. Dapr supports 3 target types - `apps`, `components` and `actors`, which covers all Dapr builing blocks with the exception of observability. It's worth noting that resilient behaviors might differ between target types, as some targets may already include resilient capabilities, for example service invocation with built-in retries.  

#### Apps

<img src="/images/resiliency_svc_invocation.png" width=1000 alt="Diagram showing service invocation resiliency" />

The `apps` target allows for applying `retry`, `timeout` and `circuitbreaker` policies to service invocation calls to other Dapr apps. Under `apps`, each key is the target service's `app-id` that the policies are applied to. Policies are applied when the network failure occurs between sidecar communication (as pictured in the diagram above). Additionally, Dapr provides [built-in service invocation retries]({{<ref "service-invocation-overview.md#retries">}}), so any applied `retry` policies are additional.

Example of policies to a target app with the `app-id` "appB":

```yaml
specs:
  targets:
    apps:
      appB: # app-id of the target service
        timeout: general
        retry: general
        circuitBreaker: general
```

#### Components

The `components` target allows for applying of `retry`, `timeout` and `circuitbreaker` policies to components operations. Policy assignments are optional. 

Policies can be applied for `outbound` operations (calls to the Dapr sidecar) and/or `inbound` (the sidecar calling your app). At this time, inbound only applies to PubSub and InputBinding components.

##### Outbound
Calls from the sidecar to a component are `outbound` operations. Persisting or retrieveting state, publishing a message, invoking an output binding are all examples of `outbound` operations. Some components have `retry` capabilities built-in and are configured on a per component basis.

<img src="/images/resiliency_outbound.png" width=1000 alt="Diagram showing service invocation resiliency">

```yaml
spec:
  targets:
    components:
      myStateStore:
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
```

##### Inbound 
Call from the sidecar to your application are `inbound` operations. Subscribing to a topic and inbound bindings are examples of `inbound` operations. 

<img src="/images/resiliency_inbound.png" width=1000 alt="Diagram showing service invocation resiliency" />

Example
```yaml
spec:
  targets:
    components:
      myInputBinding:
        inbound: 
          timeout: general
          retry: general
          circuitBreaker: general
```

##### PubSub
<img src="/images/resiliency_pubsub.png" width=1000 alt="Diagram showing service invocation resiliency">

Example
```yaml
spec:
  targets:
    components:
      myPubsub:
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
        inbound: # inbound only applies to delivery from sidecar to app
          timeout: general
          retry: general
          circuitBreaker: general
```

#### Actors

Allows applying of `retry`, `timeout` and `circuitbreaker` policies to actor operations. Policy assignments are optional.

When using a `circuitbreaker` policy, you can additionally specify whether circuit breaking state should be scoped to an invididual actor ID, to all actors across the actor type, or both. Specify `circuitBreakerScope` with values `id`, `type`, or `both`.

Additionally, you can specify a cache size for the number of circuit breakers to keep in memory. This can be done by specifying `circuitBreakerCacheSize` and providing an integer value, e.g. `5000`.

Example
```yaml
spec:
  targets:
    actors:
      myActorType:
        timeout: general
        retry: general
        circuitBreaker: general
        circuitBreakerScope: both
        circuitBreakerCacheSize: 5000
```