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

### List Kubernetes components
```bash
dapr components -k
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | List all Dapr configurations in a Kubernetes cluster |
