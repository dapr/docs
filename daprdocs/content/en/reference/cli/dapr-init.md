---
type: docs
title: "init CLI command reference"
linkTitle: "init"
description: "Detailed information on the init CLI command"
---

### Description

Install Dapr on supported hosting platforms.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr init [flags]
```

### Flags

| Name                 | Environment Variable | Default       | Description                                                                          |
| -------------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `--enable-ha`        |                      | `false`       | Enable high availability (HA) mode                                                   |
| `--enable-mtls`      |                      | `true`        | Enable mTLS in your cluster                                                          |
| `--help`, `-h`       |                      |               | Print this help message                                                              |
| `--kubernetes`, `-k` |                      | `false`       | Deploy Dapr to a Kubernetes cluster                                                  |
| `--wait`             |                      | `false`       | Wait for Kubernetes initialization to complete                                       |
| `--timeout`          |                      | `300`         | The wait timeout for the Kubernetes installation                                     |
| `--namespace`, `-n`  |                      | `dapr-system` | The Kubernetes namespace to install Dapr in                                          |
| `--runtime-version`  |                      | `latest`      | The version of the Dapr runtime to install, for example: `1.0.0`                     |
| `--slim`, `-s`       |                      | `false`       | Exclude placement service, Redis and Zipkin containers from self-hosted installation |

### Examples

#### Self-hosted environment

```bash
dapr init
```

You can also specify a specific runtime version. Be default, the latest version is used.

```bash
dapr init --runtime-version 1.4.0
```

Dapr can also run [Slim self-hosted mode]({{< ref self-hosted-no-docker.md >}}) without Docker.

```bash
dapr init -s
```

#### Kubernetes environment

```bash
dapr init -k
```

You can wait for the installation to complete its deployment with the `--wait` flag.
The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.

```bash
dapr init -k --wait --timeout 600
```

You can also specify a specific runtime version.

```bash
dapr init -k --runtime-version 1.4.0
```
