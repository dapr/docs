---
type: docs
title: "How to: Manage state with the Dapr JavaScript SDK"
linkTitle: "How to: Manage state"
weight: 53050
description: Learn how to save, retrieve, and delete state, use ETags, and execute bulk operations and transactions
---

Use `DaprClient.state` to manage key/value application state without depending on a particular database client. This guide uses Redis and covers basic operations, optimistic concurrency, bulk operations, TTL, and transactions.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, **version 3.19.0-rc.4 or later**
- A Redis instance, such as the local Redis container created by `dapr init`

In your application directory, initialize an npm project if needed and install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0-rc.4
```

The examples use JavaScript ES modules in an `.mjs` file. The same APIs are available in TypeScript.

## Configure a state store

Create a `components` directory and save this component as `components\statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: "localhost:6379"
    - name: redisPassword
      value: ""
```

Adjust the connection settings for your Redis instance. See the [Redis component reference]({{% ref setup-redis.md %}}) for authentication and production configuration.

The component's `metadata.name`, `statestore`, is the store name used in client calls. It is not the component type or the file name. Keep the same Dapr application ID between runs to read previously saved state; Dapr prefixes keys with the application ID by default.

## Save, retrieve, and delete state

Save the following as `app.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprClient, JsonSerializer } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  serializer: new JsonSerializer(),
});
const storeName = "statestore";

try {
  const saved = await client.state.save(storeName, [
    { key: "widget-a", value: { size: "small", color: "blue" } },
    { key: "widget-b", value: { size: "large", color: "white" } },
  ]);
  if (saved.error) {
    throw saved.error;
  }

  const widget = await client.state.get(storeName, "widget-a");
  console.log("Loaded widget:", widget);

  const deleted = await client.state.delete(storeName, "widget-b");
  if (deleted.error) {
    throw deleted.error;
  }
} catch (error) {
  console.error("State operation failed:", error);
  process.exitCode = 1;
} finally {
  await client.stop();
}
```

Start the application with a Dapr sidecar:

```sh
dapr run --app-id state-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```

To use gRPC, change `communicationProtocol` to `CommunicationProtocolEnum.GRPC` and `daprPort` to `"50001"`. The explicit `JsonSerializer` makes value serialization consistent across the examples, including object-valued transactions and query results. It is optional, but opting in can change how existing values are interpreted. Read the [serialization guidance]({{% ref "js-state-management-client-usage.md#serialization" %}}) before changing an existing application's configuration.

The remaining examples reuse `client` and `storeName`. Place them inside the `try` block before the client is stopped. They assume the initial save has completed.

## Read multiple entries

`save` already accepts an array for bulk writes. Use `getBulk` to read multiple keys:

```javascript
const items = await client.state.getBulk(
  storeName,
  ["widget-a", "widget-b"],
  { parallelism: 4 },
);

for (const item of items) {
  if (item.error) {
    throw new Error(`Unable to read ${item.key}: ${item.error}`);
  }
  console.log(item.key, item.data, item.etag);
}
```

Each result is an item with `key`, `data`, and an optional `etag`, not just the saved value. Match results by `key` rather than relying on array order. In this example, `widget-b` has already been deleted; missing values differ between protocols. See [response shapes]({{% ref "js-state-management-client-usage.md#response-shapes" %}}) for details.

## Optimistic concurrency with ETags

`get` returns only the value, not the response ETag. To read a value and its ETag, use `getBulk` with one key. Pass the returned ETag to a subsequent save or delete to detect concurrent changes.

```javascript
import { StateConcurrencyEnum, StateConsistencyEnum } from "@dapr/dapr";
```

Keep this import at module scope. Inside the `try` block:

```javascript
const itemsWithEtags = await client.state.getBulk(storeName, ["widget-a"]);
const current = itemsWithEtags.find((item) => item.key === "widget-a");
if (!current || current.error || !current.etag) {
  throw new Error("Could not read widget-a with an ETag");
}

