---
type: docs
title: "JavaScript Server SDK"
linkTitle: "Server"
weight: 2000
description: JavaScript Server SDK for developing Dapr applications
---

## Introduction

The Dapr Server will allow you to receive communication from the Dapr Sidecar and get access to its server facing features such as: Subscribing to Events, Receiving Input Bindings, and much more.

## Pre-requisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Latest LTS version of Node or greater](https://nodejs.org/en/)

## Installing and importing Dapr's JS SDK

1. Install the SDK with `npm`:

```bash
npm i @dapr/dapr --save
```

2. Import the libraries:

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server

// HTTP Example
const server = new DaprServer({
  serverHost,
  serverPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP, // DaprClient to use same communication protocol as DaprServer, in case DaprClient protocol not mentioned explicitly
  clientOptions: {
    daprHost,
    daprPort,
  },
});

// GRPC Example
const server = new DaprServer({
  serverHost,
  serverPort,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  clientOptions: {
    daprHost,
    daprPort,
  },
});
```

## Running

To run the examples, you can use two different protocols to interact with the Dapr sidecar: HTTP (default) or gRPC.

### Using HTTP (built-in express webserver)

```typescript
import { DaprServer } from "@dapr/dapr";

const server = new DaprServer({
  serverHost: appHost,
  serverPort: appPort,
  clientOptions: {
    daprHost,
    daprPort,
  },
});
// initialize subscribtions, ... before server start
// the dapr sidecar relies on these
await server.start();
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-port 50051 --app-protocol http -- npm run start

# or, using npm script
npm run start:dapr-http
```

> ℹ️ **Note:** The `app-port` is required here, as this is where our server will need to bind to. Dapr will check for the application to bind to this port, before finishing start-up.

### Using HTTP (bring your own express webserver)

Instead of using the built-in web server for Dapr sidecar to application communication, you can also bring your own instance. This is helpful in scenarios like when you are building a REST API back-end and want to integrate Dapr directly in it.

Note, this is currently available for [`express`](https://www.npmjs.com/package/express) only.

> 💡 Note: when using a custom web-server, the SDK will configure server properties like max body size, and add new routes to it. The routes are unique on their own to avoid any collisions with your application, but it's not guaranteed to not collide.

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";
import express from "express";

const myApp = express();

myApp.get("/my-custom-endpoint", (req, res) => {
  res.send({ msg: "My own express app!" });
});

const daprServer = new DaprServer({
      serverHost: "127.0.0.1", // App Host
      serverPort: "50002", // App Port
      serverHttp: myApp,
      clientOptions: {
        daprHost
        daprPort
      }
    });

// Initialize subscriptions before the server starts, the Dapr sidecar uses it.
// This will also initialize the app server itself (removing the need for `app.listen` to be called).
await daprServer.start();
```

After configuring the above, you can call your custom endpoint as you normally would:

```typescript
const res = await fetch(`http://127.0.0.1:50002/my-custom-endpoint`);
const json = await res.json();
```

### Using gRPC

Since HTTP is the default, you will have to adapt the communication protocol to use gRPC. You can do this by passing an extra argument to the client or server constructor.

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";

const server = new DaprServer({
  serverHost: appHost,
  serverPort: appPort,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  clientOptions: {
    daprHost,
    daprPort,
  },
});
// initialize subscribtions, ... before server start
// the dapr sidecar relies on these
await server.start();
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-port 50051 --app-protocol grpc -- npm run start

# or, using npm script
npm run start:dapr-grpc
```

> ℹ️ **Note:** The `app-port` is required here, as this is where our server will need to bind to. Dapr will check for the application to bind to this port, before finishing start-up.

## Building blocks

The JavaScript Server SDK allows you to interface with all of the [Dapr building blocks]({{% ref building-blocks %}}) focusing on Sidecar to App features.

### Invocation API

For JavaScript SDK **3.19.0-rc.4 or later**, see the [service invocation overview]({{% ref js-service-invocation %}}) for HTTP and gRPC capabilities.

#### Listen to an Invocation

