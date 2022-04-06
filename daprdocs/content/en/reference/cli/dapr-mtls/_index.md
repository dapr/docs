---
type: docs
title: "mtls CLI command reference"
linkTitle: "mtls"
description: "Detailed information on the mtls CLI command"
---

### Description

Check if mTLS is enabled.

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls [flags]
dapr mtls [command]
```

### Flags

| Name                 | Environment Variable | Default | Description                                      |
| -------------------- | -------------------- | ------- | ------------------------------------------------ |
| `--help`, `-h`       |                      |         | Print this help message                          |
| `--kubernetes`, `-k` |                      | `false` | Check if mTLS is enabled in a Kubernetes cluster |

### Available Commands

```txt
expiry              Checks the expiry of the root Certificate Authority (CA) certificate
export              Export the root Certificate Authority (CA), issuer cert and issuer key to local files
renew-certificate   Rotates the existing root Certificate Authority (CA), issuer cert and issuer key
```

### Command Reference

You can learn more about each sub command from the links below.

- [`dapr mtls expiry`]({{< ref dapr-mtls-expiry.md >}})
- [`dapr mtls export`]({{< ref dapr-mtls-export.md >}})
- [`dapr mtls renew-certificate`]({{< ref dapr-mtls-renew-certificate.md >}})

### Examples

```bash
# Check if mTLS is enabled on the Kubernetes cluster
dapr mtls -k
```

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```