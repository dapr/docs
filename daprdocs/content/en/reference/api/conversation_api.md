---
type: docs
title: "Conversation API reference"
linkTitle: "Conversation API"
description: "Detailed documentation on the conversation API"
weight: 500
---

{{% alert title="Alpha" color="primary" %}}
The conversation API is currently in [alpha]({{% ref "certification-lifecycle.md#certification-levels" %}}).
{{% /alert %}}

Dapr provides an API to interact with Large Language Models (LLMs) and enables critical performance and security functionality with features like prompt caching, PII data obfuscation, and tool calling capabilities.

Tool calling follows OpenAI's function calling format, making it easy to integrate with existing AI development workflows and tools.

## Converse

This endpoint lets you converse with LLMs using the Alpha2 version of the API, which provides enhanced tool calling support and alignment with OpenAI's interface.

```
POST http://localhost:<daprPort>/v1.0-alpha2/conversation/<llm-name>/converse
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `llm-name` | The name of the LLM component. [See a list of all available conversation components.]({{% ref supported-conversation %}})

### Request body

| Field | Description |
| --------- | ----------- |
| `contextId` | The ID of an existing chat (like in ChatGPT). Optional |
| `inputs` | Inputs for the conversation. Multiple inputs at one time are supported. Required |
| `metadata` | Up to 16 key-value pairs to attach to the conversation for structured tagging (for example `user_id`, `session_id`). Not a mechanism for overriding component configuration. Optional |
| `scrubPii` | A boolean value to enable obfuscation of sensitive information returning from the LLM. Optional |
| `temperature` | A float value to control the temperature of the model. Used to optimize for consistency (0) or creativity (1). Optional |
| `maxTokens` | Maximum number of tokens the model may generate for the completion; must be greater than 0. Mapped to each provider's native parameter (for example, OpenAI's `max_completion_tokens` or Anthropic's `max_tokens`) and overrides the component-level `maxTokens` metadata default. When the cap is reached, the choice's `finishReason` is `length`. Available from Dapr 1.19. Optional |
| `tools` | Tools register the tools available to be used by the LLM during the conversation. Optional |
| `toolChoice` | Controls which (if any) tool is called by the model. Values: `auto`, `required`, or specific tool name. Defaults to `auto` if tools are present. Optional |
| `responseFormat` | Structured output described using a JSON Schema object. Use this when you want typed structured output. Supported by Deepseek, Google AI, Hugging Face, OpenAI, and Anthropic components. Optional |
| `promptCacheRetention` | Retention duration for the prompt cache. When set, enables extended prompt caching so cached prefixes stay active longer. With OpenAI, supports up to 24 hours. See [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching#prompt-cache-retention). Optional |

#### Input body

| Field | Description |
| --------- | ----------- |
| `messages` | Array of conversation messages. Required |
| `scrubPii` | A boolean value to enable obfuscation of sensitive information present in the content field. Optional |

#### Message types

The API supports different message types:

| Type | Description |
| ---- | ----------- |
| `ofDeveloper` | Developer role messages with optional name and content |
| `ofSystem` | System role messages with optional name and content |
| `ofUser` | User role messages with optional name and content |
| `ofAssistant` | Assistant role messages with optional name, content, and tool calls |
| `ofTool` | Tool role messages with tool ID, name, and content |


#### Tool calling

Tools can be defined using the `tools` field with function definitions:

| Field | Description |
| --------- | ----------- |
| `function.name` | The name of the function to be called. Required |
| `function.description` | A description of what the function does. Optional |
| `function.parameters` | JSON Schema object describing the function parameters. Optional |


#### Tool choice options

The `toolChoice` is an optional parameter that controls how the model can use available tools:

- **`none`**: The model will not call any tool and instead generates a message (default when no tools are present)
- **`auto`**: The model can pick between generating a message or calling one or more tools (default when tools are present)
- **`required`**: Requires one or more functions to be called
- **`{tool_name}`**: Forces the model to call a specific tool by name


#### Metadata
The `metadata` field is a set of up to 16 key-value pairs that can be attached to the conversation. This mirrors [OpenAI's `metadata` field](https://platform.openai.com/docs/api-reference/chat/create#chat-create-metadata) and is intended for storing additional information about the conversation in a structured format, such as user IDs, session IDs, or other application-specific tags.

This field is **not** a mechanism for overriding component configuration or passing authentication details such as API keys; provider credentials and connection settings belong in the component's YAML configuration file. If you're migrating from older examples that pass `api_key` via `metadata`, move those values into the component configuration (or a referenced secret) instead.

**Constraints:**

- Maximum of 16 key-value pairs
- Keys are strings up to 64 characters
- Values are strings up to 512 characters

**Example usage:**

```json
{
  "metadata": {
    "user_id": "user-1234",
    "session_id": "session-abcd",
    "environment": "production"
  }
}
```

In addition to passing metadata in the request body, you can also pass metadata as URL query parameters without modifying the request payload. Here is the format:

- **Prefix**: All metadata parameters must be prefixed with `metadata.`
- **Format**: `?metadata.<field_name>=<value>`
- **Multiple parameters**: Separate with `&` (e.g., `?metadata.user_id=user-1234&metadata.session_id=session-abcd`)

Example:
```text
POST http://localhost:3500/v1.0-alpha2/conversation/openai/converse?metadata.user_id=user-1234
```

URL metadata parameters are merged with request body metadata; URL parameters take precedence if conflicts exist.

### Request content examples

#### Basic conversation

```json
curl -X POST http://localhost:3500/v1.0-alpha2/conversation/openai/converse \
  -H "Content-Type: application/json" \
  -d '{
        "inputs": [
          {
            "messages": [
              {
                "ofUser": {
                  "content": [
                    {
                      "text": "What is Dapr?"
                    }
                  ]
                }
              }
            ]
          }
        ],
        "metadata": {}
      }'
