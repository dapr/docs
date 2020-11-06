---
type: docs
title: "status CLI command reference"
linkTitle: "status"
description: "Detailed information on the status CLI command"
---

## Description

Show the health status of Dapr services

## Usage

This command only works for Kubernetes mode.

```bash
dapr status -k
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | Show the health status of Dapr services on Kubernetes cluster |