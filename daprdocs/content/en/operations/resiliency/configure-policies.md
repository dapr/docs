---
type: docs
title: "How-To: Error recovery using resiliency policies"
linkTitle: "Resiliency Policies"
weight: 4500
description: "Configure Dapr error retries, timeouts and circuit breakers"
---

Resiliency is currently a preview feature. Before you can utilize resiliency policies you must first [enable the resiliency preview feature]({{<ref preview-features >}}).

## Introduction

- TODO: What is resiliency in Dapr?
- TODO: What problems does it solve?

## Overview

A Dapr resiliency policy allow retry, timeout and circuitbreaker policies to be created and applied to particular targets including specific components and apps (service invocation calls to other apps).

Additionally, resiliency policies can also be [scoped to specific apps]({{<ref "component-scopes.md#application-access-to-components-with-scopes">}}).

In selfhosted mode the resiliency policy must be named `resiliency.yaml` and reside in the components folder provided to the sidecar. In Kubernetes Dapr scans all resiliency policies.

The general structure of a resiliency policy looks like this:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: resiliency
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

### Policies

#### Timeouts

Timeouts can be used to early-terminate long-running operations. If a timeout is exceeded the operation in progress will be terminated if possible and an error is returned. Valid values are of the form `15s`, `2m`, `1h30m`, etc

Example definitions:
```yaml
spec:
  policies:
    # Timeouts are simple named durations.
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s
```

#### Retries

Retries allow defining of a retry stragegy for failed operations. Requests failed due to triggering a defined timeout or circuit breaker policy will also be retried per the retry strategy. The following retry options are configurable:

- `policy`: determines the backoff and retry interval strategy. Valid values are `constant` and `exponential`. Defaults to `constant`.
- `duration`: determines the time interval between retries. Default: `5s`. Only applies to the `constant` `policy`. Valid values are of the form `200ms`, `15s`, `2m`, etc
- `maxInterval`: determines the largest interval between retries to which the `exponential` backoff `policy` can grow. Additional retries will always occur after a duration of `maxInterval`. Defaults to `60s`. Valid values are of the form `5s`, `1m`, `1m30s`, etc
- `maxRetries`: The number of retries to attempt. `-1` denotes an indefinite number of retries. Defaults to `-1`.

The exponential backoff window uses the following formula:
```
BackOffDuration = PreviousBackOffDuration * (Random value from 0.5 to 1.5) * 1.5
if BackOffDuration > maxInterval {
  BackoffDuration = maxInterval
}
```

Example definitions:
```yaml
spec:
  policies:
    # Retries are named templates for retry configurations and are instantiated for life of the operation.
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever:
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # Retry indefinitely
```

##### Circuit Breakers

???

Example:

```yaml
spec:
  policies:
    circuitBreakers:
      pubsubCB:
        maxRequests: 1
        interval: 8s
        timeout: 45s
        trip: consecutiveFailures > 8
```

### Targets

#### Apps

Allows applying of `retry`, `timeout` and `circuitbreaker` policies to service invocation calls to other Dapr apps. Policy assignments are optional.

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
#### Components

Allows applying of `retry`, `timeout` and `circuitbreaker` policies to components operations. Policy assignments are optional. Policies can be applied for `outbound` operations (calls to the Dapr sidecar) or `inbound` (the sidecar calling your app). At this time, inbound only applies to PubSub and InputBinding components.

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

### Complete Example Policy

TODO: What are the `general` retries and circuit breakers in this example? Are they provided by Dapr by default, or is the example just wrong?

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: resiliency
# Like in the Subscriptions CRD, scopes lists the Dapr App IDs that this
# configuration applies to.
scopes:
  - app1
  - app2
spec:
  policies:
    # Timeouts are simple named durations.
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s

    # Retries are named templates for retry configurations and are instantiated for life of the operation.
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever:
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # Retry indefinitely

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

    # Circuit breakers are automatically instantiated per component and app endpoint.
    # Circuit breakers maintain counters that can live as long as the Dapr sidecar.
    circuitBreakers:
      pubsubCB:
        maxRequests: 1
        interval: 8s
        timeout: 45s
        trip: consecutiveFailures > 8

  # This section specifies policies for:
  # * service invocation
  # * requests to components
  targets:
    apps:
      appB:
        timeout: general
        retry: general
        # Circuit breakers for services are scoped per endpoint (e.g. hostname + port).
        # When a breaker is tripped, that route is removed from load balancing for the configured `timeout` duration.
        circuitBreaker: general

    actors:
      myActorType: # custom Actor Type Name
        timeout: general
        retry: general
        # Circuit breakers for actors are scoped by type, id, or both.
        # When a breaker is tripped, that type or id is removed from the placement table for the configured `timeout` duration.
        circuitBreaker: general
        circuitBreakerScope: both
        circuitBreakerCacheSize: 5000

    components:
      # For state stores, policies apply to saving and retrieving state.
      statestore1: # any component name -- happens to be a state store here
        outbound:
          timeout: general
          retry: general
          # Circuit breakers for components are scoped per component configuration/instance (e.g. redis1).
          # When this breaker is tripped, all interaction to that component is prevented for the configured `timeout` duration.
          circuitBreaker: general

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
          retry: general
          circuitBreaker: general

```
