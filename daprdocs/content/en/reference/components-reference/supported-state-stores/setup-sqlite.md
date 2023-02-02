---
type: docs
title: "SQLite"
linkTitle: "SQLite"
description: Detailed information on the SQLite state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-sqlite/"
---

This component allows using SQLite 3 as state store for Dapr.

> The component is currently compiled with SQLite version 3.40.1.

## Create a Dapr component

Create a file called `sqlite.yaml`, paste the following, and replace the `<CONNECTION STRING>` value with your connection string, which is the path to a file on disk.

If you want to also configure SQLite to store actors, add the `actorStateStore` option as in the example below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.sqlite
  version: v1
  metadata:
  # Connection string
  - name: connectionString
    value: "data.db"
  # Timeout for database operations, in seconds (optional)
  #- name: timeoutInSeconds
  #  value: 20
  # Name of the table where to store the state (optional)
  #- name: tableName
  #  value: "state"
  # Cleanup interval in seconds, to remove expired rows (optional)
  #- name: cleanupIntervalInSeconds
  #  value: 3600
  # Uncomment this if you wish to use SQLite as a state store for actors (optional)
  #- name: actorStateStore
  #  value: "true"
```

## Spec metadata fields

| Field | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `connectionString` | Y | The connection string for the SQLite database. See below for more details. | `"path/to/data.db"`, `":memory:"`
| `timeoutInSeconds` | N | Timeout, in seconds, for all database operations. Defaults to `20` | `30`
| `tableName` | N | Name of the table where the data is stored. Defaults to `state`. | `"state"`
| `cleanupIntervalInSeconds` | N | Interval, in seconds, to clean up rows with an expired TTL. Default: `3600` (i.e. 1 hour). Setting this to values <=0 disables the periodic cleanup. | `1800`, `-1`
| `actorStateStore` | N | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

The **`connectionString`** parameter configures how to open the SQLite database.

- Normally, this is the path to a file on disk, relative to the current working directory, or absolute. For example: `"data.db"` (relative to the working directory) or `"/mnt/data/mydata.db"`.
- The path is interpreted by the SQLite library, so it's possible to pass additional options to the SQLite driver using "URI options". For example: `"path/to/data.db?mode=ro"` opens the database at path `path/to/data.db` in read-only mode. [Refer to the SQLite documentation for all supported URI options](https://www.sqlite.org/uri.html).
- The special case `":memory:"` launches the component backed by an in-memory SQLite database. This database is not persisted on disk, not shared across multiple Dapr instances, and all data is lost when the Dapr sidecar is stopped.

## Advanced

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate when the data should be considered "expired".

Because SQLite doesn't have built-in support for TTLs, this is implemented in Dapr by adding a column in the state table indicating when the data is to be considered "expired". Records that are "expired" are not returned to the caller, even if they're still physically stored in the database. A background "garbage collector" periodically scans the state table for expired rows and deletes them.

The `cleanupIntervalInSeconds` metadata property sets the expired records deletion interval, which defaults to 3600 seconds (that is, 1 hour).

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupIntervalInSeconds` to a smaller value, for example `300` (300 seconds, or 5 minutes).
- If you do not plan to use TTLs with Dapr and the SQLite state store, you should consider setting `cleanupIntervalInSeconds` to a value <= 0 (e.g. `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

The `expiration_time` column in the state table, where the expiration date for records is stored, **does not have an index by default**, so each periodic cleanup must perform a full-table scan. If you have a table with a very large number of records, and only some of them use a TTL, you may find it useful to create an index on that column. Assuming that your state table name is `state` (the default), you can use this query:

```sql
CREATE INDEX idx_expiration_time
  ON state (expiration_time);
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
