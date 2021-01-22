---
type: docs
title: "State management overview"
linkTitle: "Overview"
weight: 100
description: "Overview of the state management building block"
---

## Introduction

<img src="/images/state-management-overview.png" width=900>

Dapr offers key/value storage APIs for state management. If a microservice uses state management, it can use these APIs to leverage any of the [supported state stores]({{< ref supported-state-stores.md >}}), without adding or learning a third party SDK.

When using state management your application can leverage several features that would otherwise be complicated and error-prone to build yourself such as:

- Distributed concurrency and data consistency
- Retry policies
- Bulk [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations

## Features

### State management API

Developers can use the [state management API]({{< ref state_api.md >}}) to retrieve, save and delete state values by providing keys. 

### Pluggable state stores

Dapr data stores are modeled as pluggable components, which can be swapped out without any changes to your service code. Check out the [full list of state stores]({{< ref supported-state-stores >}}) to see what Dapr supports.

### Configurable state store behavior

Dapr allows developers to attach additional metadata to a state operation request that describes how the request is expected to be handled.

For example, you can attach:
- Concurrency requirements
- Consistency requirements
- Retry policies

By default, your application should assume a data store is **eventually consistent** and uses a **last-write-wins** concurrency pattern.

Not all stores are created equal. To ensure portability of your application you can query the capabilities of the store and make your code adaptive to different store capabilities.

The following table gives examples of capabilities of popular data store implementations.

| Store             | Strong consistent write | Strong consistent read | ETag |
|-------------------|-------------------------|------------------------|------|
| Cosmos DB         | Yes                     | Yes                    | Yes  |
| PostgreSQL        | Yes                     | Yes                    | Yes  |
| Redis             | Yes                     | Yes                    | Yes  |
| Redis (clustered) | Yes                     | No                     | Yes  |
| SQL Server        | Yes                     | Yes                    | Yes  |

### Concurrency

Dapr supports optimistic concurrency control (OCC) using ETags. When a state is requested, Dapr always attaches an **ETag** property to the returned state. When the user code tries to update or delete a state, it's expected to attach the ETag through the **If-Match** header. The write operation can succeed only when the provided ETag matches with the ETag in the state store.

Dapr chooses OCC because in many applications, data update conflicts are rare because clients are naturally partitioned by business contexts to operate on different data. However, if your application chooses to use ETags, a request may get rejected because of mismatched ETags. It's recommended that you use a [retry policy](#retry-policies) to compensate for such conflicts when using ETags.

If your application omits ETags in writing requests, Dapr skips ETag checks while handling the requests. This essentially enables the **last-write-wins** pattern, compared to the **first-write-wins** pattern with ETags.

{{% alert title="Note on ETags" color="primary" %}}
For stores that don't natively support ETags, it's expected that the corresponding Dapr state store implementation simulates ETags and follows the Dapr state management API specification when handling states. Because Dapr state store implementations are technically clients to the underlying data store, such simulation should be straightforward using the concurrency control mechanisms provided by the store.
{{% /alert %}}

### Consistency

Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

When strong consistency is used, Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request. When eventual consistency is used, Dapr returns as soon as the write request is accepted by the underlying data store, even if this is a single replica.

Visit the [API reference]({{< ref state_api.md >}}) to learn how to set consistency options.

### Retry policies

Dapr allows you to attach a retry policy to any write request. A policy is described by an **retryInterval**, a **retryPattern** and a **retryThreshold**. Dapr keeps retrying the request at the given interval up to the specified threshold. You can choose between a **linear** retry pattern or an **exponential** (backoff) pattern. When the **exponential** pattern is used, the retry interval is doubled after each attempt.

Visit the [API reference]({{< ref state_api.md >}}) to learn how to set retry policy options.

### Bulk operations

Dapr supports two types of bulk operations - **bulk** or **multi**. You can group several requests of the same type into a bulk (or a batch). Dapr submits requests in the bulk as individual requests to the underlying data store. In other words, bulk operations are not transactional. On the other hand, you can group requests of different types into a multi-operation, which is handled as an atomic transaction.

Visit the [API reference]({{< ref state_api.md >}}) to learn how use bulk and multi options.

### Query state store directly

Dapr saves and retrieves state values without any transformation. You can query and aggregate state directly from the [underlying state store]({{< ref query-state-store >}}).

For example, to get all state keys associated with an application ID "myApp" in Redis, use:

```bash
KEYS "myApp*"
```

#### Querying actor state

If the data store supports SQL queries, you can query an actor's state using SQL queries. For example use:

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

You can also perform aggregate queries across actor instances, avoiding the common turn-based concurrency limitations of actor frameworks. For example, to calculate the average temperature of all thermometer actors, use:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

{{% alert title="Note on direct queries" color="primary" %}}
Direct queries of the state store are not governed by Dapr concurrency control, since you are not calling through the Dapr runtime. What you see are snapshots of committed data which are acceptable for read-only queries across multiple actors, however writes should be done via the actor instances.
{{% /alert %}}

## Next steps

- Follow the [state store setup guides]({{< ref setup-state-store >}})
- Read the [state management API specification]({{< ref state_api.md >}})
- Read the [actors API specification]({{< ref actors_api.md >}})
