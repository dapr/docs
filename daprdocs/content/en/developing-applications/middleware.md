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

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. There are two places that you can use a middleware pipeline;

1) Building block APIs - HTTP middleware components are executed when invoking any Dapr HTTP APIs.
2) Service-to-Service invocation - HTTP middleware components are applied to service-to-service invocation calls.

## Configuring API middleware pipelines

When launched, a Dapr sidecar constructs a middleware processing pipeline for incoming HTTP calls. By default, the pipeline consists of [tracing middleware]({{< ref tracing-overview.md >}}) and CORS middleware. Additional middleware, configured by a Dapr [configuration]({{< ref configuration-concept.md >}}), can be added to the pipeline in the order they are defined. The pipeline applies to all Dapr API endpoints, including state, pub/sub, service invocation, bindings, secrets, configuration, distributed lock, and others.

A request goes through all the defined middleware components before it's routed to user code, and then goes through the defined middleware, in reverse order, before it's returned to the client, as shown in the following diagram.

<img src="/images/middleware.png" width=800>

HTTP middleware components are executed when invoking Dapr HTTP APIs using the `httpPipeline` configuration.

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

As with other components, middleware components can be found in the [supported Middleware reference]({{< ref supported-middleware >}}) and in the [components-contrib repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

{{< button page="supported-middleware" text="See all middleware components">}}

## Configuring app middleware pipelines

You can also use any middleware components when making service-to-service invocation calls. For example, for token validation in a zero-trust environment, a request transformation for a specific app endpoint, or to apply OAuth policies.

Service-to-service invocation middleware components apply to all outgoing calls from Dapr sidecar to the receiving application (service) as shown in the diagram below.

<img src="/images/app-middleware.png" width=800>

Any middleware component that can be applied to HTTP middleware can also be applied to service-to-service invocation calls as a middleware component using `appHttpPipeline` configuration. The example below adds the `uppercase` middleware component for all outgoing calls from the Dapr sidecar to the application that this configuration is applied to.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  appHttpPipeline:
    handlers:
      - name: uppercase
        type: middleware.http.uppercase
```


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
