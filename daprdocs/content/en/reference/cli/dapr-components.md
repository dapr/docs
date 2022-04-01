---
type: docs
title: "components CLI command reference"
linkTitle: "components"
description: "Detailed information on the components CLI command"
---

### Description

List all Dapr components.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr components [flags]
```

### Flags


| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--kubernetes`, `-k` | | `false` | List all Dapr components in a Kubernetes cluster (required) |
| `--all-namespaces`, `-A` | | `true` | If true, list all Dapr components in all namespaces |
| `--help`, `-h` | | | Print this help message |
| `--name`, `-n` | |  | The components name to be printed (optional) |
| `--namespace` | | | List all components in the specified namespace |
| `--output`, `-o` | | `list` | Output format (options: json or yaml or list) |

### Examples

```bash
# List Dapr components in all namespaces in Kubernetes mode
dapr components -k

# List Dapr components in specific namespace in Kubernetes mode
dapr components -k --namespace default

# Print specific Dapr component in Kubernetes mode
dapr components -k -n mycomponent

# List Dapr components in all namespaces in Kubernetes mode
dapr components -k --all-namespaces
```