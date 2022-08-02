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

| Name                         | Environment Variable | Default                                                      | Description                                           |
| ---------------------------- | -------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `--publish-app-id`, `-i`     |                      | The ID that represents the app from which you are publishing |
| `--pubsub`, `-p`             |                      | The name of the pub/sub component                            |
| `--topic`, `-t`              |                      |                                                              | The topic to be published to                          |
| `--data`, `-d`               |                      |                                                              | The JSON serialized string (optional)                 |
| `--data-file`, `-f`          |                      |                                                              | A file containing the JSON serialized data (optional) |
| `--help`, `-h`               |                      |                                                              | Print this help message                               |
| `--metadata`, `-m`           |                      |                                                              | A JSON serialized publish metadata (optional)         |
| `--unix-domain-socket`, `-u` |                      |                                                              | The path to the unix domain socket (optional)         |


### Examples

```bash
# Publish to sample topic in target pubsub via a publishing app
dapr publish --publish-app-id appId --topic sample --pubsub target --data '{"key":"value"}'

# Publish to sample topic in target pubsub via a publishing app using Unix domain socket
dapr publish --enable-domain-socket --publish-app-id myapp --pubsub target --topic sample --data '{"key":"value"}'

# Publish to sample topic in target pubsub via a publishing app without cloud event
dapr publish --publish-app-id myapp --pubsub target --topic sample --data '{"key":"value"}' --metadata '{"rawPayload":"true"}'
```
