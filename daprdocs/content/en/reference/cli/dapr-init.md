---
type: docs
title: "init CLI command reference"
linkTitle: "init"
description: "Detailed information on the init CLI command"
---

## Description

Install Dapr on supported hosting platforms. Supported platforms: Kubernetes and self-hosted

## Usage
```bash
dapr init [flags]
```

## Examples

### Initialize Dapr in self-hosted mode
```bash
dapr init
```

### Initialize Dapr in Kubernetes
```bash
dapr init -k
```

### Initialize Dapr in slim self-hosted mode
```bash
dapr init -s
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--enable-ha` | | `false` | Enable high availability (HA) mode |
| `--enable-mtls` | | `true` | Enable mTLS in your cluster |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | Deploy Dapr to a Kubernetes cluster |
| `--namespace`, `-n` | | `dapr-system` | The Kubernetes namespace to install Dapr in |
| `--network` | `DAPR_NETWORK` | | The Docker network on which to deploy the Dapr runtime |
| `--redis-host` | `DAPR_REDIS_HOST` | `localhost` | The host on which the Redis service resides |
| `--runtime-version` | | `latest` | The version of the Dapr runtime to install, for example: `1.0.0` |
| `--slim`, `-s` | | `false` | Exclude placement service, Redis and Zipkin containers from self-hosted installation |
