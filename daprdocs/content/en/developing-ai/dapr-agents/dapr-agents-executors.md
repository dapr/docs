---
type: docs
title: "Agent Executors"
linkTitle: "Agent Executors"
weight: 57
description: "Run a stateful agent runtime, such as the Claude Agent SDK, inside a DurableAgent"
aliases:
  - /developing-applications/dapr-agents/dapr-agents-executors
---

An **agent executor** lets a `DurableAgent` hand its whole reasoning loop to an external agent runtime, such as the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview). Dapr Agents still provides the parts around that loop: the durable workflow, triggers over pub/sub or HTTP, state, human approval, streaming and tracing.

## Executors and LLM clients

A `DurableAgent` gets its intelligence from one of two sources. You pass exactly one of them; passing both raises an error.

| | `llm=` (chat client) | `executor=` (agent executor) |
|---|---|---|
| Base class | `ChatClientBase` | `AgentExecutorBase` |
| What it does | Returns one completion for a list of messages | Runs a whole agent turn: it reasons, calls tools and loops until it has an answer |
| Who owns the loop | `DurableAgent`, one workflow activity per LLM call and per tool call | The executor, inside a single `run_executor` workflow activity |
| Who owns conversation state | Dapr Agents memory | The executor's session, identified by a `session_id` |
| Examples | `DaprChatClient`, `OpenAIChatClient`, `AnthropicChatClient` | `EchoAgentExecutor`, `ClaudeAgentExecutor` |

Choose an executor when you want an existing agent runtime, with its own tools, planning and context handling, and still want it to run durably under Dapr. Choose an LLM client when you want Dapr Agents to control every step.

## How an executor runs

When a `DurableAgent` with an executor is triggered, its workflow calls one activity, `run_executor`. The activity calls `executor.run(task, session_id=..., context=...)` and reads the stream of `AgentEvent` values it yields:

