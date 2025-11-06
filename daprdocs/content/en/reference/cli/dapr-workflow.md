---
type: docs
title: "workflow CLI command"
linkTitle: "workflow"
description: "Detailed information on the workflow CLI command"
---

Manage Dapr workflow instances.

## Commands

| Command | Description |
|---------|-------------|
| dapr workflow run | Start a new workflow instance |
| dapr workflow list | List workflow instances |
| dapr workflow history | Get workflow execution history |
| dapr workflow purge | Purge workflow instances |
| dapr workflow suspend | Suspend a workflow |
| dapr workflow resume | Resume a workflow |
| dapr workflow terminate | Terminate a workflow |
| dapr workflow raise-event | Raise an external event |
| dapr workflow rerun | Re-run a workflow |

## Flags

```
  -a, --app-id string      The app ID owner of the workflow instance
  -h, --help               help for workflow
  -k, --kubernetes         Target a Kubernetes dapr installation
  -n, --namespace string   Namespace to perform workflow operation on (default "default")
```

## Examples

### List workflows
```bash
dapr workflow list --app-id myapp
```

### Start a workflow
```bash
dapr workflow run MyWorkflow --app-id myapp --input '{"key": "value"}'
```

### Kubernetes mode
```bash
dapr workflow list -k -n production --app-id myapp
```

## List workflow instances for a given application.

## Usage

```bash
dapr workflow list [flags]
```

## Flags

| Name | Type | Description |
|------|------|-------------|
| `--app-id`, `-a` | string | (Required) The app ID owner of the workflow instances |
| `--filter-name`, `-w` | string | Filter workflows by name |
| `--filter-status`, `-s` | string | Filter by status: RUNNING, COMPLETED, FAILED, CANCELED, TERMINATED, PENDING, SUSPENDED |
| `--filter-max-age`, `-m` | string | Filter workflows started within duration or timestamp (e.g., "300ms", "1.5h", "2023-01-02T15:04:05") |
| `--output`, `-o` | string | Output format: short, wide, yaml, json (default "short") |
| `--connection-string`, `-c` | string | Connection string to the actor state store |
| `--table-name`, `-t` | string | Table or collection name used as the actor state store |
| `--kubernetes`, `-k` | bool | Target a Kubernetes Dapr installation |
| `--namespace`, `-n` | string | Kubernetes namespace (default "default") |

## Examples

### Basic usage
```bash
dapr workflow list --app-id myapp
```

### Filter by status
```bash
dapr workflow list --app-id myapp --filter-status RUNNING
```

### Filter by workflow name
```bash
dapr workflow list --app-id myapp --filter-name OrderProcessing
```

### Filter by age
```bash
# Workflows from last 24 hours
dapr workflow list --app-id myapp --filter-max-age 24h

# Workflows after specific date
dapr workflow list --app-id myapp --filter-max-age 2024-01-01T00:00:00Z
```

### JSON output
```bash
dapr workflow list --app-id myapp --output json
```

### Kubernetes with port forwarding
```bash
# Terminal 1: Port forward to database
kubectl port-forward service/postgres 5432:5432 -n production

# Terminal 2: List workflows with direct database access
dapr workflow list \
  --kubernetes \
  --namespace production \
  --app-id myapp \
  --connection-string "host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable" \
  --table-name workflows
```

## Connection String Formats

### PostgreSQL / CockroachDB
```
host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable
```

### MySQL
```
dapr:dapr@tcp(localhost:3306)/dapr?parseTime=true
```

### SQL Server
```
sqlserver://dapr:Pass@word@localhost:1433?database=dapr
```

### MongoDB
```
mongodb://localhost:27017/dapr
```

### Redis
```
redis[s]://[[username][:password]@][host][:port][/db-number]:
```

## Purge workflow instances with terminal states (COMPLETED, FAILED, TERMINATED).

## Usage

```bash
dapr workflow purge [instance-id] [flags]
```

## Flags

| Name | Type | Description |
|------|------|-------------|
| `--app-id`, `-a` | string | (Required) The app ID owner of the workflow instances |
| `--all` | bool | Purge all terminal workflow instances (use with caution) |
| `--all-older-than` | string | Purge instances older than duration or timestamp (e.g., "24h", "2023-01-02T15:04:05Z") |
| `--connection-string`, `-c` | string | Connection string to the actor state store |
| `--table-name`, `-t` | string | Table or collection name used as the actor state store |
| `--kubernetes`, `-k` | bool | Target a Kubernetes Dapr installation |
| `--namespace`, `-n` | string | Kubernetes namespace (default "default") |

## Examples

### Purge a specific instance
```bash
dapr workflow purge wf-12345 --app-id myapp
```

### Purge instances older than 30 days
```bash
dapr workflow purge --app-id myapp --all-older-than 720h
```

### Purge instances older than specific date
```bash
dapr workflow purge --app-id myapp --all-older-than 2023-12-01T00:00:00Z
```

### Purge all terminal instances (dangerous!)
```bash
dapr workflow purge --app-id myapp --all
```

### Kubernetes with database access
```bash
# Port forward to database
kubectl port-forward service/postgres 5432:5432 -n production

# Purge old workflows
dapr workflow purge \
  --kubernetes \
  --namespace production \
  --app-id myapp \
  --connection-string "host=localhost user=dapr password=dapr dbname=dapr port=5432 sslmode=disable" \
  --table-name workflows \
  --all-older-than 2160h  # 90 days
```

## Best Practices

1. **Regular Cleanup**: Schedule periodic purge operations
   ```bash
   # Cron job to purge workflows older than 90 days
   0 2 * * 0 dapr workflow purge --app-id myapp --all-older-than 2160h
   ```

2. **Test First**: Use list command to see what will be purged
   ```bash
   dapr workflow list --app-id myapp --filter-status COMPLETED --filter-max-age 2160h
   ```

3. **Backup Before Bulk Purge**: Export data before using `--all`
   ```bash
   dapr workflow list --app-id myapp --output json > backup.json
   ```
