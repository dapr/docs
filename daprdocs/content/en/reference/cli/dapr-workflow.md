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
| dapr workflow schedule create | Create a workflow schedule |
| dapr workflow schedule list | List workflow schedules |
| dapr workflow schedule get | Get a workflow schedule |
| dapr workflow schedule trigger | Start a run of a workflow schedule now |
| dapr workflow schedule delete | Delete a workflow schedule |

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
| `--instance-id-prefix`, `-p` | string | List only the workflows whose instance ID starts with this prefix, such as `<schedule name>_` for the runs of a workflow schedule |
| `--include-schedules` | bool | Also list the workflow instances that run workflow schedules, which are hidden by default |
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
| `--all-filter-status` | string | Filter purge to only instances with the given runtime status. Must be used with `--all-older-than`. One of RUNNING, COMPLETED, CONTINUED_AS_NEW, FAILED, CANCELED, TERMINATED, PENDING, SUSPENDED. Non-terminal statuses (e.g., RUNNING, PENDING, SUSPENDED) require the `--force` flag |
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

### Purge only FAILED instances older than 7 days
```bash
dapr workflow purge --app-id myapp --all-older-than 168h --all-filter-status FAILED
```

### Purge all terminal instances (dangerous!)
```bash
dapr workflow purge --app-id myapp --all
```

### Purge force (no workflow runtime, dangerous!)
```bash
dapr workflow purge wf-12345 --app-id myapp --force
```

## Manage workflow schedules

A [workflow schedule]({{% ref workflow-schedules.md %}}) starts a workflow repeatedly on a cron schedule. Each run is a new workflow instance with the ID `<schedule name>_<time>`.

## Usage

```bash
dapr workflow schedule create <name> --workflow <workflow> --schedule <schedule> [flags]
dapr workflow schedule list [flags]
dapr workflow schedule get <name> [flags]
dapr workflow schedule trigger <name> [flags]
dapr workflow schedule delete <name> [flags]
```

## Flags of `dapr workflow schedule create`

| Name | Type | Description |
|------|------|-------------|
| `--workflow`, `-w` | string | (Required) The name of the workflow each run starts |
| `--schedule`, `-s` | string | (Required) When runs start: a 6-field cron expression with seconds, `@every <duration>`, or `@daily` and the like, with an optional `CRON_TZ=<zone> ` prefix |
| `--input`, `-x` | string | The input every run is given, as JSON. Text that is not JSON is passed as a JSON string. |
| `--due-time` | string | The time of the first run, as RFC3339 or a Go duration |
| `--expiration` | string | The time after which no run starts, as RFC3339 or a Go duration |
| `--repeats` | uint32 | The number of runs after which the schedule completes |
| `--target-app-id` | string | The app ID that hosts the workflow each run starts, if not the app owning the schedule |
| `--target-app-namespace` | string | The namespace of `--target-app-id` |
| `--overwrite` | bool | Replace an existing schedule of the same name |
| `--skip-missed` | bool | Start one run for the times missed while the app was down, rather than one run for each. By default every missed time starts its own run. |

`dapr workflow schedule list` and `dapr workflow schedule get` take `--output`, `-o`: short, wide, yaml or json (default "short"). All schedule commands take the `--app-id`, `--kubernetes` and `--namespace` flags of `dapr workflow`.

## Examples

### Create a schedule

```bash
dapr workflow schedule create nightly-report --app-id reports --workflow GenerateReport --schedule "0 0 2 * * *"
```

### List schedules

```bash
dapr workflow schedule list --app-id reports
```

```text
NAME            NEXT              LAST              STATUS
nightly-report  Fri 30 Oct 02:00  Thu 29 Oct 02:00  ok 2m58s
weekly-cleanup  Mon 02 Nov 10:15  Mon 26 Oct 10:15  failed 4s
```

`-o wide` adds the schedule, what each run starts and the first line of the last run's output or failure.

### Trigger a run now

```bash
dapr workflow schedule trigger nightly-report --app-id reports
```

### List the runs of a schedule

```bash
dapr workflow list --app-id reports --instance-id-prefix nightly-report_
```

### Delete a schedule

```bash
dapr workflow schedule delete nightly-report --app-id reports
```
