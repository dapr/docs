---
type: docs
title: "How to: Call tools with the Dapr Conversation JavaScript SDK"
linkTitle: "How to: Call tools"
weight: 50030
description: Define conversation tools, validate function arguments, and send tool results back to an LLM in JavaScript
---

Tool calling lets a model request an application-defined function. Dapr and the JavaScript SDK transport tool definitions and calls; **your application validates arguments, authorizes and executes the function, and sends the result back**.

## Prerequisites

Complete the [conversation setup guide]({{% ref js-conversation-howto.md %}}) using `@dapr/dapr` **3.19.0-rc.4 or later**, Dapr runtime **1.16 or later**, and a component/model that supports tool calling. The echo component is not sufficient.

## Define a tool and handle its result

The following example uses the `llm` component configured in the setup guide. Save it as `tools.mjs` and run it with the same `dapr run` command, replacing `app.mjs` with `tools.mjs`.

```javascript
import { DaprClient } from "@dapr/dapr";

const client = new DaprClient({ daprHost: "127.0.0.1", daprPort: "3500" });
const messages = [
  { ofUser: { content: [{ text: "Look up the description of Dapr." }] } },
];
const tools = [
  {
    function: {
      name: "lookupProject",
      description: "Look up a project description by its exact name.",
      parameters: {
        type: "object",
        properties: { name: { type: "string", enum: ["Dapr"] } },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
];

try {
  const first = await client.conversation.converse({
    name: "llm",
    inputs: [{ messages }],
    tools,
    toolChoice: "lookupProject",
  });

  const choice = first.outputs[0]?.choices[0];
  const calls = choice?.message?.toolCalls;
  if (choice?.finishReason !== "tool_calls" || !calls?.length) {
    throw new Error("Expected the model to request a tool");
  }

  messages.push({
    ofAssistant: {
      content: [{ text: choice.message.content }],
      toolCalls: calls,
    },
  });

  const seenIds = new Set();
  for (const call of calls) {
    if (!call.id || seenIds.has(call.id)) {
      throw new Error("Missing or duplicate tool call ID");
    }
    seenIds.add(call.id);
    if (call.function.name !== "lookupProject") {
      throw new Error("Unexpected tool function");
    }

    const args = JSON.parse(call.function.arguments);
    if (
      args === null ||
      typeof args !== "object" ||
      Array.isArray(args) ||
      args.name !== "Dapr" ||
      Object.keys(args).length !== 1
    ) {
      throw new Error("Invalid lookupProject arguments");
    }

    const result = {
      name: args.name,
      description: "Dapr provides APIs for building distributed applications.",
    };
    messages.push({
      ofTool: {
        toolId: call.id,
        name: call.function.name,
        content: [{ text: JSON.stringify(result) }],
      },
    });
  }

  const final = await client.conversation.converse({
    name: "llm",
    contextId: first.contextId,
    inputs: [{ messages }],
    tools,
    toolChoice: "none",
  });

  const answer = final.outputs[0]?.choices[0];
  if (!answer?.message || answer.finishReason !== "stop") {
    throw new Error("Expected a completed answer after the tool results");
  }
  console.log(answer.message.content);
} finally {
  await client.stop();
}
```

Tool definitions use `{ function: { name, description, parameters } }`. Do not add a provider-native `type: "function"` wrapper. `parameters` is a JSON Schema object; the function's `name` must be nonempty.

Returned `call.function.arguments` is model-generated **string data**, not a parsed object or trusted instruction. The example allowlists one read-only function and validates its exact arguments. For real tools, also enforce authorization, input limits, and any required confirmation before side effects. Never use `eval` or dispatch arbitrary function names supplied by the model.

## Preserve the tool-call history

For each selected assistant choice, append the assistant message containing the original tool calls, followed by a tool result for **every** call. Preserve each call's `id`, function name, and arguments. Set the tool result's `toolId` to that call's ID, not its function name.

Tool-only assistant messages can omit `content`. Tool result messages require a nonempty `name` and a `content` array. An assistant can request multiple calls in one turn, so do not process only `toolCalls[0]`. Alternative response choices are separate conversation branches.

Resend the original messages, assistant tool calls, and tool results in order on the next request. Passing only `contextId` does not preserve that history.

## Choose a tool policy

| `toolChoice` | Behavior |
| ------------ | -------- |
| `"auto"` | The model can answer directly or request tools. |
| `"none"` | The model must answer without calling tools. |
| `"required"` | The model must request one or more tools. |
| An exact function name, such as `"lookupProject"` | Request that specific function. |

The chosen component and model must support the policy. A named choice must match a declared tool; requiring tools without providing definitions is invalid.

The example forces a named tool on the first request and disables tools on the second, bounding the interaction to two requests. If you use `"auto"` for a repeated tool loop, handle direct text responses, limit the number of turns and calls, and surface failures rather than retrying indefinitely.
