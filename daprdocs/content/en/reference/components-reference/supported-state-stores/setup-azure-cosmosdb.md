---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
description: Detailed information on the Azure Cosmos DB state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-azure-cosmosdb/"
---

## Component format

To setup Azure Cosmos DB state store create a component of type `state.azure.cosmosdb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

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

If you wish to use Cosmos DB as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| url                | Y        | The Cosmos DB url | `"https://******.documents.azure.com:443/"`.
| masterKey          | Y        | The key to authenticate to the Cosmos DB account | `"key"`
| database           | Y        | The name of the database  | `"db"`
| collection         | Y        | The name of the collection | `"collection"`
| actorStateStore    | N        | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

## Setup Azure Cosmos DB

[Follow the instructions](https://docs.microsoft.com/en-us/azure/cosmos-db/how-to-manage-database-account) from the Azure documentation on how to create an Azure Cosmos DB account. The database and collection must be created in Cosmos DB before Dapr can use it.

{{% alert title="Note" color="info" %}}
By default, the partition key for the Cosmos DB collection must be defined as `/partitionKey` (case-sensitive).
{{% /alert %}}

In order to setup Cosmos DB as a state store, you need the following properties:

- **URL**: The Cosmos DB URL. For example: https://******.documents.azure.com:443/
- **Master Key**: The key to authenticate to the Cosmos DB account
- **Database**: The name of the database
- **Collection**: The name of the collection

## Data format

To use the Cosmos DB state store, your data must be sent to Dapr in JSON-serialized format. Just using JSON *serializable* data will not work.

If you are using the Dapr SDKs (e.g. https://github.com/dapr/dotnet-sdk) the SDK will serialize your data to JSON.

For examples, see the curl operations in the [Partition keys](#partition-keys) section.

## Partition keys

### For non-actor state operations

Using the recommended `/partitionKey` value as the Cosmos DB collection's partition key, the Azure Cosmos DB state store can use the `key` property provided in the requests to the Dapr API to determine the Cosmos DB partition key.

The following operation will use `<app_id>||nihilus` as the partition key value sent to Cosmos DB:

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json" \
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

Refer to the [custom key schemes]({{< ref "state_api.md#custom-key-schemes" >}}) section of the Dapr state management API document for how to configure the state store key scheme.

You can also control the partition key value directly by specifying the `partitionKey` metadata property in the request. Reusing the previous example, where the Cosmos DB collection partition key is `/partitionKey`, the following operation will associate the partition key value `mypartition` with the value instead of `<app_id>||nihilus`.

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json" \
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

If you are using a Cosmos DB collection defined with a custom partition key, the  `partitionKey` metadata field **must** be specified on every request. For example, for a Cosmos DB collection defined with the custom partition key `/value/address/zipcode`, the `partitionKey` metadata property have a value matching the actual partition key value in the body of the request:

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json" \
  -d '[
        {
          "key": "nihilus",
          "value": {
            "address": {
              "street": "Tatooine Drive",
              "zipcode": "90210"
            }
          },
          "metadata": {
            "partitionKey": "90210"
          }
        }
      ]'
```

### For actor state operations

You do not need to specify the partition key when using actor state operations. The partition key is generated by Dapr using the `appId`, the actor type, and the actor ID, such that data for the same actor always ends up under the same partition. This is because actor state operations must use transactions, and in Cosmos DB the items in a transaction must be on the same partition.

Actor state operations do not support Cosmos DB collections defined with custom partition keys. The collection must be defined with partition key as `/partitionKey` for use with actor state operations.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
