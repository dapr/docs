---
type: docs
title: "Rate limiting"
linkTitle: "Rate limiting"
weight: 1000
description: "Use Dapr rate limit middleware to limit requests per second"
type: docs
---

The Dapr Rate limit [HTTP middleware]({{< ref middleware-concept.md >}}) allows restricting the maximum number of allowed HTTP requests per second. Rate limiting can protect your application from denial of service (DOS) attacks. DOS attacks can be initiated by malicious 3rd parties but also by bugs in your software (a.k.a. a "friendly fire" DOS attack).

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

## Dapr configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9411/api/v2/spans"
  httpPipeline:
    handlers:
    - name: ratelimit
      type: middleware.http.ratelimit
```

| Metadata field       | Description                                                                                                                                                                              | Example |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| maxRequestsPerSecond | The maximum requests per second by remote IP and path. Something to consider is that **the limit is enforced independently in each Dapr sidecar and not cluster wide.** | `10`    |

Once the limit is reached, the request will return *HTTP Status code 429: Too Many Requests*.

## Referencing the rate limit middleware

To be applied, the middleware must be referenced in a [Dapr Configuration]({{< ref configuration-concept.md >}}). See [Middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

## Rate limiting using max concurrency

Alternatively, Dapr also allows setting the maximum concurrency of a sidecar as a rate limiting mechanism. This is applies to all traffic regardless of remove IP or path.

**Standalone mode example**

```shell
dapr run --app-id myservice --app-port 6000 --app-max-concurrency 2 dotnet run
```

**Kubernetes example**

```shell
...
 template:
    metadata:
      labels:
        app: myservice
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myservice"
        dapr.io/app-port: "6000"
        dapr.io/app-max-concurrency: 2
...
```

## Related links

- [Middleware concept]({{< ref middleware-concept.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})