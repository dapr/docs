---
type: docs
title: "job CLI command reference"
linkTitle: "job"
description: "Detailed information on the job CLI command"
---

### Description

Schedule jobs on a given Dapr application.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr job [command] [flags]
```

### Commands

| Name                | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `schedule`    | Schedule job in your application                          |
| `get`      | Get scheduled job                               |
| `delete`    | Delete the scheduled job                                  |


### Flags

| Name                | Environment Variable | Default | Description                                           |
| ------------------- | -------------------- | ------- | ----------------------------------------------------- |
| `--app-id`, `-i`    | `APP_ID`             |   | The application id on which to schedule jobs                          |
| `--name`, `-n`      |                      |   | Name of the job                               |
| `--schedule`, `-s`    |                      |  | Interval schedule for the job                                  |
| `--data`, `-d`      |                      |  | The JSON serialized data string (optional)            |
| `--repeats`, `-r` |                      |       | If the job is scheduled as recurring and how often it repeats (optional) |

### Examples

```bash
# Schedule a job on an hourly interval that repeats once
dapr job schedule --name myjob --app-id myapp --schedule "@hourly" --data '{"key":"value"}' --repeats 1

# Get information on the scheduled job
dapr job get --name myjob --app-id myapp

# Delete job
dapr job delete --name myjob --app-id myapp
```