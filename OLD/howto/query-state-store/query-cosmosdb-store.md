# Query Azure Cosmos DB state store

Dapr doesn't transform state values while saving and retrieving states. Dapr requires all state store implementations to abide by a certain key format scheme (see [Dapr state management spec](../../reference/api/state_api.md). You can directly interact with the underlying store to manipulate the state data, such querying states, creating aggregated views and making backups.

> **NOTE:** Azure Cosmos DB is a multi-modal database that supports multiple APIs. The default Dapr Cosmos DB state store implementation uses the [Azure Cosmos DB SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started).

## 1. Connect to Azure Cosmos DB

The easiest way to connect to your Cosmos DB instance is to use the Data Explorer on [Azure Management Portal](https://portal.azure.com). Alternatively, you can use [various SDKs and tools](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-introduction).

> **NOTE:** The following samples use Cosmos DB [SQL API](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-query-getting-started). When you configure an Azure Cosmos DB for Dapr, you need to specify the exact database and collection to use. The follow samples assume you've already connected to the right database and a collection named "states".

## 2. List keys by App ID

To get all state keys associated with application "myapp", use the query:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'myapp||')
```

The above query returns all documents with id containing "myapp-", which is the prefix of the state keys.

## 3. Get specific state data

To get the state data by a key "balance" for the application "myapp", use the query:

```sql
SELECT * FROM states WHERE states.id = 'myapp||balance'
```

Then, read the **value** field of the returned document.

To get the state version/ETag, use the command:

```sql
SELECT states._etag FROM states WHERE states.id = 'myapp||balance'
```

## 4. Read actor state

To get all the state keys associated with an actor with the instance ID "leroy" of actor type "cat" belonging to the application with ID "mypets", use the command:

```sql
SELECT * FROM states WHERE CONTAINS(states.id, 'mypets||cat||leroy||')
```

And to get a specific actor state such as "food", use the command:

```sql
SELECT * FROM states WHERE states.id = 'mypets||cat||leroy||food'
```

> **WARNING:** You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime.
