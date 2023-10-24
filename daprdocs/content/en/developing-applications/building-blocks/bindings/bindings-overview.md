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

For example, with bindings, your application can respond to incoming Twilio/SMS messages without:

- Adding or configuring a third-party Twilio SDK
- Worrying about polling from Twilio (or using WebSockets, etc.)

<img src="/images/binding-overview.png" width=1000 alt="Diagram showing bindings" style="padding-bottom:25px;">

In the above diagram:
- The input binding triggers a method on your application. 
- Execute output binding operations on the component, such as `"create"`.

Bindings are developed independently of Dapr runtime. You can [view and contribute to the bindings](https://github.com/dapr/components-contrib/tree/master/bindings).

{{% alert title="Note" color="primary" %}}
If you are using the HTTP Binding, then it is preferable to use [service invocation]({{< ref service_invocation_api.md >}}) instead. Read [How-To: Invoke Non-Dapr Endpoints using HTTP]({{< ref "howto-invoke-non-dapr-endpoints.md" >}}) for more information.
{{% /alert %}}

## Input bindings

With input bindings, you can trigger your application when an event from an external resource occurs. An optional payload and metadata may be sent with the request.

[The following overview video and demo](https://www.youtube.com/live/0y7ne6teHT4?si=wlmAi7BJBWS8KNK7&t=8261) demonstrates how Dapr input binding works. 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=wlmAi7BJBWS8KNK7&amp;start=8261" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>  

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

[The following overview video and demo](https://www.youtube.com/live/0y7ne6teHT4?si=PoA4NEqL5mqNj6Il&t=7668) demonstrates how Dapr output binding works. 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=PoA4NEqL5mqNj6Il&amp;start=7668" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>  

To invoke an output binding:

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
1. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload.
1. Specify an output operation. Output operations depend on the binding component you use, and can include:
   - `"create"`
   - `"update"`
   - `"delete"`
   - `"exec"` 

Read the [Use output bindings to interface with external resources guide]({{< ref howto-bindings.md >}}) to get started with output bindings.

## Binding directions (optional)

You can provide the `direction` metadata field to indicate the direction(s) supported by the binding component. In doing so, the Dapr sidecar avoids the `"wait for the app to become ready"` state, reducing the lifecycle dependency between the Dapr sidecar and the application:

- `"input"`
- `"output"`
- `"input, output"`

{{% alert title="Note" color="primary" %}}
It is highly recommended that all input bindings should include the `direction` property.
{{% /alert %}}

[See a full example of the bindings `direction` metadata.]({{< ref "bindings_api.md#binding-direction-optional" >}})

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