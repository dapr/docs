---
type: docs
title: "How to: Manage binary files with the Dapr Binary Store .NET SDK"
linkTitle: "How to: Manage binary files"
weight: 53050
description: Learn how to store, retrieve, stream, and delete binary files using the Dapr Binary Store .NET SDK
---

Use the `Dapr.BinaryStore` package to store and retrieve files using a Dapr binary store component. The client streams file content in chunks, so you can work with large files without loading the entire file into memory. In this guide, you will:

- Register and configure `DaprBinaryStoreClient`
- Upload and download files using streams
- Choose between streaming and in-memory operations
- Bind a typed client to a store with the source generator

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- An initialized [Dapr environment](https://docs.dapr.io/getting-started/install-dapr-selfhost)
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0), [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0), or [.NET 10](https://dotnet.microsoft.com/download/dotnet/10.0)
- Dapr runtime 1.19 or later
- The [Dapr.BinaryStore](https://www.nuget.org/packages/Dapr.BinaryStore) NuGet package
- A binary store component configured in Dapr

Install the package in your project:

```sh
dotnet add package Dapr.BinaryStore
```

Configure a binary store component in the Dapr component directory used by your application. The component's `metadata.name` is the store name supplied to the client methods or the `[BinaryStore]` attribute.

## Register the client

Register the client in dependency injection. By default, it reads the Dapr endpoint and API token from the environment or `IConfiguration`.

```csharp
using Dapr.BinaryStore.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprBinaryStoreClient();

var app = builder.Build();
```

Start the application with its Dapr sidecar:

```sh
dapr run --app-id binary-store-example -- dotnet run
```

If you need to override the endpoint, configure the client builder:

```csharp
builder.Services.AddDaprBinaryStoreClient((sp, clientBuilder) =>
{
    clientBuilder.UseGrpcEndpoint("http://localhost:50001");
});
```

## Upload and download a file

Resolve the registered client and pass the binary store component name, a file name, and a stream. The example assumes `filestore` is the `metadata.name` of the configured component.

```csharp
using Dapr.BinaryStore;
using Microsoft.Extensions.DependencyInjection;

var client = app.Services.GetRequiredService<DaprBinaryStoreClient>();
const string storeName = "filestore";
const string fileName = "uploads/report.pdf";

await using (var source = File.OpenRead("report.pdf"))
{
    await client.SetBinaryFileAsync(storeName, fileName, source);
}

await using (var destination = File.Create("downloaded-report.pdf"))
{
    await client.GetBinaryFileAsync(storeName, fileName, destination);
}
```

The `Stream` overload of `SetBinaryFileAsync` reads the input stream from its current position and sends it to the runtime in chunks. The default upload chunk size is 32 KiB; pass `chunkSize` to choose another positive size. Set `overwrite: true` to replace an existing file. By default, an upload fails if the file already exists.

File names can include nested paths such as `uploads/report.pdf`. Avoid a leading or trailing slash, empty path segments, `.` or `..` segments, and the characters `\`, `*`, `?`, `[`, `]`, and `#`; the Dapr runtime rejects these names.

## Work with in-memory content

For content that already fits in memory, pass `ReadOnlyMemory<byte>` to upload or use `GetBinaryFileBytesAsync` to retrieve the complete file:

```csharp
byte[] content = [0x01, 0x02, 0x03];
await client.SetBinaryFileAsync(storeName, "data.bin", content);

byte[] downloaded = await client.GetBinaryFileBytesAsync(storeName, "data.bin");
```

`GetBinaryFileBytesAsync` buffers the whole file in memory. Prefer `GetBinaryFileAsync` or `GetBinaryFileChunksAsync` for large files:

```csharp
await using var chunkDestination = File.Create("downloaded-report-from-chunks.pdf");

await foreach (var chunk in client.GetBinaryFileChunksAsync(storeName, fileName))
{
    await chunkDestination.WriteAsync(chunk);
}
```

## Delete a file

```csharp
await client.DeleteBinaryFileAsync(storeName, fileName);
```

## Use a store-bound typed client

The package includes a source generator for a typed client that is bound to one component. Define a `partial` interface that extends `IDaprBinaryStoreClient` and use `[BinaryStore]` to specify the component name:

```csharp
using Dapr.BinaryStore;

[BinaryStore("filestore")]
public partial interface IFileStore : IDaprBinaryStoreClient
{
}
```

Register the generated client after registering `DaprBinaryStoreClient`:

```csharp
builder.Services
    .AddDaprBinaryStoreClient()
    .WithFileStore();
```

The generated `WithFileStore` method registers an implementation of `IFileStore`. Inject that interface where it is needed; its methods are the same as `IDaprBinaryStoreClient` but do not take a store name:

```csharp
public sealed class ReportService(IFileStore fileStore)
{
    public Task SaveAsync(string name, Stream content, CancellationToken cancellationToken) =>
        fileStore.SetBinaryFileAsync(name, content, cancellationToken: cancellationToken);
}
```
