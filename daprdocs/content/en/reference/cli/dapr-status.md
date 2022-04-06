---
type: docs
title: "status CLI command reference"
linkTitle: "status"
description: "Detailed information on the status CLI command"
---

### Description

Show the health status of Dapr services.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr status -k
```

### Flags

| Name                 | Environment Variable | Default | Description                                                   |
| -------------------- | -------------------- | ------- | ------------------------------------------------------------- |
| `--help`, `-h`       |                      |         | Print this help message                                       |
| `--kubernetes`, `-k` |                      | `false` | Show the health status of Dapr services on Kubernetes cluster |

### Examples

```bash
# Get status of Dapr services from Kubernetes
dapr status -k
```

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```