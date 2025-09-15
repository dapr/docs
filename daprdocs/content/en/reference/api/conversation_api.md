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

Tool calling follow's OpenAI's function calling format, making it easy to integrate with existing AI development workflows and tools.

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
| `name` | The name of the conversation component. Required |
| `contextId` | The ID of an existing chat (like in ChatGPT). Optional |
| `inputs` | Inputs for the conversation. Multiple inputs at one time are supported. Required |
| `parameters` | Parameters for all custom fields. Optional |
| `metadata` | [Metadata](#metadata) passed to conversation components. Optional |
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

- **`ofDeveloper`**: Developer role messages with optional name and content
- **`ofSystem`**: System role messages with optional name and content  
- **`ofUser`**: User role messages with optional name and content
- **`ofAssistant`**: Assistant role messages with optional name, content, and tool calls
- **`ofTool`**: Tool role messages with tool ID, name, and content

#### Tool calling

Tools can be defined using the `tools` field with function definitions:

| Field | Description |
| --------- | ----------- |
| `function.name` | The name of the function to be called. Required |
| `function.description` | A description of what the function does. Optional |
| `function.parameters` | JSON Schema object describing the function parameters. Optional |

### Request content examples

#### Basic conversation

```json
REQUEST = {
  "name": "openai",
  "inputs": [{
    "messages": [{
      "of_user": {
        "content": [{
          "text": "What is Dapr?"
        }]
      }
    }]
  }],
  "parameters": {},
  "metadata": {}
}
```

#### Conversation with tool calling

```json
{
  "name": "openai",
  "inputs": [{
    "messages": [{
      "of_user": {
        "content": [{
          "text": "What is the weather like in San Francisco in celsius?"
        }]
      }
    }],
    "scrub_pii": false
  }],
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
  "scrub_pii": false,
  "temperature": 0.7,
  "tools": [{
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
  }],
  "tool_choice": "auto"
}
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
RESPONSE = {
  "outputs": [{
    "choices": [{
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Dapr is a distributed application runtime that makes it easy for developers to build resilient, stateless and stateful applications that run on the cloud and edge.",
        "tool_calls": []
      }
    }]
  }]
}
```

#### Tool calling response

```json
{
  "outputs": [{
    "choices": [{
      "finish_reason": "tool_calls",
      "index": 0,
      "message": {
        "content": null,
        "tool_calls": [{
          "id": "call_123",
          "function": {
            "name": "get_weather",
            "arguments": "{\"location\": \"San Francisco, CA\", \"unit\": \"celsius\"}"
          }
        }]
      }
    }]
  }]
}
```

### Tool choice options

The `tool_choice` is an optional parameter that controls how the model can use available tools:

- **`auto`**: The model can pick between generating a message or calling one or more tools (default when tools are present)
- **`required`**: Requires one or more functions to be called
- **`{tool_name}`**: Forces the model to call a specific tool by name

## Legacy Alpha1 API

The previous Alpha1 version of the API is still supported for backward compatibility but is deprecated. For new implementations, use the Alpha2 version described above.

```
POST http://localhost:<daprPort>/v1.0-alpha1/conversation/<llm-name>/converse
```

## Next steps

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [Supported conversation components]({{% ref supported-conversation %}})
