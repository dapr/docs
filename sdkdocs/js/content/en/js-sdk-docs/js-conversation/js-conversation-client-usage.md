---
type: docs
title: "Dapr Conversation JavaScript client usage"
linkTitle: "Conversation client usage"
weight: 50020
description: Configure conversation requests, message history, structured output, caching, and response handling in JavaScript
---

`DaprClient.conversation` exposes one asynchronous method:

```typescript
converse(request: ConversationRequestAlpha2): Promise<ConversationResponseAlpha2>;
```

Import these types, and the other `Conversation*` types used below, from `@dapr/dapr`. This guidance targets **3.19.0 or later**.

## Runtime and provider support

| Capability | Minimum Dapr runtime |
| ---------- | -------------------- |
| Alpha2 messages, tool calling, temperature, and PII scrubbing | 1.16 |
| `responseFormat`, `promptCacheRetention`, and token usage statistics | 1.17 |
| Model name in the response | 1.18 |
| `maxTokens` | 1.19 |

Availability also depends on the conversation component and model. An SDK option does not make an unsupported provider feature available. See the [Conversation API reference]({{% ref conversation_api.md %}}) and your [component reference]({{% ref supported-conversation %}}).

## Client configuration and lifetime

Create a long-lived `DaprClient` and reuse it across requests. Call `await client.stop()` when the application shuts down, not after each operation on a shared client.

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

Use `CommunicationProtocolEnum.HTTP` with the sidecar's HTTP port for HTTP requests. The SDK calls `/v1.0-alpha2/conversation/{name}/converse` over HTTP and `ConverseAlpha2` over gRPC. You pass plain JavaScript objects, not protobuf messages or provider-native request objects.

The client also supports `DAPR_HTTP_ENDPOINT` and `DAPR_GRPC_ENDPOINT` for endpoint configuration. `DAPR_API_TOKEN` authenticates to the sidecar; it is separate from the provider API key configured on the component. See [JavaScript client configuration]({{% ref js-client %}}) for shared client options.

## Messages and conversation history

A request contains one or more `inputs`, each with a nonempty `messages` array. Each message must contain **exactly one** role property:

| Role property | Content |
| ------------- | ------- |
| `ofDeveloper` | Developer instructions, with optional participant `name`. |
| `ofSystem` | System instructions, with optional participant `name`. |
| `ofUser` | User input, with optional participant `name`. |
| `ofAssistant` | Previous assistant text and/or `toolCalls`, with optional participant `name`. Content can be omitted for a tool-only message. |
| `ofTool` | Function result with required nonempty `name`, text content, and `toolId` to correlate with the assistant's tool call. |

Message content is an array of `{ text: string }` objects, not a single string. The SDK's conversation message types support text, not image or audio content parts.

The following example reuses a configured `client` and an LLM component named `llm`:

```javascript
const messages = [
  { ofSystem: { content: [{ text: "Give concise, factual answers." }] } },
  { ofUser: { name: "reader", content: [{ text: "What is Dapr?" }] } },
];

const response = await client.conversation.converse({
  name: "llm",
  contextId: "chat-123",
  inputs: [{ messages }],
});

const choice = response.outputs[0]?.choices[0];
if (!choice?.message || choice.finishReason !== "stop") {
  throw new Error("Expected a completed text response before continuing the chat");
}

messages.push(
  { ofAssistant: { content: [{ text: choice.message.content }] } },
  { ofUser: { content: [{ text: "How does it help with pub/sub?" }] } },
);

const followup = await client.conversation.converse({
  name: "llm",
  contextId: response.contextId || "chat-123",
  inputs: [{ messages }],
});
```

`contextId` is a correlation value, **not server-side chat memory**. Retain the history in your application and resend the messages needed for every turn. Choose one assistant choice when continuing a conversation; do not merge alternative choices into the same history.

## Request options

| Property | Description |
| -------- | ----------- |
| `name` | Required, nonempty component name. |
| `inputs` | Required, nonempty array of conversation inputs. |
| `contextId` | Optional correlation value. |
| `temperature` | Optional finite number controlling randomness. The component and model determine the accepted range. Explicit `0` is preserved. |
| `scrubPii` | Optional boolean enabling PII obfuscation in response text. Set `inputs[].scrubPii` independently for input text. |
| `metadata` | Optional string-to-string conversation tags, not provider configuration or credentials. |
| `tools`, `toolChoice` | Optional function definitions and tool selection policy. See [tool calling]({{% ref js-conversation-tools-howto.md %}}). |
| `responseFormat` | Optional JSON Schema object for structured output. |
| `promptCacheRetention` | Optional nonnegative `Temporal.Duration` for prompt cache retention. |
| `maxTokens` | Optional integer from `1` through `2147483647` limiting generated completion tokens. |
| `parameters` | Optional JSON object reserved by Dapr. It is not a general-purpose provider options bag. The SDK encodes its values internally. |

### PII scrubbing and metadata

Input and output scrubbing are separate settings:

