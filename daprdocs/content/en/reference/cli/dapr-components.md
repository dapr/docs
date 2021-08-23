---
type: docs
title: "components CLI command reference"
linkTitle: "components"
description: "Detailed information on the components CLI command"
---

## Description

List all Dapr components.

## Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

## Usage

```bash
dapr components [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--all-namespaces`, `-A` | | `false` | If true, list all Dapr components in all namespaces |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | List all Dapr components in a Kubernetes cluster |
| `--name` | |  | The components name to be printed (optional) |
| `--namespace`, `-n` | | `default` | List define namespace components in a Kubernetes cluster |
| `--output`, `-o` | | `list` | Output format (options: json or yaml or list) |

## Examples

### List Kubernetes components
```bash
dapr components -k
```
