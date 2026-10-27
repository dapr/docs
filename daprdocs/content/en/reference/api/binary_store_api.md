---
type: docs
title: "Binary Store API reference"
linkTitle: "Binary Store API"
description: "Detailed documentation for the Dapr Binary Store API"
weight: 1550
---

The Binary Store API stores, retrieves, and deletes binary files in a configured binary store component. The HTTP API is currently alpha and uses the `v1.0-alpha1` version. The request body for uploads and the response body for downloads contain raw file bytes, not JSON.

## Component file

A binary store is configured as a Dapr component. The `metadata.name` is the store name used in API requests, and `spec.type` selects the component implementation:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mystore
spec:
  type: binarystore.<TYPE>
  version: v1
  metadata:
    - name: <KEY>
      value: <VALUE>
```

The values in `spec.metadata` depend on the selected component. For a local in-memory example, see the [Binary Store how-to guide]({{% ref howto-use-binary-store.md %}}).

## HTTP API

All operations use the following URL:

```text
http://localhost:<daprPort>/v1.0-alpha1/binarystore/<storeName>/<fileName>
```

| Parameter | Description |
|-----------|-------------|
| `daprPort` | The HTTP port of the Dapr sidecar. |
| `storeName` | The `metadata.name` of a configured binary store component. |
| `fileName` | The file name or relative path within the store. |

File names may contain nested relative paths. Do not use a leading or trailing slash, empty path segments, `.` or `..` path segments, or the characters `\`, `*`, `?`, `[`, `]`, and `#`. These names are rejected by the runtime.

### Upload a file without replacing an existing file

#### HTTP Request

```text
POST http://localhost:<daprPort>/v1.0-alpha1/binarystore/<storeName>/<fileName>
```

The request body is the raw file content. A successful request returns `204 No Content`. If the file already exists, the request returns `409 Conflict`.

### Upload or replace a file

#### HTTP Request

```text
PUT http://localhost:<daprPort>/v1.0-alpha1/binarystore/<storeName>/<fileName>
```

The request body is the raw file content. This operation replaces a file with the same name if one already exists. A successful request returns `204 No Content`.

### Retrieve a file

#### HTTP Request

```text
GET http://localhost:<daprPort>/v1.0-alpha1/binarystore/<storeName>/<fileName>
```

#### HTTP Response

A successful request returns `200 OK`, a response content type of `application/octet-stream`, and the file bytes as the response body. If the file does not exist, the runtime returns `404 Not Found`.

### Delete a file

#### HTTP Request

```text
DELETE http://localhost:<daprPort>/v1.0-alpha1/binarystore/<storeName>/<fileName>
```

A successful request returns `204 No Content`. If the file does not exist, the runtime returns `404 Not Found`.

### Errors

| Status code | Description |
|-------------|-------------|
| `400 Bad Request` | The file name is invalid, the binary store component is not found, or the request is malformed. |
| `404 Not Found` | The requested file does not exist. |
| `409 Conflict` | A `POST` request attempts to create a file that already exists. |
| `413 Content Too Large` | The component rejects the file because it exceeds a configured per-file size limit. |
| `507 Insufficient Storage` | The component rejects the upload because its configured total capacity is exhausted. |
| `500 Internal Server Error` | The component reports an unexpected error. |

The actual file-size and total-capacity limits depend on the component. HTTP `PUT` and `POST` uploads are exempt from the sidecar [`--max-body-size`]({{% ref increase-request-size.md %}}) limit, so only the component limits apply. A component can also return errors specific to its backend.

## gRPC API

The gRPC API is alpha and exposes the following methods:

| Method | Streaming | Description |
|--------|-----------|-------------|
| `SetBinaryFileAlpha1` | Client-streaming | The first request message contains the component name, file name, and optional overwrite setting (false by default). Subsequent messages carry the file content in chunks. |
| `GetBinaryFileAlpha1` | Server-streaming | Retrieves a file and returns its content in chunks. |
| `DeleteBinaryFileAlpha1` | Unary | Deletes a named file from a component. |

## Next steps

- Read the [Binary Store overview]({{% ref binarystore-overview.md %}}).
- Follow the [Binary Store how-to guide]({{% ref howto-use-binary-store.md %}}).
- Explore the [Dapr .NET SDK](https://docs.dapr.io/developing-applications/sdks/dotnet/) for .NET applications.
