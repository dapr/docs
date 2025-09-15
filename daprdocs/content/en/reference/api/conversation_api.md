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
| `parameters` | Parameters for all custom fields. Optional |
| `metadata` | Metadata passed to conversation components. Optional |
| `scrubPii` | A boolean value to enable obfuscation of sensitive information returning from the LLM. Optional |
| `temperature` | A float value to control the temperature of the model. Used to optimize for consistency (0) or creativity (1). Optional |
| `tools` | Tools register the tools available to be used by the LLM during the conversation. Optional |
| `toolChoice` | Controls which (if any) tool is called by the model. Values: `auto`, `required`, or specific tool name. Defaults to `auto` if tools are present. Optional |

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

- **`auto`**: The model can pick between generating a message or calling one or more tools (default when tools are present)
- **`required`**: Requires one or more functions to be called
- **`{tool_name}`**: Forces the model to call a specific tool by name


#### Metadata
The `metadata` field serves as a dynamic configuration mechanism that allows you to pass additional configuration and authentication information to conversation components on a per-request basis. This metadata overrides any corresponding fields configured in the component's YAML configuration file, enabling dynamic configuration without modifying static component definitions.

**Common metadata fields:**

| Field | Description | Example |
| ----- | ----------- | ------- |
| `api_key` | API key for authenticating with the LLM service | `"sk-1234567890abcdef"` |
| `model` | Specific model identifier | `"gpt-4-turbo"`, `"claude-3-sonnet"` |
| `version` | API version or service version | `"1.0"`, `"2023-12-01"` |
| `endpoint` | Custom endpoint URL for the service | `"https://api.custom-llm.com/v1"` |

{{% alert title="Note" color="primary" %}}
The exact metadata fields supported depend on the specific conversation component implementation. Refer to the component's documentation for the complete list of supported metadata fields.
{{% /alert %}}

In addition to passing metadata in the request body, you can also pass metadata as URL query parameters without modifying the request payload. Here is the format:

- **Prefix**: All metadata parameters must be prefixed with `metadata.`
- **Format**: `?metadata.<field_name>=<value>`
- **Multiple parameters**: Separate with `&` (e.g., `?metadata.api_key=sk-123&metadata.model=gpt-4`)

Example of model override:
```bash
POST http://localhost:3500/v1.0-alpha2/conversation/openai/converse?metadata.model=sk-gpt-4-turbo
```

URL metadata parameters are merged with request body metadata, URL parameters take precedence if conflicts exist, and both override component configuration in the YAML file.

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
        "parameters": {},
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
        "parameters": {
          "max_tokens": {
            "@type": "type.googleapis.com/google.protobuf.Int64Value",
            "value": "100"
          },
          "model": {
            "@type": "type.googleapis.com/google.protobuf.StringValue",
            "value": "claude-3-5-sonnet-20240620"
          }
        },
        "metadata": {
          "api_key": "test-key",
          "version": "1.0"
        },
        "scrubPii": false,
        "temperature": 0.7,
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

### Response content

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
      ]
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
      ]
    }
  ]
}
```


## Legacy Alpha1 API

The previous Alpha1 version of the API is still supported for backward compatibility but is deprecated. For new implementations, use the Alpha2 version described above.

```
POST http://localhost:<daprPort>/v1.0-alpha1/conversation/<llm-name>/converse
```

## Next steps

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [Supported conversation components]({{% ref supported-conversation %}})
