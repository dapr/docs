---
type: docs
title: "DaprMCPClient"
linkTitle: "DaprMCPClient"
weight: 20
description: "Connect to MCPServer resources yourself and pass their tools to an agent"
---

`DaprMCPClient` lets you connect to `MCPServer` resources yourself instead of relying on [tool discovery]({{% ref mcp-tool-discovery.md %}}). Use it when you want to choose which servers an agent connects to, or build the agent's tool list yourself.

`DaprMCPClient` is part of the Dapr Python SDK (`pip install "dapr[workflow]"`, v1.19 or later), not Dapr Agents. It doesn't open a connection to the MCP server. Instead, it asks the Dapr sidecar to run Dapr's built-in MCP workflows, so the sidecar handles retries, timeouts, and authentication.

## Connect and list tools

{{< tabpane text=true >}}

{{% tab header="Sync" %}}
```python
from dapr.ext.workflow import DaprMCPClient

client = DaprMCPClient(timeout_in_seconds=30)
client.connect("weather")

for tool in client.get_all_tools():
    print(tool.name, tool.description)
```
{{% /tab %}}

{{% tab header="Async" %}}
```python
from dapr.ext.workflow.aio import DaprMCPClient

client = DaprMCPClient(timeout_in_seconds=30)
await client.connect("weather")

for tool in client.get_all_tools():
    print(tool.name, tool.description)
```
{{% /tab %}}

{{< /tabpane >}}

`connect()` takes the name of an `MCPServer` resource (its `metadata.name`), asks the sidecar for that server's tool list, and keeps the result. It raises a `RuntimeError` if the request fails or doesn't finish in time. In async code, `connect()` is a coroutine you `await`.

| Method | Returns |
|--------|---------|
| `connect(mcpserver_name)` | Nothing. Loads and keeps the server's tools. |
| `get_all_tools()` | Tools from every connected server. |
| `get_server_tools(server_name)` | Tools from one server. |
| `get_connected_servers()` | Names of the servers connected so far. |

The constructor takes these keyword arguments:

| Argument | Default | Description |
|----------|---------|-------------|
| `timeout_in_seconds` | `60` | How long to wait for each server to return its tool list. |
| `allowed_tools` | `None` | Set of tool names to keep. `None` keeps every tool. |
| `wf_client` | `None` | An existing `DaprWorkflowClient` to use. If you don't pass one, the client creates its own. |

## Pass the tools to an agent

The client returns `MCPToolDef` objects, which don't depend on any agent framework. Convert them with `mcp_tool_def_to_workflow_tool` and pass them to the agent.

Also pass `AgentMCPConfig(enabled=False)`. Otherwise [tool discovery]({{% ref mcp-tool-discovery.md %}}) still runs and adds the tools from every `MCPServer` resource, not only the ones you picked.

```python
from dapr.ext.workflow import DaprMCPClient

from dapr_agents import DurableAgent
from dapr_agents.agents.configs import AgentMCPConfig
from dapr_agents.tool.mcp import mcp_tool_def_to_workflow_tool

client = DaprMCPClient(timeout_in_seconds=30)
client.connect("weather")
tools = [mcp_tool_def_to_workflow_tool(t) for t in client.get_all_tools()]

agent = DurableAgent(
    name="WeatherAgent",
    role="Weather assistant",
    instructions=["Use the weather tools to answer questions."],
    tools=tools,
    mcp=AgentMCPConfig(enabled=False),
)
```

When the LLM calls one of these tools, the agent runs the call as a workflow inside its own workflow, so the call survives a crash like the rest of the agent's work.

## Next steps

- Try the [Dapr Agents MCPServer quickstart](https://github.com/dapr/dapr-agents/tree/main/examples/10-mcpserver).
- To see what the `ListTools` and `CallTool` workflows return, see [How-To: Use MCPServer resources]({{% ref howto-use-mcpserver.md %}}).
