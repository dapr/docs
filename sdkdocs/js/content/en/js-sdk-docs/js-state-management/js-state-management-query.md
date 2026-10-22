---
type: docs
title: "How to: Query state with the Dapr JavaScript SDK"
linkTitle: "How to: Query state"
weight: 53150
description: Filter, sort, and paginate state with the JavaScript SDK's alpha state query API
---

Use `client.state.query` to query JSON documents in a state store that supports the [state query API]({{% ref howto-state-query-api.md %}}). Both HTTP and gRPC are implemented in 3.19.0. This is the **alpha** state query API, not a general-purpose SQL or native database query interface.

## Prerequisites

Follow the [state management how-to]({{% ref js-state-management-howto.md %}}) to install the SDK and run an application with a sidecar. For this guide, configure a query-capable component named `state-mongodb`, following the [MongoDB state store reference]({{% ref setup-mongodb.md %}}). The basic Redis component in the how-to does not by itself configure query support.

Use a JSON-compatible stored document representation. Some components require additional query configuration or metadata; check the component reference.

## Configure the client

Use the following client configuration inside an ES module, and wrap application operations in an error boundary with `await client.stop()` in `finally`, as shown in the state management how-to:

```javascript
import { CommunicationProtocolEnum, DaprClient, JsonSerializer } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  serializer: new JsonSerializer(),
});
```

For gRPC, change the protocol to `CommunicationProtocolEnum.GRPC` and the port to `"50001"`. The explicit serializer deserializes query result values on either protocol. Without a serializer, gRPC query results contain raw `Uint8Array` data rather than parsed documents.

## Save queryable documents

Supply `contentType` metadata when the store requires it to retain JSON documents:

```javascript
const saved = await client.state.save(
  "state-mongodb",
  [
    {
      key: "widget-a",
      value: { size: "small", color: "blue", warehouse: { region: "west" } },
    },
    {
      key: "widget-b",
      value: { size: "large", color: "blue", warehouse: { region: "east" } },
    },
  ],
  { metadata: { contentType: "application/json" } },
);
if (saved.error) {
  throw saved.error;
}
```

## Filter and sort

The SDK accepts an object with `filter`, `sort`, and `page` fields. The TypeScript `StateQueryType` requires all three. The following query finds blue widgets in either region and sorts by size:

```javascript
const query = {
  filter: {
    AND: [
      { EQ: { color: "blue" } },
      { IN: { "warehouse.region": ["west", "east"] } },
    ],
  },
  sort: [{ key: "size", order: "ASC" }],
  page: { limit: 10 },
};

const response = await client.state.query("state-mongodb", query);
for (const item of response.results) {
  if (item.error) {
    throw new Error(`Unable to read query result ${item.key}: ${item.error}`);
  }
  console.log(item.key, item.data, item.etag);
}
```

Use field paths into the **stored document**. The SDK does not translate filter paths through a custom serializer. For example, a serializer that wraps each value in a `payload` property requires filter paths matching that representation.

The SDK's declared filter surface includes `EQ`, `IN`, `AND`, and `OR`. Sort entries accept `ASC` or `DESC`, with ascending order as the runtime default when omitted. The runtime query API documents additional operators, but do not assume they are represented in this SDK version's top-level filter type.

For an unfiltered, unsorted page, use `filter: {}`, `sort: []`, and `page: { limit: 10 }`. A SQL string or an object containing `language` and `query` is not the `StateQueryType` accepted by this API.

In TypeScript, preserve literal sort orders when extracting a query into a variable, for example with `order: "ASC" as const`, or pass the query object directly to `client.state.query`.

## Retrieve another page

The response contains `results` and an optional `token`. Treat the token as opaque and pass it back in `page.token`, retaining the original filter, sort, and page size:

```javascript
if (response.token) {
  const nextPage = await client.state.query("state-mongodb", {
    ...query,
    page: { ...query.page, token: response.token },
  });

  for (const item of nextPage.results) {
    if (item.error) {
      throw new Error(`Unable to read query result ${item.key}: ${item.error}`);
    }
    console.log(item.key, item.data);
  }
}
```

Continue until no continuation token is returned. There is no automatic paginator; an empty `results` array should not replace the token check.

## Response and protocol considerations

Each query result has `key`, `data`, and optional `etag` and `error`. Check item errors as well as catching promise rejections.

With a configured serializer, the SDK deserializes successful, non-empty result values. Without one, HTTP returns the runtime's JSON result data, while gRPC returns bytes. For known JSON data on gRPC without a serializer, explicitly decode a successful item's data with `JSON.parse(Buffer.from(item.data).toString("utf8"))`; do not apply that conversion to HTTP results that are already objects.

The declared response exposes `results` and `token`, not a portable response metadata map. `query` has no separate request metadata parameter. Store support, indexes, filter behavior, and pagination semantics remain component-dependent.

See [state client usage]({{% ref js-state-management-client-usage.md %}}) for configuration, serialization compatibility, and error handling.
