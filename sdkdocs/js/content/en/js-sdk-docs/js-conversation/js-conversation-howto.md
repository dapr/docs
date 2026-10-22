---
type: docs
title: "How to: Converse with an LLM using the Dapr JavaScript SDK"
linkTitle: "How to: Converse with an LLM"
weight: 50010
description: Configure a conversation component and send messages using the Dapr JavaScript SDK
---

Use `client.conversation.converse(request)` to send role-based messages to a configured conversation component. You do not need a `DaprServer` or a provider-specific JavaScript SDK.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}}) with **Dapr runtime 1.16 or later**
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, **version 3.19.0-rc.4 or later**

## Installation

In your application directory, initialize an npm project if you do not already have one, then install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0-rc.4
```

The examples use JavaScript ES modules and run as `.mjs` files without a TypeScript compiler. The same APIs are available in TypeScript, with request and response types exported from `@dapr/dapr`.

## Configure a conversation component

Create a `components` directory and save the following as `components\conversation.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

The echo component returns the input text without calling an LLM. Use it to check local connectivity, not to test model reasoning, structured output, or tool calling.

The component's `metadata.name`, `echo`, is the `name` passed in a conversation request. It is not the component type or the YAML file name.

## Send a message

Save the following as `app.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

try {
  const response = await client.conversation.converse({
    name: "echo",
    inputs: [
      {
        messages: [
          { ofUser: { content: [{ text: "What is Dapr?" }] } },
        ],
      },
    ],
  });

  for (const output of response.outputs) {
    for (const choice of output.choices) {
      console.log("Finish reason:", choice.finishReason);
      if (choice.message) {
        console.log("Conversation output:", choice.message.content);
      }
    }
  }
} finally {
  await client.stop();
}
```

Start the application with a Dapr sidecar:

```sh
dapr run --app-id conversation-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path ./components -- node app.mjs
```

The echoed message is available at `response.outputs[0].choices[0].message.content`. Unlike Alpha1 examples in other SDKs, the JavaScript Alpha2 response does not have an `output.result` property.

To use gRPC, change `communicationProtocol` to `CommunicationProtocolEnum.GRPC` and `daprPort` to `"50001"`. The request and response objects are the same for both protocols.

## Use an LLM provider

Replace the echo component with a [supported conversation component]({{% ref supported-conversation %}}). For example, use this OpenAI component with a local [environment variable secret store]({{% ref setup-secret-store.md %}}):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: conversation-secrets
spec:
  type: secretstores.local.env
  version: v1
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: llm
spec:
  type: conversation.openai
  version: v1
  metadata:
    - name: key
      secretKeyRef:
        name: OPENAI_API_KEY
        key: OPENAI_API_KEY
    - name: model
      value: gpt-4o-mini
auth:
  secretStore: conversation-secrets
```

Set `OPENAI_API_KEY` in the environment inherited by `dapr run`, restart the sidecar, and change the request's `name` to `"llm"`. Do not put provider credentials in request `metadata` or commit them to a component file. See the [OpenAI component reference]({{% ref "/reference/components-reference/supported-conversation/openai.md" %}}) for provider settings and model support.

## Next steps

Read the [client usage guidance]({{% ref js-conversation-client-usage.md %}}) for message history, structured output, caching, token limits, and errors. Follow the [tool-calling guide]({{% ref js-conversation-tools-howto.md %}}) to let a model request application-defined functions.
