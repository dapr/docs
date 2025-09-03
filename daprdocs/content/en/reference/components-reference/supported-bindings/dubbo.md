---
type: docs
title: "Apache Dubbo binding spec"
linkTitle: "Dubbo"
description: "Detailed documentation on the Apache Dubbo binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/dubbo/"
---

## Component format

To set up an Apache Dubbo binding, create a component of type `bindings.dubbo`.
See [this guide]({{% ref "howto-bindings.md#1-create-a-binding" %}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.dubbo
  version: v1
  metadata:
    - name: interfaceName
      value: "com.example.UserService"
    - name: methodName
      value: "getUser"
    # Optional
    - name: version
      value: "1.0.0"
    - name: group
      value: "mygroup"
    - name: providerHostname
      value: "localhost"
    - name: providerPort
      value: "8080"
````

{{% alert title="Note" color="info" %}}
The Dubbo binding does not require authentication or secret configuration by default.
However, if your Dubbo deployment requires secure communication, you can integrate Dapr's [secret store]({{% ref component-secrets.md %}}) for sensitive values.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details                                   | Example                     |
| ------------------ | :------: | --------------- | ----------------------------------------- | --------------------------- |
| `interfaceName`    |     Y    | Output          | The Dubbo interface name to invoke.       | `"com.example.UserService"` |
| `methodName`       |     Y    | Output          | The method name to call on the interface. | `"getUser"`                 |
| `version`          |     N    | Output          | Version of the Dubbo service.             | `"1.0.0"`                   |
| `group`            |     N    | Output          | Group name for the Dubbo service.         | `"mygroup"`                 |
| `providerHostname` |     N    | Output          | Hostname of the Dubbo provider.           | `"localhost"`               |
| `providerPort`     |     N    | Output          | Port of the Dubbo provider.               | `"8080"`                    |

---

## Binding support

This component supports **output binding** with the following operation:

* `create`: invokes a Dubbo service method.

---

## Example: Invoke a Dubbo Service

To invoke a Dubbo service using the binding:

```json
{
  "operation": "create",
  "metadata": {
    "interfaceName": "com.example.UserService",
    "methodName": "getUser",
    "version": "1.0.0",
    "providerHostname": "localhost",
    "providerPort": "8080"
  },
  "data": {
    "userId": "12345"
  }
}
```

The `data` field contains the request payload sent to the Dubbo service method.

---

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Bindings building block]({{% ref bindings %}})
- [How-To: Trigger application with input binding]({{% ref howto-triggers.md %}})
- [How-To: Use bindings to interface with external resources]({{% ref howto-bindings.md %}})
- [Bindings API reference]({{% ref bindings_api.md %}})
