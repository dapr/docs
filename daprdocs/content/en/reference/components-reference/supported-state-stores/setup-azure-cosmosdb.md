---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
description: Detailed information on the Azure CosmosDB state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-azure-cosmosdb/"
---

## Component format

To setup Azure CosmosDb state store create a component of type `state.azure.cosmosdb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: <REPLACE-WITH-URL>
  - name: masterKey
    value: <REPLACE-WITH-MASTER-KEY>
  - name: database
    value: <REPLACE-WITH-DATABASE>
  - name: collection
    value: <REPLACE-WITH-COLLECTION>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

If you wish to use CosmosDb as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url                | Y        | The CosmosDB url | `"https://******.documents.azure.com:443/"`.
| masterKey          | Y        | The key to authenticate to the CosmosDB account | `"key"`
| database           | Y        | The name of the database  | `"db"`
| collection         | Y        | The name of the collection | `"collection"`
| actorStateStore    | N         | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

## Setup Azure Cosmos DB

[Follow the instructions](https://docs.microsoft.com/azure/cosmos-db/how-to-manage-database-account) from the Azure documentation on how to create an Azure CosmosDB account.  The database and collection must be created in CosmosDB before Dapr can use it.

**Note : The partition key for the collection must be named "/partitionKey".  Note: this is case-sensitive.**

In order to setup CosmosDB as a state store, you need the following properties:
- **URL**: the CosmosDB url. for example: https://******.documents.azure.com:443/
- **Master Key**: The key to authenticate to the CosmosDB account
- **Database**: The name of the database
- **Collection**: The name of the collection

## Best Practices for Production Use

Azure Cosmos DB shares a strict metadata request rate limit across all databases in a single Azure Cosmos DB account. New connections to Azure Cosmos DB assume a large percentage of the allowable request rate limit. (See the [CosmosDB documentation](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3))

Therefore several strategies must be applied to avoid simultaneous new connections to Azure Cosmos DB:

- Ensure sidecars of applications only load the Azure Cosmos DB component when they require it to avoid unnecessary database connections. This can be done by [scoping your components to specific applications]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes).
- Choose deployment strategies that sequentially deploy or start your applications to minimize bursts in new connections to your Azure Cosmos DB accounts.
- Avoid reusing the same Azure Cosmos DB account for unrelated databases or systems (even outside of Dapr). Distinct Azure Cosmos DB accounts have distinct rate limits.
- Increase the `initTimeout` value to allow the component to retry connecting to Azure Cosmos DB during side car initialization for up to 5 minutes. The default value is `5s` and should be increased. When using Kubernetes, increasing this value may also require an update to your [Readiness and Liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

```yaml
spec:
  type: state.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## Data format

To use the CosmosDB state store, your data must be sent to Dapr in JSON-serialized.  Having it just JSON *serializable* will not work.

If you are using the Dapr SDKs (e.g. https://github.com/dapr/dotnet-sdk) the SDK will serialize your data to json.

For examples see the curl operations in the [Partition keys](#partition-keys) section.

## Partition keys

For **non-actor state** operations, the Azure Cosmos DB state store will use the `key` property provided in the requests to the Dapr API to determine the Cosmos DB partition key.  This can be overridden by specifying a metadata field in the request with a key of `partitionKey` and a value of the desired partition.

The following operation will use `nihilus` as the partition key value sent to CosmosDB:

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

For **non-actor** state operations, if you want to control the CosmosDB partition, you can specify it in metadata.  Reusing the example above, here's how to put it under the `mypartition` partition

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth",
          "metadata": {
            "partitionKey": "mypartition"
          }
        }
      ]'
```


For **actor** state operations, the partition key is generated by Dapr using the `appId`, the actor type, and the actor id, such that data for the same actor always ends up under the same partition (you do not need to specify it).  This is because actor state operations must use transactions, and in CosmosDB the items in a transaction must be on the same partition.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
