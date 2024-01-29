---
type: docs
title: "RouterChecker http request routing"
linkTitle: "RouterChecker"
description: "Use routerchecker middleware to block invalid http request routing"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-routerchecker/
---

The RouterChecker HTTP [middleware]({{< ref middleware.md >}}) component leverages regexp to check the validity of HTTP request routing to prevent invalid routers from entering the Dapr cluster. In turn, the RouterChecker component filters out bad requests and reduces noise in the telemetry and log data.

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
  - name: pipelineType
    value: "httpPipeline"
  - name: priority
    value: "1"
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

| Field | Required? | Details | Example |
|-------|-----------|---------|---------|
| `rule` |  | The regexp expression to be used by the HTTP request RouterChecker | `^[A-Za-z0-9/._-]+$`|
| `pipelineType` | Y | For configuring middleware pipelines. One of the two types of middleware pipeline so you can configure your middleware for either sidecar-to-sidecar communication (`appHttpPipeline`) or sidecar-to-app communication (`httpPipeline`). | `"httpPipeline"`, `"appHttpPipeline"`
| `priority` | N | For configuring middleware pipeline ordering. The order in which [middleware components]({{< ref middleware.md >}}) are executed. Integer from -MaxInt32 to +MaxInt32. | `"1"`

## Configure

You can configure middleware using the following methods:

- **Recommended:** Using [the middleware component]({{< ref "middleware.md#using-middleware-components" >}}), just like any other [component]({{< ref components-concept.md >}}), with a YAML file placed into the application resources folder.
- Using a [configuration file]({{< ref "middleware.md#using-middleware-components-with-configuration" >}}).

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
