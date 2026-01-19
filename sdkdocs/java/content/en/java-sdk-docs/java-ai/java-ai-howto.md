---
type: docs
title: "How to: Author and manage Dapr Conversation AI in the Java SDK"
linkTitle: "How to: Author and manage Conversation AI"
weight: 20000
description: How to get up and running with Conversation AI using the Dapr Java SDK
---

As part of this demonstration, we will look at how to use the Conversation API to converse with a Large Language Model (LLM). The API
will return the response from the LLM for the given prompt. With the [provided conversation ai example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/conversation), you will:

- You will provide a prompt using the [Conversation AI example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/conversation/DemoConversationAI.java)
- Filter out Personally identifiable information (PII).

This example uses the default configuration from `dapr init` in [self-hosted mode](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted).

## Prerequisites

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11 (or greater):
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html), version 3.x.
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Set up the environment

Clone the [Java SDK repo](https://github.com/dapr/java-sdk) and navigate into it.

```bash
git clone https://github.com/dapr/java-sdk.git
cd java-sdk
```

Run the following command to install the requirements for running the Conversation AI example with the Dapr Java SDK.

```bash
mvn clean install -DskipTests
```

From the Java SDK root directory, navigate to the examples' directory.

```bash
cd examples
```

Run the Dapr sidecar.

```sh
dapr run --app-id conversationapp --dapr-grpc-port 51439 --dapr-http-port 3500 --app-port 8080
```

> Now, Dapr is listening for HTTP requests at `http://localhost:3500` and gRPC requests at `http://localhost:51439`.

## Send a prompt with Personally identifiable information (PII) to the Conversation AI API

In the `DemoConversationAI` there are steps to send a prompt using the `converse` method under the `DaprPreviewClient`.

```java
public class DemoConversationAI {
  /**
   * The main method to start the client.
   *
   * @param args Input arguments (unused).
   */
  public static void main(String[] args) {
    try (DaprPreviewClient client = new DaprClientBuilder().buildPreviewClient()) {
      System.out.println("Sending the following input to LLM: Hello How are you? This is the my number 672-123-4567");

      ConversationInput daprConversationInput = new ConversationInput("Hello How are you? "
              + "This is the my number 672-123-4567");

      // Component name is the name provided in the metadata block of the conversation.yaml file.
      Mono<ConversationResponse> responseMono = client.converse(new ConversationRequest("echo",
              List.of(daprConversationInput))
              .setContextId("contextId")
              .setScrubPii(true).setTemperature(1.1d));
      ConversationResponse response = responseMono.block();
      System.out.printf("Conversation output: %s", response.getConversationOutputs().get(0).getResult());
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
```

Run the `DemoConversationAI` with the following command.

```sh
java -jar target/dapr-java-sdk-examples-exec.jar io.dapr.examples.conversation.DemoConversationAI
```

### Sample output
```
== APP == Conversation output: Hello How are you? This is the my number <ISBN>
```

As shown in the output, the number sent to the API is obfuscated and returned in the form of <ISBN>.
The example above uses an ["echo"](https://docs.dapr.io/developing-applications/building-blocks/conversation/howto-conversation-layer/#set-up-the-conversation-component)
component for testing, which simply returns the input message.
When integrated with LLMs like OpenAI or Claude, you’ll receive meaningful responses instead of echoed input.

## Next steps
- [Learn more about Conversation AI]({{% ref conversation-overview.md %}})
- [Conversation AI API reference]({{% ref conversation_api.md %}})