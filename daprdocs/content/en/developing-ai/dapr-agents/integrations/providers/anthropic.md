---
type: docs
title: "Anthropic"
linkTitle: "Anthropic"
weight: 20
description: "Use Anthropic Claude models with Dapr Agents"
---

The `AnthropicChatClient` connects Dapr Agents to [Anthropic](https://www.anthropic.com/) Claude models through the official Anthropic Python SDK and the Messages API. You can call it directly, or pass it as the `llm` of a `DurableAgent`.

The client supports:
- Text generation with system, user, assistant, and tool messages
- Streaming, with an optional `on_chunk` callback
- Image input
- Tool calling
- Structured output with Pydantic models
- Prompty files

## Installation

The Anthropic SDK is included with the `dapr-agents` package, so no extra is required.

{{< tabpane text=true >}}

{{% tab header="pip" %}}

```bash
pip install dapr-agents
```

{{% /tab %}}

{{% tab header="uv" %}}

```bash
uv add dapr-agents
```

{{% /tab %}}

{{< /tabpane >}}

## Configuration

The client reads the following environment variables when the matching constructor argument isn't set:

Environment variable | Constructor argument | Required | Details
-------------------- | -------------------- | -------- | -------
`ANTHROPIC_API_KEY` | `api_key` | Y | The API key used to authenticate with the Anthropic API.
`ANTHROPIC_MODEL` | `model` | N | The Claude model to use. Defaults to `claude-sonnet-4-6`.
`ANTHROPIC_BASE_URL` | `base_url` | N | Overrides the API base URL, for example to route requests through a proxy or a compatible endpoint.

The client also accepts a `timeout` argument (in seconds, or an `httpx.Timeout`-style dict) that defaults to `1500`.

```python
from dapr_agents import AnthropicChatClient

# Reads ANTHROPIC_API_KEY, and optionally ANTHROPIC_MODEL and ANTHROPIC_BASE_URL
llm = AnthropicChatClient()

# Or configure the client explicitly
llm = AnthropicChatClient(model="claude-sonnet-4-6", timeout=60)
```

{{% alert title="Note" color="primary" %}}
The Anthropic Messages API requires `max_tokens` on every request. The client sends `max_tokens=4096` unless you pass a different value to `generate(...)` or set it in a Prompty file.
{{% /alert %}}

## Usage

### Direct LLM calls

`generate(...)` accepts a string, a message dict, a message object, or a list of messages, and returns an `LLMChatResponse`:

```python
from dapr_agents import AnthropicChatClient
from dapr_agents.types import UserMessage

llm = AnthropicChatClient()

response = llm.generate("Name a famous dog!")
print(response.get_message().content)

response = llm.generate([UserMessage("Tell me a joke about dogs.")])
print(response.get_message().content)
```

System messages are moved into the Messages API's top-level `system` parameter automatically. Keyword arguments that `generate(...)` doesn't handle itself are passed through to the Anthropic Messages API, so you can use options such as `temperature`, `top_k`, `stop_sequences`, or `thinking`:

```python
response = llm.generate(
    "What is 27 * 453?",
    max_tokens=2048,
    thinking={"type": "enabled", "budget_tokens": 1024},
)
```

### With a Durable Agent

Pass the client as the agent's `llm`:

```python
from dapr_agents import AnthropicChatClient, DurableAgent, tool
from dapr_agents.agents.configs import AgentMemoryConfig, AgentStateConfig
from dapr_agents.memory import ConversationDaprStateMemory
from dapr_agents.storage.daprstores.stateservice import StateStoreService
from dapr_agents.workflow.runners import AgentRunner


@tool
def get_weather(location: str) -> str:
    """Get the current weather for a location."""
    return f"{location}: 72F and sunny."


def main() -> None:
    weather_agent = DurableAgent(
        name="WeatherAgent",
        role="Weather Assistant",
        instructions=["Help users with weather information"],
        tools=[get_weather],
        llm=AnthropicChatClient(),
        memory=AgentMemoryConfig(
            store=ConversationDaprStateMemory(store_name="agent-memory")
        ),
        state=AgentStateConfig(
            store=StateStoreService(store_name="agent-workflow"),
        ),
    )

    runner = AgentRunner()
    try:
        runner.serve(weather_agent, port=8001)
    finally:
        runner.shutdown()


if __name__ == "__main__":
    main()
```

The agent translates its tools and the tool results in the conversation history into Anthropic's `tool_use` and `tool_result` format for you.

### Streaming

Pass `stream=True` to receive an iterator of `LLMChatResponseChunk` objects instead of a complete response:

```python
from dapr_agents import AnthropicChatClient

llm = AnthropicChatClient()

for chunk in llm.generate("Name a famous dog!", stream=True):
    if chunk.result.content:
        print(chunk.result.content, end="", flush=True)
print()
```

You can also pass an `on_chunk` callback. It's called with each `LLMChatResponseChunk` as the iterator yields it, which is useful for forwarding tokens to a UI or a log while other code consumes the stream:

```python
from dapr_agents.types.message import LLMChatResponseChunk


def forward(chunk: LLMChatResponseChunk) -> None:
    if chunk.result.content:
        print(chunk.result.content, end="", flush=True)


stream = llm.generate("Write a haiku about durable workflows.", stream=True, on_chunk=forward)
for _ in stream:
    pass  # The request runs as the iterator is consumed
```

`on_chunk` only applies when `stream=True`, and it fires only while the returned iterator is being consumed. The stream produces three kinds of chunks:

- Text chunks, with the new text in `chunk.result.content`
- Tool call chunks, with the tool call ID and name, followed by partial JSON arguments, in `chunk.result.tool_calls`
- A final chunk with `chunk.result.finish_reason` set to the Anthropic stop reason, for example `"end_turn"` or `"tool_use"`

Each chunk's `metadata` carries the `provider`, response `id`, `model`, and the latest `usage` reported by the API. When extended thinking is enabled, the thinking text and signatures are collected in the metadata under `thinking_blocks`, `thinking_deltas`, and `thinking_signatures` rather than being emitted as content.

### Image input

Send images using OpenAI-style `image_url` content blocks. The client translates them into Anthropic image blocks. Both HTTP(S) URLs and base64 data URIs are supported:

```python
import base64

from dapr_agents import AnthropicChatClient

llm = AnthropicChatClient()

with open("chart.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = llm.generate(
    [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Compare these two images."},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{image_b64}"},
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/photo.jpg"},
                },
            ],
        }
    ]
)
print(response.get_message().content)
```

Data URIs must be base64-encoded and use one of the media types Anthropic accepts: `image/jpeg`, `image/png`, `image/gif`, or `image/webp`. Blocks that don't meet these requirements are logged as a warning and sent unchanged. Content blocks already in Anthropic's native format are passed through as-is.

### Tool calling

Pass `AgentTool` objects (for example, functions decorated with `@tool`) in `tools`. They're converted to Anthropic's `{name, description, input_schema}` tool format. Any tool calls in the response are returned as standard `tool_calls` on the assistant message:

```python
from dapr_agents import AnthropicChatClient, tool


@tool
def get_weather(location: str) -> str:
    """Get the current weather for a location."""
    return f"{location}: 72F and sunny."


llm = AnthropicChatClient()
response = llm.generate("What's the weather in Paris?", tools=[get_weather])

for tool_call in response.get_message().tool_calls or []:
    print(tool_call.function.name, tool_call.function.arguments)
```

`tool_choice` accepts either a string such as `"auto"`, `"any"`, or `"none"`, or an Anthropic tool choice object such as `{"type": "tool", "name": "get_weather"}`. Tools passed as dicts must already use Anthropic's tool format. OpenAI-style `{"type": "function", "function": {...}}` dicts aren't converted.

### Structured output

Pass a Pydantic model as `response_format` to get a validated instance back:

```python
from pydantic import BaseModel

from dapr_agents import AnthropicChatClient


class Contact(BaseModel):
    name: str
    email: str
    demo_requested: bool


llm = AnthropicChatClient()
contact = llm.generate(
    "Extract: John Smith (john@example.com) wants a demo on Tuesday.",
    response_format=Contact,
)
print(contact.model_dump())
```

`structured_mode` selects how the schema is enforced:

Mode | Details
---- | -------
`"json"` (default) | Uses Anthropic's native JSON schema output, which constrains the model to valid JSON. Requires a model that supports structured outputs. The client checks the model's capabilities first and raises an error that suggests `"function_call"` if the model doesn't support it.
`"function_call"` | Forces a single tool call whose input matches the schema. Use this for older Claude models.

Passing `response_format=list[Contact]` returns a generated wrapper model whose `objects` field holds the parsed list. If you combine `response_format` with `stream=True`, the request is still constrained, but you get a chunk iterator back and must buffer and parse the JSON yourself.

{{% alert title="Note" color="primary" %}}
When a `DurableAgent` requests structured output internally, for example in LLM-based orchestration, it uses the default `"json"` mode. Use a Claude model that supports structured outputs for those agents.
{{% /alert %}}

### Prompty

Set the Prompty configuration `type` to `anthropic` and load the file with `AnthropicChatClient.from_prompty(...)`:

```yaml
---
name: Claude Assistant
model:
  api: chat
  configuration:
    type: anthropic
    name: claude-sonnet-4-6
  parameters:
    max_tokens: 1024
    temperature: 0.7
inputs:
  question:
    type: string
---
system:
You are a helpful assistant.

user:
{{question}}
```

```python
from dapr_agents import AnthropicChatClient

llm = AnthropicChatClient.from_prompty("assistant.prompty")
response = llm.generate(input_data={"question": "What is Dapr?"})
print(response.get_message().content)
```

## Examples

See the [`01-llm-call-anthropic`](https://github.com/dapr/dapr-agents/tree/main/examples/01-llm-call-anthropic) example in the Dapr Agents repository for runnable text completion and streaming samples.
