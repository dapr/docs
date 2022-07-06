---
type: docs
title: "Bindings overview"
linkTitle: "Overview"
weight: 100
description: Overview of the bindings API building block 
---

Using Dapr's bindings API, you can trigger your app with events coming in from external systems and interface with external systems. With the bindings API, you can:

- Avoid the complexities of connecting to and polling from messaging systems, such as queues and message buses.
- Focus on business logic, instead of the implementation details of interacting with a system.
- Keep your code free from SDKs or libraries.
- Handle retries and failure recovery.
- Switch between bindings at runtime.
- Build portable applications with environment-specific bindings set-up and no required code changes.

For example, with bindings, your microservice can respond to incoming Twilio/SMS messages without:

- Adding or configuring a third-party Twilio SDK
- Worrying about polling from Twilio (or using WebSockets, etc.)

{{% alert title="Note" color="primary" %}}
Bindings are developed independently of Dapr runtime. You can [view and contribute to the bindings](https://github.com/dapr/components-contrib/tree/master/bindings).
{{% /alert %}}

## Input bindings

With input bindings, you can trigger your application when an event from an external resource occurs. An optional payload and metadata may be sent with the request.

To receive events from an input binding:

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
1. Listen for the incoming event using:
   - An HTTP endpoint
   - The gRPC proto library to get incoming events.

{{% alert title="Note" color="primary" %}}
 On startup, Dapr sends [an OPTIONS request]({{< ref "bindings_api.md#invoking-service-code-through-input-bindings" >}}) for all defined input bindings to the application. If the application wants to subscribe to the binding, Dapr expects a status code of 2xx or 405.

{{% /alert %}}

Read the [Create an event-driven app using input bindings guide]({{< ref howto-triggers.md >}}) to get started with input bindings.

## Output bindings

With output bindings, you can invoke external resources. An optional payload and metadata can be sent with the invocation request.

To invoke an output binding:

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload.

Read the [Use output bindings to interface with external resources guide]({{< ref howto-bindings.md >}}) to get started with output bindings.

## Try out bindings

### Quickstarts and tutorials

Want to put the Dapr bindings API to the test? Walk through the following quickstart and tutorials to see bindings in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Bindings quickstart]({{< ref bindings-quickstart.md >}}) | Work with external systems using input bindings to respond to events and output bindings to call operations. |
| [Bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka. |

### Start using bindings directly in your app

Want to skip the quickstarts? Not a problem. You can try out the bindings building block directly in your application to invoke output bindings and trigger input bindings. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the bindings API starting with [the input bindings how-to guide]({{< ref howto-triggers.md >}}).

## Next Steps

- Follow these guides on:
  - [How-To: Trigger a service from different resources with input bindings]({{< ref howto-triggers.md >}})
  - [How-To: Use output bindings to interface with external resources]({{< ref howto-bindings.md >}})
- Try out the [bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings/README.md) to experiment with binding to a Kafka queue.
- Read the [bindings API specification]({{< ref bindings_api.md >}})