---
type: docs
title: "Azure OpenAI binding spec"
linkTitle: "Azure OpenAI"
description: "Detailed documentation on the Azure OpenAI binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/openai/"
---

## Component format

To setup an Azure OpenAI binding create a component of type `bindings.azure.openai`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.
See [this](https://learn.microsoft.com/azure/cognitive-services/openai/overview/) for the documentation for Azure OpenAI Service.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.openai
  version: v1
  metadata:
  - name: apiKey # Required
    value: "1234567890abcdef"
  - name: endpoint # Required
    value: "https://myopenai.openai.azure.com"
  - name: deploymentId # Required
    value: "my-model"
```
{{% alert title="Warning" color="warning" %}}
The above example uses `apiKey` as  a plain string. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| `endpoint` | Y | Output | Azure OpenAI service endpoint URL. | `"https://myopenai.openai.azure.com"` |
| `apiKey` | Y* | Output | The access key of the Azure OpenAI service. Only required when not using Azure AD authentication. | `"1234567890abcdef"` |
| `deploymentId` | Y | Output | The name of the model deployment. | `"my-model"` |
| `azureTenantId` | Y* | Input | The tenant ID of the Azure OpenAI resource. Only required when `apiKey` is not provided.  | `"tenentID"` |
| `azureClientId` | Y* | Input | The client ID that should be used by the binding to create or update the Azure OpenAI Subscription and to authenticate incoming messages. Only required when `apiKey` is not provided.| `"clientId"` |
| `azureClientSecret` | Y* | Input | The client secret that should be used by the binding to create or update the Azure OpenAI Subscription and to authenticate incoming messages. Only required when `apiKey` is not provided. | `"clientSecret"` |

### Azure Active Directory (AAD) authentication

The Azure OpenAI binding component supports authentication using all Azure Active Directory mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of AAD authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

#### Example Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.openai
  version: v1
  metadata:
  - name: endpoint
    value: "https://myopenai.openai.azure.com"
  - name: deploymentId
    value: "my-model"
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
```
## Binding support

This component supports **output binding** with the following operations:

- `completion` : [Completion API](#completion-api)
- `chat-completion` : [Chat Completion API](#chat-completion-api)

### Completion API

To call the completion API with a prompt, invoke the Azure OpenAI binding with a `POST` method and the following JSON body:

```json
{
  "operation": "create",
  "data": {
    "prompt": "A dog is",
    "maxTokens":5
    }
}
```

The data parameters are:

- `prompt` - string that specifies the prompt to generate completions for.
- `maxTokens` - (optional) defines the max number of tokens to generate. Defaults to 16 for completion API.
- `temperature` - (optional) defines the sampling temperature between 0 and 2. Higher values like 0.8 make the output more random, while lower values like 0.2 make it more focused and deterministic. Defaults to 1.0 for completion API.
- `topP` - (optional) defines the sampling temperature. Defaults to 1.0 for completion API.
- `n` - (optional) defines the number of completions to generate. Defaults to 1 for completion API.
- `presencePenalty` - (optional) Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Defaults to 0.0 for completion API.
- `frequencyPenalty` - (optional) Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. Defaults to 0.0 for completion API.

Read more about the importance and usage of these parameters in the [Azure OpenAI API documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference).
#### Examples

{{< tabs Linux >}}
  {{% codetab %}}
  ```bash
  curl -d '{ "data": {"prompt": "A dog is ", "maxTokens":15}, "operation": "completion" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body contains the following JSON:

```json
[
  {
    "finish_reason": "length",
    "index": 0,
    "text": " a pig in a dress.\n\nSun, Oct 20, 2013"
  },
  {
    "finish_reason": "length",
    "index": 1,
    "text": " the only thing on earth that loves you\n\nmore than he loves himself.\"\n\n"
  }
]

```

### Chat Completion API

To perform a chat-completion operation, invoke the Azure OpenAI binding with a `POST` method and the following JSON body:

```json
{
    "operation": "chat-completion",
    "data": {
        "messages": [
            {
                "role": "system",
                "message": "You are a bot that gives really short replies"
            },
            {
                "role": "user",
                "message": "Tell me a joke"
            }
        ],
        "n": 2,
        "maxTokens": 30,
        "temperature": 1.2
    }
}
```

The data parameters are:

- `messages` - array of messages that will be used to generate chat completions.
Each message is of the form:
  - `role` - string that specifies the role of the message. Can be either `user`, `system` or `assistant`.
  - `message` - string that specifies the conversation message for the role.
- `maxTokens` - (optional) defines the max number of tokens to generate. Defaults to 16 for the chat completion API.
- `temperature` - (optional) defines the sampling temperature between 0 and 2. Higher values like 0.8 make the output more random, while lower values like 0.2 make it more focused and deterministic. Defaults to 1.0 for the chat completion API.
- `topP` - (optional) defines the sampling temperature. Defaults to 1.0 for the chat completion API.
- `n` - (optional) defines the number of completions to generate. Defaults to 1 for the chat completion API.
- `presencePenalty` - (optional) Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Defaults to 0.0 for the chat completion API.
- `frequencyPenalty` - (optional) Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. Defaults to 0.0 for the chat completion API.

#### Example

{{< tabs Linux >}}

  {{% codetab %}}
  ```bash
curl -d '{
    "data": {
        "messages": [
            {
                "role": "system",
                "message": "You are a bot that gives really short replies"
            },
            {
                "role": "user",
                "message": "Tell me a joke"
            }
        ],
        "n": 2,
        "maxTokens": 30,
        "temperature": 1.2
    },
    "operation": "chat-completion"
}' \
http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### Response

The response body contains the following JSON:

```json
[
  {
    "finish_reason": "stop",
    "index": 0,
    "message": {
      "content": "Why was the math book sad? Because it had too many problems.",
      "role": "assistant"
    }
  },
  {
    "finish_reason": "stop",
    "index": 1,
    "message": {
      "content": "Why did the tomato turn red? Because it saw the salad dressing!",
      "role": "assistant"
    }
  }
]

```


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [Azure OpenAI Rest examples](https://learn.microsoft.com/azure/ai-services/openai/reference)
