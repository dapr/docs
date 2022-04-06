---
type: docs
title: "Targets"
linkTitle: "Targets"
weight: 4500
description: "Apply resiliency policies to apps, components and actors"
---

Resiliency is currently a preview feature. Before you can utilize a resiliency spec, you must first [enable the resiliency preview feature]({{< ref preview-features >}}).

#### Enablethe resiliency:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: featureconfig
spec:
  features:
    - name: Resiliency
      enabled: true
```

### Targets
Named policies are applied to targets. Dapr supports 3 target types that cover all Dapr building blocks, except observability:
- `apps`
- `components`
- `actors`

Fault tolerance behaviors might differ between target types, as some targets may already include resilient capabilities; for example, [service invocation with built-in retries]({{< ref "service-invocation-overview.md#retries" >}}).  

#### Apps

With the `apps` target, you can apply `retry`, `timeout`, and `circuitBreaker` policies to service invocation calls between Dapr apps. Under `targets/apps`, policies are applied to each target service's `app-id`. The policies are invoked when a network failure occurs in communication between sidecars (as pictured in the diagram above).

<img src="/images/resiliency_svc_invocation.png" width=1000 alt="Diagram showing service invocation resiliency" />

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

> Dapr provides [built-in service invocation retries]({{< ref "service-invocation-overview.md#retries" >}}), so any applied `retry` policies are additional.

#### Components

With the `components` target, you can apply `retry`, `timeout` and `circuitBreaker` policies to component operations.

Policies can be applied for `outbound` operations (calls to the Dapr sidecar) and/or `inbound` (the sidecar calling your app). At this time, *inbound* only applies to PubSub and InputBinding components. 

##### Outbound

`outbound` operations are calls from the sidecar to a component, such as:

- Persisting or retrieving state.
- Publishing a message.
- Invoking an output binding.

<img src="/images/resiliency_outbound.png" width=1000 alt="Diagram showing service invocation resiliency">

Some components have built-in `retry` capabilities and are configured on a per-component basis.

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

`inbound` operations are calls from the sidecar to your application, such as:

- Subscriptions when delivering a message.
- Inbound bindings.

<img src="/images/resiliency_inbound.png" width=1000 alt="Diagram showing service invocation resiliency" />

Some components have built-in `retry` capabilities and are configured on a per-component basis.

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

In a PubSub `target/component`, you can specify both `inbound` and `outbound` operations.

<img src="/images/resiliency_pubsub.png" width=1000 alt="Diagram showing service invocation resiliency">

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

With the `actors` target, you can apply `retry`, `timeout`, and `circuitBreaker` policies to actor operations. Policy assignments are optional.

When using a `circuitBreaker` policy, you can specify whether circuit breaking state should be scoped to:

- An individual actor ID.
- All actors across the actor type.
- Both.

Specify `circuitBreakerScope` with values `id`, `type`, or `both`.

You can specify a cache size for the number of circuit breakers to keep in memory. Do this by specifying `circuitBreakerCacheSize` and providing an integer value, e.g. `5000`.

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