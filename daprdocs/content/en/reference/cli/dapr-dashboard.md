---
type: docs
title: "dashboard CLI command reference"
linkTitle: "dashboard"
description: "Detailed information on the dashboard CLI command"
---

## Description

Start Dapr dashboard

## Usage

```bash
dapr dashboard [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Prints this help message |
| `--kubernetes`, `-k` | | `false` | Opens Dapr dashboard in local browser via local proxy to Kubernetes cluster |
| `--namespace`, `-n` | | `dapr-system` | The namespace where Dapr dashboard is running |
| `--port`, `-p` | | `8080` | The local port on which to serve Dapr dashboard |
| `--version`, `-v` | | `false` | Print the version for Dapr dashboard |
