---
type: docs
title: "Overview of Dapr SDKs"
linkTitle: "Overview"
description: "An overview of the languages and capabilities of the Dapr SDKs"
weight: 1000
---

The Dapr SDKs are the easiest way for you to get Dapr into your application. Choose your favorite language to get started today!

## SDK capabilities

- **Client SDK**: The Dapr client allows you to invoke Dapr building block APIs and perform actions such as:
   - **Invoke** methods on other services
   - Store and get **state**
   - **Publish** messages to topics
   - **Subscribe** to topics
   - Interact with external resources through input and output **bindings**
   - Get **secrets** from secret stores
   - Interact with **virtual actors**
- **Service SDK**: The Dapr service allows you to create services that can:
   - Be **invoked** by other services
   - **Subscribe** to topics
- **Actor SDK**: The Dapr Actor SDK allows you to build virtual actors with:
   - Methods that can be **invoked** by other services
   - **State** that can be stored and retrieved
   - **Timers** with callbacks
   - Persistent **reminders**

## SDK languages

| Language | State | Client SDK | Service SDK | Actor SDK |
|----------|:-----:|:----------:|:-----------:|:---------:|
| [.NET](https://github.com/dapr/dotnet-sdk) | In Development | ✔ | ✔ (ASP.NET) | ✔ |
| [Python](https://github.com/dapr/python-sdk) | In Development | ✔ | ✔ | ✔ |
| [Java](https://github.com/dapr/java-sdk) | In Development | ✔ | ✔ (Spring Boot) | ✔ |
| [Go](https://github.com/dapr/go-sdk) | In Development | ✔ | ✔ |  |
| [C++](https://github.com/dapr/cpp-sdk) | Backlog | ✔ | |
| [Rust]() | Backlog | ✔ | |  |
| [Javascript]() | Backlog | ✔ | |

## Further reading

- [Serialization in the Dapr SDKs]({{< ref sdk-serialization.md >}})