const updated = await client.state.save(storeName, [
  {
    key: "widget-a",
    value: { ...current.data, color: "green" },
    etag: current.etag,
    options: {
      concurrency: StateConcurrencyEnum.CONCURRENCY_FIRST_WRITE,
      consistency: StateConsistencyEnum.CONSISTENCY_STRONG,
    },
  },
]);
if (updated.error) {
  throw updated.error;
}
```

The state store must support ETags. With first-write concurrency, an ETag mismatch indicates that another writer changed the value. Handle the conflict according to your application's rules, for example by reading the latest value and recomputing the update. Do not blindly retry a stale ETag.

For a conditional delete, read a **fresh** ETag after any successful update:

```javascript
const latestItems = await client.state.getBulk(storeName, ["widget-a"]);
const latest = latestItems.find((item) => item.key === "widget-a");
if (!latest || latest.error || !latest.etag) {
  throw new Error("Could not read widget-a with an ETag");
}

const removed = await client.state.delete(storeName, "widget-a", {
  etag: latest.etag,
  concurrency: StateConcurrencyEnum.CONCURRENCY_FIRST_WRITE,
  consistency: StateConsistencyEnum.CONSISTENCY_STRONG,
});
if (removed.error) {
  throw removed.error;
}
```

HTTP write failures can be returned in `result.error`, while gRPC failures reject the promise. The examples check the result and also have an outer error handler so neither path is ignored.

## Delete multiple entries

`deleteBulk` accepts key-only items, with optional ETags, per-item metadata, and state options. It does not require or serialize values:

```javascript
const bulkDeleted = await client.state.deleteBulk(storeName, [
  { key: "widget-a" },
  { key: "widget-b" },
]);
if (bulkDeleted.error) {
  throw bulkDeleted.error;
}
```

An empty array succeeds without contacting the sidecar. Over HTTP, the SDK issues individual deletes and waits for all of them; over gRPC, it sends one bulk-delete RPC. Neither is atomic, and a failure can leave some entries deleted. Use a transaction when all-or-nothing behavior is required.

## Execute a state transaction

Use `transaction` to perform multiple `upsert` and `delete` operations atomically in a store that supports transactions:

```javascript
await client.state.transaction(storeName, [
  {
    operation: "upsert",
    request: {
      key: "widget-a",
      value: { size: "medium", color: "green" },
    },
  },
  {
    operation: "delete",
    request: { key: "widget-b" },
  },
]);
```

This example uses the `JsonSerializer` configured above. Without an explicit serializer, the gRPC transaction implementation expects an already encoded string or bytes rather than serializing object values as `save` does.

The optional third argument is transaction-wide metadata:

```javascript
await client.state.transaction(
  storeName,
  [
    {
      operation: "upsert",
      request: { key: "widget-c", value: { size: "small", color: "red" } },
    },
  ],
  { partitionKey: "widgets" },
);
```

Metadata and transaction constraints depend on the component. For example, a store may require all operations to use the same partition. See the [client usage limitations]({{% ref "js-state-management-client-usage.md#transactions" %}}) before using per-operation metadata or ETags in a transaction.

## Set a time to live

For a store that supports TTL, pass `ttlInSeconds` as metadata. This saves an entry that expires after 60 seconds:

```javascript
const expiring = await client.state.save(
  storeName,
  [{ key: "temporary-widget", value: { color: "blue" } }],
  { metadata: { ttlInSeconds: "60" } },
);
if (expiring.error) {
  throw expiring.error;
}
```

Metadata can also be supplied on individual save items. Shared save metadata overrides matching per-item metadata keys. See [state store TTL]({{% ref state-store-ttl.md %}}) for component support and expiration semantics.

## Next steps

- [State client usage]({{% ref js-state-management-client-usage.md %}}): options, serialization, metadata, response shapes, and errors.
- [Query state]({{% ref js-state-management-query.md %}}): filtering, sorting, and pagination with a query-capable store.
