---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 4500
description: "Configure Dapr retries, timeouts, and circuit breakers"
---
{{% alert title="Note" color="primary" %}}
 Resiliency is currently a preview feature. Before you can utilize a resiliency spec, you must first [enable the resiliency preview feature]({{< ref support-preview-features >}}).
{{% /alert %}}

Distributed applications are commonly comprised of many microservices, with dozens, even hundreds, of instances for any given application. With so many microservices, the likelihood of a system failure increases. For example, an instance can fail or be unresponsive due to hardware, an overwhelming number of requests, application restarts/scale outs, or several other reasons. These events can cause a network call between services to fail. Designing and implementing your application with fault tolerance, the ability to detect, mitigate, and respond to failures, allows your application to recover to a functioning state and become self healing.

Dapr provides a capability for defining and applying fault tolerance resiliency policies via a [resiliency spec]({{< ref "resiliency-overview.md#complete-example-policy" >}}). Resiliency specs are saved in the same location as components specs and are applied when the Dapr sidecar starts.  The sidecar determines how to apply resiliency policies to your Dapr API calls. In self-hosted mode, the resiliency spec must be named `resiliency.yaml`. In Kubernetes Dapr finds the named resiliency specs used by your application. Within the resiliency spec, you can define policies for popular resiliency patterns, such as:

- [Timeouts]({{< ref "policies.md#timeouts" >}})
- [Retries/back-offs]({{< ref "policies.md#retries" >}})
- [Circuit breakers]({{< ref "policies.md#circuit-breakers" >}})

Policies can then be applied to [targets]({{< ref "targets.md" >}}), which include:

- [Apps]({{< ref "targets.md#apps" >}}) via service invocation
- [Components]({{< ref "targets.md#components" >}})
- [Actors]({{< ref "targets.md#actors" >}})

Additionally, resiliency policies can be [scoped to specific apps]({{< ref "component-scopes.md#application-access-to-components-with-scopes" >}}).

Below is the general structure of a resiliency policy:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
scopes:
  # optionally scope the policy to specific apps
spec:
  policies:
    timeouts:
      # timeout policy definitions

    retries:
      # retry policy definitions

    circuitBreakers:
      # circuit breaker policy definitions

  targets:
    apps:
      # apps and their applied policies here

    actors:
      # actor types and their applied policies here

    components:
      # components and their applied policies here
```

### Complete example policy

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
# similar to subscription and configuration specs, scopes lists the Dapr App IDs that this
# resiliency spec can be used by.
scopes:
  - app1
  - app2
spec:
  # policies is where timeouts, retries and circuit breaker policies are defined. 
  # each is given a name so they can be referred to from the targets section in the resiliency spec.
  policies:
    # timeouts are simple named durations.
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s

    # retries are named templates for retry configurations and are instantiated for life of the operation.
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever:
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # retry indefinitely

      important:
        policy: constant
        duration: 5s
        maxRetries: 30

      someOperation:
        policy: exponential
        maxInterval: 15s

      largeResponse:
        policy: constant
        duration: 5s
        maxRetries: 3

    # circuit breakers are automatically instantiated per component and app instance.
    # circuit breakers maintain counters that live as long as the Dapr sidecar is running. They are not persisted.
    circuitBreakers:
      simpleCB:
        maxRequests: 1
        timeout: 30s 
        trip: consecutiveFailures >= 5

      pubsubCB:
        maxRequests: 1
        interval: 8s
        timeout: 45s
        trip: consecutiveFailures > 8

  # targets are what named policies are applied to. Dapr supports 3 target types - apps, components and actors
  targets:
    apps:
      appB:
        timeout: general
        retry: important
        # circuit breakers for services are scoped app instance.
        # when a breaker is tripped, that route is removed from load balancing for the configured `timeout` duration.
        circuitBreaker: simpleCB

    actors:
      myActorType: # custom Actor Type Name
        timeout: general
        retry: important
        # circuit breakers for actors are scoped by type, id, or both.
        # when a breaker is tripped, that type or id is removed from the placement table for the configured `timeout` duration.
        circuitBreaker: simpleCB
        circuitBreakerScope: both ## 
        circuitBreakerCacheSize: 5000

    components:
      # for state stores, policies apply to saving and retrieving state.
      statestore1: # any component name -- happens to be a state store here
        outbound:
          timeout: general
          retry: retryForever
          # circuit breakers for components are scoped per component configuration/instance. For example myRediscomponent.
          # when this breaker is tripped, all interaction to that component is prevented for the configured `timeout` duration.
          circuitBreaker: simpleCB

      pubsub1: # any component name -- happens to be a pubsub broker here
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB

      pubsub2: # any component name -- happens to be another pubsub broker here
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
        inbound: # inbound only applies to delivery from sidecar to app
          timeout: general
          retry: important
          circuitBreaker: pubsubCB
```

## Related links
 - [Policies]({{< ref "policies.md" >}})
 - [Targets]({{< ref "targets.md" >}})