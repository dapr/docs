---
type: docs
title: "PostgreSQL"
linkTitle: "PostgreSQL"
description: Detailed information on the PostgreSQL state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-postgresql/"
---

This component allows using PostgreSQL (Postgres) as state store for Dapr. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.postgresql
  version: v1
  metadata:
    # Connection string
    - name: connectionString
      value: "<CONNECTION STRING>"
    # Timeout for database operations, in seconds (optional)
    #- name: timeoutInSeconds
    #  value: 20
    # Name of the table where to store the state (optional)
    #- name: tableName
    #  value: "state"
    # Name of the table where to store metadata used by Dapr (optional)
    #- name: metadataTableName
    #  value: "dapr_metadata"
    # Cleanup interval in seconds, to remove expired rows (optional)
    #- name: cleanupIntervalInSeconds
    #  value: 3600
    # Maximum number of connections pooled by this component (optional)
    #- name: maxConns
    #  value: 0
    # Max idle time for connections before they're closed (optional)
    #- name: connectionMaxIdleTime
    #  value: 0
    # Controls the default mode for executing queries. (optional)
    #- name: queryExecMode
    #  value: ""
    # Uncomment this if you wish to use PostgreSQL as a state store for actors (optional)
    #- name: actorStateStore
    #  value: "true"
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

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure Database for PostgreSQL. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID. | `"true"` |
| `connectionString` | Y | The connection string for the PostgreSQL database.<br>This must contain the user, which corresponds to the name of the user created inside PostgreSQL that maps to the Microsoft Entra ID identity; this is often the name of the corresponding principal (e.g. the name of the Microsoft Entra ID application). This connection string should not contain any password.  | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
| `azureTenantId` | N | ID of the Microsoft Entra ID tenant | `"cd4b2887-304c-…"` |
| `azureClientId` | N | Client ID (application ID) | `"c7dd251f-811f-…"` |
| `azureClientSecret` | N | Client secret (application password) | `"Ecy3X…"` |

### Other metadata options

| Field | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `timeoutInSeconds` | N | Timeout, in seconds, for all database operations. Defaults to `20` | `30`
| `tableName` | N | Name of the table where the data is stored. Defaults to `state`. Can optionally have the schema name as prefix, such as `public.state` | `"state"`, `"public.state"`
| `metadataTableName` | N | Name of the table Dapr uses to store a few metadata properties. Defaults to `dapr_metadata`. Can optionally have the schema name as prefix, such as `public.dapr_metadata` | `"dapr_metadata"`, `"public.dapr_metadata"`
| `cleanupIntervalInSeconds` | N | Interval, in seconds, to clean up rows with an expired TTL. Default: `3600` (i.e. 1 hour). Setting this to values <=0 disables the periodic cleanup. | `1800`, `-1`
| `maxConns` | N | Maximum number of connections pooled by this component. Set to 0 or lower to use the default value, which is the greater of 4 or the number of CPUs. | `"4"`
| `connectionMaxIdleTime` | N | Max idle time before unused connections are automatically closed in the connection pool. By default, there's no value and this is left to the database driver to choose. | `"5m"`
| `queryExecMode` | N | Controls the default mode for executing queries. By default Dapr uses the extended protocol and automatically prepares and caches prepared statements. However, this may be incompatible with proxies such as PGBouncer. In this case it may be preferrable to use `exec` or `simple_protocol`. | `"simple_protocol"`
| `actorStateStore` | N | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

## Setup PostgreSQL

{{< tabs "Self-Hosted" >}}

{{% codetab %}}

1. Run an instance of PostgreSQL. You can run a local instance of PostgreSQL in Docker CE with the following command:

     ```bash
     docker run -p 5432:5432 -e POSTGRES_PASSWORD=example postgres
     ```

     > This example does not describe a production configuration because it sets the password in plain text and the user name is left as the PostgreSQL default of "postgres".

2. Create a database for state data.
Either the default "postgres" database can be used, or create a new database for storing state data.

    To create a new database in PostgreSQL, run the following SQL command:

    ```sql
    CREATE DATABASE my_dapr;
    ```
  
{{% /codetab %}}

{{% /tabs %}}

## Advanced

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate after how many seconds the data should be considered "expired".

Because PostgreSQL doesn't have built-in support for TTLs, this is implemented in Dapr by adding a column in the state table indicating when the data is to be considered "expired". Records that are "expired" are not returned to the caller, even if they're still physically stored in the database. A background "garbage collector" periodically scans the state table for expired rows and deletes them.

The interval at which the deletion of expired records happens is set with the `cleanupIntervalInSeconds` metadata property, which defaults to 3600 seconds (that is, 1 hour). 

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupIntervalInSeconds` to a smaller value, for example `300` (300 seconds, or 5 minutes).
- If you do not plan to use TTLs with Dapr and the PostgreSQL state store, you should consider setting `cleanupIntervalInSeconds` to a value <= 0 (e.g. `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

The column in the state table where the expiration date for records is stored in, `expiredate`, **does not have an index by default**, so each periodic cleanup must perform a full-table scan. If you have a table with a very large number of records, and only some of them use a TTL, you may find it useful to create an index on that column. Assuming that your state table name is `state` (the default), you can use this query:

```sql
CREATE INDEX expiredate_idx
    ON state
    USING btree (expiredate ASC NULLS LAST);
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
