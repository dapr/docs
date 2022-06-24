---
type: docs
title: "Bindings overview"
linkTitle: "Overview"
weight: 100
description: Overview of the bindings API building block 
---

Using Dapr's bindings API, you can both trigger your app with events coming in from external systems and interface with external systems. In addition, the Dapr binding API enables you to:

- Remove the complexities of connecting to and polling from messaging systems, such as queues and message buses
- Focus on business logic, instead of the implementation details of how to interact with a system
- Keep your code free from SDKs or libraries
- Handle retries and failure recovery
- Switch between bindings at run time
- Build portable applications with environment-specific bindings set up and no code changes required

For example, with bindings, your microservice can respond to incoming Twilio/SMS messages without:

- Adding or configuring a third-party Twilio SDK
- Worrying about polling from Twilio (or using websockets, etc.)

{{% alert title="Note" color="primary" %}}
 Bindings are developed independently of Dapr runtime. You can [view and contribute to the bindings](https://github.com/dapr/components-contrib/tree/master/bindings).

{{% /alert %}}

## Input bindings

With input bindings, you can trigger your application when an event from an external resource has occurred. An optional payload and metadata may be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.).
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library to get incoming events.

{{% alert title="Note" color="primary" %}}
 On startup, Dapr sends [an OPTIONS request]({{< ref "bindings_api.md#invoking-service-code-through-input-bindings" >}}) for all defined input bindings to the application and expects a status code 2xx or 405 if this application wants to subscribe to the binding.

{{% /alert %}}

Read the [Create an event-driven app using input bindings]({{< ref howto-triggers.md >}}) page to get started with input bindings.

## Output bindings

With output bindings, you can invoke external resources. An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.).
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload.

Read the [Use output bindings to interface with external resources]({{< ref howto-bindings.md >}}) page to get started with output bindings.

## Next Steps

- Follow these guides on:
  - [How-To: Trigger a service from different resources with input bindings]({{< ref howto-triggers.md >}})
  - [How-To: Use output bindings to interface with external resources]({{< ref howto-bindings.md >}})
- Try out the [bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings/README.md) to experiment with binding to a Kafka queue.
- Read the [bindings API specification]({{< ref bindings_api.md >}})
