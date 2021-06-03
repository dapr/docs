---
type: docs
title: "init CLI command reference"
linkTitle: "init"
description: "Detailed information on the init CLI command"
---

## Description

Install Dapr on supported hosting platforms.

## Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

## Usage
```bash
dapr init [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--enable-ha` | | `false` | Enable high availability (HA) mode |
| `--enable-mtls` | | `true` | Enable mTLS in your cluster |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | Deploy Dapr to a Kubernetes cluster |
| `--wait` | | `false` | Wait for Kubernetes initialization to complete |
| `--timeout` | | `300` | The wait timeout for the Kubernetes installation |
| `--namespace`, `-n` | | `dapr-system` | The Kubernetes namespace to install Dapr in |
| `--network` | `DAPR_NETWORK` | | The Docker network on which to deploy the Dapr runtime |
| `--runtime-version` | | `latest` | The version of the Dapr runtime to install, for example: `1.0.0` |
| `--slim`, `-s` | | `false` | Exclude placement service, Redis and Zipkin containers from self-hosted installation |

## Examples

### Initialize Dapr in self-hosted mode
```bash
dapr init
```

### Initialize Dapr in Kubernetes
```bash
dapr init -k
```

### Initialize Dapr in Kubernetes and wait for the installation to complete

 You can wait for the installation to complete its deployment with the `--wait` flag.

 The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.
```bash
dapr init -k --wait --timeout 600
```

### Initialize specified version of Dapr runtime in self-hosted mode
```bash
dapr init --runtime-version 0.10.0
```

### Initialize specified version of Dapr runtime in Kubernetes
```bash
dapr init -k --runtime-version 0.10.0
```

### Initialize Dapr in [slim self-hosted mode]({{< ref self-hosted-no-docker.md >}})
```bash
dapr init -s
```
