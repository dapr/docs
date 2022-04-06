---
type: docs
title: "configurations CLI command reference"
linkTitle: "configurations"
description: "Detailed information on the configurations CLI command"
---

### Description

List all Dapr configurations.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr configurations [flags]
```

### Flags


| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--kubernetes`, `-k` | | `false` | List all Dapr configurations in Kubernetes cluster (required).
| `--all-namespaces`, `-A` | | `true` | If true, list all Dapr configurations in all namespaces (optional)
| `--namespace` | | | List Dapr configurations in specific namespace.
| `--name`, `-n` | | | Print specific Dapr configuration. (optional)
| `--output`, `-o` | | `list`| Output format (options: json or yaml or list)
| `--help`, `-h` | | | Print this help message |

### Examples

```bash
# List Dapr configurations in all namespaces in Kubernetes mode
dapr configurations -k

# List Dapr configurations in specific namespace in Kubernetes mode
dapr configurations -k --namespace default

# Print specific Dapr configuration in Kubernetes mode
dapr configurations -k -n appconfig

# List Dapr configurations in all namespaces in Kubernetes mode
dapr configurations -k --all-namespaces
```
### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```