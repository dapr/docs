---
type: docs
title: "Service invocation with the JavaScript SDK"
linkTitle: "Service invocation"
weight: 2500
description: "Call services and receive invocations over HTTP or gRPC with the JavaScript SDK"
no_list: true
---

Use `DaprClient.invoker.invoke()` to call another application through your local Dapr sidecar, and `DaprServer.invoker.listen()` to receive invocations. The target can also be an existing HTTP application without the JavaScript SDK.

These guides describe **`@dapr/dapr` 3.19.0-rc.4 or later**. The API and transport limitations below were checked against the published release candidate and the current upstream implementation.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) and an [initialized Dapr environment]({{% ref install-dapr-selfhost.md %}}).
- A supported Node.js LTS release. The package requires Node.js 18 or later.
- A target application running with a Dapr app ID and application port. No state store or pub/sub component is required.

Install the release candidate explicitly:

```sh
npm install @dapr/dapr@3.19.0-rc.4
```

For a later release, substitute its version. An unversioned installation does not necessarily select a prerelease. Examples use ES module imports; run snippets containing `await` inside an async function or an ES module.

## Choose the protocol

The client's `communicationProtocol` selects **application-to-sidecar** communication. The receiving application's `--app-protocol` selects **sidecar-to-application** communication. These are independent: a gRPC client can invoke an HTTP application and an HTTP client can invoke a `DaprServer` configured for gRPC.

| Capability | HTTP client or server | gRPC client or server |
| --- | --- | --- |
| `client.invoker.invoke()` | Calls the HTTP invocation API | Calls Dapr's unary `InvokeService` API |
| `server.invoker.listen()` | Registers an HTTP route | Registers an `AppCallback.OnInvoke` handler |
| Request verbs | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Same verbs, carried in the HTTP extension |
| Custom request headers | `options.headers` is forwarded | Not forwarded as invocation metadata |
| Query parameters from the SDK client | Append an encoded query string to `methodName` | No separate query-string option |
| Default response decoding | JSON when parseable; otherwise text | JSON required; text or empty responses cause a parse error |
| Custom application serializer | Supported | Supported |
| Response status and headers through `invoke()` | Not exposed | Not exposed |
| Streaming through `invoke()` | Not supported; responses are buffered | Not supported; unary request/response |
| `client.proxy.create()` | Not supported | Not supported with the SDK's ConnectRPC transport |

Selecting gRPC does not turn `invoke()` into a client for arbitrary protobuf services. For native gRPC services, use your generated client with Dapr's [gRPC proxying protocol]({{% ref howto-invoke-services-grpc.md %}}).

## Guides

| Guide | Contents |
| --- | --- |
| [Calling services]({{% ref js-service-invocation-howto.md %}}) | HTTP and gRPC clients, verbs, headers, paths, query strings, namespaces, and non-Dapr endpoints. |
| [Receiving invocations]({{% ref js-service-invocation-server.md %}}) | A complete server, HTTP and gRPC startup commands, callback data, return values, and existing Express applications. |
| [Configuration and usage]({{% ref js-service-invocation-usage.md %}}) | Client lifetime, endpoints, authentication, serialization, errors, resiliency, and API limitations. |

## Implementation references

- [Published 3.19.0-rc.4 package](https://www.npmjs.com/package/@dapr/dapr/v/3.19.0-rc.4)
- [Client invocation implementation: HTTP](https://github.com/dapr/js-sdk/blob/main/src/implementation/Client/HTTPClient/invoker.ts) and [gRPC](https://github.com/dapr/js-sdk/blob/main/src/implementation/Client/GRPCClient/invoker.ts)
- [Server invocation implementation: HTTP](https://github.com/dapr/js-sdk/blob/main/src/implementation/Server/HTTPServer/invoker.ts) and [gRPC callbacks](https://github.com/dapr/js-sdk/blob/main/src/implementation/Server/GRPCServer/GRPCServerImpl.ts)
- [Invocation serialization integration tests](https://github.com/dapr/js-sdk/blob/main/test/e2e/common/server.test.ts)
- [Service invocation API reference]({{% ref service_invocation_api.md %}})
