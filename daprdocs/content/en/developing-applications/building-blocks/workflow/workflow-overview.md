---
type: docs
title: Workflow overview
linkTitle: Overview
weight: 1000
description: "Overview of the workflow building block"
---

{{% alert title="Note" color="primary" %}}
The Workflow building block is currently in alpha state supporting .NET. 
{{% /alert %}}

The Dapr Workflow building block strives to make orchestrating logic for messaging, state management, and failure handling across various microservices easier for developers. Prior to adding workflows to Dapr, you'd often need to build ad-hoc workflows behind-the-scenes in order to bridge that gap. 

The durable, resilient Dapr Workflow building block:

- Provides a workflow API for running workflows
- Offers a built-in workflow runtime to write Dapr workflows (of type `workflow.dapr`)
- Integrates with various workflow runtimes as components (for example, Temporal workflows)

The Workflow building block can assist with scenarios like:
- Order processing involving inventory management, payment systems, shipping, etc.
- HR onboarding workflows coordinating tasks across multiple departments and participatns
- Orchestrating the roll-out of digital menu updates in a national restaurant chain
- Image processing workflows involving API-based classification and storage

## How it works

The Dapr Workflow engine runs in the Dapr sidecar and consists of:
- SDKs for authoring workflows in code, using any language
- APIs for managing workflows (start, query, suspend/resume, terminate)

The workflow engine is internally powered by Dapr's actor runtime. In the following diagram demonstrates the Dapr Workflow architecture in Kubernetes mode:

<img src="/images/workflow-overview/workflows-architecture-k8s.png" width=800 alt="Diagram showing how the workflow architecture works in Kubernetes mode">

Essentially, to use the Dapr Workflow building block, you write workflow code in your application using the SDK and connect to the sidecar using gRPC stream. This will register the workflow and any workflow activities, or tasks that workflows can schedule.

Notice that the engine itself is embedded directly into the sidecar and implemented by the `durabletask-go` framework library. This framework allows you to swap out different storage providers, including a storage provider created specifically for Dapr that leverages internal actors behind the scenes. Since Dapr Workflow uses actors, you can store workflow state in variety of Dapr-supported state stores, like Redis, CosmosDB, etc.

## Features

### HTTP/gRPC API calls to start or terminate any workflow

Once you create an application with workflow code and run it with Dapr, you can make HTTP/gRPC calls to Dapr to run specific tasks/workflows that reside in the application. Each individual workflow can be started or terminated through a POST request. 

You can also get information on the workflow (even if it has been terminated or it finished naturally) through a GET request. This GET request will send back information, such as:
- The instance ID of the workflow
- The time that the run started
- The current running status, whether that be “Running”, “Terminated”, or “Completed”

## Watch the demo

Watch [this video for an overview on Dapr Workflows](https://youtu.be/s1p9MNl4VGo?t=131):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=131" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps

- [Learn how to set up a workflow]({{< ref howto-workflow.md >}})
- [Supported workflows]({{< ref supported-workflows.md >}})