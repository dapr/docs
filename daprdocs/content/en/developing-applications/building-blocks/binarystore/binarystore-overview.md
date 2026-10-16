---
type: docs
title: "Binary Store overview"
linkTitle: "Overview"
weight: 100
description: "An overview of the Dapr Binary Store building block"
---

The Dapr Binary Store building block provides a portable API for storing, retrieving, and deleting binary files through a configured component. Applications address a file by its name and the name of the binary store component. The runtime streams file content between the application and the component instead of wrapping it in a JSON value. This avoids an additional full-file buffer in the runtime, although the selected component may buffer content or enforce its own size limits.

The Binary Store is intended for files and other opaque binary content. For small application values that are naturally represented as key/value data, use [State management]({{% ref "state-management-overview.md" %}}) instead.

{{% alert title="Alpha API" color="warning" %}}
The Binary Store API is currently [alpha]({{% ref "certification-lifecycle.md" %}}). The HTTP API uses the `v1.0-alpha1` version, and the corresponding gRPC methods are also alpha. The API may change in a future release.
{{% /alert %}}

## Features

The Binary Store building block provides:

- **Component portability**: use a component by its configured name and change the storage backend without changing the API calls in your application.
- **Streaming**: upload and download file content as a stream rather than wrapping it in a JSON payload.
- **Create or replace behavior**: create a file only when it does not exist, or explicitly replace an existing file.
- **File operations**: retrieve and delete a named file using the same component and file name.

File names can contain nested relative paths, such as `reports/2026/summary.pdf`. Names must not start or end with `/`, contain empty path segments, `.` or `..` path segments, or include `\`, `*`, `?`, `[`, `]`, or `#`. The runtime rejects invalid names.

## Components

Binary stores are configured as Dapr components. The component's `metadata.name` is the store name used in Binary Store API requests, and `spec.type` selects the implementation. Component-specific connection details and capabilities are configured in the component's metadata. See the [supported Binary Store components]({{% ref "reference/components-reference/supported-binarystores/_index.md" %}}) for provider configuration details, or browse the [Binary Store component implementations](https://github.com/dapr/components-contrib/tree/master/binarystore).

The Dapr runtime includes an `in-memory` binary store component for local development and testing. It is not durable: files are held in the sidecar's memory, are not shared with other sidecar instances, and are lost when the process stops. Its default maximum file size is 4 MiB and its default total store size is 512 MiB. These limits can be configured on that component; limits and durability for other stores depend on the component.

## Binary Store API

The HTTP API exposes `POST`, `PUT`, `GET`, and `DELETE` operations at `/v1.0-alpha1/binarystore/{storeName}/{fileName}`. The request and response bodies contain raw file bytes. A `POST` creates a file only if it does not already exist; a `PUT` replaces an existing file. A successful upload or delete returns `204 No Content`, while a successful download streams the file with the `application/octet-stream` content type.

For endpoint parameters, response codes, and gRPC method details, see the [Binary Store API reference]({{% ref binary_store_api.md %}}).

## Next steps

- Follow the [how-to guide]({{% ref howto-use-binary-store.md %}}) to configure a store and use the HTTP API.
- Review the [Binary Store API reference]({{% ref binary_store_api.md %}}).
