---
type: docs
title: "uninstall CLI command reference"
linkTitle: "uninstall"
description: "Detailed information on the uninstall CLI command"
---

## Description

Uninstall Dapr runtime

## Usage

```bash
dapr uninstall [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--all` | | `false` | Remove Redis, Zipkin containers in addition to actor placement container. Remove default dapr dir located at `$HOME/.dapr or %USERPROFILE%\.dapr\`. |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | Uninstall Dapr from a Kubernetes cluster |
| `--namespace`, `-n` | | `dapr-system` | The Kubernetes namespace to uninstall Dapr from |
| `--network` | `DAPR_NETWORK` | | The Docker network from which to remove the Dapr runtime |
