---
type: docs
title: "Dapr AI .NET SDK"
linkTitle: "AI"
weight: 100000
description: "Overview of the Dapr AI building block for .NET"
---

`Dapr.AI` provides a dedicated client for interacting with Dapr's AI workloads from a .NET application. Today, Dapr provides the Conversational API to engage with large language models, and the `DaprConversationClient` is the entry point for sending prompts, configuring response formats, managing prompt cache retention, and reading token usage statistics.

For developers already working with the `Microsoft.Extensions.AI` ecosystem, the `Dapr.AI.Microsoft.Extensions` package implements `IChatClient` on top of the Dapr Conversation building block, so you can use Dapr as a backend for any `IChatClient`-compatible code, including tool and function calling.

{{% alert title="Runtime requirements" color="primary" %}}
The Dapr Conversation building block requires Dapr runtime v1.16.0 or later. Response format, prompt cache retention,
and token usage statistics require Dapr runtime v1.17.0 or later.
{{% /alert %}}

## Core concepts

- [How to: Create and use Dapr AI Conversations in the .NET SDK]({{< ref dotnet-ai-conversation-howto.md >}}): install the package, register the `DaprConversationClient` with dependency injection or build it manually, and try the samples.
- [DaprConversationClient usage]({{< ref dotnet-ai-conversation-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, dependency injection overloads, sending conversation requests, JSON-schema response format, prompt cache retention, and token usage statistics.
- [How to: Using Microsoft's AI extensions with Dapr's .NET Conversation SDK]({{< ref dotnet-ai-extensions-howto.md >}}): register `DaprChatClient` as an `IChatClient`, send chat messages, use tool and function calling, and handle errors.

## Next steps

- [How to: Create and use Dapr AI Conversations in the .NET SDK]({{< ref dotnet-ai-conversation-howto.md >}})
- [DaprConversationClient usage]({{< ref dotnet-ai-conversation-usage.md >}})
- [Using Microsoft's AI extensions with Dapr's .NET Conversation SDK]({{< ref dotnet-ai-extensions-howto.md >}})
