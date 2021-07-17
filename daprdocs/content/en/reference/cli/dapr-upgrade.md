---
type: docs
title: "upgrade CLI command reference"
linkTitle: "upgrade"
description: "Detailed information on the upgrade CLI command"
---

## Description

Upgrade Dapr on supported hosting platforms.

## Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

## Usage
```bash
dapr upgrade [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | Upgrade Dapr in a Kubernetes cluster |
| `--runtime-version` | | `latest` | The version of the Dapr runtime to upgrade to, for example: `1.0.0` |
| `--set` | | | Set values on the command line (can specify multiple or separate values with commas: key1=val1,key2=val2) |

## Examples

### Upgrade Dapr in Kubernetes to latest version
```bash
dapr upgrade -k
```

### Upgrade specified version of Dapr runtime in Kubernetes
```bash
dapr upgrade -k --runtime-version 1.2
```

### Upgrade specified version of Dapr runtime in Kubernetes with value set
```bash
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```
# Related links

- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade.md >}})
