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
```

## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| appName | the name of current running service | `nodeapp`
| logDir | the log directory path | `/var/tmp/sentinel`
| flowRules | json array of sentinel flow control rules | [flow control rule](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)
| circuitBreakerRules | json array of sentinel circuit breaker rules | [circuit breaker rule](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go)
| hotSpotParamRules | json array of sentinel hotspot parameter flow control rules | [hotspot rule](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)
| isolationRules | json array of sentinel isolation rules | [isolation rule](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)
| systemRules | json array of sentinel system rules | [system rule](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)

Once the limit is reached, the request will return *HTTP Status code 429: Too Many Requests*.

Special note to `resource` field in each rule's definition. In Dapr, it follows the following format:

```
POST/GET/PUT/DELETE:Dapr HTTP API Request Path
```

All concrete HTTP API information can be found from [Dapr API Reference]{{< ref "api" >}}. In the above sample config, the `resource` field is set to **POST:/v1.0/invoke/nodeapp/method/neworder**.

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  httpPipeline:
    handlers:
      - name: sentinel
        type: middleware.http.sentinel
```

## Related links

- [Sentinel Github](https://github.com/alibaba/sentinel-golang)
- [Middleware]({{< ref middleware.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
