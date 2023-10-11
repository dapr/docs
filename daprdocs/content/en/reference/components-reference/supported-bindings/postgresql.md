---
type: docs
title: "PostgreSQL binding spec"
linkTitle: "PostgreSQL"
description: "Detailed documentation on the PostgreSQL binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/postgresql/"
  - "/operations/components/setup-bindings/supported-bindings/postgres/"
---

## Component format

To setup PostgreSQL binding create a component of type `bindings.postgresql`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.postgresql
  version: v1
  metadata:
    # Connection string
    - name: connectionString
      value: "<CONNECTION STRING>"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

### Authenticate using a connection string

The following metadata options are **required** to authenticate using a PostgreSQL connection string.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `connectionString` | Y | The connection string for the PostgreSQL database. See the PostgreSQL [documentation on database connections](https://www.postgresql.org/docs/current/libpq-connect.html) for information on how to define a connection string. | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=my_db"`

### Authenticate using Azure AD

Authenticating with Azure AD is supported with Azure Database for PostgreSQL. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | Must be set to `true` to enable the component to retrieve access tokens from Azure AD. | `"true"` |
| `connectionString` | Y | The connection string for the PostgreSQL database.<br>This must contain the user, which corresponds to the name of the user created inside PostgreSQL that maps to the Azure AD identity; this is often the name of the corresponding principal (e.g. the name of the Azure AD application). This connection string should not contain any password.  | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
| `azureTenantId` | N | ID of the Azure AD tenant | `"cd4b2887-304c-…"` |
| `azureClientId` | N | Client ID (application ID) | `"c7dd251f-811f-…"` |
| `azureClientSecret` | N | Client secret (application password) | `"Ecy3X…"` |

### Other metadata options

| Field | Required | Binding support |Details | Example |
|--------------------|:--------:|-----|---|---------|
| `maxConns` | N | Output | Maximum number of connections pooled by this component. Set to 0 or lower to use the default value, which is the greater of 4 or the number of CPUs. | `"4"`
| `connectionMaxIdleTime` | N | Output | Max idle time before unused connections are automatically closed in the connection pool. By default, there's no value and this is left to the database driver to choose. | `"5m"`
| `queryExecMode` | N | Output | Controls the default mode for executing queries. By default Dapr uses the extended protocol and automatically prepares and caches prepared statements. However, this may be incompatible with proxies such as PGBouncer. In this case it may be preferrable to use `exec` or `simple_protocol`. | `"simple_protocol"`

### URL format

The PostgreSQL binding uses [pgx connection pool](https://github.com/jackc/pgx) internally so the `connectionString` parameter can be any valid connection string, either in a `DSN` or `URL` format:

**Example DSN**

```shell
user=dapr password=secret host=dapr.example.com port=5432 dbname=my_dapr sslmode=verify-ca
```

**Example URL**

```shell
postgres://dapr:secret@dapr.example.com:5432/my_dapr?sslmode=verify-ca
```

Both methods also support connection pool configuration variables:

- `pool_min_conns`: integer 0 or greater
- `pool_max_conns`: integer greater than 0
- `pool_max_conn_lifetime`: duration string
- `pool_max_conn_idle_time`: duration string
- `pool_health_check_period`: duration string


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
SELECT * FROM mytable WHERE user_key = $1;
```

### exec

The `exec` operation can be used for DDL operations (like table creation), as well as `INSERT`, `UPDATE`, `DELETE` operations which return only metadata (e.g. number of affected rows).

The `params` property is a string containing a JSON-encoded array of parameters.

**Request**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES ($1, $2, $3)",
    "params": "[1, \"demo\", \"2020-09-24T11:45:05Z07:00\"]"
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
    "sql": "INSERT INTO foo (id, c1, ts) VALUES ($1, $2, $3)"
  }
}
```

### query

The `query` operation is used for `SELECT` statements, which returns the metadata along with data in a form of an array of row values.

The `params` property is a string containing a JSON-encoded array of parameters.

**Request**

```json
{
  "operation": "query",
  "metadata": {
    "sql": "SELECT * FROM foo WHERE id < $1",
    "params": "[3]"
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
    "sql": "SELECT * FROM foo WHERE id < $1"
  },
  "data": "[
    [0,\"test-0\",\"2020-09-24T04:13:46Z\"],
    [1,\"test-1\",\"2020-09-24T04:13:46Z\"],
    [2,\"test-2\",\"2020-09-24T04:13:46Z\"]
  ]"
}
```

### close

The `close` operation can be used to explicitly close the DB connection and return it to the pool. This operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
