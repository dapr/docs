---
type: docs
title: "Dapr Configuration JavaScript SDK"
linkTitle: "Configuration"
weight: 54000
description: Read application configuration and subscribe to changes with the Dapr JavaScript SDK
---

Use `DaprClient.configuration` to retrieve application configuration from a configured store and subscribe to changes. You can read selected keys or all keys, watch selected keys or the whole store, and pass store-specific request metadata.

These guides target `@dapr/dapr` 3.19.0 or later. Configuration operations in the JavaScript SDK require **gRPC**; the HTTP client throws `HTTPNotSupportedError` for both reads and subscriptions, even though the Dapr runtime exposes an HTTP Configuration API.

The client reads and watches configuration; it does not create, update, or delete configuration items. Make those changes directly in the backing store using its own tools or API. This building block manages application settings, not the Dapr runtime's `Configuration` resource.

Start with the [configuration how-to guide]({{% ref js-configuration-howto.md %}}) for a runnable example. Refer to the [client usage guidance]({{% ref js-configuration-client-usage.md %}}) for the complete method surface, metadata, response shapes, subscription lifetime, and error handling.

## Related links

- [Configuration building block overview]({{% ref configuration-api-overview.md %}})
- [Configuration API reference]({{% ref configuration_api.md %}})
- [Supported configuration stores]({{% ref supported-configuration-stores %}})
