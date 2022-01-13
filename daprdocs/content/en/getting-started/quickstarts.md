---
type: docs
title: "Try out Dapr quickstarts to learn core concepts"
linkTitle: "Dapr Quickstarts"
weight: 60
description: "Tutorials with code samples that are aimed to get you started quickly with Dapr"
---

The [Dapr Quickstarts](https://github.com/dapr/quickstarts/tree/v1.5.0) are a collection of tutorials with code samples that are aimed to get you started quickly with Dapr, each highlighting a different Dapr capability.

- A good place to start is the hello-world quickstart, it demonstrates how to run Dapr in standalone mode locally on your machine and demonstrates state management and service invocation in a simple application.
- Next, if you are familiar with Kubernetes and want to see how to run the same application in a Kubernetes environment, look for the hello-kubernetes quickstart. Other quickstarts such as pub-sub, bindings and the distributed-calculator quickstart explore different Dapr capabilities include instructions for running both locally and on Kubernetes and can be completed in any order. A full list of the quickstarts can be found below.
- At anytime, you can explore the Dapr documentation or SDK specific samples and come back to try additional quickstarts.
- When you're done, consider exploring the [Dapr samples repository](https://github.com/dapr/samples) for additional code samples contributed by the community that show more advanced or specific usages of Dapr.

## Quickstarts

| Quickstart               | Description                                                                                                                                                                                    |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Hello World](https://github.com/dapr/quickstarts/tree/v1.5.0/hello-world)            | Demonstrates how to run Dapr locally. Highlights service invocation and state management.                                                                                                      |
| [Hello Kubernetes](https://github.com/dapr/quickstarts/tree/v1.5.0/hello-kubernetes)       | Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and state management.                                                                                                |
| [Distributed Calculator](https://github.com/dapr/quickstarts/tree/v1.5.0/distributed-calculator) | Demonstrates a distributed calculator application that uses Dapr services to power a React web app. Highlights polyglot (multi-language) programming, service invocation and state management. |
| [Pub/Sub](https://github.com/dapr/quickstarts/tree/v1.5.0/pub-sub)                | Demonstrates how to use Dapr to enable pub-sub applications. Uses Redis as a pub-sub component.                                                                                          |
| [Bindings](https://github.com/dapr/quickstarts/tree/v1.5.0/bindings)            | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka.                                                                            |
| [Middleware](https://github.com/dapr/quickstarts/tree/v1.5.0/middleware) | Demonstrates use of Dapr middleware to enable OAuth 2.0 authorization. |
| [Observability](https://github.com/dapr/quickstarts/tree/v1.5.0/observability) | Demonstrates Dapr tracing capabilities. Uses Zipkin as a tracing component. |
| [Secret Store](https://github.com/dapr/quickstarts/tree/v1.5.0/secretstore) | Demonstrates the use of Dapr Secrets API to access secret stores. |

