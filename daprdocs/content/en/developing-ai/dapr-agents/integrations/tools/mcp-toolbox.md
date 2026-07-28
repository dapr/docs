---
type: docs
title: "MCP Toolbox for Databases"
linkTitle: "MCP Toolbox for Databases"
weight: 50
description: "Load MCP Toolbox tools for interacting with databases"
---

Dapr Agents supports integrating with [MCP Toolbox for Databases](https://mcp-toolbox.dev/documentation/introduction/) by implementing a wrapper that loads the available tools into the `Tool` model Dapr Agents utilize.  
  
To integrate the Toolbox, load the tools as follows:

```python
from toolbox_core import ToolboxSyncClient
client = ToolboxSyncClient("http://127.0.0.1:5000")
agent_tools = AgentTool.from_toolbox_many(client.load_toolset("your-tools-name-here"))
agent = DurableAgent(
    ..
    tools=agent_tools
)

..
# Remember to close the tool
finally:
    client.close()
```

Or wrap it in a `with` statement:

```python
from toolbox_core import ToolboxSyncClient
with ToolboxSyncClient("http://127.0.0.1:5000") as client:
    agent_tools = AgentTool.from_toolbox_many(client.load_toolset("your-tools-name-here"))
    agent = DurableAgent(
        ..
        tools=agent_tools
    )
```
