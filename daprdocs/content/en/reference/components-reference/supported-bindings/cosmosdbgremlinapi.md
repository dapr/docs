---
type: docs
title: "Azure Cosmos DB (Gremlin API) binding spec"
linkTitle: "Azure Cosmos DB (Gremlin API)"
description: "Detailed documentation on the Azure Cosmos DB (Gremlin API) binding component"
---

## Component format

To setup an Azure Cosmos DB (Gremlin API) binding create a component of type `bindings.azure.cosmosdb.gremlinapi`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.cosmosdb.gremlinapi
  version: v1
  metadata:
  - name: url
    value: "wss://******.gremlin.cosmos.azure.com:443/"
  - name: masterKey
    value: "*****"
  - name: username
    value: "*****"
  - name: direction
    value: "output"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| `url` | Y | Output | The Cosmos DB url for Gremlin APIs | `"wss://******.gremlin.cosmos.azure.com:443/"` |
| `masterKey` | Y | Output | The Cosmos DB account master key | `"masterKey"` |
| `username` | Y | Output | The username of the Cosmos DB database | `"/dbs/<database_name>/colls/<graph_name>"` |
| `direction` | N | Output | The direction of the binding | `"output"` |

For more information see [Quickstart: Azure Cosmos Graph DB using Gremlin](https://docs.microsoft.com/azure/cosmos-db/graph/create-graph-console).

## Binding support

This component supports **output binding** with the following operations:

- `query`

## Request payload sample

```json
{
  "data": {
    "gremlin": "g.V().count()"
    },
  "operation": "query"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
