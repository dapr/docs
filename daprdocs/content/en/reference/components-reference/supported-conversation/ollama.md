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
    value: '${{DAPR_CONVERSATION_OLLAMA_MODEL}}'
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `model` | N | The Ollama LLM to use. Defaults to `llama3.2:latest` (configurable via `DAPR_CONVERSATION_OLLAMA_MODEL` environment variable).  | `${{DAPR_CONVERSATION_OLLAMA_MODEL}}` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})
