---
type: docs
title: "RouterChecker http request routing"
linkTitle: "RouterChecker"
description: "Use routerchecker middleware to block invalid http request routing"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-routerchecker/
---

The routerchecker [HTTP middleware]({{< ref middleware.md >}}) checks the legitimacy of http request routing, that prevents illegal routers from entering dapr cluster, and at the same time prevents a large number of such requests from affecting the view of observable data.

## Component format

In the following definition,  the http request router is set to  `^[A-Za-z0-9/._-]+$`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routerchecker 
spec:
  type: middleware.http.routerchecker
  version: v1
  metadata:
  - name: rule
    value: "^[A-Za-z0-9/._-]+$"
```

For example:

```shell
PASS /v1.0/invoke/demo/method/method
PASS /v1.0/invoke/demo.default/method/method
PASS /v1.0/invoke/demo.default/method/01
PASS /v1.0/invoke/demo.default/method/METHOD
PASS /v1.0/invoke/demo.default/method/user/info
PASS /v1.0/invoke/demo.default/method/user_info
PASS /v1.0/invoke/demo.default/method/user-info

FAIL /v1.0/invoke/demo.default/method/cat password
FAIL /v1.0/invoke/demo.default/method/" AND 4210=4210 limit 1
FAIL /v1.0/invoke/demo.default/method/"$(curl
```

## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| rule | http request routing regexp | `^[A-Za-z0-9/._-]+$`|

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: routerchecker 
      type: middleware.http.routerchecker
```

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
