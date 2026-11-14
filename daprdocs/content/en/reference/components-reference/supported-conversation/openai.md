---
type: docs
title: "OpenAI"
linkTitle: "OpenAI"
description: Detailed information on the OpenAI conversation component
---

{{% alert title="Recommended" color="primary" %}}
Authenticate this component with the app's Dapr SPIFFE identity instead of an API key. SPIFFE authentication is secretless: no long-lived credential is stored, and the provider grants access to your app's own Dapr identity. See [SPIFFE authentication](#spiffe-authentication-recommended).
{{% /alert %}}

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
  - name: responseCacheTTL
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
| `key`   | N | API key for OpenAI. Required unless `identityProviderId` is set, or `apiType` is `azure` and Microsoft Entra ID is used. Prefer [SPIFFE authentication](#spiffe-authentication-recommended). | `mykey` |
| `model` | N | The OpenAI LLM to use. Defaults to `gpt-5-nano`, or to the `OPENAI_MODEL` environment variable when it is set. | `gpt-4-turbo` |
| `maxTokens` | N | Default maximum number of tokens the model may generate per request. A request-level `maxTokens` value overrides this default. When unset, no cap is sent and the provider's own default applies. | `2048` |
| `useLegacyMaxTokensField` | N | Send the token cap as `max_tokens` instead of `max_completion_tokens`. Set this when `endpoint` points at an OpenAI-compatible service that doesn't recognize `max_completion_tokens`, otherwise the cap is ignored. Defaults to `false`. | `true` |
| `endpoint` | N | Custom API endpoint URL for OpenAI API-compatible services. If not specified, the default OpenAI API endpoint is used. Required when `apiType` is set to `azure`. | `https://api.openai.com/v1`, `https://example.openai.azure.com/` |
| `responseCacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |
| `apiType` | N | Specifies the API provider type. Required when using a provider that does not follow the default OpenAI API endpoint conventions. | `azure` |
| `apiVersion`| N | The API version to use. Required when the `apiType` is set to `azure`. | `2025-04-01-preview` |
| `useResponsesAPI` | N | Send requests to the OpenAI Responses API (`/v1/responses`) instead of the Chat Completions API. Set this to use function tools with reasoning models that reject tools on Chat Completions. Requests are sent with `store: false`, so OpenAI keeps no conversation state. Not supported when `apiType` is set to `azure`: the component fails to initialize. Defaults to `false`. | `true` |

## Azure OpenAI Configuration

To configure the OpenAI component to connect to Azure OpenAI, you need to set the following metadata fields which are required for Azure's API format.

### Required fields for Azure OpenAI

When connecting to Azure OpenAI, the following fields are **required**:

- `apiType`: Must be set to `azure` to enable Azure OpenAI compatibility
- `endpoint`: Your Azure OpenAI resource endpoint URL (e.g., `https://your-resource.openai.azure.com/`)
- `apiVersion`: The API version for your Azure OpenAI deployment (e.g., `2025-01-01-preview`)
- `key`: Your Azure OpenAI API key, unless you [authenticate with Microsoft Entra ID](#azure-openai-with-microsoft-entra-id)

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

## SPIFFE authentication (recommended)

Instead of an API key, the component can authenticate with the app's SPIFFE identity. It exchanges a JWT SVID minted by Sentry for a short-lived OpenAI access token, using [OpenAI workload identity federation](https://developers.openai.com/api/docs/guides/workload-identity-federation). Set `identityProviderId` to enable it; `key` is then ignored. Requires Dapr 1.20 or later. See [SPIFFE authentication]({{% ref spiffe-authentication.md %}}) for why this is recommended, and for the Dapr prerequisites.

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `identityProviderId` | Y | ID of the OpenAI workload identity provider registered for Sentry. | `idp_01abc` |
| `serviceAccountId` | Y | ID of the OpenAI service account the access token acts as. | `svc_acct_01abc` |
| `audience` | N | Audience of the JWT SVID. Defaults to `https://api.openai.com/v1`. | `https://api.openai.com/v1` |

Not supported when `apiType` is `azure`. For Azure OpenAI, use [Microsoft Entra ID with the SPIFFE identity](#azure-openai-with-microsoft-entra-id) instead.

In the OpenAI organization settings, under **Security**, create a **Workload Identity Provider**:

1. Set the OIDC issuer URL to the Sentry JWT issuer, and the audience to `https://api.openai.com/v1`. Use discovery if Sentry's OIDC endpoints are publicly reachable, otherwise upload Sentry's JWK set.
2. Map the `sub` claim with the app's SPIFFE ID, for example `spiffe://public/ns/default/my-app`, to a service account.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openai
spec:
  type: conversation.openai
  metadata:
  - name: identityProviderId
    value: "idp_01abc"
  - name: serviceAccountId
    value: "svc_acct_01abc"
```

## Azure OpenAI with Microsoft Entra ID

Requires Dapr 1.20 or later. When `apiType` is `azure` and `key` is not set, the component authenticates with Microsoft Entra ID, using the [standard Azure authentication methods]({{% ref authenticating-azure.md %}}). The recommended method is the app's SPIFFE identity, set with `azureAuthMethods: spiffe`. To use it, configure a [federated identity credential]({{% ref "authenticating-azure.md#authenticating-with-a-federated-identity-credential" %}}), and grant the Entra ID application the **Cognitive Services OpenAI User** role on the Azure OpenAI resource.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azure-openai
spec:
  type: conversation.openai
  metadata:
  - name: apiType
    value: "azure"
  - name: endpoint
    value: "https://your-resource.openai.azure.com/"
  - name: apiVersion
    value: "2025-01-01-preview"
  - name: azureTenantId
    value: "00000000-0000-0000-0000-000000000000"
  - name: azureClientId
    value: "00000000-0000-0000-0000-000000000000"
  - name: azureAuthMethods
    value: "spiffe"
```

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [Azure OpenAI in Azure AI Foundry Models API lifecycle](https://learn.microsoft.com/azure/ai-foundry/openai/api-version-lifecycle)
