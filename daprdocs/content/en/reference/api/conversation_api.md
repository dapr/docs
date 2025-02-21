---
type: docs
title: "Conversation API reference"
linkTitle: "Conversation API"
description: "Detailed documentation on the conversation API"
weight: 1400
---

{{% alert title="Alpha" color="primary" %}}
The conversation API is currently in [alpha]({{< ref "certification-lifecycle.md#certification-levels" >}}).
{{% /alert %}}

Dapr provides an API to interact with Large Language Models (LLMs) and enables critical performance and security functionality with features like prompt caching and PII data obfuscation.

## Converse

This endpoint lets you converse with LLMs.

```
POST http://localhost:<daprPort>/v1.0-alpha1/conversation/<llm-name>/converse
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `llm-name` | The name of the LLM component. [See a list of all available conversation components.]({{< ref supported-conversation >}})

### Request body

| Field | Description |
| --------- | ----------- |
| `inputs` | Inputs for the conversation. Multiple inputs at one time are supported. Required |
| `cacheTTL` | A time-to-live value for a prompt cache to expire. Uses Golang duration format. Optional |
| `scrubPII` | A boolean value to enable obfuscation of sensitive information returning from the LLM. Optional |
| `temperature` | A float value to control the temperature of the model. Used to optimize for consistency and creativity. Optional |
| `metadata` | [Metadata](#metadata) passed to conversation components. Optional |

#### Input body

| Field | Description |
| --------- | ----------- |
| `content` | The message content to send to the LLM. Required |
| `role` | The role for the LLM to assume. Possible values: 'user', 'tool', 'assistant' |
| `scrubPII` | A boolean value to enable obfuscation of sensitive information present in the content field. Optional |

### Request content example

```json
REQUEST = {
  "inputs": [
    {
      "content": "What is Dapr?",
      "role": "user", // Optional
      "scrubPII": "true", // Optional. Will obfuscate any sensitive information found in the content field
    },
  ],
  "cacheTTL": "10m", // Optional
  "scrubPII": "true", // Optional. Will obfuscate any sensitive information returning from the LLM
  "temperature": 0.5 // Optional. Optimizes for consistency (0) or creativity (1)
}
```

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in Dapr code or underlying component

### Response content

```json
RESPONSE  = {
  "outputs": {
    {
       "result": "Dapr is distribution application runtime ...",
       "parameters": {},
    },
    {
       "result": "Dapr can help developers ...",
       "parameters": {},
    }
  },
}
```

## Next steps

- [Conversation API overview]({{< ref conversation-overview.md >}})
- [Supported conversation components]({{< ref supported-conversation >}})