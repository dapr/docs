---
type: docs
title: "Conversation overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the conversation API building block"
---

{{% alert title="Alpha" color="primary" %}}
The conversation API is currently in [alpha]({{% ref "certification-lifecycle#certification-levels" %}}).
{{% /alert %}}

Dapr's conversation API reduces the complexity of securely and reliably interacting with Large Language Models (LLM) at scale. Whether you're a developer who doesn't have the necessary native SDKs or a polyglot shop who just wants to focus on the prompt aspects of LLM interactions, the conversation API provides one consistent API entry point to talk to underlying LLM providers. 

<img src="/images/conversation-overview.png" width=800 alt="Diagram showing the flow of a user's app communicating with Dapr's LLM components.">

In addition to enabling critical performance and security functionality (like [caching]({{% ref "#caching" %}}) and [PII scrubbing]({{% ref "#personally-identifiable-information-pii-obfuscation" %}})), the conversation API also provides:

- **Tool calling capabilities** that allow LLMs to interact with external functions and APIs, enabling more sophisticated AI applications
- **OpenAI-compatible interface** for seamless integration with existing AI workflows and tools

You can also pair the conversation API with Dapr functionalities, like:

- Resiliency policies including circuit breakers to handle repeated errors, timeouts to safeguards from slow responses, and retries for temporary network failures
- Observability with metrics and distributed tracing using OpenTelemetry and Zipkin
- Middleware to authenticate requests to and from the LLM

## Features

The following features are out-of-the-box for [all the supported conversation components]({{% ref supported-conversation %}}).

### Caching

The Conversation API supports two kinds of caching:

- **Prompt caching**: Some LLM providers cache prompt prefixes on their side to speed up and reduce cost of repeated prompts. You enable this per request via the API using the `promptCacheRetention` parameter (for example, `24h` for OpenAI). See the [Conversation API reference]({{% ref conversation_api.md %}}) for request-level options. Support depends on the provider.
- **Response caching**: Conversation components can cache full LLM responses in the sidecar. When you set the component metadata field `responseCacheTTL` (for example, `10m`), Dapr caches responses keyed by the request (prompt and options). Repeated identical requests are served from the cache without calling the LLM, reducing latency and cost. This cache is in-memory and per sidecar. Configure this in your [conversation component]({{% ref supported-conversation %}}) spec.

### Response formatting

You can request structured output from the model by passing a `responseFormat` (JSON Schema) in the request. Supported by Deepseek, Google AI, Hugging Face, OpenAI, and Anthropic. See the [Conversation API reference]({{% ref conversation_api.md %}}).

### Usage metrics

Responses can include token usage (`promptTokens`, `completionTokens`, `totalTokens`) for the conversation. See [Response content]({{% ref "conversation_api.md#response-content" %}}) in the API reference.

### Personally identifiable information (PII) obfuscation

The PII obfuscation feature identifies and removes any form of sensitive user information from a conversation response. Simply enable PII obfuscation on input and output data to protect your privacy and scrub sensitive details that could be used to identify an individual. 

The PII scrubber obfuscates the following user information:
- Phone number
- Email address
- IP address
- Street address
- Credit cards
- Social Security number
- ISBN
- Media Access Control (MAC) address
- Secure Hash Algorithm 1 (SHA-1) hex
- SHA-256 hex
- MD5 hex

### Tool calling support

The conversation API supports advanced tool calling capabilities that allow LLMs to interact with external functions and APIs. This enables you to build sophisticated AI applications that can:

- Execute custom functions based on user requests
- Integrate with external services and databases
- Provide dynamic, context-aware responses
- Create multi-step workflows and automation

Tool calling follows [OpenAI's function calling format](https://platform.openai.com/docs/guides/function-calling), making it easy to integrate with existing AI development workflows and tools.

### Custom HTTP headers

Some LLM gateways and proxies require extra HTTP headers, for example a tenant ID or a gateway key. Use the `headers` component metadata field to send these headers on every request to the model endpoint. The field holds a JSON object of header names to string values.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: llm-gateway
spec:
  type: conversation.openai
  metadata:
  - name: endpoint
    value: https://llm-gateway.example.com/v1
  - name: key
    value: mykey
  - name: headers
    value: '{"X-Tenant-ID": "tenant-a", "X-Gateway-Route": "eu"}'
```

If a header value is a credential, keep the complete JSON object in a secret store and reference it with `secretKeyRef`. See [Reference secrets in components]({{% ref component-secrets.md %}}).

The [Anthropic]({{% ref "/reference/components-reference/supported-conversation/anthropic.md" %}}), [DeepSeek]({{% ref "/reference/components-reference/supported-conversation/deepseek.md" %}}), [GoogleAI]({{% ref "/reference/components-reference/supported-conversation/googleai.md" %}}), [Hugging Face]({{% ref "/reference/components-reference/supported-conversation/hugging-face.md" %}}), [Ollama]({{% ref "/reference/components-reference/supported-conversation/ollama.md" %}}) and [OpenAI]({{% ref "/reference/components-reference/supported-conversation/openai.md" %}}) components support the `headers` field. For OpenAI, this includes Azure OpenAI and the Responses API. The Mistral component fails to initialize when the field is set. The AWS Bedrock and Echo components do not support the field.

The component applies these rules:

- A header in `headers` replaces the header of the same name that the component sets. This includes the header that the component builds from `key`: `Authorization`, `x-api-key` for Anthropic, or `api-key` for Azure OpenAI.
- A component that requires `key` still requires it when `headers` is set. If the gateway does its own authentication, set `key` to any non-empty value.
- Some components can get an access token through workload identity federation (Anthropic, GoogleAI and OpenAI) or Microsoft Entra ID (Azure OpenAI). The access token then sets the `Authorization` header, and the component removes the `api-key` and `x-api-key` headers.
- The component does not send `headers` to the token endpoint, except for Anthropic. The Anthropic token endpoint is on the same origin as the model endpoint, so it gets the headers too.
- When `headers` is set, the component does not follow a redirect to a different origin. This prevents the headers from reaching another host.

The component fails to initialize when:

- The field is not a JSON object of header names to string values.
- A header name or a header value is not valid.
- A header name occurs more than once. The check ignores case.
- The field sets `Host`, `Content-Length` or a hop-by-hop header: `Connection`, `Keep-Alive`, `Proxy-Connection`, `Te`, `Trailer`, `Transfer-Encoding` or `Upgrade`.

The error messages do not contain header values.

## Demo

Watch the demo presented during [Diagrid's Dapr v1.15 celebration](https://www.diagrid.io/videos/dapr-1-15-deep-dive) to see how the conversation API works using the .NET SDK.

{{< youtube id=NTnwoDhHIcQ start=5444 >}}

## Try out conversation API

### Quickstarts and tutorials

Want to put the Dapr conversation API to the test? Walk through the following quickstart and tutorials to see it in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Conversation quickstart]({{% ref conversation-quickstart %}}) | Learn how to interact with Large Language Models (LLMs) using the conversation API. |

### Start using the conversation API directly in your app

Want to skip the quickstarts? Not a problem. You can try out the conversation building block directly in your application. After [Dapr is installed]({{% ref "getting-started/_index.md" %}}), you can begin using the conversation API starting with [the how-to guide]({{% ref howto-conversation-layer %}}).

## Next steps

- [How-To: Converse with an LLM using the conversation API]({{% ref howto-conversation-layer %}})
- [Conversation API components]({{% ref supported-conversation %}})
