---
type: docs
title: "Dubbo output binding spec"
linkTitle: "Dubbo"
description: "Detailed documentation on the Dubbo output binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/dubbo/"
---

## Component format

To setup a Dubbo binding create a component of type `bindings.dubbo`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://dubbo.apache.org/docs/) for the documentation for Dubbo.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: dubbo-binding
  namespace: default
spec:
  type: bindings.dubbo
  version: v1
  metadata:
  - name: group
    value: ""
  - name: version
    value: ""
  - name: interfaceName
    value: ""
  - name: methodName
    value: ""
  - name: providerHostname
    value: ""
  - name: providerPort
    value: ""
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| `group` | N | Output |  | `""` |
| `version` | N | Output |  | `""` |
| `interfaceName` | N | Input |  | `""` |
| `methodName` | N | Input |  | `""` |
| `providerHostname` | N | Input |  | `""` |
| `providerPort` | N | Output |  | `""` |

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
