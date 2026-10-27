---
type: docs
title: "Service invocation configuration and usage"
linkTitle: "Configuration and usage"
weight: 30
description: "Configure clients, serialization, authentication, and failure handling for JavaScript service invocation"
---

This guidance applies to `@dapr/dapr` 3.19.0 or later. See [calling services]({{% ref js-service-invocation-howto.md %}}) and [receiving invocations]({{% ref js-service-invocation-server.md %}}) for complete application examples.

## Client lifetime

Reuse a long-lived `DaprClient` instead of creating one per invocation. Await outstanding work before calling `await client.stop()` during application shutdown. If using `DaprServer`, call `await server.stop()` to stop its listener, then `await server.client.stop()` to close its embedded client's resources. Stopping the server alone does not stop that client.

The client initializes its connection and waits for the sidecar when first used. You can call `await client.start()` to check readiness before accepting application traffic. This connects to an existing sidecar; it does not launch the Dapr runtime process.

## Endpoints and authentication

HTTP is the default protocol. Use the sidecar's HTTP port for HTTP clients and its gRPC port for gRPC clients. Port options are strings:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

When neither host nor port is supplied, the SDK uses `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT` for the selected protocol if set. Otherwise it uses the configured host and port, falling back to `127.0.0.1` and `DAPR_HTTP_PORT` or `DAPR_GRPC_PORT` (defaults: `3500` and `50001`). Supplying either host or port bypasses the endpoint environment variable.

`daprApiToken` defaults to `DAPR_API_TOKEN`. This authenticates the caller to its sidecar; it is not an application authorization header for the destination service. For HTTP destination authorization, supply the appropriate application header through `InvokerOptions.headers`. See [Dapr API token authentication]({{% ref api-token.md %}}) and [service invocation access control]({{% ref invoke-allowlist.md %}}).

Both transports propagate baggage from an active OpenTelemetry context to the sidecar. This built-in propagation does not mean the gRPC invoker supports arbitrary `options.headers` metadata.

## Payload limits

The gRPC client uses `maxBodySizeMb` for its transport's send and receive limits (default: 4 MiB). The HTTP client accepts the same option but does not currently enforce it; HTTP requests are limited by the sidecar and the target application. `DaprServer.maxBodySizeMb` controls the HTTP listener's body-parser limit (4 MiB by default). These are separate settings; the client's option is not an HTTP upload-size limit.

