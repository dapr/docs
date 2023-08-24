---
type: docs
title: "Wasm"
linkTitle: "Wasm"
description: "Use Wasm middleware in your HTTP pipeline"
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

Wasm binaries are loaded from a URL. For example, the URL `file://rewrite.wasm`
loads `rewrite.wasm` from the current directory of the process. On Kubernetes,
see [How to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})
to configure a filesystem mount that can contain Wasm modules.
It is also possible to fetch the Wasm binary from a remote URL. In this case,
the URL must point exactly to one Wasm binary. For example:
- `http://example.com/rewrite.wasm`, or 
- `https://example.com/rewrite.wasm`. 

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
  - name: url
    value: "file://router.wasm"
  - guestConfig
    value: {"environment":"production"}
```

## Spec metadata fields

Minimally, a user must specify a Wasm binary implements the [http-handler](https://http-wasm.io/http-handler/).
How to compile this is described later.

| Field | Details                                                        | Required | Example        |
|-------|----------------------------------------------------------------|----------|----------------|
| url   | The URL of the resource including the Wasm binary to instantiate. The supported schemes include `file://`, `http://`, and `https://`. The path of a `file://` URL is relative to the Dapr process unless it begins with `/`. | true     | `file://hello.wasm`, `https://example.com/hello.wasm` |
| guestConfig   | An optional configuration passed to Wasm guests. Users can pass an arbitrary string to be parsed by the guest code. | false     | `enviroment=production`,`{"environment":"production"}` |

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
"url" to the location of the output (for example, `file://router.wasm`):

```bash
tinygo build -o router.wasm -scheduler=none --no-debug -target=wasi router.go`
```

### Wasm `guestConfig` example

Here is an example of how to use `guestConfig` to pass configurations to Wasm. In Wasm code, you can use the function `handler.Host.GetConfig` defined in guest SDK to get the configuration. In the following example, the Wasm middleware parses the executed `environment` from JSON config defined in the component.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: middleware.http.wasm
  version: v1
  metadata:
  - name: url
    value: "file://router.wasm"
  - guestConfig
    value: {"environment":"production"}
```
Here's an example in TinyGo:

```go
package main

import (
	"encoding/json"
	"github.com/http-wasm/http-wasm-guest-tinygo/handler"
	"github.com/http-wasm/http-wasm-guest-tinygo/handler/api"
)

type Config struct {
	Environment string `json:"environment"`
}

func main() {
	// get config bytes, which is the value of guestConfig defined in the component.
	configBytes := handler.Host.GetConfig()
	
	config := Config{}
	json.Unmarshal(configBytes, &config)
	handler.Host.Log(api.LogLevelInfo, "Config environment: "+config.Environment)
}
```


## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
- [Control max concurrency]({{< ref control-concurrency.md >}})
