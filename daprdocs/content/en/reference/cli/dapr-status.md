---
type: docs
title: "status CLI command reference"
linkTitle: "status"
description: "Detailed information on the status CLI command"
---

## Description

Shows the Dapr system services (control plane) health status.

## Usage

```bash
dapr status [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Help for status |
| `--kubernetes`, `-k` | | `true` | only works with a Kubernetes cluster (default true) |