```typescript
import { DaprServer, HttpMethod } from "@dapr/dapr";
import type { DaprInvokerCallbackContent } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const callbackFunction = async (data: DaprInvokerCallbackContent) => {
    console.log("Received body: ", data.body);
    console.log("Received metadata: ", data.metadata);
    console.log("Received query: ", data.query);
    console.log("Received headers: ", data.headers); // only available in HTTP
    return { received: true };
  };

  await server.invoker.listen("hello-world", callbackFunction, { method: HttpMethod.GET });

  // You can now invoke the service with your app id and method "hello-world"

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Follow [receiving invocations]({{% ref js-service-invocation-server.md %}}) for matching startup commands, callback field shapes, response behavior, and existing Express applications. See [configuration and usage]({{% ref js-service-invocation-usage.md %}}) for custom serialization and failure handling.

### PubSub API

For JavaScript SDK **3.19.0-rc.4 or later**, see the [publish and subscribe overview]({{% ref js-pubsub %}}) to choose a delivery mode. Client-initiated [streaming subscriptions]({{% ref js-pubsub-streaming-howto.md %}}) do not require a `DaprServer`.

#### Subscribe to messages

Register each component/topic pair once before `server.start()`. This example uses an HTTP listener on port `50002`:

```typescript
import { DaprPubSubStatusEnum, DaprServer } from "@dapr/dapr";

async function start() {
  const server = new DaprServer({
    serverHost: "127.0.0.1",
    serverPort: "50002",
    clientOptions: { daprHost: "127.0.0.1", daprPort: "3500" },
  });

  await server.pubsub.subscribe("pubsub", "orders", async (data) => {
    console.log("Order received:", data);
    return DaprPubSubStatusEnum.SUCCESS;
  });

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Follow the [server subscription guide]({{% ref js-pubsub-subscribe-howto.md %}}) for the matching `dapr run` command, gRPC configuration, registration methods, and callback data and headers. See [configuration and usage]({{% ref js-pubsub-usage.md %}}) for serialization and shutdown.

#### Subscribe with SUCCESS/RETRY/DROP status

Return `DaprPubSubStatusEnum` values rather than response objects. See [acknowledgements and retries]({{% ref "js-pubsub-subscribe-howto.md#acknowledge-retry-or-drop" %}}) for status precedence, thrown errors, and an inbound resiliency policy.

#### Subscribe to messages rule based

Use `subscribeWithOptions()` to declare routes and `subscribeToRoute()` to attach handlers. See the [content-based routing example]({{% ref "js-pubsub-subscribe-howto.md#content-based-routing" %}}).

#### Subscribe with Wildcards

See [wildcard topics]({{% ref "js-pubsub-subscribe-howto.md#wildcard-topics" %}}) for MQTT-style `#` and `+` examples and component requirements.

#### Bulk Subscribe to messages

`subscribeBulk()` delivers one entry at a time to your callback and builds per-entry acknowledgements. See [bulk subscriptions]({{% ref "js-pubsub-subscribe-howto.md#bulk-subscriptions" %}}) for batching options and HTTP payload limitations.

#### Dead Letter Topics

Set `deadLetterTopic` on the source subscription and register a separate consumer for failed messages. See [dead-letter topics]({{% ref "js-pubsub-subscribe-howto.md#dead-letter-topics" %}}) for the complete example and the limitations of `deadLetterCallback`.

### Bindings API

#### Receive an Input Binding

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const bindingName = "my-binding-name";

  const response = await server.binding.receive(bindingName, async (data: any) =>
    console.log(`Got Data: ${JSON.stringify(data)}`),
  );

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> For a full guide on output bindings visit [How-To: Use bindings]({{% ref howto-bindings.md %}}).

### Configuration API

> 💡 The configuration API is currently only available through gRPC

#### Getting a configuration value

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });
  const config = await client.configuration.get("config-redis", ["myconfigkey1", "myconfigkey2"]);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

#### Subscribing to Key Changes

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });
  const stream = await client.configuration.subscribeWithKeys("config-redis", ["myconfigkey1", "myconfigkey2"], () => {
    // Received a key update
  });

  // When you are ready to stop listening, call the following
  await stream.close();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Related links

- [JavaScript SDK examples](https://github.com/dapr/js-sdk/tree/main/examples)
