---
type: docs
title: "Rate limiting"
linkTitle: "Rate limiting"
weight: 1000
description: "Use Dapr rate limit middleware to limit requests per second"
type: docs
---

The Dapr Rate limit [HTTP middleware]({{< ref middleware-concept.md >}}) allows restricting the maximum number of allowed HTTP requests per second. 

## Middleware component definition

In the following definition, the maximum requests per second are set to 10:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ratelimit
spec:
  type: middleware.http.ratelimit
  metadata:
  - name: maxRequestsPerSecond
    value: 10
```

| Metadata field       | Description                                                                                                                                                                              | Example |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| maxRequestsPerSecond | The maximum requests per second by remoteIP and path. Something to consider is that **the limit is enforced independently in each Dapr sidecar and not cluster wide.** | `10`    |

Once the limit is reached, the request will return *HTTP Status code 429: Too Many Requests*.

## Referencing the rate limit middleware

To be applied, the middleware must be referenced in a [Dapr Configuration]({{< ref configuration-concept.md >}}). See [Middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

## Related links

- [Middleware concept]({{< ref middleware-concept.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})