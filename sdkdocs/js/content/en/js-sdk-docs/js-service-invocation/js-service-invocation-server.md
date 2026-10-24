---
type: docs
title: "How to: Receive service invocations with the JavaScript SDK"
linkTitle: "Receiving invocations"
weight: 20
description: "Register HTTP or gRPC invocation handlers and understand callback requests and responses"
---

Use `DaprServer.invoker.listen(methodName, callback, options?)` to register an invocation handler. These examples use `@dapr/dapr` 3.19.0 or later.

## Start an HTTP service

Save this complete example as `server.mjs`:

```javascript
import { DaprServer, HttpMethod } from "@dapr/dapr";

async function main() {
  const server = new DaprServer({
    serverHost: "127.0.0.1",
    serverPort: "3000",
    clientOptions: {
      daprHost: "127.0.0.1",
      daprPort: "3500",
    },
  });

  await server.invoker.listen(
    "orders",
    async (request) => {
      if (!request.body) {
        throw new Error("An order request body is required");
      }
      const order = JSON.parse(request.body);
      console.log("Received order:", order);
      console.log("Correlation ID:", request.headers?.["x-correlation-id"]);
      return { orderId: order.orderId, status: "accepted" };
    },
    { method: HttpMethod.POST },
  );

  await server.invoker.listen("health", async () => ({ healthy: true }));
  await server.start();

  async function stop() {
    await server.stop();
    await server.client.stop();
  }

  process.once("SIGINT", () => {
    stop().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Run the service and its sidecar:

```sh
dapr run --app-id invocation-service --app-port 3000 --app-protocol http --dapr-http-port 3500 --dapr-grpc-port 50001 -- node server.mjs
```

Register handlers before `server.start()`. The `listen()` method defaults to GET; explicitly set `{ method: HttpMethod.POST }` for the `orders` handler. The caller must use the same method name and verb. The `health` route is a regular example invocation route, not a configuration of Dapr's application health checks.

Use the [client example]({{% ref js-service-invocation-howto.md %}}) to call the service, or invoke it through the CLI:

```sh
dapr invoke --app-id invocation-service --method health --verb GET
```

## Receive over gRPC

To use Dapr's gRPC application callback API, add `CommunicationProtocolEnum` to the imports and replace the server construction with:

```javascript
const server = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: "3000",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  clientOptions: {
    daprHost: "127.0.0.1",
    daprPort: "50001",
  },
});
```

Keep the same handler registrations and startup code. Restart the target using:

```sh
dapr run --app-id invocation-service --app-port 3000 --app-protocol grpc --dapr-http-port 3500 --dapr-grpc-port 50001 -- node server.mjs
```

Unless overridden in `clientOptions`, the embedded client's protocol follows the server protocol. `serverPort` is the application listener, while `clientOptions.daprPort` is the sidecar endpoint; do not interchange them. An HTTP caller can still invoke this gRPC callback service.

## Understand the callback request

TypeScript handlers receive `DaprInvokerCallbackContent`, exported from `@dapr/dapr`. The callback is asynchronous and returns a promise for the response value.

| Field | HTTP callback | gRPC callback |
| --- | --- | --- |
| `body` | Normally `JSON.stringify(req.body)` after the HTTP body parser; `undefined` when no body was parsed | UTF-8 decoding of the request data bytes; `""` when no data was sent |
| `metadata.contentType` | Incoming `content-type` header | Invocation request's content type |
| `query` | The original URL, including path and query string | The HTTP extension's query-string field |
| `headers` | Incoming HTTP headers; names are normally lowercase | Not populated |

For a JSON request, explicitly parse `request.body` as in the example. Invocation handlers do not receive an automatically deserialized domain object, even when a custom serializer is configured.

For an HTTP callback, parse query parameters as a URL, not as a query string alone:

```javascript
await server.invoker.listen("orders", async (request) => {
  const url = new URL(request.query ?? "/orders", "http://localhost");
  const status = url.searchParams.get("status");
  return { status };
}, { method: HttpMethod.GET });
```

For gRPC callbacks, `query` contains only the extension's query string and can be read with `URLSearchParams`. The JavaScript gRPC invoker does not itself populate that field.

## Return a response

Return the application response value directly:

```javascript
await server.invoker.listen("version", async () => ({ version: "1.0" }));
```

By default, the SDK JSON-encodes truthy return values. There is no special `{ status, headers, body }` response envelope: returning such an object sends those properties as application data. The callback API does not expose an HTTP response object or gRPC response metadata.

Without a custom serializer, `undefined`, `null`, `false`, `0`, and `""` do not produce their corresponding JSON values. An HTTP handler instead responds with `{"closed":true}`; a gRPC handler returns no data. A default gRPC client cannot parse that empty response. Prefer an object response such as `{ accepted: false }`.

With a custom serializer, every return value except `undefined` is serialized, including falsy values. For `undefined`, HTTP still returns the closure object and gRPC still returns no data. See [serialization guidance]({{% ref "js-service-invocation-usage.md#serialization" %}}).

Thrown handler errors propagate to the underlying HTTP error middleware or gRPC transport; they are not successful application response objects. If callers need specific HTTP status codes, headers, or streaming responses, use a regular HTTP framework route instead.

## Use an existing HTTP application

Dapr can invoke existing HTTP routes without `DaprServer`. Run that application with `--app-port` and `--app-protocol http`, and use its route path as `methodName` from a Dapr client.

To share an Express application with SDK callbacks, pass the Express instance as `serverHttp`:

```javascript
import express from "express";
import { DaprServer } from "@dapr/dapr";

const app = express();
app.get("/orders/:id", (request, response) => {
  response.status(200).json({ orderId: request.params.id });
});

const server = new DaprServer({
  serverHost: "127.0.0.1",
  serverPort: "3000",
  serverHttp: app,
  clientOptions: { daprHost: "127.0.0.1", daprPort: "3500" },
});

await server.start();
```

Install `express` as an application dependency for this alternative example. Use the HTTP startup command above. `server.start()` starts the listener, so do not also call `app.listen()`. The SDK adds middleware and routes to the supplied app; avoid conflicting route names. Use your application's shutdown handling to call `server.stop()` and then `server.client.stop()`.
