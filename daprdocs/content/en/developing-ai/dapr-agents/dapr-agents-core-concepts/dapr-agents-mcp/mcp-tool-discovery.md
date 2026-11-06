---
type: docs
title: "Tool discovery"
linkTitle: "Tool discovery"
weight: 10
description: "Learn how a DurableAgent loads tools from MCPServer resources automatically"
---

Tool discovery is the default way a `DurableAgent` gets MCP tools. You tell Dapr which MCP servers exist, and the agent finds their tools on its own, so you don't write any MCP client code.

## How tool discovery works

1. When you create the agent, it asks the Dapr sidecar which `MCPServer` resources are loaded.
1. Before the agent's first run, `AgentRunner` (the class that runs your agent) connects to each of those servers, lists their tools, and adds them to the agent.

## Define an MCPServer resource

Create an `MCPServer` resource for each MCP server the agent uses. Dapr uses the resource name (`metadata.name`) as the server name.

```yaml
apiVersion: dapr.io/v1alpha1
kind: MCPServer
metadata:
  name: weather
spec:
  endpoint:
    sse:
      url: http://localhost:8081/sse
```

Save the file in your resources folder and pass that folder to `dapr run` with `--resources-path`. Start the MCP server before you run `dapr run`: if the sidecar can't reach a server when it starts, it stops with an error. For all `MCPServer` fields, including other transports and authentication, see [MCPServer resource]({{% ref mcp-server-resource.md %}}).

## Create the agent

Create a `DurableAgent` without passing `tools`, and run it with `AgentRunner`:

```python
import asyncio

from dapr_agents import AgentRunner, DurableAgent


async def main() -> None:
    agent = DurableAgent(
        name="WeatherAgent",
        role="Weather assistant",
        goal="Answer weather questions using the Weather MCP server.",
        instructions=["Use the weather tools to answer questions."],
    )

    async with AgentRunner() as runner:
        await runner.run(
            agent,
            payload={"task": "What's the weather like in Tokyo today?"},
            wait=True,
        )


if __name__ == "__main__":
    asyncio.run(main())
```

To load the tools before the runner starts, for example to check which tools are available, call `await agent.connect_mcpservers()` yourself. Calling it more than once is safe: it only connects the first time.

If the agent already has a tool with the same name, the discovered tool is skipped. If Dapr can't connect to one of the servers, the agent raises an error instead of running with missing tools.

## Configure discovery

Pass an `AgentMCPConfig` to the agent's `mcp` parameter to change how tools are loaded:

```python
from dapr_agents import DurableAgent
from dapr_agents.agents.configs import AgentMCPConfig

agent = DurableAgent(
    name="WeatherAgent",
    role="Weather assistant",
    instructions=["Use the weather tools to answer questions."],
    mcp=AgentMCPConfig(allowed_tools={"get_weather"}, timeout_in_seconds=60),
)
```

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `True` | Set to `False` to turn off tool discovery. |
| `allowed_tools` | `None` | Set of tool names to load. `None` loads every tool from every server. |
| `timeout_in_seconds` | `30` | How long to wait for each server to return its tool list. |

## Next steps

- Try the [Dapr Agents MCPServer quickstart](https://github.com/dapr/dapr-agents/tree/main/examples/10-mcpserver).
- To choose which servers to connect to yourself, use [DaprMCPClient]({{% ref dapr-mcp-client.md %}}).
- To add authentication or middleware to a server, see [How-To: Use MCPServer resources]({{% ref howto-use-mcpserver.md %}}).
