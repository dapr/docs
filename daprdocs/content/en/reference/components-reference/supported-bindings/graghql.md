---
type: docs
title: "GraphQL binding spec"
linkTitle: "GraphQL"
description: "Detailed documentation on the GraphQL binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/graphql/"
---

## Component format

To setup GraphQL binding create a component of type `bindings.graphql`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To separate normal config settings (e.g. endpoint) from headers, "header:" is used a prefix on the header names.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: example.bindings.graphql
spec:
  type: bindings.graphql
  version: v1
  metadata:
    - name: endpoint
      value:  http://localhost:8080/v1/graphql
    - name: header:x-hasura-access-key
      value: adminkey
    - name: header:Cache-Control
      value: no-cache
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| endpoint | Y | Output | GraphQL endpoint string See [here](#url-format) for more details | `"http://localhost:4000/graphql/graphql"` |
| header:[HEADERKEY] | N | Output | GraphQL header. Specify the header key in the `name`, and the header value in the `value`. | `"no-cache"` (see above) |

### Endpoint and Header format

The GraphQL binding uses [GraphQL client](https://github.com/machinebox/graphql) internally.

## Binding support

This component supports **output binding** with the following operations:

- `query`
- `mutation`

### query

The `query` operation is used for `query` statements, which returns the metadata along with data in a form of an array of row values.

**Request**

```golang
in := &dapr.InvokeBindingRequest{
Name:      "example.bindings.graphql",
Operation: "query",
Metadata: map[string]string{ "query": `query { users { name } }`},
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
