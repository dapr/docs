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
    value: openai/gpt-4o-mini
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `key`   | Y | API key for OpenRouter. Obtain one at [openrouter.ai/keys](https://openrouter.ai/keys). | `"sk-or-v1-..."` |
| `model` | N | Model identifier in `provider/model-name` format. Any model supported by OpenRouter is valid (e.g. `openai/gpt-4o`, `anthropic/claude-3-5-sonnet`, `meta-llama/llama-3.3-70b-instruct`). Defaults to `openai/gpt-4o-mini`. Can also be configured via the `OPENROUTER_MODEL` environment variable. | `anthropic/claude-3-5-sonnet` |
| `endpoint` | N | Override the OpenRouter API base URL. Useful when routing through a proxy. Defaults to `https://openrouter.ai/api/v1`. | `https://openrouter.ai/api/v1` |
| `cacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. Uses Go duration format. | `10m` |
| `siteURL` | N | Your application URL. Forwarded as the `HTTP-Referer` header on every request. Optional but recommended so OpenRouter can attribute usage and include your app in public rankings. | `https://myapp.example.com` |
| `siteTitle` | N | Your application name. Forwarded as the `X-Title` header on every request. Optional but recommended for OpenRouter attribution. | `My Dapr App` |

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
- [OpenRouter documentation](https://openrouter.ai/docs)
- [OpenRouter models](https://openrouter.ai/models)
