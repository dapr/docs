---
type: docs
title: "Dapr Secrets JavaScript SDK"
linkTitle: "Secrets"
weight: 180200
description: Retrieve individual and bulk secrets using the Dapr JavaScript SDK
---

Use `DaprClient.secret` to retrieve secrets from a configured Dapr secret store in JavaScript or TypeScript. The SDK provides single-secret and bulk retrieval over HTTP and gRPC. It does not provide methods to create, update, delete, or watch secrets.

These guides target **`@dapr/dapr` 3.19.0-rc.4 or later**. Secrets use the stable Dapr Secrets API; this is not a new building block introduced in SDK 3.19.

Follow the [how-to guide]({{% ref js-secrets-howto.md %}}) for local setup and retrieval. Read the [client usage guidance]({{% ref js-secrets-client-usage.md %}}) for configuration, response shapes, metadata, protocol limitations, and errors.

{{% alert title="HTTP and gRPC differences" color="warning" %}}
In SDK 3.19.0-rc.4, the gRPC single-secret implementation ignores metadata and returns only the first key-value pair from a multi-valued secret. Use HTTP when you need per-request metadata or all values from an individual secret. Bulk retrieval preserves nested values with either protocol, but neither protocol accepts bulk metadata through the SDK.
{{% /alert %}}

See the [Secrets building block overview]({{% ref secrets-overview.md %}}) and [supported secret stores]({{% ref supported-secret-stores %}}) for runtime capabilities and component-specific requirements.
