---
type: docs
title: "Ollama"
linkTitle: "Ollama"
description: Detailed information on the Ollama conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ollama
spec:
  type: conversation.ollama
  metadata:
  - name: model
    value: llama3.2:latest
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `model` | N | The Ollama LLM to use. Defaults to `llama3.2:latest`.  | `phi4:latest` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

### OpenAI Compatibility

Ollama is compatible with [OpenAI's API](https://ollama.com/blog/openai-compatibility). You can use the OpenAI component with Ollama models with the following changes:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ollama-openai
spec:
  type: conversation.openai # use the openai component type
  metadata:
  - name: key
    value: 'ollama' # just any non-empty string
  - name: model
    value: gpt-oss:20b  # an ollama model (https://ollama.com/search) in this case openai open source model. See https://ollama.com/library/gpt-oss
  - name: endpoint
    value: 'http://localhost:11434/v1' # ollama endpoint
```

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})