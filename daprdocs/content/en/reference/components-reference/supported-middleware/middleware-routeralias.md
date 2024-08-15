---
type: docs
title: "Router alias http request routing"
linkTitle: "Router Alias"
description: "Use router alias middleware to alias arbitrary http routes to Dapr endpoints"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-routeralias/
---

The router alias HTTP [middleware]({{< ref middleware.md >}}) component allows you to convert arbitrary HTTP routes arriving into Dapr to valid Dapr API endpoints.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routeralias 
spec:
  type: middleware.http.routeralias
  version: v1
  metadata:
    # String containing a JSON-encoded or YAML-encoded dictionary
    # Each key in the dictionary is the incoming path, and the value is the path it's converted to
    - name: "routes"
      value: |
        {
          "/mall/activity/info": "/v1.0/invoke/srv.default/method/mall/activity/info",
          "/hello/activity/{id}/info": "/v1.0/invoke/srv.default/method/hello/activity/info",
          "/hello/activity/{id}/user": "/v1.0/invoke/srv.default/method/hello/activity/user"
        }
    - name: pipelineType
      value: httpPipeline
    - name: priority
      value: 1
```

In the example above, an incoming HTTP request for `/mall/activity/info?id=123` is transformed into `/v1.0/invoke/srv.default/method/mall/activity/info?id=123`.

# Spec metadata fields

| Field | Required? | Details | Example |
|-------|-----------|---------|---------|
| `routes` |  | String containing a JSON-encoded or YAML-encoded dictionary. Each key in the dictionary is the incoming path, and the value is the path it's converted to. | See example above |
| `pipelineType` | Y | For configuring middleware pipelines. One of the two types of middleware pipeline so you can configure your middleware for either sidecar-to-sidecar communication (`appHttpPipeline`) or sidecar-to-app communication (`httpPipeline`). | `"httpPipeline"`, `"appHttpPipeline"`
| `priority` | N | For configuring middleware pipeline ordering. The order in which [middleware components]({{< ref middleware.md >}}) are executed. Integer from -MaxInt32 to +MaxInt32.  | `"1"`

## Configure

You can configure middleware using the following methods:

- **Recommended:** Using [the middleware component]({{< ref "middleware.md#using-middleware-components" >}}), just like any other [component]({{< ref components-concept.md >}}), with a YAML file placed into the application resources folder.
- Using a [configuration file]({{< ref "middleware.md#using-middleware-components-with-configuration" >}}).

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
