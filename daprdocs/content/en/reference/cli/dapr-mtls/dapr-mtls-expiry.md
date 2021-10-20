---
type: docs
title: "mtls expiry CLI command reference"
linkTitle: "mtls expiry"
description: "Detailed information on the mtls expiry CLI command"
weight: 2000
---

### Description

Checks the expiry of the root certificate

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls expiry [flags]
```

### Flags

| Name           | Environment Variable | Default | Description     |
| -------------- | -------------------- | ------- | --------------- |
| `--help`, `-h` |                      |         | help for expiry |

### Examples

```bash
# Check expiry of Kubernetes certs
dapr mtls expiry
```
