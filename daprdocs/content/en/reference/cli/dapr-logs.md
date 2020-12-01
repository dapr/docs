---
type: docs
title: "logs CLI command reference"
linkTitle: "logs"
description: "Detailed information on the logs CLI command"
---

## Description

Gets Dapr sidecar logs for an app in Kubernetes

## Usage

```bash
dapr logs [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id`, `-a` | | | The application id for which logs are needed |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `true` | Get logs from a Kubernetes cluster |
| `--namespace`, `-n` | | `default` | The Kubernetes namespace in which your application is deployed |
| `--pod-name`, `-p` | | | The name of the pod in Kubernetes, in case your application has multiple pods (optional) |
