---
type: docs
title: "list CLI command reference"
linkTitle: "list"
description: "Detailed information on the list CLI command"
---

### Description

List all Dapr instances.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr list [flags]
```

### Flags


| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--all-namespaces`, `-A` | | `false` | List all Dapr pods in all namespaces (optional) |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | List all Dapr pods in a Kubernetes cluster (optional) |
| `--namespace`, `-n` | | `default` | List the Dapr pods in the defined namespace in Kubernetes. Only with `-k` flag (optional) |
| `--output`, `-o` | | `table` | The output format of the list. Valid values are: `json`, `yaml`, or `table`

### Examples

```bash
# List Dapr instances in self-hosted mode
dapr list

# List Dapr instances in all namespaces in Kubernetes mode
dapr list -k

# List Dapr instances in JSON format
dapr list -o json

# List Dapr instances in a specific namespace in Kubernetes mode
dapr list -k --namespace default

# List Dapr instances in all namespaces in  Kubernetes mode
dapr list -k --all-namespaces
```

### Warning messages - Kubernetes Mode 
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```