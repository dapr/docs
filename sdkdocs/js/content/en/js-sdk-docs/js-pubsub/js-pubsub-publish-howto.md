---
type: docs
title: "Publish events with the JavaScript SDK"
linkTitle: "Publishing events"
weight: 3100
description: "Publish single events and batches, configure metadata and CloudEvents, and handle publication failures"
---

Use `DaprClient.pubsub` to publish events over HTTP or gRPC with `@dapr/dapr` 3.19.0 or later. Complete the [pub/sub prerequisites]({{% ref js-pubsub %}}) before following this guide.

## Configure a publisher

The examples use this HTTP client, component `pubsub`, and topic `orders`:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});
```

For gRPC, select `CommunicationProtocolEnum.GRPC` and port `"50001"`. Run statements containing `await` in an async function or an ES module. Reuse the client and stop it during application shutdown; see [configuration and usage]({{% ref js-pubsub-usage.md %}}).

## Single messages and metadata

```javascript
const response = await client.pubsub.publish(
  "pubsub",
  "orders",
  { orderId: "101", total: 49.99 },
  {
    contentType: "application/json",
    metadata: { ttlInSeconds: "60" },
  },
);

if (response.error) {
  throw response.error;
}
```

Without a custom serializer or explicit `contentType`, the SDK infers `application/json` for objects and arrays, `text/plain` for strings, and `application/cloudevents+json` for recognized CloudEvents.

`metadata` carries Dapr publish options and component-specific settings, such as message TTL or partition keys. It is not a general-purpose mechanism for adding CloudEvent attributes or arbitrary subscriber headers. Supported keys depend on the component.

## Publish CloudEvents

Dapr normally wraps published data in a CloudEvent. To supply your own event attributes, publish a CloudEvent explicitly:

```javascript
const response = await client.pubsub.publish("pubsub", "orders", {
  specversion: "1.0",
  id: "order-101-created",
  source: "/checkout",
  type: "com.example.order.created",
  datacontenttype: "application/json",
  data: { orderId: "101", total: 49.99 },
});

if (response.error) {
  throw response.error;
}
```

See [CloudEvents]({{% ref pubsub-cloudevents.md %}}) for envelope attributes and extensions.

## Raw payloads

To publish without a CloudEvent envelope:

```javascript
const response = await client.pubsub.publish("pubsub", "orders-raw", "order-101", {
  contentType: "text/plain",
  metadata: { rawPayload: "true" },
});

if (response.error) {
  throw response.error;
}
```

Configure the receiving subscription with `metadata: { rawPayload: true }` for [server subscriptions]({{% ref js-pubsub-subscribe-howto.md %}}), or `metadata: { rawPayload: "true" }` for [streaming subscriptions]({{% ref js-pubsub-streaming-howto.md %}}). Server subscription metadata values are JSON-stringified before discovery; streaming metadata is sent directly as a string map. This distinction matters for boolean options such as `rawPayload`.

Raw payloads do not provide the same CloudEvent attributes as enveloped events. See [raw payloads]({{% ref pubsub-raw.md %}}).

## Bulk publishing

`publishBulk(pubSubName, topic, messages, metadata?)` accepts strings, objects, or explicit entries with `event`, optional `entryID`, and optional `contentType`. Missing entry IDs are generated as UUIDs:

```javascript
const response = await client.pubsub.publishBulk(
  "pubsub",
  "orders",
  [
    { entryID: "order-101", event: { orderId: "101" }, contentType: "application/json" },
    { entryID: "order-102", event: { orderId: "102" }, contentType: "application/json" },
  ],
  { ttlInSeconds: "60" },
);

for (const failure of response.failedMessages) {
  console.error("Publish failed:", failure.message.entryID, failure.error);
}

if (response.failedMessages.length > 0) {
  throw new Error(`Failed to publish ${response.failedMessages.length} orders`);
}
```

Bulk publishing is not transactional. A resolved promise can contain failures; always inspect `failedMessages`. Each failure contains the original normalized `message` and an `error`. Request-level failures are generally represented as failures for every entry, while argument processing, serialization, or client initialization can still reject.

Bulk publishing uses the stable API on Dapr 1.17 or later, with automatic fallback to the deprecated alpha1 API on older runtimes. HTTP selects the API using sidecar metadata; gRPC falls back when the stable RPC is unsupported.

Use the fourth argument for request metadata on either transport. Although the explicit entry type exposes `metadata`, this SDK version does not forward per-entry metadata in the gRPC bulk request. Also, without a custom serializer, the gRPC bulk path infers content types from each event rather than honoring explicit entry content types. Avoid relying on those fields for cross-protocol behavior.

See [bulk publish and subscribe]({{% ref pubsub-bulk.md %}}).

## Publish error handling

Single-message publishing has different failure behavior by transport in this version:

| Operation | Failure behavior |
| --- | --- |
| HTTP `publish()` | Normally resolves with `{ error }` for request failures. |
| gRPC `publish()` | Rejects with an object containing `error` for RPC failures. |
| `publishBulk()` | Normally resolves with `failedMessages`; preprocessing/setup failures can reject. |

Await calls inside your application's error boundary **and** inspect their response fields. Do not assume that resolution means publication succeeded, or that every rejection is an `Error` instance. Publisher success means Dapr accepted the publish request, not that all subscribers processed the event.
