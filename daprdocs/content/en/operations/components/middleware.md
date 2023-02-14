---
type: docs
title: "Configure middleware components"
linkTitle: "Configure middleware"
weight: 2000
description: "Customize processing pipelines by adding middleware components"
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. There are two places that you can use a middleware pipeline:

1. Building block APIs - HTTP middleware components are executed when invoking any Dapr HTTP APIs.
2. Service-to-Service invocation - HTTP middleware components are applied to service-to-service invocation calls.

## Configure API middleware pipelines

When launched, a Dapr sidecar constructs a middleware processing pipeline for incoming HTTP calls. By default, the pipeline consists of the [tracing]({{< ref tracing-overview.md >}}) and CORS middlewares. Additional middlewares, configured by a Dapr [Configuration]({{< ref configuration-concept.md >}}), can be added to the pipeline in the order they are defined. The pipeline applies to all Dapr API endpoints, including state, pub/sub, service invocation, bindings, secrets, configuration, distributed lock, etc.

A request goes through all the defined middleware components before it's routed to user code, and then goes through the defined middleware, in reverse order, before it's returned to the client, as shown in the following diagram.

<img src="/images/middleware.png" width="800" alt="Diagram showing the flow of a request and a response through the middlewares, as described in the paragraph above" />

HTTP middleware components are executed when invoking Dapr HTTP APIs using the `httpPipeline` configuration.

The following configuration example defines a custom pipeline that uses an [OAuth 2.0 middleware]({{< ref middleware-oauth2.md >}}) and an [uppercase middleware component]({{< ref middleware-uppercase.md >}}). In this case, all requests are authorized through the OAuth 2.0 protocol, and transformed to uppercase text, before they are forwarded to user code.

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

As with other components, middleware components can be found in the [supported Middleware reference]({{< ref supported-middleware >}}) and in the [`dapr/components-contrib` repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

{{< button page="supported-middleware" text="See all middleware components">}}

## Configure app middleware pipelines

You can also use any middleware component when making service-to-service invocation calls. For example, to add token validation in a zero-trust environment, to transform a request for a specific app endpoint, or to apply OAuth policies.

Service-to-service invocation middleware components apply to all **outgoing** calls from a Dapr sidecar to the receiving application (service), as shown in the diagram below.

<img src="/images/app-middleware.png" width="800" alt="Diagram showing the flow of a service invocation request. Requests from the callee Dapr sidecar to the callee application go through the app middleware pipeline as described in the paragraph above." />

Any middleware component that can be used as HTTP middleware can also be applied to service-to-service invocation calls as a middleware component using the `appHttpPipeline` configuration. The example below adds the `uppercase` middleware component for all outgoing calls from the Dapr sidecar (target of service invocation) to the application that this configuration is applied to.

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

## Related links

- [Learn how to author middleware components]({{< ref develop-middleware.md >}})
- [Component schema]({{< ref component-schema.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
- [API middleware sample](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
