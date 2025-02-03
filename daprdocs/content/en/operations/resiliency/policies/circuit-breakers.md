---
type: docs
title: "Circuit breaker resiliency policies"
linkTitle: "Circuit breakers"
weight: 30
description: "Configure resiliency policies for circuit breakers"
---

Circuit breaker policies are used when other applications/services/components are experiencing elevated failure rates. Circuit breakers reduce load by monitoring the requests and shutting off all traffic to the impacted service when a certain criteria is met. 

After a certain number of requests fail, circuit breakers "trip" or open to prevent cascading failures. By doing this, circuit breakers give the service time to recover from their outage instead of flooding it with events. 

The circuit breaker can also enter a “half-open” state, allowing partial traffic through to see if the system has healed. 

Once requests resume being successful, the circuit breaker gets into "closed" state and allows traffic to completely resume.

## Circuit breaker policy format

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

## Spec metadata

| Retry option | Description |
| ------------ | ----------- |
| `maxRequests` | The maximum number of requests allowed to pass through when the circuit breaker is half-open (recovering from failure). Defaults to `1`. |
| `interval` | The cyclical period of time used by the circuit breaker to clear its internal counts. If set to 0 seconds, this never clears. Defaults to `0s`. |
| `timeout` | The period of the open state (directly after failure) until the circuit breaker switches to half-open. Defaults to `60s`. |
| `trip` | A [Common Expression Language (CEL)](https://github.com/google/cel-spec) statement that is evaluated by the circuit breaker. When the statement evaluates to true, the circuit breaker trips and becomes open. Defaults to `consecutiveFailures > 5`. Other possible values are `requests` and `totalFailures` where `requests` represents the number of either successful or failed calls before the circuit opens and `totalFailures` represents the total (not necessarily consecutive) number of failed attempts before the circuit opens. Example: `requests > 5` and `totalFailures >3`.|

## Next steps
- [Learn more about default resiliency policies]({{< ref default-policies.md >}})
- Learn more about:
  - [Retry policies]({{< ref retries-overview.md >}})
  - [Timeout policies]({{< ref timeouts.md >}})

## Related links

Try out one of the Resiliency quickstarts:
- [Resiliency: Service-to-service]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [Resiliency: State Management]({{< ref resiliency-state-quickstart.md >}})
