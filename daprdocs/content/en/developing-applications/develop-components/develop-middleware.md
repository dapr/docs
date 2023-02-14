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

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. In this guide, you'll learn how to create a middleware component. To learn how to configure an existing middleware component, see [Configure middleware components]({{< ref middleware.md >}})

## Writing a custom HTTP middleware

HTTP middlewares in Dapr wrap standard Go [net/http](https://pkg.go.dev/net/http) handler functions.

Your middleware needs to implement a middleware interface, which defines a **GetHandler** method that returns a [**http.Handler**](https://pkg.go.dev/net/http#Handler) callback and an **error**:

```go
type Middleware interface {
  GetHandler(metadata middleware.Metadata) (func(next http.Handler) http.Handler, error)
}
```

The handler receives a `next` callback that should be invoked to continue processing the request.

Your handler implementation can include an inbound logic, outbound logic, or both:

```go

func (m *customMiddleware) GetHandler(metadata middleware.Metadata) (func(next http.Handler) http.Handler, error) {
  var err error
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      // Inbound logic
      // ...

      // Call the next handler
      next.ServeHTTP(w, r)

      // Outbound logic
      // ...
    }
  }, err
}
```

## Related links

- [Component schema]({{< ref component-schema.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
- [API middleware sample](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
