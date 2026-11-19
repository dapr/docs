---
type: docs
title: "OpenRouter"
linkTitle: "OpenRouter"
description: Detailed information on the OpenRouter conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openrouter
spec:
  type: conversation.openrouter
  metadata:
  - name: key
    value: "mykey"
  - name: model
    value: anthropic/claude-sonnet-4.6
  - name: fallbackModels
    value: openai/gpt-5-mini,anthropic/claude-haiku-4.5
  - name: dataCollection
    value: deny
  - name: maxTokens
    value: 2048
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for OpenRouter. Get one at [openrouter.ai/keys](https://openrouter.ai/keys). | `"sk-or-v1-..."` |
| `model` | N | The model to use, as an OpenRouter model ID with the vendor prefix. Defaults to `openai/gpt-4o-mini`. Can also be set with the `OPENROUTER_MODEL` environment variable, which takes precedence over this field. | `anthropic/claude-sonnet-4.6` |
| `endpoint` | N | Custom API endpoint URL, for example a proxy in front of OpenRouter. Defaults to `https://openrouter.ai/api/v1`. | `https://openrouter.ai/api/v1` |
| `cacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from the cache until they expire. Uses Go duration format. | `10m` |
| `maxTokens` | N | Default maximum number of tokens the model may generate per request. A request-level `maxTokens` value overrides this default. When unset, no cap is sent and the provider's own default applies. | `2048` |
| `headers` | N | HTTP headers to send on every request, as a JSON object of header names to string values. A header in this field replaces the header of the same name that the component sets. | `{"X-Tenant-ID": "tenant-a"}` |

### App attribution

OpenRouter can attribute usage to your app in its rankings and analytics. See [App attribution](https://openrouter.ai/docs/app-attribution).

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `appURL` | N | The URL of your app, sent as the `HTTP-Referer` header. OpenRouter requires it for attribution. | `https://myapp.example.com` |
| `appTitle` | N | The display name of your app, sent as the `X-OpenRouter-Title` header. Only used together with `appURL`. | `My Agent App` |
| `appCategories` | N | Comma-separated marketplace categories, sent as the `X-OpenRouter-Categories` header. Only used together with `appURL`. | `personal-agent,general-chat` |

### Model fallbacks and provider routing

These fields set OpenRouter's [model fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks) and [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection) for every request. When none are set, OpenRouter's defaults apply. An invalid value fails component initialization.

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `fallbackModels` | N | Comma-separated model IDs that OpenRouter tries in order when the model returns an error, for example when it is rate limited, down, or rejects the request. | `openai/gpt-5-mini,anthropic/claude-haiku-4.5` |
| `providerOrder` | N | Comma-separated provider slugs that OpenRouter tries in order. | `anthropic,google-vertex` |
| `providerOnly` | N | Comma-separated provider slugs. OpenRouter only routes to these providers. | `azure,openai` |
| `providerIgnore` | N | Comma-separated provider slugs that OpenRouter never routes to. | `deepinfra` |
| `providerSort` | N | Ranks the providers for the model by `price`, `throughput` or `latency` instead of OpenRouter's default load balancing. | `price` |
| `allowProviderFallbacks` | N | Whether OpenRouter may use other providers for the model when the preferred ones are unavailable. When unset, OpenRouter allows it. | `false` |
| `requireParameters` | N | Only route to providers that support every parameter in the request, for example tools or a JSON schema response format. Models that don't support `temperature` can't be used with this option, because `temperature` is always sent. | `true` |
| `dataCollection` | N | Set to `deny` to only route to providers that do not store or train on prompts. Allowed values: `allow`, `deny`. | `deny` |
| `zdr` | N | Set to `true` to only route to Zero Data Retention endpoints. | `true` |
| `quantizations` | N | Comma-separated quantization levels. OpenRouter only routes to providers that serve the model at one of these levels. Allowed values: `int4`, `int8`, `fp4`, `mxfp4`, `nvfp4`, `fp6`, `fp8`, `mxfp8`, `fp16`, `bf16`, `fp32`, `unknown`. | `fp8,fp16` |
| `maxPromptPrice` | N | The highest prompt price, in USD per million tokens, that OpenRouter may route the request to. | `1` |
| `maxCompletionPrice` | N | The highest completion price, in USD per million tokens, that OpenRouter may route the request to. | `4` |

When `fallbackModels` is set, the response's model field still reports the configured `model`, even if a fallback model served the request.

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [OpenRouter documentation](https://openrouter.ai/docs)
- [OpenRouter models](https://openrouter.ai/models)
