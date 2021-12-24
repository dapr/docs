---
type: docs
title: "Azure CosmosDB binding spec"
linkTitle: "Azure CosmosDB"
description: "Detailed documentation on the Azure CosmosDB binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/cosmosdb/"
---

## Component format

To setup Azure CosmosDB binding create a component of type `bindings.azure.cosmosdb`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: https://******.documents.azure.com:443/
  - name: masterKey
    value: *****
  - name: database
    value: db
  - name: collection
    value: collection
  - name: partitionKey
    value: message
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| url | Y | Output | The CosmosDB url | `"https://******.documents.azure.com:443/"` |
| masterKey | Y | Output | The CosmosDB account master key | `"master-key"` |
| database | Y | Output | The name of the CosmosDB database | `"OrderDb"` |
| collection | Y | Output | The name of the container inside the database.  | `"Orders"` |
| partitionKey | Y | Output | The name of the key to extract from the payload (document to be created) that is used as the partition key. This name must match the partition key specified upon creation of the Cosmos DB container. | `"OrderId"`, `"message"` |

For more information see [Azure Cosmos DB resource model](https://docs.microsoft.com/azure/cosmos-db/account-databases-containers-items).

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Best Practices for Production Use

Azure Cosmos DB shares a strict metadata request rate limit across all databases in a single Azure Cosmos DB account. New connections to Azure Cosmos DB assume a large percentage of the allowable request rate limit. (See the [CosmosDB documentation](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3))

Therefore several strategies must be applied to avoid simultaneous new connections to Azure Cosmos DB:

- Ensure sidecars of applications only load the Azure Cosmos DB component when they require it to avoid unnecessary database connections. This can be done by [scoping your components to specific applications]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes).
- Choose deployment strategies that sequentially deploy or start your applications to minimize bursts in new connections to your Azure Cosmos DB accounts.
- Avoid reusing the same Azure Cosmos DB account for unrelated databases or systems (even outside of Dapr). Distinct Azure Cosmos DB accounts have distinct rate limits.
- Increase the `initTimeout` value to allow the component to retry connecting to Azure Cosmos DB during side car initialization for up to 5 minutes. The default value is `5s` and should be increased. When using Kubernetes, increasing this value may also require an update to your [Readiness and Liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

```yaml
spec:
  type: bindings.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## Data format

The **output binding** `create` operation requires the following keys to exist in the payload of every document to be created:
- `id`: a unique ID for the document to be created
- `<partitionKey>`: the name of the partition key specified via the `spec.partitionKey` in the component definition. This must also match the partition key specified upon creation of the Cosmos DB container.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
