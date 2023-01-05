---
type: docs
title: "How to: Author middleware components"
linkTitle: "Middleware components"
weight: 200
description: "Learn how to develop middleware components"
aliases:
  - /developing-applications/middleware/middleware-overview/
  - /concepts/middleware-concept/
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. There are two places that you can use a middleware pipeline;

1) Building block APIs - HTTP middleware components are executed when invoking any Dapr HTTP APIs.
2) Service-to-Service invocation - HTTP middleware components are applied to service-to-service invocation calls.

## Writing a custom middleware

Dapr uses [FastHTTP](https://github.com/valyala/fasthttp) to implement its HTTP server. Hence, your HTTP middleware needs to be written as a FastHTTP handler. Your middleware needs to implement a middleware interface, which defines a **GetHandler** method that returns **fasthttp.RequestHandler** and **error**:

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
      // inbound logic
      h(ctx)  // call the downstream handler
      // outbound logic
    }
  }, err
}
```

## Related links

- [Component schema]({{< ref component-schema.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
- [API middleware sample](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
