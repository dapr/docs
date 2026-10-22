---
type: docs
title: "How to: Create and use Dapr AI Conversations in the .NET SDK"
linkTitle: "How to: Use the AI Conversations client"
weight: 50010
description: Learn how to create and use the Dapr Conversational AI client using the .NET SDK
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

To get started with the Dapr AI .NET SDK client, install the [Dapr.AI package](https://www.nuget.org/packages/Dapr.AI) from NuGet:
```sh
dotnet add package Dapr.AI
```

These guides target SDK `1.19.0` or later. Configure a conversation component and credentials for its
model provider. Import `Dapr.AI.Conversation` and `Dapr.AI.Conversation.Extensions`.
The API is experimental (`DAPR_CONVERSATION`).

A `DaprConversationClient` maintains access to networking resources in the form of TCP sockets used to communicate with the Dapr sidecar.

### Dependency Injection

The `AddDaprConversationClient()` method registers the client with dependency injection and is the recommended approach
for using this package. This method accepts an optional options delegate for configuring the `DaprConversationClient` and a
`ServiceLifetime` argument, allowing you to specify a different lifetime for the registered services instead of the default `Singleton`
value.

The following example assumes all default values are acceptable and is sufficient to register the `DaprConversationClient`:

```csharp
services.AddDaprConversationClient();
```

The optional configuration delegate is used to configure the `DaprConversationClient` by specifying options on the
`DaprConversationClientBuilder` as in the following example:
```csharp
services.AddSingleton<DefaultOptionsProvider>();
services.AddDaprConversationClient((serviceProvider, clientBuilder) => {
     //Inject a service to source a value from
     var optionsProvider = serviceProvider.GetRequiredService<DefaultOptionsProvider>();
     var standardTimeout = optionsProvider.GetStandardTimeout();
     
     //Configure the value on the client builder
     clientBuilder.UseTimeout(standardTimeout);
});
```

### Manual Instantiation
Rather than using dependency injection, a `DaprConversationClient` can also be built using the static client builder.

For best performance, create a single long-lived instance of `DaprConversationClient` and provide access to that shared instance throughout
your application. `DaprConversationClient` instances are thread-safe and intended to be shared.

Avoid creating a `DaprConversationClient` per-operation.

A `DaprConversationClient` can be configured by invoking methods on the `DaprConversationClientBuilder` class before calling `.Build()`
to create the client. The settings for each `DaprConversationClient` are separate and cannot be changed after calling `.Build()`.

```csharp
var daprConversationClient = new DaprConversationClientBuilder()
    .UseGrpcEndpoint("http://localhost:50001")
    .Build();
```

See the .NET [documentation here]({{% ref dotnet-client %}}) for more information about the options available when configuring the Dapr client via the builder.

## Try it out
Put the Dapr AI .NET SDK to the test. Walk through the samples to see Dapr in action:

| SDK Samples | Description |
| ----------- | ----------- |
| [SDK samples](https://github.com/dapr/dotnet-sdk/tree/master/examples) | Clone the SDK repo to try out some examples and get started. |

## Building Blocks

This part of the .NET SDK allows you to interface with the Conversations API to send and receive messages from
large language models.

See [conversation requests and responses]({{< ref dotnet-ai-conversation-usage.md >}}) for message roles,
options, response schemas, caching, and token usage, and
[tool calling]({{< ref dotnet-ai-conversation-tools.md >}}) for the application-managed tool-call cycle.
