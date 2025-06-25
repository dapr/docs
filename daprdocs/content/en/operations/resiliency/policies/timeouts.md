---
type: docs
title: "Timeout resiliency policies"
linkTitle: "Timeouts"
weight: 10
description: "Configure resiliency policies for timeouts"
---

Network calls can fail for many reasons, causing your application to wait indefinitely for responses. By setting a timeout duration, you can cut off those unresponsive services, freeing up resources to handle new requests. 

Timeouts are optional policies that can be used to early-terminate long-running operations. Set a realistic timeout duration that reflects actual response times in production. If you've exceeded a timeout duration:

- The operation in progress is terminated (if possible).
- An error is returned.

## Timeout policy format

```yaml
spec:
  policies:
    # Timeouts are simple named durations.
    timeouts:
      timeoutName: timeout1
      general: 5s
      important: 60s
      largeResponse: 10s
```

### Spec metadata

| Field | Details | Example |
| timeoutName | Name of the timeout policy | `timeout1` |
| general | Time duration for timeouts marked as "general". Uses Go's [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) format. No set maximum value. | `15s`, `2m`, `1h30m` |
| important | Time duration for timeouts marked as "important". Uses Go's [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) format. No set maximum value. | `15s`, `2m`, `1h30m` |
| largeResponse | Time duration for timeouts awaiting a large response. Uses Go's [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) format. No set maximum value. | `15s`, `2m`, `1h30m` |

> If you don't specify a timeout value, the policy does not enforce a time and defaults to whatever you set up per the request client. 

## Next steps

- [Learn more about default resiliency policies]({{< ref default-policies.md >}})
- Learn more about:
  - [Retry policies]({{< ref retries-overview.md >}})
  - [Circuit breaker policies]({{< ref circuit-breakers.md >}})

## Related links

Try out one of the Resiliency quickstarts:
- [Resiliency: Service-to-service]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [Resiliency: State Management]({{< ref resiliency-state-quickstart.md >}})
