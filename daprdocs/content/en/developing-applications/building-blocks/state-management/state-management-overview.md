---
type: docs
title: "State management overview"
linkTitle: "Overview"
weight: 100
description: "Overview of the state management building block"
---

## Introduction

Using state management, your application can store data as key/value pairs in the [supported state stores]({{< ref supported-state-stores.md >}}).

When using state management your application can leverage features that would otherwise be complicated and error-prone to build yourself such as:

- Distributed concurrency and data consistency
- Bulk [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations

Your application can use Dapr's state management API to save and read key/value pairs using a state store component, as shown in the diagram below. For example, by using HTTP POST you can save key/value pairs and by using HTTP GET you can read a key and have its value returned.

<img src="/images/state-management-overview.png" width=900>


## Features

### Pluggable state stores

Dapr data stores are modeled as components, which can be swapped out without any changes to your service code. See [supported state stores]({{< ref supported-state-stores >}}) to see the list.

### Configurable state store behavior

Dapr allows developers to attach additional metadata to a state operation request that describes how the request is expected to be handled. You can attach:
- Concurrency requirements
- Consistency requirements

By default, your application should assume a data store is **eventually consistent** and uses a **last-write-wins** concurrency pattern.

[Not all stores are created equal]({{< ref supported-state-stores.md >}}). To ensure portability of your application you can query the capabilities of the store and make your code adaptive to different store capabilities.

### Concurrency

Dapr supports optimistic concurrency control (OCC) using ETags. When a state is requested, Dapr always attaches an ETag property to the returned state. When the user code tries to update or delete a state, it’s expected to attach the ETag either through the request body for updates or the `If-Match` header for deletes. The write operation can succeed only when the provided ETag matches with the ETag in the state store.

Dapr chooses OCC because in many applications, data update conflicts are rare because clients are naturally partitioned by business contexts to operate on different data. However, if your application chooses to use ETags, a request may get rejected because of mismatched ETags. It's recommended that you use a retry policy to compensate for such conflicts when using ETags.

If your application omits ETags in writing requests, Dapr skips ETag checks while handling the requests. This essentially enables the **last-write-wins** pattern, compared to the **first-write-wins** pattern with ETags.

{{% alert title="Note on ETags" color="primary" %}}
For stores that don't natively support ETags, it's expected that the corresponding Dapr state store implementation simulates ETags and follows the Dapr state management API specification when handling states. Because Dapr state store implementations are technically clients to the underlying data store, such simulation should be straightforward using the concurrency control mechanisms provided by the store.
{{% /alert %}}

Read the [API reference]({{< ref state_api.md >}}) to learn how to set concurrency options.

### Consistency

Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

When strong consistency is used, Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request. When eventual consistency is used, Dapr returns as soon as the write request is accepted by the underlying data store, even if this is a single replica.

Read the [API reference]({{< ref state_api.md >}}) to learn how to set consistency options.

### Bulk operations

Dapr supports two types of bulk operations - **bulk** or **multi**. You can group several requests of the same type into a bulk (or a batch). Dapr submits requests in the bulk as individual requests to the underlying data store. In other words, bulk operations are not transactional. On the other hand, you can group requests of different types into a multi-operation, which is handled as an atomic transaction.

Read the [API reference]({{< ref state_api.md >}}) to learn how use bulk and multi options.

### Actor state
Transactional state stores can be used to store actor state. To specify which state store to be used for actors, specify value of property `actorStateStore` as `true` in the metadata section of the state store component. Actors state is stored with a specific scheme in transactional state stores, which allows for consistent querying. Read the [API reference]({{< ref state_api.md >}}) to learn more about state stores for actors and the [actors API reference]({{< ref actors_api.md >}})

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
Direct queries of the state store are not governed by Dapr concurrency control, since you are not calling through the Dapr runtime. What you see are snapshots of committed data which are acceptable for read-only queries across multiple actors, however writes should be done via the Dapr state management or actors APIs.
{{% /alert %}}

### State management API

The API for state management can be found in the [state management API reference]({{< ref state_api.md >}}) which describes how to retrieve, save and delete state values by providing keys.

## Next steps
* Follow these guides on:
    * [How-To: Save and get state]({{< ref howto-get-save-state.md >}})
    * [How-To: Build a stateful service]({{< ref howto-stateful-service.md >}})
    * [How-To: Share state between applications]({{< ref howto-share-state.md >}})
* Try out the [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world) which shows how to use state management or try the samples in the [Dapr SDKs]({{< ref sdks >}})
* List of [state store components]({{< ref supported-state-stores.md >}})
* Read the [state management API reference]({{< ref state_api.md >}})
* Read the [actors API reference]({{< ref actors_api.md >}})
