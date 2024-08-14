---
type: docs
title: "Dapr Quickstarts"
linkTitle: "Dapr Quickstarts"
weight: 70
description: "Try out Dapr quickstarts with code samples that are aimed to get you started quickly with Dapr"
no_list: true
---

Hit the ground running with our Dapr quickstarts, complete with code samples aimed to get you started quickly with Dapr.

{{% alert title="Note" color="primary" %}}
 We are actively working on adding to our quickstart library. In the meantime, you can explore Dapr through our [tutorials]({{< ref "getting-started/tutorials/_index.md" >}}).

{{% /alert %}}

#### Before you begin

- [Set up your local Dapr environment]({{< ref "install-dapr-cli.md" >}}).

## Quickstarts

| Quickstarts | Description |
| ----------- | ----------- |
| [Service Invocation]({{< ref serviceinvocation-quickstart.md >}}) | Synchronous communication between two services using HTTP or gRPC. |
| [Publish and Subscribe]({{< ref pubsub-quickstart.md >}}) |  Asynchronous communication between two services using messaging. |
| [Workflow]({{< ref workflow-quickstart.md >}}) | Orchestrate business workflow activities in long running, fault-tolerant, stateful applications. |
| [State Management]({{< ref statemanagement-quickstart.md >}}) | Store a service's data as key/value pairs in supported state stores. |
| [Bindings]({{< ref bindings-quickstart.md >}}) | Work with external systems using input bindings to respond to events and output bindings to call operations. |
| [Actors]({{< ref actors-quickstart.md >}}) | Run a microservice and a simple console client to demonstrate stateful object patterns in Dapr Actors. |
| [Secrets Management]({{< ref secrets-quickstart.md >}}) | Securely fetch secrets. |
| [Configuration]({{< ref configuration-quickstart.md >}}) | Get configuration items and subscribe for configuration updates. |
| [Resiliency]({{< ref resiliency >}}) | Define and apply fault-tolerance policies to your Dapr API requests. |
| [Cryptography]({{< ref cryptography-quickstart.md >}}) | Encrypt and decrypt data using Dapr's cryptographic APIs. |
| [Jobs]({{< ref jobs-quickstart.md >}}) | Schedule, retrieve, and delete jobs using Dapr's jobs APIs. |

