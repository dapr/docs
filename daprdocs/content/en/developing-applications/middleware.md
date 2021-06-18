---
type: docs
title: "Middleware"
linkTitle: "Middleware"
weight: 50
description: "Customize processing pipelines by adding middleware components"
aliases:
- /developing-applications/middleware/middleware-overview/
- /concepts/middleware-concept/
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. A request goes through all defined middleware components before it's routed to user code, and then goes through the defined middleware, in reverse order, before it's returned to the client, as shown in the following diagram.

<img src="/images/middleware.png" width=800>

## Configuring middleware pipelines

When launched, a Dapr sidecar constructs a middleware processing pipeline. By default the pipeline consists of [tracing middleware]({{< ref tracing-overview.md >}}) and CORS middleware. Additional middleware, configured by a Dapr [configuration]({{< ref configuration-concept.md >}}), can be added to the pipeline in the order they are defined. The pipeline applies to all Dapr API endpoints, including state, pub/sub, service invocation, bindings, security and others.

The following configuration example defines a custom pipeline that uses a [OAuth 2.0 middleware]({{< ref middleware-oauth2.md >}}) and an [uppercase middleware component]({{< ref middleware-uppercase.md >}}). In this case, all requests are authorized through the OAuth 2.0 protocol, and transformed to uppercase text, before they are forwarded to user code.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  httpPipeline:
    handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

As with other building block components, middleware components are extensible and can be found in the [supported Middleware reference]({{< ref supported-middleware >}}) and in the [components-contrib repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

{{< button page="supported-middleware" text="See all middleware components">}}

## Writing a custom middleware

Dapr uses [FastHTTP](https://github.com/valyala/fasthttp) to implement its HTTP server. Hence, your HTTP middleware needs to be written as a FastHTTP handler. Your middleware needs to implement a middleware interface, which defines a **GetHandler** method that returns  **fasthttp.RequestHandler** and **error**:

```go
type Middleware interface {
  GetHandler(metadata Metadata) (func(h fasthttp.RequestHandler) fasthttp.RequestHandler, error)
}
```

Your handler implementation can include any inbound logic, outbound logic, or both:

```go

func (m *customMiddleware) GetHandler(metadata Metadata) (func(fasthttp.RequestHandler) fasthttp.RequestHandler, error) {
  var err error
  return func(h fasthttp.RequestHandler) fasthttp.RequestHandler {
    return func(ctx *fasthttp.RequestCtx) {
      // inboud logic
      h(ctx)  // call the downstream handler
      // outbound logic
    }
  }, err
}
```

## Adding new middleware components

Your middleware component can be contributed to the [components-contrib repository](https://github.com/dapr/components-contrib/tree/master/middleware).

After the components-contrib change has been accepted, submit another pull request against the [Dapr runtime repository](https://github.com/dapr/dapr) to register the new middleware type. You'll need to modify **[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)** method in [cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) to register your middleware with Dapr's runtime.

## Related links

* [Component schema]({{< ref component-schema.md >}})
* [Configuration overview]({{< ref configuration-overview.md >}})
* [Middleware quickstart](https://github.com/dapr/quickstarts/tree/master/middleware)
