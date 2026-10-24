---
type: docs
title: "Receive events with JavaScript streaming subscriptions"
linkTitle: "Streaming subscriptions"
weight: 3300
description: "Subscribe without an application server using gRPC streaming, with cancellation, acknowledgements, and failure supervision"
---

Use `DaprClient.pubsub.subscribeStream()` to open a bidirectional gRPC stream from your application to the sidecar with `@dapr/dapr` 3.19.0 or later. It does not require `DaprServer`, an application callback port, or subscription discovery.

Complete the [pub/sub prerequisites]({{% ref js-pubsub %}}) first. Streaming uses `SubscribeTopicEventsAlpha1`, an alpha gRPC API; your Dapr runtime must implement it. HTTP clients reject this operation with `HTTPNotSupportedError`. Streaming subscriptions do not support routing rules or bulk subscription options.

## Run a streaming worker

Save the following as `worker.js` in an ES module application. The worker runs until SIGINT or SIGTERM, or until the stream fails:

```javascript
import { CommunicationProtocolEnum, DaprClient, DaprPubSubStatusEnum } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});

const controller = new AbortController();
const stop = () => controller.abort();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);

try {
  const subscription = await client.pubsub.subscribeStream(
    "pubsub",
    "orders",
    async (data, headers) => {
      console.log("Order received:", data, "CloudEvent:", headers);
      return DaprPubSubStatusEnum.SUCCESS;
    },
    { signal: controller.signal, deadLetterTopic: "orders-deadletter" },
  );

  try {
    await subscription.closed;
  } finally {
    await subscription.close();
  }
} finally {
  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
  await client.stop();
}
```

Run it without `--app-port`:

```sh
dapr run --app-id orders-worker --dapr-grpc-port 50001 --resources-path ./components -- node worker.js
```

The subscription promise resolves only after Dapr confirms setup. Setup failures reject. See [configuration and usage]({{% ref js-pubsub-usage.md %}}) for connection settings, authentication, and custom serialization.

## Callback data and acknowledgements

Callbacks receive deserialized payload `data` and CloudEvent attributes in `headers`. Attributes include `id`, `source`, `type`, `specversion`, `datacontenttype`, `topic`, `pubsubname`, and `path`, together with flattened extensions. Unlike [server callback headers]({{% ref "js-pubsub-subscribe-howto.md#callback-data-and-headers" %}}), these explicitly expose CloudEvent attributes.

Callbacks run sequentially within a stream and use the client's serializer. Return `DaprPubSubStatusEnum.SUCCESS`, `RETRY`, `DROP`, or no value; completing without a value means success. Callback exceptions, deserialization errors, and invalid return values are logged and acknowledged as `RETRY`.

Retry and dead-letter behavior depends on the runtime resiliency policy and component. Make handlers idempotent because a message can be delivered more than once.

## Streaming options and lifecycle

| Member | Behavior |
| --- | --- |
| `options.metadata` | Subscription metadata sent as a string map. |
| `options.deadLetterTopic` | Topic for runtime dead-letter forwarding; consume it separately. |
| `options.signal` | Cancels setup or an active stream. |
| `subscription.close()` | Idempotently cancels the stream; safe to call from its callback. Does not wait for an in-flight callback. |
| `subscription.closed` | Resolves after cancellation and completion of any in-flight callback. Rejects on transport/protocol failure or unexpected stream termination. |

For raw payloads, pass `metadata: { rawPayload: "true" }` in the subscription options. See [publishing raw payloads]({{% ref "js-pubsub-publish-howto.md#raw-payloads" %}}). To consume failed messages, create a separate subscription to `deadLetterTopic`; setting the option does not register a consumer for that topic.

TypeScript applications can import `PubSubStreamingSubscription` and `PubSubStreamingSubscriptionOptions` as types from `@dapr/dapr`.

## Supervise failures and shut down

Observe `closed` throughout the subscription lifetime. The SDK logs stream failures but **does not reconnect automatically**. If reconnecting is appropriate, implement a supervised retry policy that creates a new subscription and respects application shutdown.

`client.stop()` does not close these subscriptions. Explicitly close every subscription and await its `closed` promise before stopping the client. Cancellation during a callback leaves that event unacknowledged, so it may be redelivered. The API does not expose .NET-style queue capacity, per-message timeout, or automatic reconnect options.
