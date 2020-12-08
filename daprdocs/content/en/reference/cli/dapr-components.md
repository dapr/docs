---
type: docs
title: "components CLI command reference"
linkTitle: "components"
description: "Detailed information on the components CLI command"
---

## Description

List all Dapr components. Supported platforms: Kubernetes

## Usage

```bash
dapr components [flags]
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
| `--kubernetes`, `-k` | | `false` | List all Dapr components in a Kubernetes cluster |
