---
type: docs
title: "Rate limiting"
linkTitle: "Rate limiting"
description: "Use rate limit middleware to limit requests per second"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-rate-limit/
---

The rate limit [HTTP middleware]({{< ref middleware.md >}}) allows restricting the maximum number of allowed HTTP requests per second. Rate limiting can protect your application from Denial of Service (DoS) attacks. DoS attacks can be initiated by malicious 3rd parties but also by bugs in your software (a.k.a. a "friendly fire" DoS attack).

## Component format

In the following definition, the maximum requests per second are set to 10:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ratelimit
spec:
  type: middleware.http.ratelimit
  version: v1
  metadata:
  - name: maxRequestsPerSecond
    value: 10
  - name: pipelineType
    value: httpPipeline
  - name: priority
    value: 1
```

## Spec metadata fields

| Field | Required? | Details | Example |
|-------|-----------|---------|---------|
| `maxRequestsPerSecond` |  | The maximum requests per second by remote IP.<br>The component looks at the `X-Forwarded-For` and `X-Real-IP` headers to determine the caller's IP. | `10`
| `pipelineType` | Y | For configuring middleware pipelines. One of the two types of middleware pipeline so you can configure your middleware for either sidecar-to-sidecar communication (`appHttpPipeline`) or sidecar-to-app communication (`httpPipeline`). | `"httpPipeline"`, `"appHttpPipeline"`
| `priority` | N | For configuring middleware pipeline ordering. The order in which [middleware components]({{< ref middleware.md >}}) are executed. Integer from -MaxInt32 to +MaxInt32.  | `"1"`

Once the limit is reached, the requests will fail with HTTP Status code *429: Too Many Requests*.

{{% alert title="Important" color="warning" %}}
The rate limit is enforced independently in each Dapr sidecar, and not cluster-wide.
{{% /alert %}}

Alternatively, the [max concurrency setting]({{< ref control-concurrency.md >}}) can be used to rate-limit applications and applies to all traffic, regardless of remote IP, protocol, or path.

## Configure

You can configure middleware using the following methods:

- **Recommended:** Using [the middleware component]({{< ref "middleware.md#using-middleware-components" >}}), just like any other [component]({{< ref components-concept.md >}}), with a YAML file placed into the application resources folder.
- Using a [configuration file]({{< ref "middleware.md#using-middleware-components-with-configuration" >}}).

## Related links

- [Control max concurrently]({{< ref control-concurrency.md >}})
- [Middleware]({{< ref middleware.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
