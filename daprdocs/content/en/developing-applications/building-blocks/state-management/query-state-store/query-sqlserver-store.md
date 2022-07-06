---
type: docs
title: "SQL server"
linkTitle: "SQL server"
weight: 3000
description: "Use SQL server as a backend state store"
---

Dapr doesn't transform state values while saving and retrieving states. Dapr requires all state store implementations to abide by a certain key format scheme (see [the state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such as:

- Querying states.
- Creating aggregated views.
- Making backups.

## Connect to SQL Server

The easiest way to connect to your SQL Server instance is to use the:

- [Azure Data Studio](https://docs.microsoft.com/sql/azure-data-studio/download-azure-data-studio) (Windows, macOS, Linux)
- [SQL Server Management Studio](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) (Windows)

{{% alert title="Note" color="primary" %}}
When you configure an Azure SQL database for Dapr, you need to specify the exact table name to use. The following Azure SQL samples assume you've already connected to the right database with a table named "states".

{{% /alert %}}

## List keys by App ID

To get all state keys associated with application "myapp", use the query:

```sql
SELECT * FROM states WHERE [Key] LIKE 'myapp||%'
```

The above query returns all rows with id containing "myapp||", which is the prefix of the state keys.

## Get specific state data

To get the state data by a key "balance" for the application "myapp", use the query:

```sql
SELECT * FROM states WHERE [Key] = 'myapp||balance'
```

Read the **Data** field of the returned row. To get the state version/ETag, use the command:

```sql
SELECT [RowVersion] FROM states WHERE [Key] = 'myapp||balance'
```

## Get filtered state data

To get all state data where the value "color" in json data equals to "blue", use the query:

```sql
SELECT * FROM states WHERE JSON_VALUE([Data], '$.color') = 'blue'
```

## Read actor state

To get all the state keys associated with an actor with the instance ID "leroy" of actor type "cat" belonging to the application with ID "mypets", use the command:

```sql
SELECT * FROM states WHERE [Key] LIKE 'mypets||cat||leroy||%'
```

To get a specific actor state such as "food", use the command:

```sql
SELECT * FROM states WHERE [Key] = 'mypets||cat||leroy||food'
```

{{% alert title="Warning" color="warning" %}}
You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime. **The only exception:** it is often required to delete actor records in a state store, _once you know that these are no longer in use_, to prevent a build up of unused actor instances that may never be loaded again.

{{% /alert %}}