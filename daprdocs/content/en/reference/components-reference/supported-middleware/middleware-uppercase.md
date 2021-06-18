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
```

This component has no `metadata` to configure.

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: uppercase
      type: middleware.http.uppercase
```

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
