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

### Purge force (no workflow runtime, dangerous!)
```bash
dapr workflow purge wf-12345 --app-id myapp --force
```
