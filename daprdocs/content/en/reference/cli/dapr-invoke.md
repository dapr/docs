---
type: docs
title: "invoke CLI command reference"
linkTitle: "invoke"
description: "Detailed information on the invoke CLI command"
---

## Description

Invoke a method on a given Dapr application.

## Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

## Usage
```bash
dapr invoke [flags]
```

## Examples

### Invoke a sample method on target app with POST Verb
```bash 
dapr invoke --app-id target --method sample --data '{"key":"value"}'
```

### Invoke a sample method on target app with GET Verb
```bash
dapr invoke --app-id target --method sample --verb GET
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id`, `-a` | | | The application id to invoke |
| `--help`, `-h` | | | Print this help message |
| `--method`, `-m` | | | The method to invoke |
| `--data`, `-d` | | | The JSON serialized data string (optional) |
| `--verb`, `-v` | | `POST` | The HTTP verb to use |
