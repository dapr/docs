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
| `--all`              |                      | `false`       | Remove Redis, Zipkin containers in addition to the Scheduler service and the actor Placement service containers. Remove default Dapr dir located at `$HOME/.dapr or %USERPROFILE%\.dapr\`. |
| `--help`, `-h`       |                      |               | Print this help message                                                                                                                             |
| `--kubernetes`, `-k` |                      | `false`       | Uninstall Dapr from a Kubernetes cluster                                                                                                            |
| `--namespace`, `-n`  |                      | `dapr-system` | The Kubernetes namespace from which Dapr is uninstalled                                                                                                     |
|  `--container-runtime`  |              |    `docker`      | Used to pass in a different container runtime other than Docker. Supported container runtimes are: `docker`, `podman` |

### Examples

#### Uninstall from self-hosted mode

```bash
dapr uninstall
```

You can also use option `--all` to remove .dapr directory, Redis, Placement, Scheduler, and Zipkin containers

```bash
dapr uninstall --all
```

You can specify a different container runtime while setting up Dapr. If you omit the `--container-runtime` flag, the default container runtime is Docker.

```bash
dapr uninstall --all --container-runtime podman
```

#### Uninstall from Kubernetes

```bash
dapr uninstall -k
```
