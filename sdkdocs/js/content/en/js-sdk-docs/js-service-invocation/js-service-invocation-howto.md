---
type: docs
title: "How to: Call services with the JavaScript SDK"
linkTitle: "Calling services"
weight: 10
description: "Invoke application methods with HTTP or gRPC clients, headers, and query parameters"
---

`DaprClient.invoker.invoke()` sends a request through the caller's sidecar to a target application. These examples use **`@dapr/dapr` 3.19.0-rc.4 or later**. Follow the [receiving invocations guide]({{% ref js-service-invocation-server.md %}}) to start the `invocation-service` target used below.

## Invoke an application over HTTP

Save this complete example as `client.mjs`:

```javascript
import { DaprClient, HttpMethod } from "@dapr/dapr";

async function main() {
  const client = new DaprClient({
    daprHost: "127.0.0.1",
    daprPort: "3501",
  });

  try {
    const response = await client.invoker.invoke(
      "invocation-service",
      "orders",
      HttpMethod.POST,
      { orderId: "101", quantity: 2 },
      { headers: { "X-Correlation-ID": "order-101" } },
    );
    console.log(response);
  } finally {
    await client.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

In another terminal, run the caller with its own sidecar:

```sh
dapr run --app-id invocation-caller --dapr-http-port 3501 --dapr-grpc-port 50002 -- node client.mjs
```

The caller does not need `--app-port` because it does not receive callbacks. Its sidecar ports differ from those of the target service.

## Invocation arguments

The public signature is:

```typescript
invoke(
  appId: string,
  methodName: string,
  method: HttpMethod,
  data?: object,
  options?: InvokerOptions,
): Promise<object>;
```

| Argument | Meaning |
| --- | --- |
| `appId` | Target Dapr app ID, not the caller's app ID or host address. |
| `methodName` | Target method or relative HTTP path, for example `orders` or `orders/101`. Use no leading slash. |
| `method` | `HttpMethod.GET`, `POST`, `PUT`, `PATCH`, or `DELETE`. Supply it explicitly; the implementations default to GET, but the public TypeScript interface requires it. |
| `data` | Optional payload. Objects and arrays use JSON by default. |
| `options` | An `InvokerOptions` object containing optional `headers`. It has no per-call timeout, cancellation, or retry fields. |

The result is the decoded response body, not a response envelope. Although the public return type is `object`, HTTP may return text and a serializer may return other JavaScript values. There is no `invoke<T>()` overload and TypeScript types do not validate the response at runtime.

## Select a verb

These snippets assume an existing `client` and matching routes on the target:

```javascript
const order = await client.invoker.invoke("invocation-service", "orders/101", HttpMethod.GET);

const replaced = await client.invoker.invoke(
  "invocation-service", "orders/101", HttpMethod.PUT, { quantity: 4 },
);

const updated = await client.invoker.invoke(
  "invocation-service", "orders/101", HttpMethod.PATCH, { quantity: 3 },
);

await client.invoker.invoke("invocation-service", "orders/101", HttpMethod.DELETE);
```

Do not provide a body with an HTTP GET request. A gRPC invocation with omitted `data` sends the default payload `{}`, rather than an absent body.

## Pass headers and query parameters over HTTP

Use the fifth argument for headers. To omit the body, pass `undefined` as the fourth argument:

```javascript
const query = new URLSearchParams({ status: "pending", customer: "Ada Lovelace" });
const response = await client.invoker.invoke(
  "invocation-service",
  `orders?${query.toString()}`,
  HttpMethod.GET,
  undefined,
  { headers: { "X-Correlation-ID": "query-101" } },
);
```

Encode individual dynamic path segments with `encodeURIComponent()` and query values with `URLSearchParams`. The SDK interpolates `methodName` into the HTTP invocation URL; it does not encode it for you.

Custom headers are supported by the HTTP implementation. The gRPC implementation does not forward `options.headers` as request metadata. With a configured serializer, it only uses `headers["Content-Type"]` to override the payload content type. It also does not populate the request's separate gRPC HTTP-extension query-string field, so do not use the HTTP query-string example with a gRPC client.

## Invoke through a gRPC sidecar endpoint

Replace the client construction in `client.mjs` with:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50002",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});
```

Keep the `HttpMethod` import and `invoke()` call from the original example, but omit the HTTP headers option. Use the same caller startup command: it exposes both sidecar endpoints. The receiving application can remain HTTP.

By default, the gRPC client decodes the response bytes as UTF-8 and parses them as JSON. An empty body or plain-text response rejects with `COULD_NOT_PARSE_RESULT`, even if the remote operation succeeded. Return a JSON value from the target, or configure a compatible [serializer]({{% ref "js-service-invocation-usage.md#serialization" %}}).

## Call across namespaces

Where supported by Dapr's name-resolution configuration, qualify the target app ID with its namespace:

```javascript
const response = await client.invoker.invoke(
  "invocation-service.production", "orders", HttpMethod.POST, { orderId: "101" },
);
```

Namespace routing is a runtime capability, not a separate SDK option. See [service invocation across namespaces]({{% ref service-invocation-namespaces.md %}}).

## Call a non-Dapr HTTP endpoint

With an HTTP client, the same API can target an `HTTPEndpoint` resource by name or a fully qualified URL, when supported by the runtime:

```javascript
const configuredEndpoint = await client.invoker.invoke(
  "external-orders", "orders/101", HttpMethod.GET,
);

const urlEndpoint = await client.invoker.invoke(
  "https://api.example.com", "orders/101", HttpMethod.GET,
);
```

These are alternative examples: configure `external-orders` or replace the illustrative URL before running them. The target does not need a Dapr sidecar. See [invoking non-Dapr endpoints]({{% ref howto-invoke-non-dapr-endpoints.md %}}) for resource configuration, authentication, and runtime requirements.
