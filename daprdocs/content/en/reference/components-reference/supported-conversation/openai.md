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
    value: 'gpt-5-nano'
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
| `model` | N | The OpenAI LLM to use. Defaults to `gpt-5-nano` (configurable via the `OPENAI_MODEL` environment variable).  | `gpt-5-nano` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Azure OpenAI usage

The `conversation.openai` component can target either OpenAI's hosted API or Azure OpenAI. To select Azure OpenAI, set the component's `apiType` metadata to `azure` and provide the usual Azure-specific connection settings (for example, endpoint/region and API key) in the component configuration.

When `apiType: azure` is used, the environment variable `AZURE_OPENAI_MODEL` may be set to provide a default Azure model identifier to use when the component's `model` metadata is not provided. This environment variable only affects the component when `apiType` is set to `azure` — the regular `DAPR_CONVERSATION_OPENAI_MODEL` remains the default for non-Azure OpenAI usage.

Example (Azure OpenAI configuration):

```yaml
spec:
  type: conversation.openai
  metadata:
  - name: apiType
    value: azure
  - name: key
    value: "<your-azure-openai-key>"
  - name: endpoint
    value: "https://<your-resource-name>.openai.azure.com/"
  - name: model
    value: '${{AZURE_OPENAI_MODEL}}'
```

If `model` is omitted from the component metadata and neither `AZURE_OPENAI_MODEL` nor `DAPR_CONVERSATION_OPENAI_MODEL` are set, the component falls back to its built-in default model.

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})
