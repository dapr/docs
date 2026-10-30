---
type: docs
title: "Execution Configuration"
linkTitle: "Execution"
weight: 10
description: "Configure DurableAgent execution behavior"
---

Dapr Agents uses `AgentExecutionConfig` to control how a `DurableAgent` runs LLM turns, executes tools, streams responses, and enforces iteration, approval-round, and message-size limits.

## Configuration fields

The following table lists the available execution configuration fields:

| Field | Type | Default | Description |
|---|---|---:|---|
| `max_iterations` | `int` | `10` | Maximum number of LLM and tool iterations per turn. |
| `tool_choice` | `str \| None` | `"auto"` | Controls provider tool-choice behavior. Standard values include `auto`, `none`, and `required`; non-empty provider-specific values are also accepted. |
| `tool_execution_mode` | `ToolExecutionMode` | `PARALLEL` | Executes tool calls in parallel or sequentially. Use `PARALLEL` for independent calls and `SEQUENTIAL` when calls depend on prior results or side effects. |
| `orchestration_mode` | `OrchestrationMode \| None` | `None` | Selects the orchestration strategy: `agent`, `random`, or `roundrobin`. |
| `approval` | `AgentApprovalConfig` | See the `AgentApprovalConfig` fields section below. | Configures delivery and timeout behavior for human approvals. |
| `max_approval_rounds` | `int \| None` | `None` | Maximum number of human-approval rounds in one executor run. When unset, uses `max_iterations`. |
| `max_grpc_inbound_message_size_bytes` | `int \| None` | `None` | Overrides the inbound gRPC message-size limit for this agent. |
| `streaming` | `bool` | `False` | Enables streaming responses for pub/sub-triggered sessions. |
| `stream_listener` | `dict \| None` | `None` | Provides a JSON-serializable stream-listener configuration. |
| `builtin_tools` | `list[str]` | `[]` | Enables opt-in built-in tools, such as `ask_user`. |

### `AgentApprovalConfig` fields

`AgentApprovalConfig` configures how the agent delivers human-approval requests and handles approval timeouts. For the full Hooks and Human-in-the-Loop workflow, see [Hooks and Human-in-the-Loop]({{< ref "dapr-agents-hooks.md" >}}).

| Field | Type | Default | Description |
|---|---|---:|---|
| `pubsub_name` | `str \| None` | `None` | Dapr pub/sub component for approval events. When unset, approvals are held for HTTP polling or direct workflow responses. |
| `topic` | `str` | `"agent-approval-requests"` | Topic used when `pubsub_name` is set. |
| `default_timeout_seconds` | `int \| None` | `300` | Time to wait before automatically denying an approval. Set to `None` to wait indefinitely. |

## Configuration sources

Configuration sources are resolved from highest to lowest priority:

1. State store runtime configuration
2. Instantiation values
3. Environment variables

### Configuration support

| Field | Instantiation | Environment | Runtime configuration | Hot-reloadable |
|---|---|---|---|---|
| `max_iterations` | Y | Y | Y | Y |
| `tool_choice` | Y | Y | Y | Y |
| `tool_execution_mode` | Y | Y | N | N |
| `orchestration_mode` | Y | N | N | N |
| `approval` | Y | N | N | N |
| `max_approval_rounds` | Y | N | N | N |
| `max_grpc_inbound_message_size_bytes` | Y | Y | N | N |
| `streaming` | Y | N | N | N |
| `stream_listener` | Y | N | N | N |
| `builtin_tools` | Y | N | N | N |

### Environment variables

| Field | Canonical environment variable |
|---|---|
| `max_iterations` | `DAPR_AGENTS_MAX_ITERATIONS` |
| `tool_choice` | `DAPR_AGENTS_TOOL_CHOICE` |
| `tool_execution_mode` | `DAPR_AGENTS_TOOL_EXECUTION_MODE` |
| `max_grpc_inbound_message_size_bytes` | `DAPR_GRPC_MAX_INBOUND_MESSAGE_SIZE_BYTES` |

Environment variables support these key-naming conventions, from highest to lowest priority:

1. `SCREAMING_SNAKE_CASE`
2. `snake_case`

### Runtime configuration keys

| Field | Canonical runtime key |
|---|---|
| `max_iterations` | `MAX_ITERATIONS` |
| `tool_choice` | `TOOL_CHOICE` |

Runtime configuration supports these key-naming conventions, from highest to lowest priority:

1. `SCREAMING_SNAKE_CASE`
2. `snake_case`
3. `kebab-case`

> **Note:** Hot-reload configuration continues to support legacy naming conventions, such as `Tool_Choice`, `Tool-Choice`, and `TOOL-CHOICE`, for backward compatibility. For new configuration, use one of the supported naming conventions listed above.

## Hot reload

When runtime configuration is enabled, fields marked `Y` in the **Hot-reloadable** column are applied without restarting the agent. Other execution settings require a restart.

## Validation and resolution behavior

The following validation rules apply to fields supported by each configuration source:

| Rule | Instantiation | Environment | State store runtime/hot reload |
|---|---|---|---|
| Invalid value | Raises an error | Logged and ignored | Logged and ignored |
| Empty or whitespace-only `tool_choice` | Rejected | Ignored | Ignored |
| Enum values | Case-insensitive for `tool_choice` and `tool_execution_mode` | Case-insensitive for `tool_choice` and `tool_execution_mode` | Case-insensitive for `tool_choice`; not supported for `tool_execution_mode` |

`max_iterations`, `max_approval_rounds`, and `max_grpc_inbound_message_size_bytes` must be positive integral values less than `10^19`. Values such as `10`, `"10"`, `10.0`, and `"1e3"` are accepted; zero, negative, fractional, and values such as `"1e19"` are rejected. This limit prevents unsafe conversion of extremely large numeric values while covering the signed 64-bit integer range.

When creating partial execution overrides, prefer direct construction or mutation. `dataclasses.replace()` and equivalent reconstruction can pass default values as explicit overrides and unintentionally replace environment values.

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
        max_approval_rounds=3,
        tool_choice="auto",
        tool_execution_mode=ToolExecutionMode.SEQUENTIAL,
        streaming=True,
    ),
)
```
