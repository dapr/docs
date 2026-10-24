---
type: docs
title: "Secrets client usage"
linkTitle: "Client usage"
weight: 52900
description: Configure the JavaScript secrets client and understand metadata, response shapes, protocol differences, and errors
---

Secrets are available through `DaprClient.secret`; there is no separate secrets client package or builder. This guidance targets `@dapr/dapr` 3.19.0 or later.

## Client lifetime and configuration

Reuse a long-lived `DaprClient` across operations. Its secrets client shares the parent client's connection and authentication settings. Await outstanding operations before calling `await client.stop()` during application shutdown; do not stop a shared client after each secret lookup.

HTTP is the default protocol. To explicitly configure gRPC:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

Use `CommunicationProtocolEnum.HTTP` with the HTTP port (default `"3500"`) for HTTP. Port values are strings. Selecting the SDK protocol controls client-to-sidecar communication; it does not require an application server.

If neither `daprHost` nor `daprPort` is supplied, the SDK can use `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT` for the selected protocol. Explicit host or port options take precedence over the endpoint environment variable. Otherwise, the SDK defaults to `127.0.0.1` and `DAPR_HTTP_PORT` or `DAPR_GRPC_PORT`, falling back to `3500` or `50001`. The token defaults to `DAPR_API_TOKEN` when `daprApiToken` is omitted.

The API token authenticates to the Dapr sidecar, not directly to the secret store provider. Configure provider credentials and access in the [secret store component]({{% ref setup-secret-store.md %}}). Use [secret scopes]({{% ref secrets-scopes.md %}}) to restrict which secrets an application can retrieve, and [component scopes]({{% ref component-scopes.md %}}) to restrict which applications can use a component.

## Available operations

The public signatures are:

```typescript
get(secretStoreName: string, key: string, metadata?: string): Promise<object>;
getBulk(secretStoreName: string): Promise<object>;
```

Call these as `client.secret.get(...)` and `client.secret.getBulk(...)`.

| Capability | HTTP | gRPC in 3.19.0 |
|------------|------|--------------------|
| Retrieve a single secret | Returns the full data map | Returns only the first key-value pair, or `{}` for an empty data map |
| Per-request metadata on `get` | Query string with `metadata.`-prefixed keys | Argument is accepted but ignored |
| Bulk retrieval | Nested secret data maps | Nested secret data maps, preserving all values |
| Per-request metadata on `getBulk` | Not exposed | Not exposed |

These limitations are present in both the [3.19.0 HTTP implementation](https://github.com/dapr/js-sdk/blob/v3.19.0/src/implementation/Client/HTTPClient/secret.ts) and [gRPC implementation](https://github.com/dapr/js-sdk/blob/v3.19.0/src/implementation/Client/GRPCClient/secret.ts), and remain in the latest source reviewed for this guide. Check the implementation and release notes when upgrading.

The SDK does not expose secret writes, deletes, subscriptions, typed secret generation, or automatic secret refresh. Manage secret creation and rotation in the underlying provider. If your application caches retrieved values, it must decide when to fetch them again.

## Metadata and names

HTTP `get` appends the metadata string directly to the request URL after `?`. Do not include a leading `?`, pass an object, or omit the `metadata.` prefixes. For example:

```javascript
const metadata = new URLSearchParams({
  "metadata.namespace": "payments",
}).toString();

const secret = await client.secret.get(
  "kubernetes",
  "database-credentials",
  metadata,
);
```

This requires a Kubernetes secret store and an existing HTTP client. Metadata keys are component-specific; see the [Secrets API reference]({{% ref secrets_api.md %}}) and [component reference]({{% ref supported-secret-stores %}}).

Store names and secret names are case-sensitive. The HTTP implementation interpolates them into URL paths without encoding them. If a secret name contains URL-reserved characters, encode the secret name with `encodeURIComponent` before passing it to HTTP `get`. Do not encode gRPC secret names, which are sent as protobuf fields.

## Response shapes and TypeScript

For a successful single-secret request, the data is a map of string keys to string values. Some stores return the secret name as the only key; others, such as Kubernetes, return several fields without the secret name as a wrapper. HTTP preserves all these fields. Do not rely on gRPC's first-entry selection to choose a particular field from a multi-valued secret.

A successful bulk response is a map from secret names to their data maps. It is not a flat map, and the field names inside each secret are determined by the component. Bulk availability and the returned secrets depend on the component and access configuration.

Both methods are declared as `Promise<object>`, not as generic or strongly typed dictionaries. TypeScript callers should validate a response before indexing it, rather than assuming the declaration guarantees string-valued fields:

```typescript
function isStringMap(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

const secret = await client.secret.get("local-secret-store", "api-key");
if (!isStringMap(secret) || typeof secret["api-key"] !== "string") {
  throw new Error("The required api-key secret was not returned");
}

const apiKey = secret["api-key"];
```

This snippet assumes an existing `client` and runs inside an async function or an ES module. For bulk responses, first validate the outer object, then validate the data map for each secret your application requires. Checking only that the response is an object does not guarantee that a required secret exists.

## Errors and missing secrets

Await each operation and handle failures at your application's error boundary. Missing components, denied access, unsupported bulk retrieval, provider failures, and sidecar connection failures can reject the promise.

- **HTTP runtime errors:** Non-success responses become JavaScript `Error` instances whose `message` is a JSON string containing `status` (HTTP status), `error` (status text), and `error_msg` (runtime response body). Network and startup errors can have different shapes; do not assume every error message is JSON.
- **gRPC runtime errors:** RPC failures use `ConnectError` from `@connectrpc/connect`, with a gRPC/Connect error code rather than an HTTP status.
- **Missing or empty secrets:** Do not assume a missing secret always rejects. Behavior depends on the component and runtime response. HTTP `204 No Content` resolves to an empty string in this SDK, despite the `Promise<object>` declaration. gRPC resolves an empty data map to `{}`. Validate required fields and report their absence explicitly.

See the [Secrets API reference]({{% ref secrets_api.md %}}) for runtime status codes. Avoid logging returned secrets or raw error payloads that might contain sensitive provider information.

## Cancellation and bulk retrieval limits

Neither method exposes an `AbortSignal`, per-call timeout, or request options argument. Do not assume cancellation support from another SDK building block also applies to secrets. Racing a request against a timer only limits how long your application waits; it does not cancel the underlying request.

`getBulk` returns the entire response in memory, without pagination, streaming, or a key filter. Prefer individual requests when you need only a few secrets. Using bulk retrieval to work around the gRPC multi-value limitation may retrieve more secrets than your application needs; HTTP `get` is usually the narrower choice.

## Testing your application

Keep secret access behind an application-owned interface or inject the methods your code needs. Test single-value and multi-valued responses, nested bulk responses, missing required fields, and rejected promises. Use the actual `object` return type rather than assuming a typed secret model.

For integration tests, run a sidecar with a development secret store such as the [local file example]({{% ref js-secrets-howto.md %}}). Test HTTP and gRPC separately if your application supports both; a single-value success case does not exercise metadata or multi-valued response differences.
