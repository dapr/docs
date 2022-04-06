---
type: docs
title: "mtls export CLI command reference"
linkTitle: "mtls export"
description: "Detailed information on the mtls export CLI command"
weight: 1000
---

### Description

Export the root Certificate Authority (CA), issuer cert and issuer key to local files

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

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```