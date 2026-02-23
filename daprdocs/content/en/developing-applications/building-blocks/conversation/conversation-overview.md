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

In addition to enabling critical performance and security functionality (like [prompt caching]({{% ref "#prompt-caching" %}}) and [PII scrubbing]({{% ref "#personally-identifiable-information-pii-obfuscation" %}})), the conversation API also provides:

- **Tool calling capabilities** that allow LLMs to interact with external functions and APIs, enabling more sophisticated AI applications
- **OpenAI-compatible interface** for seamless integration with existing AI workflows and tools

You can also pair the conversation API with Dapr functionalities, like:

- Resiliency policies including circuit breakers to handle repeated errors, timeouts to safeguards from slow responses, and retries for temporary network failures
- Observability with metrics and distributed tracing using OpenTelemetry and Zipkin
- Middleware to authenticate requests to and from the LLM

## Features

The following features are out-of-the-box for [all the supported conversation components]({{% ref supported-conversation %}}).

### Prompt caching

The Conversation API includes a built-in caching mechanism (enabled by the cacheTTL parameter) that optimizes both performance and cost by storing previous model responses for faster delivery to repetitive requests. This is particularly valuable in scenarios where similar prompt patterns occur frequently. When caching is enabled, Dapr creates a deterministic hash of the prompt text and all configuration parameters, checks if a valid cached response exists for this hash within the time period (for example, 10 minutes), and returns the cached response immediately if found. If no match exists, Dapr makes the API call and stores the result. This eliminates external API calls, lowers latency, and avoids provider charges for repeated requests. The cache exists entirely within your runtime environment, with each Dapr sidecar maintaining its own local cache.

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
