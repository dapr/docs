---
type: docs
title: "Dapr MCP server"
linkTitle: "Dapr MCP server"
weight: 40
description: "Expose Dapr building blocks to AI agents as Model Context Protocol tools"
aliases:
  - /developing-ai/mcp/mcp-server-overview/
---

{{% alert title="Alpha" color="warning" %}}
The Dapr MCP server is in **alpha**, starting at v0.0.1. Tool names, inputs, and configuration may change in a future release.
{{% /alert %}}

The Dapr MCP server ([`dapr/dapr-mcp-server`](https://github.com/dapr/dapr-mcp-server)) is a standalone [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server, written in Go, that runs next to a Dapr sidecar. It turns the sidecar's building blocks (state, pub/sub, bindings, secrets, service invocation, actors, distributed lock, cryptography, and conversation) into MCP tools that any MCP client can call: Claude Desktop, Cursor, Claude Code, VS Code, [Dapr Agents]({{% ref "/developing-ai/dapr-agents" %}}), or your own agent.

## How it differs from the rest of this section

The other pages in this section cover how the Dapr runtime connects agents to MCP servers you already have, either [through service invocation]({{% ref mcp-service-invocation.md %}}) or with the [`MCPServer` resource]({{% ref mcp-server-resource.md %}}). The Dapr MCP server works the other way round: it **is** an MCP server, and the tools it serves are Dapr APIs. It is a separate binary with its own release cycle, not a feature of `daprd`. The two fit together. You can run the Dapr MCP server as a Dapr app and reach it through the service invocation path, or declare it as an `MCPServer` resource like any other MCP server.

## When to use it

Use the Dapr MCP server when you want an agent to:

- Persist or read data through a Dapr state store, with transactions where the store supports them.
- Publish events, call other Dapr apps or actors, or reach external systems through output bindings.
- Coordinate with other workers using a distributed lock.
- Read secrets, encrypt or decrypt data, or hand a prompt to another LLM through a conversation component.

The agent gets the same component abstraction your services use, so swapping Redis for PostgreSQL or Kafka for RabbitMQ needs no change to the agent.

You don't need it for plain computation, one-off text generation, or local file and process access. Those don't need a Dapr sidecar.

## How it works

1. The server starts and connects to the Dapr sidecar over gRPC, using the standard Dapr SDK settings (`DAPR_GRPC_PORT`, `DAPR_GRPC_ENDPOINT`). It retries the connection up to five times, then exits.
2. It reads the sidecar's metadata and registers tools for each building block that has at least one component loaded. Three tools are always registered: `get_components`, `invoke_service`, and `invoke_actor_method`.
3. It serves MCP over **stdio** (the default, for local clients that launch the server themselves) or over **streamable HTTP** (with `--http`, for remote and shared deployments). Authentication, health endpoints, and CORS apply to the HTTP transport only.

Tools follow the components loaded in the sidecar, with no restart. When [component hot reloading]({{% ref "component-updates.md#hot-reloading" %}}) adds the first component of a type (for example the first pub/sub component), the server registers that type's tools the next time a client lists tools or calls `get_components`, and notifies connected clients that the tool list changed. Removing the last component of a type removes its tools. Clients that read the tool list only once, as many agent frameworks do, need to reconnect to see the change.

Every tool carries MCP safety annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) and a description that tells the model when to use it. The server's instructions tell the model to call `get_components` first and never to invent component names, keys, or topics.

## Security considerations

The server can do anything its Dapr sidecar can do, and it returns tool results, including secret values from `get_secret` and `get_bulk_secrets`, to the model. Limit what the sidecar can reach:

- Load only the components the agent needs, and use [component scopes]({{% ref component-scopes.md %}}) and [secret scopes]({{% ref secrets-scopes.md %}}) to narrow access further.
- Turn on [authentication]({{% ref dapr-mcp-server-authentication.md %}}) whenever you serve over HTTP to anything other than localhost.
- Treat tools marked destructive (`delete_state`, `execute_transaction`, `invoke_service`, `invoke_actor_method`, `invoke_output_binding`, `encrypt_data`) as needing human confirmation in your MCP client.

## Next steps

- [Getting started]({{% ref dapr-mcp-server-getting-started.md %}}): install, run with a sidecar, and connect a client
- [Configuration reference]({{% ref dapr-mcp-server-configuration.md %}}): every flag and environment variable
- [Authentication]({{% ref dapr-mcp-server-authentication.md %}}): OIDC, SPIFFE, Dapr Sentry, and hybrid modes
- [Tool reference]({{% ref dapr-mcp-server-tool-reference.md %}}): every tool, its inputs, and its safety properties
- [Observability]({{% ref dapr-mcp-server-observability.md %}}): traces, metrics, logs, and health endpoints
