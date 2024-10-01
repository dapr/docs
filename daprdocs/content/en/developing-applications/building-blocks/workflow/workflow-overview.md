---
type: docs
title: Workflow overview
linkTitle: Overview
weight: 1000
description: "Overview of Dapr Workflow"
---

{{% alert title="Note" color="primary" %}}
Dapr Workflow is currently in beta. [See known limitations]({{< ref "#limitations" >}}).
{{% /alert %}}

Dapr workflow makes it easy for developers to write business logic and integrations in a reliable way. Since Dapr workflows are stateful, they support long-running and fault-tolerant applications, ideal for orchestrating microservices. Dapr workflow works seamlessly with other Dapr building blocks, such as service invocation, pub/sub, state management, and bindings.

The durable, resilient Dapr Workflow capability:

- Offers a built-in workflow runtime for driving Dapr Workflow execution.
- Provides SDKs for authoring workflows in code, using any language.
- Provides HTTP and gRPC APIs for managing workflows (start, query, pause/resume, raise event, terminate, purge).
- Integrates with any other workflow runtime via workflow components.

<img src="/images/workflow-overview/workflow-overview.png" width=800 alt="Diagram showing basics of Dapr Workflow">

Some example scenarios that Dapr Workflow can perform are:

- Order processing involving orchestration between inventory management, payment systems, and shipping services.
- HR onboarding workflows coordinating tasks across multiple departments and participants.
- Orchestrating the roll-out of digital menu updates in a national restaurant chain.
- Image processing workflows involving API-based classification and storage.

## Features

### Workflows and activities

With Dapr Workflow, you can write activities and then orchestrate those activities in a workflow. Workflow activities are:

- The basic unit of work in a workflow
- Used for calling other (Dapr) services, interacting with state stores, and pub/sub brokers.

[Learn more about workflow activities.]({{< ref "workflow-features-concepts.md##workflow-activities" >}})

### Child workflows

In addition to activities, you can write workflows to schedule other workflows as child workflows. A child workflow has its own instance ID, history, and status that is independent of the parent workflow that started it, except for the fact that terminating the parent workflow terminates all of the child workflows created by it. Child workflow also supports automatic retry policies.

[Learn more about child workflows.]({{< ref "workflow-features-concepts.md#child-workflows" >}})

### Timers and reminders

Same as Dapr actors, you can schedule reminder-like durable delays for any time range.

[Learn more about workflow timers]({{< ref "workflow-features-concepts.md#durable-timers" >}}) and [reminders]({{< ref "workflow-architecture.md#reminder-usage-and-execution-guarantees" >}})

### Workflow HTTP calls to manage a workflow

When you create an application with workflow code and run it with Dapr, you can call specific workflows that reside in the application. Each individual workflow can be:

- Started or terminated through a POST request
- Triggered to deliver a named event through a POST request
- Paused and then resumed through a POST request
- Purged from your state store through a POST request
- Queried for workflow status through a GET request

[Learn more about how manage a workflow using HTTP calls.]({{< ref workflow_api.md >}})

## Workflow patterns

Dapr Workflow simplifies complex, stateful coordination requirements in microservice architectures. The following sections describe several application patterns that can benefit from Dapr Workflow. 

Learn more about [different types of workflow patterns]({{< ref workflow-patterns.md >}})

## Workflow SDKs

The Dapr Workflow _authoring SDKs_ are language-specific SDKs that contain types and functions to implement workflow logic. The workflow logic lives in your application and is orchestrated by the Dapr Workflow engine running in the Dapr sidecar via a gRPC stream.

### Supported SDKs

You can use the following SDKs to author a workflow.

| Language stack | Package |
| - | - |
| Python | [dapr-ext-workflow](https://github.com/dapr/python-sdk/tree/master/ext/dapr-ext-workflow) |
| JavaScript | [DaprWorkflowClient](https://github.com/dapr/js-sdk/blob/main/src/workflow/client/DaprWorkflowClient.ts) |
| .NET | [Dapr.Workflow](https://www.nuget.org/profiles/dapr.io) |
| Java | [io.dapr.workflows](https://dapr.github.io/java-sdk/io/dapr/workflows/package-summary.html) |
| Go | [workflow](https://github.com/dapr/go-sdk/tree/main/client/workflow.go) |

## Try out workflows

### Quickstarts and tutorials

Want to put workflows to the test? Walk through the following quickstart and tutorials to see workflows in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [Workflow quickstart]({{< ref workflow-quickstart.md >}}) | Run a workflow application with four workflow activities to see Dapr Workflow in action  |
| [Workflow Python SDK example](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow) | Learn how to create a Dapr Workflow and invoke it using the Python `DaprClient` package. |
| [Workflow JavaScript SDK example](https://github.com/dapr/js-sdk/tree/main/examples/workflow) | Learn how to create a Dapr Workflow and invoke it using the JavaScript SDK. |
| [Workflow .NET SDK example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow) | Learn how to create a Dapr Workflow and invoke it using ASP.NET Core web APIs. |
| [Workflow Java SDK example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows) | Learn how to create a Dapr Workflow and invoke it using the Java `io.dapr.workflows` package. |
| [Workflow Go SDK example](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md) | Learn how to create a Dapr Workflow and invoke it using the Go `workflow` package. |

### Start using workflows directly in your app

Want to skip the quickstarts? Not a problem. You can try out the workflow building block directly in your application. After [Dapr is installed]({{< ref install-dapr-cli.md >}}), you can begin using  workflows, starting with [how to author a workflow]({{< ref howto-author-workflow.md >}}).

## Limitations

- **State stores:** Due to underlying limitations in some database choices, more commonly NoSQL databases, you might run into limitations around storing internal states. For example, CosmosDB has a maximum single operation item limit of only 100 states in a single request.
- **Horizontal scaling:** As of the 1.12.0 beta release of Dapr Workflow, it is recommended to use a maximum of two instances of Dapr per workflow application. This limiation is resolved in Dapr 1.14.x when enabling the scehduler service.

To enable the scheduler service to work for Dapr Workflows, make sure you're using Dapr 1.14.x or later and assign the following configuration to your app:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: schedulerconfig
spec:
  tracing:
    samplingRate: "1"
  features:
    - name: SchedulerReminders
      enabled: true
```

See more info about how to enable preview features [Here]({{<ref preview-features>}}).

## Watch the demo

Watch [this video for an overview on Dapr Workflow](https://youtu.be/s1p9MNl4VGo?t=131):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=131" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps

{{< button text="Workflow features and concepts >>" page="workflow-features-concepts.md" >}}

## Related links

- [Workflow API reference]({{< ref workflow_api.md >}})
- Try out the full SDK examples:
  - [Python example](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
  - [JavaScript example](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
  - [.NET example](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
  - [Java example](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
  - [Go example](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