Configure the [Dapr sidecar's request body limit]({{% ref arguments-annotations-overview.md %}}) and the target application's own limits as needed. Increasing a limit does not enable streaming or remove the invoker's response buffering.

## Serialization

### Default behavior

Objects and arrays use JSON. The underlying serialization helpers also support text and binary request data, including `Buffer`, with inferred content types. The public `invoke()` TypeScript signature accepts `data?: object`, so primitive payloads are not part of that typed contract.

For HTTP, `options.headers["Content-Type"]` overrides the inferred request content type. Use that exact casing for the SDK's serializer selection. Successful HTTP responses are read completely as text and parsed as JSON when possible, regardless of response content type; otherwise the text is returned.

For gRPC, the default request serializer infers the content type and does not use the headers option. Responses are decoded as UTF-8 and must contain JSON. Sending binary data does not make this a binary response API: neither invoker exposes response bytes or a response stream.

### Configure an application serializer

Set `serializer` on `DaprClient` and `clientOptions.serializer` on `DaprServer`. `IDaprSerializer` is exported as a type from `@dapr/dapr` and defines:

```typescript
interface IDaprSerializer {
  readonly contentType?: string;
  serialize<T>(value: T): string;
  deserialize<T = unknown>(data: string): T;
}
```

The SDK also exports `JsonSerializer`. For example, this opt-in JSON configuration ensures that falsy server return values other than `undefined` are serialized:

```javascript
import { DaprClient, DaprServer, JsonSerializer } from "@dapr/dapr";

const serializer = new JsonSerializer();
const client = new DaprClient({ daprPort: "3501", serializer });
const server = new DaprServer({
  serverPort: "3000",
  clientOptions: { daprPort: "3500", serializer },
});
```

This configuration snippet does not start the server. For a custom encoding, implement `IDaprSerializer` and configure compatible serializers on both ends. Its wire representation is a string; binary formats must use a string-safe representation such as base64. Serialization errors reject the operation.

On invocation, the client serializes the request and deserializes the response. HTTP skips custom response deserialization for an empty response; gRPC passes even an empty response string to the deserializer.

Server invocation callbacks still receive a string body. Deserialize it explicitly:

```javascript
import { HttpMethod } from "@dapr/dapr";

await server.invoker.listen("echo", async (request) => {
  // HTTP passes undefined for a missing body; gRPC passes an empty string.
  if (!request.body) {
    throw new Error("An invocation body is required");
  }
  return serializer.deserialize(request.body);
}, { method: HttpMethod.POST });
```

With a custom serializer, HTTP preserves non-JSON text or buffer request bodies as strings before invoking the handler. JSON bodies still pass through the HTTP JSON parser and are re-stringified. The server serializes the callback's returned value using its configured serializer.

The serializer's `contentType` defaults to `application/json`. Both clients can override it with `headers["Content-Type"]` when using a custom serializer, but the gRPC client still does not forward other custom headers. Changing the content type does not change the serializer implementation.

## Errors and response information

Await invocations and handle failures at your application's error boundary. Do not treat a rejected promise as proof that the target did not execute the operation.

| Failure | Behavior |
| --- | --- |
| HTTP sidecar or application error response | Rejects with an `Error` whose message is a JSON string containing `status`, `error` (status text), and `error_msg` (response body). The HTTP helper accepts statuses 200 through 399; redirect handling follows its underlying HTTP client. |
| HTTP connection or serialization error | Rejects with the underlying error, which need not have a JSON message. |
| gRPC transport or runtime failure | Rejects with the transport error; ConnectRPC failures use `ConnectError` codes, not HTTP status numbers. |
| gRPC non-JSON or empty response without a custom serializer | Rejects with an `Error` whose JSON message contains `error: "COULD_NOT_PARSE_RESULT"` and `error_msg`. |
| Custom response deserialization failure | Rejects with the serializer error. |

`invoke()` returns only the decoded response body. It does not expose successful status codes, response headers, trailers, or structured per-call response metadata.

A missing gRPC callback registration currently logs a warning and returns an empty invocation response rather than a not-found application payload. The default gRPC client then fails to parse it. Check both the target's logs and the caller's error when diagnosing method or verb mismatches.

## Timeouts, cancellation, and resiliency

`InvokerOptions` only contains `headers`. `invoke()` does not expose an `AbortSignal`, timeout, deadline, retry policy, or arbitrary gRPC call options. Do not copy timeout options from other SDKs or rely on illustrative API comments that show unsupported options.

Configure runtime timeouts, retries, and circuit breakers through [Dapr resiliency policies]({{% ref resiliency-overview.md %}}). Policies apply in the runtime and do not add client-side cancellation to the JavaScript method. A local `Promise.race()` timeout only stops the caller waiting; it does not cancel the request or remote processing.

Design state-changing handlers to tolerate retries, for example by using an application request ID and deduplication. A timeout or response decoding failure can occur after the target has committed its work.

## Native gRPC services and streaming

`client.proxy.create()` is not a working alternative in this version. HTTP rejects with `HTTPNotSupportedError`, and gRPC rejects because `GRPCClientProxy` is not supported with the ConnectRPC transport.

For a native protobuf service, create a generated gRPC client connected to the caller's sidecar and attach `dapr-app-id` metadata as described in [invoking services using gRPC]({{% ref howto-invoke-services-grpc.md %}}). That is runtime gRPC proxying, separate from the SDK's unary `invoke()` and `DaprServer` callback APIs.

For large HTTP requests or responses requiring streaming, use the [runtime's HTTP streaming support]({{% ref "service-invocation-overview.md#streaming-for-http-service-invocation" %}}) with an HTTP client and server that expose streams. The JavaScript invoker buffers the complete response and has no streaming overload.
