---
type: docs
title: "Agent Integrations"
linkTitle: "Agent Integrations"
weight: 25
description: "Supported agent frameworks and durable execution integrations for Dapr, including Flock and Diagrid community integrations"
---

## What are agent integrations in Dapr?

Agent integrations combine AI frameworks with Dapr building blocks such as
[Workflows]({{% ref workflow-overview %}}) and
[State management]({{% ref "state-management-overview.md" %}}) so agent
executions can survive failures, recover progress, and share durable state
across instances.

### Supported frameworks

|Framework|What becomes durable|Install / integration|
|---|---|---|
|[Flock](https://whiteducksoftware.github.io/flock/)|Blackboard state can be persisted through Dapr-supported state stores for shared and durable agent context|`uv add "flock-core[dapr]"`|
|[Google ADK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=adk)|Every LLM call and tool execution in an ADK agent|`pip install "diagrid[adk]"`|
|[Claude Agent SDK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=claude-agents)|Every Anthropic API turn and tool call, with parallel `tool_use` fan-out|`pip install "diagrid[claude_agents]"`|
|[CrewAI](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=crewai)|Every crew/task LLM call and tool execution|`pip install "diagrid[crewai]"`|
|[LangChain Deep Agents](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=deepagents)|Deep Agents graphs (built on LangGraph)|`pip install "diagrid[deepagents]"`|
|[HolmesGPT](https://github.com/diagridio/python-ai/tree/main/diagrid/agent/holmesgpt)|Every investigation iteration and tool call, plus durable human-in-the-loop approvals|`pip install "diagrid[holmesgpt]"`|
|[LangGraph](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=langgraph)|Every node execution in a graph|`pip install "diagrid[langgraph]"`|
|[OpenAI Agents SDK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=openai-agents)|Every LLM call and tool execution|`pip install "diagrid[openai_agents]"`|
|[Pydantic AI](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=pydantic-ai)|Every LLM call and tool execution|`pip install "diagrid[pydantic_ai]"`|
|[Strands Agents](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=strands)|Every tool call in a Strands agent loop|`pip install "diagrid[strands]"`|
|[Microsoft Agent Framework](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=microsoft-dotnet)|Every agent invocation run as a Dapr Workflow activity|`dotnet add package Diagrid.AI.Microsoft.AgentFramework`|

### Flock framework integration

Flock can use Dapr as a durable blackboard backend. This lets you keep the same
Flock agent model while switching persistence from local storage to distributed
Dapr state stores such as Redis or PostgreSQL.

The example below is intentionally minimal and conceptual. It shows only the
Dapr store wiring; full production configuration options and backend capability
details are documented in the official Flock guides.

```python
# Minimal conceptual example for Flock + Dapr state store
from flock import Flock
from flock.storage import DaprStateBlackboardConfig, DaprStateBlackboardStore

store = DaprStateBlackboardStore(
    config=DaprStateBlackboardConfig(store_name="flockstate")
)

flock = Flock(model="openai/gpt-4.1", store=store)
```

Read more:

- [Flock documentation](https://whiteducksoftware.github.io/flock/)
- [Flock repository (GitHub)](https://github.com/whiteducksoftware/flock)
- [Flock Dapr State Store Integration guide](https://whiteducksoftware.github.io/flock/guides/dapr-state-store/)
- [Flock Dapr examples (GitHub)](https://github.com/whiteducksoftware/flock/tree/main/examples/12-dapr)
- [Dapr State management overview]({{% ref "state-management-overview.md" %}})

### Diagrid community integrations

The following framework adapters are community-built and maintained by
[Diagrid](https://www.diagrid.io/) on top of
[Dapr Workflows]({{% ref workflow-overview %}}). They are not part of the core
Dapr project, and are open source under
[diagridio/python-ai](https://github.com/diagridio/python-ai). Questions,
bugs, and demos are welcome in the
[Diagrid Community Discord](https://diagrid.ws/diagrid-community).

For a minimal integration shape, the Diagrid adapters typically look like this:

```python
# 1. Wrap your existing agent
runner = DaprWorkflowAgentRunner(agent=agent, name="my-agent")
# 2. Start the durable workflow runtime
runner.start()
# 3. Run with checkpointed execution
async for event in runner.run_async(user_message="...", session_id="..."):
    ...
```

#### Diagrid-supported frameworks

|Framework|What becomes durable|Install|
|---|---|---|
|[Google ADK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=adk)|Every LLM call and tool execution in an ADK agent|`pip install "diagrid[adk]"`|
|[Claude Agent SDK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=claude-agents)|Every Anthropic API turn and tool call, with parallel `tool_use` fan-out|`pip install "diagrid[claude_agents]"`|
|[CrewAI](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=crewai)|Every crew/task LLM call and tool execution|`pip install "diagrid[crewai]"`|
|[LangChain Deep Agents](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=deepagents)|Deep Agents graphs (built on LangGraph)|`pip install "diagrid[deepagents]"`|
|[HolmesGPT](https://github.com/diagridio/python-ai/tree/main/diagrid/agent/holmesgpt)|Every investigation iteration and tool call, plus durable human-in-the-loop approvals|`pip install "diagrid[holmesgpt]"`|
|[LangGraph](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=langgraph)|Every node execution in a graph|`pip install "diagrid[langgraph]"`|
|[OpenAI Agents SDK](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=openai-agents)|Every LLM call and tool execution|`pip install "diagrid[openai_agents]"`|
|[Pydantic AI](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=pydantic-ai)|Every LLM call and tool execution|`pip install "diagrid[pydantic_ai]"`|
|[Strands Agents](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=strands)|Every tool call in a Strands agent loop|`pip install "diagrid[strands]"`|
|[Microsoft Agent Framework](https://docs.diagrid.io/getting-started/quickstarts/ai-agents/?agentframework=microsoft-dotnet)|Every agent invocation run as a Dapr Workflow activity|`dotnet add package Diagrid.AI.Microsoft.AgentFramework`|

## Next steps

- Explore [Dapr Workflows]({{% ref workflow-overview %}}) for durable
    orchestration patterns.
- Review [Dapr State management overview]
    ({{% ref "state-management-overview.md" %}})
    for component capabilities and trade-offs.
- Use [Flock Dapr examples (GitHub)](https://github.com/whiteducksoftware/flock/tree/main/examples/12-dapr)
    for runnable backend setups.
