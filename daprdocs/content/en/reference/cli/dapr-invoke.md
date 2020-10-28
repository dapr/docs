---
type: docs
title: "invoke CLI command reference"
linkTitle: "invoke"
description: "Detailed information on the invoke CLI command"
---

## Description

Invokes a Dapr app with an optional payload (deprecated, use invokePost)

## Usage

```bash
dapr invoke [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id`, `-a` | | | The app ID to invoke |
| `--help`, `-h` | | | Help for invoke |
| `--method`, `-m` | | | The method to invoke |
| `--payload`, `-p` | | | (optional) a json payload |
