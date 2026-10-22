---
type: docs
title: "How to: Manage binary files with the Dapr JavaScript SDK"
linkTitle: "How to: Manage binary files"
weight: 53050
description: Learn how to store, retrieve, stream, and delete binary files using the Dapr JavaScript SDK
---

Use `DaprClient.binaryStore` to store and retrieve files through a Dapr binary store component. The client supports binary streams so you can transfer large files without loading the entire file into your application's memory. This guide covers component configuration, uploads, downloads, overwrites, and deletes.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}}) with Dapr runtime 1.19 or later
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, version 3.19.0 or later
- A configured [binary store component]({{% ref "developing-applications/building-blocks/binarystore/_index.md" %}}), such as the in-memory component below

In your application directory, initialize an npm project if you do not already have one, then install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

The examples use JavaScript ES modules and run as a `.mjs` file without a TypeScript compiler. The same APIs are available in TypeScript.

## Configure an in-memory binary store

Create a `components` directory in your application directory and save the following as `components\filestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: filestore
spec:
  type: binarystore.in-memory
  version: v1
  metadata:
    - name: maxSize
      value: "4Mi"
    - name: maxTotalSize
      value: "512Mi"
```

This component stores files in the sidecar's memory, with a per-file limit of 4 MiB and a combined capacity of 512 MiB. Files are lost when the sidecar stops and are not shared across sidecars. Use it for local development and testing, not durable storage. See the [in-memory component reference]({{% ref binarystore-in-memory.md %}}) for capacity settings.

The component's `metadata.name`, `filestore`, is the store name passed to every client operation. It is not the component's type or the YAML file name.

## Upload and download a file

Place a `report.pdf` file no larger than 4 MiB in your application's working directory. Save the following as `app.mjs`:

```javascript
import { createReadStream, createWriteStream } from "node:fs";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

const storeName = "filestore";
const fileName = "uploads/report.pdf";

try {
  await client.binaryStore.setBinaryFile(
    storeName,
    fileName,
    createReadStream("report.pdf"),
  );

  await client.binaryStore.getBinaryFile(
    storeName,
    fileName,
    createWriteStream("downloaded-report.pdf"),
  );

  console.log("Downloaded report.pdf to downloaded-report.pdf");
} finally {
  await client.stop();
}
```

Start the application with a Dapr sidecar, loading the component from `components`:

```sh
dapr run --app-id binary-store-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```

The example uploads `report.pdf` under the store-relative name `uploads/report.pdf` and downloads it to `downloaded-report.pdf`. `getBinaryFile` waits for the destination stream to finish and ends it on success.

To use gRPC instead, change `communicationProtocol` to `CommunicationProtocolEnum.GRPC` and `daprPort` to `"50001"`. All binary store methods work with either protocol.

The examples below reuse `client`, `storeName`, and `fileName`. Add them inside the `try` block, after the download and before the client is stopped. Run the delete example last. If you rerun the application against a sidecar that still holds the file, delete it first or explicitly enable overwriting.

## Replace an existing file

Uploads do not overwrite existing files by default. To replace a file, pass `overwrite: true` in the options object:

```javascript
await client.binaryStore.setBinaryFile(
  storeName,
  fileName,
  createReadStream("report.pdf"),
  { overwrite: true, chunkSize: 64 * 1024 },
);
```

Uploads use a maximum chunk size of 32 KiB by default. Set `chunkSize` to another positive safe integer, in bytes, to tune upload chunking. This does not change the component's per-file or total-capacity limits.

File names can include nested paths such as `uploads/report.pdf`. Do not use a leading or trailing slash, empty path segments, `.` or `..` segments, or the characters `\`, `*`, `?`, `[`, `]`, and `#`. Pass the name as plain text, not a URL or a pre-encoded value; the HTTP client URL-encodes it.

## Work with in-memory content

For small files already held in memory, upload a `Uint8Array` or Node.js `Buffer`. Use `getBinaryFileBytes` to retrieve the complete file as a `Buffer`:

```javascript
const content = Buffer.from([0x00, 0x80, 0xff]);
await client.binaryStore.setBinaryFile(storeName, "data.bin", content);

const downloaded = await client.binaryStore.getBinaryFileBytes(
  storeName,
  "data.bin",
);
console.log("Bytes match:", downloaded.equals(content));
```

The SDK transfers raw bytes without JSON serialization or text encoding. Empty files are supported; for example, upload `Buffer.alloc(0)` to create an empty file.

`getBinaryFileBytes` buffers the entire download in memory. Prefer `getBinaryFile` or `getBinaryFileChunks` for large files.

## Read a file in chunks

`getBinaryFileChunks` returns an `AsyncIterable<Buffer>`. Consume it with `for await...of` to process the bytes in order without buffering the entire file:

```javascript
let totalBytes = 0;
for await (const chunk of client.binaryStore.getBinaryFileChunks(
  storeName,
  fileName,
)) {
  totalBytes += chunk.length;
}
console.log("Downloaded bytes:", totalBytes);
```

Chunk boundaries can differ between protocols and do not necessarily match the upload chunks. Breaking out of the loop closes the download stream.

## Delete a file

```javascript
await client.binaryStore.deleteBinaryFile(storeName, fileName);
await client.binaryStore.deleteBinaryFile(storeName, "data.bin");
```

A missing file causes downloads and deletes to fail rather than returning empty content or silently succeeding.

## Next steps

Read the [client usage guidance]({{% ref js-binarystore-client-usage.md %}}) for cancellation, stream ownership, client configuration, and error handling.
