---
type: docs
title: "Conversation overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the conversation API building block"
---

{{% alert title="Alpha" color="primary" %}}
The conversation API is currently in [alpha]({{< ref "certification-lifecycle.md#certification-levels" >}}).
{{% /alert %}}

Dapr's conversation API reduces the complexity of securely and reliably interacting with Large Language Models (LLM) at scale. Whether you're a developer who doesn't have the necessary native SDKs or a polyglot shop who just wants to focus on the prompt aspects of LLM interactions, the conversation API provides one consistent API entry point to talk to underlying LLM providers. 

<img src="/images/conversation-overview.png" width=800 alt="Diagram showing the flow of a user's app communicating with Dapr's LLM components.">

In additon to enabling critical performance and security functionality (like [prompt caching]({{< ref "#prompt-caching" >}}) and [PII scrubbing]({{< ref "#personally-identifiable-information-pii-obfuscation" >}})), you can also pair the conversation API with Dapr functionalities, like:
- Resiliency circuit breakers and retries to circumvent limit and token errors, or 
- Middleware to authenticate requests coming to and from the LLM

Dapr provides observability by issuing metrics for your LLM interactions.

## Features

The following features are out-of-the-box for [all the supported conversation components]({{< ref supported-conversation >}}).

### Prompt caching

Prompt caching optimizes performance by storing and reusing prompts that are often repeated across multiple API calls. To significantly reduce latency and cost, Dapr stores frequent prompts in a local cache to be reused by your cluster, pod, or other, instead of reprocessing the information for every new request. 

### Personally identifiable information (PII) obfuscation

The PII obfuscation feature identifies and removes any form of sensitve user information from a conversation response. Simply enable PII obfuscation on input and output data to protect your privacy and scrub sensitive details that could be used to identify an individual. 

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

## Demo

Watch the demo presented during [Diagrid's Dapr v1.15 celebration](https://www.diagrid.io/videos/dapr-1-15-deep-dive) to see how the conversation API works using the .NET SDK.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NTnwoDhHIcQ?si=37SDcOHtEpgCIwkG&amp;start=5444" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Try out conversation

### Quickstarts and tutorials

Want to put the Dapr conversation API to the test? Walk through the following quickstart and tutorials to see it in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Conversation quickstart]({{< ref conversation-quickstart.md >}}) | Learn how to  interact with Large Language Models (LLMs) using the conversation API. |

### Start using the conversation API directly in your app

Want to skip the quickstarts? Not a problem. You can try out the conversation building block directly in your application. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the conversation API starting with [the how-to guide]({{< ref howto-conversation-layer.md >}}).

## Next steps

- [How-To: Converse with an LLM using the conversation API]({{< ref howto-conversation-layer.md >}})
- [Conversation API components]({{< ref supported-conversation >}})
