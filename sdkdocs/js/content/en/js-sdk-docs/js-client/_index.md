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
import { DaprClient, CommunicationProtocol } from "@dapr/dapr";
const client = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocol.GRPC });
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
import { DaprClient, CommunicationProtocol } from "@dapr/dapr";

// Using HTTP, when DAPR_HTTP_ENDPOINT is set
const client = new DaprClient();

// Using gRPC, when DAPR_GRPC_ENDPOINT is set
const client = new DaprClient({ communicationProtocol: CommunicationProtocol.GRPC });
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
import { DaprClient, CommunicationProtocol } from "@dapr/dapr";

// Allow a body size of 10Mb to be used
// The default is 4Mb
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocol.HTTP,
  maxBodySizeMb: 10,
});
```

### Proxying Requests

By proxying requests, we can utilize the unique capabilities that Dapr brings with its sidecar architecture such as service discovery, logging, etc., enabling us to instantly "upgrade" our gRPC services. This feature of gRPC proxying was demonstrated in [community call 41](https://www.youtube.com/watch?v=B_vkXqptpXY&t=71s).

#### Creating a Proxy

To perform gRPC proxying, simply create a proxy by calling the `client.proxy.create()` method:

```typescript
// As always, create a client to our dapr sidecar
// this client takes care of making sure the sidecar is started, that we can communicate, ...
const clientSidecar = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocol.GRPC });

// Create a Proxy that allows us to use our gRPC code
const clientProxy = await clientSidecar.proxy.create<GreeterClient>(GreeterClient);
```

We can now call the methods as defined in our `GreeterClient` interface (which in this case is from the [Hello World example](https://github.com/grpc/grpc-go/blob/master/examples/helloworld/helloworld/helloworld.proto))

#### Behind the Scenes (Technical Working)

![Architecture](assets/architecture.png)

1. The gRPC service gets started in Dapr. We tell Dapr which port this gRPC server is running on through `--app-port` and give it a unique Dapr app ID with `--app-id <APP_ID_HERE>`
2. We can now call the Dapr Sidecar through a client that will connect to the Sidecar
3. Whilst calling the Dapr Sidecar, we provide a metadata key named `dapr-app-id` with the value of our gRPC server booted in Dapr (e.g. `server` in our example)
4. Dapr will now forward the call to the gRPC server configured

## Building blocks

The JavaScript Client SDK allows you to interface with all of the [Dapr building blocks]({{% ref building-blocks %}}) focusing on Client to Sidecar features.

### Invocation API

#### Invoke a Service

```typescript
import { DaprClient, HttpMethod } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const serviceAppId = "my-app-id";
  const serviceMethod = "say-hello";

  // POST Request
  const response = await client.invoker.invoke(serviceAppId, serviceMethod, HttpMethod.POST, { hello: "world" });

  // POST Request with headers
  const response = await client.invoker.invoke(
    serviceAppId,
    serviceMethod,
    HttpMethod.POST,
    { hello: "world" },
    { headers: { "X-User-ID": "123" } },
  );

  // GET Request
  const response = await client.invoker.invoke(serviceAppId, serviceMethod, HttpMethod.GET);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full guide on service invocation visit [How-To: Invoke a service]({{% ref howto-invoke-discover-services.md %}}).

### State Management API

#### Save, Get and Delete application state

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const serviceStoreName = "my-state-store-name";

  // Save State
  const response = await client.state.save(
    serviceStoreName,
    [
      {
        key: "first-key-name",
        value: "hello",
        metadata: {
          foo: "bar",
        },
      },
      {
        key: "second-key-name",
        value: "world",
      },
    ],
    {
      metadata: {
        ttlInSeconds: "3", // this should override the ttl in the state item
      },
    },
  );

  // Get State
  const response = await client.state.get(serviceStoreName, "first-key-name");

  // Get Bulk State
  const response = await client.state.getBulk(serviceStoreName, ["first-key-name", "second-key-name"]);

  // State Transactions
  await client.state.transaction(serviceStoreName, [
    {
      operation: "upsert",
      request: {
        key: "first-key-name",
        value: "new-data",
      },
    },
    {
      operation: "delete",
      request: {
        key: "second-key-name",
      },
    },
  ]);

  // Delete State
  const response = await client.state.delete(serviceStoreName, "first-key-name");
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full list of state operations visit [How-To: Get & save state]({{% ref howto-get-save-state.md %}}).

#### Query State API

