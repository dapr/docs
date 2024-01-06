---
type: docs
title: "Azure Cosmos DB (SQL API)"
linkTitle: "Azure Cosmos DB (SQL API)"
description: Detailed information on the Azure Cosmos DB (SQL API) state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-azure-cosmosdb/"
---

## Component format

To setup Azure Cosmos DB state store create a component of type `state.azure.cosmosdb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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

If you wish to use Cosmos DB as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url                | Y        | The Cosmos DB url | `"https://******.documents.azure.com:443/"`.
| masterKey          | Y*        | The key to authenticate to the Cosmos DB account. Only required when not using Microsoft Entra ID authentication. | `"key"`
| database           | Y        | The name of the database  | `"db"`
| collection         | Y        | The name of the collection (container) | `"collection"`
| actorStateStore    | N         | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

### Microsoft Entra ID authentication

The Azure Cosmos DB state store component supports authentication using all Microsoft Entra ID mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of Microsoft Entra ID authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

You can read additional information for setting up Cosmos DB with Azure AD authentication in the [section below](#setting-up-cosmos-db-for-authenticating-with-azure-ad).

## Setup Azure Cosmos DB

[Follow the instructions](https://docs.microsoft.com/azure/cosmos-db/how-to-manage-database-account) from the Azure documentation on how to create an Azure Cosmos DB account.  The database and collection must be created in Cosmos DB before Dapr can use it.

**Important: The partition key for the collection must be named `/partitionKey` (note: this is case-sensitive).**

In order to setup Cosmos DB as a state store, you need the following properties:

- **URL**: the Cosmos DB url. for example: `https://******.documents.azure.com:443/`
- **Master Key**: The key to authenticate to the Cosmos DB account. Skip this if using Microsoft Entra ID authentication.
- **Database**: The name of the database
- **Collection**: The name of the collection (or container)

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to override the default TTL on the CosmodDB container, indicating when the data should be considered "expired". Note that this value _only_ takes effect if the container's `DefaultTimeToLive` field has a non-NULL value. See the [CosmosDB documentation](https://docs.microsoft.com/azure/cosmos-db/nosql/time-to-live) for more information.

## Best Practices for Production Use

Azure Cosmos DB shares a strict metadata request rate limit across all databases in a single Azure Cosmos DB account. New connections to Azure Cosmos DB assume a large percentage of the allowable request rate limit. (See the [Cosmos DB documentation](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3))

Therefore several strategies must be applied to avoid simultaneous new connections to Azure Cosmos DB:

- Ensure sidecars of applications only load the Azure Cosmos DB component when they require it to avoid unnecessary database connections. This can be done by [scoping your components to specific applications]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes).
- Choose deployment strategies that sequentially deploy or start your applications to minimize bursts in new connections to your Azure Cosmos DB accounts.
- Avoid reusing the same Azure Cosmos DB account for unrelated databases or systems (even outside of Dapr). Distinct Azure Cosmos DB accounts have distinct rate limits.
- Increase the `initTimeout` value to allow the component to retry connecting to Azure Cosmos DB during side car initialization for up to 5 minutes. The default value is `5s` and should be increased. When using Kubernetes, increasing this value may also require an update to your [Readiness and Liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

```yaml
spec:
  type: state.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## Data format

To use the Cosmos DB state store, your data must be sent to Dapr in JSON-serialized format. Having it just JSON *serializable* will not work.

If you are using the Dapr SDKs (for example the [.NET SDK](https://github.com/dapr/dotnet-sdk)), the SDK automatically serializes your data to JSON.

If you want to invoke Dapr's HTTP endpoint directly, take a look at the examples (using curl) in the [Partition keys](#partition-keys) section below.

## Partition keys

For **non-actor state** operations, the Azure Cosmos DB state store will use the `key` property provided in the requests to the Dapr API to determine the Cosmos DB partition key. This can be overridden by specifying a metadata field in the request with a key of `partitionKey` and a value of the desired partition.

The following operation uses `nihilus` as the partition key value sent to Cosmos DB:

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

For **non-actor** state operations, if you want to control the Cosmos DB partition, you can specify it in metadata.  Reusing the example above, here's how to put it under the `mypartition` partition

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

For **actor** state operations, the partition key is generated by Dapr using the `appId`, the actor type, and the actor id, such that data for the same actor always ends up under the same partition (you do not need to specify it). This is because actor state operations must use transactions, and in Cosmos DB the items in a transaction must be on the same partition.

## Setting up Cosmos DB for authenticating with Microsoft Entra ID

When using the Dapr Cosmos DB state store and authenticating with Microsoft Entra ID, you need to perform a few additional steps to set up your environment.

Prerequisites:

- You need a Service Principal created as per the instructions in the [authenticating to Azure]({{< ref authenticating-azure.md >}}) page. You need the ID of the Service Principal for the commands below (note that this is different from the client ID of your application, or the value you use for `azureClientId` in the metadata).
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- The scripts below are optimized for a bash or zsh shell

### Granting your Microsoft Entra ID application access to Cosmos DB

> You can find more information on the [official documentation](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac), including instructions to assign more granular permissions.

In order to grant your application permissions to access data stored in Cosmos DB, you need to assign it a custom role for the Cosmos DB data plane. In this example you're going to use a built-in role, "Cosmos DB Built-in Data Contributor", which grants your application full read-write access to the data; you can optionally create custom, fine-tuned roles following the instructions in the official docs.

```sh
# Name of the Resource Group that contains your Cosmos DB
RESOURCE_GROUP="..."
# Name of your Cosmos DB account
ACCOUNT_NAME="..."
# ID of your Service Principal object
PRINCIPAL_ID="..."
# ID of the "Cosmos DB Built-in Data Contributor" role
# You can also use the ID of a custom role
ROLE_ID="00000000-0000-0000-0000-000000000002"

az cosmosdb sql role assignment create \
  --account-name "$ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --scope "/" \
  --principal-id "$PRINCIPAL_ID" \
  --role-definition-id "$ROLE_ID"
```

## Optimizing Cosmos DB for bulk operation write performance

If you are building a system that only ever reads data from Cosmos DB via key (`id`), which is the default Dapr behavior when using the state management API or actors, there are ways you can optimize Cosmos DB for improved write speeds. This is done by excluding all paths from indexing. By default, Cosmos DB indexes all fields inside of a document. On systems that are write-heavy and run little-to-no queries on values within a document, this indexing policy slows down the time it takes to write or update a document in Cosmos DB. This is exacerbated in high-volume systems.

For example, the default Terraform definition for a Cosmos SQL container indexing reads as follows:

```tf
indexing_policy {
  indexing_mode = "consistent"

  included_path {
    path = "/*"
  }
}
```

It is possible to force Cosmos DB to only index the `id` and `partitionKey` fields by excluding all other fields from indexing. This can be done by updating the above to read as follows:

```tf
indexing_policy {
  # This could also be set to "none" if you are using the container purely as a key-value store. This may be applicable if your container is only going to be used as a distributed cache.
  indexing_mode = "consistent" 

  # Note that included_path has been replaced with excluded_path
  excluded_path {
    path = "/*"
  }
}
```

{{% alert title="Note" color="primary" %}}

This optimization comes at the cost of queries against fields inside of documents within the state store. This would likely impact any stored procedures or SQL queries defined and executed. It is only recommended that this optimization be applied only if you are using the Dapr State Management API or Dapr Actors to interact with Cosmos DB.

{{% /alert %}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
