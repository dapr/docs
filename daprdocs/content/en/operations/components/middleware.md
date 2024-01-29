---
type: docs
title: "Middleware components"
linkTitle: "Middleware"
weight: 2000
description: "Customize processing pipelines using middleware components"
---

With Dapr, you can define custom processing middleware pipelines. In this guide, you learn about:

- The two types of middleware pipelines.
- The two methods you can use to configure middleware.

## Middleware pipelines

Dapr offers two middleware pipeline types: `httpPipeline` and `appHttpPipeline`. 

### `httpPipeline`

This pipeline applies to all Dapr API endpoints, including state, pub/sub, service invocation, bindings, secrets, configuration, distributed lock, etc. In this pipeline, a request:

1. Goes through all the defined middleware components before it's routed to user code. 
1. Goes through the defined middleware, in reverse order, before it's returned to the client.

<img src="/images/middleware.png" width="800" alt="Diagram showing the flow of a request and a response through the middlewares, as described in the paragraph above" />

### `appHttpPipeline`

You can also use any middleware component when making service-to-service invocation calls. For example, to add token validation in a zero-trust environment, to transform a request for a specific app endpoint, or to apply OAuth policies.

Service-to-service invocation middleware components apply to all **outgoing** calls from a Dapr sidecar to the receiving application (service), as shown in the diagram below.

<img src="/images/app-middleware.png" width="800" alt="Diagram showing the flow of a service invocation request. Requests from the callee Dapr sidecar to the callee application go through the app middleware pipeline as described in the paragraph above." />

## Configure middleware

Dapr offers two ways for you to configure middleware:

- **Recommended:** Using the middleware component, just like any other [component]({{< ref components-concept.md >}}), with a YAML file placed into the application resources folder.
- Using a [configuration file]({{< ref configuration-schema.md >}}).

### Using middleware components

> Configuring middleware pipelines using the middleware component **is the recommended method**.

In your middleware component, you can set the pipeline type and priority metadata  options, both of which are required for the component to be enabled in a pipeline. 

Use `pipelineType` to set either `httpPipeline` or `appHttpPipeline` as the pipeline type. 

The `priority` metadata option sets the order in which middleware components should be arranged and executed. Components with lower priorities are executed first, and priorities don't necessarily need to be sequential. 

The following example defines a custom pipeline that uses a [RouterChecker middleware]({{< ref middleware-routerchecker.md >}}). In this case, all requests are authorized to follow the regex rule `^[A-Za-z0-9/._-]+$` before they are forwarded to user code. The `priority` field determines the order in which requests are executed once all handler components are collected.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routerchecker1
spec:
  type: middleware.http.routerchecker
  version: v1
  metadata:
  - name: rule
    value: "^[A-Za-z0-9/._-]+$"
  - name: pipelineType
    value: appHttpPipeline
  - name: priority
    value: 1 
```

### Using middleware components with configuration

Setting middleware pipelines using [a Dapr configuration file]({{< ref configuration-schema.md >}}) is **no longer recommended**.

#### API middleware pipelines

When launched, a Dapr sidecar constructs a middleware processing pipeline for incoming HTTP calls. By default, the pipeline consists of the [tracing]({{< ref tracing-overview.md >}}) and CORS middlewares. Additional middlewares, configured by a Dapr [Configuration]({{< ref configuration-concept.md >}}), can be added to the pipeline in the order they are defined. 

HTTP middleware components are executed when invoking Dapr HTTP APIs using the `httpPipeline` configuration.

The following configuration example defines a custom pipeline that uses an [OAuth 2.0 middleware]({{< ref middleware-oauth2.md >}}) and an [uppercase middleware component]({{< ref middleware-uppercase.md >}}). In this case, all requests are authorized through the OAuth 2.0 protocol, and transformed to uppercase text, before they are forwarded to user code.

{{% alert title="Note" color="primary" %}}
Make sure to set different priority for different middleware components, otherwise Dapr might set it randomly.
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
  name: pipeline
  namespace: default
metadata:
  name: routerchecker1
spec:
  httpPipeline:
    handlers:
      - name: oauth2
        type: middleware.http.oauth2
      - name: uppercase
        type: middleware.http.uppercase
```

As with other components, supported middleware components can be found in the [supported Middleware reference guide]({{< ref supported-middleware >}}) and in the [`dapr/components-contrib` repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

#### App middleware pipelines

Any middleware component that can be used as HTTP middleware can also be applied to service-to-service invocation calls as a middleware component using the `appHttpPipeline` configuration. 

The example below adds the `uppercase` middleware component for all outgoing calls from the Dapr sidecar (target of service invocation) to the application that this configuration is applied to.

{{% alert title="Note" color="primary" %}}
Make sure to set different priority for different middleware components, otherwise Dapr might set it randomly.
{{% /alert %}}

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
- [API middleware sample](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
