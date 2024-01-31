---
type: docs
title: "SQLite name resolution provider"
linkTitle: "SQLite"
description: Detailed information on the SQLite name resolution component
---

The SQLite name resolution component offers an alternative to mDNS for running Dapr on single-node environments and for local development scenarios. Dapr sidecars part of the cluster store their information in a SQLite database on the local machine.

> This component is optimized to be used in scenarios where all Dapr instances are running on the same physical machine, where the database is accessed through the same, locally-mounted disk.  
> Using the SQLite nameresolver with a database file accessed over the network (including via SMB/NFS) can lead to issues including data corruption, and is not supported.

## Configuration format

Name resolution is configured via the [Dapr Configuration]({{< ref configuration-overview.md >}}).

Within the Configuration YAML, set the `spec.nameResolution.component` property to `"sqlite"`, then pass configuration options in the `spec.nameResolution.configuration` dictionary.

This is the basic example of a Configuration resource:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "sqlite"
    version: "v1"
    configuration:
      connectionString: "/home/user/.dapr/nr.db"
```

## Spec configuration fields

When using the SQLite component as name resolver, the `spec.nameResolution.configuration` dictionary contains these options

| Field        | Required | Type | Details  | Examples |
|--------------|:--------:|-----:|:---------|----------|
| `connectionString` | Y | `string` | The connection string for the SQLite database. Normally, this is the path to a file on disk, relative to the current working directory, or absolute. | `"nr.db"` (relative to the working directory), `"/home/user/.dapr/nr.db"` |
| `updateInterval` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (as a `string`) | Interval for active Dapr sidecars to update their status in the database.<br>Must be at least 1s greater than `timeout`. Values with fractions of seconds are truncated (e.g. `1500ms` becomes `1s`). Default: `5s` | `"2s"` |
| `timeout` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (as a `string`).<br>Must be at least 1s. | Timeout for operations on the database. Integers are interpreted as number of seconds. Defaults to `1s` | `"2s"`, `2` |
| `tableName` | N | `string` | Name of the table where the data is stored. Defaults to `hosts`. | `"hosts"` |
| `metadataTableName` | N | `string` | Name of the table used by Dapr to store metadata for the component. Defaults to `metadata`. | `"metadata"` |
| `cleanupInterval` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (as a `string`) | Interval to remove stale records from the database. Default: `1h` (1 hour) | `"10m"` |
| `busyTimeout` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (as a `string`) | Interval to wait in case the SQLite database is currently busy serving another request, before returning a "database busy" error. Default: `800ms` (800 milliseconds) | `"100ms"` |
| `disableWAL` | N | `bool` | If set to true, disables Write-Ahead Logging for journaling of the SQLite database. This is for advanced scenarios only | `true`, `false` |

## Related links

- [Service invocation building block]({{< ref service-invocation >}})
