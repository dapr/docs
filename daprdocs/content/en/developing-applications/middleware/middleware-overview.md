---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of middleware components for Dapr"
weight: 10000
type: docs
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. Middleware pipelines are defined in Dapr configuration files.
As with other [building block components]({{< ref component-schema.md >}}), middleware components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

Middleware in Dapr is described using a `Component` file with the following schema:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <COMPONENT NAME>
  namespace: <NAMESPACE>
spec:
  type: middleware.http.<MIDDLEWARE TYPE>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```
The type of middleware is determined by the `type` field. Component setting values such as rate limits, OAuth credentials and other settings are put in the `metadata` section.
Even though metadata values can contain secrets in plain text, it is recommended that you use a [secret store]({{< ref component-secrets.md >}}).

Next, a Dapr [configuration]({{< ref configuration-overview.md >}}) defines the pipeline of middleware components for your application.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: <COMPONENT NAME>
      type: middleware.http.<MIDDLEWARE TYPE>
    - name: <COMPONENT NAME>
      type: middleware.http.<MIDDLEWARE TYPE>
```

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

After the components-contrib change has been accepted, submit another pull request against the [Dapr runtime repository](https://github.com/dapr/dapr) to register the new middleware type. You'll need to modify **[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)** method in [cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) to register your middleware with Dapr's runtime.

## Related links

* [Middleware pipelines concept]({{< ref middleware-concept.md >}})
* [Component schema]({{< ref component-schema.md >}})
* [Configuration overview]({{< ref configuration-overview.md >}})
