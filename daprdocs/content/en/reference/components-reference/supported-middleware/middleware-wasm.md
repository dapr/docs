---
type: docs
title: "Wasm middleware"
linkTitle: "Wasm"
description: "Use Wasm middleware in your HTTP pipeline"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-wasm/
---

The Wasm [HTTP middleware]({{< ref middleware.md >}}) component enables you to use a Wasm file to handle requests and responses.

## Component format

In the following definition, it make content of request body into uppercase:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: middleware.http.wasm.basic
  version: v1
  metadata:
  - name: path
    value: "./hello.wasm"
  - name: runtime
    value: "wazero"
```

## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| path | The path to the Wasm binary | "./hello.wasm" |
| runtime | The Wasm runtime of your Wasm binary. Only`wazero` is supported | "wazero" |


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
    - name: wasm
      type: middleware.http.wasm.basic
```

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
