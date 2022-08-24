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
|  `--container-runtime`  |              |    docker      | It is used to pass in a different container runtime other than docker. Supported container runtime are docker/podman|

### Examples

#### Uninstall from self-hosted mode

```bash
dapr uninstall
```

You can also use option `--all` to remove .dapr directory, Redis, Placement and Zipkin containers

```bash
dapr uninstall --all
```

You can specify a different container runtime while uninstalling dapr. If you omit this flag then default container runtime is docker.

```bash
dapr uninstall --all --container-runtime podman
```

#### Uninstall from Kubernetes

```bash
dapr uninstall -k
```
