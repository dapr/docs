---
type: docs
title: "Bindings overview"
linkTitle: "Overview"
weight: 100
description: Overview of the bindings building block
---

## Introduction

Using bindings, you can trigger your app with events coming in from external systems, or interface with external systems. This building block provides several benefits for you and your code:

- Remove the complexities of connecting to, and polling from, messaging systems such as queues and message buses
- Focus on business logic and not implementation details of how to interact with a system
- Keep your code free from SDKs or libraries
- Handle retries and failure recovery
- Switch between bindings at run time
- Build portable applications where environment-specific bindings are set-up and no code changes are required

For a specific example, bindings would allow your microservice to respond to incoming Twilio/SMS messages without adding or configuring a third-party Twilio SDK, worrying about polling from Twilio (or using websockets, etc.).

Bindings are developed independently of Dapr runtime. You can view and contribute to the bindings [here](https://github.com/dapr/components-contrib/tree/master/bindings).

## Input bindings

Input bindings are used to trigger your application when an event from an external resource has occurred.
An optional payload and metadata may be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library to get incoming events

> On startup Dapr sends a `OPTIONS` request for all defined input bindings to the application and expects a status code other than `NOT FOUND (404)` if this application wants to subscribe to the binding.

Read the [Create an event-driven app using input bindings]({{< ref howto-triggers.md >}}) page to get started with input bindings.

## Output bindings

Output bindings allow you to invoke external resources. An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload

Read the [Use output bindings to interface with external resources]({{< ref howto-bindings.md >}}) page to get started with output bindings.

## Next Steps
* Follow these guides on:
    * [How-To: Trigger a service from different resources with input bindings]({{< ref howto-triggers.md >}})
    * [How-To: Use output bindings to interface with external resources]({{< ref howto-bindings.md >}})
* Try out the [bindings quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) which shows how to bind to a Kafka queue
* Read the [bindings API specification]({{< ref bindings_api.md >}})
