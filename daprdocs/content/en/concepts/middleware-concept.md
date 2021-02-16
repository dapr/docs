---
type: docs
title: "Middleware pipelines"
linkTitle: "Middleware"
weight: 400
description: "Custom processing pipelines of chained middleware components"
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. A request goes through all defined middleware components before it's routed to user code, and then goes through the defined middleware, in reverse order, before it's returned to the client, as shown in the following diagram.

<img src="/images/middleware.png" width=400>

## Customize processing pipeline

When launched, a Dapr sidecar constructs a middleware processing pipeline. By default the pipeline consists of [tracing middleware]({{< ref tracing-overview.md >}}) and CORS middleware. Additional middleware, configured by a Dapr [configuration]({{< ref configuration-concept.md >}}), can be added to the pipeline in the order they are defined. The pipeline applies to all Dapr API endpoints, including state, pub/sub, service invocation, bindings, security and others.

> **NOTE:** Dapr provides a **middleware.http.uppercase** pre-registered component that changes all text in a request body to uppercase. You can use it to test/verify if your custom pipeline is in place.

The following configuration example defines a custom pipeline that uses a [OAuth 2.0 middleware]({{< ref oauth.md >}}) and an uppercase middleware component. In this case, all requests are authorized through the OAuth 2.0 protocol, and transformed to uppercase text, before they are forwarded to user code.

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

## Next steps

* [Middleware overview]({{< ref middleware-overview.md >}})
* [How-To: Configure API authorization with OAuth]({{< ref oauth.md >}})
