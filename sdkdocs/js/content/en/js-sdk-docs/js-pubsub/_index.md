---
type: docs
title: "Publish and subscribe with the JavaScript SDK"
linkTitle: "Publish and subscribe"
weight: 3000
description: "Choose a pub/sub delivery mode and get started with publishing, server subscriptions, or gRPC streaming"
no_list: true
---

The JavaScript SDK supports publishing events over HTTP or gRPC, programmatic subscriptions through `DaprServer`, and client-initiated streaming subscriptions through `DaprClient`. These guides describe `@dapr/dapr` 3.19.0 or later.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) and an [initialized Dapr environment]({{% ref install-dapr-selfhost.md %}}).
- A supported Node.js LTS release. The package requires Node.js 18 or later.
- A configured [pub/sub component]({{% ref supported-pubsub %}}). The examples use the component name `pubsub` and topic `orders`.

## Installation

Install the 3.19.0 release:

```sh
npm install @dapr/dapr@3.19.0
```

For a later release, substitute its version.

Code snippets use ES module imports. Run statements containing `await` in an async function or an ES module. Each guide identifies the client or server configuration used by its examples.

## Choose a delivery mode

| Capability | HTTP | gRPC |
| --- | --- | --- |
| `client.pubsub.publish()` | Supported | Supported |
| `client.pubsub.publishBulk()` | Supported | Supported |
| `server.pubsub.subscribe()` and `subscribeWithOptions()` | Inbound HTTP callbacks | Inbound gRPC callbacks |
| Content-based routing and `subscribeToRoute()` | Supported | Supported |
| `server.pubsub.subscribeBulk()` | Per-message callback from each batch | Per-message callback from each batch |
| `client.pubsub.subscribeStream()` | Not supported | Client-initiated stream; no application server |

Choose server subscriptions when Dapr should deliver events to your application's HTTP or gRPC listener. Subscriptions are discovered at application startup. Choose streaming subscriptions for workers that initiate the connection to Dapr and do not need an application callback listener. Streams can be created and closed at runtime, but do not support routing rules or bulk subscription options.

## Runtime compatibility

Bulk publishing uses the stable API on Dapr 1.17 or later, with automatic fallback to the deprecated alpha1 API on older runtimes.

Streaming subscriptions use `SubscribeTopicEventsAlpha1`, an alpha gRPC API. Use a runtime that implements this API; installing the JavaScript package alone does not enable it. API availability and broker-specific features depend on the Dapr runtime and component.

## Guides

| Guide | Contents |
| --- | --- |
| [Publishing events]({{% ref js-pubsub-publish-howto.md %}}) | Single and bulk publishing, metadata, CloudEvents, raw payloads, and publication failures. |
| [Server subscriptions]({{% ref js-pubsub-subscribe-howto.md %}}) | Registration, callback data, acknowledgements, routing, wildcards, bulk delivery, and dead-letter topics. |
| [Streaming subscriptions]({{% ref js-pubsub-streaming-howto.md %}}) | A complete worker, streaming options, cancellation, failure supervision, and cleanup. |
| [Configuration and usage]({{% ref js-pubsub-usage.md %}}) | Client lifetime, endpoint and authentication settings, serialization, and reliable processing. |

## Implementation references

For implementation details, see the published [3.19.0 package](https://www.npmjs.com/package/@dapr/dapr/v/3.19.0) and the upstream SDK implementation:

- [Client pub/sub interface](https://github.com/dapr/js-sdk/blob/main/src/interfaces/Client/IClientPubSub.ts)
- [Server pub/sub interface](https://github.com/dapr/js-sdk/blob/main/src/interfaces/Server/IServerPubSub.ts)
- [Streaming subscription types](https://github.com/dapr/js-sdk/blob/main/src/types/pubsub/PubSubStreamingSubscription.type.ts)
- [Streaming integration examples](https://github.com/dapr/js-sdk/blob/main/test/e2e/grpc/pubsub-stream-client.test.ts)
- [Dapr pub/sub API reference]({{% ref pubsub_api.md %}})
