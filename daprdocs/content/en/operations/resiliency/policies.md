---
type: docs
title: "Policies"
linkTitle: "Policies"
weight: 4500
description: "Configure resiliency policies for timeouts, retries and circuit breakers"
---

You define timeouts, retries and circuit breaker policies under `policies`. Each policy is given a name so you can refer to them from the `targets` section in the resiliency spec. 

> Note: Dapr offers default retries for specific APIs. [See here]({{< ref "#override-default-retries" >}}) to learn how you can overwrite default retry logic with user defined retry policies.

## Timeouts

Timeouts can be used to early-terminate long-running operations. If you've exceeded a timeout duration:

- The operation in progress is terminated (if possible).
- An error is returned.

Valid values are of the form `15s`, `2m`, `1h30m`, etc. 

Example:
```yaml
spec:
  policies:
    # Timeouts are simple named durations.
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s
```

## Retries

With `retries`, you can define a retry strategy for failed operations, including requests failed due to triggering a defined timeout or circuit breaker policy. The following retry options are configurable:

| Retry option | Description |
| ------------ | ----------- |
| `policy` | Determines the back-off and retry interval strategy. Valid values are `constant` and `exponential`. Defaults to `constant`. |
| `duration` | Determines the time interval between retries. Default: `5s`. Only applies to the `constant` policy. Valid values are of the form `200ms`, `15s`, `2m`, etc. |
| `maxInterval` | Determines the maximum interval between retries to which the `exponential` back-off policy can grow. Additional retries always occur after a duration of `maxInterval`. Defaults to `60s`. Valid values are of the form `5s`, `1m`, `1m30s`, etc |
| `maxRetries` | The maximum number of retries to attempt. `-1` denotes an indefinite number of retries. Defaults to `-1`. |

The exponential back-off window uses the following formula:

```
BackOffDuration = PreviousBackOffDuration * (Random value from 0.5 to 1.5) * 1.5
if BackOffDuration > maxInterval {
  BackoffDuration = maxInterval
}
```

Example:
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

## Circuit breakers

Circuit breakers (CBs) policies are used when other applications/services/components are experiencing elevated failure rates. CBs monitor the requests and shut off all traffic to the impacted service when a certain criteria is met. By doing this, CBs give the service time to recover from their outage instead of flooding them with events. The CB can also allow partial traffic through to see if the system has healed (half-open state). Once successful requests start to occur, the CB can close and allow traffic to resume.

| Retry option | Description |
| ------------ | ----------- |
| `maxRequests` | The maximum number of requests allowed to pass through when the CB is half-open (recovering from failure). Defaults to `1`. |
| `interval` | The cyclical period of time used by the CB to clear its internal counts. If set to 0 seconds, this never clears. Defaults to `0s`. |
| `timeout` | The period of the open state (directly after failure) until the CB switches to half-open. Defaults to `60s`. |
| `trip` | A Common Expression Language (CEL) statement that is evaluated by the CB. When the statement evaluates to true, the CB trips and becomes open. Default is `consecutiveFailures > 5`. |
| `circuitBreakerScope` | Specify whether circuit breaking state should be scoped to an individual actor ID, all actors across the actor type, or both. Possible values include `id`, `type`, or `both`|
| `circuitBreakerCacheSize` | Specify a cache size for the number of CBs to keep in memory. The value should be larger than the expected number of active actor instances.  Provide an integer value, for example `5000`. |

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

## Override Default Retries

Dapr provides default retries for certain request failures and transient errors.  Within a resiliency spec, you have the option to override Dapr's default retry logic by defining policies with reserved, named keywords. For example, defining a policy with the name `DaprBuiltInServiceRetries`, overrides the default retries for failures between sidecars via service-to-service requests. Policy overrides are not applied to specific targets. 

> Note: Although you can override default values with more robust retries, you cannot override with lesser values than the provided default value, or completely remove default retries. This prevents unexpected downtime. 

Below is a table that describes Dapr's default retries and the policy keywords to override them: 

