---
type: docs
title: "dapr scheduler"
linkTitle: "scheduler"
description: "Manage Dapr Scheduler jobs and reminders using the dapr CLI"
weight: 3000
---

# dapr scheduler

Manage scheduled jobs and reminders stored in the Dapr Scheduler.

``` bash
dapr scheduler [command]
```

## Aliases
- `scheduler`
- `sched`

## Available Commands

- [list](#dapr-scheduler-list): List scheduled jobs
- [get](#dapr-scheduler-get): Get a scheduled job by key
- [delete](#dapr-scheduler-delete): Delete a scheduled job by key
- [delete-all)](#dapr-scheduler-delete-all): Delete all scheduled jobs by key prefix
- [export](#dapr-scheduler-export): Export all scheduled jobs to a file
- [import](#dapr-scheduler-import): Import scheduled jobs from a file


## Global Flags

| Flag | Description |
| -k, --kubernetes | Perform operation on a Kubernetes Dapr cluster |
| -n, --namespace string | Namespace of the Dapr app (default "default") |
| --scheduler-namespace string | Namespace where the scheduler runs (default "dapr-system") |

## dapr scheduler list

List scheduled jobs in Scheduler.

```bash
dapr scheduler list [flags]
```

### Flags

- `--filter string` – Filter jobs by type. One of: all, app, actor, workflow, activity (default all)
- `-o, --output string` – Output format: short, wide, yaml, json (default short)

### Examples

```bash
$ dapr scheduler list
NAME                                           BEGIN     COUNT  LAST TRIGGER
actor/myactortype/actorid1/test1               -3.89s    1      2025-10-03T16:58:55Z
actor/myactortype/actorid2/test2               -3.89s    1      2025-10-03T16:58:55Z
app/test-scheduler/test1                       -3.89s    1      2025-10-03T16:58:55Z
app/test-scheduler/test2                       -3.89s    1      2025-10-03T16:58:55Z
activity/test-scheduler/xyz1::0::1             -888.8ms  0
activity/test-scheduler/xyz2::0::1             -888.8ms  0
workflow/test-scheduler/abc1/timer-0-TVIQGkvu  +50.0h    0
workflow/test-scheduler/abc2/timer-0-OM2xqG9m  +50.0h    0
```

```bash
$ dapr scheduler list -o wide
NAMESPACE  NAME                                           BEGIN                 EXPIRATION            SCHEDULE         DUE TIME                   TTL     REPEATS  COUNT  LAST TRIGGER
default    actor/myactortype/actorid1/test1               2025-10-03T16:58:55Z                        @every 2h46m40s  2025-10-03T17:58:55+01:00          100      1      2025-10-03T16:58:55Z
default    actor/myactortype/actorid2/test2               2025-10-03T16:58:55Z                        @every 2h46m40s  2025-10-03T17:58:55+01:00          100      1      2025-10-03T16:58:55Z
default    app/test-scheduler/test1                       2025-10-03T16:58:55Z                        @every 100m      2025-10-03T17:58:55+01:00          1234     1      2025-10-03T16:58:55Z
default    app/test-scheduler/test2                       2025-10-03T16:58:55Z  2025-10-03T19:45:35Z  @every 100m      2025-10-03T17:58:55+01:00  10000s  56788    1      2025-10-03T16:58:55Z
default    activity/test-scheduler/xyz1::0::1             2025-10-03T16:58:58Z                                         0s                                          0
default    activity/test-scheduler/xyz2::0::1             2025-10-03T16:58:58Z                                         0s                                          0
default    workflow/test-scheduler/abc1/timer-0-TVIQGkvu  2025-10-05T18:58:58Z                                         2025-10-05T18:58:58Z                        0
default    workflow/test-scheduler/abc2/timer-0-OM2xqG9m  2025-10-05T18:58:58Z                                         2025-10-05T18:58:58Z                        0
```

## dapr scheduler get

Get one or more scheduled jobs/reminders by key.

```bash
dapr scheduler get <keys...> [flags]
```

### Key formats

- App job: `app/<app-id>/<job-name>`
- Actor reminder: `actor/<actor-type>/<actor-id>/<reminder-name>`
- Workflow reminder: `workflow/<app-id>/<instance-id>/<reminder-name>`
- Activity reminder: `activity/<app-id>/<activity-id>`

### Flags

- `-o, --output string` – Output format: `short`, `wide`, `yaml`, `json` (default `short`)

### Examples

```bash
dapr scheduler get app/my-app/job1 -o yaml
```

## dapr scheduler delete

Delete one or more jobs.

```bash
dapr scheduler delete <keys...>
```

### Aliases
- `delete`, `d`, `del`

### Examples

```bash
dapr scheduler delete app/my-app/job1 actor/MyActor/123/reminder1
```

## dapr scheduler delete-all

Bulk delete jobs by filter key.

```bash
dapr scheduler delete-all <filter-key>
```

### Aliases

- `delete-all`, `da`, `delall`

### Examples

```bash
dapr scheduler delete-all all
dapr scheduler delete-all app/my-app
dapr scheduler delete-all actor/MyActorType
```

## dapr scheduler export

Export all jobs and reminders to a file.

```bash
dapr scheduler export -o backup.bin
```

## dapr scheduler import

Import jobs and reminders from a file.

```bash
dapr scheduler import -f backup.bin
```

