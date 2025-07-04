---
type: docs
title: "Huggingface"
linkTitle: "Huggingface"
description: Detailed information on the Huggingface conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: huggingface
spec:
  type: conversation.huggingface
  metadata:
  - name: key
    value: mykey
  - name: model
    value: meta-llama/Meta-Llama-3-8B
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for Huggingface. | `mykey` |
| `model` | N | The Huggingface LLM to use. Defaults to `meta-llama/Meta-Llama-3-8B`.  | `meta-llama/Meta-Llama-3-8B` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})