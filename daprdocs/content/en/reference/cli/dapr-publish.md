---
type: docs
title: "publish CLI command reference"
linkTitle: "publish"
description: "Detailed information on the publish CLI command"
---

### Description

Publish a pub-sub event.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

### Usage

```bash
dapr publish [flags]
```

### Flags

| Name                     | Environment Variable | Default                                                      | Description                                           |
| ------------------------ | -------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `--publish-app-id`, `-i` |                      | The ID that represents the app from which you are publishing |
| `--pubsub`, `-p`         |                      | The name of the pub/sub component                            |
| `--topic`, `-t`          |                      |                                                              | The topic to be published to                          |
| `--data`, `-d`           |                      |                                                              | The JSON serialized string (optional)                 |
| `--data-file`, `-f`      |                      |                                                              | A file containing the JSON serialized data (optional) |
| `--help`, `-h`           |                      |                                                              | Print this help message                               |


### Examples

```bash
# Publish to sample topic in target pubsub
dapr publish --publish-app-id appId --topic sample --pubsub target --data '{"key":"value"}'
```
