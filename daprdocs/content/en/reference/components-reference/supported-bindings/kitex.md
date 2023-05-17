---
type: docs
title: "Kitex"
linkTitle: "Kitex"
description: "Detailed documentation on the Kitex binding component"
aliases:
- "/operations/components/setup-bindings/supported-bindings/kitex/"
---

## Overview

The binding for Kitex mainly utilizes the generic-call feature in Kitex. Learn more from the official documentation around [Kitex generic-call](https://www.cloudwego.io/docs/kitex/tutorials/advanced-feature/generic-call/).
Currently, Kitex only supports Thrift generic calls. The implementation integrated into [components-contrib](https://github.com/dapr/components-contrib/tree/master/bindings/kitex) adopts binary generic calls.


## Component format

To setup an Kitex binding, create a component of type `bindings.kitex`. See the [How-to: Use output bindings to interface with external resources]({{< ref "howto-bindings.md#1-create-a-binding" >}}) guide on creating and applying a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bindings.kitex
spec:
  type: bindings.kitex
  version: v1
  metadata: 
```

## Spec metadata fields

The `InvokeRequest.Metadata` for `bindings.kitex` requires the client to fill in four required items when making a call: 
- `hostPorts`
- `destService`
- `methodName`
- `version` 

| Field       | Required | Binding support | Details                                                                                                 | Example            |
|-------------|:--------:|--------|---------------------------------------------------------------------------------------------------------|--------------------|
| hostPorts   |    Y     | Output | IP address and port information of the Kitex server (Thrift)                                        | `"127.0.0.1:8888"` |
| destService |    Y     | Output | Service name of the Kitex server (Thrift)            | `"echo"`           |
| methodName  |    Y     | Output | Method name under a specific service name of the Kitex server (Thrift) | `"echo"`           |
| version     |    Y     | Output | kitex version                                                                                           | `"0.5.0"`          |


## Binding support

This component supports **output binding** with the following operations:

- `get`

## Example 

When using kitex binding, the client needs to pass in the correct Thrift-encoded binary, and the server needs to be a Thrift Server. The [kitex_output_test](https://github.com/dapr/components-contrib/blob/master/bindings/kitex/kitex_output_test.go) can be used as a reference.
For example, the variable `reqData` needs to be encoded by the Thrift protocol before sending, and the returned data needs to be decoded by the Thrift protocol.

**Request**

```json
{
  "operation": "get",
  "metadata": {
    "hostPorts": "127.0.0.1:8888",
    "destService": "echo",
    "methodName": "echo",
    "version":"0.5.0"
  },
  "data": reqdata
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
