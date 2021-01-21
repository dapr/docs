---
type: docs 
title: "MySQL binding spec"
linkTitle: "MySQL"
description: "Detailed documentation on the MySQL binding component"
---

## Setup Dapr component

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
      
    - name: user # or, define DB connection with separated keys
      value: <USER>
    - name: password
      value: <PASSWORD>
    - name: network
      value: <NETWORK>
    - name: addr
      value: <ADDRESS>
    - name: database
      value: <DATABASE>
      
    - name: maxIdleConns # Optional
      value: <MAX_IDLE_CONNECTIONS>
    - name: maxOpenConns
      value: <MAX_OPEN_CONNECTIONS>
    - name: connMaxLifetime
      value: <CONNECTILN_MAX_LIFE_TIME>
    - name: connMaxIdleTime
      value: <CONNECTION_MAX_IDLE_TIME>
```

The MySQL binding uses [Go-MySQL-Driver](https://github.com/go-sql-driver/mysql). If `url` is provided, it should follow
the `DSN` format shown below:

- `url`: Required, represent DB connection in Data Source Name (DNS) format.

  **Example DSN**
  
  ```yaml
  - name: url
    value: user:password@tcp(localhost:3306)/dbname
  ```

If url is not present, then the following keys are required in order to connect to the target database:

- `user`: Required, user name to login MySQL server.
- `password`: Optional, password to login MySQL server.
- `network`: Optional, the valid values are: "tcp" and "unix", and default value is "tcp".
- `addr`: Optional, Address of the MySQL server. If `addr` is not specified, then the default address is "127.0.0.1:
  3306" if `network` is "tcp", and "/tmp/mysql.sock" if `network` is "unix".
- `database`: Required, the target database to access.

  **Example Separated Keys**

  ```yaml
  - name: user 
    value: dapr_user
  - name: network
    value: tcp
  - name: addr
    value: localhost:3306
  - name: database
    value: dapr_test
  ```

Both methods also support connection pool configuration variables:

- `maxIdleConns`: integer greater than 0
- `maxOpenConns`: integer greater than 0
- `connMaxLifetime`: duration string
- `connMaxIdleTime`: duration string

{{% alert title="Warning" color="warning" %}} The above example uses secrets as plain strings. It is recommended to use
a secret store for the secrets as described [here]({{< ref component-secrets.md >}}). {{% /alert %}}

## Output Binding Supported Operations

- `exec`
- `query`
- `close`

### exec

The `exec` operation can be used for DDL operations (like table creation), as well as `INSERT`, `UPDATE`, `DELETE`
operations which return only metadata (e.g. number of affected rows).

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

The `query` operation is used for `SELECT` statements, which returns the metadata along with data in a form of an array
of row values.

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

Finally, the `close` operation can be used to explicitly close the DB connection and return it to the pool. This
operation doesn't have any response.

**Request**

```json
{
  "operation": "close"
}
```

> Note, the MySQL binding itself doesn't prevent SQL injection, like with any database application, validate the input before executing query.

## Related links

- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})