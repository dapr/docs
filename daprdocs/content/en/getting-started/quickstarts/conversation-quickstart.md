---
type: docs
title: "Quickstart: Conversation"
linkTitle: Conversation
weight: 90
description: Get started with the Dapr conversation building block
---

{{% alert title="Alpha" color="warning" %}}
The conversation building block is currently in **alpha**. 
{{% /alert %}}

Let's take a look at how the [Dapr conversation building block]({{% ref conversation-overview %}}) makes interacting with Large Language Models (LLMs) easier. In this quickstart, you use the echo component to communicate with the mock LLM and ask it to define Dapr. 

You can try out this conversation quickstart by either:

- [Running the application in this sample with the Multi-App Run template file]({{% ref "#run-the-app-with-the-template-file" %}}), or
- [Running the application without the template]({{% ref "#run-the-app-without-the-template" %}})

{{% alert title="Note" color="primary" %}}
Currently, you can only use JavaScript for the quickstart sample using HTTP, not the JavaScript SDK.  
{{% /alert %}}

## Run the app with the template file

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabpane text=true >}}

 <!-- Python -->
{{% tab "Python" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/python/sdk/conversation
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

### Step 3: Launch the conversation service


```bash
dapr run -f .
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

**Expected output**

```
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

### What happened?

Running `dapr run -f .` in this Quickstart started [app.py]({{% ref "#programcs-conversation-app" %}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{% ref multi-app-dapr-run %}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: conversation
    appDirPath: ./conversation/
    command: ["python3", "app.py"]
```

#### Echo mock LLM component

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yaml) configures the echo LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{% ref "supported-conversation" %}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{% ref "howto-conversation-layer#use-the-openai-component" %}})

#### `app.py` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 

```python
from dapr.clients import DaprClient
from dapr.clients.grpc.conversation import ConversationInputAlpha2, ConversationMessage, ConversationMessageContent, ConversationMessageOfUser

with DaprClient() as d:
  text_input = "What is dapr?"
  provider_component = "echo"

  inputs = [
    ConversationInputAlpha2(messages=[ConversationMessage(of_user=ConversationMessageOfUser(content=[ConversationMessageContent(text=text_input)]))],
                            scrub_pii=True),
  ]

  print(f'Input sent: {text_input}')

  response = d.converse_alpha2(name=provider_component, inputs=inputs, temperature=0.7, context_id='chat-123')

  for output in response.outputs:
    print(f'Output response: {output.choices[0].message.content}')
```

{{% /tab %}}

 <!-- JavaScript -->
{{% tab "JavaScript" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/javascript/http/conversation
```

Install the dependencies:

```bash
npm install
```

### Step 3: Launch the conversation service

Navigate back to the `http` directory and start the conversation service with the following command:

```bash
dapr run -f .
```

**Expected output**

```
== APP - conversation == Conversation input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Output message: { outputs: [ { choices: [Array] } ] }
== APP - conversation == Output message: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected: [{"id":"0","function":{"name":"get_weather","arguments":"location,unit"}}]
```

### What happened?

Running `dapr run -f .` in this Quickstart started [conversation.go]({{% ref "#programcs-conversation-app" %}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{% ref multi-app-dapr-run %}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: conversation
    appDirPath: ./conversation/
    daprHTTPPort: 3502
    command: ["npm", "run", "start"]
```

#### Echo mock LLM component

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yaml) configures the echo LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{% ref "supported-conversation" %}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{% ref "howto-conversation-layer#use-the-openai-component" %}})

#### `index.js` conversation app

In the first part of the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 

```javascript
const daprHost = process.env.DAPR_HOST || "http://localhost";
const daprHttpPort = process.env.DAPR_HTTP_PORT || "3500";

const reqURL = `${daprHost}:${daprHttpPort}/v1.0-alpha2/conversation/${conversationComponentName}/converse`;

// Plain conversation
try {
  const converseInputBody = {
    inputs: [
      {
        messages: [
          {
            ofUser: {
              content: [
                {
                  text: "What is dapr?",
                },
              ],
            },
          },
        ],
      },
    ],
    parameters: {},
    metadata: {},
  };
  const response = await fetch(reqURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(converseInputBody),
  });

  console.log("Conversation input sent: What is dapr?");

  const data = await response.json();
  const result = data.outputs[0].choices[0].message.content;
  console.log("Output response:", result);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
```

In the second part of the application code:
- The app sends an input "What is the weather like in San Francisco in celsius" together with the definition of a tool that is available `get_weather`.
- The mock LLM echoes "What is the weather like in San Francisco in celsius?" and the function definition, which is detected in the response.

```javascript
try {
  const toolCallingInputBody = {
    inputs: [
      {
        messages: [
          {
            ofUser: {
              content: [
                {
                  text: "What is the weather like in San Francisco in celsius?",
                },
              ],
            },
          },
        ],
        scrubPii: false,
      },
    ],
    metadata: {
      api_key: "test-key",
      version: "1.0",
    },
    scrubPii: false,
    temperature: 0.7,
    tools: [
      {
        function: {
          name: "get_weather",
          description: "Get the current weather for a location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["celsius", "fahrenheit"],
                description: "The temperature unit to use",
              },
            },
            required: ["location"],
          },
        },
      },
    ],
    toolChoice: "auto",
  };
  const response = await fetch(reqURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toolCallingInputBody),
  });

  console.log(
          "Tool calling input sent: What is the weather like in San Francisco in celsius?"
  );

  const data = await response.json();

  const result = data?.outputs?.[0]?.choices?.[0]?.message?.content;
  console.log("Output message:", result);

  if (data?.outputs?.[0]?.choices?.[0]?.message?.toolCalls) {
    console.log(
            "Tool calls detected:",
            JSON.stringify(data.outputs[0].choices[0].message?.toolCalls)
    );
  } else {
    console.log("No tool calls in response");
  }
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
```

{{% /tab %}}

 <!-- .NET -->
{{% tab ".NET" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET 8 SDK+ installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/csharp/sdk
```

### Step 3: Launch the conversation service

Start the conversation service with the following command:

```bash
dapr run -f .
```

**Expected output**

```
== APP - conversation == Conversation input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
== APP - conversation == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP - conversation == Output message: What is the weather like in San Francisco in celsius?
== APP - conversation == Tool calls detected:
== APP - conversation == Tool call: {"id":0,"function":{"name":"get_weather","arguments":"location,unit"}}
== APP - conversation == Function name: get_weather
== APP - conversation == Function arguments: location,unit
```

### What happened?

Running `dapr run -f .` in this Quickstart started the [conversation Program.cs]({{% ref "#programcs-conversation-app" %}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{% ref multi-app-dapr-run %}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appDirPath: ./conversation/
    appID: conversation
    daprHTTPPort: 3500
    command: ["dotnet", "run"]
```

#### Echo mock LLM component

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components), the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yaml) configures the echo mock LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{% ref "supported-conversation" %}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{% ref "howto-conversation-layer#use-the-openai-component" %}})

#### `Program.cs` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 
- The app sends an input “What is the weather like in San Francisco in celsius” together with the definition of a tool that is available `get_weather`.
- The mock LLM echoes “What is the weather like in San Francisco in celsius?” and the function definition, which is detected in the response.


```csharp
using System.Text.Json;
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.ConversationRoles;
using Dapr.AI.Conversation.Extensions;
using Dapr.AI.Conversation.Tools;

const string conversationComponentName = "echo";
const string conversationText = "What is dapr?";
const string toolCallInput = "What is the weather like in San Francisco in celsius?";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprConversationClient();
var app = builder.Build();

//
// Setup

var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();

var conversationOptions = new ConversationOptions(conversationComponentName)
{
    ScrubPII = false,
    ToolChoice = ToolChoice.Auto,
    Temperature = 0.7,
    Tools = [
        new ToolFunction("function")
        {
            Name = "get_weather",
            Description = "Get the current weather for a location",
            Parameters = JsonSerializer.Deserialize<Dictionary<string, object?>>("""
            {
              "type": "object",
              "properties": {
                "location": {
                  "type": "string",
                  "description": "The city and state, e.g. San Francisco, CA"
                },
                "unit": {
                  "type": "string",
                  "enum": ["celsius", "fahrenheit"],
                  "description": "The temperature unit to use"
                }
              },
              "required": ["location"]
            }
            """) ?? throw new("Unable to parse tool function parameters."),
        },
    ],
};

//
// Simple Conversation

var conversationResponse = await conversationClient.ConverseAsync(
    [new ConversationInput(new List<IConversationMessage>
    {
        new UserMessage {
            Name = "TestUser",
            Content = [
                new MessageContent(conversationText),
            ],
        },
    })], 
    conversationOptions
);

Console.WriteLine($"Conversation input sent: {conversationText}");
Console.WriteLine($"Output response: {conversationResponse.Outputs.First().Choices.First().Message.Content}");

//
// Tool Calling

var toolCallResponse = await conversationClient.ConverseAsync(
    [new ConversationInput(new List<IConversationMessage>
    {
        new UserMessage {
            Name = "TestUser",
            Content = [
                new MessageContent(toolCallInput),
            ],
        },
    })], 
    conversationOptions
);

Console.WriteLine($"Tool calling input sent: {toolCallInput}");
Console.WriteLine($"Output message: {toolCallResponse.Outputs.First().Choices.First().Message.Content}");
Console.WriteLine("Tool calls detected:");

var functionToolCall = toolCallResponse.Outputs.First().Choices.First().Message.ToolCalls.First() as CalledToolFunction
    ?? throw new("Unexpected tool call type for demo.");

var toolCallJson = JsonSerializer.Serialize(new
{
    id = 0,
    function = new
    {
        name = functionToolCall.Name,
        arguments = functionToolCall.JsonArguments,
    },
});
Console.WriteLine($"Tool call: {toolCallJson}");
Console.WriteLine($"Function name: {functionToolCall.Name}");
Console.WriteLine($"Function arguments: {functionToolCall.JsonArguments}");
```

{{% /tab %}}



 <!-- Java -->
{{% tab "Java" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 17 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/java/sdk/conversation
```

Install the dependencies:

```bash
mvn clean install
```

### Step 3: Launch the conversation service

Navigate back to the sdk directory and start the conversation service with the following command:

```bash
dapr run -f .
```

**Expected output**

```
== APP - conversation == Input: What is Dapr?
== APP - conversation == Output response: What is Dapr?
```

### What happened?

Running `dapr run -f .` in this Quickstart started [Conversation.java]({{% ref "#programcs-conversation-app" %}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{% ref multi-app-dapr-run %}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following:

```yml
version: 1
common:
  resourcesPath: ../../components
apps:
  - appID: conversation
    appDirPath: ./conversation/target
    command: ["java", "-jar", "ConversationAIService-0.0.1-SNAPSHOT.jar"]
```

#### Echo mock LLM component

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yaml) configures the echo LLM component.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{% ref "supported-conversation" %}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{% ref "howto-conversation-layer#use-the-openai-component" %}})

#### `Conversation.java` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?".

```java
package com.service;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConversationInput;
import io.dapr.client.domain.ConversationRequest;
import io.dapr.client.domain.ConversationResponse;
import reactor.core.publisher.Mono;

import java.util.List;

public class Conversation {

  public static void main(String[] args) {
    String prompt = "What is Dapr?";

    try (DaprPreviewClient client = new DaprClientBuilder().buildPreviewClient()) {
      System.out.println("Input: " + prompt);

      ConversationInput daprConversationInput = new ConversationInput(prompt);

      // Component name is the name provided in the metadata block of the conversation.yaml file.
      Mono<ConversationResponse> responseMono = client.converse(new ConversationRequest("echo",
              List.of(daprConversationInput))
              .setContextId("contextId")
              .setScrubPii(true).setTemperature(1.1d));
      ConversationResponse response = responseMono.block();
      System.out.printf("Output response: %s", response.getConversationOutputs().get(0).getResult());
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
```

{{% /tab %}}

 <!-- Go -->
{{% tab "Go" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/go/sdk
```

### Step 3: Launch the conversation service

Start the conversation service with the following command:

```bash
dapr run -f .
```

**Expected output**

```
== APP - conversation-sdk == Input sent: What is dapr?
== APP - conversation-sdk == Output response: What is dapr?
== APP - conversation-sdk == Tool calling input sent: What is the weather like in San Francisco in celsius?'
== APP - conversation-sdk == Tool Call: Name: getWeather - Arguments: location,unit
== APP - conversation-sdk == Tool Call Output: The weather in San Francisco is 25 degrees Celsius
```

### What happened?

Running `dapr run -f .` in this Quickstart started [conversation.go]({{% ref "#programcs-conversation-app" %}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{% ref multi-app-dapr-run %}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appDirPath: ./conversation/
    appID: conversation
    daprHTTPPort: 3501
    command: ["go", "run", "."]
```

#### Echo mock LLM component

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yaml) configures the echo LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{% ref "supported-conversation" %}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{% ref "howto-conversation-layer#use-the-openai-component" %}})

#### `conversation.go` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?".
- The app sends an input “What is the weather like in San Francisco in celsius” together with the definition of a tool that is available `get_weather`.
- The mock LLM echoes “What is the weather like in San Francisco in celsius?” and the function definition, which is detected in the response.

```go
import (
  "context"
  "encoding/json"
  "fmt"
  "log"
  "strings"

  "github.com/invopop/jsonschema"
  "google.golang.org/protobuf/encoding/protojson"
  "google.golang.org/protobuf/types/known/structpb"

  dapr "github.com/dapr/go-sdk/client"
)

// createMapOfArgsForEcho is a helper function to deal with the issue with the echo component not returning args as a map but in csv format
func createMapOfArgsForEcho(s string) ([]byte, error) {
  m := map[string]any{}
  for _, p := range strings.Split(s, ",") {
    m[p] = p
  }
  return json.Marshal(m)
}

// getWeatherInLocation is an example function to use as a tool call
func getWeatherInLocation(request GetDegreesWeatherRequest, defaultValues GetDegreesWeatherRequest) string {
  location := request.Location
  unit := request.Unit
  if location == "location" {
    location = defaultValues.Location
  }
  if unit == "unit" {
    unit = defaultValues.Unit
  }
  return fmt.Sprintf("The weather in %s is 25 degrees %s", location, unit)
}

type GetDegreesWeatherRequest struct {
  Location string `json:"location" jsonschema:"title=Location,description=The location to look up the weather for"`
  Unit     string `json:"unit" jsonschema:"enum=celsius,enum=fahrenheit,description=Unit"`
}

// GenerateFunctionTool helper method to create jsonschema input
func GenerateFunctionTool[T any](name, description string) (*dapr.ConversationToolsAlpha2, error) {
  reflector := jsonschema.Reflector{
    AllowAdditionalProperties: false,
    DoNotReference:            true,
  }
  var v T

  schema := reflector.Reflect(v)

  schemaBytes, err := schema.MarshalJSON()
  if err != nil {
    return nil, err
  }

  var protoStruct structpb.Struct
  if err := protojson.Unmarshal(schemaBytes, &protoStruct); err != nil {
    return nil, fmt.Errorf("converting jsonschema to proto Struct: %w", err)
  }

  return (*dapr.ConversationToolsAlpha2)(&dapr.ConversationToolsFunctionAlpha2{
    Name:        name,
    Description: &description,
    Parameters:  &protoStruct,
  }), nil
}

// createUserMessageInput is a helper method to create user messages in expected proto format
func createUserMessageInput(msg string) *dapr.ConversationInputAlpha2 {
  return &dapr.ConversationInputAlpha2{
    Messages: []*dapr.ConversationMessageAlpha2{
      {
        ConversationMessageOfUser: &dapr.ConversationMessageOfUserAlpha2{
          Content: []*dapr.ConversationMessageContentAlpha2{
            {
              Text: &msg,
            },
          },
        },
      },
    },
  }
}

func main() {
  client, err := dapr.NewClient()
  if err != nil {
    panic(err)
  }

  inputMsg := "What is dapr?"
  conversationComponent := "echo"

  request := dapr.ConversationRequestAlpha2{
    Name:   conversationComponent,
    Inputs: []*dapr.ConversationInputAlpha2{createUserMessageInput(inputMsg)},
  }

  fmt.Println("Input sent:", inputMsg)

  resp, err := client.ConverseAlpha2(context.Background(), request)
  if err != nil {
    log.Fatalf("err: %v", err)
  }

  fmt.Println("Output response:", resp.Outputs[0].Choices[0].Message.Content)

  tool, err := GenerateFunctionTool[GetDegreesWeatherRequest]("getWeather", "get weather from a location in the given unit")
  if err != nil {
    log.Fatalf("err: %v", err)
  }

  weatherMessage := "Tool calling input sent: What is the weather like in San Francisco in celsius?'"
  requestWithTool := dapr.ConversationRequestAlpha2{
    Name:   conversationComponent,
    Inputs: []*dapr.ConversationInputAlpha2{createUserMessageInput(weatherMessage)},
    Tools:  []*dapr.ConversationToolsAlpha2{tool},
  }

  resp, err = client.ConverseAlpha2(context.Background(), requestWithTool)
  if err != nil {
    log.Fatalf("err: %v", err)
  }

  fmt.Println(resp.Outputs[0].Choices[0].Message.Content)
  for _, toolCalls := range resp.Outputs[0].Choices[0].Message.ToolCalls {
    fmt.Printf("Tool Call: Name: %s - Arguments: %v\n", toolCalls.ToolTypes.Name, toolCalls.ToolTypes.Arguments)

    // parse the arguments and execute tool
    args := []byte(toolCalls.ToolTypes.Arguments)
    if conversationComponent == "echo" {
      // The echo component does not return a compliant tool calling response in json format but rather returns a csv
      args, err = createMapOfArgsForEcho(toolCalls.ToolTypes.Arguments)
      if err != nil {
        log.Fatalf("err: %v", err)
      }
    }

    // find the tool (only one in this case) and execute
    for _, toolInfo := range requestWithTool.Tools {
      if toolInfo.Name == toolCalls.ToolTypes.Name && toolInfo.Name == "getWeather" {
        var reqArgs GetDegreesWeatherRequest
        if err = json.Unmarshal(args, &reqArgs); err != nil {
          log.Fatalf("err: %v", err)
        }
        // execute tool
        toolExecutionOutput := getWeatherInLocation(reqArgs, GetDegreesWeatherRequest{Location: "San Francisco", Unit: "Celsius"})
        fmt.Printf("Tool Call Output: %s\n", toolExecutionOutput)
      }
    }
  }
}
```

{{% /tab %}}

{{< /tabpane >}}

## Run the app without the template

{{< tabpane text=true >}}

 <!-- Python -->
{{% tab "Python" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/python/sdk/conversation
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

### Step 3: Launch the conversation service

Navigate back to the `sdk` directory and start the conversation service with the following command:

```bash
dapr run --app-id conversation --resources-path ../../../components -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

**Expected output**

```
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

{{% /tab %}}

 <!-- JavaScript -->
{{% tab "JavaScript" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/javascript/http/conversation
```

Install the dependencies:

```bash
npm install
```

### Step 3: Launch the conversation service


```bash
dapr run --app-id conversation --resources-path ../../../components -- npm run start
```

**Expected output**

```
== APP == Conversation input sent: What is dapr?
== APP == Output response: What is dapr?
== APP == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP == Output message: What is the weather like in San Francisco in celsius?
== APP == Tool calls detected: [{"id":"0","function":{"name":"get_weather","arguments":"location,unit"}}]
```

{{% /tab %}}

 <!-- .NET -->
{{% tab ".NET" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET 8+ SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/csharp/sdk/conversation
```

Install the dependencies:

```bash
dotnet build
```

### Step 3: Launch the conversation service

Start the conversation service with the following command:

```bash
dapr run --app-id conversation --resources-path ../../../components/ -- dotnet run
```

**Expected output**

```
== APP == Conversation input sent: What is dapr?
== APP == Output response: What is dapr?
== APP == Tool calling input sent: What is the weather like in San Francisco in celsius?
== APP == Output message: What is the weather like in San Francisco in celsius?
== APP == Tool calls detected:
== APP == Tool call: {"id":0,"function":{"name":"get_weather","arguments":"location,unit"}}
== APP == Function name: get_weather
== APP == Function arguments: location,unit
```

{{% /tab %}}
 
 <!-- Java -->
{{% tab "Java" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 17 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/java/sdk/conversation
```

Install the dependencies:

```bash
mvn clean install
```

### Step 3: Launch the conversation service

Start the conversation service with the following command:

```bash
dapr run --app-id conversation --resources-path ../../../components/ -- java -jar target/ConversationAIService-0.0.1-SNAPSHOT.jar com.service.Conversation
```

**Expected output**

```
== APP == Input: What is Dapr?
== APP == Output response: What is Dapr?
```

{{% /tab %}}

 <!-- Go -->
{{% tab "Go" %}}


### Step 1: Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 2: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/conversation).

```bash
git clone https://github.com/dapr/quickstarts.git
```

From the root of the Quickstarts directory, navigate into the conversation directory:

```bash
cd conversation/go/sdk/conversation
```

Install the dependencies:

```bash
go build .
```

### Step 3: Launch the conversation service

Start the conversation service with the following command:

```bash
dapr run --app-id conversation --resources-path ../../../components/ -- go run .
```

**Expected output**

```
== APP == dapr client initializing for: 127.0.0.1:53826
== APP == Input sent: What is dapr?
== APP == Output response: What is dapr?
== APP == Tool calling input sent: What is the weather like in San Francisco in celsius?'
== APP == Tool Call: Name: getWeather - Arguments: location,unit
== APP == Tool Call Output: The weather in San Francisco is 25 degrees Celsius
```

{{% /tab %}}

{{< /tabpane >}}

## Demo

Watch the demo presented during [Diagrid's Dapr v1.15 celebration](https://www.diagrid.io/videos/dapr-1-15-deep-dive) to see how the conversation API works using the .NET SDK.

{{< youtube id=NTnwoDhHIcQ start=5444 >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- HTTP samples of this quickstart:
  - [Python](https://github.com/dapr/quickstarts/tree/master/conversation/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/conversation/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/conversation/csharp/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/conversation/go/http)
- Learn more about [the conversation building block]({{% ref conversation-overview %}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
