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
| `--publish-app-id` | `-i`| | The id for publishing application
| `--pubsub` | `-p` | | The name of the pub/sub component
| `--topic`, `-t` | | | The topic to be published to |
| `--data`, `-d` | | | The JSON serialized string (optional) |
| `--help`, `-h` | | | Print this help message |
