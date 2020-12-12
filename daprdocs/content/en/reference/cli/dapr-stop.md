---
type: docs
title: "stop CLI command reference"
linkTitle: "stop"
description: "Detailed information on the stop CLI command"
---

## Description

Stop Dapr instances and their associated apps.

## Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

## Usage

```bash
dapr stop [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id`, `-a` | | | The application id to be stopped |
| `--help`, `-h` | | | Print this help message |

## Examples

### Stop Dapr application
```bash
dapr stop --app-id <ID>
```
