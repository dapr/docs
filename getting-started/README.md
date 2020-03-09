# Getting Started

Dapr is a portable, event-driven runtime that makes it easy for enterprise developers to build resilient, microservice stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks.

## Core Concepts

* **Building blocks** are a collection of components that implement distributed system capabilities, such as pub/sub, state management, resource bindings, and distributed tracing.

* **Components** encapsulate the implementation for a building block API. Example implementations for the state building block may include Redis, Azure Storage, Azure Cosmos DB, and AWS DynamoDB. Many of the components are pluggable so that one implementation can be swapped out for another.

To learn more, see [Dapr Concepts](../concepts).

## Setup the development environment

Dapr can be run locally or in Kubernetes. We recommend starting with a local setup to explore the core Dapr concepts and familiarize yourself with the Dapr CLI. Follow these instructions to [configure Dapr locally and on Kubernetes](./environment-setup.md).

## Next steps

1. Once Dapr is installed, continue to the [Hello World sample](https://github.com/dapr/samples/tree/master/1.hello-world).
2. Explore additional [samples](https://github.com/dapr/samples) for more advanced concepts, such as service invocation, pub/sub, and state management.
3. Follow [How To guides](../howto) to understand how Dapr solves specific problems, such as creating a [rate limited app](../howto/control-concurrency).
