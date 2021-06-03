---
type: docs
title: "MySQL binding spec"
linkTitle: "MySQL"
description: "Detailed documentation on the MySQL binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/mysql/"
---

## Component format

To setup MySQL binding create a component of type `bindings.mysql`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

The MySQL binding uses [Go-MySQL-Driver](https://github.com/go-sql-driver/mysql) internally.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.mysql
  version: v1
  metadata:
    - name: url # Required, define DB connection in DSN format
      value: <CONNECTION_STRING>
    - name: pemPath # Optional
      value: <PEM PATH>
    - name: maxIdleConns
      value: <MAX_IDLE_CONNECTIONS>
    - name: maxOpenConns
      value: <MAX_OPEN_CONNECTIONS>
    - name: connMaxLifetime
      value: <CONNECTILN_MAX_LIFE_TIME>
    - name: connMaxIdleTime
      value: <CONNECTION_MAX_IDLE_TIME>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| url | Y | Output | Represent DB connection in Data Source Name (DNS) format. See [here](#ssl-connection-details) SSL details | `"user:password@tcp(localhost:3306)/dbname"` |
| pemPath | Y | Output | Path to the PEM file. Used with SSL connection | `"path/to/pem/file"` |
| maxIdleConns | N | Output | The max idle connections. Integer greater than 0 | `"10"` |
| maxOpenConns | N | Output | The max open connections. Integer greater than 0 | `"10"` |
| connMaxLifetime | N | Output | The max connection lifetime. Duration string | `"12s"` |
| connMaxIdleTime | N | Output | The max connection idel time. Duration string | `"12s"` |

### SSL connection

If your server requires SSL your connection string must end of `&tls=custom` for example:
```bash
"<user>:<password>@tcp(<server>:3306)/<database>?allowNativePasswords=true&tls=custom"
```
 You must replace the `<PEM PATH>` with a full path to the PEM file. If you are using [MySQL on Azure](http://bit.ly/AzureMySQLSSL) see the Azure [documentation on SSL database connections](http://bit.ly/MySQLSSL), for information on how to download the required certificate. The connection to MySQL will require a minimum TLS version of 1.2.

## Binding support

This component supports **output binding** with the following operations:

- `exec`
- `query`
- `close`

### exec

The `exec` operation can be used for DDL operations (like table creation), as well as `INSERT`, `UPDATE`, `DELETE` operations which return only metadata (e.g. number of affected rows).

**Request**

```json
{
  "operation": "exec",
  "metadata": {
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (1, 'demo', '2020-09-24T11:45:05Z07:00')"
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
    "sql": "INSERT INTO foo (id, c1, ts) VALUES (1, 'demo', '2020-09-24T11:45:05Z07:00')"
  }
}
```

### query

The `query` operation is used for `SELECT` statements, which returns the metadata along with data in a form of an array of row values.

**Request**

```json
{
  "operation": "query",
  "metadata": {
    "sql": "SELECT * FROM foo WHERE id < 3"
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
    "sql": "SELECT * FROM foo WHERE id < 3"
  },
  "data": "[
    [0,\"test-0\",\"2020-09-24T04:13:46Z\"],
    [1,\"test-1\",\"2020-09-24T04:13:46Z\"],
    [2,\"test-2\",\"2020-09-24T04:13:46Z\"]
  ]"
}
```

### close

Finally, the `close` operation can be used to explicitly close the DB connection and return it to the pool. This operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```

> Note, the MySQL binding itself doesn't prevent SQL injection, like with any database application, validate the input before executing query.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
