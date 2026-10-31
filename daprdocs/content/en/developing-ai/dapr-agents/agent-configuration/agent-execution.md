---
type: docs
title: "Execution Configuration"
linkTitle: "Execution"
weight: 10
description: "Configure DurableAgent execution behavior"
---

Dapr Agents uses `AgentExecutionConfig` to configure execution for a `DurableAgent`, including turn limits, tool execution, streaming, and human-in-the-loop approvals.

## Configuration fields

The **Constructor default** and **Resolved default** columns are defined as follows:

- **Constructor default:** The value used when the configuration object is created without an override.
- **Resolved default:** The value used when no configuration source provides an override.

| Field | Type | Constructor default | Resolved default | Description |
|---|---|---:|---:|---|
| `max_iterations` | `int \| None` | `None` | `10` | Maximum number of turns in the agent’s LLM/tool loop during a single agent run. Each turn may include one LLM call and zero or more tool calls. |
| `tool_choice` | `str \| None` | `None` | `"auto"` | Controls provider tool-choice behavior. Standard values include `auto`, `any`, `none`, and `required`; `any` and `required` are functionally equivalent, although provider support may vary. Non-empty provider-specific values are also accepted. |
| `tool_execution_mode` | `ToolExecutionMode \| None` | `None` | `ToolExecutionMode.PARALLEL` | Executes tool calls in `parallel` or `sequential` order. Use `parallel` for independent calls and `sequential` when calls depend on prior results or side effects. |
| `orchestration_mode` | `OrchestrationMode \| None` | `None` | `None` | Selects the orchestration strategy: `agent`, `random`, or `roundrobin`. When unset or explicitly set to `None`, orchestration is disabled. |
| `approval` | `AgentApprovalConfig \| None` | `None` | Default `AgentApprovalConfig`; see the `AgentApprovalConfig` fields section below. | Configures delivery and timeout behavior for human approvals. |
| `max_approval_rounds` | `int \| None` | `None` | `None` | Maximum number of human-approval rounds in one executor run. When unset, uses `max_iterations`. |
| <code>max_grpc_<wbr>inbound_message_<wbr>size_bytes</code> | `int \| None` | `None` | `None` | Sets the maximum inbound gRPC message size for this agent, in bytes. When set, it overrides <code>DAPR_GRPC_<wbr>MAX_INBOUND_<wbr>MESSAGE_SIZE_BYTES</code> for this agent. |
| `streaming` | `bool \| None` | `None` | `False` | Enables streaming responses for pub/sub-triggered sessions. |
| `stream_listener` | `dict \| None` | `None` | `None` | Provides a JSON-serializable stream-listener configuration. Supported types include `pubsub`, `in_process`, `webhook`, `composite`, and `custom`. |
| `builtin_tools` | `list[str] \| None` | `None` | `[]` | Names of opt-in built-in tools to register, such as `ask_user`. The `ask_user` tool requires `streaming=True` and is unavailable for orchestrators. |

### `AgentApprovalConfig` fields

`AgentApprovalConfig` configures how the agent delivers human-approval requests and handles approval timeouts. For details about approval delivery and response handling across HTTP, pub/sub, and direct workflow modes, see [Hooks and Human-in-the-Loop]({{< ref "dapr-agents-hooks.md" >}}).

| Field | Type | Default | Description |
|---|---|---:|---|
| `pubsub_name` | `str \| None` | `None` | Dapr pub/sub component for delivering approval requests. When unset, approval delivery depends on the hosting mode. |
| `topic` | `str` | `"agent-approval-requests"` | Topic used when `pubsub_name` is set. |
| `default_timeout_seconds` | `int \| None` | `300` | Time to wait before automatically denying an approval. Set to `None` to wait indefinitely. |

## Configuration sources

Configuration sources are resolved from highest to lowest priority:

1. State store runtime configuration
2. Instantiation values
3. Environment variables

### Configuration support

| Field | Runtime configuration | Instantiation | Environment variables | Hot-reloadable |
|---|---|---|---|---|
| `max_iterations` | Y | Y | Y | Y |
| `tool_choice` | Y | Y | Y | Y |
| `tool_execution_mode` | N | Y | Y | N |
| `orchestration_mode` | N | Y | N | N |
| `approval` | N | Y | N | N |
| `max_approval_rounds` | N | Y | N | N |
| `max_grpc_inbound_message_size_bytes` | N | Y | Y | N |
| `streaming` | N | Y | N | N |
| `stream_listener` | N | Y | N | N |
| `builtin_tools` | N | Y | N | N |

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

### Runtime configuration

| Field | Canonical runtime key |
|---|---|
| `max_iterations` | `MAX_ITERATIONS` |
| `tool_choice` | `TOOL_CHOICE` |

Runtime configuration supports these key-naming conventions, from highest to lowest priority:

1. `SCREAMING_SNAKE_CASE`
2. `snake_case`
3. `kebab-case`

## Hot reload

Updates to fields marked `Y` in the **Hot-reloadable** column of the [Configuration support](#configuration-support) table can be applied without restarting the agent. To enable this behavior, include the corresponding keys from the [Runtime configuration keys](#runtime-configuration-keys) table in a runtime configuration subscription. Updates to other fields require a restart.

{{% alert title="Warning" color="warning" %}}
Hot-reload configuration continues to support legacy key-naming conventions, such as `Tool_Choice`, `Tool-Choice`, and `TOOL-CHOICE`, for backward compatibility. These conventions are deprecated and support for them may be removed in a future release. For new configuration, use one of the supported naming conventions in the [Runtime configuration keys](#runtime-configuration-keys) section.
{{% /alert %}}

## Validation and resolution behavior

The following validation rules apply to the fields supported by each configuration source:

| Rule | Instantiation | Environment | Runtime configuration and hot reload |
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
