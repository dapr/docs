---
type: docs
title: "Alpha and Beta APIs"
linkTitle: "Alpha & Beta APIs"
weight: 5000
description: "List of current alpha and beta APIs"
---

## Alpha APIs

| Building block/API | gRPC | HTTP | Description | Documentation | Version introduced | 
| ------------------ | ---- | ---- | ----------- | ------------- | ------------------ |
| Query State    | [Query State proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L44)     | `v1.0-alpha1/state/statestore/query` | The state query API enables you to retrieve, filter, and sort the key/value data stored in state store components. | [Query State API]({{< ref "howto-state-query-api.md" >}}) | v1.5 |
| Distributed Lock    | [Lock proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L112)     | `/v1.0-alpha1/lock` | The distributed lock API enables you to take a lock on a resource.	 | [Distributed Lock API]({{< ref "distributed-lock-api-overview.md" >}}) | v1.8 |
| Bulk Publish    | [Bulk publish proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L59)     | `v1.0-alpha1/publish/bulk` | The bulk publish API allows you to publish multiple messages to a topic in a single request. | [Bulk Publish and Subscribe API]({{< ref "pubsub-bulk.md" >}}) | v1.10 |
| Bulk Subscribe   | [Bulk subscribe proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/appcallback.proto#L57)     | N/A | The bulk subscribe application callback receives multiple messages from a topic in a single call. | [Bulk Publish and Subscribe API]({{< ref "pubsub-bulk.md" >}}) | v1.10 |
| Cryptography    |  [Crypto proto](https://github.com/dapr/dapr/blob/5aba3c9aa4ea9b3f388df125f9c66495b43c5c9e/dapr/proto/runtime/v1/dapr.proto#L118)    | `v1.0-alpha1/crypto` | The cryptography API enables you to perform **high level** cryptography operations for encrypting and decrypting messages. | [Cryptography API]({{< ref "cryptography-overview.md" >}}) | v1.11 |
| Jobs    |  [Jobs proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto#L212-219)    | `v1.0-alpha1/jobs` | The jobs API enables you to schedule and orchestrate jobs. | [Jobs API]({{< ref "jobs-overview.md" >}}) | v1.14 |
| Conversation    |  [Conversation proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto#L221-222)    | `v1.0-alpha1/conversation` | Converse between different large language models using the conversation API. | [Conversation API]({{< ref "conversation-overview.md" >}}) | v1.15 |


## Beta APIs

No current beta APIs.

## Related links

[Learn more about the Alpha, Beta, and Stable lifecycle stages.]({{< ref "certification-lifecycle.md#certification-levels" >}})