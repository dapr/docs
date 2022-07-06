---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
weight: 1000
description: "Use Azure Cosmos DB as a state store"
---

Dapr doesn't transform state values while saving and retrieving states. Dapr requires all state store implementations to abide by a certain key format scheme (see [the state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such as:

- Querying states.
- Creating aggregated views.
- Making backups.

{{% alert title="Note" color="primary" %}}
Azure Cosmos DB is a multi-modal database that supports multiple APIs. The default Dapr Cosmos DB state store implementation uses the [Azure Cosmos DB SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started).

{{% /alert %}}

## Connect to Azure Cosmos DB

To connect to your Cosmos DB instance, you can either:

- Use the Data Explorer on [Azure Management Portal](https://portal.azure.com). 
- Use [various SDKs and tools](https://docs.microsoft.com/azure/cosmos-db/mongodb-introduction).

{{% alert title="Note" color="primary" %}}
When you configure an Azure Cosmos DB for Dapr, specify the exact database and collection to use. The following Cosmos DB [SQL API](https://docs.microsoft.com/azure/cosmos-db/sql-query-getting-started) samples assume you've already connected to the right database and a collection named "states".

{{% /alert %}}

## List keys by App ID

To get all state keys associated with application "myapp", use the query:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

The above query returns all documents with an id containing "myapp-", which is the prefix of the state keys.

## Get specific state data

To get the state data by a key "balance" for the application "myapp", use the query:

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

Read the **value** field of the returned document. To get the state version/ETag, use the command:

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## Read actor state

To get all the state keys associated with an actor with the instance ID "leroy" of actor type "cat" belonging to the application with ID "mypets", use the command:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

And to get a specific actor state such as "food", use the command:

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

{{% alert title="Warning" color="warning" %}}
You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime. **The only exception:** it is often required to delete actor records in a state store, _once you know that these are no longer in use_, to prevent a build up of unused actor instances that may never be loaded again.

{{% /alert %}}
