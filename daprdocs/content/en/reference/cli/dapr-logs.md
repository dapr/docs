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
| `--app-id`, `-a` | | | The app id for which logs are needed |
| `--help`, `-h` | | | Help for logs |
| `--kubernetes`, `-k` | | `true` | only works with a Kubernetes cluster (default true) |
| `--namespace`, `-n` | | `default` | (optional) Kubernetes namespace in which your application is deployed. default value is 'default' |
| `--pod-name`, `-p` | | | (optional) Name of the Pod. Use this in case you have multiple app instances (Pods) |
