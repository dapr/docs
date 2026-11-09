---
type: docs
title: "Dapr Cryptography .NET SDK"
linkTitle: "Cryptography"
weight: 140000
description: "Overview of the Dapr Cryptography building block for .NET"
---

`Dapr.Cryptography` provides a dedicated client for performing high-performance encryption and decryption operations with Dapr. The `DaprEncryptionClient` supports streaming operations that can handle data of any size, offloading the cryptographic work to the Dapr runtime and its configured cryptography components.

The client is registered with dependency injection via `AddDaprEncryptionClient()` and can be configured from `IConfiguration`, environment variables, or a `DaprEncryptionClientBuilder` for advanced scenarios.

## Core concepts

- [How to: Create and use Dapr Cryptography in the .NET SDK]({{< ref dotnet-cryptography-howto.md >}}): install the package, register the client with dependency injection or build it manually, and try the samples.
- [DaprEncryptionClient usage]({{< ref dotnet-cryptography-usage.md >}}): lifetime management, builder configuration, environment variables, gRPC channel options, cancellation, and the three dependency injection overloads.

## Next steps

- [How to: Create and use Dapr Cryptography in the .NET SDK]({{< ref dotnet-cryptography-howto.md >}})
- [DaprEncryptionClient usage]({{< ref dotnet-cryptography-usage.md >}})
