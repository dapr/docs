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
    value: gpt-4-turbo
  - name: endpoint
    value: 'https://api.openai.com/v1'
  - name: cacheTTL
    value: 10m
  # - name: apiType # Optional
  #   value: 'azure'
  # - name: apiVersion # Optional
  #   value: '2025-01-01-preview'
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for OpenAI. | `mykey` |
| `model` | N | The OpenAI LLM to use. Defaults to `gpt-4-turbo`.  | `gpt-4-turbo` |
| `endpoint` | N | Custom API endpoint URL for OpenAI API-compatible services. If not specified, the default OpenAI API endpoint is used. Required when `apiType` is set to `azure`. | `https://api.openai.com/v1`, `https://example.openai.azure.com/` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |
| `apiType` | N | Specifies the API provider type. Required when using a provider that does not follow the default OpenAI API endpoint conventions. | `azure` |
| `apiVersion`| N | The API version to use. Required when the `apiType` is set to `azure`. | `2025-04-01-preview` |

## Azure OpenAI Configuration

To configure the OpenAI component to connect to Azure OpenAI, you need to set the following metadata fields which are required for Azure's API format.

### Required fields for Azure OpenAI

When connecting to Azure OpenAI, the following fields are **required**:

- `apiType`: Must be set to `azure` to enable Azure OpenAI compatibility
- `endpoint`: Your Azure OpenAI resource endpoint URL (e.g., `https://your-resource.openai.azure.com/`)
- `apiVersion`: The API version for your Azure OpenAI deployment (e.g., `2025-01-01-preview`)
- `key`: Your Azure OpenAI API key

Get your configuration values from: https://ai.azure.com/

### Azure OpenAI component example

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azure-openai
spec:
  type: conversation.openai
  metadata:
  - name: key
    value: "your-azure-openai-api-key"
  - name: model
    value: "gpt-4.1-nano"  # Default: gpt-4.1-nano
  - name: endpoint
    value: "https://your-resource.openai.azure.com/"
  - name: apiType
    value: "azure"
  - name: apiVersion
    value: "2025-01-01-preview"
```


{{% alert title="Note" color="primary" %}}
When using Azure OpenAI, both `endpoint` and `apiVersion` are mandatory fields. The component returns an error if either field is missing when `apiType` is set to `azure`.
{{% /alert %}}

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [Azure OpenAI in Azure AI Foundry Models API lifecycle](https://learn.microsoft.com/azure/ai-foundry/openai/api-version-lifecycle)