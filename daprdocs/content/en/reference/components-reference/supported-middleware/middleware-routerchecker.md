---
type: docs
title: "RouterChecker http request routing"
linkTitle: "RouterChecker"
description: "Use routerchecker middleware to block invalid http request routing"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-routerchecker/
---

The RouterChecker HTTP [middleware]({{< ref middleware.md >}}) component leverages regexp to check the validity of HTTP request routing to prevent invalid routers from entering the Dapr cluster. In turn, filtering out bad requests, and reducing noise in the telemetry and log data.

## Component format

The RouterChecker applies a set of rules to the incoming HTTP request. You define these rules in the component metadata using regular expressions. In the following example, the HTTP request RouterChecker is set to validate all requests message against the `^[A-Za-z0-9/._-]+$`: regex.

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

In this example, the above definition would result in the following PASS/FAIL cases:

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
| rule | the regexp expression to be used by the HTTP request RouterChecker | `^[A-Za-z0-9/._-]+$`|

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
