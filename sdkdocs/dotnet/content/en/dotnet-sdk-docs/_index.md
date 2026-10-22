---
type: docs
title: "Dapr .NET SDK"
linkTitle: ".NET"
weight: 1000
description: .NET SDK packages for developing Dapr applications
no_list: true
cascade:
  github_repo: https://github.com/dapr/dotnet-sdk
  github_subdir: daprdocs/content/en/dotnet-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/dotnet/
  github_branch: master
---

Dapr offers a variety of packages to help with the development of .NET applications. Using them you can create .NET clients, servers, and virtual actors with Dapr.

## Prerequisites
- [Dapr CLI]({{< ref install-dapr-cli.md >}}) installed
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})
- [.NET 8](https://dotnet.microsoft.com/download), [.NET 9](https://dotnet.microsoft.com/download),
  [.NET 10](https://dotnet.microsoft.com/download), or [.NET 11](https://dotnet.microsoft.com/download) installed

{{% alert title=".NET framework support" color="warning" %}}
The Dapr .NET SDK supports .NET 8, .NET 9, .NET 10, and .NET 11. Be advised that .NET 8 and .NET 9
reach end of support in November 2026. Support for both will be dropped in Dapr v1.20; only .NET 10 and
.NET 11 will be supported through the end of 2027.
{{% /alert %}}

## Installation

For the package/API coverage in SDK `1.19.0`, see
[.NET building block support]({{< ref dotnet-building-blocks.md >}}). Use that release or a later compatible
release for the 1.19 features in these guides.

To get started with the Client .NET SDK, install the Dapr .NET SDK package:

```sh
dotnet add package Dapr.Client
```

## Try it out

Put the Dapr .NET SDK to the test. Walk through the .NET quickstarts and tutorials to see Dapr in action:

| SDK samples | Description |
| ----------- | ----------- |
| [Quickstarts]({{% ref quickstarts %}}) | Experience Dapr's API building blocks in just a few minutes using the .NET SDK. |
| [SDK samples](https://github.com/dapr/dotnet-sdk/tree/master/examples) | Clone the SDK repo to try out some examples and get started. |
| [Pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | See how Dapr .NET SDK works alongside other Dapr SDKs to enable pub/sub applications. |
| [Dapr.Messaging tutorial]({{< ref "dotnet-messaging/tutorial/_index.md" >}}) | Walk through modern .NET messaging examples, including publishing, delivery modes, routing, and testing. |

## Available packages

| Package Name                                                                                              | Documentation Link                                           | Description                                                                                                                                                      |
|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Dapr.Client](https://www.nuget.org/packages/Dapr.Client)                                                 | [Documentation]({{% ref dotnet-client %}})                   | Create .NET clients that interact with a Dapr sidecar and other Dapr applications.                                                                               |
| [Dapr.AI](https://www.nuget.org/packages/Dapr.AI)                                                         | [Documentation]({{% ref dotnet-ai %}})                       | Create and manage AI operations in .NET.                                                                                                                         |
| [Dapr.AI.A2a](https://www.nuget.org/packages/Dapr.AI.A2a)                                                 |                                                              | Dapr SDK for implementing agent-to-agent operations using the [A2A](https://github.com/a2aproject/a2a-dotnet) framework.                                         |
| [Dapr.AI.Microsoft.Extensions](https://www.nuget.org/packages/Dapr.AI.Microsoft.Extensions)               | [Documentation]({{% ref dotnet-ai-extensions-howto %}})      | Easily interact with LLMs conversationally and using tooling via the Dapr Conversation building block.                                                           |   
| [Dapr.AspNetCore](https://www.nuget.org/packages/Dapr.AspNetCore)                                         | [Documentation]({{% ref dotnet-client %}})                   | Write servers and services in .NET using the Dapr SDK. Includes support and utilities providing richer integration with ASP.NET Core.                            |
| [Dapr.Actors](https://www.nuget.org/packages/Dapr.Actors)                                                 | [Documentation]({{% ref dotnet-actors %}})                   | Create virtual actors with state, reminders/timers, and methods.                                                                                                 |
| [Dapr.Actors.AspNetCore](https://www.nuget.org/packages/Dapr.Actors.AspNetCore)                           | [Documentation]({{% ref dotnet-actors %}})                   | Create virtual actors with state, reminders/timers, and methods with rich integration with ASP.NET Core.                                                         |
| [Dapr.Actors.Analyzers](https://www.nuget.org/packages/Dapr.Actors.Analyzers)                             | [Documentation]({{% ref dotnet-guidance-source-generators %}}) | A collection of Roslyn source generators and analyzers for enabling better practices and preventing common errors when using Dapr Actors in .NET.                |
| [Dapr.Actors.Next](https://www.nuget.org/packages/Dapr.Actors.Next) | [Documentation]({{% ref dotnet-actors-next %}}) | Create virtual actors with state, timers/reminders, state machines, integrated Pub/Sub and more!                                                                 |
| [Dapr.Cryptography](https://www.nuget.org/packages/Dapr.Cryptography)                                     | [Documentation]({{% ref dotnet-cryptography %}})                 | Encrypt and decrypt streaming state of any size using Dapr's cryptography building block.                                                                        |
| [Dapr.Jobs](https://www.nuget.org/packages/Dapr.Jobs)                                                     | [Documentation]({{% ref dotnet-jobs %}})                     | Create and manage the scheduling and orchestration of jobs.                                                                                                      |
| [Dapr.Jobs.Analyzers](https://www.nuget.org/packages/Dapr.Jobs.Analyzers)                                 | [Documentation]({{% ref dotnet-guidance-source-generators %}})                     | A collection of Roslyn source generators and analyzers for enabling better practices and preventing common errors when using Dapr Jobs in .NET.                  |
| [Dapr.DistributedLock](https://www.nuget.org/packages/Dapr.DistributedLock)                             | [Documentation]({{% ref dotnet-distributed-lock %}})         | Create and manage distributed locks for managing exclusive resource access.                                                                                      |
| [Dapr.BinaryStore](https://www.nuget.org/packages/Dapr.BinaryStore)                                       | [Documentation]({{% ref dotnet-binarystore %}})              | Store, retrieve, stream, and delete binary files using Dapr.                                                                                                     |
| [Dapr.Search](https://www.nuget.org/packages/Dapr.Search) | [Documentation]({{% ref dotnet-search %}}) | Manage indexes and typed documents, run full-text and native queries, and generate typed index clients. |
| [Dapr.Vector](https://www.nuget.org/packages/Dapr.Vector) | [Documentation]({{% ref dotnet-vector %}}) | Store embeddings and typed payloads, run similarity and batch queries, and generate typed collection clients. |
| [Dapr.Extensions.Configuration](https://www.nuget.org/packages/Dapr.Extensions.Configuration)             |                                                              | Dapr secret store configuration provider implementation for `Microsoft.Extensions.Configuration`. |
| [Dapr.PluggableComponents](https://www.nuget.org/packages/Dapr.PluggableComponents)                       |                                                              | Used to implement pluggable components with Dapr using .NET.                                                                                                     |
| [Dapr.PluggableComponents.AspNetCore](https://www.nuget.org/packages/Dapr.PluggableComponents.AspNetCore) |                                                              | Implement pluggable components with Dapr using .NET with rich ASP.NET Core support.                                                                              |
| [Dapr.PluggableComponents.Protos](https://www.nuget.org/packages/Dapr.PluggableComponents.Protos)         |                                                              | **Note:** Developers needn't install this package directly in their applications.                                                                                |
| [Dapr.Messaging](https://www.nuget.org/packages/Dapr.Messaging)                                           | [Documentation]({{% ref dotnet-messaging %}})                | Unified Pub/Sub messaging SDK for .NET: event publishing, streaming pull, programmatic gRPC push, and HTTP subscriptions with reflection-free source generators. |
| [Dapr.Metadata](https://www.nuget.org/packages/Dapr.Metadata)                                             | [Documentation]({{% ref dotnet-metadata %}})                  | Retrieve typed Dapr runtime metadata in .NET through the options pattern.                                                                                        |
| [Dapr.StateManagement](https://www.nuget.org/packages/Dapr.StateManagement)                               | [Document]({{% ref dotnet-state-management %}}) | Create and manage state in Dapr applications.                                                                                                                    |
| [Dapr.SecretsManagement](https://www.nuget.org/packages/Dapr.SecretsManagement)                          | [Document]({{% ref dotnet-secrets %}}) | Retrieve secrets in Dapr applications.                                                                                                                           |
| [Dapr.Testcontainers](https://www.nuget.org/packages/Dapr.Testcontainers)                                 | [Documentation]({{% ref dotnet-guidance-testcontainers.md %}}) | Run Dapr integration tests using Testcontainers-based harnesses.                                                                                                 |
| [Dapr.Workflow](https://www.nuget.org/packages/Dapr.Workflow)                                             | [Documentation]({{% ref dotnet-workflow %}})                 | Create and manage workflows that work with other Dapr APIs.                                                                                                      |

## More information

Learn more about local development options, best practices, or browse NuGet packages to add to your existing .NET 
applications.

{{% cardpane %}}
{{% card title="**Development**"%}}
  [Learn about local development integration options]({{% ref dotnet-integrations %}})
{{% /card %}}
{{% card title="**Best Practices**"%}}
  [Learn about best practices for developing .NET Dapr applications]({{% ref dotnet-guidance %}})
{{% /card %}}
{{% card title="**Nuget Packages**"%}}
  [NuGet packages for adding the Dapr to your .NET applications](https://www.nuget.org/profiles/dapr.io)
{{% /card %}}
{{% /cardpane %}}
