---
type: docs
title: "Anthropic"
linkTitle: "Anthropic"
description: Detailed information on the Anthropic conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: anthropic
spec:
  type: conversation.anthropic
  metadata:
  - name: key
    value: "mykey"
  - name: model
    value: claude-3-5-sonnet-20240620
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for Anthropic. | `"mykey"` |
| `model` | N | The Anthropic LLM to use. Defaults to `claude-3-5-sonnet-20240620`  | `claude-3-5-sonnet-20240620` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})