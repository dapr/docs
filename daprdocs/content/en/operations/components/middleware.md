---
type: docs
title: "Configure middleware components"
linkTitle: "Configure middleware"
weight: 2000
description: "Customize processing pipelines via the middleware components"
---

{{% alert title="Note" color="primary" %}}
Configuring middleware components using the [configuration schema]({{< ref configuration-schema.md >}}) is **deprecated**.
{{% /alert %}}

With Dapr, you can define custom processing midleware pipelines. There are two places that you can use a middleware pipeline:

1. [**Building block APIs:**](#configure-api-middleware-pipelines) HTTP middleware components are executed when invoking any Dapr HTTP APIs.
1. [**Service-to-Service invocation:**](#configure-app-middleware) appHttp middleware components are applied to service-to-service invocation calls.

You can set two metadata `pipelineType` options, both of which are required for the component to be enabled in a pipeline:

- `httpPipeline` for building block API middleware pipelines
- `appHttpPipeline` for service-to-servie invocation middleware pipelines

The `priority` metadata option sets order in which middleware components should be arranged and executed. Components with lower priorities are executed first, and priorities don't necessarily need to be sequential. 

In this guide, you learn how to configure middleware components. To learn how to create middleware components, see the [Author middleware components how-to guides.]({{< ref develop-middleware.md >}}) 

## Configure API middleware pipelines

When launched, a Dapr sidecar constructs a middleware processing pipeline for incoming HTTP calls. By default, the pipeline consists of the [tracing]({{< ref tracing-overview.md >}}) and CORS middlewares. Additional middlewares, configured by a Dapr [Configuration]({{< ref configuration-concept.md >}}), can be added to the pipeline in the order they are defined. The pipeline applies to all Dapr API endpoints, including state, pub/sub, service invocation, bindings, secrets, configuration, distributed lock, etc.

A request goes through all the defined middleware components before it's routed to user code, and then goes through the defined middleware, in reverse order, before it's returned to the client, as shown in the following diagram.

<img src="/images/middleware.png" width="800" alt="Diagram showing the flow of a request and a response through the middlewares, as described in the paragraph above" />

HTTP middleware components are executed when invoking Dapr HTTP APIs using the `httpPipeline` setting.

The following example defines a custom pipeline that uses a [RouterChecker middleware]({{< ref middleware-routerchecker.md >}}). In this case, all requests are authorized to follow the regex rule `^[A-Za-z0-9/._-]+$` before they are forwarded to user code. The `priority` field determines the order in which requests are executed once all handler components are collected.

{{% alert title="Note" color="primary" %}}
Make sure to set different priority for different middleware components, otherwise Dapr might set it randomly.
{{% /alert %}}

```yaml
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
    value: httpPipeline
  - name: priority
    value: 1 
```

As with other components, supported middleware components can be found in the [supported Middleware reference guide]({{< ref supported-middleware >}}) and in the [`dapr/components-contrib` repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

## Configure app middleware pipelines

You can also use any middleware component when making service-to-service invocation calls. For example, to add token validation in a zero-trust environment, to transform a request for a specific app endpoint, or to apply OAuth policies.

Service-to-service invocation middleware components apply to all **outgoing** calls from a Dapr sidecar to the receiving application (service), as shown in the diagram below.

<img src="/images/app-middleware.png" width="800" alt="Diagram showing the flow of a service invocation request. Requests from the callee Dapr sidecar to the callee application go through the app middleware pipeline as described in the paragraph above." />

Any middleware component that can be used as HTTP middleware can also be applied to service-to-service invocation calls as a middleware component using the `appHttpPipeline` configuration. The example below adds the `routerchecker` middleware component for all outgoing calls from the Dapr sidecar (target of service invocation) to the application that this configuration is applied to.

{{% alert title="Note" color="primary" %}}
Make sure to set different priority for different middleware components, otherwise Dapr might set it randomly.
{{% /alert %}}

```yaml
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

## Related links

- [Learn how to author middleware components]({{< ref develop-middleware.md >}})
- [API middleware sample](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