```typescript
import { DaprClient } from "@dapr/dapr";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const res = await client.state.query("state-mongodb", {
    filter: {
      OR: [
        {
          EQ: { "person.org": "Dev Ops" },
        },
        {
          AND: [
            {
              EQ: { "person.org": "Finance" },
            },
            {
              IN: { state: ["CA", "WA"] },
            },
          ],
        },
      ],
    },
    sort: [
      {
        key: "state",
        order: "DESC",
      },
    ],
    page: {
      limit: 10,
    },
  });

  console.log(res);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### PubSub API

#### Publish messages

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";

  // Publish message to topic as text/plain
  // Note, the content type is inferred from the message type unless specified explicitly
  const response = await client.pubsub.publish(pubSubName, topic, "hello, world!");
  // If publish fails, response contains the error
  console.log(response);

  // Publish message to topic as application/json
  await client.pubsub.publish(pubSubName, topic, { hello: "world" });

  // Publish a JSON message as plain text
  const options = { contentType: "text/plain" };
  await client.pubsub.publish(pubSubName, topic, { hello: "world" }, options);

  // Publish message to topic as application/cloudevents+json
  // You can also use the cloudevent SDK to create cloud events https://github.com/cloudevents/sdk-javascript
  const cloudEvent = {
    specversion: "1.0",
    source: "/some/source",
    type: "example",
    id: "1234",
  };
  await client.pubsub.publish(pubSubName, topic, cloudEvent);

  // Publish a cloudevent as raw payload
  const options = { metadata: { rawPayload: true } };
  await client.pubsub.publish(pubSubName, topic, "hello, world!", options);

  // Publish multiple messages to a topic as text/plain
  await client.pubsub.publishBulk(pubSubName, topic, ["message 1", "message 2", "message 3"]);

  // Publish multiple messages to a topic as application/json
  await client.pubsub.publishBulk(pubSubName, topic, [
    { hello: "message 1" },
    { hello: "message 2" },
    { hello: "message 3" },
  ]);

  // Publish multiple messages with explicit bulk publish messages
  const bulkPublishMessages = [
    {
      entryID: "entry-1",
      contentType: "application/json",
      event: { hello: "foo message 1" },
    },
    {
      entryID: "entry-2",
      contentType: "application/cloudevents+json",
      event: { ...cloudEvent, data: "foo message 2", datacontenttype: "text/plain" },
    },
    {
      entryID: "entry-3",
      contentType: "text/plain",
      event: "foo message 3",
    },
  ];
  await client.pubsub.publishBulk(pubSubName, topic, bulkPublishMessages);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

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

  // Retrieve a single secret from secret store
  const response = await client.secret.get(secretStoreName, secretKey);

  // Retrieve all secrets from secret store
  const response = await client.secret.getBulk(secretStoreName);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full guide on secrets visit [How-To: Retrieve secrets]({{% ref howto-secrets.md %}}).

### Configuration API

#### Get Configuration Keys

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort: process.env.DAPR_GRPC_PORT,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  const config = await client.configuration.get("config-store", ["key1", "key2"]);
  console.log(config);
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
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort: process.env.DAPR_GRPC_PORT,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Subscribes to config store changes for keys "key1" and "key2"
  const stream = await client.configuration.subscribeWithKeys("config-store", ["key1", "key2"], async (data) => {
    console.log("Subscribe received updates from config store: ", data);
  });

  // Wait for 60 seconds and unsubscribe.
  await new Promise((resolve) => setTimeout(resolve, 60000));
  stream.stop();
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

### Cryptography API

> Support for the cryptography API is only available on the gRPC client in the JavaScript SDK.

```typescript
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";

import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "50050"; // Dapr Sidecar Port of this example server

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Encrypt and decrypt a message using streams
  await encryptDecryptStream(client);

  // Encrypt and decrypt a message from a buffer
  await encryptDecryptBuffer(client);
}

async function encryptDecryptStream(client: DaprClient) {
  // First, encrypt the message
  console.log("== Encrypting message using streams");
  console.log("Encrypting plaintext.txt to ciphertext.out");

  await pipeline(
    createReadStream("plaintext.txt"),
    await client.crypto.encrypt({
      componentName: "crypto-local",
      keyName: "symmetric256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("ciphertext.out"),
  );

  // Decrypt the message
  console.log("== Decrypting message using streams");
  console.log("Encrypting ciphertext.out to plaintext.out");
  await pipeline(
    createReadStream("ciphertext.out"),
    await client.crypto.decrypt({
      componentName: "crypto-local",
    }),
    createWriteStream("plaintext.out"),
  );
}

async function encryptDecryptBuffer(client: DaprClient) {
  // Read "plaintext.txt" so we have some content
  const plaintext = await readFile("plaintext.txt");

  // First, encrypt the message
  console.log("== Encrypting message using buffers");

  const ciphertext = await client.crypto.encrypt(plaintext, {
    componentName: "crypto-local",
    keyName: "my-rsa-key",
    keyWrapAlgorithm: "RSA",
  });

  await writeFile("test.out", ciphertext);

  // Decrypt the message
  console.log("== Decrypting message using buffers");
  const decrypted = await client.crypto.decrypt(ciphertext, {
    componentName: "crypto-local",
  });

  // The contents should be equal
  if (plaintext.compare(decrypted) !== 0) {
    throw new Error("Decrypted message does not match original message");
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full guide on cryptography visit [How-To: Cryptography]({{% ref howto-cryptography.md %}}).

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
