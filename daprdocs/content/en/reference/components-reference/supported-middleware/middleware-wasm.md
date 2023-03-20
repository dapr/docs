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

The Wasm [HTTP middleware]({{< ref middleware.md >}}) allows you to manipulate
an incoming request or serve a response with custom logic compiled to a Wasm
binary. In other words, you can extend Dapr using external files that are not
pre-compiled into the `daprd` binary. Dapr embeds [wazero](https://wazero.io)
to accomplish this without CGO.

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
  type: middleware.http.wasm
  version: v1
  metadata:
  - name: path
    value: "./router.wasm"
```

## Spec metadata fields

Minimally, a user must specify a Wasm binary implements the [http-handler](https://http-wasm.io/http-handler/).
How to compile this is described later.

| Field    | Details                                                        | Required | Example        |
|----------|----------------------------------------------------------------|----------|----------------|
| path     | A relative or absolute path to the Wasm binary to instantiate. | true     | "./hello.wasm" |

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
      type: middleware.http.wasm
```

*Note*: WebAssembly middleware uses more resources than native middleware. This
result in a resource constraint faster than the same logic in native code.
Production usage should [Control max concurrency]({{< ref control-concurrency.md >}}).

### Generating Wasm

This component lets you manipulate an incoming request or serve a response with
custom logic compiled using the [http-handler](https://http-wasm.io/http-handler/)
Application Binary Interface (ABI). The `handle_request` function receives an
incoming request and can manipulate it or serve a response as necessary.

To compile your Wasm, you must compile source using a http-handler compliant
guest SDK such as [TinyGo](https://github.com/http-wasm/http-wasm-guest-tinygo).

Here's an example in TinyGo:

```go
package main

import (
	"strings"

	"github.com/http-wasm/http-wasm-guest-tinygo/handler"
	"github.com/http-wasm/http-wasm-guest-tinygo/handler/api"
)

func main() {
	handler.HandleRequestFn = handleRequest
}

// handleRequest implements a simple HTTP router.
func handleRequest(req api.Request, resp api.Response) (next bool, reqCtx uint32) {
	// If the URI starts with /host, trim it and dispatch to the next handler.
	if uri := req.GetURI(); strings.HasPrefix(uri, "/host") {
		req.SetURI(uri[5:])
		next = true // proceed to the next handler on the host.
		return
	}

	// Serve a static response
	resp.Headers().Set("Content-Type", "text/plain")
	resp.Body().WriteString("hello")
	return // skip the next handler, as we wrote a response.
}
```

If using TinyGo, compile as shown below and set the spec metadata field named
"path" to the location of the output (ex "router.wasm"):

```bash
tinygo build -o router.wasm -scheduler=none --no-debug -target=wasi router.go`
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
- [Control max concurrency]({{< ref control-concurrency.md >}})
