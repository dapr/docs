---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---
Preview features in Dapr are considered experimental when they are first released.

Runtime preview features require explicit opt-in in order to be used. The runtime opt-in is specified in a preview setting feature in Dapr's application configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for more information.

For CLI there is no explicit opt-in, just the version that this was first made available.

## Current preview features

| Feature | Description | Setting | Documentation | Version introduced |
| --- | --- | --- | --- | --- |
| **Pluggable components** | Allows creating self-hosted gRPC-based components written in any language that supports gRPC. The following component APIs are supported: State stores, Pub/sub, Bindings | N/A | [Pluggable components concept]({{<ref "components-concept#pluggable-components" >}})| v1.9  |
| **Multi-App Run for Kubernetes** | Configure multiple Dapr applications from a single configuration file and run from a single command on Kubernetes | `dapr run -k -f` | [Multi-App Run]({{< ref multi-app-dapr-run.md >}}) | v1.12 |
| **Workflows** | Author workflows as code to automate and orchestrate tasks within your application, like messaging, state management, and failure handling | N/A | [Workflows concept]({{< ref "components-concept#workflows" >}})| v1.10  |
| **Cryptography** | Encrypt or decrypt data without having to manage secrets keys  | N/A | [Cryptography concept]({{< ref "components-concept#cryptography" >}})| v1.11  |
| **Service invocation for non-Dapr endpoints** | Allow the invocation of non-Dapr endpoints by Dapr using the [Service invocation API]({{< ref service_invocation_api.md >}}). Read ["How-To: Invoke Non-Dapr Endpoints using HTTP"]({{< ref howto-invoke-non-dapr-endpoints.md >}}) for more information. | N/A | [Service invocation API]({{< ref service_invocation_api.md >}}) | v1.11  |
| **Actor State TTL** | Allow actors to save records to state stores with Time To Live (TTL) set to automatically clean up old data. In its current implementation, actor state with TTL may not be reflected correctly by clients, read [Actor State Transactions]({{< ref actors_api.md >}}) for more information. | `ActorStateTTL` | [Actor State Transactions]({{< ref actors_api.md >}}) | v1.11  |
| **Transactional Outbox** | Allows state operations for inserts and updates to be published to a configured pub/sub topic using a single transaction across the state store and the pub/sub | N/A | [Transactional Outbox Feature]({{< ref howto-outbox.md >}}) | v1.12  |

