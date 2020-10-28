---
type: docs
title: "dashboard CLI command reference"
linkTitle: "dashboard"
description: "Detailed information on the dashboard CLI command"
---

## Description

Start Dapr dashboard.

## Usage

```bash
dapr dashboard [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Help for dashboard |
| `--kubernetes`, `-k` | | `false` | Start Dapr dashboard in local browser |
| `--version`, `-v` | | `false` | Check Dapr dashboard version |
| `--port`, `-p` | | `8080` | The local port on which to serve dashboard |
| `--namespace`, `-n` | | `dapr-system` | The namespace where Dapr dashboard is running |
