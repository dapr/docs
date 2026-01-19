title: "Conversation API (Python) – Recommended Usage"
linkTitle: "Conversation"
weight: 11000
type: docs
description: Recommended patterns for using Dapr Conversation API in Python with and without tools, including multi‑turn flows and safety guidance.
---

The Dapr Conversation API is currently in alpha. This page presents the recommended, minimal patterns to use it effectively with the Python SDK:
- Plain requests (no tools)
- Requests with tools (functions as tools)
- Multi‑turn flows with tool execution
- Async variants
- Important safety notes for executing tool calls

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Python 3.9+](https://www.python.org/downloads/) installed
- [Dapr Python package]({{% ref "python#installation" %}}) installed
- A configured LLM component (for example, OpenAI or Azure OpenAI) in your Dapr environment

For full, end‑to‑end flows and provider setup, see:
- The SDK examples under Conversation:
  - [TOOL-CALL-QUICKSTART.md](https://github.com/dapr/python-sdk/blob/main/examples/conversation/TOOL-CALL-QUICKSTART.md)
  - [real_llm_providers_example.py](https://github.com/dapr/python-sdk/blob/main/examples/conversation/real_llm_providers_example.py)

## Plain conversation (no tools)

```python
from dapr.clients import DaprClient
from dapr.clients.grpc import conversation

# Build a single‑turn Alpha2 input
user_msg = conversation.create_user_message("What's Dapr?")
alpha2_input = conversation.ConversationInputAlpha2(messages=[user_msg])

with DaprClient() as client:
    resp = client.converse_alpha2(
        name="echo",  # replace with your LLM component name
        inputs=[alpha2_input],
        temperature=1,
    )

    for msg in resp.to_assistant_messages():
        if msg.of_assistant.content:
            print(msg.of_assistant.content[0].text)
```

Key points:
- Use `conversation.create_user_message` to build messages.
- Wrap into `ConversationInputAlpha2(messages=[...])` and pass to `converse_alpha2`.
- Use `response.to_assistant_messages()` to iterate assistant outputs.

## Tools: decorator‑based (recommended)

Decorator-based tools offer a clean, ergonomic approach. Define a function with clear type hints and detail docstring, this is important for the LLM to understand how or when to invoke the tool; 
decorate it with `@conversation.tool`. Registered tools can be passed to the LLM and invoked via tool calls.

```python
from dapr.clients import DaprClient
from dapr.clients.grpc import conversation

@conversation.tool
def get_weather(location: str, unit: str = 'fahrenheit') -> str:
    """Get current weather for a location."""
    # Replace with a real implementation
    return f"Weather in {location} (unit={unit})"

user_msg = conversation.create_user_message("What's the weather in Paris?")
alpha2_input = conversation.ConversationInputAlpha2(messages=[user_msg])

with DaprClient() as client:
    response = client.converse_alpha2(
        name="openai",  # your LLM component
        inputs=[alpha2_input],
        tools=conversation.get_registered_tools(),  # tools registered by @conversation.tool
        tool_choice='auto',
        temperature=1,
    )

    # Inspect assistant messages, including any tool calls
    for msg in response.to_assistant_messages():
        if msg.of_assistant.tool_calls:
            for tc in msg.of_assistant.tool_calls:
                print(f"Tool call: {tc.function.name} args={tc.function.arguments}")
        elif msg.of_assistant.content:
            print(msg.of_assistant.content[0].text)
```

Notes:
- Use `conversation.get_registered_tools()` to collect all `@conversation.tool` decorated functions.
- The binder validates/coerces params using your function signature. Keep annotations accurate.

## Minimal multi‑turn with tools

This is the go‑to loop for tool‑using conversations:

{{% alert title="Warning" color="warning" %}}
Do not blindly auto‑execute tool calls returned by the LLM unless you trust all tools registered. Treat tool names and arguments as untrusted input.
- Validate inputs and enforce guardrails (allow‑listed tools, argument schemas, side‑effect constraints).
- For async or I/O‑bound tools, prefer `conversation.execute_registered_tool_async(..., timeout=...)` and set conservative timeouts.
- Consider adding a policy layer or a user confirmation step before execution in sensitive contexts.
- Log and monitor tool usage; fail closed when validation fails.
{{% /alert %}}

```python
from dapr.clients import DaprClient
from dapr.clients.grpc import conversation

@conversation.tool
def get_weather(location: str, unit: str = 'fahrenheit') -> str:
    return f"Weather in {location} (unit={unit})"

history: list[conversation.ConversationMessage] = [
    conversation.create_user_message("What's the weather in San Francisco?")]

with DaprClient() as client:
    # Turn 1
    resp1 = client.converse_alpha2(
        name="openai",
        inputs=[conversation.ConversationInputAlpha2(messages=history)],
        tools=conversation.get_registered_tools(),
        tool_choice='auto',
        temperature=1,
    )

    # Append assistant messages; execute tool calls; append tool results
    for msg in resp1.to_assistant_messages():
        history.append(msg)
        for tc in msg.of_assistant.tool_calls:
            # IMPORTANT: validate inputs and enforce guardrails in production
            tool_output = conversation.execute_registered_tool(
                tc.function.name, tc.function.arguments
            )
            history.append(
                conversation.create_tool_message(
                    tool_id=tc.id, name=tc.function.name, content=str(tool_output)
                )
            )

    # Turn 2 (LLM sees tool result)
    history.append(conversation.create_user_message("Should I bring an umbrella?"))
    resp2 = client.converse_alpha2(
        name="openai",
        inputs=[conversation.ConversationInputAlpha2(messages=history)],
        tools=conversation.get_registered_tools(),
        temperature=1,
    )

    for msg in resp2.to_assistant_messages():
        history.append(msg)
        if not msg.of_assistant.tool_calls and msg.of_assistant.content:
            print(msg.of_assistant.content[0].text)
```

Tips:
- Always append assistant messages to history.
- Execute each tool call (with validation) and append a tool message with the tool output.
- The next turn includes these tool results so the LLM can reason with them.

## Functions as tools: alternatives

When decorators aren’t practical, two options exist.

A) Automatic schema from a typed function:

```python
from enum import Enum
from dapr.clients.grpc import conversation

class Units(Enum):
    CELSIUS = 'celsius'
    FAHRENHEIT = 'fahrenheit'

def get_weather(location: str, unit: Units = Units.FAHRENHEIT) -> str:
    return f"Weather in {location}"

fn = conversation.ConversationToolsFunction.from_function(get_weather)
weather_tool = conversation.ConversationTools(function=fn)
```

B) Manual JSON Schema (fallback):

```python
from dapr.clients.grpc import conversation

fn = conversation.ConversationToolsFunction(
    name='get_weather',
    description='Get current weather',
    parameters={
        'type': 'object',
        'properties': {
            'location': {'type': 'string'},
            'unit': {'type': 'string', 'enum': ['celsius', 'fahrenheit']},
        },
        'required': ['location'],
    },
)
weather_tool = conversation.ConversationTools(function=fn)
```

## Async variant

Use the asynchronous client and async tool execution helpers as needed.

```python
import asyncio
from dapr.aio.clients import DaprClient as AsyncDaprClient
from dapr.clients.grpc import conversation

@conversation.tool
def get_time() -> str:
    return '2025-01-01T12:00:00Z'

async def main():
    async with AsyncDaprClient() as client:
        msg = conversation.create_user_message('What time is it?')
        inp = conversation.ConversationInputAlpha2(messages=[msg])
        resp = await client.converse_alpha2(
            name='openai', inputs=[inp], tools=conversation.get_registered_tools()
        )
        for m in resp.to_assistant_messages():
            if m.of_assistant.content:
                print(m.of_assistant.content[0].text)

asyncio.run(main())
```

If you need to execute tools asynchronously (e.g., network I/O), implement async functions and use `conversation.execute_registered_tool_async` with timeouts.

## Safety and validation (must‑read)

An LLM may suggest tool calls. Treat all model‑provided parameters as untrusted input.

Recommendations:
- Register only trusted functions as tools. Prefer the `@conversation.tool` decorator for clarity and automatic schema generation.
- Use precise type annotations and docstrings. The SDK converts function signatures to JSON schema and binds parameters with type coercion and rejection of unexpected/invalid fields.
- Add guardrails for tools that can cause side effects (filesystem, network, subprocess). Consider allow‑lists, sandboxing, and limits.
- Validate arguments before execution. For example, sanitize file paths or restrict URLs/domains.
- Consider timeouts and concurrency controls. For async tools, pass a timeout to `execute_registered_tool_async(..., timeout=...)`.
- Log and monitor tool usage. Fail closed: if validation fails, avoid executing the tool and inform the user safely.

See also inline notes in `dapr/clients/grpc/conversation.py` (e.g., `tool()`, `ConversationTools`, `execute_registered_tool`) for parameter binding and error handling details.


## Key helper methods (quick reference)

This section summarizes helper utilities available in dapr.clients.grpc.conversation used throughout the examples.

- create_user_message(text: str) -> ConversationMessage
  - Builds a user role message for Alpha2. Use in history lists.
  - Example: `history.append(conversation.create_user_message("Hello"))`

- create_system_message(text: str) -> ConversationMessage
  - Builds a system message to steer the assistant’s behavior.
  - Example: `history = [conversation.create_system_message("You are a concise assistant.")]`

- create_assistant_message(text: str) -> ConversationMessage
  - Useful for injecting assistant text in tests or controlled flows.

- create_tool_message(tool_id: str, name: str, content: Any) -> ConversationMessage
  - Converts a tool’s output into a tool message the LLM can read next turn.
  - content can be any object; it is stringified safely by the SDK.
  - Example: `history.append(conversation.create_tool_message(tool_id=tc.id, name=tc.function.name, content=conversation.execute_registered_tool(tc.function.name, tc.function.arguments)))`

- get_registered_tools() -> list[ConversationTools]
  - Returns all tools currently registered in the in-process registry.
  - Includes tools created via:
    - @conversation.tool decorator (auto-registered by default), and
    - ConversationToolsFunction.from_function with register=True (default).
  - Pass this list in converse_alpha2(..., tools=...).

- register_tool(name: str, t: ConversationTools) / unregister_tool(name: str)
  - Manually manage the tool registry (e.g., advanced scenarios, tests, cleanup).
  - Names must be unique; unregister to avoid collisions in long-lived processes.

- execute_registered_tool(name: str, params: Mapping|Sequence|str|None) -> Any
  - Synchronously executes a registered tool by name.
  - params accepts kwargs (mapping), args (sequence), JSON string, or None. If a JSON string is provided (as commonly returned by LLMs), it is parsed for you.
  - Parameters are validated and coerced against the function signature/schema; unexpected or invalid fields raise errors.
  - Security: treat params as untrusted; add guardrails for side effects.

- execute_registered_tool_async(name: str, params: Mapping|Sequence|str|None, *, timeout: float|None=None) -> Any
  - Async counterpart. Supports timeouts, which are recommended for I/O-bound tools.
  - Prefer this for async tools or when using the aio client.

- ConversationToolsFunction.from_function(func: Callable, register: bool = True) -> ConversationToolsFunction
  - Derives a JSON schema from a typed Python function (annotations + optional docstring) and optionally registers a tool.
  - Typical usage: `spec = conversation.ConversationToolsFunction.from_function(my_func)`; then either rely on auto-registration or wrap with `ConversationTools(function=spec)` and call `register_tool(spec.name, tool)` or pass `[tool]` directly to `tools=`.

- ConversationResponseAlpha2.to_assistant_messages() -> list[ConversationMessage]
  - Convenience to transform the response outputs into assistant ConversationMessage objects you can append to history directly (including tool_calls when present).

Tip: The @conversation.tool decorator is the easiest way to create a tool. It auto-generates the schema from your function, allows an optional namespace/name override, and auto-registers the tool (you can set register=False to defer registration).
