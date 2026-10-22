---
type: docs
title: ".NET building block support"
linkTitle: "Building block support"
weight: 1500
description: Choose .NET SDK packages and APIs for Dapr building blocks in SDK 1.19
---

This guide describes the .NET SDK surface in
[`v1.19.0`](https://github.com/dapr/dotnet-sdk/tree/v1.19.0).
Use that release or a later compatible release when following these guides. Runtime and component support are
separate from SDK support: installing a package does not enable a runtime API or add capabilities to a component.
Use a Dapr 1.19 runtime for the complete 1.19 API surface, including binary store and newer management operations.

Install the package for the building block you need, for example:

```sh
dotnet add package Dapr.Client
```

Keep Dapr package versions aligned. Experimental APIs can produce compiler diagnostics such as
`DAPR_CONVERSATION`, `DAPR_CRYPTOGRAPHY`, and `DAPR_DISTRIBUTEDLOCK`; see
[experimental attributes]({{< ref dotnet-guidance-experimental-attributes.md >}}) before opting in.

## Choose an API

| Building block | Package and entry point | Implemented functionality |
| --- | --- | --- |
| [Service invocation]({{< ref "dotnet-client/_index.md#invoke-a-service" >}}) | `Dapr.Client`: `CreateInvokeHttpClient`, `InvocationHandler`, `CreateInvocationInvoker`, `DaprClient` | HTTP verbs, JSON or arbitrary content, headers and query parameters, response/status inspection, generated gRPC clients through the Dapr proxy, and legacy `InvokeMethodGrpcAsync` protobuf calls. Prefer native HTTP/gRPC clients for new applications. |
| [Publish and subscribe]({{< ref dotnet-messaging >}}) | `Dapr.Messaging`: `IDaprPublishSubscribeClient`, `DaprPublishSubscribeClient`, `[DaprTopic]` | Typed JSON, CloudEvents, raw bytes, empty events, bulk publishing with per-entry failures; generated streaming, gRPC push, and HTTP subscriptions; dynamic streaming, routing, metadata, dead-letter configuration, and explicit acknowledgments. `Dapr.Client` publishing and `Dapr.AspNetCore` topic endpoints remain available. |
| [State management]({{< ref dotnet-state-management >}}) | `Dapr.StateManagement`: `DaprStateManagementClient`, generated `IDaprStateStoreClient` interfaces | Single and bulk reads/writes/deletes, ETags, consistency/concurrency options, transactions, metadata/TTL, and component-dependent queries. `Dapr.Client` additionally exposes byte-state methods and `StateEntry<T>`. |
| [Binary store]({{< ref dotnet-binarystore >}}) | `Dapr.BinaryStore`: `DaprBinaryStoreClient`, generated `IDaprBinaryStoreClient` interfaces | Stream or memory uploads, overwrite control, chunked or stream downloads, buffered byte downloads, and deletion. No public list, range-read, or file-metadata API is exposed by this SDK release. |
| [Bindings]({{< ref "dotnet-client/_index.md#interact-with-output-bindings" >}}) | `Dapr.Client`: `InvokeBindingAsync`; ASP.NET Core or gRPC callbacks for input | Output operations with typed JSON requests/responses or raw bytes and metadata; input events through app callbacks. Operations and payload formats are component-specific. |
| [Actors]({{< ref dotnet-actors-next >}}) | `Dapr.Actors.Next` and the original `Dapr.Actors` package family | Generated proxies/dispatch, dynamic invocation, state/cache management, lifecycle and turn hooks, reentrancy, timers/reminders and their management APIs, pub/sub streams, state migration, state machines, and in-memory testing. The original SDK retains its distinct remoting/JSON proxy and HTTP hosting APIs; it is not API-compatible with Actors Next. |
| [Secrets]({{< ref dotnet-secrets >}}) | `Dapr.SecretsManagement`: `DaprSecretsManagementClient`, `[SecretStore]`; `Dapr.Extensions.Configuration` | Single and bulk reads with metadata, generated startup-loaded secret properties, and secret-backed `IConfiguration`. There are no create, update, delete, or secret-watch methods. |
| [Configuration]({{< ref "dotnet-client/_index.md#get-configuration-keys" >}}) | `Dapr.Client` and `Dapr.Extensions.Configuration` | Fetch selected/all keys, subscribe to updates, unsubscribe by ID, and snapshot or streaming `IConfiguration` providers with optional non-blocking startup. These APIs read/watch configuration; they do not write it. |
| [Distributed lock]({{< ref dotnet-distributedlock-howto.md >}}) | `Dapr.DistributedLock`: `DaprDistributedLockClient` | Attempt acquisition with an owner and expiry, automatic unlock through `IAsyncDisposable`, and explicit unlock with status reporting. No wait-until-acquired or lease-renewal API. Legacy `DaprClient.Lock`/`Unlock` have different response shapes. |
| [Cryptography]({{< ref dotnet-cryptography-howto.md >}}) | `Dapr.Cryptography`: `DaprEncryptionClient` | Buffered and streaming encryption/decryption, key-wrap and data-cipher selection, decryption-key override, and configurable streaming block size. The SDK does not expose the runtime's subtle key/sign/verify APIs. |
| [Jobs]({{< ref dotnet-jobs >}}) | `Dapr.Jobs`: `DaprJobsClient`, `MapDaprScheduledJobHandler` | One-time, interval, Cron/time-zone and predefined schedules; raw/JSON/string payloads; start time, repeat limit, expiry, overwrite and failure policies; get/list/delete/prefix-delete/purge; HTTP and gRPC trigger callbacks. |
| [Conversation]({{< ref dotnet-ai >}}) | `Dapr.AI`: `DaprConversationClient`; `Dapr.AI.Microsoft.Extensions`: `DaprChatClient` | Role-based text messages, tools/tool choices and returned tool calls, context IDs, metadata/parameters, PII scrubbing, temperature, response schema, prompt cache retention, and model/token usage results. `IChatClient` maps a subset of these features. Neither client provides token streaming in this release. |
| [Workflow]({{< ref dotnet-workflow >}}) | `Dapr.Workflow`: `Workflow<TInput, TOutput>`, `WorkflowActivity<TInput, TOutput>`, `DaprWorkflowClient` | Durable orchestration, activities/children/detached workflows, timers/events, retries, bounded parallelism, continuation, custom status, multi-app routing, patch/name versioning, custom serialization, history propagation/caching, alpha binary payload references, and instance management including waits, listing, history, and rerun. |

Vector and search have separate documentation and are outside this guide.

## Shared client behavior

Reuse long-lived clients, preferably through their dependency injection registration extensions. Most dedicated
clients default to singleton registration and inherit common endpoint, API token, JSON and gRPC channel settings.
Pass cancellation tokens to network operations and asynchronous stream enumeration; an HTTP timeout setting is
not a deadline for every gRPC operation.

Do not assume all clients have identical failure behavior. In particular, see the
[state client's release-specific cancellation behavior]({{< ref "dotnet-statemanagementclient-usage.md#cancellation-tokens" >}}),
inspect bulk publishing failures, observe dynamic subscription completion, and check explicit unlock status.

The SDK source at the version linked above is the reference for public signatures. The task-focused guides linked
in the table distinguish SDK functionality from runtime/component requirements and identify APIs that remain
available only on the older `DaprClient` surface.
