---
type: docs
title: "How to: Manage configuration with the Dapr JavaScript SDK"
linkTitle: "How to: Manage configuration"
weight: 54050
description: Retrieve application settings and subscribe to configuration changes using the Dapr JavaScript SDK
---

Use `DaprClient.configuration` to read application settings and react to changes without calling the configuration store directly. This guide uses Redis for local development.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) and an initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, version 3.19.0 or later
- Docker, for the Redis example below

In your application directory, initialize an npm project if needed and install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

The examples use JavaScript ES modules saved as `.mjs` files and do not require a TypeScript compiler. The same APIs are available in TypeScript.

## Configure a store

Start a dedicated local Redis instance on port 6380 to avoid conflicting with Redis started by `dapr init`:

```sh
docker run --name js-config-redis -p 127.0.0.1:6380:6379 -d redis:7
```

The Redis configuration component enables the keyspace notifications it needs when a subscription starts, so no extra Redis flags are required. This example has no authentication and binds Redis to loopback for local development only. For production, configure authentication and TLS as described in the [Redis configuration store reference]({{% ref redis-configuration-store.md %}}).

Create a `components` directory in your application directory and save the following as `components\configstore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.redis
  version: v1
  metadata:
    - name: redisHost
      value: "localhost:6380"
    - name: redisPassword
      value: ""
```

The component's `metadata.name`, `configstore`, is the store name supplied to each SDK method. A Redis state store component is not a configuration store; the component type must be `configuration.redis`.

Populate the store:

```sh
docker exec js-config-redis redis-cli MSET orderId1 "101||1" orderId2 "102||1"
```

This example uses Redis configuration values in `value||version` format. The SDK returns the value and version as separate strings.

## Retrieve configuration items

Save the following as `get-configuration.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: process.env.DAPR_GRPC_PORT ?? "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});

try {
  const config = await client.configuration.get(
    "configstore",
    ["orderId1", "orderId2"],
  );

  for (const [key, item] of Object.entries(config.items)) {
    console.log(`${key}: ${item.value} (version ${item.version})`);
  }

  const order = config.items["orderId1"];
  if (order === undefined) {
    throw new Error("Required configuration key orderId1 was not returned");
  }
} finally {
  await client.stop();
}
```

Run it with a Dapr sidecar:

```sh
dapr run --app-id js-config-reader --dapr-grpc-port 50001 --resources-path .\components -- node get-configuration.mjs
```

For the seeded values, the application prints:

```text
orderId1: 101 (version 1)
orderId2: 102 (version 1)
```

To request all items instead, omit the keys argument or pass an empty array:

```javascript
const config = await client.configuration.get("configstore");
```

An empty key list is sent to the component. Whether it can return all keys, and which keys are included, depends on the store. Check required keys explicitly rather than assuming every requested key is present.

## Subscribe to configuration changes

Save the following as `watch-configuration.mjs`:

```javascript
import { setTimeout } from "node:timers/promises";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: process.env.DAPR_GRPC_PORT ?? "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});

let subscription;

try {
  subscription = await client.configuration.subscribeWithKeys(
    "configstore",
    ["orderId1", "orderId2"],
    async (changes) => {
      for (const [key, item] of Object.entries(changes.items)) {
        console.log(`${key}: ${item.value} (version ${item.version})`);
      }
    },
  );

  console.log("Subscription requested; watching for 60 seconds");
  await setTimeout(60_000);
} finally {
  try {
    if (subscription) {
      await subscription.stop();
    }
  } finally {
    await client.stop();
  }
}
```

Run the subscriber after the reader has exited:

```sh
dapr run --app-id js-config-watcher --dapr-grpc-port 50001 --resources-path .\components -- node watch-configuration.mjs
```

In a separate terminal, change a watched key while the subscriber is running:

```sh
docker exec js-config-redis redis-cli SET orderId1 "103||2"
```

Once the subscription is established, the callback prints `orderId1: 103 (version 2)`. The subscribe promise returns a local handle, not a server-readiness acknowledgment. If you update the store immediately after starting the application, the subscription might not yet be active.

To watch the whole store, replace the `subscribeWithKeys` call with:

```javascript
subscription = await client.configuration.subscribe(
  "configstore",
  async (changes) => {
    console.log("Configuration changes:", changes.items);
  },
);
```

All-key subscription behavior, including whether keys added later are watched, depends on the component. Each subscription has its own handle; stop every subscription during shutdown. No `DaprServer`, application callback route, or `--app-port` is required: updates arrive on the client's gRPC stream.

## Next steps

Read the [client usage guidance]({{% ref js-configuration-client-usage.md %}}) for request metadata, response handling, and important subscription failure and cleanup limitations.
