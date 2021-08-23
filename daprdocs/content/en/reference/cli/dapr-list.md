---
type: docs
title: "list CLI command reference"
linkTitle: "list"
description: "Detailed information on the list CLI command"
---

## Description

List all Dapr instances.

## Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

## Usage
```bash
dapr list [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--all-namespaces`, `-A` | | `false` | List all Dapr pods in all namespaces |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | List all Dapr pods in a Kubernetes cluster |
| `--namespace`, `-n` | | `default` | List define namespace pods in a Kubernetes cluster |
| `--output`, `-o` | | `table` | The output format of the list. Valid values are: `json`, `yaml`, or `table`

## Examples

### List Dapr instances in self-hosted mode
```bash
dapr list
```

### List Dapr instances in Kubernetes mode
```bash
dapr list -k
```

### List Dapr instances in JSON format
```bash
dapr list -o json
```
