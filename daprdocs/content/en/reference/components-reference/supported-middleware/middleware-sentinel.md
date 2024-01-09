---
type: docs
title: "Sentinel fault-tolerance middleware component"
linkTitle: "Sentinel"
description: "Use Sentinel middleware to guarantee the reliability and resiliency of your application"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-sentinel/
---

[Sentinel](https://github.com/alibaba/sentinel-golang) is a powerful fault-tolerance component that takes "flow" as the breakthrough point and covers multiple fields including flow control, traffic shaping, concurrency limiting, circuit breaking, and adaptive system protection to guarantee the reliability and resiliency of microservices.

The Sentinel [HTTP middleware]({{< ref middleware.md >}}) enables Dapr to facilitate Sentinel's powerful abilities to protect your application. You can refer to [Sentinel Wiki](https://github.com/alibaba/sentinel-golang/wiki) for more details on Sentinel.

## Component format

In the following definition, the maximum requests per second are set to 10:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sentinel
spec:
  type: middleware.http.sentinel
  version: v1
  metadata:
  - name: appName
    value: "nodeapp"
  - name: logDir
    value: "/var/tmp"
  - name: flowRules
    value: >-
      [
        {
          "resource": "POST:/v1.0/invoke/nodeapp/method/neworder",
          "threshold": 10,
          "tokenCalculateStrategy": 0,
          "controlBehavior": 0
        }
      ]
  - name: pipelineType
    value: "httpPipeline"
  - name: priority
    value: "1"
```

## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| `appName` | The name of current running service | `nodeapp`
| `logDir` | The log directory path | `/var/tmp/sentinel`
| `flowRules` | JSON array of sentinel flow control rules | [flow control rule](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)
| `circuitBreakerRules` | JSON array of sentinel circuit breaker rules | [circuit breaker rule](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go)
| `hotSpotParamRules` | JSON array of sentinel hotspot parameter flow control rules | [hotspot rule](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)
| `isolationRules` | JSON array of sentinel isolation rules | [isolation rule](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)
| `systemRules` | JSON array of sentinel system rules | [system rule](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)
| `pipelineType` | For configuring middleware pipelines. One of the two types of middleware pipeline so you can configure your middleware for either sidecar-to-sidecar communication (`appHttpPipeline`) or sidecar-to-app communication (`httpPipeline`). | `"httpPipeline"`, `"appHttpPipeline"`
| `priority` | For configuring middleware pipeline ordering. The order in which [middleware components]({{< ref middleware.md >}}) should be arranged and executed. Integer from -MaxInt32 to +MaxInt32. | `"1"`

Once the limit is reached, the request will return *HTTP Status code 429: Too Many Requests*.

Special note to `resource` field in each rule's definition. In Dapr, it follows the following format:

```
POST/GET/PUT/DELETE:Dapr HTTP API Request Path
```

All concrete HTTP API information can be found from [Dapr API Reference]{{< ref "api" >}}. In the above sample config, the `resource` field is set to **POST:/v1.0/invoke/nodeapp/method/neworder**.

## Dapr configuration

You can apply the middleware configuration directly in the middleware component. See [how to apply middleware pipeline configurations]({{< ref "middleware.md" >}}).

## Related links

- [Sentinel Github](https://github.com/alibaba/sentinel-golang)
- [Middleware]({{< ref middleware.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
