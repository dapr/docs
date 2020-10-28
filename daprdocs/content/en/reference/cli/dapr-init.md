---
type: docs
title: "init CLI command reference"
linkTitle: "init"
description: "Detailed information on the init CLI command"
---

## Description

Setup Dapr in Kubernetes or Standalone modes

## Usage

```bash
dapr init [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Help for init |
| `--kubernetes`, `-k` | | `false` | Deploy Dapr to a Kubernetes cluster |
| `--network` | `DAPR_NETWORK` | | The Docker network on which to deploy the Dapr runtime |
| `--runtime-version` | | `latest` | The version of the Dapr runtime to install, for example: `v0.1.0-alpha` |
| `--redis-host` | `DAPR_REDIS_HOST` | `localhost` | The host on which the Redis service resides |
| `--slim`, `-s` | | `false` | Initialize dapr in self-hosted mode without placement, redis and zipkin containers.|
