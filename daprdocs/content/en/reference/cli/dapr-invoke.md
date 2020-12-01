---
type: docs
title: "invoke CLI command reference"
linkTitle: "invoke"
description: "Detailed information on the invoke CLI command"
---

## Description

Invoke a method on a given Dapr application

## Usage

```bash
dapr invoke [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id`, `-a` | | | The application id to invoke |
| `--help`, `-h` | | | Print this help message |
| `--method`, `-m` | | | The method to invoke |
| `--payload`, `-p` | | | The JSON payload (optional) |
| `--verb`, `-v` | | `POST` | The HTTP verb to use |
