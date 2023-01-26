---
type: docs
title: "WASM"
linkTitle: "WASM"
description: "Use WASM middleware in your HTTP pipeline"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-wasm/
---

WebAssembly is a way to safely run code compiled in other languages. Runtimes
execute WebAssembly Modules (Wasm), which are most often binaries with a `.wasm`
extension.

The Wasm [HTTP middleware]({{< ref middleware.md >}}) allows you to rewrite a
request URI with custom logic compiled to a Wasm binary. In other words, you
can extend Dapr using external files that are not pre-compiled into the `daprd`
binary. Dapr embeds [wazero](https://wazero.io) to accomplish this without CGO.

Wasm modules are loaded from a filesystem path. On Kubernetes, see [mounting
volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}}) to configure
a filesystem mount that can contain Wasm modules.

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
  - name: poolSize
    value: 1
```

## Spec metadata fields

Minimally, a user must specify a Wasm binary that contains the custom logic
used to rewrite requests. An instance of the Wasm binary is not safe to use
concurrently. The below configuration fields control both the binary to
instantiate and how large an instance pool to use. A larger pool allows higher
concurrency while consuming more memory.

| Field    | Details                                                        | Required | Example        |
|----------|----------------------------------------------------------------|----------|----------------|
| path     | A relative or absolute path to the Wasm binary to instantiate. | true     | "./hello.wasm" |
| poolSize | Number of concurrent instances of the Wasm binary. Default: 10 | false    | 1              |

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}).
See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

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

### Generating Wasm

This component allows you to rewrite a request URI with custom logic compiled
to a Wasm using the waPC protocol. The `rewrite` function receives the request
URI and returns an update as necessary.

To compile your Wasm, you must compile source using a waPC guest SDK such as
[TinyGo](https://github.com/wapc/wapc-guest-tinygo).

Here's an example in TinyGo:

```go
package main

import "github.com/wapc/wapc-guest-tinygo"

func main() {
	wapc.RegisterFunctions(wapc.Functions{"rewrite": rewrite})
}

// rewrite returns a new URI if necessary.
func rewrite(requestURI []byte) ([]byte, error) {
	if string(requestURI) == "/v1.0/hi" {
		return []byte("/v1.0/hello"), nil
	}
	return requestURI, nil
}
```

If using TinyGo, compile as shown below and set the spec metadata field named
"path" to the location of the output (ex "example.wasm"):

```bash
tinygo build -o example.wasm -scheduler=none --no-debug -target=wasi example.go
```

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
- [waPC protocol](https://wapc.io/docs/spec/)
