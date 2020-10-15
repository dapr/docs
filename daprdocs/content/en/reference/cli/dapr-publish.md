---
type: docs
title: "publish CLI command reference"
linkTitle: "publish"
description: "Detailed information on the publish CLI command"
---

## Description

Publish an event to multiple consumers

## Usage

```bash
dapr publish [flags]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--data`, `-d` | | | (optional) a json serialized string |
| `--help`, `-h` | | | Help for publish |
| `--topic`, `-t` | | | The topic the app is listening on |