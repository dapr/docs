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
| `maxTokens` | N | Default maximum number of tokens the model may generate per request. A request-level `maxTokens` value overrides this default. When unset, no cap is sent and the provider's own default applies. | `2048` |
| `responseCacheTTL` | N | Time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |
| `headers` | N | HTTP headers to send on every request to the model endpoint, as a JSON object of header names to string values. A header in this field replaces the header of the same name that the component sets. This includes the `Authorization` header that the component builds from `key`. See [Custom HTTP headers]({{% ref "conversation-overview.md#custom-http-headers" %}}). | `{"X-Tenant-ID": "tenant-a"}` |

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})