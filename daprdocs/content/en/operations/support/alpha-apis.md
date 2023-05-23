---
type: docs
title: "Alpha APIs"
linkTitle: "Alpha APIs"
weight: 5000
description: "List of current alpha APIs"
---

| Building block/API | gRPC | HTTP | Description | Documentation | Version introduced | 
| ------------------ | ---- | ---- | ----------- | ------------- | ------------------ |
| Query State    |      | `v1.0-alpha1/state/statestore/query` | The state query API enables you to retrieve, filter, and sort the key/value data stored in state store components. **This API will deprecated in a future release.** | [Query State API]({{< ref "howto-state-query-api.md" >}}) | v1.5 |
| Distributed Lock    |      | `/v1.0-alpha1/lock` | The distributed lock API enables you to take a lock on a resource.	 | [Distributed Lock API]({{< ref "distributed-lock-api-overview.md" >}}) | v1.8 |
| Workflow    |      | `/v1.0-alpha1/workflow` | The workflow API enables you to define long running, persistent processes or data flows.	 | [Workflow API]({{< ref "workflow-overview.md" >}}) | v1.10 |
| Bulk Pub/sub    |      | `v1.0-alpha1/publish/bulk` | The bulk publish and subscribe API allows you to publish multiple messages to a topic in a single request. | [Bulk Publish and Subscribe API]({{< ref "pubsub-bulk.md" >}}) | v1.10 |
| Cryptography    |      | `v1.0-alpha1/crypto` | The cryptography API enables you to perform operations for encrypting and decrypting messages. | [Cryptography API]({{< ref "cryptography-overview.md" >}}) | v1.11 |