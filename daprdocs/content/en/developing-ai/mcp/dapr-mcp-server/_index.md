---
type: docs
title: "Dapr MCP server"
linkTitle: "Dapr MCP server"
weight: 30
description: "A production-ready Model Context Protocol (MCP) server that exposes Dapr's building blocks as MCP tools for AI agents"
---

The [`dapr-mcp-server`](https://github.com/dapr/dapr-mcp-server) project is a production-ready MCP server that exposes Dapr's state, pub/sub, secrets, bindings, actors, service invocation, distributed lock, cryptography, and conversation building blocks as MCP tools. Point any MCP-compatible client (Claude Desktop, Claude Code, Cursor, VS Code, Dapr Agents) at it and your agents get a curated, safety-classified tool surface over your whole Dapr runtime.

- [**Server overview**]({{% ref mcp-server-overview.md %}}) — what the server is, how it fits alongside the Dapr sidecar, when to use it.
- [**Getting started**]({{% ref mcp-server-getting-started.md %}}) — install, configure components, make your first tool call, full environment-variable reference.
- [**Tool reference**]({{% ref mcp-server-tool-reference.md %}}) — schemas, inputs, outputs, and safety classifications for all 18 tools.
- [**Integrations**]({{% ref mcp-server-integrations.md %}}) — Claude Desktop, Claude Code, VS Code, Cursor, Dapr Agents, and custom MCP clients.
