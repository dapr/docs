---
type: docs
title: "Quickstarts"
linkTitle: "Quickstarts"
weight: 70
description: "Get started with Dapr Agents through practical step-by-step examples"
aliases:
  - /developing-applications/dapr-agents/dapr-agents-quickstarts
---

The [Dapr Agents quickstarts](https://github.com/dapr/dapr-agents/tree/main/quickstarts) demonstrate how to use Dapr Agents to build applications with LLM-powered autonomous agents and event-driven workflows. The quickstarts are a single progressive tutorial that builds from basic LLM calls up through durable agents, workflows, multi-agent orchestration, and observability.

#### Before you begin

- [Set up your local Dapr environment]({{% ref install-dapr-cli.md %}}).
- Install [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager used by the quickstarts).
- Install [Ollama](https://ollama.com/) for local LLM inference (default), **or** obtain an [OpenAI API key](https://platform.openai.com/api-keys).


## Dapr Agents Fundamentals

The [Dapr Agents Fundamentals quickstart](https://github.com/dapr/dapr-agents/tree/main/quickstarts) covers the entire Dapr Agents programming model in a single directory of numbered Python scripts. Each step builds on the previous one.

| Step | File | What You'll Learn |
|------|------|-------------------|
| 1 | [`01_llm_client.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/01_llm_client.py) | Call an LLM via the Dapr Conversation API using `DaprChatClient` |
| 2 | [`02_durable_agent_workflow.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/02_durable_agent_workflow.py) | Run a durable agent triggered programmatically via the Dapr Workflow API, using `trigger_agent` from client code or `call_agent` from within another orchestrator |
| 3 | [`03_durable_agent_http.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/03_durable_agent_http.py) | Run a durable agent backed by Dapr Workflows, exposed over HTTP |
| 4 | [`04_durable_agent_pubsub.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/04_durable_agent_pubsub.py) | Trigger a durable agent via pub/sub instead of HTTP |
| 5 | [`05_workflow_llm.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/05_workflow_llm.py) | Build a deterministic Dapr Workflow that calls LLMs as activities |
| 6 | [`06_workflow_agents.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/06_workflow_agents.py) | Orchestrate multiple specialized agents as child workflows |
| 7 | [`07_durable_agent_tracing.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/07_durable_agent_tracing.py) | Enable distributed tracing for agents and workflows with Zipkin |
| 8 | [`08_durable_agent_hot_reload.py`](https://github.com/dapr/dapr-agents/blob/main/quickstarts/08_durable_agent_hot_reload.py) | Hot-reload agent configuration at runtime via Dapr Configuration Store |

See the [quickstarts README](https://github.com/dapr/dapr-agents/tree/main/quickstarts#readme) for full setup instructions including LLM configuration and prerequisites.


## Examples

The [Dapr Agents examples](https://github.com/dapr/dapr-agents/tree/main/examples) directory contains more advanced and feature-specific scenarios that complement the quickstarts:

| Example | What You'll Learn |
|---|---|
| [LLM Call – Dapr Chat Client](https://github.com/dapr/dapr-agents/tree/main/examples/01-llm-call-dapr) | Text generation, LLM provider swapping, resilience, and PII obfuscation via `DaprChatClient` |
| [LLM Call – OpenAI Client](https://github.com/dapr/dapr-agents/tree/main/examples/01-llm-call-open-ai) | Chat completion, structured outputs, audio, and embeddings using the native OpenAI client. *Also available for [ElevenLabs](https://github.com/dapr/dapr-agents/tree/main/examples/01-llm-call-elevenlabs), [Hugging Face](https://github.com/dapr/dapr-agents/tree/main/examples/01-llm-call-hugging-face), and [NVIDIA](https://github.com/dapr/dapr-agents/tree/main/examples/01-llm-call-nvidia).* |
| [Standalone Agent Tool Call](https://github.com/dapr/dapr-agents/tree/main/examples/02-standalone-agent-tool-call) | Build conversational agents with tools using `DurableAgent` with `AgentRunner.run` |
| [Durable Agent Tool Call](https://github.com/dapr/dapr-agents/tree/main/examples/02-durable-agent-tool-call) | Upgrade to durable workflow-backed agents with `AgentRunner.run/subscribe/serve` |
| [LLM-Based Workflows](https://github.com/dapr/dapr-agents/tree/main/examples/03-llm-based-workflows) | Deterministic multi-step workflows using LLM activities (chaining, parallelization, routing) |
| [Agent-Based Workflows](https://github.com/dapr/dapr-agents/tree/main/examples/03-agent-based-workflows) | Orchestrate agent activities inside a Dapr Workflow |
| [Message Router Workflow](https://github.com/dapr/dapr-agents/tree/main/examples/03-message-router-workflow) | Use `@message_router` to bind a workflow to a Dapr pub/sub topic |
| [Multi-Agent Workflows](https://github.com/dapr/dapr-agents/tree/main/examples/04-multi-agent-workflows) | Lord of the Rings themed event-driven multi-agent system with LLM, random, and round-robin orchestration strategies |
| [Multi-Agent Workflows on Kubernetes](https://github.com/dapr/dapr-agents/tree/main/examples/04-multi-agent-workflow-k8s) | Deploy and orchestrate multi-agent systems in Kubernetes |
| [Document Agent with Chainlit](https://github.com/dapr/dapr-agents/tree/main/examples/05-document-agent-chainlit) | Conversational agent that uploads and learns unstructured documents with long-term memory |
| [MCP Client – SSE](https://github.com/dapr/dapr-agents/tree/main/examples/06-agent-mcp-client-sse) | Connect to a remote MCP server over Server-Sent Events |
| [MCP Client – stdio](https://github.com/dapr/dapr-agents/tree/main/examples/06-agent-mcp-client-stdio) | Connect to a local MCP server over stdio |
| [MCP Client – Streamable HTTP](https://github.com/dapr/dapr-agents/tree/main/examples/06-agent-mcp-client-streamablehttp) | Connect to an MCP server via the Streamable HTTP transport |
| [Data Agent with MCP and Chainlit](https://github.com/dapr/dapr-agents/tree/main/examples/07-data-agent-mcp-chainlit) | Natural language queries over a Postgres database using MCP with a ChatGPT-like UI |
| [Agents as Activities with Observability](https://github.com/dapr/dapr-agents/tree/main/examples/07-agents-as-activities-observability) | Trace agent activities end-to-end with OpenTelemetry and Zipkin |
| [Agents as Tools](https://github.com/dapr/dapr-agents/tree/main/examples/08-agents-as-tools) | Invoke other `DurableAgent` instances—and agents from other frameworks—as child workflow tools |
| [Durable Agent Hot-Reload](https://github.com/dapr/dapr-agents/tree/main/examples/09-durable-agent-hot-reload) | Hot-reload agent persona and LLM settings at runtime without restarting |
