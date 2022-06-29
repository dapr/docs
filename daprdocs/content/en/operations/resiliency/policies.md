---
type: docs
title: "Policies"
linkTitle: "Policies"
weight: 4500
description: "Configure resiliency policies for timeouts, retries and circuit breakers"
---

### Policies

You define timeouts, retries and circuit breaker policies under `policies`. Each policy is given a name so you can refer to them from the `targets` section in the resiliency spec. 

> Note: Dapr offers default retries for specific APIs. [See here]({{< ref "#override-default-retries" >}}) to learn how you can overwrite Dapr's default retry logic with custom retry policies.

#### Timeouts

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

#### Retries

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

##### Circuit breakers

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

##### Override Default Retries

Dapr provides default retries for certain request failures and transient errors.  Within a resiliency spec, you have the option to override Dapr's default retry logic by defining policies with reserved, named keywords (for example, defining a policy with the name `DaprBuiltInServiceRetries`, will override default retries for failures between sidecars via service-to-service requests). Policy overrides are not applied to specific targets. 

> Note: Although you can override default values with more robust retries, you cannot override with lesser values than the provided default value, or completely remove default retries. This prevents unexpected downtime. 

Below is a table that describes Dapr's default retries and the policy keywords to override them: 

| Capability             | Override Keyword                 | Default Retry Behavior                                                                                                                                                               | Description                                                                                                                           |
| ------------------     | -------------------------        | ------------------------------                                                                                                                                                       | -----------------------------------------------------------------------------------------------------------                           |
| Service Invocation     | DaprBuiltInServiceRetries        | Per call retries are performed with a backoff interval of 1 second up to a threshold of 3 times.                                                                                     | Sidecar-to-sidecar requets (via a service invocation call) that fails and results in a gRPC code `Unavailable` or `Unauthenticated`   | 
| Actors                 | DaprBuiltInActorRetries          | Per call retries are performed with a backoff interval of 1 second up to a threshold of 3 times.                                                                                     | Sidecar-to-sidecar requests (to a remote actor) that fails and results in a gRPC code `Unavailable` or `Unauthenticated`              |
| Actor Reminders        | DaprBuiltInActorReminderRetries  | Per call retries are performed with an exponential backoff wtih an initial interval of 500ms and up to a maximum of 60s for a duration of 15m                                        | Requests that fail to persist an actor reminder to a state store                                                                      | 
| Initialization Retries | DaprBuiltInInitializationRetries | Per call retries are performed 3 times wtih an exponential backoff with an initial interval of 500ms and for a duration of 10s                                                       | Failures when making a request to an application to retrieve a given spec. For example, failure to retrieve a Subscription spec       | 


Example of overriding default retries for Service Invocation:
```yaml
spec:
  policies:
    # Retries are named templates for retry configurations and are instantiated for life of the operation.
    retries:
      DaprBuiltInServiceRetries: # Overrides default retry behaivor for service-to-service calls
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever: # A custom retry policy will replace default retries and the target will rely soley on the named policy. 
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # Retry indefinitely

  targets:
    apps:
      appB: # app-id of the target service
        retry: retryForever
```