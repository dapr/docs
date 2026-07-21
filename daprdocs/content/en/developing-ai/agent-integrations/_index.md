---
type: docs
title: "Agent Integrations"
linkTitle: "Agent Integrations"
weight: 25
description: "Durable Execution for Google ADK, Claude Agent SDK, CrewAI, LangChain Deep Agents, HolmesGPT, LangGraph, OpenAI Agents SDK, Pydantic AI, Strands Agents, Microsoft Agent Framework, and Flock"
---

###  What are community agent integrations in Dapr?

Agents fail. Pods get evicted, processes crash, laptops die mid-run — and without durable execution, that failure means lost context, repeated tool calls, burned tokens, and an agent that has to start over from zero. Community integrations, including integrations maintained by [Diagrid](https://www.diagrid.io/), solve this by wrapping agent execution in [Dapr Workflows]({{% ref workflow-overview %}}), turning LLM calls and tool executions into durable, checkpointed activities — with **automatic failure detection and recovery, at scale**, for about **three lines of code**:

```python
# 1. Wrap your existing agent — no rewrite required
runner = DaprWorkflowAgentRunner(agent=agent, name="my-agent")
# 2. Start the durable workflow runtime
runner.start()
# 3. Run it — every step is now checkpointed and crash-proof
async for event in runner.run_async(user_message="...", session_id="..."):
    ...
```

These integrations are community-built on top of Dapr Workflow and are not part of the core Dapr project. Diagrid-maintained integrations are open source under [diagridio/python-ai](https://github.com/diagridio/python-ai). Questions, bugs, and demos are always welcome in the [Diagrid Community Discord](https://diagrid.ws/diagrid-community).

#### Supported frameworks

| Framework | What becomes durable | Install |
|-----------|-----------------------|---------|
| [Google ADK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=adk) | Every LLM call and tool execution in an ADK agent | `pip install "diagrid[adk]"` |
| [Claude Agent SDK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=claude-agents) | Every Anthropic API turn and tool call, with parallel `tool_use` fan-out | `pip install "diagrid[claude_agents]"` |
| [CrewAI](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=crewai) | Every crew/task LLM call and tool execution | `pip install "diagrid[crewai]"` |
| [LangChain Deep Agents](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=deepagents) | Deep Agents graphs (built on LangGraph) | `pip install "diagrid[deepagents]"` |
| [HolmesGPT](https://github.com/diagridio/python-ai/tree/main/diagrid/agent/holmesgpt) | Every investigation iteration and tool call, plus durable human-in-the-loop approvals | `pip install "diagrid[holmesgpt]"` |
| [LangGraph](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=langgraph) | Every node execution in a graph | `pip install "diagrid[langgraph]"` |
| [OpenAI Agents SDK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=openai-agents) | Every LLM call and tool execution | `pip install "diagrid[openai_agents]"` |
| [Pydantic AI](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=pydantic-ai) | Every LLM call and tool execution | `pip install "diagrid[pydantic_ai]"` |
| [Strands Agents](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=strands) | Every tool call in a Strands agent loop | `pip install "diagrid[strands]"` |
| [Microsoft Agent Framework](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=microsoft-dotnet) | Every agent invocation run as a Dapr Workflow activity | `dotnet add package Diagrid.AI.Microsoft.AgentFramework` |
| [Flock](https://whiteducksoftware.github.io/flock/) | Blackboard state and artifact persistence through a Dapr state store, while keeping Flock agent definitions unchanged | `uv add "flock-core[dapr]"` |

#### Flock + Dapr state store (conceptual)

Flock includes an optional Dapr-backed blackboard store. This keeps existing Flock agent contracts intact while switching persistence to a Dapr state store component.

```python
from flock.storage import DaprStateBlackboardConfig, DaprStateBlackboardStore

store = DaprStateBlackboardStore(
    config=DaprStateBlackboardConfig(
        store_name="flockstate",
        supports_transactions=True,
        supports_etag=True,
    )
)
```

```python
from flock import Flock

flock = Flock(
    model="openai/gpt-4.1",
    store=store,
)
```

Learn more in the official Flock resources:

- [Flock documentation](https://whiteducksoftware.github.io/flock/)
- [Flock Dapr State Store integration guide](https://whiteducksoftware.github.io/flock/guides/dapr-state-store/)
- [Flock Dapr examples (`examples/12-dapr`)](https://github.com/whiteducksoftware/flock/tree/main/examples/12-dapr)

For production setup details, including backend capability flags and known limitations, use the official Flock integration guide and repository examples.
