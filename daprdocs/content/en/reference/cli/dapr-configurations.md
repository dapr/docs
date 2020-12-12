---
type: docs
title: "configurations CLI command reference"
linkTitle: "configurations"
description: "Detailed information on the configurations CLI command"
---

## Description

List all Dapr configurations. Supported platforms: Kubernetes

## Usage

```bash
dapr configurations [flags]
```

## Examples

### List Kubernetes Dapr configurations
```bash
dapr configurations -k
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--kubernetes`, `-k` | | `false` | List all Dapr configurations in a Kubernetes cluster 
| `--name`, `-n` | | | The configuration name to be printed (optional)
| `--output`, `-o` | | `list`| Output format (options: json or yaml or list)
| `--help`, `-h` | | | Print this help message |
|
