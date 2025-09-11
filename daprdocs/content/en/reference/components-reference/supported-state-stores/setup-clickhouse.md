---
type: docs
title: "ClickHouse"
linkTitle: "ClickHouse"
description: Detailed information on the ClickHouse state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-clickhouse/"
---

## Component format

To setup ClickHouse state store create a component of type `state.clickhouse`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.clickhouse
  version: v1
  metadata:
  - name: clickhouseURL
    value: <CONNECTION_URL>
  - name: databaseName
    value: <DATABASE_NAME>
  - name: tableName
    value: <TABLE_NAME>
  - name: username # Optional
    value: <USERNAME>
  - name: password # Optional
    value: <PASSWORD>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| clickhouseURL      | Y        | Connection URL for the ClickHouse server | `"clickhouse://localhost:9000"`, `"clickhouse://clickhouse-server:9000"` |
| databaseName       | Y        | Name of the database to use | `"dapr_state"`, `"my_database"` |
| tableName          | Y        | Name of the table to store state data | `"state_table"`, `"dapr_state_store"` |
| username           | N        | Username for ClickHouse authentication. Can be `secretKeyRef` to use a secret reference | `"default"`, `"my_user"` |
| password           | N        | Password for ClickHouse authentication. Can be `secretKeyRef` to use a secret reference | `"my_password"` |

## Setup ClickHouse

Dapr can use any ClickHouse instance: containerized, running on your local dev machine, or a managed cloud service.

{{< tabpane text=true >}}

{{% tab "Self-Hosted" %}}

1. Run an instance of ClickHouse. You can run a local instance of ClickHouse in Docker with the following command:

   ```bash
   docker run -d --name clickhouse-server \
     -p 8123:8123 -p 9000:9000 \
     -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 \
     -e CLICKHOUSE_PASSWORD=my_password \
     clickhouse/clickhouse-server
   ```

2. Create a database for state data (optional, as Dapr will create it automatically):

   ```sql
   CREATE DATABASE IF NOT EXISTS dapr_state;
   ```

{{% /codetab %}}

{{% codetab %}}

You can use [Helm](https://helm.sh/) to quickly create a ClickHouse instance in your Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Add the ClickHouse Helm repository:
   ```bash
   helm repo add clickhouse https://docs.altinity.com/clickhouse-operator/
   helm repo update
   ```

2. Install ClickHouse into your cluster:
   ```bash
   helm install clickhouse clickhouse/clickhouse
   ```

3. Run `kubectl get pods` to see the ClickHouse containers now running in your cluster.

4. Add the ClickHouse service endpoint as the `clickhouseURL` in your component configuration. For example:
   ```yaml
   metadata:
   - name: clickhouseURL
     value: "clickhouse://clickhouse:9000"
   ```

{{% /codetab %}}

{{% codetab %}}

ClickHouse is available as a managed service from various cloud providers:

- [ClickHouse Cloud](https://clickhouse.com/cloud)
- [Altinity.Cloud](https://altinity.com/cloud-database/)
- [Yandex Managed Service for ClickHouse](https://cloud.yandex.com/services/managed-clickhouse)

When using a managed service, ensure you have the correct connection URL, database name, and credentials configured in your component metadata.

{{% /codetab %}}

{{< /tabs >}}

## Features

The ClickHouse state store supports the following features:

### ETags

The ClickHouse state store supports [ETags]({{< ref state-management-overview.md >}}) for optimistic concurrency control. ETags are automatically generated and updated when state data is modified.

### TTL (Time-To-Live)

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate after how many seconds the data should be considered "expired".

Example of setting TTL:

```json
{
  "key": "my-key",
  "value": "my-value",
  "metadata": {
    "ttlInSeconds": "3600"
  }
}
```

Records with expired TTLs are automatically filtered out during read operations and are eligible for cleanup by ClickHouse's background processes.

## Advanced

### Table Schema

The ClickHouse state store creates a table with the following schema:

```sql
CREATE TABLE IF NOT EXISTS <database>.<table> (
    key String,
    value String,
    etag String,
    expire DateTime64(3) NULL,
    PRIMARY KEY(key)
) ENGINE = ReplacingMergeTree()
ORDER BY key
```

The table uses ClickHouse's `ReplacingMergeTree` engine, which automatically deduplicates rows with the same primary key during background merges.

### Connection URL Format

The ClickHouse connection URL follows the standard format:

```
clickhouse://[username[:password]@]host[:port][/database][?param1=value1&...&paramN=valueN]
```

Examples:
- `clickhouse://localhost:9000`
- `clickhouse://user:password@clickhouse-server:9000/my_db`
- `clickhouse://localhost:9000?dial_timeout=10s&max_execution_time=60`

### Performance Considerations

- The ClickHouse state store is optimized for high-throughput scenarios
- For better performance with large datasets, consider partitioning your table by date or other relevant columns
- The `ReplacingMergeTree` engine provides eventual consistency for duplicate key handling
- Background merges in ClickHouse will automatically clean up old versions of updated records

### Bulk Operations

The ClickHouse state store supports bulk operations for improved performance:

- `BulkGet`: Retrieve multiple keys in a single operation
- `BulkSet`: Store multiple key-value pairs in a single operation  
- `BulkDelete`: Delete multiple keys in a single operation

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [ClickHouse Official Documentation](https://clickhouse.com/docs) 