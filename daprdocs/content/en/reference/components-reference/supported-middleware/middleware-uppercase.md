---
type: docs
title: "Uppercase request body"
linkTitle: "Uppercase"
description: "Test your HTTP pipeline is functioning with the uppercase middleware"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-uppercase/
---

The uppercase [HTTP middleware]({{< ref middleware.md >}}) converts the body of the request to uppercase letters and is used for testing that the pipeline is functioning. It should only be used for local development.

## Component format

In the following definition, it make content of request body into uppercase:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: uppercase
spec:
  type: middleware.http.uppercase
  version: v1
  - name: pipelineType
    value: "httpPipeline"
  - name: priority
    value: "1"
```

## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| `pipelineType` | For configuring middleware pipelines. One of the two types of middleware pipeline so you can configure your middleware for either sidecar-to-sidecar communication (`appHttpPipeline`) or sidecar-to-app communication (`httpPipeline`). | `"httpPipeline"`, `"appHttpPipeline"`
| `priority` | For configuring middleware pipeline ordering. The order in which [middleware components]({{< ref middleware.md >}}) should be arranged and executed. | `"1"`

## Dapr configuration

You can apply the middleware configuration directly in the middleware component. See [how to apply middleware pipeline configurations]({{< ref "middleware.md" >}}).

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
