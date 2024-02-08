---
type: docs
title: "SQLite"
linkTitle: "SQLite"
description: Detailed information on the SQLite workflow backend component
---

## Component format

To set up the Redis lock, create a component of type `lock.redis`. See [this guide]({{< ref "howto-use-distributed-lock" >}}) on how to create a lock.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqlitebackend
spec:
  type: workflowbackend.sqlite
  version: v1
  metadata:
    - name: filePath
      value: "file::memory:"
    - name: orchestrationLockTimeout
      value: "130000000000ms"
    - name: activityLockTimeout
      value: "130000000000ms"
```


## Spec metadata fields

| Field                    | Required | Details                                                                                              | Example                                      |
|--------------------------|:--------:|------------------------------------------------------------------------------------------------------|----------------------------------------------|
| filePath                 | Y        | Path to the SQLite database file. For in-memory database, use `":memory:"`.                          | `"/path/to/database.db"`, `":memory:"`       |
| orchestrationLockTimeout | N        | Timeout duration for the orchestration lock. It's specified in milliseconds.                         | `"130000000000ms"`                                 |
| activityLockTimeout      | N        | Timeout duration for the activity lock. It's specified in milliseconds. Defaults to orchestrationLockTimeout if not specified. | `"130000000000ms"`                                 |

## Setting Up SQLite for Workflow Backend

SQLite can be used as a workflow backend in two ways: in-memory or via a file path. The choice between these two depends on your specific needs.

### In-Memory SQLite

In-memory SQLite databases are temporary and will be deleted when the application is closed. This is useful for testing or temporary data processing. To use an in-memory SQLite database, you can specify the filePath as ":memory:" in the metadata.

### File Path SQLite

If you want to persist data across multiple sessions, you can provide a file path to the SQLite database in the metadata. The database will be stored in this file, and it can be accessed later even after the application is closed.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqlitebackend
spec:
  type: workflowbackend.sqlite
  version: v1
  metadata:
    - name: filePath
      value: "/path/to/your/database.db"
    - name: orchestrationLockTimeout
      value: "130000000000ms"
    - name: activityLockTimeout
      value: "130000000000ms"
```

In the above configuration, replace `/path/to/your/database.db` with the actual path to your SQLite database file. If the file does not exist, SQLite will create it.

Remember, SQLite backend isn't supported yet in Dapr workflow. The above example is for illustrative purposes.