---
type: docs
title: "uninstall CLI command reference"
linkTitle: "uninstall"
description: "Detailed information on the uninstall CLI command"
---

### Description

Uninstall Dapr runtime.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr uninstall [flags]
```

### Flags

| Name                 | Environment Variable | Default       | Description                                                                                                                                         |
| -------------------- | -------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--all`              |                      | `false`       | Remove Redis, Zipkin containers in addition to actor placement container. Remove default dapr dir located at `$HOME/.dapr or %USERPROFILE%\.dapr\`. |
| `--help`, `-h`       |                      |               | Print this help message                                                                                                                             |
| `--kubernetes`, `-k` |                      | `false`       | Uninstall Dapr from a Kubernetes cluster                                                                                                            |
| `--namespace`, `-n`  |                      | `dapr-system` | The Kubernetes namespace to uninstall Dapr from                                                                                                     |

### Examples

#### Uninstall from self-hosted mode

```bash
dapr uninstall
```

You can also use option `--all` to remove .dapr directory, Redis, Placement and Zipkin containers

```bash
dapr uninstall --all
```

#### Uninstall from Kubernetes

```bash
dapr uninstall -k
```
