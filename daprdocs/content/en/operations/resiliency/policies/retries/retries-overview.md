---
type: docs
title: "Retry resiliency policies"
linkTitle: "Overview"
weight: 10
description: "Configure resiliency policies for retries"
---

Requests can fail due to transient errors, like encountering network congestion, reroutes to overloaded instances, and more. Sometimes, requests can fail due to other resiliency policies set in place, like triggering a defined timeout or circuit breaker policy. 

In these cases, configuring `retries` can either:
- Send the same request to a different instance, or
- Retry sending the request after the condition has cleared. 

Retries and timeouts work together, with timeouts ensuring your system fails fast when needed, and retries recovering from temporary glitches.  

Dapr provides [default resiliency policies]({{< ref default-policies.md >}}), which you can [overwrite with user-defined retry policies.]({{< ref override-default-retries.md >}})

{{% alert title="Important" color="warning" %}}
Each [pub/sub component]({{< ref supported-pubsub >}}) has its own built-in retry behaviors. Explicity applying a Dapr resiliency policy doesn't override these implicit retry policies. Rather, the resiliency policy augments the built-in retry, which can cause repetitive clustering of messages.
{{% /alert %}}

## Retry policy format

**Example 1**

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

**Example 2**

```yaml
spec:
  policies:
    retries:
      retry5xxOnly:
        policy: constant
        duration: 5s
        maxRetries: 3
        matching:
          httpStatusCodes: "429,500-599" # retry the HTTP status codes in this range. All others are not retried. 
          gRPCStatusCodes: "1-4,8-11,13,14" # retry gRPC status codes in these ranges and separate single codes.
```

## Spec metadata

The following retry options are configurable:

| Retry option | Description |
| ------------ | ----------- |
| `policy` | Determines the back-off and retry interval strategy. Valid values are `constant` and `exponential`.<br/>Defaults to `constant`. |
| `duration` | Determines the time interval between retries. Only applies to the `constant` policy.<br/>Valid values are of the form `200ms`, `15s`, `2m`, etc.<br/> Defaults to `5s`.|
| `maxInterval` | Determines the maximum interval between retries to which the [`exponential` back-off policy](#exponential-back-off-policy) can grow.<br/>Additional retries always occur after a duration of `maxInterval`. Defaults to `60s`. Valid values are of the form `5s`, `1m`, `1m30s`, etc |
| `maxRetries` | The maximum number of retries to attempt. <br/>`-1` denotes an unlimited number of retries, while `0` means the request will not be retried (essentially behaving as if the retry policy were not set).<br/>Defaults to `-1`. |
| `matching.httpStatusCodes` | Optional: a comma-separated string of [HTTP status codes or code ranges to retry](#retry-status-codes). Status codes not listed are not retried.<br/>Valid values: 100-599, [Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)<br/>Format: `<code>` or range `<start>-<end>`<br/>Example: "429,501-503"<br/>Default: empty string `""` or field is not set. Retries on all HTTP errors. |
| `matching.gRPCStatusCodes` | Optional: a comma-separated string of [gRPC status codes or code ranges to retry](#retry-status-codes). Status codes not listed are not retried.<br/>Valid values: 0-16, [Reference](https://grpc.io/docs/guides/status-codes/)<br/>Format: `<code>` or range `<start>-<end>`<br/>Example: "4,8,14"<br/>Default: empty string `""` or field is not set. Retries on all gRPC errors. |


## Exponential back-off policy

The exponential back-off window uses the following formula:

```
BackOffDuration = PreviousBackOffDuration * (Random value from 0.5 to 1.5) * 1.5
if BackOffDuration > maxInterval {
  BackoffDuration = maxInterval
}
```

## Retry status codes

When applications span multiple services, especially on dynamic environments like Kubernetes, services can disappear for all kinds of reasons and network calls can start hanging. Status codes provide a glimpse into our operations and where they may have failed in production. 

### HTTP

The following table includes some examples of HTTP status codes you may receive and whether you should or should not retry certain operations.

| HTTP Status Code          | Retry Recommended?     | Description                  |
| ------------------------- | ---------------------- | ---------------------------- |
| 404 Not Found             | ❌ No                  | The resource doesn't exist.  |
| 400 Bad Request           | ❌ No                  | Your request is invalid.     |
| 401 Unauthorized          | ❌ No                  | Try getting new credentials. |
| 408 Request Timeout       | ✅ Yes                 | The server timed out waiting for the request.       |
| 429 Too Many Requests     | ✅ Yes                 | (Respect the `Retry-After` header, if present).     |
| 500 Internal Server Error | ✅ Yes                 | The server encountered an unexpected condition.       |
| 502 Bad Gateway           | ✅ Yes                 | A gateway or proxy received an invalid response.     |
| 503 Service Unavailable   | ✅ Yes                 | Service might recover.       |
| 504 Gateway Timeout       | ✅ Yes                 | Temporary network issue.     |

### gRPC 

The following table includes some examples of gRPC status codes you may receive and whether you should or should not retry certain operations.

| gRPC Status Code          | Retry Recommended?      | Description                  |
| ------------------------- | ----------------------- | ---------------------------- |
| Code 1 CANCELLED          | ❌ No                   | N/A                          |
| Code 3 INVALID_ARGUMENT   | ❌ No                   | N/A                          |
| Code 4 DEADLINE_EXCEEDED  | ✅ Yes                  | Retry with backoff           |
| Code 5 NOT_FOUND          | ❌ No                   | N/A                          |
| Code 8 RESOURCE_EXHAUSTED | ✅ Yes                  | Retry with backoff           |
| Code 14 UNAVAILABLE       | ✅ Yes                  | Retry with backoff           |

### Retry filter based on status codes

The retry filter enables granular control over retry policies by allowing users to specify HTTP and gRPC status codes or ranges for which retries should apply. 

```yml
spec:
  policies:
    retries:
      retry5xxOnly:
        # ...
        matching:
          httpStatusCodes: "429,500-599" # retry the HTTP status codes in this range. All others are not retried. 
          gRPCStatusCodes: "4,8-11,13,14" # retry gRPC status codes in these ranges and separate single codes.
```

{{% alert title="Note" color="primary" %}}
Field values for status codes must follow the format specified above. An incorrectly formatted value produces an error log ("Could not read resiliency policy") and the `daprd` startup sequence will proceed.
{{% /alert %}}

## Demo 

Watch a demo presented during [Diagrid's Dapr v1.15 celebration](https://www.diagrid.io/videos/dapr-1-15-deep-dive) to see how to set retry status code filters using Diagrid Conductor

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NTnwoDhHIcQ?si=8k1IhRazjyrIJE3P&amp;start=4565" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Next steps

- [Learn how to override default retry policies for specific APIs.]({[< ref override-default-retries.md >]})
- [Learn how to target your retry policies from the resiliency spec.]({{< ref targets.md >}})
- Learn more about:
  - [Timeout policies]({{< ref timeouts.md >}})
  - [Circuit breaker policies]({{< ref circuit-breakers.md >}})

## Related links

Try out one of the Resiliency quickstarts:
- [Resiliency: Service-to-service]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [Resiliency: State Management]({{< ref resiliency-state-quickstart.md >}})
