---
type: docs
title: "Overview"
linkTitle: "Overview"
weight: 4500
description: "Configure Dapr error retries, timeouts and circuit breakers"
---

Resiliency is currently a preview feature. Before you can utilize resiliency policies you must first [enable the resiliency preview feature]({{<ref preview-features >}}).

## Introduction

Distributed applications are commonly comprised of many moving pieces, there could be dozens or even hundreds of instances for any given service. With this many moving pieces, the likelihood of a system failure increases. An instance can fail for any number of reasons, for example, hardware failures, overwhelming number of requests, application restarts/scale outs. Any of these events can cause a network call between services to fail. Having your application designed with the ability to detect and mitigate these failures allows for your application to respond and recover quickly back to a functioning state.

## Overview

Dapr provies a mechanism for defining and applying resiliency policies via a [resiliency spec]({{<ref "resiliency-overview.md#complete-example-policy">}}).  The resiliency spec sits with your components and is applied when the dapr sidecar starts. It's up to the sidecar to know when and how to apply resiliency policies to your Dapr APIs calls. Within the resiliency spec, you define policies for popular resiliency patterns, such as [timeouts]({{<ref "policies.md#timeouts">}}), [retries/back-offs]({{<ref "policies.md#retries">}}) and [circuit breakers]({{<ref "policies.md#circuit-breakers">}}). Policies can then be applied consistently to [targets]({{<ref "targets.md">}}), which include [apps]({{<ref "targets.md#apps">}}) via service invocation, [components]({{<ref "targets.md#components">}}) and [actors]({{<ref "targets.md#actors">}}). 

Additionally, resiliency policies can be [scoped to specific apps]({{<ref "component-scopes.md#application-access-to-components-with-scopes">}}).

Below is the general structure of what a resiliency policy looks like:

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
> Note: In selfhosted mode the resiliency policy must be named `resiliency.yaml` and reside in the components folder provided to the sidecar. In Kubernetes Dapr scans all resiliency policies.

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
        retry: important
        # Circuit breakers for services are scoped per endpoint (e.g. hostname + port).
        # When a breaker is tripped, that route is removed from load balancing for the configured `timeout` duration.
        circuitBreaker: general

    actors:
      myActorType: # custom Actor Type Name
        timeout: general
        retry: important
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
