---
type: docs
title: "DeepSeek"
linkTitle: "DeepSeek"
description: Detailed information on the DeepSeek conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: deepseek
spec:
  type: conversation.deepseek
  metadata:
  - name: key
    value: mykey
  - name: maxTokens
    value: 2048
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for DeepSeek. | `mykey` |
| `maxTokens` | N | The max amount of tokens for each request.  | `2048` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})