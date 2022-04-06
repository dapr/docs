---
type: docs
title: "logs CLI command reference"
linkTitle: "logs"
description: "Detailed information on the logs CLI command"
---

### Description

Get Dapr sidecar logs for an application.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr logs [flags]
```

### Flags

 | Name                 | Environment Variable | Default   | Description                                                                              |
 | -------------------- | -------------------- | --------- | ---------------------------------------------------------------------------------------- |
 | `--app-id`, `-a`     | `APP_ID`             |           | The application id for which logs are needed                                             |
 | `--help`, `-h`       |                      |           | Print this help message                                                                  |
 | `--kubernetes`, `-k` |                      | `true`    | Get logs from a Kubernetes cluster                                                       |
 | `--namespace`, `-n`  |                      | `default` | The Kubernetes namespace in which your application is deployed                           |
 | `--pod-name`, `-p`   |                      |           | The name of the pod in Kubernetes, in case your application has multiple pods (optional) |

### Examples

```bash
# Get logs of sample app from target pod in custom namespace
dapr logs -k --app-id sample --pod-name target --namespace custom
```

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```