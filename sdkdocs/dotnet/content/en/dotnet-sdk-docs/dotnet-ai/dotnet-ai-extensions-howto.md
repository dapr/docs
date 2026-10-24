---
type: docs
title: "How to: Using Microsoft's AI extensions with Dapr's .NET Conversation SDK"
linkTitle: "How to: Use Microsoft's AI extensions with Dapr"
weight: 50020
description: Learn how to create and use Dapr with Microsoft's AI extensions
---

## Prerequisites
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0),
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0), or
  [.NET 11](https://dotnet.microsoft.com/download/dotnet/11.0) installed
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)

## Installation

{{% alert title=".NET framework support" color="warning" %}}
Be advised that .NET 8 and .NET 9 reach end of support in November 2026. Support for both will be dropped
in Dapr v1.20; only .NET 10 and .NET 11 will be supported through the end of 2027.
{{% /alert %}}

To get started with this SDK, install both the [Dapr.AI](https://www.nuget.org/packages/Dapr.AI) and 
[Dapr.AI.Microsoft.Extensions](https://www.nuget.org/packages/Dapr.AI.Microsoft.Extensions) packages from NuGet:
```sh
dotnet add package Dapr.AI
dotnet add package Dapr.AI.Microsoft.Extensions
```

The `DaprChatClient` is a Dapr-based implementation of the `IChatClient` interface provided in the 
`Microsoft.Extensions.AI.Abstractions` package using Dapr's [conversation building block]({{< ref conversation-overview.md >}}). It allows
developers to build against the types provided by Microsoft's abstraction while providing the greatest conformity to the 
Dapr conversation building block available. As both approaches adopt OpenAI's API approach, these are expected to increasingly
converge over time.

{{% alert title="Dapr Conversation Building Block" color="primary" %}}

Do note that Dapr's conversation building block is still in an alpha state, meaning that the shape of the API
is likely to change future releases. It's the intent of this SDK package to provide an API that's aligned with
Microsoft's AI extensions that also maps to and conforms with the Dapr API, but the names of types and properties
may change from one release to the next, so please be aware of this possibility when using this SDK.

{{% /alert %}}

## About Microsoft.Extensions.AI
The `Dapr.AI.Microsoft.Extensions` package implements the `Microsoft.Extensions.AI` abstractions, providing a unified API for
AI services in .NET applications. `Microsoft.Extensions.AI` is designed to offer a consistent programming model across
different AI providers and scenarios. For detailed information about `Microsoft.Extensions.AI`, refer to the 
[official documentation](https://learn.microsoft.com/dotnet/ai/microsoft-extensions-ai).

{{% alert title="Limited Support" color="warning" %}}

Note that Microsoft's AI extension provide many more properties and methods than Dapr's conversation building block currently
supports. This package will only map those properties that have Dapr support and will ignore the others, so just because
it's available in the Microsoft.Extensions.AI package doesn't mean it's supported by Dapr. Rely on this documentation
and the exposed XML documentation in the package to understand what is and isn't supported.

{{% /alert %}}

## Service Registration
The `DaprChatClient` can be registered with the dependency injection container using several extension methods. First,
import `Dapr.AI.Conversation.Extensions`, `Dapr.AI.Microsoft.Extensions`, and `Microsoft.Extensions.AI`.
Register the `DaprConversationClient` that's part of the `Dapr.AI` package from NuGet:

```csharp
services.AddDaprConversationClient();
```

Then register the `DaprChatClient` with your conversation component name:

```csharp
services.AddDaprChatClient("my-conversation-component", configure: null);
```

Pass `configure: null` explicitly in `1.19.0` to disambiguate overloads with optional parameters.

### Configuration Options
You can confiugre the `DaprChatClient` using the `DaprChatClientOptions` though the current implementation only
provides configuration for the component name itself. This is expected to change in future releases.

```csharp
services.AddDaprChatClient("my-conversation-component", options => 
{
   // Configure additional options here 
});
```

You can also configure the service lifetime (this defaults to `ServiceLifetime.Scoped`):

```csharp
services.AddDaprChatClient("my-conversation-component", ServiceLifetime.Singleton);
```

For multiple components, register keyed clients:

```csharp
services.AddDaprChatClient(
    serviceKey: "support", conversationComponentName: "support-conversation");
services.AddDaprChatClient(
    serviceKey: "catalog", conversationComponentName: "catalog-conversation");
```

Resolve them with `[FromKeyedServices("support")] IChatClient` or
`GetRequiredKeyedService<IChatClient>("support")`. The component-name-only overload also registers a keyed
client using the component name as its key.

## Usage
Once registered, you can inject and use `IChatClient` in your services:

```csharp
public class ChatService(IChatClient chatClient)
{
    public async Task<IReadOnlyList<string>> GetResponseAsync(string message)
    {
        var response = await chatClient.GetResponseAsync([
            new ChatMessage(ChatRole.User,
                "Please write me a poem in iambic pentameter about the joys of using Dapr to develop distributed applications with .NET")
            ]);
        
        return response.Messages.Select(msg => msg.Text).ToList();
    }
}
```

### Streaming Conversations
The `DaprChatClient` does not support streaming responses in SDK `1.19.0`.
`GetStreamingResponseAsync` throws `NotImplementedException`.

### Tool Integration
The client maps tool declarations to the model and returns requested calls as `FunctionCallContent`.
Calling `GetResponseAsync` does not automatically execute a function. An application-owned tool loop or
function-invocation middleware must execute allowed functions and return results.

```csharp
string GetCurrentWeather() => Random.Shared.NextDouble() > 0.5 ? "It's sunny today!" : "It's raining today!";
var toolChatOptions = new ChatOptions { Tools = [AIFunctionFactory.Create(GetCurrentWeather, "weather")] };
var toolResponse = await chatClient.GetResponseAsync("What's the weather like today?", toolChatOptions);
foreach (var toolResp in toolResponse.Messages)
{
    Console.WriteLine(toolResp);
}
```

## Error Handling
The `DaprChatClient` integrates with Dapr's error handling and will throw appropriate exceptions when issues occur.

## Configuration and Metadata
The underlying Dapr conversation component can be configured with metadata and parameters through the Dapr conversation 
building block configuration. The `DaprChatClient` will respect these settings when making calls to the conversation component.

### Mapping in SDK 1.19.0

The adapter implements a subset of `IChatClient`, not the complete `ConversationOptions` surface:

| Microsoft.Extensions.AI surface | Dapr mapping |
| --- | --- |
| User, assistant, system, and tool roles | Text-only conversation messages. Other roles throw `ArgumentOutOfRangeException`; non-text parts and structured tool-result/call history are not preserved by the input mapping. |
| `ChatOptions.Temperature` | `ConversationOptions.Temperature` |
| `ChatOptions.ConversationId` | `ConversationOptions.ContextId` |
| `ChatOptions.ToolMode` | None, auto, required, or a named required function |
| `ChatOptions.Tools` | Tool name, description, and `AdditionalProperties` mapped to function parameters; validate the schema actually sent for your tool. |
| `ChatOptions.AdditionalProperties` | Stringified component metadata, not protobuf `Parameters`. |
| Response | Conversation ID, finish reason, text, returned function calls, and each raw choice in `RawRepresentation`. Token usage and model are not mapped to `ChatResponse` in this release. |

Options such as response format, prompt cache retention, and PII scrubbing are not mapped by this adapter.
Use `DaprConversationClient` directly when you need those capabilities or full control over the
[tool-call conversation history]({{< ref dotnet-ai-conversation-tools.md >}}).

## Best Practices

1. **Service Lifetime**: Use `ServiceLifetime.Scoped` or `ServiceLifetime.Singleton` for the `DaprChatClient` registration to avoid creating multiple instances unnecessarily.

2. **Error Handling**: Always wrap calls in appropriate try-catch blocks to handle both Dapr-specific and general exceptions.

3. **Resource Management**: `DaprChatClient.Dispose` is a no-op in this release. DI manages the separately
registered `DaprConversationClient`; manually constructed applications must keep that client alive and dispose it themselves.

4. **Configuration**: Configure your Dapr conversation component properly to ensure optimal performance and reliability.

## Related Links

- [Dapr Conversation Building Block]({{< ref conversation-overview.md >}})
- [Microsoft.Extensions.AI Documentation](https://learn.microsoft.com/dotnet/ai/microsoft-extensions-ai)
- [Dapr .NET Conversation SDK]({{% ref dotnet-ai-conversation-howto.md %}})
