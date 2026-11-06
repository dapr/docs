---
type: docs
title: "MCPClient (deprecated)"
linkTitle: "MCPClient (Deprecated)"
weight: 30
description: "Learn what the deprecated MCPClient does and how to move to DaprMCPClient"
---

{{% alert title="Deprecated" color="warning" %}}
`MCPClient` is deprecated and shows a `DeprecationWarning` when you create it. Use [tool discovery]({{% ref mcp-tool-discovery.md %}}) or [DaprMCPClient]({{% ref dapr-mcp-client.md %}}) instead.
{{% /alert %}}

`MCPClient` connects to an MCP server directly from the agent process, without
going through the Dapr sidecar. Because of that, it doesn't get the sidecar's
retries, timeouts, and authentication. `DaprMCPClient` sends the same calls
through the sidecar, which handles all three.

`MCPClient` has a connect method for each common transport:

| Method                      | Transport                                |
| --------------------------- | ---------------------------------------- |
| `connect_stdio()`           | Starts the server as a local subprocess. |
| `connect_sse()`             | Server-Sent Events over HTTP.            |
| `connect_streamable_http()` | Streamable HTTP.                         |

{{< tabpane text=true >}}

{{% tab header="Streamable HTTP" %}}
```python
import asyncio

from dapr_agents.tool.mcp import MCPClient


async def main() -> None:
    client = MCPClient()
    await client.connect_streamable_http(server_name="local", url="http://localhost:8000/mcp/")
    tools = client.get_all_tools()
    await client.close()


asyncio.run(main())
```
{{% /tab %}}

{{% tab header="SSE" %}}
```python
import asyncio

from dapr_agents.tool.mcp import MCPClient


async def main() -> None:
    client = MCPClient()
    await client.connect_sse(server_name="local", url="http://localhost:8000/sse")
    tools = client.get_all_tools()
    await client.close()


asyncio.run(main())
```
{{% /tab %}}

{{% tab header="stdio" %}}
```python
import asyncio

from dapr_agents.tool.mcp import MCPClient


async def main() -> None:
    client = MCPClient()
    await client.connect_stdio(
        server_name="fetch",
        command="uvx",
        args=["mcp-server-fetch"],
    )
    tools = client.get_all_tools()
    await client.close()


asyncio.run(main())
```
{{% /tab %}}

{{< /tabpane >}}

## Move to DaprMCPClient

1. Define an [MCPServer resource]({{% ref mcp-server-resource.md %}}) for each
   server you connect to. Its `spec.endpoint` holds the URL or command you pass
   to `MCPClient` today.
1. Run your app with `dapr run --resources-path`, pointing at the folder that
   contains the resource.
1. Remove the `MCPClient` code. Either let the agent load the tools through
   [tool discovery]({{% ref mcp-tool-discovery.md %}}), or load them with
   [DaprMCPClient]({{% ref dapr-mcp-client.md %}}).