| Event type | Content | What `DurableAgent` does with it |
|---|---|---|
| `text_delta` | A piece of assistant text | Publishes it to the stream, if the run is streaming |
| `message` | A complete assistant message | Adds it to the agent's message history |
| `tool_call` | `{id, name, arguments}` | Records it in the tool history |
| `tool_result` | `{tool_call_id, result}` | Records the result against the matching call |
| `session` | A checkpoint from the executor | Saves the workflow state, including the `session_id` |
| `complete` | The final assistant message | Ends the run and returns this message as the result |
| `error` | An error message | Fails the run with an `AgentError` |
| `paused` | The tool call waiting for approval | Starts a human approval, then resumes the run (see [Human approval](#human-approval-of-tool-calls)) |

The stream always ends with exactly one `complete`, `error` or `paused` event. The `session_id` is saved on the workflow entry, so a retried activity continues the same session.

The event types and helpers live in `dapr_agents.agents.executors` and are also exported from `dapr_agents`:

```python
from dapr_agents import AgentEvent, AgentExecutorBase, ToolCallDecision
```

## The minimal executor: `EchoAgentExecutor`

`EchoAgentExecutor` needs no LLM and no API key. It sends the prompt back as `text_delta`, `message`, `session` and `complete` events. Use it to try the executor flow, or copy it as a starting point for your own executor.

```python
from dapr_agents import DurableAgent, EchoAgentExecutor
from dapr_agents.workflow.runners import AgentRunner


async def main() -> None:
    agent = DurableAgent(
        name="Echo",
        role="Echo Assistant",
        goal="Repeat user input through the AgentExecutorBase event stream.",
        executor=EchoAgentExecutor(chunk_size=8),
    )

    runner = AgentRunner()
    try:
        result = await runner.run(agent, payload={"task": "hello, agent executor"})
        print(result)
    finally:
        runner.shutdown(agent)
```

The full example is in [`examples/10-agent-executor-echo`](https://github.com/dapr/dapr-agents/tree/main/examples/10-agent-executor-echo).

### Writing your own executor

Subclass `AgentExecutorBase` and implement two methods:

- `async def run(self, prompt, *, session_id=None, context=None)`: an async generator that yields `AgentEvent` values and ends with a `complete` or `error` event. Report failures as an `error` event rather than raising.
- `async def get_session(self, session_id)`: returns the stored state of a session, or `None` if the session is unknown.

Set the class attribute `supports_tool_approval = True` only if your executor can end a run with a `paused` event and resume it from `context["tool_decisions"]`.

## Claude Agent SDK executor

`ClaudeAgentExecutor` runs the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) agent loop (the loop behind Claude Code) inside a `DurableAgent`.

### Install

The executor needs the optional `claude` extra:

```bash
pip install "dapr-agents[claude]"
```

`import dapr_agents` works without the extra. Only accessing `ClaudeAgentExecutor` loads the SDK, and without the extra it raises an `ImportError` that tells you which package to install.

{{% alert title="Package size" color="warning" %}}
The `claude-agent-sdk` wheel includes the Claude Code CLI, so each wheel is about 100 MB. Wheels are published for macOS (arm64 and x86_64), glibc Linux (x86_64 and aarch64) and Windows (x86_64). There is no wheel for musl Linux: on Alpine-based images, install the `claude` CLI on the `PATH` yourself, or set `cli_path` to point at it. Node.js is not needed.
{{% /alert %}}

### Authentication

The CLI authenticates with the `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN` environment variable. On a developer machine, it can also use the login of an installed `claude` CLI. In containers and Kubernetes pods, pass the credential through `env` and load it from a secret:

```python
import os

from dapr_agents import ClaudeAgentExecutorConfig

config = ClaudeAgentExecutorConfig(
    env={"ANTHROPIC_API_KEY": os.environ["ANTHROPIC_API_KEY"]},
)
```

### Create a Claude agent

```python
from dapr_agents import (
    ClaudeAgentExecutor,
    ClaudeAgentExecutorConfig,
    DurableAgent,
    tool,
)
from dapr_agents.workflow.runners import AgentRunner


@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"It is sunny in {city}."


executor = ClaudeAgentExecutor(
    ClaudeAgentExecutorConfig(
        model="claude-sonnet-4-5",
        system_prompt="You are a concise weather assistant.",
        max_turns=5,
        tools=(get_weather,),
    )
)

agent = DurableAgent(
    name="WeatherClaude",
    role="Weather Assistant",
    goal="Answer weather questions",
    executor=executor,
)


async def main() -> None:
    runner = AgentRunner()
    try:
        result = await runner.run(agent, payload={"task": "What's the weather in Paris?"})
        print(result)
    finally:
        runner.shutdown(agent)
```

Host the agent the same way as any other `DurableAgent`: `runner.run(...)`, `runner.subscribe(...)` or `runner.serve(...)`.

### Configuration

All settings are in the frozen dataclass `ClaudeAgentExecutorConfig`. Each field maps onto a `ClaudeAgentOptions` setting of the SDK.

| Field | Default | Description |
|---|---|---|
| `model` | CLI default | Claude model id, for example `"claude-sonnet-4-5"` |
| `system_prompt` | SDK default | A system prompt string, or an SDK system-prompt preset dict |
| `max_turns` | `None` | Maximum agent turns per run |
| `max_budget_usd` | `None` | Spending limit per run, in US dollars |
| `permission_mode` | `None` | SDK permission mode (`"default"`, `"acceptEdits"`, `"plan"`, `"bypassPermissions"`). It is sent again on every resume, because the CLI does not restore it from the transcript |
| `tools` | `()` | Dapr Agents tools to offer to Claude (see [Tools and MCP servers](#tools-and-mcp-servers)) |
| `tool_server_name` | `"dapr"` | Name of the in-process MCP server that carries `tools` |
| `mcp_servers` | `{}` | More MCP servers, as SDK config dicts (`stdio`, `sse`, `http` or `sdk`) |
| `builtin_tools` | `()` | Built-in Claude Code tools to turn on, such as `"Read"` or `"Bash"`. The default turns them all off. `None` keeps the CLI's default set |
| `allowed_tools` | `()` | More tool names Claude may call without asking, such as `"mcp__github"` |
| `disallowed_tools` | `()` | Tool names Claude must never call |
| `before_tool_call` | `()` | Dapr Agents `before_tool_call` hooks, applied to every tool call (see [Human approval](#human-approval-of-tool-calls)) |
| `hooks` | `{}` | Raw SDK hooks, such as `{"PreToolUse": [HookMatcher(...)]}`, added alongside the executor's own hooks |
| `session_store` | `None` | An SDK `SessionStore` that keeps a copy of each session transcript, such as `DaprSessionStore` (see [Durable sessions](#durable-sessions)) |
| `cwd` | Process working directory | Working directory of the CLI. The session store key is derived from it |
| `env` | `{}` | Extra environment variables for the CLI, such as credentials |
| `include_partial_messages` | `True` | Emit `text_delta` events for streamed text |
| `setting_sources` | `()` | Claude settings files to load (`"user"`, `"project"`, `"local"`). The default loads none, so settings on the host do not change agent runs |
| `cli_path` | Bundled CLI | Path to a `claude` binary to use instead of the bundled one |
| `extra_options` | `{}` | Other `ClaudeAgentOptions` arguments, such as `thinking`, `effort`, `agents` or `sandbox` |

The executor sets some options itself, so `extra_options` must not include `resume`, `session_id`, `session_store`, `hooks`, `stderr`, `continue_conversation`, `fork_session` or `include_partial_messages`. The config raises a `ValueError` if it does.

By default the agent has no built-in Claude Code tools (no file access, no shell) and loads no settings files. Claude can only use the tools and MCP servers you configure.

### Tools and MCP servers

Tools reach Claude in two ways:

- **Dapr Agents tools** in `tools` (functions decorated with `@tool`, or any `AgentTool`) are served to Claude through an in-process MCP server. Claude sees them as `mcp__<tool_server_name>__<tool name>`, for example `mcp__dapr__get_weather`. Events and tool history use the plain tool name, `get_weather`.
- **MCP servers** in `mcp_servers` are passed to the SDK, which connects to them. Add their tool names, or the whole server as `mcp__<server>`, to `allowed_tools` so Claude can call them without asking:

```python
config = ClaudeAgentExecutorConfig(
    tools=(get_weather,),
    mcp_servers={
        "github": {
            "type": "http",
            "url": "https://api.githubcopilot.com/mcp/",
            "headers": {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"},
        },
    },
    allowed_tools=("mcp__github",),
)
```

Both kinds of tools run inside the `run_executor` activity, in the same process as the executor. They are not scheduled as separate workflow activities. See [Limitations](#limitations).

### Durable sessions

The Claude CLI writes each session transcript to local disk. That is lost when a pod restarts or when a retried activity runs on another pod. To keep sessions, set a `session_store`. The SDK then stores a copy of the transcript in it, and when a session is resumed on a host without the local file, the SDK rebuilds the transcript from the store.

`DaprSessionStore` is a session store backed by a [Dapr state store]({{% ref state-management-overview.md %}}):

```python
from dapr_agents import (
    ClaudeAgentExecutor,
    ClaudeAgentExecutorConfig,
    DaprSessionStore,
    DaprSessionStoreConfig,
)
from dapr_agents.storage.daprstores.stateservice import StateStoreService

session_store = DaprSessionStore(
    StateStoreService(store_name="agentstatestore"),
    config=DaprSessionStoreConfig(ttl_in_seconds=7 * 24 * 3600),
)

executor = ClaudeAgentExecutor(
    ClaudeAgentExecutorConfig(
        model="claude-sonnet-4-5",
        cwd="/app/claude",
        session_store=session_store,
    )
)
```

If you don't set `session_store`, `DurableAgent` attaches a `DaprSessionStore` on the agent's workflow state store (`AgentStateConfig.store`). The executor accepts any object that implements the SDK `SessionStore` protocol, so you can also use your own store.

How `DaprSessionStore` stores a session:

- Each session has one small manifest document and a list of chunk documents. A chunk holds up to `max_chunk_bytes` (256 KiB by default). Keep this below the value size limit of your state store.
- Appends are committed with ETag (first-write) concurrency, so readers never see half of an append. Entries sent twice are skipped, based on their `uuid`.
- Transcripts are loaded in the order they were written.
- The store needs a state store that supports ETags. `ttl_in_seconds` also needs TTL support.
- `continue_conversation` (resume the most recent session without naming it) is not supported, because the store keeps no per-project index.

| `DaprSessionStoreConfig` field | Default | Description |
|---|---|---|
| `key_prefix` | `"claude-session:"` | Prefix for every key the store writes |
| `max_chunk_bytes` | `262144` | Largest serialized size of one chunk document |
| `dedupe_window` | `2048` | How many recent entry uuids are remembered per session to skip repeats |
| `max_commit_attempts` | `10` | Attempts to commit the manifest when writers conflict |
| `ttl_in_seconds` | `None` | TTL for every document written |

{{% alert title="Keep cwd the same on every host" color="primary" %}}
The session store key includes a project key derived from `cwd`. Set `cwd` to a fixed path, such as `/app/claude`, so every pod that may resume a session uses the same key. If `cwd` differs, the resume does not find the transcript.
{{% /alert %}}

#### Session ids

Claude session ids are UUIDs. A caller id that is not a UUID is turned into a stable UUID, and events report that UUID as `session_id`. To continue a conversation in a later run, pass the `session_id` from the earlier result in the trigger payload:

```python
result = await runner.run(
    agent,
    payload={"task": "And tomorrow?", "session_id": previous_session_id},
)
```

When the store already has the session, the executor resumes it. Otherwise it starts a new session with that id.

### Human approval of tool calls

`ClaudeAgentExecutor` supports the same `before_tool_call` [hooks]({{< ref dapr-agents-hooks.md >}}) as an LLM-driven `DurableAgent`, including `RequireApproval`. Pass the hooks in `before_tool_call` on the executor config. They run in a Claude `PreToolUse` hook for every tool call, including calls to tools from `mcp_servers`:

| Hook decision | What happens to the Claude tool call |
|---|---|
| `Proceed()` or `None` | The call runs |
| `Mutate(payload=...)` | The call runs with the new arguments |
| `Deny(reason=...)` or `Skip(...)` | The call is blocked and Claude is told why |
| `RequireApproval(...)` | The call is deferred and the run pauses until a person decides |
| The hook raises | The call is blocked |

The hook gets a `ToolHookContext`. For Dapr Agents tools, `step_name` is the plain tool name (`transfer_money`) and `source` is `"local"`. For tools from `mcp_servers`, `step_name` is the full Claude name (`mcp__github__create_issue`) and `source` is `"mcp"`. Built-in Claude Code tools have `source` `"claude"`. `payload` holds the tool arguments and `tool_call_id` the id of the call.

```python
from dapr_agents import (
    ClaudeAgentExecutor,
    ClaudeAgentExecutorConfig,
    DurableAgent,
    tool,
)
from dapr_agents.agents.configs import AgentApprovalConfig, AgentExecutionConfig
from dapr_agents.hooks import HookDecision, Proceed, RequireApproval, ToolHookContext


@tool
def transfer_money(to: str, amount: int) -> str:
    """Transfer money to a person."""
    return f"Sent {amount} to {to}."


def approve_transfers(ctx: ToolHookContext) -> HookDecision:
    if ctx.step_name == "transfer_money":
        return RequireApproval(
            timeout_seconds=3600,
            instructions=f"Approve transfer: {ctx.payload}",
        )
    return Proceed()


executor = ClaudeAgentExecutor(
    ClaudeAgentExecutorConfig(
        tools=(transfer_money,),
        before_tool_call=(approve_transfers,),
    )
)

agent = DurableAgent(
    name="Payments",
    role="Payments assistant",
    executor=executor,
    execution=AgentExecutionConfig(approval=AgentApprovalConfig()),
)
```

How an approval works:

1. Claude calls `transfer_money`. The hook returns `RequireApproval`, so the executor defers the call. The tool does not run. The run ends with a `paused` event that holds the `tool_call_id`, the tool name, the arguments and the approval details.
2. The workflow saves its state and asks for approval through the channel set in `AgentApprovalConfig`: an `ApprovalRequiredEvent` over pub/sub, or the `/hitl/approvals` endpoints under `runner.serve()`. This is the same flow as for LLM-driven agents. The workflow then waits durably for the response or the timeout. No process has to stay up while it waits.
3. When the decision arrives, the workflow calls `run_executor` again with the same `session_id` and the decision under `context["tool_decisions"]`. The executor resumes the Claude session from the session store, possibly on another pod. The same tool call goes through the hook again and is allowed or denied based on the decision, and Claude continues the original task. If the call is rejected, Claude is told it was blocked and why.
4. A resumed run can pause again, for example when Claude makes another call that needs approval. The workflow repeats steps 2 and 3 until the run completes or fails.

A decision applies only to the `tool_call_id` it was made for. When Claude makes several calls that need approval in parallel, only one is reported per pause. Claude issues the others again with new ids, and each of those pauses for its own approval. For fewer approval rounds, ask Claude in the system prompt to call approval-gated tools one at a time.

{{% alert title="Don't list approval-gated tools in allowed_tools" color="warning" %}}
When `before_tool_call` hooks are set, the executor lets its own tools through the hook instead of through `allowed_tools`. That way a gated call can't run on a static allow rule if the CLI declines to defer it. Don't add tools that need approval to `allowed_tools`, because a tool listed there can run without approval in that case.
{{% /alert %}}

To drive a paused run yourself, outside `DurableAgent`, loop until the stream ends in `complete` or `error`:

```python
from dapr_agents import AgentEvent, ToolCallDecision


async def run_with_approval(executor, task: str) -> AgentEvent:
    session_id = None
    context = None
    while True:
        last = None
        async for event in executor.run(task, session_id=session_id, context=context):
            session_id = event.session_id or session_id
            last = event
        if last is None or last.type != "paused":
            return last  # "complete" or "error"
        call = last.content
        # ask_a_human is your own approval step (UI, chat message, ticket, ...).
        approved = await ask_a_human(call["name"], call["arguments"])
        decision = ToolCallDecision(tool_call_id=call["tool_call_id"], approved=approved)
        context = {"tool_decisions": {decision.tool_call_id: decision.to_dict()}}
```

### Streaming

With `include_partial_messages=True` (the default), the executor emits `text_delta` events as Claude writes. When the agent runs with streaming, `DurableAgent` publishes each delta to the run's stream, the same way it does for a streaming LLM client. Use `AgentRunner.run_stream(...)`, or `AgentExecutionConfig(streaming=True)` with a stream listener, to read it. Thinking text and subagent output are not streamed.

### Observability

Executor runs are traced with the Dapr Agents OpenTelemetry instrumentation, like LLM-driven agents. The `run_executor` activity gets a span with the agent name, the session id, and the tool calls and results of the run. Errors set `error.type` on the span.

The final `complete` or `paused` event also reports what the run cost, in its `metadata`:

| Key | Description |
|---|---|
| `cost_usd` | Cost of this run: the session total now, minus the total at the start of the run |
| `session_total_cost_usd` | Total cost of the session, across all runs and resumes |
| `usage` | Token usage reported by the SDK for this run |
| `model_usage` | Usage per model |
| `num_turns` | Turn count from the SDK. It counts across resumes |
| `stop_reason`, `terminal_reason` | Why the run stopped |

The executor also sends the Claude CLI's stderr to the Python logger `dapr_agents.agents.executors.claude` at `DEBUG` level, and adds its last lines to error messages when a run fails before Claude returns a result.

### Errors

The executor reports failures as `error` events, never as exceptions. The error text includes the SDK's details, such as the result subtype (for example `error_max_turns` or `error_max_budget_usd`) and the error messages. If the CLI can't be found, the message says how to install it. `DurableAgent` turns an `error` event into a failed run.

## Limitations

- **Tools run in one activity.** The executor, its tools and its MCP calls all run inside one `run_executor` activity. Dapr Workflow does not checkpoint each tool call, and the activity retry policy applies to the whole run, not to each tool.
- **At-least-once execution.** Like any workflow activity, `run_executor` can run more than once, for example when a pod fails during a run. Tools may then run again. Make tools with side effects [idempotent]({{% ref "workflow-features-concepts.md#workflow-activities" %}}), or put them behind approval. A run that is retried after a resume has already finished does not start the task again: the executor returns the final answer from the stored transcript.
- **Long runs hold an activity open.** A Claude run can take minutes. Set the activity retry and timeout policies with that in mind. Waiting for approval does not hold an activity open.
- **Package size and platforms.** The SDK wheel includes the Claude Code CLI (about 100 MB), and there is no wheel for musl Linux. See [Install](#install).
- **Same options on every resume.** A resumed session must use the same `cwd`, tools, MCP servers, hooks and permission mode. If the tool that was deferred is gone when the session resumes, the run fails.

## Example

The [`examples/13-agent-executor-claude`](https://github.com/dapr/dapr-agents/tree/main/examples/13-agent-executor-claude) example runs a `DurableAgent` with `ClaudeAgentExecutor`. It uses Dapr Agents tools, a Dapr-backed session store and a tool that needs human approval.

## Further reading

- [Hooks and Human-in-the-Loop]({{< ref dapr-agents-hooks.md >}}): the hook decisions and approval delivery channels
- [Core Concepts]({{< ref dapr-agents-core-concepts.md >}}): `DurableAgent` and `AgentRunner`
- [Claude Agent SDK documentation](https://docs.claude.com/en/api/agent-sdk/overview)
- Source: [`dapr_agents/agents/executors`](https://github.com/dapr/dapr-agents/tree/main/dapr_agents/agents/executors)
