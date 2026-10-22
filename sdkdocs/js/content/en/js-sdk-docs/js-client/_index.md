---
type: docs
title: "JavaScript Client SDK"
linkTitle: "Client"
weight: 1000
description: JavaScript Client SDK for developing Dapr applications
---

## Introduction

The Dapr Client allows you to communicate with the Dapr Sidecar and get access to its client facing features such as Publishing Events, Invoking Output Bindings, State Management, Secret Management, and much more.

## Pre-requisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Latest LTS version of Node.js or greater](https://nodejs.org/en/)

## Installing and importing Dapr's JS SDK

1. Install the SDK with `npm`:

```bash
npm i @dapr/dapr --save
```

2. Import the libraries:

```typescript
import { DaprClient, DaprServer, HttpMethod, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server

// HTTP Example
const client = new DaprClient({ daprHost, daprPort });

// GRPC Example
const client = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocolEnum.GRPC });
```

## Running

To run the examples, you can use two different protocols to interact with the Dapr sidecar: HTTP (default) or gRPC.

### Using HTTP (default)

```typescript
import { DaprClient } from "@dapr/dapr";
const client = new DaprClient({ daprHost, daprPort });
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-protocol http -- npm run start

# or, using npm script
npm run start:dapr-http
```

### Using gRPC

Since HTTP is the default, you will have to adapt the communication protocol to use gRPC. You can do this by passing an extra argument to the client or server constructor.

```typescript
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";
const client = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocolEnum.GRPC });
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-protocol grpc -- npm run start

# or, using npm script
npm run start:dapr-grpc
```

### Environment Variables

##### Dapr Sidecar Endpoints

You can use the `DAPR_HTTP_ENDPOINT` and `DAPR_GRPC_ENDPOINT` environment variables to set the Dapr
Sidecar's HTTP and gRPC endpoints respectively. When these variables are set, the `daprHost`
and `daprPort` don't have to be set in the options argument of the constructor, the client will parse them automatically
out of the provided endpoints.

```typescript
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

// Using HTTP, when DAPR_HTTP_ENDPOINT is set
const client = new DaprClient();

// Using gRPC, when DAPR_GRPC_ENDPOINT is set
const client = new DaprClient({ communicationProtocol: CommunicationProtocolEnum.GRPC });
```

If the environment variables are set, but `daprHost` and `daprPort` values are passed to the
constructor, the latter will take precedence over the environment variables.

##### Dapr API Token

You can use the `DAPR_API_TOKEN` environment variable to set the Dapr API token. When this variable
is set, the `daprApiToken` doesn't have to be set in the options argument of the constructor,
the client will get it automatically.

## General

### Increasing Body Size

You can increase the body size that is used by the application to communicate with the sidecar by using a`DaprClient`'s option.

```typescript
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

// Allow a body size of 10Mb to be used
// The default is 4Mb
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  maxBodySizeMb: 10,
});
```

### Proxying Requests

In JavaScript SDK **3.19.0-rc.4**, `client.proxy.create()` is unsupported for both HTTP and the gRPC ConnectRPC transport and rejects when called. Use `client.invoker.invoke()` for Dapr service invocation.

For native protobuf services, use your generated gRPC client connected to the Dapr sidecar with `dapr-app-id` metadata. See [native gRPC services and streaming]({{% ref "js-service-invocation-usage.md#native-grpc-services-and-streaming" %}}) and the [runtime gRPC proxying guide]({{% ref howto-invoke-services-grpc.md %}}).

## Building blocks

The JavaScript Client SDK allows you to interface with all of the [Dapr building blocks]({{% ref building-blocks %}}) focusing on Client to Sidecar features.

### Search API

Use `client.search` to manage indexes and index, retrieve, delete, and query JSON documents over HTTP or gRPC. Requires Dapr runtime **1.19 or later** and JavaScript SDK **3.19.0-rc.5 or later**.

See the [Search how-to guide]({{% ref js-search-howto.md %}}) for a complete example, and [Search client usage]({{% ref js-search-client-usage.md %}}) for method signatures, query options, write acknowledgements, cancellation, and errors.

### Jobs API

Use `client.jobs` to schedule, retrieve, and delete jobs with JavaScript SDK **3.19.0-rc.4 or later**. See the [Jobs how-to guide]({{% ref js-jobs-howto.md %}}) and [client usage guidance]({{% ref js-jobs-client-usage.md %}}) for scheduling options, payloads, runtime compatibility, and error handling.

### Invocation API

For JavaScript SDK **3.19.0-rc.4 or later**, see the [service invocation overview]({{% ref js-service-invocation %}}) for HTTP and gRPC capabilities.

#### Invoke a Service

