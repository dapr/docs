---
type: docs
title: "SQL Server"
linkTitle: "SQL Server"
description: Detailed information on the SQL Server state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-sqlserver/"
---

## Component format

To setup SQL Server state store create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.sqlserver
  version: v1
  metadata:
  - name: connectionString
    value: <REPLACE-WITH-CONNECTION-STRING> # Required.
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>  # Optional. defaults to "state"
  - name: keyType
    value: <REPLACE-WITH-KEY-TYPE>  # Optional. defaults to "string"
  - name: keyLength
    value: <KEY-LENGTH> # Optional. defaults to 200. You be used with "string" keyType
  - name: schema
    value: <SCHEMA> # Optional. defaults to "dbo"
  - name: indexedProperties
    value: <INDEXED-PROPERTIES> # Optional. List of IndexedProperties.
  - name: metadataTableName # Optional. Name of the table where to store metadata used by Dapr
    value: "dapr_metadata"
  - name: cleanupIntervalInSeconds # Optional. Cleanup interval in seconds, to remove expired rows
    value: 300

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

If you wish to use SQL server as an [actor state store]({{< ref "state_api.md#configuring-state-store-for-actors" >}}), append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| connectionString   | Y        | The connection string used to connect. If the connection string contains the database it must already exist. If the database is omitted a default database named `"Dapr"` is created.  | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"`
| tableName          | N        | The name of the table to use. Alpha-numeric with underscores. Defaults to `"state"` | `"table_name"`
| keyType            | N        | The type of key used. Defaults to `"string"` | `"string"`
| keyLength          | N        | The max length of key. Used along with `"string"` keytype. Defaults to `"200"` | `"200"`
| schema             | N        | The schema to use. Defaults to `"dbo"` | `"dapr"`,`"dbo"`
| indexedProperties  | N        | List of IndexedProperties. |  `'[{"column": "transactionid", "property": "id", "type": "int"}, {"column": "customerid", "property": "customer", "type": "nvarchar(100)"}]'`
| actorStateStore | N | Indicates that Dapr should configure this component for the actor state store ([more information]({{< ref "state_api.md#configuring-state-store-for-actors" >}})). | `"true"`
| metadataTableName | N | Name of the table Dapr uses to store a few metadata properties. Defaults to `dapr_metadata`. | `"dapr_metadata"`
| cleanupIntervalInSeconds | N | Interval, in seconds, to clean up rows with an expired TTL. Default: `3600` (i.e. 1 hour). Setting this to values <=0 disables the periodic cleanup. | `1800`, `-1`


## Create Azure SQL instance

[Follow the instructions](https://docs.microsoft.com/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal) from the Azure documentation on how to create a SQL database.  The database must be created before Dapr consumes it.

**Note: SQL Server state store also supports SQL Server running on VMs and in Docker.**

In order to setup SQL Server as a state store, you need the following properties:

- **Connection String**: The SQL Server connection string. For example: server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
- **Schema**: The database schema to use (default=dbo). Will be created if does not exist
- **Table Name**: The database table name. Will be created if does not exist
- **Indexed Properties**: Optional properties from json data which will be indexed and persisted as individual column

### Create a dedicated user

When connecting with a dedicated user (not `sa`), these authorizations are required for the user - even when the user is owner of the desired database schema:

- `CREATE TABLE`
- `CREATE TYPE`

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate after how many seconds the data should be considered "expired".

Because SQL Server doesn't have built-in support for TTLs, Dapr implements this by adding a column in the state table indicating when the data should be considered "expired". "Expired" records are not returned to the caller, even if they're still physically stored in the database. A background "garbage collector" periodically scans the state table for expired rows and deletes them.

You can set the interval for the deletion of expired records with the `cleanupIntervalInSeconds` metadata property, which defaults to 3600 seconds (that is, 1 hour).

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupIntervalInSeconds` to a smaller value - for example, `300` (300 seconds, or 5 minutes).
- If you do not plan to use TTLs with Dapr and the SQL Server state store, you should consider setting `cleanupIntervalInSeconds` to a value <= 0 (e.g. `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
