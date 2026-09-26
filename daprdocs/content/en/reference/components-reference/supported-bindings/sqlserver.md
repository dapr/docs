---
type: docs
title: "SQL Server binding spec"
linkTitle: "SQL Server"
description: "Detailed documentation on the SQL Server binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/sqlserver/"
---

## Component format

This binding can be used with both [Microsoft SQL Server](https://learn.microsoft.com/sql/) and [Azure SQL](https://learn.microsoft.com/azure/azure-sql/).

Unlike the [SQL Server state store]({{% ref setup-sqlserver-v2.md %}}), this binding doesn't create or manage its own schema. It's meant to be used against a database that already has its own tables, views, and stored procedures, letting your application run arbitrary SQL and stored procedures through the Dapr sidecar.

To setup a SQL Server binding, create a component of type `bindings.sqlserver`. See [this guide]({{% ref "howto-bindings.md#1-create-a-binding" %}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.sqlserver
  version: v1
  metadata:
    # Authenticate using SQL Server credentials
    - name: connectionString
      value: |
        Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;

    # Authenticate with Microsoft Entra ID (Azure SQL only)
    # "useAzureAD" must be set to "true"
    #- name: useAzureAD
    #  value: true
    # Connection string or URL of the Azure SQL database, without credentials
    #- name: connectionString
    #  value: |
    #    sqlserver://myServerName.database.windows.net:1433?database=myDataBase

    # Other optional fields
    - name: maxIdleConns
      value: "10"
    - name: maxOpenConns
      value: "10"
    - name: connMaxLifetime
      value: "12s"
    - name: connMaxIdleTime
      value: "12s"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

### Authenticate using SQL Server credentials

The following metadata option is **required** to authenticate using SQL Server credentials. This is supported on both SQL Server and Azure SQL.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `connectionString` | Y | The connection string used to connect.<br>Unlike the SQL Server state store, this binding doesn't create or manage any database: the connection string should point at an existing database that already has the schema, tables, and/or stored procedures the caller needs. | `"Server=myServerName\myInstanceName;Database=myDataBase;User Id=myUsername;Password=myPassword;"` |

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure SQL only. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID. | `"true"` |
| `connectionString` | Y | The connection string or URL of the Azure SQL database, **without credentials**. | `"sqlserver://myServerName.database.windows.net:1433?database=myDataBase"` |
| `azureTenantId` | N | ID of the Microsoft Entra ID tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | N | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureClientSecret` | N | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

### Other metadata options

| Field | Required | Binding support | Details | Example |
|--------------------|:--------:|------------|-----|---------|
| `maxIdleConns` | N | Output | The max idle connections. Integer greater than 0 | `"10"` |
| `maxOpenConns` | N | Output | The max open connections. Integer greater than 0 | `"10"` |
| `connMaxLifetime` | N | Output | The max connection lifetime, as a [Go duration](https://pkg.go.dev/time#ParseDuration) | `"12s"` |
| `connMaxIdleTime` | N | Output | The max connection idle time, as a [Go duration](https://pkg.go.dev/time#ParseDuration) | `"12s"` |

## Binding support

This component supports **output binding** with the following operations:

- `exec`
- `query`
- `close`

### Parametrized queries

This binding supports parametrized queries, which allow separating the SQL query itself from user-supplied values. The usage of parametrized queries is **strongly recommended** for security reasons, as they prevent [SQL Injection attacks](https://owasp.org/www-community/attacks/SQL_Injection).

For example:

```sql
-- ❌ WRONG! Includes values in the query and is vulnerable to SQL Injection attacks.
SELECT * FROM mytable WHERE user_key = 'something';

-- ✅ GOOD! Uses parametrized queries.
-- This will be executed with parameters ["something"]
SELECT * FROM mytable WHERE user_key = @p1;
```

### exec

The `exec` operation can be used for DDL operations (like table creation), `INSERT`/`UPDATE`/`DELETE` statements, or to invoke a stored procedure that doesn't return a result set. It returns only metadata, such as the number of affected rows.

The `params` property is a string containing a JSON-encoded array of parameters.

**Request**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (@p1, @p2, @p3)",
    "params": "[1, \"demo\", \"2020-09-24T11:45:05Z07:00\"]"
  }
}
```

Calling a stored procedure that performs writes but doesn't return a result set works the same way:

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "EXEC dbo.usp_UpdateOrder @OrderId = @p1, @Status = @p2",
    "params": "[42, \"shipped\"]"
  }
}
```

**Response**

```json
{
  "metadata": {
    "operation": "exec",
    "duration": "294µs",
    "start-time": "2020-09-24T11:13:46.405097Z",
    "end-time": "2020-09-24T11:13:46.414519Z",
    "rows-affected": "1",
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (@p1, @p2, @p3)"
  }
}
```

### query

The `query` operation is used for `SELECT` statements, or to invoke a stored procedure that returns a result set. It returns the metadata along with data in the form of an array of row values, encoded as JSON.

The `params` property is a string containing a JSON-encoded array of parameters.

**Request**

```json
{
  "operation": "query",
  "metadata": {
    "sql": "SELECT * FROM foo WHERE id < @p1",
    "params": "[3]"
  }
}
```

Calling a stored procedure that returns a result set works the same way:

```json
{
  "operation": "query",
  "metadata": {
    "sql": "EXEC dbo.usp_GetOrdersByCustomer @CustomerId = @p1",
    "params": "[7]"
  }
}
```

**Response**

```json
{
  "metadata": {
    "operation": "query",
    "duration": "432µs",
    "start-time": "2020-09-24T11:13:46.405097Z",
    "end-time": "2020-09-24T11:13:46.420566Z",
    "sql": "SELECT * FROM foo WHERE id < @p1"
  },
  "data": [
    {"column_name": "value", "column_name2": "value2"},
    {"column_name": "value", "column_name2": "value2"},
    {"column_name": "value", "column_name2": "value2"}
  ]
}
```

Here `column_name` is the name of the column returned by the query, and `value` is the value of that column for the row. Note that values are returned as strings or numbers, depending on the underlying SQL data type.

### close

The `close` operation can be used to explicitly close the DB connection and return it to the pool. This operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Bindings building block]({{% ref bindings %}})
- [How-To: Use bindings to interface with external resources]({{% ref howto-bindings.md %}})
- [Bindings API reference]({{% ref bindings_api.md %}})
