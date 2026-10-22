---
type: docs
title: "JavaScript pub/sub configuration and usage"
linkTitle: "Configuration and usage"
weight: 3400
description: "Configure pub/sub client lifetimes, endpoints, authentication, serialization, and reliable message processing"
---

This guide covers shared configuration and operational guidance for pub/sub with **`@dapr/dapr` 3.19.0-rc.4 or later**. See the [overview]({{% ref js-pubsub %}}) to choose between server callbacks and streaming subscriptions.

## Client lifetime

Reuse a long-lived `DaprClient` rather than creating one per message. Await outstanding operations before calling `await client.stop()` at shutdown.

For server subscriptions, stop the application listener with `await server.stop()`. For streaming subscriptions, close each subscription and await its `closed` promise before stopping the client; `client.stop()` does not close streams. See [streaming lifecycle guidance]({{% ref "js-pubsub-streaming-howto.md#supervise-failures-and-shut-down" %}}).

## Endpoints and authentication

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

For HTTP, select `CommunicationProtocolEnum.HTTP` and port `"3500"`. Port options are strings. The application callback protocol and port are configured separately on `DaprServer`; see [server subscriptions]({{% ref js-pubsub-subscribe-howto.md %}}).

When explicit connection settings are omitted, the SDK uses the environment settings for the selected protocol:

| Setting | Behavior |
| --- | --- |
| `DAPR_HTTP_ENDPOINT` / `DAPR_GRPC_ENDPOINT` | Supply the sidecar endpoint for the selected protocol when explicit host and port settings are omitted. |
| `DAPR_HTTP_PORT` / `DAPR_GRPC_PORT` | Supply the sidecar port when not otherwise configured; defaults are `3500` and `50001`. |
| `DAPR_API_TOKEN` | Supplies the authentication token when `daprApiToken` is omitted. |

## Custom serialization

Configure an `IDaprSerializer` using `DaprClient`'s `serializer` option. It converts application payloads to and from **strings** and can supply a `contentType`. It applies to single and bulk publishing and streaming callbacks. For server callbacks, configure it through `DaprServer`'s `clientOptions.serializer`.

```javascript
import { DaprClient, DaprServer } from "@dapr/dapr";

const serializer = {
  contentType: "application/json",
  serialize(value) {
    return JSON.stringify({ payload: value });
  },
  deserialize(data) {
    return JSON.parse(data).payload;
  },
};

const customClient = new DaprClient({ serializer });
const customServer = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: "50003",
  clientOptions: { serializer },
});
```

Use compatible serializers on both ends. A custom serializer replaces the default payload encoding; it does not automatically preserve a supplied CloudEvent envelope. TypeScript type parameters do not provide runtime validation or recreate class instances. TypeScript applications can import `IDaprSerializer` as a type from `@dapr/dapr`.

Transport-specific serialization limitations are documented beside [bulk publishing]({{% ref "js-pubsub-publish-howto.md#bulk-publishing" %}}) and [bulk subscriptions]({{% ref "js-pubsub-subscribe-howto.md#bulk-subscriptions" %}}).

## Reliable message processing

Await SDK operations inside your application's error boundary. Publication failure behavior differs by transport, and bulk publishing can partially fail even when its promise resolves; see [publish error handling]({{% ref "js-pubsub-publish-howto.md#publish-error-handling" %}}).

Make subscribers idempotent and await all processing before returning an acknowledgement. Dapr pub/sub is at-least-once, so successfully processed messages can still be redelivered. Configure retries through Dapr resiliency policies and component settings, not by assuming that the SDK retries every failure.

See [server acknowledgements and retry configuration]({{% ref "js-pubsub-subscribe-howto.md#acknowledge-retry-or-drop" %}}) and [streaming failure supervision]({{% ref "js-pubsub-streaming-howto.md#supervise-failures-and-shut-down" %}}) for delivery-mode-specific behavior.
