---
type: docs
title: "Connecting MCP clients to dapr-mcp-server"
linkTitle: "Integrations"
weight: 40
description: "Wiring dapr-mcp-server into Claude Desktop, Claude Code, VS Code, Cursor, Dapr Agents, and custom clients"
---

`dapr-mcp-server` speaks two transports — **stdio** for IDE integrations and **streamable HTTP** for remote or shared deployments. This page shows how to wire each of the common MCP clients to either.

Assumes you have already completed the [Getting started]({{% ref mcp-server-getting-started.md %}}) walk-through. The binary is on your `PATH` and Dapr components are configured under `./resources`.

## Claude Desktop

Claude Desktop launches MCP servers as stdio subprocesses, so you need a wrapper command that starts Dapr + the server together.

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%AppData%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "dapr": {
      "command": "dapr",
      "args": [
        "run",
        "--app-id", "dapr-mcp-server",
        "--resources-path", "/absolute/path/to/resources",
        "--",
        "dapr-mcp-server"
      ]
    }
  }
}
```

Restart Claude Desktop. The `dapr` server should appear in the tool picker; hovering it shows the list of registered tools.

**Tip:** use absolute paths everywhere in this file. Claude Desktop does not inherit your shell's working directory.

## Claude Code (CLI)

Claude Code can register MCP servers with a single command:

```bash
claude mcp add dapr -- dapr run \
  --app-id dapr-mcp-server \
  --resources-path "$(pwd)/resources" \
  -- dapr-mcp-server
```

After restart, run `claude mcp list` to confirm `dapr` is healthy.

For a remote HTTP instance, use the `--transport http` form:

```bash
claude mcp add dapr --transport http --url https://dapr-mcp.example.com/
```

## VS Code + GitHub Copilot

VS Code's agent mode discovers MCP servers from `.vscode/mcp.json` in the workspace (or `~/.config/Code/User/mcp.json` globally). Create the file:

```json
{
  "servers": {
    "dapr": {
      "type": "stdio",
      "command": "dapr",
      "args": [
        "run",
        "--app-id", "dapr-mcp-server",
        "--resources-path", "${workspaceFolder}/resources",
        "--",
        "dapr-mcp-server"
      ]
    }
  }
}
```

Reload the window. The Copilot chat will list `dapr-mcp-server` tools under "Available tools".

## Cursor

Cursor uses `.cursor/mcp.json` at the project root (or `~/.cursor/mcp.json` for global):

```json
{
  "mcpServers": {
    "dapr": {
      "command": "dapr",
      "args": [
        "run",
        "--app-id", "dapr-mcp-server",
        "--resources-path", "./resources",
        "--",
        "dapr-mcp-server"
      ]
    }
  }
}
```

Restart Cursor, open Settings → MCP, and confirm the server is in the "Connected" list.

## Dapr Agents (Python)

[Dapr Agents]({{% ref "../../dapr-agents" %}}) consumes MCP servers natively via `dapr_agents.tool.mcp.MCPClient`. Run `dapr-mcp-server` with HTTP transport, then point the agent at it:

```bash
# terminal 1 — the MCP server
dapr run --app-id dapr-mcp-server \
         --resources-path resources \
         -- dapr-mcp-server --http localhost:8088
```

```python
# terminal 2 — the agent
import asyncio
from dapr_agents import DurableAgent
from dapr_agents.tool.mcp import MCPClient
from dapr_agents.llm import DaprChatClient

async def load_mcp_tools() -> list:
    client = MCPClient()
    await client.connect_sse("dapr", url="http://localhost:8088")
    return client.get_all_tools()

def main() -> None:
    tools = asyncio.run(load_mcp_tools())

    agent = DurableAgent(
        name="Steve",
        role="Expert Dapr Microservices Client",
        goal=(
            "Translate user intents into precise, deterministic, and safe MCP tool calls. "
            "Do not invent component names, keys, topics, or arguments — discover them via "
            "the 'get_components' tool."
        ),
        instructions=[
            "Always use available MCP tools to satisfy user requests when appropriate.",
            "Break complex tasks (e.g. 'encrypt and save') into sequential tool calls.",
            "Heed ReadOnlyHint / DestructiveHint in the tool schema before executing.",
            "On error, parse the message and correct the request; do not ask the user.",
        ],
        llm=DaprChatClient(component_name="llm-provider"),
        tools=tools,
    )
    agent.start()

if __name__ == "__main__":
    main()
```

The full reference implementation — with pub/sub, durable memory, and OpenTelemetry tracing — lives at [`test/app.py`](https://github.com/dapr/dapr-mcp-server/blob/main/test/app.py) in the server's repository.

## Custom MCP clients

Any MCP-compliant client works. Minimal Node example using `@modelcontextprotocol/sdk`:

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:8080/"),
);
const client = new Client({ name: "my-agent", version: "0.1.0" }, { capabilities: {} });
await client.connect(transport);

const tools = await client.listTools();
console.log(tools.tools.map((t) => t.name));
//   → ['get_components', 'invoke_service', 'invoke_actor_method', 'save_state', ...]

const result = await client.callTool({
  name: "get_components",
  arguments: {},
});
console.log(result.content);
```

For other languages, see the [MCP SDK list](https://modelcontextprotocol.io/introduction#sdks) on the protocol site.

## Securing the connection

All of the examples above assume the server is running unauthenticated on `localhost`. For any non-local deployment:

1. Run the server with `--http` and front it with the transport (TLS) of your choice.
2. Turn on authentication — see [MCP authentication]({{% ref mcp-authentication.md %}}) for OIDC, SPIFFE, and Dapr Sentry walk-throughs.
3. Pass the bearer token / certificate from your MCP client according to its own configuration (Claude Desktop and Claude Code both support `headers` blocks in recent versions).

## Related

- [Overview]({{% ref mcp-server-overview.md %}})
- [Getting started]({{% ref mcp-server-getting-started.md %}})
- [Tool reference]({{% ref mcp-server-tool-reference.md %}})
- [Authentication]({{% ref mcp-authentication.md %}})
