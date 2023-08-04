---
type: docs
title: "Targets"
linkTitle: "Targets"
weight: 300
description: "Apply resiliency policies to targets including apps, components and actors"
---

### Targets

Named policies are applied to targets. Dapr supports three target types that apply all Dapr building block APIs:
- `apps`
- `components`
- `actors`

#### Apps

With the `apps` target, you can apply `retry`, `timeout`, and `circuitBreaker` policies to service invocation calls between Dapr apps. Under `targets/apps`, policies are applied to each target service's `app-id`. The policies are invoked when a failure occurs in communication between sidecars, as shown in the diagram below.

> Dapr provides [built-in service invocation retries]({{< ref "service-invocation-overview.md#retries" >}}), so any applied `retry` policies are additional.

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


#### Components

With the `components` target, you can apply `retry`, `timeout` and `circuitBreaker` policies to component operations.

Policies can be applied for `outbound` operations (calls to the Dapr sidecar) and/or `inbound` (the sidecar calling your app). 

##### Outbound

`outbound` operations are calls from the sidecar to a component, such as:

- Persisting or retrieving state.
- Publishing a message on a PubSub component.
- Invoking an output binding.

> Some components may have built-in retry capabilities and are configured on a per-component basis.

<img src="/images/resiliency_outbound.png" width=1000 alt="Diagram showing service invocation resiliency">

```yaml
spec:
  targets:
    components:
      myStateStore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

##### Inbound

`inbound` operations are calls from the sidecar to your application, such as:

- PubSub subscriptions when delivering a message.
- Input bindings.

> Some components may have built-in retry capabilities and are configured on a per-component basis.

<img src="/images/resiliency_inbound.png" width=1000 alt="Diagram showing service invocation resiliency" />

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

With the `actors` target, you can apply `retry`, `timeout`, and `circuitBreaker` policies to actor operations. 

When using a `circuitBreaker` policy for the `actors` target, you can specify how circuit breaking state should be scoped by using `circuitBreakerScope`:

- `id`: an individual actor ID
- `type`: all actors of a given actor type
- `both`: both of the above

You can also specify a cache size for the number of circuit breakers to keep in memory with the `circuitBreakerCacheSize` property, providing an integer value, e.g. `5000`.

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

## Next steps

Try out one of the Resiliency quickstarts:
- [Resiliency: Service-to-service]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [Resiliency: State Management]({{< ref resiliency-state-quickstart.md >}})