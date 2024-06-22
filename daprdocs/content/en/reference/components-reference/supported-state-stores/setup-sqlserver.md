---
type: docs
title: "Microsoft SQL Server & Azure SQL"
linkTitle: "Microsoft SQL Server & Azure SQL"
description: Detailed information on the Microsoft SQL Server state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-sqlserver/"
---

## Component format

This state store component can be used with both [Microsoft SQL Server](https://learn.microsoft.com/sql/) and [Azure SQL](https://learn.microsoft.com/azure/azure-sql/).

To set up this state store, create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.sqlserver
  version: v1
  metadata:
    # Authenticate using SQL Server credentials
    - name: connectionString
      value: |
        Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;

    # Authenticate with Microsoft Entra ID (Azure SQL only)
    # "useAzureAD" be set to "true"
    - name: useAzureAD
      value: true
    # Connection string or URL of the Azure SQL database, optionally containing the database
    - name: connectionString
      value: |
        sqlserver://myServerName.database.windows.net:1433?database=myDataBase

    # Other optional fields (listing default values)
    - name: tableName
      value: "state"
    - name: metadataTableName
      value: "dapr_metadata"
    - name: schema
      value: "dbo"
    - name: keyType
      value: "string"
    - name: keyLength
      value: "200"
    - name: indexedProperties
      value: ""
    - name: cleanupIntervalInSeconds
      value: "3600"
   # Uncomment this if you wish to use Microsoft SQL Server as a state store for actors (optional)
   #- name: actorStateStore
   #  value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

If you wish to use SQL server as an [actor state store]({{< ref "state_api.md#configuring-state-store-for-actors" >}}), append the following to the metadata:

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

### Authenticate using SQL Server credentials

The following metadata options are **required** to authenticate using SQL Server credentials. This is supported on both SQL Server and Azure SQL.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `connectionString` | Y | The connection string used to connect.<br>If the connection string contains the database, it must already exist. Otherwise, if the database is omitted, a default database named "Dapr" is created.  | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"` |

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure SQL only. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID. | `"true"` |
| `connectionString` | Y | The connection string or URL of the Azure SQL database, **without credentials**.<br>If the connection string contains the database, it must already exist. Otherwise, if the database is omitted, a default database named "Dapr" is created.  | `"sqlserver://myServerName.database.windows.net:1433?database=myDataBase"` |
| `azureTenantId` | N | ID of the Microsoft Entra ID tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | N | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureClientSecret` | N | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

### Other metadata options

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `tableName`          | N        | The name of the table to use. Alpha-numeric with underscores. Defaults to `"state"` | `"table_name"`
| `metadataTableName` | N | Name of the table Dapr uses to store a few metadata properties. Defaults to `dapr_metadata`. | `"dapr_metadata"`
| `keyType`            | N        | The type of key used. Supported values: `"string"` (default), `"uuid"`, `"integer"`.| `"string"`
| `keyLength`          | N        | The max length of key. Ignored if "keyType" is not `string`. Defaults to `"200"` | `"200"`
| `schema`             | N        | The schema to use. Defaults to `"dbo"` | `"dapr"`,`"dbo"`
| `indexedProperties`  | N        | List of indexed properties, as a string containing a JSON document. |  `'[{"column": "transactionid", "property": "id", "type": "int"}, {"column": "customerid", "property": "customer", "type": "nvarchar(100)"}]'`
| `actorStateStore` | N | Indicates that Dapr should configure this component for the actor state store ([more information]({{< ref "state_api.md#configuring-state-store-for-actors" >}})). | `"true"`
| `cleanupIntervalInSeconds` | N | Interval, in seconds, to clean up rows with an expired TTL. Default: `"3600"` (i.e. 1 hour). Setting this to values <=0 disables the periodic cleanup. | `"1800"`, `"-1"`


## Create a Microsoft SQL Server/Azure SQL instance

[Follow the instructions](https://docs.microsoft.com/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal) from the Azure documentation on how to create a SQL database. The database must be created before Dapr consumes it.

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

The state store does not have an index on the `ExpireDate` column, which means that each clean up operation must perform a full table scan. If you intend to write to the table with a large number of records that use TTLs, you should consider creating an index on the `ExpireDate` column. An index makes queries faster, but uses more storage space and slightly slows down writes.

```sql
CREATE CLUSTERED INDEX expiredate_idx ON state(ExpireDate ASC)
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