```typescript
import { DaprClient, HttpMethod } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const serviceAppId = "my-app-id";
  const serviceMethod = "say-hello";

  try {
    const response = await client.invoker.invoke(
      serviceAppId,
      serviceMethod,
      HttpMethod.POST,
      { hello: "world" },
      { headers: { "X-User-ID": "123" } },
    );
    console.log(response);
  } finally {
    await client.stop();
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Follow [calling services]({{% ref js-service-invocation-howto.md %}}) for a runnable client and server setup, other verbs, query parameters, namespaces, and non-Dapr endpoints. See [configuration and usage]({{% ref js-service-invocation-usage.md %}}) for serialization and errors. Custom request headers are forwarded by the HTTP invoker, not the gRPC invoker.

### State Management API

Use `client.state` to access configured state stores over HTTP or gRPC. The [state management guides]({{% ref js-state-management %}}) cover JavaScript SDK **3.19.0-rc.4 or later**, including bulk deletion, ETags, state options, TTL, transactions, serialization, and protocol-specific errors.

#### Save, Get and Delete application state

Follow [How to: Manage state]({{% ref js-state-management-howto.md %}}) for a runnable example with component configuration, save/get/delete, bulk reads and deletes, conditional updates, and transactions.

HTTP `save`, `delete`, and `deleteBulk` can return `{ error }` instead of rejecting. Check that field and also handle promise rejections; gRPC RPC failures reject. See [state client usage]({{% ref js-state-management-client-usage.md %}}) for the complete method and response reference.

#### Query State API

The alpha query API supports filtering, sorting, and pagination on query-capable stores over HTTP and gRPC. Follow [How to: Query state]({{% ref js-state-management-query.md %}}) for query expressions, continuation tokens, and result decoding.

### PubSub API

For JavaScript SDK **3.19.0-rc.4 or later**, see the [publish and subscribe overview]({{% ref js-pubsub %}}) to choose a delivery mode.

#### Publish messages

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  try {
    const response = await client.pubsub.publish("pubsub", "orders", { orderId: "101" });
    if (response.error) {
      throw response.error;
    }
  } finally {
    await client.stop();
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

See [publishing events]({{% ref js-pubsub-publish-howto.md %}}) for bulk operations, metadata, CloudEvents, raw payloads, and transport-specific error handling. See [configuration and usage]({{% ref js-pubsub-usage.md %}}) for client lifetime and serialization.

#### Streaming message subscriptions

With a gRPC client, `client.pubsub.subscribeStream()` receives messages without `DaprServer` or an application callback port. Follow the [streaming subscription guide]({{% ref js-pubsub-streaming-howto.md %}}) for a complete worker, runtime requirements, acknowledgements, cancellation, and failure supervision.

### Bindings API

#### Invoke Output Binding

**Output Bindings**

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const bindingName = "my-binding-name";
  const bindingOperation = "create";
  const message = { hello: "world" };

  const response = await client.binding.send(bindingName, bindingOperation, message);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full guide on output bindings visit [How-To: Use bindings]({{% ref howto-bindings.md %}}).

### Secret API

#### Retrieve secrets

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const secretStoreName = "my-secret-store";
  const secretKey = "secret-key";

  // Retrieve a single secret; the result is the secret's key-value data
  const secret = await client.secret.get(secretStoreName, secretKey);

  // Retrieve all accessible secrets, nested by secret name
  const secrets = await client.secret.getBulk(secretStoreName);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

For **JavaScript SDK 3.19.0-rc.4 or later**, follow the [Secrets how-to guide]({{% ref js-secrets-howto.md %}}) for a runnable example, or read the [Secrets client usage guidance]({{% ref js-secrets-client-usage.md %}}) for configuration, TypeScript response validation, and error handling.

In 3.19.0-rc.4, HTTP `get` accepts metadata as a query-string string and preserves all values in a multi-valued secret. gRPC `get` ignores metadata and returns only the first key-value pair. Bulk retrieval preserves nested values with either protocol, but neither exposes bulk metadata.

For the underlying building block, see [How to: Retrieve a secret]({{% ref howto-secrets.md %}}).

### Configuration API

Use `client.configuration` to read application settings and subscribe to changes. The JavaScript SDK requires **gRPC** for every configuration method; the HTTP client is not supported.

The [configuration how-to guide]({{% ref js-configuration-howto.md %}}) provides runnable examples for **`@dapr/dapr` 3.19.0-rc.4 or later**. The [client usage guidance]({{% ref js-configuration-client-usage.md %}}) covers all methods, metadata, response shapes, and subscription error limitations.

#### Get Configuration Keys

```typescript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort: process.env.DAPR_GRPC_PORT ?? "50001",
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  try {
    const config = await client.configuration.get("config-store", ["key1", "key2"]);
    console.log(config);
  } finally {
    await client.stop();
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Sample output:

```log
{
   items: {
     key1: { key: 'key1', value: 'foo', version: '', metadata: {} },
     key2: { key: 'key2', value: 'bar2', version: '', metadata: {} }
   }
}
```

#### Subscribe to Configuration Updates

```typescript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort: process.env.DAPR_GRPC_PORT ?? "50001",
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  try {
    const stream = await client.configuration.subscribeWithKeys("config-store", ["key1", "key2"], async (data) => {
      console.log("Subscribe received updates from config store: ", data);
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    } finally {
      await stream.stop();
    }
  } finally {
    await client.stop();
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Sample output:

```log
Subscribe received updates from config store:  {
  items: { key2: { key: 'key2', value: 'bar', version: '', metadata: {} } }
}
Subscribe received updates from config store:  {
  items: { key1: { key: 'key1', value: 'foobar', version: '', metadata: {} } }
}
```

To watch all keys, use `subscribe(storeName, callback)`. To include store-specific metadata, use `subscribeWithMetadata(storeName, keys, metadata, callback)`. All-key behavior depends on the component. See [subscription lifetime and callbacks]({{% ref "js-configuration-client-usage.md#subscription-lifetime-and-callbacks" %}}) before relying on a subscription for configuration freshness.

### Cryptography API

In **`@dapr/dapr` 3.19.0-rc.4 or later**, `client.crypto` supports encryption and decryption over both HTTP and gRPC. Pass data and options to receive a `Buffer`, or pass only options to receive a Node.js `Duplex` stream.

Prefer gRPC for large payloads and production streaming. Dapr buffers HTTP cryptography output until the request is fully consumed.

```typescript
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

async function start() {
  const client = new DaprClient({
    daprHost: "127.0.0.1",
    daprPort: "50001",
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  try {
    const ciphertext = await client.crypto.encrypt("A message to encrypt", {
      componentName: "crypto-local",
      keyName: "symmetric256",
      keyWrapAlgorithm: "A256KW",
    });
    const plaintext = await client.crypto.decrypt(ciphertext, {
      componentName: "crypto-local",
    });
    console.log("Decrypted bytes:", plaintext.length);
  } finally {
    await client.stop();
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

This example requires a configured `crypto-local` component and a compatible `symmetric256` key. Follow the [JavaScript Cryptography how-to guide]({{% ref js-cryptography-howto.md %}}) for complete setup and file-stream examples. See the [client usage guidance]({{% ref js-cryptography-client-usage.md %}}) for ciphers, key references, errors, and runtime limitations.

### Distributed Lock API

#### Try Lock and Unlock APIs

```typescript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";
import { LockStatus } from "@dapr/dapr/types/lock/UnlockResponse";

const daprHost = "127.0.0.1";
const daprPortDefault = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const storeName = "redislock";
  const resourceId = "resourceId";
  const lockOwner = "owner1";
  let expiryInSeconds = 1000;

  console.log(`Acquiring lock on ${storeName}, ${resourceId} as owner: ${lockOwner}`);
  const lockResponse = await client.lock.lock(storeName, resourceId, lockOwner, expiryInSeconds);
  console.log(lockResponse);

  console.log(`Unlocking on ${storeName}, ${resourceId} as owner: ${lockOwner}`);
  const unlockResponse = await client.lock.unlock(storeName, resourceId, lockOwner);
  console.log("Unlock API response: " + getResponseStatus(unlockResponse.status));
}

function getResponseStatus(status: LockStatus) {
  switch (status) {
    case LockStatus.Success:
      return "Success";
    case LockStatus.LockDoesNotExist:
      return "LockDoesNotExist";
    case LockStatus.LockBelongsToOthers:
      return "LockBelongsToOthers";
    default:
      return "InternalError";
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full guide on distributed locks visit [How-To: Use Distributed Locks]({{% ref howto-use-distributed-lock.md %}}).

### Workflow API

#### Workflow management

```typescript
import { DaprClient } from "@dapr/dapr";

async function start() {
  const client = new DaprClient();

  // Start a new workflow instance
  const instanceId = await client.workflow.start("OrderProcessingWorkflow", {
    Name: "Paperclips",
    TotalCost: 99.95,
    Quantity: 4,
  });
  console.log(`Started workflow instance ${instanceId}`);

  // Get a workflow instance
  const workflow = await client.workflow.get(instanceId);
  console.log(
    `Workflow ${workflow.workflowName}, created at ${workflow.createdAt.toUTCString()}, has status ${
      workflow.runtimeStatus
    }`,
  );
  console.log(`Additional properties: ${JSON.stringify(workflow.properties)}`);

  // Pause a workflow instance
  await client.workflow.pause(instanceId);
  console.log(`Paused workflow instance ${instanceId}`);

  // Resume a workflow instance
  await client.workflow.resume(instanceId);
  console.log(`Resumed workflow instance ${instanceId}`);

  // Terminate a workflow instance
  await client.workflow.terminate(instanceId);
  console.log(`Terminated workflow instance ${instanceId}`);

  // Purge a workflow instance
  await client.workflow.purge(instanceId);
  console.log(`Purged workflow instance ${instanceId}`);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Related links

- [JavaScript SDK examples](https://github.com/dapr/js-sdk/tree/master/examples)
