---
type: docs
title: "Receive events with a JavaScript application server"
linkTitle: "Server subscriptions"
weight: 3200
description: "Register HTTP or gRPC subscriptions, handle acknowledgements, route events, and configure bulk and dead-letter delivery"
---

Use `DaprServer.pubsub` to receive events through HTTP or gRPC callbacks with **`@dapr/dapr` 3.19.0-rc.4 or later**. Complete the [pub/sub prerequisites]({{% ref js-pubsub %}}) before following this guide. For workers without an application callback listener, use [streaming subscriptions]({{% ref js-pubsub-streaming-howto.md %}}) instead.

## Register subscriptions before startup

Save the following as `subscriber.js` in an ES module application:

```javascript
import { CommunicationProtocolEnum, DaprPubSubStatusEnum, DaprServer } from "@dapr/dapr";

const server = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: "50002",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  clientOptions: { daprHost: "127.0.0.1", daprPort: "3500" },
});

await server.pubsub.subscribe("pubsub", "orders", async (data, headers) => {
  console.log("Order received:", data, headers);
  return DaprPubSubStatusEnum.SUCCESS;
});

await server.start();
```

Run the subscriber with an application port matching `serverPort`:

```sh
dapr run --app-id orders-subscriber --app-port 50002 --app-protocol http --dapr-http-port 3500 --resources-path ./components -- node subscriber.js
```

For a gRPC server, select `CommunicationProtocolEnum.GRPC`, set the client port to `"50001"`, and run Dapr with `--app-protocol grpc --dapr-grpc-port 50001`.

The remaining examples assume this `server` and enum import. Add their subscription registrations **before** `server.start()`.

HTTP subscriptions are exposed through `/dapr/subscribe`; gRPC subscriptions use `ListTopicSubscriptions`. Configure each component/topic pair once. Repeating `subscribe()` or `subscribeWithOptions()` for an already registered pair throws. Use `subscribeToRoute()` to add another handler to an existing route instead.

| Method | Purpose |
| --- | --- |
| `subscribe(pubSubName, topic, callback, route?, metadata?)` | Register a subscription and a handler. |
| `subscribeWithOptions(pubSubName, topic, options)` | Configure callbacks, metadata, routes, dead-letter topic, and bulk delivery. |
| `subscribeToRoute(pubSubName, topic, route, callback)` | Add a handler to an already registered route; does not create a runtime subscription. |
| `subscribeBulk(pubSubName, topic, callback, options?)` | Register bulk delivery with a callback invoked once per entry. |
| `getSubscriptions()` | Inspect local registrations grouped by component and topic, including routes and Dapr discovery configuration. |

Handlers can be attached to existing routes after startup, but adding a handler does not cause Dapr to rediscover new topics or routes. There is no server-side unsubscribe method in this interface. Stop the application listener with `await server.stop()` during shutdown. See [configuration and usage]({{% ref js-pubsub-usage.md %}}) for client lifetime and serialization.

## Callback data and headers

Callbacks receive `(data, headers)` and should be async. `data` is normally the deserialized event payload, not the full CloudEvent envelope.

| Delivery | Callback `headers` |
| --- | --- |
| HTTP server, single message | Incoming HTTP request headers. |
| HTTP server, bulk | Per-entry metadata. |
| gRPC server, single or bulk | Incoming gRPC request metadata converted to an object. |

Do not assume that server callbacks expose CloudEvent attributes in `headers`. If your application requires these attributes, the [streaming callback]({{% ref "js-pubsub-streaming-howto.md#callback-data-and-acknowledgements" %}}) explicitly provides them.

To consume raw payloads, use `subscribeWithOptions()` with `metadata: { rawPayload: true }`. Server subscription metadata values are JSON-stringified before discovery. See [publishing raw payloads]({{% ref "js-pubsub-publish-howto.md#raw-payloads" %}}) for publisher settings and the different streaming metadata representation.

## Acknowledge, retry, or drop

| Handler outcome | Acknowledgement |
| --- | --- |
| Return `DaprPubSubStatusEnum.SUCCESS`, or complete without a value | Successfully processed. |
| Return `DaprPubSubStatusEnum.RETRY` | Request redelivery. |
| Return `DaprPubSubStatusEnum.DROP` | Discard the message. |
| Throw or reject | Log the error and request redelivery. |

Return the enum value, not an object such as `{ status: "RETRY" }`. When multiple server handlers share a route, all run sequentially and their combined status has priority `RETRY` > `DROP` > `SUCCESS`.

