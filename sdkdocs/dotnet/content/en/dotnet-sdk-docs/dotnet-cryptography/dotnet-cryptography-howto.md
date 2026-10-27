---
type: docs
title: "How to: Create and use Dapr Cryptography in the .NET SDK"
linkTitle: "How to: Use the Cryptography client"
weight: 510100
description: Learn how to create and use the Dapr Cryptography client using the .NET SDK
---

## Prerequisites
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0),
  [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0),
  [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0), or
  [.NET 11](https://dotnet.microsoft.com/download/dotnet/11.0) installed
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Initialized Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)

## Installation

{{% alert title=".NET framework support" color="warning" %}}
Be advised that .NET 8 and .NET 9 reach end of support in November 2026. Support for both will be dropped
in Dapr v1.20; only .NET 10 and .NET 11 will be supported through the end of 2027.
{{% /alert %}}
To get started with the Dapr Cryptography client, install the [Dapr.Cryptography package](https://www.nuget.org/packages/Dapr.Cryptography) from NuGet:
```sh
dotnet add package Dapr.Cryptography
```

These examples target SDK `1.19.0` or later. Configure a cryptography component and a key supported by
that component before running them. Import `Dapr.Cryptography.Encryption`,
`Dapr.Cryptography.Encryption.Models`, and `Dapr.Cryptography.Encryption.Extensions`.
The client is experimental (`DAPR_CRYPTOGRAPHY`).

A `DaprEncryptionClient` maintains access to networking resources in the form of TCP sockets used to communicate with 
the Dapr sidecar.

### Dependency Injection

The `AddDaprEncryptionClient()` method will register the Dapr client with dependency injection and is the recommended approach
for using this package. This method accepts an optional options delegate for configuring the `DaprEncryptionClient` and a
`ServiceLifetime` argument, allowing you to specify a different lifetime for the registered services instead of the default `Singleton`
value.

The following example assumes all default values are acceptable and is sufficient to register the `DaprEncryptionClient`:

```csharp
services.AddDaprEncryptionClient();
```

The optional configuration delegate is used to configure the `DaprEncryptionClient` by specifying options on the
`DaprEncryptionClientBuilder` as in the following example:
```csharp
services.AddSingleton<DefaultOptionsProvider>();
services.AddDaprEncryptionClient((serviceProvider, clientBuilder) => {
     //Inject a service to source a value from
     var optionsProvider = serviceProvider.GetRequiredService<DefaultOptionsProvider>();
     var standardTimeout = optionsProvider.GetStandardTimeout();
     
     //Configure the value on the client builder
     clientBuilder.UseTimeout(standardTimeout);
});
```

### Manual Instantiation
Rather than using dependency injection, a `DaprEncryptionClient` can also be built using the static client builder.

For best performance, create a single long-lived instance of `DaprEncryptionClient` and provide access to that shared instance throughout
your application. `DaprEncryptionClient` instances are thread-safe and intended to be shared.

Avoid creating a `DaprEncryptionClient` per-operation.

A `DaprEncryptionClient` can be configured by invoking methods on the `DaprEncryptionClientBuilder` class before calling `.Build()`
to create the client. The settings for each `DaprEncryptionClient` are separate and cannot be changed after calling `.Build()`.

```csharp
var daprEncryptionClient = new DaprEncryptionClientBuilder()
    .UseGrpcEndpoint("http://localhost:50001")
    .Build();
```

See the .NET [documentation here]({{< ref dotnet-client >}}) for more information about the options available when configuring the Dapr client via the builder.

## Try it out
Put the Dapr Cryptography .NET SDK to the test. Walk through the samples to see Dapr in action:

| SDK Samples                                                                         | Description |
|-------------------------------------------------------------------------------------| ----------- |
| [SDK samples](https://github.com/dapr/dotnet-sdk/tree/master/examples/Cryptography) | Clone the SDK repo to try out some examples and get started. |

## Encrypt and decrypt buffered content

The byte overloads accept and return `ReadOnlyMemory<byte>`. They buffer the complete output, so use them
for content that fits in memory:

```csharp
using System.Text;
using Dapr.Cryptography.Encryption.Models;

var options = new EncryptionOptions(KeyWrapAlgorithm.RsaOaep256)
{
    EncryptionCipher = DataEncryptionCipher.AesGcm
};

var ciphertext = await daprEncryptionClient.EncryptAsync(
    "cryptostore", Encoding.UTF8.GetBytes("Sensitive content"), "encryption-key",
    options, cancellationToken);

var plaintext = await daprEncryptionClient.DecryptAsync(
    "cryptostore", ciphertext, "encryption-key", cancellationToken: cancellationToken);
```

Choose a key-wrap algorithm supported by your configured key and component. The SDK exposes AES key-wrap
(`Aes`, `A256kw`), AES-CBC (`A128cbc`, `A192cbc`, `A256cbc`), and RSA (`Rsa`, `RsaOaep256`) choices;
exposing an enum value does not guarantee that every cryptography component supports it.

## Encrypt and decrypt streams

The stream overloads return `IAsyncEnumerable<ReadOnlyMemory<byte>>`. Consume all output chunks and write
them to your destination instead of buffering the file:

```csharp
await using (var source = File.OpenRead("report.pdf"))
await using (var encrypted = File.Create("report.pdf.enc"))
{
    await foreach (var chunk in daprEncryptionClient.EncryptAsync(
        "cryptostore", source, "encryption-key", options, cancellationToken))
    {
        await encrypted.WriteAsync(chunk, cancellationToken);
    }
}

await using (var encrypted = File.OpenRead("report.pdf.enc"))
await using (var destination = File.Create("report-restored.pdf"))
{
    await foreach (var chunk in daprEncryptionClient.DecryptAsync(
        "cryptostore", encrypted, "encryption-key", cancellationToken: cancellationToken))
    {
        await destination.WriteAsync(chunk, cancellationToken);
    }
}
```

The caller owns the input and destination streams. Enumeration completes after both request and response
processing finish. Errors can occur while enumerating, not just when obtaining the enumerable. Disposing the
enumerator early cancels processing and waits for it to stop; do not treat a partial output file as a complete
encrypted or decrypted document.

## Encryption and decryption options

| Setting | Behavior |
| --- | --- |
| `EncryptionOptions.KeyWrapAlgorithm` | Required constructor argument; selects the key-wrap algorithm. |
| `EncryptionOptions.EncryptionCipher` | `AesGcm` by default, or `ChaCha20Poly1305`. |
| `EncryptionOptions.DecryptionKeyName` | Optional key name/version to record for decryption. If omitted, the SDK asks the runtime to omit the decryption key name from the encrypted header. Supply the key when decrypting. |
| `EncryptionOptions.StreamingBlockSizeInBytes` | Upload block size, 4 KiB by default; must be positive and generally should not exceed 64 KiB. |
| `DecryptionOptions.StreamingBlockSizeInBytes` | Decryption upload block size, also 4 KiB by default and required to be positive. |

`DecryptAsync` accepts optional `DecryptionOptions`. Cryptography operates on bytes, not JSON, regardless
of the shared builder's JSON serialization options. The dedicated client implements streaming encryption
and decryption; it does not expose key retrieval, signing, verification, or the runtime's other subtle APIs.

## Errors and cancellation

Pass a cancellation token through both client calls and destination writes. gRPC and stream-processing failures
must be observed while awaiting or enumerating the result; they are not successful empty outputs. Cancellation
or a failed stream does not remove any partial destination file your application has already written.
