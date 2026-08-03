---
type: docs
title: "Local Testing"
linkTitle: "Echo"
description: Detailed information on the echo conversation component used for local testing
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

{{% alert title="Information" color="warning" %}}
This component is only meant for local validation and testing of a Conversation component implementation. It does not actually send the data to any LLM but rather echos the input back directly.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `maxTokens` | N | Default maximum number of tokens (whitespace-delimited words) echoed back per request. A request-level `maxTokens` value overrides this default. When the cap truncates the output, the choice's `finishReason` is `length`. | `2048` |

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
