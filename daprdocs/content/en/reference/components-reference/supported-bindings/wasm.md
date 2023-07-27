---
type: docs
title: "Wasm"
linkTitle: "Wasm"
description: "Detailed documentation on the WebAssembly binding component"
aliases:
- "/operations/components/setup-bindings/supported-bindings/wasm/"
---

## Overview

With WebAssembly, you can safely run code compiled in other languages. Runtimes
execute WebAssembly Modules (Wasm), which are most often binaries with a `.wasm`
extension.

The Wasm Binding allows you to invoke a program compiled to Wasm by passing
commandline args or environment variables to it, similar to how you would with
a normal subprocess. For example, you can satisfy an invocation using Python,
even though Dapr is written in Go and is running on a platform that doesn't have
Python installed!

The Wasm binary must be a program compiled with the WebAssembly System
Interface (WASI). The binary can be a program you've written such as in Go, or
an interpreter you use to run inlined scripts, such as Python.

Minimally, you must specify a Wasm binary compiled with the canonical WASI
version `wasi_snapshot_preview1` (a.k.a. `wasip1`), often abbreviated to `wasi`.

> **Note:** If compiling in Go 1.21+, this is `GOOS=wasip1 GOARCH=wasm`. In TinyGo, Rust, and Zig, this is the target `wasm32-wasi`.

You can also re-use an existing binary. For example, [Wasm Language Runtimes](https://github.com/vmware-labs/webassembly-language-runtimes)
distributes interpreters (including PHP, Python, and Ruby) already compiled to
WASI.

Wasm binaries are loaded from a URL. For example, the URL `file://rewrite.wasm`
loads `rewrite.wasm` from the current directory of the process. On Kubernetes,
see [How to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})
to configure a filesystem mount that can contain Wasm binaries.

Dapr uses [wazero](https://wazero.io) to run these binaries, because it has no
dependencies. This allows use of WebAssembly with no installation process
except Dapr itself.

## Component format

To configure a Wasm binding, create a component of type
`bindings.wasm`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}})
on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: bindings.wasm
  version: v1
  metadata:
  - name: url
    value: "file://uppercase.wasm"
  - name: direction 
    value: output
```

## Spec metadata fields

| Field | Details                                                        | Required | Example        |
|-------|----------------------------------------------------------------|----------|----------------|
| `url`   | The URL of the resource including the Wasm binary to instantiate. The supported schemes include `file://`. The path of a `file://` URL is relative to the Dapr process unless it begins with `/`. | true     | `file://hello.wasm` |
| `direction`   | The direction of the binding | false     | `output` |

## Binding support

This component supports **output binding** with the following operations:

- `execute`

## Example request

The `data` field, if present will be the program's STDIN. You can optionally
pass metadata properties with each request:

- `args` any CLI arguments, comma-separated. This excludes the program name.

For example, if the binding `url` was a Ruby interpreter, such as from
[webassembly-language-runtimes](https://github.com/vmware-labs/webassembly-language-runtimes/releases/tag/ruby%2F3.2.0%2B20230215-1349da9),
the following request would respond back with "Hello, salaboy":

```json
{
  "operation": "execute",
  "metadata": {
    "args": "-ne,'print \"Hello, \"; print'"
  },
  "data": "salaboy"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
