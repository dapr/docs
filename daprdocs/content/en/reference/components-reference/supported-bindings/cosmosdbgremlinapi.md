---
type: docs
title: "Azure CosmosDBGremlinAPI binding spec"
linkTitle: "Azure CosmosDBGremlinAPI"
description: "Detailed documentation on the Azure CosmosDBGremlinAPI binding component"
---

## Component format

To setup Azure CosmosDBGremlinAPI binding create a component of type `bindings.azure.cosmosdb.gremlinapi`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb.gremlinapi
  version: v1
  metadata:
  - name: url
    value: wss://******.gremlin.cosmos.azure.com:443/
  - name: masterKey
    value: *****
  - name: username
    value: *****
  ```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| url | Y | Output | The CosmosDBGremlinAPI url | `"wss://******.gremlin.cosmos.azure.com:443/"` |
| masterKey | Y | Output | The CosmosDBGremlinAPI account master key | `"masterKey"` |
| database | Y | Output | The username of the CosmosDBGremlinAPI database | `"username"` |

For more information see [Quickstart: Azure Cosmos Graph DB using Gremlin ](https://docs.microsoft.com/azure/cosmos-db/graph/create-graph-console).

## Binding support

This component supports **output binding** with the following operations:

- `query`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
