---
type: docs
title: "Binary Store client usage"
linkTitle: "Client usage"
weight: 53100
description: Essential guidance for configuring and using the JavaScript Binary Store client
---

Binary Store is available through `DaprClient.binaryStore` in JavaScript SDK **3.19.0-RC.4 or later** and requires **Dapr runtime 1.19 or later**. Both HTTP and gRPC use the alpha Binary Store API.

## Client lifetime and configuration

Reuse a long-lived `DaprClient` rather than creating a client for each operation. Await outstanding operations before calling `await client.stop()` during application shutdown.

The default protocol is HTTP. To explicitly configure a gRPC connection:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

Use `CommunicationProtocolEnum.HTTP` and the sidecar's HTTP port (by default `"3500"`) for HTTP. Supply port values as strings.

When you omit explicit host and port options, the SDK can use `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT` for the selected protocol. Otherwise, it uses the configured host and port, falling back to `127.0.0.1` and `DAPR_HTTP_PORT` or `DAPR_GRPC_PORT` (defaults: `3500` and `50001`). The API token defaults to `DAPR_API_TOKEN` if `daprApiToken` is not supplied. Binary store requests use the same authentication settings as other client operations.

## Choose an operation

All methods take a component name and a store-relative file name. The optional options object is the last argument.

| Method | Content or destination | Result |
|--------|------------------------|--------|
| `setBinaryFile(storeName, fileName, content, options?)` | `Uint8Array`, `Buffer`, or binary Node.js `Readable` | `Promise<void>` |
| `getBinaryFile(storeName, fileName, destination, options?)` | Node.js `Writable` | `Promise<void>` |
| `getBinaryFileBytes(storeName, fileName, options?)` | No destination; buffers the complete file | `Promise<Buffer>` |
| `getBinaryFileChunks(storeName, fileName, options?)` | No destination; yields ordered chunks | `AsyncIterable<Buffer>` |
| `deleteBinaryFile(storeName, fileName, options?)` | No content or destination | `Promise<void>` |

TypeScript applications can import `IClientBinaryStore`, `BinaryStoreOptions`, and `BinaryStoreSetOptions` as types from `@dapr/dapr`. `BinaryStoreOptions` contains `signal?: AbortSignal`. Uploads accept `BinaryStoreSetOptions`, which also provides `overwrite?: boolean` and `chunkSize?: number`.

## Streaming and memory use

Use a binary `Readable`, such as `createReadStream`, for large uploads. The stream must emit `Uint8Array` or `Buffer` chunks, not strings. Do not set a text encoding on the source stream. Once initial validation succeeds, the client consumes the source from its current position and destroys it when the upload finishes or fails. If validation fails or the signal is already aborted before the transfer starts, the caller remains responsible for closing the source. Create a new source stream for each attempt.

The upload chunk size defaults to 32 KiB. A custom `chunkSize` must be a positive safe integer. Smaller chunks do not bypass the component's file-size or total-capacity limits.

`getBinaryFile` uses a stream pipeline that respects destination backpressure. It ends the destination on success and destroys it on failure. Do not reuse that destination for another download. A failed download may leave a partial local file; your application should remove or otherwise handle it.

`getBinaryFileChunks` lets you process each `Buffer` as it arrives. Consume it with `for await...of`; breaking out of the loop closes the response stream. Download chunk sizes are determined by the runtime and transport, not by the upload's `chunkSize`.

Use `getBinaryFileBytes` only when the entire file fits comfortably in memory. It accumulates all chunks and concatenates them into a `Buffer`, so peak memory use can exceed the size of the file.

## Cancellation

Every binary store operation accepts `signal` in its options object. Pass an `AbortSignal` to cancel work when the caller disconnects or an application deadline expires. For example, add a 30-second deadline to a download:

```javascript
import { createWriteStream } from "node:fs";

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30_000);

try {
  await client.binaryStore.getBinaryFile(
    "filestore",
    "uploads/report.pdf",
    createWriteStream("downloaded-report.pdf"),
    { signal: controller.signal },
  );
} finally {
  clearTimeout(timeout);
}
```

This snippet assumes an existing `client`. Keep the import at module scope and run the remaining code inside an async function or an ES module. Cancellation rejects the operation and can destroy the associated streams. Do not assume every protocol reports cancellation using the same error class.

For chunk enumeration, pass the signal to `getBinaryFileChunks` itself. This example creates a fresh 30-second timeout signal:

```javascript
for await (const chunk of client.binaryStore.getBinaryFileChunks(
  "filestore",
  "uploads/report.pdf",
  { signal: AbortSignal.timeout(30_000) },
)) {
  console.log("Received bytes:", chunk.length);
}
```

## Errors

Await each operation and handle failures at your application's error boundary. For `getBinaryFileChunks`, errors surface while iterating, so error handling must surround the `for await...of` loop.

Runtime failures reject rather than returning success-shaped defaults. Examples include an upload to an existing file without `overwrite: true`, downloading or deleting a missing file, a missing component, and exceeding component capacity.

- **HTTP:** Runtime errors are JavaScript `Error` instances whose `message` is a JSON string containing `status` (HTTP status code), `error` (status text), and `error_msg` (runtime response body). Transport and stream errors can have different shapes; do not assume every error message is JSON.
- **gRPC:** Runtime errors preserve the `ConnectError` codes from `@connectrpc/connect`. Do not handle them as HTTP status codes.
- **Invalid arguments:** Empty store or file names, invalid file path segments or characters, unsupported content types, or a destination that is not a `Writable` result in a `TypeError`. Invalid upload chunk sizes result in a `RangeError`. Non-binary source chunks are rejected during the transfer; the transport may wrap the underlying `TypeError`.

See the [Binary Store API reference]({{% ref binary_store_api.md %}}) for runtime error semantics and the [how-to guide]({{% ref js-binarystore-howto.md %}}) for file-name restrictions and complete setup.
