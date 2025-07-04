---
type: docs
title: "Mistral"
linkTitle: "Mistral"
description: Detailed information on the Mistral conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mistral
spec:
  type: conversation.mistral
  metadata:
  - name: key
    value: mykey
  - name: model
    value: open-mistral-7b
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for Mistral. | `mykey` |
| `model` | N | The Mistral LLM to use. Defaults to `open-mistral-7b`.  | `open-mistral-7b` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})