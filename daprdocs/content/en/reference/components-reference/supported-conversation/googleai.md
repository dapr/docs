---
type: docs
title: "GoogleAI"
linkTitle: "GoogleAI"
description: Detailed information on the GoogleAI conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: googleai
spec:
  type: conversation.googleai
  metadata:
  - name: key
    value: mykey
  - name: model
    value: gemini-1.5-flash
  - name: responseCacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for GoogleAI. | `mykey` |
| `model` | N | The GoogleAI LLM to use. Defaults to `gemini-1.5-flash`.  | `gemini-2.0-flash` |
| `responseCacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})