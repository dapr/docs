---
type: docs
title: "mtls export CLI command reference"
linkTitle: "mtls export"
description: "Detailed information on the mtls export CLI command"
weight: 1000
---

### Description

Export the root CA, issuer cert and key from Kubernetes to local files

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls export [flags]
```

### Flags

| Name           | Environment Variable | Default           | Description                                 |
| -------------- | -------------------- | ----------------- | ------------------------------------------- |
| `--help`, `-h` |                      |                   | help for export                             |
| `--out`, `-o`  |                      | current directory | The output directory path to save the certs |

### Examples

```bash
# Check expiry of Kubernetes certs
dapr mtls export -o ./certs
```
