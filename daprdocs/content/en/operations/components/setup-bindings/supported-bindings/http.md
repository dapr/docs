---
type: docs
title: "HTTP binding spec"
linkTitle: "HTTP"
description: "Detailed documentation on the HTTP binding component"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.http
  metadata:
  - name: url
    value: http://something.com
  - name: method
    value: GET
```

- `url` is the HTTP url to invoke.
- `method` is the HTTP verb to use for the request.

## Output Binding Supported Operations

* create

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})