---
type: docs
title: "PostgreSQL v1"
linkTitle: "PostgreSQL v1"
description: Detailed information on the PostgreSQL v1 state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-postgresql/"
  - "/operations/components/setup-state-store/supported-state-stores/setup-postgres/"
  - "/operations/components/setup-state-store/supported-state-stores/setup-postgresql-v1/"
  - "/operations/components/setup-state-store/supported-state-stores/setup-postgres-v1/"
---

{{% alert title="Note" color="primary" %}}
Starting with Dapr 1.13, you can leverage the [PostgreSQL v2]({{< ref setup-postgresql-v2.md >}}) state store component, which contains some improvements to performance and reliability.  
The v2 component is not compatible with v1, and data cannot be migrated between the two components. The v2 component does not offer support for state store query APIs.

There are no plans to deprecate the v1 component.
{{% /alert %}}

This component allows using PostgreSQL (Postgres) as state store for Dapr, using the "v1" component. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

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
    # Timeout for database operations, as a Go duration or number of seconds (optional)
    #- name: timeout
    #  value: 20
    # Name of the table where to store the state (optional)
    #- name: tableName
    #  value: "state"
    # Name of the table where to store metadata used by Dapr (optional)
    #- name: metadataTableName
    #  value: "dapr_metadata"
    # Cleanup interval in seconds, to remove expired rows (optional)
    #- name: cleanupInterval
    #  value: "1h"
    # Maximum number of connections pooled by this component (optional)
    #- name: maxConns
    #  value: 0
    # Max idle time for connections before they're closed (optional)
    #- name: connectionMaxIdleTime
    #  value: 0
    # Controls the default mode for executing queries. (optional)
    #- name: queryExecMode
    #  value: ""
    # Uncomment this if you wish to use PostgreSQL as a state store for actors or workflows (optional)
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
| `connectionString` | Y | The connection string for the PostgreSQL database. See the PostgreSQL [documentation on database connections](https://www.postgresql.org/docs/current/libpq-connect.html) for information on how to define a connection string. | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=my_db"` |

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure Database for PostgreSQL. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID. | `"true"` |
| `connectionString` | Y | The connection string for the PostgreSQL database.<br>This must contain the user, which corresponds to the name of the user created inside PostgreSQL that maps to the Microsoft Entra ID identity; this is often the name of the corresponding principal (e.g. the name of the Microsoft Entra ID application). This connection string should not contain any password.  | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
| `azureTenantId` | N | ID of the Microsoft Entra ID tenant | `"cd4b2887-304c-…"` |
| `azureClientId` | N | Client ID (application ID) | `"c7dd251f-811f-…"` |
| `azureClientSecret` | N | Client secret (application password) | `"Ecy3X…"` |

### Authenticate using AWS IAM

Authenticating with AWS IAM is supported with all versions of PostgreSQL type components.
The user specified in the connection string must be an already existing user in the DB, and an AWS IAM enabled user granted the `rds_iam` database role.
Authentication is based on the AWS authentication configuration file, or the AccessKey/SecretKey provided.
The AWS authentication token will be dynamically rotated before it's expiration time with AWS.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAWSIAM` | Y | Must be set to `true` to enable the component to retrieve access tokens from AWS IAM. This authentication method only works with AWS Relational Database Service for PostgreSQL databases. | `"true"` |
| `connectionString` | Y | The connection string for the PostgreSQL database.<br>This must contain an already existing user, which corresponds to the name of the user created inside PostgreSQL that maps to the AWS IAM policy. This connection string should not contain any password. Note that the database name field is denoted by dbname with AWS. | `"host=mydb.postgres.database.aws.com user=myapplication port=5432 dbname=my_db sslmode=require"`|
| `awsRegion` | Y | The AWS Region where the AWS Relational Database Service is deployed to. | `"us-east-1"` |
| `awsAccessKey` | Y | AWS access key associated with an IAM account | `"AKIAIOSFODNN7EXAMPLE"` |
| `awsSecretKey` | Y | The secret key associated with the access key | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| `awsSessionToken` | N | AWS session token to use. A session token is only required if you are using temporary security credentials. | `"TOKEN"` |

### Other metadata options

| Field | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `tableName` | N | Name of the table where the data is stored. Defaults to `state`. Can optionally have the schema name as prefix, such as `public.state` | `"state"`, `"public.state"`
| `metadataTableName` | N | Name of the table Dapr uses to store a few metadata properties. Defaults to `dapr_metadata`. Can optionally have the schema name as prefix, such as `public.dapr_metadata` | `"dapr_metadata"`, `"public.dapr_metadata"`
| `timeout` | N | Timeout for operations on the database, as a [Go duration](https://pkg.go.dev/time#ParseDuration). Integers are interpreted as number of seconds. Defaults to `20s` | `"30s"`, `30` |
| `cleanupInterval` | N | Interval, as a Go duration or number of seconds, to clean up rows with an expired TTL. Default: `1h` (1 hour). Setting this to values <=0 disables the periodic cleanup. | `"30m"`, `1800`, `-1`
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

1. Create a database for state data.  
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

You can set the deletion interval of expired records with the `cleanupInterval` metadata property, which defaults to 3600 seconds (that is, 1 hour).

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupInterval` to a smaller value; for example, `5m` (5 minutes).
- If you do not plan to use TTLs with Dapr and the PostgreSQL state store, you should consider setting `cleanupInterval` to a value <= 0 (for example, `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

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
