---
type: docs
title: "Configuration client usage"
linkTitle: "Client usage"
weight: 54100
description: Guidance for configuration reads, metadata, subscriptions, client lifetime, and error handling in JavaScript
---

Configuration is available through `DaprClient.configuration`. This guide targets `@dapr/dapr` 3.19.0 or later and describes the implementation details and limitations to account for when using this release.

## Client lifetime and configuration

Reuse a long-lived `DaprClient` for configuration operations rather than creating one for each read or subscription. Configuration requires gRPC; the SDK's default protocol is HTTP and is not supported for these methods.

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: process.env.DAPR_GRPC_PORT ?? "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});
```

Port values are strings. When you omit explicit host and port options, the SDK can resolve the sidecar address from `DAPR_GRPC_ENDPOINT`. Otherwise, it falls back to the configured host and port, with defaults of `127.0.0.1` and `DAPR_GRPC_PORT` (or `50001`). Explicit host and port options take precedence over endpoint settings.

The API token defaults to `DAPR_API_TOKEN`; you can also supply `daprApiToken` in the client options. Request metadata described below is passed to the configuration component and is not a substitute for sidecar authentication.

Stop all subscriptions before calling `await client.stop()` at application shutdown. Do not rely on client shutdown to explicitly unsubscribe each handle.

## Choose an operation

All methods take the configuration component's name, not its type or YAML file name.

| Method | Purpose | Result |
|--------|---------|--------|
| `get(storeName, keys?, metadata?)` | Read selected keys, or request all keys when keys are omitted or empty | Promise resolving to `{ items }` |
| `subscribe(storeName, callback)` | Watch the store with an empty key list | Promise resolving to a subscription handle |
| `subscribeWithKeys(storeName, keys, callback)` | Watch selected keys | Promise resolving to a subscription handle |
| `subscribeWithMetadata(storeName, keys, metadata, callback)` | Watch keys with store-specific request metadata | Promise resolving to a subscription handle |

The gRPC implementation removes empty strings (`""`) from key arrays. If the resulting array is empty, it sends an all-key request; it does not mean "read or watch nothing." Use explicit nonempty keys when you need a bounded selection. Support for all-key requests is component-specific.

There are no configuration write or delete methods and no public `client.configuration.unsubscribe(...)` method. Update the backing store directly and use the returned handle's `stop()` to stop a subscription.

## Understand response shapes

Both `get` and subscription callbacks expose an `items` object indexed by configuration key:

```json
{
  "items": {
    "orderId1": {
      "key": "orderId1",
      "value": "101",
      "version": "1",
      "metadata": {}
    }
  }
}
```

Each item's `key` repeats its map key. `value` and `version` are strings; versions are store-specific and may be empty. `metadata` contains the response metadata supplied by the component.

The SDK does not deserialize values into numbers, booleans, or application objects. Parse and validate them in application code. For example, a JSON setting requires `JSON.parse(item.value)`, with appropriate error handling.

Handle missing keys explicitly. A successful response can have an empty `items` object; do not assume a missing key causes the read to reject.

Subscription callbacks receive the items in each update, not a guaranteed full-store snapshot. Empty-item stream messages are skipped. The SDK keeps the runtime subscription ID internally and does not expose it in the handle or callback response.

## Pass request metadata

`get` accepts metadata as its third argument. `subscribeWithMetadata` accepts metadata before the callback. Use the component's documented metadata keys and string values, without an HTTP `metadata.` prefix.

For example, after configuring an [Azure App Configuration component]({{% ref azure-appconfig-configuration-store.md %}}) named `appconfig`, select a label:

```javascript
const config = await client.configuration.get(
  "appconfig",
  ["application:theme"],
  { label: "production" },
);
console.log(config.items);

const subscription = await client.configuration.subscribeWithMetadata(
  "appconfig",
  ["application:theme"],
  { label: "production" },
  async (changes) => {
    console.log("Updated settings:", changes.items);
  },
);

// Later, during shutdown:
await subscription.stop();
```

This snippet assumes an existing gRPC `client`. Pass `[]` as the keys argument to request an all-key subscription with metadata, subject to component support.

Metadata is passed through to the store. It is not automatically copied into each returned item's metadata. Supported fields, filtering, polling intervals, and change-notification behavior depend on the component; Redis, for example, does not implement the Azure `label` selector.

## Subscription lifetime and callbacks

Each subscribe call starts an independent background stream and returns a handle with `stop()`. Multiple subscriptions can share one client, including subscriptions for the same keys. Retain and stop each handle separately.

Provide an `async` callback, or a function returning `Promise<void>`. The SDK awaits each callback before consuming the next message on that subscription. Keep callbacks short; a slow callback delays subsequent updates. Handle processing failures explicitly inside the callback and report them through your application's logging or monitoring.

Do not assume that subscribing immediately provides current values. Initial-value delivery depends on the runtime and component, and the SDK does not perform an initial `get` for you. Read required values with `get` and reconcile subsequent updates according to your application's consistency needs. Separate reads and subscriptions are not an atomic snapshot-and-watch operation.

Awaiting a subscribe method only returns the local handle; it does not wait for a server acknowledgment or first update. There is no readiness promise, completion promise, or error callback on the handle.

### Stop a subscription

Use the handle returned by the subscribe method:

```javascript
await subscription.stop();
```

In the reviewed versions, `stop()` aborts the local stream and, if a runtime subscription ID has arrived, attempts an explicit unsubscribe request. The implementation is asynchronous even though the published `SubscribeConfigurationStream` type declares `stop: () => void`; using `await` waits for that implementation's cleanup.

Cleanup is best-effort: unsubscribe failures are suppressed, and stopping before an ID arrives cannot issue an ID-based unsubscribe. A resolved `stop()` is not confirmation of server-side removal. Stopping also does not wait for an already-running callback to finish or cancel application work started by that callback.

The configuration methods do not accept an `AbortSignal` or a per-call timeout option. Use `stop()` to cancel a subscription; do not pass binary-store-style cancellation options to configuration methods.

## Error handling and recovery

Await reads and subscription creation at your application's error boundary. A failed `get` rejects, for example when the component is missing, the store cannot be reached, or the sidecar returns an error. gRPC runtime errors use the Connect transport's error codes rather than HTTP status codes. Calling configuration methods on an HTTP client rejects with `HTTPNotSupportedError`.

{{% alert title="Subscription error limitations" color="warning" %}}
In `3.19.0`, unexpected errors while consuming the background subscription stream are caught without being logged or propagated. This includes a callback rejection, which exits the consumption loop. A `try/catch` around `await subscribe...` cannot observe those later failures. The implementation does not automatically reconnect or resubscribe when the stream ends.
{{% /alert %}}

Report callback errors within the callback itself. For applications that require fresh settings, add independent freshness checks or periodic reads and an application-level recovery policy; do not treat possession of a subscription handle, or a lack of updates, as proof that the watch is healthy. If you recreate subscriptions, stop the previous handles and reconcile current values.

See the [configuration how-to guide]({{% ref js-configuration-howto.md %}}) for a complete read-and-watch example and the [Configuration API reference]({{% ref configuration_api.md %}}) for runtime semantics.
