---
type: docs
title: "Dapr Software Development Kits (SDKs)"
linkTitle: "SDKs"
weight: 20
description: "Use your favorite languages with Dapr"
no_list: true
---

The Dapr SDKs are the easiest way for you to get Dapr into your application. Choose your favorite language and get up and running with Dapr in minutes.

## SDK packages

Select your [preferred language below]({{< ref "#sdk-languages" >}}) to learn more about client, server, actor, and workflow packages. 

- **Client**: The Dapr client allows you to invoke Dapr building block APIs and perform each building block's actions
- **Server extensions**: The Dapr service extensions allow you to create services that can be invoked by other services and subscribe to topics
- **Actor**: The Dapr Actor SDK allows you to build virtual actors with methods, state, timers, and persistent reminders
- **Workflow**: Dapr Workflow makes it easy for you to write long running business logic and integrations in a reliable way

## SDK languages

| Language | Status | Client | Server extensions | Actor | Workflow |
|----------|:------|:----------:|:-----------:|:---------:|:---------:|
| [.NET]({{< ref dotnet >}}) | Stable | ✔ |  [ASP.NET Core](https://github.com/dapr/dotnet-sdk/tree/master/examples/AspNetCore) | ✔ | ✔ |
| [Python]({{< ref python >}}) | Stable | ✔ | [gRPC]({{< ref python-grpc.md >}}) <br />[FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}})| ✔ | ✔ |
| [Java]({{< ref java >}}) | Stable | ✔ | Spring Boot | ✔ | |
| [Go]({{< ref go >}}) | Stable | ✔ | ✔ | ✔ | |
| [PHP]({{< ref php >}}) | Stable | ✔ | ✔ | ✔ | |
| [Javascript]({{< ref js >}}) | Stable| ✔ | | ✔ | |
| [C++](https://github.com/dapr/cpp-sdk) | In development | ✔ | | |
| [Rust](https://github.com/dapr/rust-sdk) | In development | ✔ | | | |

## Further reading

- [Serialization in the Dapr SDKs]({{< ref sdk-serialization.md >}})
