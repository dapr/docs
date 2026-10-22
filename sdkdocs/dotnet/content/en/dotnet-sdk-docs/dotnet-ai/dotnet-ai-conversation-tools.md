---
type: docs
title: "How to: Handle conversation tool calls in .NET"
linkTitle: "Handle tool calls"
weight: 50015
description: Declare conversation tools, inspect model requests, and return tool results to the model
---

The conversation client in SDK `1.19.0` or later can declare function tools and return model-requested
tool calls. Declaring a tool does not execute it. Your application validates the request, invokes an allowed
operation, and sends the result back.

## Declare a function

```csharp
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.ConversationRoles;
using Dapr.AI.Conversation.Tools;

var messages = new List<IConversationMessage>
{
    new UserMessage { Content = [new MessageContent("What time is it in UTC?")] }
};

var options = new ConversationOptions("conversation")
{
    Tools =
    [
        new ToolFunction("get_utc_time")
        {
            Description = "Returns the current UTC time.",
            Parameters = new Dictionary<string, object?>
            {
                ["type"] = "object",
                ["properties"] = new Dictionary<string, object?>()
            }
        }
    ],
    ToolChoice = ToolChoice.Auto
};

var response = await conversationClient.ConverseAsync(
    [new ConversationInput(messages)], options, cancellationToken);
```

`ToolFunction.Parameters` describes a JSON schema, not a dictionary of argument values to execute.
`ToolChoice.None`, `Auto`, and `Required` select a policy, or `new ToolChoice("get_utc_time")` requests a
particular function by its case-sensitive name. Runtime/provider support for these policies can vary.

## Return tool results

Select a response choice according to your application policy. Preserve its assistant tool calls in the next
request, and correlate each result with the returned tool-call ID:

```csharp
if (response.Outputs.Count == 0 || response.Outputs[0].Choices.Count == 0)
{
    throw new InvalidOperationException("The model returned no conversation choices.");
}

var choice = response.Outputs[0].Choices[0];
if (choice.Message.ToolCalls.Count == 0)
{
    Console.WriteLine(choice.Message.Content);
    return;
}

messages.Add(new AssistantMessage
{
    Content = [new MessageContent(choice.Message.Content)],
    ToolCalls = choice.Message.ToolCalls
});

foreach (var toolCall in choice.Message.ToolCalls)
{
    if (toolCall is not CalledToolFunction call || call.Name != "get_utc_time")
    {
        throw new InvalidOperationException("The model requested an unsupported tool.");
    }

    messages.Add(new ToolMessage
    {
        Name = call.Name,
        Id = call.Id,
        Content = [new MessageContent(DateTimeOffset.UtcNow.ToString("O"))]
    });
}

var followUp = await conversationClient.ConverseAsync(
    [new ConversationInput(messages)],
    options with { ContextId = response.ConversationId, ToolChoice = ToolChoice.None },
    cancellationToken);
```

For tools with arguments, `CalledToolFunction.JsonArguments` contains the model's JSON. Parse it into a
known schema and validate values and authorization before executing anything. Never dispatch arbitrary
method names or commands directly from model output. Put a limit on tool-call rounds and make side-effecting
tools idempotent. The example disables further tool calls in the follow-up request.

For the Microsoft abstraction and its mapping limitations, see
[Microsoft.Extensions.AI integration]({{< ref dotnet-ai-extensions-howto.md >}}).
