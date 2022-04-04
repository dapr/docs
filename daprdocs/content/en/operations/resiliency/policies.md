---
type: docs
title: "Policies"
linkTitle: "Policies"
weight: 4500
description: "Configure resiliency policies for timeouts, retries/backoffs and circuit breakers"
---

Resiliency is currently a preview feature. Before you can utilize resiliency policies, you must first enable the resiliency preview feature.

### Policies
Policies is where timeouts, retries and circuit breaker policies are defined. Each is given a name so they can be referred to from the `targets` section in the resiliency spec. 

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

Circuit Breakers (CBs) are policies that are used when other applications/services/components are experiencing elevated failure rates. Their purpose is to monitor the requests and, when a certain criteria is met, shut off all traffic to the impacted service. This is to give the service time to recover from their outage instead of flooding them with events. The circuit breaker can also allow partial traffic through to see if the system has healed (half open state). Once successful requests start to occur, the CB can close and allow traffic to resume.

- `maxRequests`: The maximum number of requests allowed to pass through when the CB is half-open (recovering from failure). Defaults to `1`.
- `interval`: The cyclical period of time used by the CB to clear its internal counts. If set to 0 seconds, this will never clear. Defaults to `0s`.
- `timeout`: The period of the open state (directly after failure) until the CB switches to half-open. Defaults to `60s`.
- `trip`: A Common Expression Language (CEL) statement that is evaluated by the CB. When the statement evaluates to true, the CB trips and becomes open. Default is `consecutiveFailures > 5`.

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
