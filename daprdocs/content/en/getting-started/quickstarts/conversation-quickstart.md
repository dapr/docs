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

Let's take a look at how the [Dapr conversation building block]({{< ref conversation-overview.md >}}) makes interacting with Large Language Models (LLMs) easier. In this quickstart, you use the echo component to communicate with the mock LLM and ask it for a poem about Dapr. 

You can try out this conversation quickstart by either:

- [Running the application in this sample with the Multi-App Run template file]({{< ref "#run-the-app-with-the-template-file" >}}), or
- [Running the application without the template]({{< ref "#run-the-app-without-the-template" >}})

{{% alert title="Note" color="primary" %}}
Currently, only the HTTP quickstart sample is available in Python and JavaScript.  
{{% /alert %}}

## Run the app with the template file

{{< tabs Python JavaScript ".NET" Go >}}

 <!-- Python -->
{{% codetab %}}


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
cd conversation/python/http/conversation
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

### Step 3: Launch the conversation service

Navigate back to the `http` directory and start the conversation service with the following command:

```bash
dapr run -f .
```

**Expected output**

```
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

### What happened?

When you ran `dapr init` during Dapr install, the [`dapr.yaml` Multi-App Run template file]({{< ref "#dapryaml-multi-app-run-template-file" >}}) was generated in the `.dapr/components` directory. 

Running `dapr run -f .` in this Quickstart started [conversation.go]({{< ref "#programcs-conversation-app" >}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

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

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yml) configures the echo LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{< ref "supported-conversation" >}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{< ref "howto-conversation-layer.md#use-the-openai-component" >}})

#### `app.py` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 

```python
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)

base_url = os.getenv('BASE_URL', 'http://localhost') + ':' + os.getenv(
                    'DAPR_HTTP_PORT', '3500')

CONVERSATION_COMPONENT_NAME = 'echo'

input = {
		'name': 'echo',
		'inputs': [{'message':'What is dapr?'}],
		'parameters': {},
		'metadata': {}
    }

# Send input to conversation endpoint
result = requests.post(
	url='%s/v1.0-alpha1/conversation/%s/converse' % (base_url, CONVERSATION_COMPONENT_NAME),
	json=input
)

logging.info('Input sent: What is dapr?')

# Parse conversation output
data = result.json()
output = data["outputs"][0]["result"]

logging.info('Output response: ' + output)
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}


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
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

### What happened?

When you ran `dapr init` during Dapr install, the [`dapr.yaml` Multi-App Run template file]({{< ref "#dapryaml-multi-app-run-template-file" >}}) was generated in the `.dapr/components` directory. 

Running `dapr run -f .` in this Quickstart started [conversation.go]({{< ref "#programcs-conversation-app" >}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

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

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yml) configures the echo LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{< ref "supported-conversation" >}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{< ref "howto-conversation-layer.md#use-the-openai-component" >}})

#### `index.js` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 

```javascript
const conversationComponentName = "echo";

async function main() {
  const daprHost = process.env.DAPR_HOST || "http://localhost";
  const daprHttpPort = process.env.DAPR_HTTP_PORT || "3500";

  const inputBody = {
    name: "echo",
    inputs: [{ message: "What is dapr?" }],
    parameters: {},
    metadata: {},
  };

  const reqURL = `${daprHost}:${daprHttpPort}/v1.0-alpha1/conversation/${conversationComponentName}/converse`;

  try {
    const response = await fetch(reqURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputBody),
    });

    console.log("Input sent: What is dapr?");

    const data = await response.json();
    const result = data.outputs[0].result;
    console.log("Output response:", result);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}


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
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

### What happened?

When you ran `dapr init` during Dapr install, the [`dapr.yaml` Multi-App Run template file]({{< ref "#dapryaml-multi-app-run-template-file" >}}) was generated in the `.dapr/components` directory.

Running `dapr run -f .` in this Quickstart started the [conversation Program.cs]({{< ref "#programcs-conversation-app" >}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

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

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components), the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yml) configures the echo mock LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{< ref "supported-conversation" >}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{< ref "howto-conversation-layer.md#use-the-openai-component" >}})

#### `Program.cs` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 

```csharp
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.Extensions;

