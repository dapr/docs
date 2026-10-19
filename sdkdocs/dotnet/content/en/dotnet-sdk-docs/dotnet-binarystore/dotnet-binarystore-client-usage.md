---
type: docs
title: "DaprBinaryStoreClient usage"
linkTitle: "DaprBinaryStoreClient usage"
weight: 53100
description: Essential guidance for configuring and using DaprBinaryStoreClient
---

## Client lifetime

`DaprBinaryStoreClient` uses network resources and implements `IDisposable`. Reuse a long-lived client rather than creating one for each operation. The dependency injection registration uses `ServiceLifetime.Singleton` by default; use the optional `lifetime` argument to select another lifetime when needed.

```csharp
using Dapr.BinaryStore.Extensions;
using Microsoft.Extensions.DependencyInjection;

builder.Services.AddDaprBinaryStoreClient(lifetime: ServiceLifetime.Singleton);
```

## Client configuration

`DaprBinaryStoreClientBuilder` inherits the common Dapr client builder configuration. The client reads these values from environment variables or `IConfiguration`:

| Setting | Description |
|---------|-------------|
| `DAPR_GRPC_ENDPOINT` | gRPC endpoint address for the Dapr sidecar |
| `DAPR_HTTP_ENDPOINT` | HTTP endpoint address for the Dapr sidecar |
| `DAPR_API_TOKEN` | API token used to authenticate with the Dapr sidecar |
| `DAPR_GRPC_PORT` | gRPC port used if `DAPR_GRPC_ENDPOINT` is not set |
| `DAPR_HTTP_PORT` | HTTP port used if `DAPR_HTTP_ENDPOINT` is not set |

Values explicitly set on the builder take precedence over values from configuration:

```csharp
using Dapr.BinaryStore.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

builder.Services.AddDaprBinaryStoreClient((sp, clientBuilder) =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var endpoint = configuration["DaprGrpcEndpoint"];

    if (!string.IsNullOrEmpty(endpoint))
    {
        clientBuilder.UseGrpcEndpoint(endpoint);
    }
});
```

The builder also supports `UseHttpEndpoint`, `UseDaprApiToken`, `UseGrpcChannelOptions`, and `UseTimeout` for applications that need to customize the common Dapr client settings.

## Streaming and memory use

Use the `Stream` overload of `SetBinaryFileAsync` and `GetBinaryFileAsync` for large files. Uploads use a 32 KiB chunk size by default; specify `chunkSize` on upload to tune this, and ensure it is greater than zero. `GetBinaryFileChunksAsync` returns an asynchronous sequence of chunks chosen by the runtime.

The `ReadOnlyMemory<byte>` overload of `SetBinaryFileAsync` and `GetBinaryFileBytesAsync` are convenient for small files already held in memory. `GetBinaryFileBytesAsync` buffers the complete download in a byte array.

## Cancellation

All asynchronous operations accept a `CancellationToken`. Pass the token through uploads, downloads, chunk enumeration, and deletes so the operation can be canceled when the caller no longer needs it:

```csharp
await client.SetBinaryFileAsync(
    storeName,
    fileName,
    source,
    cancellationToken: cancellationToken);
```

When canceled, an `OperationCanceledException` is thrown. For chunk enumeration, pass the token to `GetBinaryFileChunksAsync`:

```csharp
await foreach (var chunk in client.GetBinaryFileChunksAsync(
                   storeName,
                   fileName,
                   cancellationToken))
{
    await ProcessChunkAsync(chunk);
}
```

## Errors

The client throws `DaprException` when the Dapr runtime reports a failure. For example, a file that does not exist cannot be retrieved or deleted, and an upload without `overwrite: true` fails if a file with the same name already exists. Inspect `InnerException` for details from the runtime. Invalid client arguments, such as an empty store or file name or a non-positive upload chunk size, result in standard argument exceptions.
