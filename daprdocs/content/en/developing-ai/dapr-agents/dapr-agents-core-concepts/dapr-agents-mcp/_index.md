---
type: docs
title: "MCP in Dapr Agents"
linkTitle: "MCP"
weight: 10
description: "Learn how Dapr Agents loads and calls Model Context Protocol (MCP) tools"
---

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is a standard way for an application to discover and call tools that run in a separate server. Dapr Agents gives those tools to a `DurableAgent`, so the LLM can call them like any other tool.

Dapr Agents doesn't connect to MCP servers itself. It goes through the [Dapr sidecar]({{% ref sidecar.md %}}), the Dapr process that runs next to your app. You describe each server once as an [MCPServer resource]({{% ref mcp-server-resource.md %}}), and the sidecar handles the connection, retries, timeouts, and authentication. Each tool call runs as a [Dapr workflow]({{% ref workflow-overview.md %}}), so if your app crashes in the middle of a call, the call picks up where it left off when the app restarts.

## Loading MCP tools into an agent

There are two ways to load MCP tools into an agent:

| Approach | When to use it |
|----------|----------------|
| [Tool discovery]({{% ref mcp-tool-discovery.md %}}) | The default. A `DurableAgent` loads tools from every `MCPServer` resource the sidecar has loaded. You don't write any client code. |
| [DaprMCPClient]({{% ref dapr-mcp-client.md %}}) | You want to choose which servers to connect to, or build the agent's tool list yourself. |

The older [MCPClient]({{% ref mcp-client.md %}}) connects to MCP servers directly from the agent process and is deprecated.

## Prerequisites

- [Dapr CLI and runtime installed]({{% ref install-dapr-selfhost.md %}}).
- Dapr Agents v1.1.0 or later (`pip install dapr-agents`).

## Next steps

- To learn how the `MCPServer` resource works outside Dapr Agents, see the [MCP documentation]({{% ref "developing-ai/mcp" %}}).
- Try the [Dapr Agents MCPServer quickstart](https://github.com/dapr/dapr-agents/tree/main/examples/10-mcpserver).