class Program
{
  private const string ConversationComponentName = "echo";

  static async Task Main(string[] args)
  {
    const string prompt = "What is dapr?";

    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddDaprConversationClient();
    var app = builder.Build();

    //Instantiate Dapr Conversation Client
    var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();

    try
    {
      // Send a request to the echo mock LLM component
      var response = await conversationClient.ConverseAsync(ConversationComponentName, [new(prompt, DaprConversationRole.Generic)]);
      Console.WriteLine("Input sent: " + prompt);

      if (response != null)
      {
        Console.Write("Output response:");
        foreach (var resp in response.Outputs)
        {
          Console.WriteLine($" {resp.Result}");
        }
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine("Error: " + ex.Message);
    }
  }
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}


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
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

### What happened?

When you ran `dapr init` during Dapr install, the [`dapr.yaml` Multi-App Run template file]({{< ref "#dapryaml-multi-app-run-template-file" >}}) was generated in the `.dapr/components` directory. 

Running `dapr run -f .` in this Quickstart started [conversation.go]({{< ref "#programcs-conversation-app" >}}).

#### `dapr.yaml` Multi-App Run template file

Running the [Multi-App Run template file]({{< ref multi-app-dapr-run >}}) with `dapr run -f .` starts all applications in your project. This Quickstart has only one application, so the `dapr.yaml` file contains the following: 

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

In [`conversation/components`](https://github.com/dapr/quickstarts/tree/master/conversation/components) directly of the quickstart, the [`conversation.yaml` file](https://github.com/dapr/quickstarts/tree/master/conversation/components/conversation.yml) configures the echo LLM component. 

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

To interface with a real LLM, swap out the mock component with one of [the supported conversation components]({{< ref "supported-conversation" >}}). For example, to use an OpenAI component, see the [example in the conversation how-to guide]({{< ref "howto-conversation-layer.md#use-the-openai-component" >}})

#### `conversation.go` conversation app

In the application code:
- The app sends an input "What is dapr?" to the echo mock LLM component.
- The mock LLM echoes "What is dapr?". 

```go
package main

import (
	"context"
	"fmt"
	"log"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}

	input := dapr.ConversationInput{
		Message: "What is dapr?",
		// Role:     nil, // Optional
		// ScrubPII: nil, // Optional
	}

	fmt.Println("Input sent:", input.Message)

	var conversationComponent = "echo"

	request := dapr.NewConversationRequest(conversationComponent, []dapr.ConversationInput{input})

	resp, err := client.ConverseAlpha1(context.Background(), request)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	fmt.Println("Output response:", resp.Outputs[0].Result)
}
```

{{% /codetab %}}

{{< /tabs >}}

## Run the app without the template

{{< tabs Python JavaScript ".NET" Go >}}

 <!-- Python -->
{{% codetab %}}


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
cd conversation/python/http/conversation
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

### Step 3: Launch the conversation service

Navigate back to the `http` directory and start the conversation service with the following command:

```bash
dapr run --app-id conversation --resources-path ../../../components -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

**Expected output**

```
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}


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
dapr run --app-id conversation --resources-path ../../../components/ -- npm run start
```

**Expected output**

```
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}


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
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}


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
== APP - conversation == Input sent: What is dapr?
== APP - conversation == Output response: What is dapr?
```

{{% /codetab %}}

{{< /tabs >}}

## Demo

Watch the demo presented during [Diagrid's Dapr v1.15 celebration](https://www.diagrid.io/videos/dapr-1-15-deep-dive) to see how the conversation API works using the .NET SDK.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NTnwoDhHIcQ?si=37SDcOHtEpgCIwkG&amp;start=5444" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- HTTP samples of this quickstart:
  - [Python](https://github.com/dapr/quickstarts/tree/master/conversation/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/conversation/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/conversation/csharp/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/conversation/go/http)
- Learn more about [the conversation building block]({{< ref conversation-overview.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
