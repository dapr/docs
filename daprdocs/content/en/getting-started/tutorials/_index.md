---
type: docs
title: "Dapr Tutorials"
linkTitle: "Dapr Tutorials"
weight: 70
description: "Walk through in-depth examples to learn more about how to work with Dapr concepts"
no_list: true
---

Now that you've already initialized Dapr and experimented with some of Dapr's building blocks, walk through our more detailed tutorials.

#### Before you begin

- [Set up your local Dapr environment]({{< ref "install-dapr-cli.md" >}}).
- [Explore one of Dapr's building blocks via our quickstarts]({{< ref "getting-started/quickstarts/_index.md" >}}).

## Tutorials

Thanks to our expansive Dapr community, we offer tutorials hosted both on Dapr Docs and on our [GitHub repository](https://github.com/dapr/quickstarts).

| Dapr Docs tutorials               | Description                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Define a component]({{< ref get-started-component.md >}})       | Create a component definition file to interact with the Secrets building block.
| [Configure State & Pub/sub]({{< ref configure-state-pubsub.md >}}) | Configure State Store and Pub/sub message broker components for Dapr.

| GitHub tutorials               | Description                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)            | *Recommended* <br> Demonstrates how to run Dapr locally. Highlights service invocation and state management.  |
| [Hello World Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)       | *Recommended* <br> Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management.  |
| [Distributed Calculator](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.  |
| [Bindings](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)            | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                            |
| [Observability](https://github.com/dapr/quickstarts/tree/master/tutorials/observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |
| [Secret Store](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore) | Demonstrates the use of Dapr Secrets API to access secret stores. |