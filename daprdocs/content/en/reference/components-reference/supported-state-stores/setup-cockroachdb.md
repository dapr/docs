---
type: docs
title: "CockroachDB"
linkTitle: "CockroachDB"
description: Detailed information on the CockroachDB state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-cockroachdb/"
---

## Create a Dapr component

Create a file called `cockroachdb.yaml`, paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string for CockroachDB follow the same standard for PostgreSQL connection string. For example, `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"`. See the CockroachDB [documentation on database connections](https://www.cockroachlabs.com/docs/stable/connect-to-the-database.html) for information on how to define a connection string.

If you want to also configure CockroachDB to store actors, add the `actorStateStore` option as in the example below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.cockroachdb
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
  # Max idle time for connections before they're closed (optional)
  #- name: connectionMaxIdleTime
  #  value: 0
  # Uncomment this if you wish to use CockroachDB as a state store for actors (optional)
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `connectionString` | Y | The connection string for CockroachDB | `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"`
| `timeoutInSeconds` | N | Timeout, in seconds, for all database operations. Defaults to `20` | `30`
| `tableName` | N | Name of the table where the data is stored. Defaults to `state`. Can optionally have the schema name as prefix, such as `public.state` | `"state"`, `"public.state"`
| `metadataTableName` | N | Name of the table Dapr uses to store a few metadata properties. Defaults to `dapr_metadata`. Can optionally have the schema name as prefix, such as `public.dapr_metadata` | `"dapr_metadata"`, `"public.dapr_metadata"`
| `cleanupIntervalInSeconds` | N | Interval, in seconds, to clean up rows with an expired TTL. Default: `3600` (i.e. 1 hour). Setting this to values <=0 disables the periodic cleanup. | `1800`, `-1`
| `connectionMaxIdleTime` | N | Max idle time before unused connections are automatically closed in the connection pool. By default, there's no value and this is left to the database driver to choose. | `"5m"`
| `actorStateStore` | N | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`


## Setup CockroachDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

1. Run an instance of CockroachDB. You can run a local instance of CockroachDB in Docker CE with the following command:

     This example does not describe a production configuration because it sets a single-node cluster, it's only recommend for local environment.

     ```bash
     docker run --name roach1 -p 26257:26257 cockroachdb/cockroach:v21.2.3 start-single-node --insecure
     ```

2. Create a database for state data.

    To create a new database in CockroachDB, run the following SQL command inside container:

    ```bash
    docker exec -it roach1 ./cockroach sql --insecure -e 'create database dapr_test'
    ```
{{% /codetab %}}

{{% codetab %}}
The easiest way to install CockroachDB on Kubernetes is by using the [CockroachDB Operator](https://github.com/cockroachdb/cockroach-operator):
{{% /codetab %}}

{{% /tabs %}}

## Advanced

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate after how many seconds the data should be considered "expired".

Because CockroachDB doesn't have built-in support for TTLs, this is implemented in Dapr by adding a column in the state table indicating when the data is to be considered "expired". Records that are "expired" are not returned to the caller, even if they're still physically stored in the database. A background "garbage collector" periodically scans the state table for expired rows and deletes them.

The interval at which the deletion of expired records happens is set with the `cleanupIntervalInSeconds` metadata property, which defaults to 3600 seconds (that is, 1 hour).

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupIntervalInSeconds` to a smaller value, for example `300` (300 seconds, or 5 minutes).
- If you do not plan to use TTLs with Dapr and the CockroachDB state store, you should consider setting `cleanupIntervalInSeconds` to a value <= 0 (e.g. `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