Retries and dead-letter forwarding are controlled by Dapr resiliency policies and the pub/sub component, not by an SDK retry loop. Configure an [inbound retry policy]({{% ref resiliency-overview.md %}}) appropriate to your broker. For example, save the following in `components/resiliency.yaml`, targeting the component name `pubsub`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: pubsub-retries
spec:
  policies:
    retries:
      processing:
        policy: constant
        duration: 500ms
        maxRetries: 10
  targets:
    components:
      pubsub:
        inbound:
          retry: processing
```

Make handlers idempotent: Dapr pub/sub is at-least-once, and a message can be delivered again after processing.

## Content-based routing

Use `subscribeWithOptions()` to declare the routes, then attach handlers with `subscribeToRoute()`. Dapr evaluates the CEL expressions against the CloudEvent:

```javascript
await server.pubsub.subscribeWithOptions("pubsub", "routed-orders", {
  route: {
    default: "standard",
    rules: [{ match: 'event.type == "com.example.order.priority"', path: "priority" }],
  },
});

server.pubsub.subscribeToRoute("pubsub", "routed-orders", "standard", async (data) => {
  console.log("Standard order:", data);
});

server.pubsub.subscribeToRoute("pubsub", "routed-orders", "priority", async (data) => {
  console.log("Priority order:", data);
});
```

Route names are logical identifiers: the SDK generates unique callback paths from the component, topic, and route. A `callback` supplied alongside a route object is attached to all its declared routes, not just its default route.

See [message routing]({{% ref howto-route-messages.md %}}).

## Wildcard topics

Wildcard support depends on the broker and component. For MQTT-style subscriptions, the SDK recognizes `#` for multiple levels and `+` for one level when dispatching gRPC callbacks:

```javascript
await server.pubsub.subscribe("pubsub", "sensors/#", async (data) => {
  console.log("Sensor event:", data);
});

await server.pubsub.subscribe("pubsub", "devices/+/temperature", async (data) => {
  console.log("Temperature:", data);
});
```

Use a component that supports these topic patterns; they are not a general wildcard facility for every pub/sub broker.

## Bulk subscriptions

Bulk delivery batches messages between Dapr and the application. The SDK still invokes your callback for **one entry at a time**, not for an array. It constructs the per-entry acknowledgement response:

```javascript
await server.pubsub.subscribeBulk(
  "pubsub",
  "bulk-orders",
  async (data) => {
    console.log("Order from batch:", data);
    return DaprPubSubStatusEnum.SUCCESS;
  },
  { maxMessagesCount: 100, maxAwaitDurationMs: 40 },
);
```

The options also accept `route` and `metadata`. Omitted batching limits use runtime/component defaults. For routing or dead-letter configuration combined with bulk delivery, use `subscribeWithOptions()` with `bulkSubscribe: { enabled: true, maxMessagesCount: 100, maxAwaitDurationMs: 40 }`.

In this version, the HTTP bulk handler without a custom serializer extracts CloudEvent `data` and decodes `application/octet-stream` entries, but does not populate callback data for direct `application/json` or `text/plain` entries. Prefer the normal Dapr CloudEvent envelope for HTTP bulk delivery, or use a [custom serializer]({{% ref "js-pubsub-usage.md#custom-serialization" %}}) or gRPC when consuming those direct entry formats.

See [bulk publish and subscribe]({{% ref pubsub-bulk.md %}}).

## Dead-letter topics

Set `deadLetterTopic` (case-sensitive) on the source subscription and register a **separate subscription** to consume that topic:

```javascript
await server.pubsub.subscribeWithOptions("pubsub", "validated-orders", {
  deadLetterTopic: "orders-deadletter",
  callback: async (data) => {
    if (!data.orderId) {
      return DaprPubSubStatusEnum.RETRY;
    }
    console.log("Validated order:", data);
    return DaprPubSubStatusEnum.SUCCESS;
  },
});

await server.pubsub.subscribe("pubsub", "orders-deadletter", async (data) => {
  console.error("Order requires investigation:", data);
  return DaprPubSubStatusEnum.SUCCESS;
});
```

Dapr controls forwarding after processing fails and the configured retry policy is exhausted.

Although the SDK exposes `deadLetterCallback`, it only registers an additional local route on the source subscription. It does not create a subscription to the dead-letter topic, and specifying the callback alone does not configure runtime dead-letter forwarding. Do not use it as a substitute for the separate subscription above.

See [dead-letter topics]({{% ref pubsub-deadletter.md %}}).
