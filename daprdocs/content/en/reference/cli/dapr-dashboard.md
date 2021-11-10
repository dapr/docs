---
type: docs
title: "dashboard CLI command reference"
linkTitle: "dashboard"
description: "Detailed information on the dashboard CLI command"
---

### Description

Start [Dapr dashboard](https://github.com/dapr/dashboard).

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr dashboard [flags]
```

### Flags

| Name                 | Environment Variable | Default       | Description                                                                 |
| -------------------- | -------------------- | ------------- | --------------------------------------------------------------------------- |
| `--address`, `-a`    |                      | `localhost`   | Address to listen on. Only accepts IP address or localhost as a value       |
| `--help`, `-h`       |                      |               | Prints this help message                                                    |
| `--kubernetes`, `-k` |                      | `false`       | Opens Dapr dashboard in local browser via local proxy to Kubernetes cluster |
| `--namespace`, `-n`  |                      | `dapr-system` | The namespace where Dapr dashboard is running                               |
| `--port`, `-p`       |                      | `8080`        | The local port on which to serve Dapr dashboard                             |
| `--version`, `-v`    |                      | `false`       | Print the version for Dapr dashboard                                        |

### Examples

```bash
# Start dashboard locally
dapr dashboard

# Start dashboard service locally on a specified port
dapr dashboard -p 9999

# Port forward to dashboard service running in Kubernetes
dapr dashboard -k

# Port forward to dashboard service running in Kubernetes on all addresses on a specified port
dapr dashboard -k -p 9999 --address 0.0.0.0

# Port forward to dashboard service running in Kubernetes on a specified port
dapr dashboard -k -p 9999
```
