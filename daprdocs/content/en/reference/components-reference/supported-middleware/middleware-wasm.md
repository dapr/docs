---
type: docs
title: "WASM"
linkTitle: "WASM"
description: "Use WASM middleware in your HTTP pipeline"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-wasm/
---

The WASM [HTTP middleware]({{< ref middleware.md >}}) component enables you to use a WASM module to handle requests and responses.
Using WASM modules allow developers to write middleware components in any WASM supported language and extend Dapr using external files that are not pre-compiled into the `daprd` binary.

WASM modules are loaded from a filesystem path. On Kubernetes, see [mounting volumes to the Dapr sidecar]({{> kubernetes-volume-mounts.md >}}) to configure a filesystem mount that can contain WASM modules.

## Component format


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
| path | A relative or absolute path to the WASM module | "./hello.wasm" |
| runtime | The WASM runtime of your WASM binary. Only `wazero` is supported | ["wazero"](https://github.com/tetratelabs/wazero) |


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