| Capability             | Override Keyword                 | Default Retry Behavior                                                                                                                                                               | Description                                                                                                                           |
| ------------------     | -------------------------        | ------------------------------                                                                                                                                                       | -----------------------------------------------------------------------------------------------------------                           |
| Service Invocation     | DaprBuiltInServiceRetries        | Per call retries are performed with a backoff interval of 1 second, up to a threshold of 3 times.                                                                                     | Sidecar-to-sidecar requests (a service invocation method call) that fail and result in a gRPC code `Unavailable` or `Unauthenticated`   | 
| Actors                 | DaprBuiltInActorRetries          | Per call retries are performed with a backoff interval of 1 second, up to a threshold of 3 times.                                                                                     | Sidecar-to-sidecar requests (an actor method call) that fail and result in a gRPC code `Unavailable` or `Unauthenticated`              |
| Actor Reminders        | DaprBuiltInActorReminderRetries  | Per call retries are performed with an exponential backoff with an initial interval of 500ms, up to a maximum of 60s for a duration of 15mins                                 | Requests that fail to persist an actor reminder to a state store                                                                      | 
| Initialization Retries | DaprBuiltInInitializationRetries | Per call retries are performed 3 times with an exponential backoff, an initial interval of 500ms and for a duration of 10s                                                       | Failures when making a request to an application to retrieve a given spec. For example, failure to retrieve a subscription, component or resiliency specification       | 


The resiliency spec example below shows overriding the default retries for _all_ service invocation requests by using the reserved, named keyword 'DaprBuiltInServiceRetries'. 

Also defined is a retry policy called 'retryForever' that is only applied to the appB target.  appB uses the 'retryForever' retry policy, while all other application service invocation retry failures use the overridden 'DaprBuiltInServiceRetries' default policy.

```yaml
spec:
  policies:
    retries:
      DaprBuiltInServiceRetries: # Overrides default retry behavior for service-to-service calls
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever: # A user defined retry policy replaces default retries. Targets rely solely on the applied policy. 
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # Retry indefinitely

  targets:
    apps:
      appB: # app-id of the target service
        retry: retryForever
```

## Setting Default Policies

In resiliency you can set default policies, which can have a broader scope. This is done through reserved keywords that let Dapr know when to apply the given policy. There are 3 default policies types: 

- DefaultRetryPolicy
- DefaultTimeoutPolicy
- DefaultCircuitBreakerPolicy

If these policies are defined, they would be used for every operation to a service, application, or component. They can also be modified to be more specific through the usage of additional keywords. The specific policies follow the following pattern, `Default%sRetryPolicy`, `Default%sTimeoutPolicy`, and `Default%sCircuitBreakerPolicy`. Where the `%s` is replaced by the new target of the policy. Below you can see a table of all possible default policy keywords and how they translate into a policy name.

| Keyword                        | Target Operation                                     | Example Policy Name                                       |
| ------------------------------ | ---------------------------------------------------- | --------------------------------------------------------- |
| App                            | Service invocation.                                  | DefaultAppRetryPolicy                                     |
| Actor                          | Actor invocation.                                    | DefaultActorTimeoutPolicy                                 |
| Component                      | All component operations.                            | DefaultComponentCircuitBreakerPolicy                      |
| ComponentInbound               | All inbound component operations.                    | DefaultComponentInboundRetryPolicy                        |
| ComponentOutbound              | All outbound component operations.                   | DefaultComponentOutboundTimeoutPolicy                     |
| StatestoreComponentOutbound    | All statestore component operations.                 | DefaultStatestoreComponentOutboundCircuitBreakerPolicy    |
| PubsubComponentOutbound        | All outbound pubusub (publish) component operations. | DefaultPubsubComponentOutboundRetryPolicy                 |
| PubsubComponentInbound         | All inbound pubsub (subscribe) component operations. | DefaultPubsubComponentInboundTimeoutPolicy                |
| BindingComponentOutbound       | All outbound binding (invoke) component operations.  | DefaultBindingComponentOutboundCircuitBreakerPolicy       |
| BindingComponentInbound        | All inbound binding (read) component operations.     | DefaultBindingComponentInboundRetryPolicy                 |
| SecretstoreComponentOutbound   | All secretstore component operations.                | DefaultSecretstoreComponentTimeoutPolicy                  |
| ConfigurationComponentOutbound | All configuration component operations.              | DefaultConfigurationComponentOutboundCircuitBreakerPolicy |
| LockComponentOutbound          | All lock component operations.                       | DefaultLockComponentOutboundRetryPolicy                   | 

