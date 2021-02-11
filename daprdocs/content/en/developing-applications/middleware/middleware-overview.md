---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of middleware components for Dapr"
weight: 10000
type: docs
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. Middleware pipelines can be defined inDapr configuration files.

As with other building block components, middleware components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

Middleware in Dapr is described using a `Component` file with the following fields:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <COMPONENT NAME>
  namespace: default
spec:
  type: middleware.http.<MIDDLEWARE NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

Next, the Dapr configuration defines the pipeline of middleware components

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  httpPipeline:
    handlers:
    - name: <COMPONENT NAME>
      type: middleware.http.<MIDDLEWARE NAME>
    - name: <NEXT COMPONENT NAME>
      type: middleware.http.<NEXT MIDDLEWARE NAME>
```

The type of middleware is determined by the `type` field, and configuration like rate limits, OAuth credentials and other metadata are put in the `.metadata` section.
Even though metadata values can secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}).

## Writing a custom middleware

Dapr uses [FastHTTP](https://github.com/valyala/fasthttp) to implement its HTTP server. Hence, your HTTP middleware needs to be written as a FastHTTP handler. Your middleware needs to implement a middleware interface, which defines a **GetHandler** method that returns a **fasthttp.RequestHandler**:

```go
type Middleware interface {
  GetHandler(metadata Metadata) (func(h fasthttp.RequestHandler) fasthttp.RequestHandler, error)
}
```

Your handler implementation can include any inbound logic, outbound logic, or both:

```go
func GetHandler(metadata Metadata) fasthttp.RequestHandler {
  return func(h fasthttp.RequestHandler) fasthttp.RequestHandler {
    return func(ctx *fasthttp.RequestCtx) {
      // inboud logic
      h(ctx)  // call the downstream handler
      // outbound logic
    }
  }
}
```

## Adding new middleware components

Your middleware component can be contributed to the [components-contrib repository](https://github.com/dapr/components-contrib/tree/master/middleware). 

Then submit another pull request against the [Dapr runtime repository](https://github.com/dapr/dapr) to register the new middleware type. You'll need to modify **[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)** method in [cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) to register your middleware with Dapr's runtime.

## Related links

* [Middleware concept]({{< ref middleware-concept.md >}})
* [Middleware quickstart](https://github.com/dapr/quickstarts/tree/master/middleware)