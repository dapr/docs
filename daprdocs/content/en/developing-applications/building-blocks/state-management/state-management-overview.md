---
type: docs
title: "State management overview"
linkTitle: "Overview"
weight: 100
description: "Overview of the state management API building block"
---

Your application can use Dapr's state management API to save, read, and query key/value pairs in the [supported state stores]({{< ref supported-state-stores.md >}}). Using a state store component, you can build stateful, long running applications that save and retrieve their state (like a shopping cart or a game's session state). For example, in the diagram below:

- Use **HTTP POST** to save or query key/value pairs.
- Use **HTTP GET** to read a specific key and have its value returned.

<img src="/images/state-management-overview.png" width=1000 style="padding-bottom:25px;">

[The following overview video and demo](https://www.youtube.com/live/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&t=6607) demonstrates how Dapr state management works. 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=2_xX6mkU3UCy2Plr&amp;start=6607" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Features

With the state management API building block, your application can leverage features that are typically complicated and error-prone to build, including:

- Setting the choices on concurrency control and data consistency.
- Performing bulk update operations [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) including multiple transactional operations.
- Querying and filtering the key/value data.

These are the features available as part of the state management API:

### Pluggable state stores

Dapr data stores are modeled as components, which can be swapped out without any changes to your service code. See [supported state stores]({{< ref supported-state-stores >}}) to see the list.

### Configurable state store behaviors

With Dapr, you can include additional metadata in a state operation request that describes how you expect the request to be handled. You can attach:

- Concurrency requirements
- Consistency requirements

By default, your application should assume a data store is **eventually consistent** and uses a **last-write-wins concurrency pattern**.

[Not all stores are created equal]({{< ref supported-state-stores.md >}}). To ensure your application's portability, you can query the metadata capabilities of the store and make your code adaptive to different store capabilities.

#### Concurrency

Dapr supports Optimistic Concurrency Control (OCC) using ETags. When a state value is requested, Dapr always attaches an ETag property to the returned state. When the user code:

- **Updates a state**, it's expected to attach the ETag through the request body.
- **Deletes a state**, it’s expected to attach the ETag through the `If-Match` header.

The `write` operation succeeds when the provided ETag matches the ETag in the state store.

##### Why Dapr chooses optimistic concurrency control (OCC)

Data update conflicts are rare in many applications, since clients are naturally partitioned by business contexts to operate on different data. However, if your application chooses to use ETags, mismatched ETags may cause a request rejection. It's recommended you use a retry policy in your code to compensate for conflicts when using ETags.

If your application omits ETags in writing requests, Dapr skips ETag checks while handling the requests. This enables the **last-write-wins** pattern, compared to the **first-write-wins** pattern with ETags.

{{% alert title="Note on ETags" color="primary" %}}
For stores that don't natively support ETags, the corresponding Dapr state store implementation is expected to simulate ETags and follow the Dapr state management API specification when handling states. Since Dapr state store implementations are technically clients to the underlying data store, simulation should be straightforward, using the concurrency control mechanisms provided by the store.
{{% /alert %}}

Read the [API reference]({{< ref state_api.md >}}) to learn how to set concurrency options.

#### Consistency

Dapr supports both **strong consistency** and **eventual consistency**, with eventual consistency as the default behavior.

- **Strong consistency**: Dapr waits for all replicas (or designated quorums) to acknowledge before it acknowledges a write request. 
- **Eventual consistency**: Dapr returns as soon as the write request is accepted by the underlying data store, even if this is a single replica.

Read the [API reference]({{< ref state_api.md >}}) to learn how to set consistency options.

### Setting content type

State store components may maintain and manipulate data differently, depending on the content type. Dapr supports passing content type in [state management API](#state-management-api) as part of request metadata.

Setting the content type is _optional_, and the component decides whether to make use of it. Dapr only provides the means of passing this information to the component.

- **With the HTTP API**: Set content type via URL query parameter `metadata.contentType`. For example, `http://localhost:3500/v1.0/state/store?metadata.contentType=application/json`.
- **With the gRPC API**: Set content type by adding key/value pair `"contentType" : <content type>` to the request metadata.

### Multiple operations

Dapr supports two types of multi-read or multi-write operations: **bulk** or **transactional**. Read the [API reference]({{< ref state_api.md >}}) to learn how use bulk and multi options.

#### Bulk read operations

You can group multiple read requests into a bulk (or batch) operation. In the bulk operation, Dapr submits the read requests as individual requests to the underlying data store, and returns them as a single result.

#### Transactional operations

You can group write, update, and delete operations into a request, which are then handled as an atomic transaction. The request will succeed or fail as a transactional set of operations.

### Actor state

Transactional state stores can be used to store actor state. To specify which state store to use for actors, specify value of property `actorStateStore` as `true` in the state store component's metadata section. Actors state is stored with a specific scheme in transactional state stores, allowing for consistent querying. Only a single state store component can be used as the state store for all actors. Read the [state API reference]({{< ref state_api.md >}}) and the [actors API reference]({{< ref actors_api.md >}}) to learn more about state stores for actors.

#### Time to Live (TTL) on actor state
You should always set the TTL metadata field (`ttlInSeconds`), or the equivalent API call in your chosen SDK when saving actor state to ensure that state eventually removed. Read [actors overview]({{< ref actors-overview.md >}}) for more information.

### State encryption

Dapr supports automatic client encryption of application state with support for key rotations. This is supported on all Dapr state stores. For more info, read the [How-To: Encrypt application state]({{< ref howto-encrypt-state.md >}}) topic.

### Shared state between applications

Different applications' needs vary when it comes to sharing state. In one scenario, you may want to encapsulate all state within a given application and have Dapr manage the access for you. In another scenario, you may want two applications working on the same state to get and save the same keys. 

Dapr enables states to be:

- Isolated to an application.
- Shared in a state store between applications.
- Shared between multiple applications across different state stores. 

For more details read [How-To: Share state between applications]({{< ref howto-share-state.md >}}),

### Enabling the outbox pattern

Dapr enables developers to use the outbox pattern for achieving a single transaction across a transactional state store and any message broker. For more information, read [How to enable transactional outbox messaging]({{< ref howto-outbox.md >}})

### Querying state

There are two ways to query the state:

- Using the state management query API provided in Dapr runtime.
- Querying state store directly with the store's native SDK.

#### Query API

Using the _optional_ state management [query API]({{< ref "reference/api/state_api.md#query-state" >}}), you can query the key/value data saved in state stores, regardless of underlying database or storage technology. With the state management query API, you can filter, sort, and paginate the key/value data. For more details read [How-To: Query state]({{< ref howto-state-query-api.md >}}).

#### Querying state store directly

Dapr saves and retrieves state values without any transformation. You can query and aggregate state directly from the [underlying state store]({{< ref query-state-store >}}).
For example, to get all state keys associated with an application ID "myApp" in Redis, use:

```bash
KEYS "myApp*"
```

{{% alert title="Note on direct queries" color="primary" %}}
Since you aren't calling through the Dapr runtime, direct queries of the state store are not governed by Dapr concurrency control. What you see are snapshots of committed data acceptable for read-only queries across multiple actors. Writes should be done via the Dapr state management or actors APIs.
{{% /alert %}}

##### Querying actor state

If the data store supports SQL queries, you can query an actor's state using SQL queries. For example:

```sql
SELECT * FROM StateTable WHERE Id='<app-id>||<actor-type>||<actor-id>||<key>'
```

You can also avoid the common turn-based concurrency limitations of actor frameworks by performing aggregate queries across actor instances. For example, to calculate the average temperature of all thermometer actors, use:

```sql
SELECT AVG(value) FROM StateTable WHERE Id LIKE '<app-id>||<thermometer>||*||temperature'
```

### State Time-to-Live (TTL)

Dapr enables [per state set request time-to-live (TTL)]({{< ref state-store-ttl.md >}}). This means that applications can set time-to-live per state stored, and these states cannot be retrieved after expiration.

### State management API

The state management API can be found in the [state management API reference]({{< ref state_api.md >}}), which describes how to retrieve, save, delete, and query state values by providing keys.

## Try out state management

### Quickstarts and tutorials

Want to put the Dapr state management API to the test? Walk through the following quickstart and tutorials to see state management in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [State management quickstart]({{< ref statemanagement-quickstart.md >}}) | Create stateful applications using the state management API. |
| [Hello World](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)            | _Recommended_ <br> Demonstrates how to run Dapr locally. Highlights service invocation and state management.  |
| [Hello World Kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)       | _Recommended_ <br> Demonstrates how to run Dapr in Kubernetes. Highlights service invocation and _state management_.  |

### Start using state management directly in your app

Want to skip the quickstarts? Not a problem. You can try out the state management building block directly in your application. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the state management API starting with [the state management how-to guide]({{< ref howto-get-save-state.md >}}).

## Next steps

- Start working through the state management how-to guides, starting with:
  - [How-To: Save and get state]({{< ref howto-get-save-state.md >}})
  - [How-To: Build a stateful service]({{< ref howto-stateful-service.md >}})
- Review the list of [state store components]({{< ref supported-state-stores.md >}})
- Read the [state management API reference]({{< ref state_api.md >}})
- Read the [actors API reference]({{< ref actors_api.md >}})