### Policy Hierarchy

Default policies are applied if the operation being executed matches the policy type and if there is no more specific policy targeting it. For each target type (app, actor, and component), the policy with the highest priority is a Named Policy, one that targets that construct specifically. If none exists, the policies are applied from most specific to most broad. 

In the specific case of the [built-in retries]({{< ref "policies.md#Override Default Retries" >}}), default policies do not stop the built-in policies from running. In fact, both will be used but only under very specific circumstances. For service and actor invocation, the built-in retries deal specifically with issues connecting to the remote sidecar (if needed). As these are very important to the stability of Dapr, they are not disabled until a named policy is specifically referenced for an operation. So, in some rare instances, there may be additional retries but this stops an overly weak default policy from reducing the sidecar's availability/success rate.

For applications, this yields:

1. Named Policies in App Targets
2. Default App Policies / Built-In Service Retries
3. Default Policies / Built-In Service Retries

For actors, this yields:

1. Named Policies in Actor Targets
2. Default Actor Policies / Built-In Actor Retries
3. Default Policies / Built-In Actor Retries

For components, this yields:

1. Named Policies in Component Targets
2. Default Component Type + Component Direction Policies / Built-In Actor Reminder Retries (if applicable)
3. Default Component Direction Policies / Built-In Actor Reminder Retries (if applicable)
4. Default Component Policies / Built-In Actor Reminder Retries (if applicable)
5. Default Policies / Built-In Actor Reminder Retries (if applicable)

As an example, take the following system definition:

Applications:
- AppA
- AppB
- AppC

Components:
- Redis Pubsub: pubsub
- Redis statestore: statestore
- CosmosDB Statestore: actorstore

Actors:
- EventActor
- SummaryActor

```yaml
spec:
  policies:
    retries:
      # Global Retry Policy
      DefaultRetryPolicy:
        policy: constant
        duration: 1s
        maxRetries: 3
      
      # Global Retry Policy for Apps
      DefaultAppRetryPolicy:
        policy: constant
        duration: 100ms
        maxRetries: 5

      # Global Retry Policy for Apps
      DefaultActorRetryPolicy:
        policy: exponential
        maxInterval: 15s
        maxRetries: 10

      # Global Retry Policy for Inbound Component operations
      DefaultComponentInboundRetryPolicy:
        policy: constant
        duration: 5s
        maxRetries: 5

      # Global Retry Policy for Statestores
      DefaultStatestoreComponentOutboundRetryPolicy:
        policy: exponential
        maxInterval: 60s
        maxRetries: -1

      fastRetries:
        policy: constant
        duration: 10ms
        maxRetries: 3

      retryForever:
        policy: exponential
        maxInterval: 10s
        maxRetries: -1

  targets:
    apps:
      appA:
        retry: fastRetries

      appB:
        retry: retryForever
    
    actors:
      EventActor:
        retry: retryForever

    components:
      actorstore:
        retry: fastRetries
```

Below is an outline of which policies are used when attempting to call various members of the system.

| Target             | Policy Used                                     |
| ------------------ | ----------------------------------------------- |
| AppA               | fastRetries                                     |
| AppB               | retryForever                                    |
| AppC               | DefaultAppRetryPolicy / DaprBuiltInActorRetries |
| pubsub - Publish   | DefaultRetryPolicy                              |
| pubsub - Subscribe | DefaultComponentInboundRetryPolicy              |
| statestore         | DefaultStatestoreComponentOutboundRetryPolicy   |
| actorstore         | fastRetries                                     |
| EventActor         | retryForever                                    |
| SummaryActor       | DefaultActorRetryPolicy                         |