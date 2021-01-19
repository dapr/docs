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

- **Client SDK**: The Dapr client allows you to invoke Dapr building block APIs and perform actions such as:
   - [Invoke]({{< ref service-invocation >}}) methods on other services
   - Store and get [state]({{< ref state-management >}})
   - [Publish and subscribe]({{< ref pubsub >}}) to message topics
   - Interact with external resources through input and output [bindings]({{< ref bindings >}})
   - Get [secrets]({{< ref secrets >}}) from secret stores
   - Interact with [virtual actors]({{< ref actors >}})
- **Service extensions**: The Dapr service extensions allow you to create services that can:
   - Be [invoked]({{< ref service-invocation >}}) by other services
   - [Subscribe]({{< ref pubsub >}}) to topics
- **Actor SDK**: The Dapr Actor SDK allows you to build virtual actors with:
   - Methods that can be [invoked]({{< ref "howto-actors.md#actor-method-invocation" >}}) by other services
   - [State]({{< ref "howto-actors.md#actor-state-management" >}}) that can be stored and retrieved
   - [Timers]({{< ref "howto-actors.md#actor-timers" >}}) with callbacks
   - Persistent [reminders]({{< ref "howto-actors.md#actor-reminders" >}})

## SDK languages

| Language | State | Client SDK | Service Extensions | Actor SDK |
|----------|:-----:|:----------:|:-----------:|:---------:|
| [.NET](https://github.com/dapr/dotnet-sdk) | In Development | ✔ | ASP.NET Core | ✔ |
| [Python]({{< ref python >}}) | In Development | ✔ | [gRPC]({{< ref python-grpc.md >}}) | [FastAPI]({{< ref python-fastapi.md >}})<br />[Flask]({{< ref python-flask.md >}}) |
| [Java](https://github.com/dapr/java-sdk) | In Development | ✔ | Spring Boot | ✔ |
| [Go](https://github.com/dapr/go-sdk) | In Development | ✔ | ✔ |  |
| [C++](https://github.com/dapr/cpp-sdk) | Backlog | ✔ | |
| [Rust]() | Backlog | ✔ | |  |
| [Javascript]() | Backlog | ✔ | |

## Further reading

- [Serialization in the Dapr SDKs]({{< ref sdk-serialization.md >}})