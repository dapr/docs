---
type: docs
title: "Dapr Secrets Management .NET SDK"
linkTitle: "Secrets Management"
weight: 160000
description: "Overview of the Dapr Secrets Management building block for .NET"
---

`Dapr.SecretsManagement` provides a dedicated client for retrieving secrets from the Dapr Secrets API in a .NET application. With `DaprSecretsManagementClient` you can retrieve individual or bulk secrets from configured secret store components, pass metadata to requests, and take advantage of a source generator that provides strongly-typed access to your secrets through dependency injection using `[SecretStore]` and `[Secret]` attributes.

The client is registered with dependency injection via `AddDaprSecretsManagement()` and can be configured from `IConfiguration`, environment variables, or a `DaprSecretsManagementClientBuilder` for advanced scenarios.

## Core concepts

- [How to: Manage secrets with the Dapr Secrets Management .NET SDK]({{< ref dotnet-secrets-howto.md >}}): client registration, retrieving single and bulk secrets with metadata, the source generator for strongly-typed secrets, and testing approaches.
- [DaprSecretsManagementClient usage]({{< ref dotnet-secretsclient-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, cancellation, the three dependency injection overloads, chaining source-generator registrations, API response shapes, and error handling.

## Next steps

- [How to: Manage secrets with the Dapr Secrets Management .NET SDK]({{< ref dotnet-secrets-howto.md >}})
- [DaprSecretsManagementClient usage]({{< ref dotnet-secretsclient-usage.md >}})
