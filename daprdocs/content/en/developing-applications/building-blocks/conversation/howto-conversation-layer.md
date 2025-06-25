---
type: docs
title: "How-To: Converse with an LLM using the conversation API"
linkTitle: "How-To: Converse"
weight: 2000
description: "Learn how to abstract the complexities of interacting with large language models"
---

{{% alert title="Alpha" color="primary" %}}
The conversation API is currently in [alpha]({{< ref "certification-lifecycle.md#certification-levels" >}}).
{{% /alert %}}

Let's get started using the [conversation API]({{< ref conversation-overview.md >}}). In this guide, you'll learn how to:

- Set up one of the available Dapr components (echo) that work with the conversation API.   
- Add the conversation client to your application.
- Run the connection using `dapr run`.

## Set up the conversation component

Create a new configuration file called `conversation.yaml` and save to a components or config sub-folder in your application directory. 

Select your [preferred conversation component spec]({{< ref supported-conversation >}}) for your `conversation.yaml` file.

For this scenario, we use a simple echo component.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

### Use the OpenAI component

To interface with a real LLM, use one of the other [supported conversation components]({{< ref "supported-conversation" >}}), including OpenAI, Hugging Face, Anthropic, DeepSeek, and more.

For example, to swap out the `echo` mock component with an `OpenAI` component, replace the `conversation.yaml` file with the following. You'll need to copy your API key into the component file.

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openai
spec:
  type: conversation.openai
  metadata:
  - name: key
    value: <REPLACE_WITH_YOUR_KEY>
  - name: model
    value: gpt-4-turbo
```

## Connect the conversation client

The following examples use an HTTP client to send a POST request to Dapr's sidecar HTTP endpoint. You can also use [the Dapr SDK client instead]({{< ref "#related-links" >}}).

{{< tabs ".NET" "Go" "Rust" >}}


 <!-- .NET -->
{{% codetab %}}

```csharp
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprConversationClient();

var app = builder.Build();

var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();
var response = await conversationClient.ConverseAsync("conversation",
    new List<DaprConversationInput>
    {
        new DaprConversationInput(
            "Please write a witty haiku about the Dapr distributed programming framework at dapr.io",
            DaprConversationRole.Generic)
    });

Console.WriteLine("Received the following from the LLM:");
foreach (var resp in response.Outputs)
{
    Console.WriteLine($"\t{resp.Result}");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

```go
package main

import (
	"context"
	"fmt"
	dapr "github.com/dapr/go-sdk/client"
	"log"
)

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}

	input := dapr.ConversationInput{
		Content: "Please write a witty haiku about the Dapr distributed programming framework at dapr.io",
		// Role:     "", // Optional
		// ScrubPII: false, // Optional
	}

	fmt.Printf("conversation input: %s\n", input.Content)

	var conversationComponent = "echo"

	request := dapr.NewConversationRequest(conversationComponent, []dapr.ConversationInput{input})

	resp, err := client.ConverseAlpha1(context.Background(), request)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	fmt.Printf("conversation output: %s\n", resp.Outputs[0].Result)
}
```

{{% /codetab %}}

 <!-- Rust -->
{{% codetab %}}

```rust
use dapr::client::{ConversationInputBuilder, ConversationRequestBuilder};
use std::thread;
use std::time::Duration;

type DaprClient = dapr::Client<dapr::client::TonicClient>;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Sleep to allow for the server to become available
    thread::sleep(Duration::from_secs(5));

    // Set the Dapr address
    let address = "https://127.0.0.1".to_string();

    let mut client = DaprClient::connect(address).await?;

    let input = ConversationInputBuilder::new("Please write a witty haiku about the Dapr distributed programming framework at dapr.io").build();

    let conversation_component = "echo";

    let request =
        ConversationRequestBuilder::new(conversation_component, vec![input.clone()]).build();

    println!("conversation input: {:?}", input.content);

    let response = client.converse_alpha1(request).await?;

    println!("conversation output: {:?}", response.outputs[0].result);
    Ok(())
}
```

{{% /codetab %}}

{{< /tabs >}}

## Run the conversation connection

Start the connection using the `dapr run` command. For example, for this scenario, we're running `dapr run` on an application with the app ID `conversation` and pointing to our conversation YAML file in the `./config` directory. 

{{< tabs ".NET" "Go" "Rust" >}}

 <!-- .NET -->
{{% codetab %}}

```bash
dapr run --app-id conversation --dapr-grpc-port 50001 --log-level debug --resources-path ./config -- dotnet run
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

```bash
dapr run --app-id conversation --dapr-grpc-port 50001 --log-level debug --resources-path ./config -- go run ./main.go
```

**Expected output**

```
  - '== APP == conversation output: Please write a witty haiku about the Dapr distributed programming framework at dapr.io'
```

{{% /codetab %}}

 <!-- Rust -->
{{% codetab %}}

```bash
dapr run --app-id=conversation --resources-path ./config --dapr-grpc-port 3500 -- cargo run --example conversation
```

**Expected output**

```
  - 'conversation input: hello world'
  - 'conversation output: hello world'
```

{{% /codetab %}}

{{< /tabs >}}

## Advanced features

The conversation API supports the following features:

1. **Prompt caching:** Allows developers to cache prompts in Dapr, leading to much faster response times and reducing costs on egress and on inserting the prompt into the LLM provider's cache.

1. **PII scrubbing:** Allows for the obfuscation of data going in and out of the LLM.

To learn how to enable these features, see the [conversation API reference guide]({{< ref conversation_api.md >}}).

## Related links

Try out the conversation API using the full examples provided in the supported SDK repos.


{{< tabs ".NET" "Go" "Rust" >}}

 <!-- .NET -->
{{% codetab %}}

[Dapr conversation example with the .NET SDK](https://github.com/dapr/dotnet-sdk/tree/master/examples/AI/ConversationalAI)

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

[Dapr conversation example with the Go SDK](https://github.com/dapr/go-sdk/tree/main/examples/conversation)

{{% /codetab %}}

 <!-- Rust -->
{{% codetab %}}

[Dapr conversation example with the Rust SDK](https://github.com/dapr/rust-sdk/tree/main/examples/src/conversation)

{{% /codetab %}}

{{< /tabs >}}


## Next steps

- [Conversation API reference guide]({{< ref conversation_api.md >}})
- [Available conversation components]({{< ref supported-conversation >}})