---
type: docs
title: "configurations CLI command reference"
linkTitle: "configurations"
description: "Detailed information on the configurations CLI command"
---

## Description

List all Dapr configurations.

## Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

## Usage

```bash
dapr configurations [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--all-namespaces`, `-A` | | `false` | If true, list all Dapr configurations in all namespaces
| `--kubernetes`, `-k` | | `false` | List all Dapr configurations in a Kubernetes cluster
| `--namespace`, `-n` | | `default` | List define namespace configurations in a Kubernetes cluster
| `--name` | | | The configuration name to be printed (optional)
| `--output`, `-o` | | `list`| Output format (options: json or yaml or list)
| `--help`, `-h` | | | Print this help message |

## Examples

### List Kubernetes Dapr configurations
```bash
dapr configurations -k
```