```javascript
const response = await client.conversation.converse({
  name: "llm",
  inputs: [
    {
      scrubPii: true,
      messages: [
        { ofUser: { content: [{ text: "Contact me at reader@example.com." }] } },
      ],
    },
  ],
  scrubPii: true,
  temperature: 0,
  metadata: { user_id: "user-123", session_id: "chat-123" },
});
```

Metadata supports up to 16 pairs, with keys up to 64 characters and values up to 512 characters. Keep API keys and component connection settings in component configuration or referenced secrets.

### Structured output

Pass the JSON Schema directly as `responseFormat`, not an OpenAI `response_format` wrapper or a JSON-encoded string:

```javascript
const response = await client.conversation.converse({
  name: "llm",
  inputs: [
    {
      messages: [
        { ofUser: { content: [{ text: "Answer with the name of Dapr's pub/sub building block." }] } },
      ],
    },
  ],
  responseFormat: {
    type: "object",
    properties: { answer: { type: "string" } },
    required: ["answer"],
    additionalProperties: false,
  },
});

const choice = response.outputs[0]?.choices[0];
if (!choice?.message || choice.finishReason !== "stop") {
  throw new Error("Expected a completed structured response");
}
const value = JSON.parse(choice.message.content);
if (
  value === null ||
  typeof value !== "object" ||
  Array.isArray(value) ||
  typeof value.answer !== "string" ||
  Object.keys(value).length !== 1
) {
  throw new Error("Response does not match the expected answer schema");
}
console.log(value.answer);
```

The SDK returns content as a string; it does not parse or validate the generated JSON against your schema. Handle JSON parsing failures and validate the result before using it. A truncated or filtered response might not contain complete JSON.

### Prompt cache retention and token limits

Import `Temporal` from the SDK to construct the retention duration:

```javascript
import { Temporal } from "@dapr/dapr";

const response = await client.conversation.converse({
  name: "llm",
  inputs: [
    {
      messages: [
        { ofUser: { content: [{ text: "Explain Dapr in one paragraph." }] } },
      ],
    },
  ],
  promptCacheRetention: Temporal.Duration.from({ minutes: 30 }),
  maxTokens: 200,
});
```

`promptCacheRetention` must be a fixed, nonnegative duration. Days, hours, minutes, seconds, and subsecond fields are supported; calendar years, months, and weeks are not. Fields must be safe integers and the total must fit the protobuf duration range. Do not pass milliseconds as a number or a duration string instead of a `Temporal.Duration`.

Retention is a request to the component/provider, not a guarantee of a cache hit or stored conversation history. Provider-specific caching limits still apply.

Some components also expose `responseCacheTTL` in their YAML metadata to cache complete responses. This is component configuration, separate from `promptCacheRetention`; do not try to configure it through request `metadata`.

`maxTokens` requires Dapr 1.19 or later and overrides the component's token cap where supported. Check `finishReason` for `"length"` rather than treating a capped answer as complete.

## Responses and token usage

The SDK returns `ConversationResponseAlpha2` with an optional `contextId` and an `outputs` array. Each output contains `choices`, an optional `model`, and optional `usage`. Each choice contains `index`, `finishReason`, and an optional `message`. A message has string `content` and a `toolCalls` array.

Do not assume there is only one output or choice, or that every choice has text. Common finish reasons are `"stop"`, `"length"`, `"tool_calls"`, and `"content_filter"`; handle other provider values too.

```javascript
for (const output of response.outputs) {
  console.log("Model:", output.model);
  if (output.usage) {
    console.log("Total tokens:", output.usage.totalTokens);
    console.log("Prompt tokens:", output.usage.promptTokens);
    console.log("Completion tokens:", output.usage.completionTokens);
    console.log("Cached tokens:", output.usage.promptTokensDetails?.cachedTokens);
    console.log("Reasoning tokens:", output.usage.completionTokensDetails?.reasoningTokens);
  }
}
```

Prompt token details also include `audioTokens`. Completion token details include `acceptedPredictionTokens`, `rejectedPredictionTokens`, `audioTokens`, and `reasoningTokens`. These are provider-reported statistics, not evidence that the SDK accepts audio input. Usage and detail objects can be absent; some components return zero counts when the provider omits usage.

Token counts and choice indexes are JavaScript numbers. The SDK rejects values outside the safe-integer range instead of silently losing precision.

## Errors and API limits

`converse` rejects its promise for invalid local input, sidecar errors, provider failures, or response conversion failures. Invalid message roles or content and invalid JSON objects produce `TypeError`; invalid numeric limits and durations can produce `RangeError`. Schema and parameter objects must contain only finite JSON values, without cycles, `undefined`, `BigInt`, or class instances.

Catch errors at your application's error boundary and report or propagate them. Do not turn a failed request into a successful empty answer. Provider errors can include rate limits, invalid tool histories, unsupported options, and authentication failures; their representation can differ between HTTP and gRPC.

The exposed method returns a complete response. It does **not** expose streaming completions, automatic tool execution, or a per-request `AbortSignal`, timeout, or cancellation parameter. Configure [Dapr resiliency policies]({{% ref resiliency-overview.md %}}) for sidecar-to-provider timeouts and retries. A JavaScript `Promise.race` timeout alone does not cancel the underlying request.
