---
type: docs
title: "Targets"
linkTitle: "Targets"
weight: 4500
description: "Apply resiliency policies for apps, components and actors"
---

### Targets
Targets are what policies are applied to. Dapr supports 3 targets apps, components and actors, which estentially covers all the Dapr Builing blocks, with the exception of observability. It's important to note that resiliency capabilities might differ between components as each target is handled differently and may already include resilient behavior, for example service invocation. 


#### Apps

Allows applying of `retry`, `timeout` and `circuitbreaker` policies to service invocation calls to other Dapr apps. Dapr offers [built-in service invocation retries]({{<ref "service-invocation-overview.md#retries">}}), so any resiliency policies added additional.

The below diagram demonstrates how resiliency policies are service invocation  work:

<img src="/images/resiliency_svc_invocation.png" width=800 alt="Diagram showing service invocation resiliency">

Example
```yaml
specs:
  targets:
    apps:
      appB:
        timeout: general
        retry: general
        circuitBreaker: general
```

#### Components

Allows applying of `retry`, `timeout` and `circuitbreaker` policies to components operations. Policy assignments are optional. 

Policies can be applied for `outbound` operations (calls to the Dapr sidecar) or `inbound` (the sidecar calling your app). At this time, inbound only applies to PubSub and InputBinding components.

The below diagrams demonstrate how resiliency policies are applied to components:

<img src="/images/resiliency_outbound.png" width=800 alt="Diagram showing service invocation resiliency">
<img src="/images/resiliency_inbound.png" width=800 alt="Diagram showing service invocation resiliency">

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