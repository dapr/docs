---
type: docs
title: "Execution Configuration"
linkTitle: "Execution"
weight: 10
description: "Configure DurableAgent execution behavior"
---

Dapr Agents uses `AgentExecutionConfig` to control how a `DurableAgent` runs LLM turns, executes tools, streams responses, and handles execution limits.

## Configuration

| Field | Type | Default | Description | Resolution support |
|---|---|---:|---|---|
| `max_iterations` | `int` | `10` | Maximum number of LLM and tool iterations per turn. Must be at least `1`. | Runtime store, instantiation |
| `tool_choice` | `str \| None` | `"auto"` | Provider tool-choice behavior. Common values are `auto`, `none`, and `required`. | Runtime store, instantiation |
| `tool_execution_mode` | `ToolExecutionMode` | `PARALLEL` | Executes tool calls in parallel or sequentially. | Instantiation |
| `orchestration_mode` | `OrchestrationMode \| None` | `None` | Selects the orchestration strategy: `agent`, `random`, or `roundrobin`. | Instantiation |
| `approval` | `AgentApprovalConfig` | See below | Configures delivery and timeout behavior for human approvals. | Instantiation |
| `max_grpc_inbound_message_size_bytes` | `int \| None` | `None` | Overrides the inbound gRPC message-size limit for this agent. The environment fallback is `DAPR_GRPC_MAX_INBOUND_MESSAGE_SIZE_BYTES`. | Instantiation, environment |
| `streaming` | `bool` | `False` | Enables streaming responses for pub/sub-triggered sessions. | Instantiation |
| `stream_listener` | `dict \| None` | `None` | Provides a JSON-serializable stream-listener configuration. | Instantiation |
| `builtin_tools` | `list[str]` | `[]` | Enables opt-in built-in tools, such as `ask_user`. | Instantiation |

### `AgentApprovalConfig` fields

| Field | Type | Default | Description |
|---|---|---:|---|
| `pubsub_name` | `str \| None` | `None` | Dapr pub/sub component for approval events. When unset, approvals are held for HTTP polling or direct workflow responses. |
| `topic` | `str` | `"agent-approval-requests"` | Topic used when `pubsub_name` is set. |
| `default_timeout_seconds` | `int \| None` | `300` | Time to wait before automatically denying an approval. Set to `None` to wait indefinitely. |

Execution resolution uses the following priority, from highest to lowest: Dapr Configuration Store runtime values, instantiation values, and environment variables. Runtime resolution applies to fields explicitly supported by the runtime configuration, such as `max_iterations` and `tool_choice`.

## Usage

Configure execution behavior by passing `AgentExecutionConfig` to `DurableAgent`:

```python
from dapr_agents import DurableAgent
from dapr_agents.agents.configs import (
    AgentExecutionConfig,
    ToolExecutionMode,
)

agent = DurableAgent(
    name="TravelAgent",
    tools=[search_flights],
    execution=AgentExecutionConfig(
        max_iterations=5,
        tool_choice="auto",
        tool_execution_mode=ToolExecutionMode.SEQUENTIAL,
        streaming=True,
    ),
)
```

For tool calls that are independent, use the default `PARALLEL` mode. Use `SEQUENTIAL` when a tool depends on the result or side effects of an earlier tool call.
