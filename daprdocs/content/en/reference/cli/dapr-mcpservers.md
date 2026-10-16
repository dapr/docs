---
type: docs
title: "mcpservers CLI command reference"
linkTitle: "mcpservers"
description: "Detailed information on the mcpservers CLI command"
---

### Description

List all Dapr MCPServer resources.

### Supported platforms

- [Kubernetes]({{% ref kubernetes %}})
- [Self-Hosted]({{% ref self-hosted %}})

### Usage

```bash
dapr mcpservers [flags]
```

### Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--all-namespaces`, `-A` | | `false` | If true, list all Dapr MCPServer resources in all namespaces (Kubernetes mode only) |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | List Dapr MCPServer resources from a Kubernetes cluster |
| `--name`, `-n` | | | The MCPServer name to be printed (optional) |
| `--namespace` | | | List MCPServer resources in a specific Kubernetes namespace |
| `--output`, `-o` | | `list` | Output format (options: json or yaml or list) |
| `--resources-path` | | `$HOME/.dapr/components` | Self-hosted only: directory to scan for MCPServer YAML resources |

### Examples

```bash
# List all Dapr MCPServer resources in self-hosted mode (reads from ~/.dapr/components/ by default)
dapr mcpservers

# List MCPServer resources from a custom resources directory in self-hosted mode
dapr mcpservers --resources-path ./resources

# Print a specific MCPServer resource in self-hosted mode
dapr mcpservers -n my-mcp-server

# List all Dapr MCPServer resources in Kubernetes mode
dapr mcpservers -k

# List MCPServer resources in a specific namespace
dapr mcpservers -k --namespace default

# List MCPServer resources across all namespaces
dapr mcpservers -k --all-namespaces

# Output as JSON
dapr mcpservers -o json
```

### Related links

- [MCPServer resource specification]({{% ref mcpserver-schema.md %}})
- [How to: Expose an MCP server with Dapr]({{% ref howto-use-mcpserver.md %}})