```

#### Conversation with tool calling

```json
curl -X POST http://localhost:3500/v1.0-alpha2/conversation/openai/converse \
  -H "Content-Type: application/json" \
  -d '{
        "inputs": [
          {
            "messages": [
              {
                "ofUser": {
                  "content": [
                    {
                      "text": "What is the weather like in San Francisco in celsius?"
                    }
                  ]
                }
              }
            ],
            "scrubPii": false
          }
        ],
        "metadata": {
          "user_id": "user-1234",
          "session_id": "session-abcd"
        },
        "scrubPii": false,
        "temperature": 0.7,
        "maxTokens": 100,
        "tools": [
          {
            "function": {
              "name": "get_weather",
              "description": "Get the current weather for a location",
              "parameters": {
                "type": "object",
                "properties": {
                  "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                  },
                  "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "The temperature unit to use"
                  }
                },
                "required": ["location"]
              }
            }
          }
        ],
        "toolChoice": "auto"
      }'
```

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in Dapr code or underlying component

### Resiliency and timeouts

Conversation component calls use Dapr's [resiliency policies]({{% ref "resiliency-overview.md" %}}). You can target the conversation component by name under `targets/components/<component-name>/outbound` and attach timeout, retry, and circuit breaker policies.

- **Timeout**: The timeout is applied to the request context. That context is passed through to the conversation component (and thus to the LLM provider in the sidecar). If the LLM does not respond within the configured duration, the context is cancelled and the request is terminated with an error. Set a timeout that accounts for typical LLM response times.
- **Retries and circuit breaker**: These apply to the overall Converse invocation. Retries re-run the entire conversation call on failure (for example, after a timeout or network error). The circuit breaker, when open, skips calling the component and returns an error immediately. These are not passed to the LLM as configuration.

### Response content

Each item in `outputs` can include:

| Field | Description |
| ----- | ----------- |
| `choices` | Completion choices. |
| `model` | The model used for the conversation. Optional |
| `usage` | Token usage metrics for the request. Optional |

#### Usage metrics

When present, `usage` contains:

| Field | Description |
| ----- | ----------- |
| `promptTokens` | Number of tokens in the prompt. |
| `completionTokens` | Number of tokens in the generated completion. |
| `totalTokens` | Total tokens used (prompt + completion). |
| `promptTokensDetails` | Optional. Can include `audioTokens` (audio input tokens in the prompt) and `cachedTokens` (tokens served from prompt cache). |
| `completionTokensDetails` | Optional. Can include `reasoningTokens`, `acceptedPredictionTokens`, `rejectedPredictionTokens`, `audioTokens`. |

#### Basic conversation response

```json
{
  "outputs": [
    {
      "choices": [
        {
          "finishReason": "stop",
          "message": {
            "content": "Distributed application runtime, open-source."
          }
        }
      ],
      "model": "gpt-4o",
      "usage": {
        "promptTokens": 12,
        "completionTokens": 8,
        "totalTokens": 20,
        "promptTokensDetails": {
          "audioTokens": 0,
          "cachedTokens": 0
        },
        "completionTokensDetails": {
          "acceptedPredictionTokens": 0,
          "audioTokens": 0,
          "reasoningTokens": 0,
          "rejectedPredictionTokens": 0
        }
      }
    }
  ]
}
```

#### Tool calling response

```json
{
  "outputs": [
    {
      "choices": [
        {
          "finishReason": "tool_calls",
          "message": {
            "toolCalls": [
              {
                "id": "call_Uwa41pG0UqGA2zp0Fec0KwOq",
                "function": {
                  "name": "get_weather",
                  "arguments": "{\"location\":\"San Francisco, CA\",\"unit\":\"celsius\"}"
                }
              }
            ]
          }
        }
      ],
      "model": "gpt-4o",
      "usage": {
        "promptTokens": 25,
        "completionTokens": 18,
        "totalTokens": 43,
        "promptTokensDetails": {
          "audioTokens": 0,
          "cachedTokens": 0
        },
        "completionTokensDetails": {
          "acceptedPredictionTokens": 0,
          "audioTokens": 0,
          "reasoningTokens": 0,
          "rejectedPredictionTokens": 0
        }
      }
    }
  ]
}
```


## Legacy Alpha1 API

The previous Alpha1 version of the API is still supported for backward compatibility but is deprecated. For new implementations, use the Alpha2 version described above.

```
POST http://localhost:<daprPort>/v1.0-alpha2/conversation/<llm-name>/converse
```

## Next steps

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [Supported conversation components]({{% ref supported-conversation %}})
