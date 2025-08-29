---
type: docs
title: "OpenAI"
linkTitle: "OpenAI"
description: Detailed information on the OpenAI conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openai
spec:
  type: conversation.openai
  metadata:
  - name: key
    value: mykey
  - name: model
  value: '${{DAPR_CONVERSATION_OPENAI_MODEL}}'
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for OpenAI. | `mykey` |
| `model` | N | The OpenAI LLM to use. Defaults to `gpt-5-nano` (configurable via `DAPR_CONVERSATION_OPENAI_MODEL` environment variable).  | `${{DAPR_CONVERSATION_OPENAI_MODEL}}` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})