---
type: docs
title: "How-To: Use the Binary Store API"
linkTitle: "How-To: Use Binary Store"
weight: 200
description: "Use the Dapr Binary Store API to upload, retrieve, overwrite, and delete files"
---

This guide shows how to configure a binary store component and use the Dapr HTTP API or .NET SDK to upload, retrieve, and delete a file. The examples use the runtime's in-memory component for local development.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli %}}) installed
- An initialized [Dapr environment]({{% ref install-dapr-selfhost %}})
- A Dapr runtime that supports the Binary Store API (Dapr 1.19 or later)
- For .NET examples, the `Dapr.BinaryStore` NuGet package

## Configure a binary store

A binary store component represents the storage backend used by Dapr. Save the following in-memory component definition as `components/binary-store.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mystore
spec:
  type: binarystore.in-memory
  version: v1
  metadata:
    - name: maxSize
      value: "16Mi"
    - name: maxTotalSize
      value: "64Mi"
```

The `maxSize` and `maxTotalSize` values accept either a byte count or a unit size string, such as `16Mi` or `64Mi`. Because component metadata values are strings, quote numeric byte counts in YAML (for example, `"16777216"`).

The component name `mystore` is used in the API URL. This in-memory implementation is useful for trying the API, but it does not persist files across sidecar restarts or share files between sidecar instances. For production, configure an appropriate persistent binary store component and its required metadata.

Start a Dapr sidecar with the component directory available to it. For example, use the following command to expose the HTTP API on port `3500`:

```sh
dapr run --app-id binary-store-example --resources-path ./components --dapr-http-port 3500
```

Each .NET tab shows the client registration and resolution needed for that example. In an application, register the singleton once at startup and inject it into your service.

## Upload a file

Send the file as raw binary data. Use `POST` to create a file without replacing an existing one. The .NET client also creates without replacing by default:

{{< tabpane text=true >}}

<!-- HTTP -->
{{% tab "Bash" %}}

```sh
curl -X POST \
  http://localhost:3500/v1.0-alpha1/binarystore/mystore/report.pdf \
  --data-binary @./report.pdf
```

{{% /tab %}}

<!-- .NET -->
{{% tab ".NET" %}}

```csharp
using Dapr.BinaryStore;
using Dapr.BinaryStore.Extensions;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprBinaryStoreClient();
var app = builder.Build();

var binaryStore = app.Services.GetRequiredService<DaprBinaryStoreClient>();
await using var content = File.OpenRead("./report.pdf");
await binaryStore.SetBinaryFileAsync("mystore", "report.pdf", content);
```

{{% /tab %}}

{{< /tabpane >}}

The HTTP request returns `204 No Content` when successful. If `report.pdf` already exists, HTTP `POST` fails with `409 Conflict`; the .NET client reports runtime failures as a `DaprException`.

To replace a file that already exists, use `PUT`. In .NET, set `overwrite` to `true`:

{{< tabpane text=true >}}

<!-- HTTP -->
{{% tab "Bash" %}}

```sh
curl -X PUT \
  http://localhost:3500/v1.0-alpha1/binarystore/mystore/report.pdf \
  --data-binary @./updated-report.pdf
```

{{% /tab %}}

<!-- .NET -->
{{% tab ".NET" %}}

```csharp
using Dapr.BinaryStore;
using Dapr.BinaryStore.Extensions;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprBinaryStoreClient();
var app = builder.Build();

var binaryStore = app.Services.GetRequiredService<DaprBinaryStoreClient>();
await using var content = File.OpenRead("./updated-report.pdf");
await binaryStore.SetBinaryFileAsync("mystore", "report.pdf", content, overwrite: true);
```

{{% /tab %}}

{{< /tabpane >}}

An HTTP overwrite that succeeds returns `204 No Content`.

Neither API requires file data to be encoded as JSON. The runtime streams the content to the component, which may enforce a maximum file size or total store capacity; configure and review the limits of the component you use. HTTP uploads are exempt from the sidecar [`--max-body-size`]({{% ref increase-request-size.md %}}) limit, so a file can be larger than that limit.

## Retrieve a file

The `GET` operation returns the file as raw binary data with the `application/octet-stream` content type. Use `-o` to write the response directly to a file. The .NET SDK can stream the content to a destination stream:

{{< tabpane text=true >}}

<!-- HTTP -->
{{% tab "Bash" %}}

```sh
curl http://localhost:3500/v1.0-alpha1/binarystore/mystore/report.pdf \
  -o downloaded-report.pdf
```

{{% /tab %}}

<!-- .NET -->
{{% tab ".NET" %}}

```csharp
using Dapr.BinaryStore;
using Dapr.BinaryStore.Extensions;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprBinaryStoreClient();
var app = builder.Build();

var binaryStore = app.Services.GetRequiredService<DaprBinaryStoreClient>();
await using var destination = File.Create("downloaded-report.pdf");
await binaryStore.GetBinaryFileAsync("mystore", "report.pdf", destination);
```

{{% /tab %}}

{{< /tabpane >}}

If the file does not exist, the HTTP API returns `404 Not Found`; the .NET client reports the runtime error as a `DaprException`.

## Delete a file

{{< tabpane text=true >}}

<!-- HTTP -->
{{% tab "Bash" %}}

```sh
curl -X DELETE \
  http://localhost:3500/v1.0-alpha1/binarystore/mystore/report.pdf
```

{{% /tab %}}

<!-- .NET -->
{{% tab ".NET" %}}

```csharp
using Dapr.BinaryStore;
using Dapr.BinaryStore.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprBinaryStoreClient();
var app = builder.Build();

var binaryStore = app.Services.GetRequiredService<DaprBinaryStoreClient>();
await binaryStore.DeleteBinaryFileAsync("mystore", "report.pdf");
```

{{% /tab %}}

{{< /tabpane >}}

An HTTP delete returns `204 No Content` when successful. The .NET client completes the operation without returning a response value.

## File names and nested paths

File names are relative paths within the selected binary store. Nested paths such as `images/profile.png` are supported. Encode path characters as required when constructing an HTTP URL. Names with a leading or trailing slash, empty path segments, `.` or `..` segments, or any of `\`, `*`, `?`, `[`, `]`, and `#` are rejected by the runtime.

## Next steps

- Read the [Binary Store overview]({{% ref binarystore-overview.md %}}).
- Review the [Binary Store API reference]({{% ref binary_store_api.md %}}).
- See the [Dapr .NET Binary Store documentation](https://docs.dapr.io/developing-applications/sdks/dotnet/dotnet-binarystore/) for SDK-specific usage.
