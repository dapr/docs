---
type: docs
title: "Dapr Conversation JavaScript SDK"
linkTitle: "Conversation"
weight: 100000
description: Converse with large language models using the Dapr JavaScript SDK
---

Use `DaprClient.conversation` to send messages to a large language model through a Dapr conversation component. The JavaScript SDK supports the Conversation Alpha2 API over HTTP and gRPC, including message history, function tool calls, structured output, PII scrubbing, prompt cache retention, and token usage statistics.

These guides target **`@dapr/dapr` 3.19.0-rc.4 or later**. The underlying [Conversation API]({{% ref conversation_api.md %}}) is alpha. Basic Alpha2 requests require Dapr runtime **1.16 or later**; some options require newer runtimes and support from the selected component and model.

| Guide | Description |
| ----- | ----------- |
| [How to: Converse with an LLM]({{% ref js-conversation-howto.md %}}) | Install the package, configure a component, and send your first request. |
| [Conversation client usage]({{% ref js-conversation-client-usage.md %}}) | Configure the client, work with messages and responses, and use advanced request options. |
| [How to: Call tools]({{% ref js-conversation-tools-howto.md %}}) | Define functions, validate model-generated arguments, and return tool results to the model. |
